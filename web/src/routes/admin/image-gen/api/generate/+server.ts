import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { env } from '$env/dynamic/private';
import { uploadBytesToC3, uploadToC3 } from '$lib/server/image-gen/c3';
import { generateImagesWithOpenAi } from '$lib/server/image-gen/openai';
import {
	IMAGE_GEN_MAX_COUNT,
	IMAGE_GEN_MIN_COUNT,
	STAGE_SIZE_MAP,
	type GenerateRequest,
	type ImageGenStage
} from '$lib/server/image-gen/types';
import {
	resolveImageDestinationPathOrThrow,
	validateSlugOrThrow
} from '$lib/server/image-gen/files';
import { getC3ApiBase, getMinioBrowserUrl } from '$lib/utils/storage-urls';

export const prerender = false;

const getErrorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : 'Unknown error';

export const POST = async ({ request }) => {
	if (!import.meta.env.DEV) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const openaiKey = env.OPENAI_API_KEY?.trim();
	const c3Key = env.C3_API_KEY?.trim();
	const c3Base = getC3ApiBase(env.C3_API_BASE?.trim());
	const minioBrowserBase = env.MINIO_BROWSER_BASE?.trim();

	if (!openaiKey) {
		return json({ error: 'OPENAI_API_KEY is missing' }, { status: 500 });
	}
	if (!c3Key) {
		return json({ error: 'C3_API_KEY is missing' }, { status: 500 });
	}

	const body = (await request.json().catch(() => null)) as GenerateRequest | null;
	if (!body) return json({ error: 'Invalid JSON body' }, { status: 400 });

	const stage = body.stage as ImageGenStage;
	if (!['square', 'landscape', 'portrait'].includes(stage)) {
		return json({ error: 'Invalid stage' }, { status: 400 });
	}

	if (body.size !== STAGE_SIZE_MAP[stage]) {
		return json({ error: `Size must be ${STAGE_SIZE_MAP[stage]} for ${stage}` }, { status: 400 });
	}

	const n = Number(body.n);
	if (!Number.isInteger(n) || n < IMAGE_GEN_MIN_COUNT || n > IMAGE_GEN_MAX_COUNT) {
		return json({ error: `n must be an integer between ${IMAGE_GEN_MIN_COUNT} and ${IMAGE_GEN_MAX_COUNT}` }, { status: 400 });
	}

	if (typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
		return json({ error: 'Prompt is required' }, { status: 400 });
	}
	const templateImageDataUrl =
		typeof body.templateImageDataUrl === 'string' ? body.templateImageDataUrl.trim() : '';
	if (stage === 'square') {
		if (templateImageDataUrl.length > 0 && !templateImageDataUrl.startsWith('data:image/')) {
			return json({ error: 'templateImageDataUrl must be an image data URL when provided' }, { status: 400 });
		}
	} else if (!templateImageDataUrl.startsWith('data:image/')) {
		return json({ error: 'templateImageDataUrl must be an image data URL' }, { status: 400 });
	}

	let destinationPath = 'unspecified';
	try {
		destinationPath =
			typeof body.destinationSlug === 'string' && body.destinationSlug.trim().length > 0
				? resolveImageDestinationPathOrThrow({
						destinationType: body.destinationType,
						destinationSlug: body.destinationSlug,
						customBasePath: body.customBasePath
					}).relativeDir
				: 'unspecified';
	} catch (error) {
		return json({ error: getErrorMessage(error) }, { status: 400 });
	}

	const runId = randomUUID();
	const createdAt = new Date().toISOString();
	console.info('[image-gen] generate start', { runId, stage, n, destinationPath });

	try {
		const generated = await generateImagesWithOpenAi({
			apiKey: openaiKey,
			prompt: body.prompt,
			size: body.size,
			n,
			templateImageDataUrl: templateImageDataUrl || undefined
		});
		const promptBackupKey = `cambermastweb/generated/${destinationPath}/${stage}/${runId}/prompt.json`;
		let promptBackupUrl: string | undefined;
		let promptBackupBrowserUrl: string | undefined;
		let promptBackupError: string | undefined;
		try {
			const promptBackupPayload = JSON.stringify(
				{
					runId,
					stage,
					destinationType: body.destinationType ?? 'custom',
					destinationSlug:
						typeof body.destinationSlug === 'string' && body.destinationSlug.trim().length > 0
							? validateSlugOrThrow(body.destinationSlug)
							: undefined,
					customBasePath:
						typeof body.customBasePath === 'string' && body.customBasePath.trim().length > 0
							? validateSlugOrThrow(body.customBasePath)
							: undefined,
					destinationPath,
					size: body.size,
					n,
					prompt: body.prompt,
					createdAt
				},
				null,
				2
			);
			const uploadedPrompt = await uploadBytesToC3({
				apiBase: c3Base,
				apiKey: c3Key,
				key: promptBackupKey,
				bytes: Buffer.from(promptBackupPayload, 'utf8'),
				contentType: 'application/json',
				fileName: 'prompt.json'
			});
			promptBackupUrl = uploadedPrompt.url;
			promptBackupBrowserUrl = getMinioBrowserUrl(uploadedPrompt.key, minioBrowserBase);
		} catch (error) {
			promptBackupError = getErrorMessage(error);
			console.error('[image-gen] prompt backup failed', {
				runId,
				stage,
				error: promptBackupError
			});
		}

		const candidates = await Promise.all(
			generated.dataUrls.map(async (dataUrl, index) => {
				const id = `${stage}-${runId}-${(index + 1).toString()}`;
				const minioKey = `cambermastweb/generated/${destinationPath}/${stage}/${runId}/candidate-${(index + 1).toString()}.png`;

				try {
					const uploaded = await uploadToC3({
						apiBase: c3Base,
						apiKey: c3Key,
						key: minioKey,
						dataUrl
					});
					return {
						id,
						dataUrl,
						width: body.size.split('x')[0],
						height: body.size.split('x')[1],
						minioKey: uploaded.key,
						minioUrl: uploaded.url,
						minioBrowserUrl: getMinioBrowserUrl(uploaded.key, minioBrowserBase)
					};
				} catch (error) {
					console.error('[image-gen] c3 upload failed', {
						runId,
						stage,
						candidate: index + 1,
						error: getErrorMessage(error)
					});
					return {
						id,
						dataUrl,
						width: body.size.split('x')[0],
						height: body.size.split('x')[1],
						minioKey,
						minioBrowserUrl: getMinioBrowserUrl(minioKey, minioBrowserBase),
						minioBackupError: getErrorMessage(error)
					};
				}
			})
		);

		console.info('[image-gen] generate complete', { runId, stage, candidateCount: candidates.length });
		return json({
			runId,
			stage,
			payloadPreview: generated.payloadPreview,
			candidates,
			promptBackupKey,
			promptBackupUrl,
			promptBackupBrowserUrl,
			promptBackupError
		});
	} catch (error) {
		const message = getErrorMessage(error);
		console.error('[image-gen] generate failed', { runId, stage, error: message });
		return json({ error: message }, { status: 502 });
	}
};
