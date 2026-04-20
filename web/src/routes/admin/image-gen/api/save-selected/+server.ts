import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	saveSelectedImagesToWebsite,
	syncGeneratedImageToDestinationRecord
} from '$lib/server/image-gen/files';
import { appendImageGenPromptStandard } from '$lib/server/image-gen/prompt-standards';
import type { SaveSelectedRequest } from '$lib/server/image-gen/types';

export const prerender = false;

const getErrorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : 'Unknown error';

export const POST = async ({ request }) => {
	if (!import.meta.env.DEV) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const body = (await request.json().catch(() => null)) as SaveSelectedRequest | null;
	if (!body) return json({ error: 'Invalid JSON body' }, { status: 400 });

	if (
		(typeof body.destinationSlug !== 'string' || body.destinationSlug.trim().length === 0) &&
		body.destinationType !== 'static-templates'
	) {
		return json({ error: 'Destination slug is required' }, { status: 400 });
	}

	const square = body.candidateMap?.[body.selected?.squareCandidateId];
	const requiresFullSet = true;
	const landscape = requiresFullSet
		? body.candidateMap?.[body.selected?.landscapeCandidateId]
		: undefined;
	const portrait = requiresFullSet
		? body.candidateMap?.[body.selected?.portraitCandidateId]
		: undefined;
	if (!square?.dataUrl || (requiresFullSet && (!landscape?.dataUrl || !portrait?.dataUrl))) {
		return json(
			{ error: 'All selected candidates must be present in candidateMap' },
			{ status: 400 }
		);
	}
	const requiredLandscape = landscape;
	const requiredPortrait = portrait;
	if (!requiredLandscape?.dataUrl || !requiredPortrait?.dataUrl) {
		return json(
			{ error: 'All selected candidates must be present in candidateMap' },
			{ status: 400 }
		);
	}
	if (
		typeof body.prompts?.square !== 'string' ||
		typeof body.prompts?.landscape !== 'string' ||
		typeof body.prompts?.portrait !== 'string'
	) {
		return json(
			{ error: 'Prompts are required for square, landscape, and portrait.' },
			{ status: 400 }
		);
	}

	try {
		const result = await saveSelectedImagesToWebsite({
			destinationType: body.destinationType ?? 'custom',
			destinationSlug:
				body.destinationType === 'static-templates' ? 'templates' : body.destinationSlug,
			customBasePath: body.customBasePath,
			squareDataUrl: square.dataUrl,
			landscapeDataUrl: requiredLandscape.dataUrl,
			portraitDataUrl: requiredPortrait.dataUrl,
			selectedSources: {
				square: { minioKey: square.minioKey, minioUrl: square.minioUrl },
				landscape: { minioKey: requiredLandscape.minioKey, minioUrl: requiredLandscape.minioUrl },
				portrait: { minioKey: requiredPortrait.minioKey, minioUrl: requiredPortrait.minioUrl }
			},
			prompts: body.prompts,
			minioBrowserBase: env.MINIO_BROWSER_BASE?.trim()
		});
		const promptStandard =
			result.destination.destinationType === 'static-templates'
				? null
				: await appendImageGenPromptStandard({
						destinationType: result.destination.destinationType,
						destinationSlug: result.destination.destinationSlug,
						customBasePath: result.destination.customBasePath,
						prompts: body.prompts,
						writes: result.files,
						reference: body.reference
					});
		const destinationUpdateWrites =
			body.autoUpdateDestinationRecord && promptStandard
				? await syncGeneratedImageToDestinationRecord({
						destinationType: result.destination.destinationType,
						destinationSlug: result.destination.destinationSlug,
						squarePublicUrl:
							result.files.find((write) => write.variant === 'square')?.publicUrl ??
							result.destination.publicBaseUrl,
						landscapePublicUrl:
							result.files.find((write) => write.variant === 'landscape')?.publicUrl ??
							result.destination.publicBaseUrl,
						portraitPublicUrl:
							result.files.find((write) => write.variant === 'portrait')?.publicUrl ??
							result.destination.publicBaseUrl,
						prompts: body.prompts,
						reference: {
							url: promptStandard.reference.url ?? null,
							sourceType: promptStandard.reference.sourceType,
							label: promptStandard.reference.label
						},
						historyId: promptStandard.id
					})
				: [];

		return json({
			destination: result.destination,
			writes: result.files,
			referenceWrites: result.referenceFiles,
			metadataWrites: result.metadataFiles,
			destinationUpdateWrites,
			promptStandard
		});
	} catch (error) {
		return json({ error: getErrorMessage(error) }, { status: 500 });
	}
};
