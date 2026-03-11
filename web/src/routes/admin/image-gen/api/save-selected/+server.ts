import { json } from '@sveltejs/kit';
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

	if (typeof body.destinationSlug !== 'string' || body.destinationSlug.trim().length === 0) {
		return json({ error: 'Destination slug is required' }, { status: 400 });
	}

	const square = body.candidateMap?.[body.selected?.squareCandidateId];
	const landscape = body.candidateMap?.[body.selected?.landscapeCandidateId];
	const portrait = body.candidateMap?.[body.selected?.portraitCandidateId];
	if (!square?.dataUrl || !landscape?.dataUrl || !portrait?.dataUrl) {
		return json({ error: 'All selected candidates must be present in candidateMap' }, { status: 400 });
	}
	if (
		typeof body.prompts?.square !== 'string' ||
		typeof body.prompts?.landscape !== 'string' ||
		typeof body.prompts?.portrait !== 'string'
	) {
		return json({ error: 'Prompts are required for square, landscape, and portrait.' }, { status: 400 });
	}

	try {
		const result = await saveSelectedImagesToWebsite({
			destinationType: body.destinationType ?? 'custom',
			destinationSlug: body.destinationSlug,
			customBasePath: body.customBasePath,
			squareDataUrl: square.dataUrl,
			landscapeDataUrl: landscape.dataUrl,
			portraitDataUrl: portrait.dataUrl,
			selectedSources: {
				square: { minioKey: square.minioKey, minioUrl: square.minioUrl },
				landscape: { minioKey: landscape.minioKey, minioUrl: landscape.minioUrl },
				portrait: { minioKey: portrait.minioKey, minioUrl: portrait.minioUrl }
			},
			prompts: body.prompts
		});
		const promptStandard = await appendImageGenPromptStandard({
			destinationType: result.destination.destinationType,
			destinationSlug: result.destination.destinationSlug,
			customBasePath: result.destination.customBasePath,
			prompts: body.prompts,
			writes: result.files
		});
		const destinationUpdateWrites = body.autoUpdateDestinationRecord
			? await syncGeneratedImageToDestinationRecord({
					destinationType: result.destination.destinationType,
					destinationSlug: result.destination.destinationSlug,
					landscapePublicUrl:
						result.files.find((write) => write.variant === 'landscape')?.publicUrl ??
						result.destination.publicBaseUrl
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
