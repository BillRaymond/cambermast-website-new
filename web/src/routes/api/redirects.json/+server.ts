import { SITE_ORIGIN } from '$lib/config/site';
import { buildRedirectsApiPayload } from '$lib/data/api/redirects';

export const prerender = true;

export const GET = ({ url }: { url: URL }) => {
	const origin = ((import.meta.env?.DEV ? url.origin : SITE_ORIGIN) as string).replace(/\/$/, '');
	const payload = buildRedirectsApiPayload({ origin });

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
