import { listCampaigns } from '$lib/data/campaigns';

export const prerender = true;

export const entries = () => {
	const partners = new Set<string>();
	for (const campaign of listCampaigns()) {
		if (campaign.partner) partners.add(campaign.partner);
	}

	return Array.from(partners)
		.sort()
		.map((partner) => ({ partner }));
};

