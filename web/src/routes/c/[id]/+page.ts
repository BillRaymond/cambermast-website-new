import { error } from '@sveltejs/kit';
import { SITE_ORIGIN } from '$lib/config/site';
import { getCampaignUi, listCampaignUi } from '$lib/view-models/campaigns';

export const prerender = true;
const origin = SITE_ORIGIN.replace(/\/$/, '');

export const entries = () => {
	return listCampaignUi(origin).map((campaign) => ({
		id: campaign.id
	}));
};

export const load = ({ params }) => {
	const campaign = getCampaignUi(params.id, origin);

	if (!campaign) {
		throw error(404, 'Campaign not found');
	}

	return {
		id: campaign.id,
		redirectPath: campaign.trackingPath
	};
};
