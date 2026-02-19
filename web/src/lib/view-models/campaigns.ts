import type { Campaign } from '$lib/data/campaigns';
import { getCampaignShortPath, getCampaignTrackingPath, listCampaigns } from '$lib/data/campaigns';

export type CampaignUiModel = Campaign & {
	shortPath: string;
	shortUrl: string;
	trackingPath: string;
	trackingUrl: string;
};

export const toCampaignUiModel = (campaign: Campaign, origin: string): CampaignUiModel => {
	const shortPath = getCampaignShortPath(campaign.id);
	const trackingPath = getCampaignTrackingPath(campaign);

	return {
		...campaign,
		partner: campaign.partner || 'cambermast',
		partnerLabel: campaign.partnerLabel?.trim() || undefined,
		description: campaign.description?.trim() || '',
		shortPath,
		shortUrl: `${origin}${shortPath}`,
		trackingPath,
		trackingUrl: `${origin}${trackingPath}`
	};
};

export const toCampaignUiList = (campaigns: Campaign[], origin: string): CampaignUiModel[] =>
	campaigns.map((campaign) => toCampaignUiModel(campaign, origin));

export const listCampaignUi = (origin: string): CampaignUiModel[] =>
	toCampaignUiList(listCampaigns(), origin);

export const getCampaignUi = (campaignId: string, origin: string): CampaignUiModel | undefined =>
	listCampaignUi(origin).find((campaign) => campaign.id === campaignId);
