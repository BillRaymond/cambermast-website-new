import { listEvents } from '$lib/data/events';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const events = listEvents();
	return { events };
};
