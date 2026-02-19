import { SITE_ORIGIN } from '$lib/config/site';
import { buildEventsApiPayload } from '$lib/data/api/events';

export const prerender = true;

export const GET = ({ url }: { url: URL }) => {
	const origin = (import.meta.env.DEV ? url.origin : SITE_ORIGIN).replace(/\/$/, '');
	const payload = buildEventsApiPayload({ origin });

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
