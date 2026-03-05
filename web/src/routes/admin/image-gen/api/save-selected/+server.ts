import { json } from '@sveltejs/kit';
import { saveSelectedImagesToWebsite } from '$lib/server/image-gen/files';
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

	if (typeof body.slug !== 'string' || body.slug.trim().length === 0) {
		return json({ error: 'Slug is required' }, { status: 400 });
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
			slug: body.slug,
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
			slug: result.slug,
			blobScope: body.blobScope === 'training' ? 'training' : 'events',
			prompts: body.prompts,
			writes: result.files
		});

		return json({
			slug: result.slug,
			writes: result.files,
			promptStandard
		});
	} catch (error) {
		return json({ error: getErrorMessage(error) }, { status: 500 });
	}
};
