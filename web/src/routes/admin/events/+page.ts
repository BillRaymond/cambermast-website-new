import { listEvents } from '$lib/data/events';
import { listCampaigns } from '$lib/data/campaigns';
import { getPartnerByCode, listPartners } from '$lib/data/partners';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const events = listEvents({ includeDrafts: true, includeUnlisted: true }).sort((a, b) => {
		const aTs = new Date(a.startAtUtc).valueOf();
		const bTs = new Date(b.startAtUtc).valueOf();
		return aTs - bTs;
	});

	const campaignIds = new Set(
		listCampaigns().map((campaign) => campaign.id)
	);

	const eventsWithPartner = events.map((event) => ({
		...event,
		partner:
			event.partnerCode && event.partnerCode !== 'NONE'
				? getPartnerByCode(event.partnerCode)
				: undefined
	}));

	const partners = listPartners().filter((partner) => partner.code !== 'NONE');

	return { events: eventsWithPartner, campaignIds: [...campaignIds], partners };
};
