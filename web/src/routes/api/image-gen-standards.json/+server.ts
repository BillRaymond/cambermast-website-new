import { SITE_ORIGIN } from '$lib/config/site';
import { buildImageGenStandardsApiPayload } from '$lib/data/api/image-gen-standards';

export const prerender = false;

export const GET = ({ url }: { url: URL }) => {
	const origin = ((import.meta.env?.DEV ? url.origin : SITE_ORIGIN) as string).replace(/\/$/, '');
	const payload = buildImageGenStandardsApiPayload({ origin });

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
