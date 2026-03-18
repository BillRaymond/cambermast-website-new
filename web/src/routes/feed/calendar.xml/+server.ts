import { getRedirectBySourcePath } from '$lib/data/redirects';
import { buildEventsFeedResponse } from '$lib/server/feeds/events';

export const prerender = true;

export const GET = () => {
	const redirect = getRedirectBySourcePath('/feed/calendar.xml');
	if (!redirect?.enabled || redirect.targetPath !== '/feed/events.xml') {
		return new Response('Not found', { status: 404 });
	}

	return buildEventsFeedResponse('/feed/calendar.xml');
};
