import campaignsData from './campaigns.json';

export type Campaign = {
	id: string;
	partner: string;
	partnerLabel?: string;
	landingPath: string;
	description: string;
	createdAt: string;
	archived?: boolean;
	params: Record<string, string | undefined>;
};

export const CAMPAIGN_PARAM_KEY_ORDER = [
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_content',
	'src',
	'ad'
] as const;

export const toCampaignQueryString = (
	params: Record<string, string | undefined> | undefined
): string => {
	if (!params) return '';
	const search = new URLSearchParams();

	for (const key of CAMPAIGN_PARAM_KEY_ORDER) {
		const value = params[key];
		if (typeof value === 'string' && value.length > 0) {
			search.set(key, value);
		}
	}

	for (const [key, value] of Object.entries(params)) {
		if ((CAMPAIGN_PARAM_KEY_ORDER as readonly string[]).includes(key)) continue;
		if (typeof value === 'string' && value.length > 0) {
			search.set(key, value);
		}
	}

	return search.toString();
};

export const getCampaignShortPath = (campaignId: string): string => `/c/${campaignId}`;

export const getCampaignTrackingPath = (campaign: Pick<Campaign, 'landingPath' | 'params'>): string => {
	const query = toCampaignQueryString(campaign.params);
	return query ? `${campaign.landingPath}?${query}` : campaign.landingPath;
};

export const listCampaigns = (): Campaign[] => (campaignsData.campaigns ?? []) as Campaign[];

export const getCampaignRegistryVersion = (): number =>
	typeof (campaignsData as any).version === 'number' ? (campaignsData as any).version : 1;
