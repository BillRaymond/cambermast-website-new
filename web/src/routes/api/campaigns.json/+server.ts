import { SITE_ORIGIN } from '$lib/config/site';
import {
	getCampaignRegistryVersion,
	getCampaignShortPath,
	getCampaignTrackingPath,
	listCampaigns
} from '$lib/data/campaigns';

export const prerender = true;

export const GET = ({ url }: { url: URL }) => {
	const origin = (import.meta.env.DEV ? url.origin : SITE_ORIGIN).replace(/\/$/, '');

	const payload = {
		version: getCampaignRegistryVersion(),
		generatedAt: new Date().toISOString(),
		campaigns: listCampaigns().map((campaign) => {
			const trackingPath = getCampaignTrackingPath(campaign);
			const trackingUrl = `${origin}${trackingPath}`;
			const shortPath = getCampaignShortPath(campaign.id);
			const shortUrl = `${origin}${shortPath}`;

			return { ...campaign, trackingPath, trackingUrl, shortPath, shortUrl };
		})
	};

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
