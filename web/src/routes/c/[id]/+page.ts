import { error } from '@sveltejs/kit';
import { getCampaignTrackingPath, listCampaigns } from '$lib/data/campaigns';

export const prerender = true;

export const entries = () => {
	return listCampaigns().map((campaign) => ({
		id: campaign.id
	}));
};

export const load = ({ params }) => {
	const campaign = listCampaigns().find((item) => item.id === params.id);

	if (!campaign) {
		throw error(404, 'Campaign not found');
	}

	const redirectPath = getCampaignTrackingPath(campaign);

	return {
		id: campaign.id,
		redirectPath
	};
};
