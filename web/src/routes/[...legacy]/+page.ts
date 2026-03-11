import { error } from '@sveltejs/kit';
import { getRedirectBySourcePath, listRedirects } from '$lib/data/redirects';

export const prerender = true;

export const entries = () =>
	listRedirects()
		.filter(
			(entry) =>
				!entry.sourcePath.startsWith('/feed/') &&
				!entry.sourcePath.startsWith('/api/') &&
				entry.sourcePath !== '/training/calendar'
		)
		.map((entry) => ({
			legacy: entry.sourcePath.slice(1)
		}));

export const load = ({ params }) => {
	const sourcePath = `/${params.legacy}`;
	const redirectEntry = getRedirectBySourcePath(sourcePath);

	if (!redirectEntry?.enabled) {
		throw error(404, 'Redirect not found');
	}

	return {
		sourcePath: redirectEntry.sourcePath,
		targetPath: redirectEntry.targetPath,
		statusCode: redirectEntry.statusCode,
		notes: redirectEntry.notes,
		category: redirectEntry.category
	};
};
