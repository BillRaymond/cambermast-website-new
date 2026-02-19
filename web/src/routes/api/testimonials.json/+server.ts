import { SITE_ORIGIN } from '$lib/config/site';
import { buildTestimonialsApiPayload } from '$lib/data/api/testimonials';

export const prerender = true;

export const GET = ({ url }: { url: URL }) => {
	const origin = (import.meta.env.DEV ? url.origin : SITE_ORIGIN).replace(/\/$/, '');
	const payload = buildTestimonialsApiPayload({ origin });

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
