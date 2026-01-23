import { error } from '@sveltejs/kit';
import campaignsData from '$lib/data/qr-campaigns.json';

type Campaign = {
	id: string;
	landingPath: string;
	params?: Record<string, string | undefined>;
};

const keyOrder = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'src', 'ad'];

const toQueryString = (params: Record<string, string | undefined> | undefined): string => {
	if (!params) return '';
	const search = new URLSearchParams();

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

export const prerender = true;

export const entries = () => {
	return (campaignsData.campaigns as Campaign[]).map((campaign) => ({
		id: campaign.id
	}));
};

export const load = ({ params }) => {
	const campaigns = campaignsData.campaigns as Campaign[];
	const campaign = campaigns.find((item) => item.id === params.id);

	if (!campaign) {
		throw error(404, 'Campaign not found');
	}

	const query = toQueryString(campaign.params);
	const redirectPath = query ? `${campaign.landingPath}?${query}` : campaign.landingPath;

	return {
		id: campaign.id,
		redirectPath
	};
};
