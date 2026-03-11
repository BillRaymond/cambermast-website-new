import { error } from '@sveltejs/kit';
import { getRedirectBySourcePath } from '$lib/data/redirects';

export const prerender = true;

export const load = () => {
	const redirectEntry = getRedirectBySourcePath('/training/calendar');

	if (!redirectEntry?.enabled) {
		throw error(404, 'Redirect not found');
	}

	return {
		sourcePath: redirectEntry.sourcePath,
		targetPath: redirectEntry.targetPath,
		notes: redirectEntry.notes
	};
};
