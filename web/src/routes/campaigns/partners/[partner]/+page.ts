import { redirect } from '@sveltejs/kit';
import { SITE_ORIGIN } from '$lib/config/site';
import { listCampaignUi } from '$lib/view-models/campaigns';
import type { PageLoad } from './$types';

export const prerender = true;
const origin = SITE_ORIGIN.replace(/\/$/, '');

export const entries = () => {
	const partners = new Set<string>();
	for (const campaign of listCampaignUi(origin)) {
		if (campaign.partner) partners.add(campaign.partner);
	}
	return Array.from(partners)
		.sort()
		.map((partner) => ({ partner }));
};

export const load: PageLoad = ({ params }) => {
	throw redirect(308, `/admin/campaigns/partners/${params.partner}`);
};
