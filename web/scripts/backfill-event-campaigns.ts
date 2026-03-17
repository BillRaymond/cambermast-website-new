import fs from 'node:fs/promises';
import { eventsPath, campaignsPath } from '../src/lib/server/data-paths';
import {
	buildDefaultEventCampaign,
	getEventCampaignIntegrityIssues,
	resolveCampaignPartnerFromEvent
} from '../src/lib/server/event-campaign-integrity';
import type { Campaign } from '../src/lib/data/campaigns';
import type { EventSource } from '../src/lib/data/events/types';

const shouldWrite = process.argv.includes('--write');

type EventRegistry = { events: EventSource[] };
type CampaignRegistry = { version: number; campaigns: Campaign[] };

const toJsonString = (value: unknown): string => `${JSON.stringify(value, null, '\t')}\n`;

const [eventsRaw, campaignsRaw] = await Promise.all([
	fs.readFile(eventsPath, 'utf-8'),
	fs.readFile(campaignsPath, 'utf-8')
]);

const eventRegistry = JSON.parse(eventsRaw) as EventRegistry;
const campaignRegistry = JSON.parse(campaignsRaw) as CampaignRegistry;

const campaignIds = new Set(campaignRegistry.campaigns.map((campaign) => campaign.id));
const createdCampaigns: Campaign[] = [];
const updatedEvents: string[] = [];
const repairedCampaigns: string[] = [];

const nextEvents = eventRegistry.events.map((event) => {
	const campaignId = event.campaignId?.trim() || event.cta?.campaignId?.trim() || '';
	if (campaignId && campaignIds.has(campaignId) && event.cta?.campaignId === campaignId) {
		return event;
	}

	const resolvedCampaignId = campaignId || event.id;
	const nextEvent: EventSource = {
		...event,
		campaignId: resolvedCampaignId,
		cta: {
			...event.cta,
			campaignId: resolvedCampaignId
		}
	};

	if (!campaignIds.has(resolvedCampaignId)) {
		const createdAt = event.sessions[0]?.startAtUtc ?? new Date().toISOString();
		const campaign = buildDefaultEventCampaign({
			id: event.id,
			slug: event.slug,
			title: event.title,
			campaignId: resolvedCampaignId,
			createdAt
		});
		createdCampaigns.push(campaign);
		campaignIds.add(campaign.id);
	}

	updatedEvents.push(event.id);
	return nextEvent;
});

const nextCampaigns = campaignRegistry.campaigns.map((campaign) => {
	const linkedEvent = nextEvents.find((event) => event.campaignId === campaign.id);
	if (!linkedEvent) return campaign;

	const derivedPartner = resolveCampaignPartnerFromEvent(linkedEvent);
	const currentPartner = campaign.partner?.trim() || 'cambermast';
	const currentPartnerLabel = campaign.partnerLabel?.trim() || 'Cambermast';
	const currentAd = campaign.params?.ad?.trim() || currentPartner;
	const shouldRepairPartner =
		derivedPartner.partner !== 'cambermast' &&
		currentPartner === 'cambermast' &&
		currentPartnerLabel === 'Cambermast' &&
		currentAd === 'cambermast';

	if (!shouldRepairPartner) return campaign;

	repairedCampaigns.push(campaign.id);
	return {
		...campaign,
		partner: derivedPartner.partner,
		partnerLabel: derivedPartner.partnerLabel,
		params: {
			...campaign.params,
			ad: derivedPartner.partner
		}
	};
});

const nextCampaignRegistry: CampaignRegistry = {
	...campaignRegistry,
	campaigns: [...nextCampaigns, ...createdCampaigns].sort((a, b) => a.id.localeCompare(b.id))
};

const integrityIssues = getEventCampaignIntegrityIssues(nextEvents, nextCampaignRegistry.campaigns);
if (integrityIssues.length > 0) {
	console.error('Unable to backfill event campaigns.');
	console.error(integrityIssues.join('\n'));
	process.exit(1);
}

console.log(
	JSON.stringify(
		{
			updatedEvents,
			createdCampaignIds: createdCampaigns.map((campaign) => campaign.id),
			repairedCampaignIds: repairedCampaigns,
			writeMode: shouldWrite
		},
		null,
		2
	)
);

if (shouldWrite) {
	await Promise.all([
		fs.writeFile(eventsPath, toJsonString({ events: nextEvents }), 'utf-8'),
		fs.writeFile(campaignsPath, toJsonString(nextCampaignRegistry), 'utf-8')
	]);
	console.log('Backfill written to events.json and campaigns.json.');
}
