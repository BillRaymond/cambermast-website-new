import { SITE_ORIGIN } from '$lib/config/site';
import { buildDefaultImagesApiPayload } from '$lib/data/api/default-images';

export const prerender = false;

export const GET = ({ url }: { url: URL } = { url: new URL(SITE_ORIGIN) }) => {
	const origin = ((import.meta.env?.DEV ? url.origin : SITE_ORIGIN) as string).replace(/\/$/, '');
	const payload = buildDefaultImagesApiPayload({ origin });

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
