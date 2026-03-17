import fs from 'node:fs/promises';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { Campaign } from '$lib/data/campaigns';
import type { EventSource } from '$lib/data/events/types';
import { campaignsPath, campaignsSchemaPath } from '$lib/server/data-paths';
import {
	assertEventCampaignIntegrity,
	type CampaignRegistry
} from '$lib/server/event-campaign-integrity';

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

let cachedValidateCampaigns: ReturnType<typeof ajv.compile> | null = null;

const toJsonString = (value: CampaignRegistry): string => `${JSON.stringify(value, null, '\t')}\n`;

const ensureCampaignValidator = async () => {
	if (cachedValidateCampaigns) return cachedValidateCampaigns;
	const schemaRaw = await fs.readFile(campaignsSchemaPath, 'utf-8');
	cachedValidateCampaigns = ajv.compile(JSON.parse(schemaRaw));
	return cachedValidateCampaigns;
};

export const readCampaignRegistryFromDisk = async (): Promise<CampaignRegistry> => {
	const raw = await fs.readFile(campaignsPath, 'utf-8');
	return JSON.parse(raw) as CampaignRegistry;
};

export const validateCampaignRegistry = async (
	registry: CampaignRegistry,
	events: EventSource[] = []
): Promise<void> => {
	const validate = await ensureCampaignValidator();
	const valid = validate(registry);
	if (!valid) {
		throw new Error(`Campaigns schema validation failed: ${ajv.errorsText(validate.errors)}`);
	}

	if (events.length > 0) {
		assertEventCampaignIntegrity(events, registry.campaigns);
	}
};

export const writeCampaignRegistryToDisk = async (
	registry: CampaignRegistry,
	events: EventSource[] = []
): Promise<void> => {
	const nextRegistry: CampaignRegistry = {
		...registry,
		campaigns: [...registry.campaigns].sort((a, b) => a.id.localeCompare(b.id))
	};

	await validateCampaignRegistry(nextRegistry, events);
	await fs.writeFile(campaignsPath, toJsonString(nextRegistry), 'utf-8');
};

export const upsertCampaignInRegistry = (
	registry: CampaignRegistry,
	campaign: Campaign,
	previousId?: string
): CampaignRegistry => {
	const campaigns = registry.campaigns.filter((entry) => entry.id !== previousId);
	const existingIndex = campaigns.findIndex((entry) => entry.id === campaign.id);
	if (existingIndex >= 0) {
		campaigns.splice(existingIndex, 1, campaign);
	} else {
		campaigns.push(campaign);
	}
	return { ...registry, campaigns };
};

export const deleteCampaignFromRegistry = (
	registry: CampaignRegistry,
	campaignId: string
): CampaignRegistry => ({
	...registry,
	campaigns: registry.campaigns.filter((campaign) => campaign.id !== campaignId)
});

export const assertCampaignCanBeDeleted = (
	campaignId: string,
	events: EventSource[]
): void => {
	const linkedEvent = events.find((event) => event.campaignId === campaignId);
	if (linkedEvent) {
		throw new Error(
			`Campaign ${campaignId} is linked to event ${linkedEvent.id} (${linkedEvent.slug}). Archive it instead of deleting it.`
		);
	}
};
