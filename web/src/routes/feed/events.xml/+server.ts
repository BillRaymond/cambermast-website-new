import { buildEventsFeedResponse } from '$lib/server/feeds/events';

export const prerender = true;

export const GET = () => buildEventsFeedResponse('/feed/events.xml');
