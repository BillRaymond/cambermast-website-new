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

	const eventsWithPartners = events.map((event) => ({
		...event,
		partners: (event.partners ?? [])
			.map((partnerRef) => {
				const partner = getPartnerByCode(partnerRef.code);
				return {
					code: partnerRef.code,
					name: partner?.name ?? partnerRef.code,
					slug: partner?.slug ?? partnerRef.code.toLowerCase(),
					logo: partner?.logo,
					homepageUrl: partner?.homepageUrl,
					role: partnerRef.role
				};
			})
			.filter((partner) => partner.code !== 'NONE')
	}));

	const partners = listPartners().filter((partner) => partner.code !== 'NONE');

	return { events: eventsWithPartners, campaignIds: [...campaignIds], partners };
};
