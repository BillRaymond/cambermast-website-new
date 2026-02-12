import { SITE_ORIGIN } from '$lib/config/site';
import { getCampaignRegistryVersion } from '$lib/data/campaigns';
import { listCampaignUi } from '$lib/view-models/campaigns';

export const prerender = true;

export const GET = ({ url }: { url: URL }) => {
	const origin = (import.meta.env.DEV ? url.origin : SITE_ORIGIN).replace(/\/$/, '');

	const payload = {
		version: getCampaignRegistryVersion(),
		generatedAt: new Date().toISOString(),
		campaigns: listCampaignUi(origin).map((campaign) => {
			return {
				...campaign,
				qrPath: campaign.trackingPath,
				qrUrl: campaign.trackingUrl,
				shortUrl: campaign.shortUrl
			};
		})
	};

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
