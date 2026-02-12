import { SITE_ORIGIN } from '$lib/config/site';
import { buildCampaignsApiPayload } from '$lib/data/api/campaigns';

export const prerender = true;

export const GET = ({ url }: { url: URL }) => {
	const origin = (import.meta.env.DEV ? url.origin : SITE_ORIGIN).replace(/\/$/, '');
	const payload = buildCampaignsApiPayload({ origin });

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
