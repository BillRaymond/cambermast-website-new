import { getRedirectBySourcePath } from '$lib/data/redirects';
import { buildTrainingProgramsFeedResponse } from '$lib/server/feeds/training-programs';

export const prerender = true;

export const GET = () => {
	const redirect = getRedirectBySourcePath('/feed/programs.xml');
	if (!redirect?.enabled || redirect.targetPath !== '/feed/training-programs.xml') {
		return new Response('Not found', { status: 404 });
	}

	return buildTrainingProgramsFeedResponse('/feed/programs.xml');
};
