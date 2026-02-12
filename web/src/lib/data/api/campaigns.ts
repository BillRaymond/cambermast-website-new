import {
	getCampaignRegistryVersion,
	getCampaignShortPath,
	getCampaignTrackingPath,
	listCampaigns
} from '$lib/data/campaigns';

type BuildCampaignsApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

const toApiCampaign = (campaign: ReturnType<typeof listCampaigns>[number], origin: string) => {
	const trackingPath = getCampaignTrackingPath(campaign);
	const trackingUrl = `${origin}${trackingPath}`;
	const shortPath = getCampaignShortPath(campaign.id);
	const shortUrl = `${origin}${shortPath}`;

	return {
		id: campaign.id,
		partner: campaign.partner,
		partnerLabel: campaign.partnerLabel,
		landingPath: campaign.landingPath,
		description: campaign.description,
		createdAt: campaign.createdAt,
		archived: campaign.archived,
		params: campaign.params,
		trackingPath,
		trackingUrl,
		shortPath,
		shortUrl
	};
};

export const buildCampaignsApiPayload = ({
	origin,
	generatedAt
}: BuildCampaignsApiPayloadInput) => ({
	version: getCampaignRegistryVersion(),
	generatedAt: generatedAt ?? new Date().toISOString(),
	campaigns: listCampaigns().map((campaign) => toApiCampaign(campaign, origin))
});

export const buildCampaignsApiExamples = (origin: string) => {
	const payload = buildCampaignsApiPayload({ origin, generatedAt: '2026-02-12T18:15:00.000Z' });
	const first = payload.campaigns.at(0) ?? null;
	const partner = payload.campaigns.find((campaign) => campaign.partner !== 'cambermast') ?? null;
	return {
		response: payload,
		example: first
			? { version: payload.version, generatedAt: payload.generatedAt, campaigns: [first] }
			: payload,
		partnerExample: partner
			? { version: payload.version, generatedAt: payload.generatedAt, campaigns: [partner] }
			: null
	};
};
