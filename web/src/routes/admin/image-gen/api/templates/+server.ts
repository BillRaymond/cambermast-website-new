import { json } from '@sveltejs/kit';
import { listTemplateEntries } from '$lib/server/image-gen/files';

export const prerender = false;

export const GET = async () => {
	if (!import.meta.env.DEV) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const templates = await listTemplateEntries();
	return json({ templates });
};
