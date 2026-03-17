import type { Campaign } from '$lib/data/campaigns';
import type { EventSource } from '$lib/data/events/types';

export type CampaignRegistry = {
	version: number;
	campaigns: Campaign[];
};

export type EventRegistry = {
	events: EventSource[];
};

type EventCampaignDraftInput = Pick<EventSource, 'id' | 'slug' | 'title'> & {
	campaignId?: string;
	createdAt?: string;
	partner?: string;
	partnerLabel?: string;
	description?: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	src?: string;
	ad?: string;
	archived?: boolean;
};

export const buildDefaultEventCampaign = ({
	id,
	slug,
	title,
	campaignId,
	createdAt,
	partner,
	partnerLabel,
	description,
	utmSource,
	utmMedium,
	utmCampaign,
	src,
	ad,
	archived
}: EventCampaignDraftInput): Campaign => {
	const resolvedCampaignId = (campaignId ?? id).trim();
	const resolvedPartner = (partner ?? 'cambermast').trim() || 'cambermast';
	const resolvedTitle = title.trim() || 'event';

	return {
		id: resolvedCampaignId,
		partner: resolvedPartner,
		partnerLabel: (partnerLabel ?? 'Cambermast').trim() || 'Cambermast',
		landingPath: `/events/${slug}`,
		description:
			description?.trim() || `Campaign short link for the ${resolvedTitle} event page.`,
		createdAt: createdAt ?? new Date().toISOString(),
		archived,
		params: {
			utm_source: (utmSource ?? 'qr').trim() || 'qr',
			utm_medium: (utmMedium ?? 'offline').trim() || 'offline',
			utm_campaign: (utmCampaign ?? 'events').trim() || 'events',
			utm_content: resolvedCampaignId,
			src: (src ?? 'qr').trim() || 'qr',
			ad: (ad ?? resolvedPartner).trim() || resolvedPartner
		}
	};
};

export const getEventCampaignIntegrityIssues = (
	events: EventSource[],
	campaigns: Campaign[]
): string[] => {
	const issues: string[] = [];
	const campaignsById = new Map<string, Campaign>();
	const eventIdsByCampaignId = new Map<string, string[]>();

	for (const campaign of campaigns) {
		if (campaignsById.has(campaign.id)) {
			issues.push(`Campaign ${campaign.id} is duplicated in campaigns.json.`);
			continue;
		}
		campaignsById.set(campaign.id, campaign);

		if ((campaign.params?.utm_content ?? '').trim() !== campaign.id) {
			issues.push(
				`Campaign ${campaign.id} must keep params.utm_content aligned with id (${campaign.id}).`
			);
		}
	}

	for (const event of events) {
		const campaignId = event.campaignId?.trim() ?? '';
		const ctaCampaignId = event.cta?.campaignId?.trim() ?? '';
		const label = `${event.id} (${event.slug})`;

		if (!campaignId) {
			issues.push(`Event ${label} is missing campaignId.`);
			continue;
		}

		if (!ctaCampaignId) {
			issues.push(`Event ${label} is missing cta.campaignId.`);
		} else if (ctaCampaignId !== campaignId) {
			issues.push(`Event ${label} must keep cta.campaignId aligned with campaignId.`);
		}

		const campaign = campaignsById.get(campaignId);
		if (!campaign) {
			issues.push(`Event ${label} references missing campaign ${campaignId}.`);
			continue;
		}

		const expectedLandingPath = `/events/${event.slug}`;
		if (campaign.landingPath !== expectedLandingPath) {
			issues.push(
				`Event ${label} expects campaign ${campaignId} landingPath ${expectedLandingPath}, found ${campaign.landingPath}.`
			);
		}

		const linkedEventIds = eventIdsByCampaignId.get(campaignId) ?? [];
		linkedEventIds.push(event.id);
		eventIdsByCampaignId.set(campaignId, linkedEventIds);
	}

	for (const [campaignId, linkedEventIds] of eventIdsByCampaignId.entries()) {
		if (linkedEventIds.length > 1) {
			issues.push(
				`Campaign ${campaignId} is linked to multiple events (${linkedEventIds.join(', ')}).`
			);
		}
	}

	return issues;
};

export const assertEventCampaignIntegrity = (
	events: EventSource[],
	campaigns: Campaign[]
): void => {
	const issues = getEventCampaignIntegrityIssues(events, campaigns);
	if (issues.length > 0) {
		throw new Error(issues.join('\n'));
	}
};
