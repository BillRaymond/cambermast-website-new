import { json } from '@sveltejs/kit';
import { buildDrafts, type DraftRequestPayload } from '$lib/server/admin-event-drafts';

export const prerender = false;

const getErrorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : 'Unknown error';

export const POST = async ({ request }) => {
	if (!import.meta.env.DEV) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const body = (await request.json().catch(() => null)) as DraftRequestPayload | null;
	if (!body) return json({ error: 'Invalid JSON body' }, { status: 400 });

	try {
		const result = await buildDrafts(body);
		return json(result);
	} catch (error) {
		return json({ error: getErrorMessage(error) }, { status: 400 });
	}
};
