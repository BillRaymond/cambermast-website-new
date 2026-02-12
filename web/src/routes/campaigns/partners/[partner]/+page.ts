import { redirect } from '@sveltejs/kit';
import { listCampaigns } from '$lib/data/campaigns';
import type { PageLoad } from './$types';

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

export const load: PageLoad = ({ params }) => {
	throw redirect(308, `/admin/campaigns/partners/${params.partner}`);
};
