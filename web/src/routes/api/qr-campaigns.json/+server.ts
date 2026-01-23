import { SITE_ORIGIN } from '$lib/config/site';
import campaigns from '$lib/data/qr-campaigns.json';

export const prerender = true;

type Campaign = {
	id: string;
	partner: string;
	landingPath: string;
	createdAt: string;
	params?: Record<string, string | undefined>;
};

const toQueryString = (params: Record<string, string | undefined> | undefined): string => {
	if (!params) return '';
	const search = new URLSearchParams();
	const keyOrder = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'src', 'ad'];

	for (const key of keyOrder) {
		const value = params[key];
		if (typeof value === 'string' && value.length > 0) {
			search.set(key, value);
		}
	}

	for (const [key, value] of Object.entries(params)) {
		if (keyOrder.includes(key)) continue;
		if (typeof value === 'string' && value.length > 0) {
			search.set(key, value);
		}
	}

	return search.toString();
};

export const GET = ({ url }: { url: URL }) => {
	const origin = (import.meta.env.DEV ? url.origin : SITE_ORIGIN).replace(/\/$/, '');

	const payload = {
		version: campaigns.version ?? 1,
		generatedAt: new Date().toISOString(),
		campaigns: (campaigns.campaigns as Campaign[]).map((campaign) => {
			const query = toQueryString(campaign.params);
			const qrPath = query ? `${campaign.landingPath}?${query}` : campaign.landingPath;
			const qrUrl = `${origin}${qrPath}`;

			return { ...campaign, qrPath, qrUrl };
		})
	};

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
