import { SITE_ORIGIN } from '$lib/config/site';
import { listEvents } from '$lib/data/events';

export const prerender = true;

export const GET = ({ url }: { url: URL }) => {
	const origin = (import.meta.env.DEV ? url.origin : SITE_ORIGIN).replace(/\/$/, '');
	const events = listEvents({ includeDrafts: false, includeUnlisted: false }).map((event) => ({
		...event,
		url: `${origin}/events/${event.slug}`
	}));

	const payload = {
		generatedAt: new Date().toISOString(),
		events
	};

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
