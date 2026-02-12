import { SITE_ORIGIN } from '$lib/config/site';
import { getPartnerByCode, listPartners } from '$lib/data/partners';
import { listEventUi } from '$lib/view-models/events';
import { listCampaignUi } from '$lib/view-models/campaigns';
import type { PageLoad } from './$types';

export const prerender = true;
const origin = SITE_ORIGIN.replace(/\/$/, '');

export const load: PageLoad = () => {
	const events = listEventUi({ includeDrafts: true, includeUnlisted: true }).sort((a, b) => {
		const aTs = new Date(a.startAtUtc).valueOf();
		const bTs = new Date(b.startAtUtc).valueOf();
		return aTs - bTs;
	});

	const campaignIds = new Set(listCampaignUi(origin).map((campaign) => campaign.id));

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
