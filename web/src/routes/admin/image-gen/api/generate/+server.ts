import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { getC3ApiBase, uploadToC3 } from '$lib/server/image-gen/c3';
import { generateImagesWithOpenAi } from '$lib/server/image-gen/openai';
import {
	IMAGE_GEN_MAX_COUNT,
	IMAGE_GEN_MIN_COUNT,
	STAGE_SIZE_MAP,
	type GenerateRequest,
	type ImageGenStage
} from '$lib/server/image-gen/types';
import { validateSlugOrThrow } from '$lib/server/image-gen/files';

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
	if (typeof body.templateImageDataUrl !== 'string' || !body.templateImageDataUrl.startsWith('data:image/')) {
		return json({ error: 'templateImageDataUrl must be an image data URL' }, { status: 400 });
	}

	let slugSegment = 'unspecified';
	try {
		slugSegment =
			typeof body.slug === 'string' && body.slug.trim().length > 0
				? validateSlugOrThrow(body.slug)
				: 'unspecified';
	} catch (error) {
		return json({ error: getErrorMessage(error) }, { status: 400 });
	}

	const runId = randomUUID();
	console.info('[image-gen] generate start', { runId, stage, n, slug: slugSegment });

	try {
		const generated = await generateImagesWithOpenAi({
			apiKey: openaiKey,
			prompt: body.prompt,
			size: body.size,
			n,
			templateImageDataUrl: body.templateImageDataUrl
		});

		const candidates = await Promise.all(
			generated.dataUrls.map(async (dataUrl, index) => {
				const id = `${stage}-${runId}-${(index + 1).toString()}`;
				const minioKey = `c3/cambermast/image-gen/${slugSegment}/${stage}/${runId}/candidate-${(index + 1).toString()}.png`;

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
						minioUrl: uploaded.url
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
			candidates
		});
	} catch (error) {
		const message = getErrorMessage(error);
		console.error('[image-gen] generate failed', { runId, stage, error: message });
		return json({ error: message }, { status: 502 });
	}
};
