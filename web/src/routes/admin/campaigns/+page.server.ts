import { access, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import { SITE_ORIGIN } from '$lib/config/site';
import { getLandscapeImageUrl } from '$lib/data/image-contract';
import type { Campaign } from '$lib/data/campaigns';
import { listCampaignUi } from '$lib/view-models/campaigns';
import { listEventUi } from '$lib/view-models/events';
import {
	assertCampaignCanBeDeleted,
	deleteCampaignFromRegistry,
	readCampaignRegistryFromDisk,
	upsertCampaignInRegistry,
	writeCampaignRegistryToDisk
} from '$lib/server/campaign-registry';
import { type EventSource } from '$lib/data/events/types';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;
const origin = SITE_ORIGIN.replace(/\/$/, '');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogv', '.ogg']);
const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.json', '.csv', '.log', '.yaml', '.yml']);

type AssetKind = 'image' | 'video' | 'text' | 'file';

type CampaignAsset = {
	name: string;
	relativePath: string;
	url: string;
	extension: string;
	sizeBytes: number;
	kind: AssetKind;
};

const toEventSlug = (landingPath: string): string | null => {
	const match = landingPath.match(/^\/events\/([^/?#]+)/);
	return match?.[1] ?? null;
};

const GENERATED_EVENTS_PREFIX = '/images/events/';

const toGeneratedEventSlugFromImagePath = (imagePath?: string): string | null => {
	if (!imagePath) return null;
	const trimmed = imagePath.trim();
	if (!trimmed.startsWith(GENERATED_EVENTS_PREFIX)) return null;
	const relative = trimmed.slice(GENERATED_EVENTS_PREFIX.length);
	const [slug] = relative.split('/');
	return slug?.trim() ? slug : null;
};

const pathExists = async (targetPath: string): Promise<boolean> =>
	access(targetPath)
		.then(() => true)
		.catch(() => false);

const resolveGeneratedEventsRoot = async (): Promise<string | null> => {
	const cwd = process.cwd();
	const candidates = [
		path.join(cwd, 'static', 'images', 'events'),
		path.join(cwd, 'web', 'static', 'images', 'events')
	];

	for (const candidate of candidates) {
		if (await pathExists(candidate)) return candidate;
	}

	return null;
};

const toAssetKind = (extension: string): AssetKind => {
	if (IMAGE_EXTENSIONS.has(extension)) return 'image';
	if (VIDEO_EXTENSIONS.has(extension)) return 'video';
	if (TEXT_EXTENSIONS.has(extension)) return 'text';
	return 'file';
};

const toPublicAssetUrl = (eventSlug: string, relativePath: string): string => {
	const encodedPath = relativePath
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');
	return `/images/events/${encodeURIComponent(eventSlug)}/${encodedPath}`;
};

const listAssetsRecursively = async (
	directory: string,
	eventSlug: string,
	prefix = ''
): Promise<CampaignAsset[]> => {
	const entries = await readdir(directory, { withFileTypes: true });
	const sortedEntries = entries.sort((a, b) => a.name.localeCompare(b.name));
	const assets: CampaignAsset[] = [];

	for (const entry of sortedEntries) {
		const absolutePath = path.join(directory, entry.name);
		const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			const nestedAssets = await listAssetsRecursively(absolutePath, eventSlug, relativePath);
			assets.push(...nestedAssets);
			continue;
		}
		if (!entry.isFile()) continue;

		const fileStat = await stat(absolutePath);
		const extension = path.extname(entry.name).toLowerCase();
		assets.push({
			name: entry.name,
			relativePath,
			url: toPublicAssetUrl(eventSlug, relativePath),
			extension,
			sizeBytes: fileStat.size,
			kind: toAssetKind(extension)
		});
	}

	return assets;
};

const loadEventSources = (): EventSource[] =>
	listEventUi({ includeDrafts: true, includeUnlisted: true }).map((event) => ({
		...event,
		location: event.locationMeta
	}) as EventSource);

const getLinkedEventForCampaign = (
	events: EventSource[],
	campaignId: string
): EventSource | undefined => events.find((event) => event.campaignId === campaignId);

const parseCampaignFromFormData = (formData: FormData): Campaign => {
	const id = String(formData.get('id') ?? '').trim();
	const partner = String(formData.get('partner') ?? '').trim();
	const partnerLabel = String(formData.get('partnerLabel') ?? '').trim();
	const landingPath = String(formData.get('landingPath') ?? '').trim();
	const description = String(formData.get('description') ?? '').trim();
	const createdAt = String(formData.get('createdAt') ?? '').trim();

	return {
		id,
		partner,
		partnerLabel: partnerLabel || undefined,
		landingPath,
		description,
		createdAt: createdAt || new Date().toISOString(),
		archived: formData.get('archived') === 'on' || undefined,
		params: {
			utm_source: String(formData.get('utm_source') ?? '').trim(),
			utm_medium: String(formData.get('utm_medium') ?? '').trim(),
			utm_campaign: String(formData.get('utm_campaign') ?? '').trim(),
			utm_content: String(formData.get('utm_content') ?? '').trim(),
			src: String(formData.get('src') ?? '').trim(),
			ad: String(formData.get('ad') ?? '').trim()
		}
	};
};

const ensureDevWrite = () => {
	if (!dev) {
		return fail(404, { message: 'Campaign editing is only available in development.' });
	}
	return null;
};

const validateCampaignMutation = (
	campaign: Campaign,
	events: EventSource[],
	registryCampaignIds: Set<string>,
	previousId?: string
): void => {
	if (!campaign.id) throw new Error('Campaign ID is required.');
	if (!campaign.partner) throw new Error('Partner is required.');
	if (!campaign.landingPath.startsWith('/')) throw new Error('Landing path must start with /.');
	if (!campaign.description) throw new Error('Description is required.');

	const linkedEvent = previousId ? getLinkedEventForCampaign(events, previousId) : undefined;
	if (linkedEvent) {
		if (campaign.id !== previousId) {
			throw new Error(
				`Campaign ${previousId} is linked to event ${linkedEvent.id}. Keep the ID stable and edit other fields instead.`
			);
		}
		const expectedLandingPath = `/events/${linkedEvent.slug}`;
		if (campaign.landingPath !== expectedLandingPath) {
			throw new Error(
				`Campaign ${campaign.id} is linked to event ${linkedEvent.id} and must keep landingPath ${expectedLandingPath}.`
			);
		}
	}

	if ((!previousId || previousId !== campaign.id) && registryCampaignIds.has(campaign.id)) {
		throw new Error(`Campaign ${campaign.id} already exists.`);
	}
};

export const load: PageServerLoad = async () => {
	const campaigns = listCampaignUi(origin);
	const events = listEventUi({ includeDrafts: true, includeUnlisted: true });
	const generatedSlugByCampaignId = new Map<string, string>();
	for (const event of events) {
		const generatedSlug =
			toGeneratedEventSlugFromImagePath(getLandscapeImageUrl(event.images)) ??
			event.slug;
		generatedSlugByCampaignId.set(event.campaignId, generatedSlug);
	}

	const generatedEventsRoot = await resolveGeneratedEventsRoot();
	const campaignGeneratedAssets: Record<string, CampaignAsset[]> = {};
	if (generatedEventsRoot) {
		for (const campaign of campaigns) {
			const eventSlug =
				generatedSlugByCampaignId.get(campaign.id) ?? toEventSlug(campaign.landingPath);
			if (!eventSlug) continue;

			const eventDir = path.join(generatedEventsRoot, eventSlug);
			const eventDirExists = await pathExists(eventDir);
			if (!eventDirExists) {
				campaignGeneratedAssets[campaign.id] = [];
				continue;
			}

			const assets = await listAssetsRecursively(eventDir, eventSlug);
			campaignGeneratedAssets[campaign.id] = assets;
		}
	}

	return { isDev: dev, campaignGeneratedAssets };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const devFailure = ensureDevWrite();
		if (devFailure) return devFailure;

		const formData = await request.formData();
		const campaign = parseCampaignFromFormData(formData);
		const events = loadEventSources();

		try {
			const registry = await readCampaignRegistryFromDisk();
			validateCampaignMutation(campaign, events, new Set(registry.campaigns.map((entry) => entry.id)));
			const nextRegistry = upsertCampaignInRegistry(registry, campaign);
			await writeCampaignRegistryToDisk(nextRegistry, events);
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to create campaign.',
				targetId: 'campaign-create'
			});
		}

		throw redirect(303, `/admin/campaigns#campaign-${campaign.id}`);
	},
	update: async ({ request }) => {
		const devFailure = ensureDevWrite();
		if (devFailure) return devFailure;

		const formData = await request.formData();
		const previousId = String(formData.get('previousId') ?? '').trim();
		const campaign = parseCampaignFromFormData(formData);
		const events = loadEventSources();

		try {
			const registry = await readCampaignRegistryFromDisk();
			validateCampaignMutation(
				campaign,
				events,
				new Set(registry.campaigns.map((entry) => entry.id)),
				previousId
			);
			const nextRegistry = upsertCampaignInRegistry(registry, campaign, previousId);
			await writeCampaignRegistryToDisk(nextRegistry, events);
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to update campaign.',
				targetId: previousId || campaign.id
			});
		}

		throw redirect(303, `/admin/campaigns#campaign-${campaign.id}`);
	},
	delete: async ({ request }) => {
		const devFailure = ensureDevWrite();
		if (devFailure) return devFailure;

		const formData = await request.formData();
		const campaignId = String(formData.get('campaignId') ?? '').trim();
		const events = loadEventSources();

		try {
			const registry = await readCampaignRegistryFromDisk();
			assertCampaignCanBeDeleted(campaignId, events);
			const nextRegistry = deleteCampaignFromRegistry(registry, campaignId);
			await writeCampaignRegistryToDisk(nextRegistry, events);
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to delete campaign.',
				targetId: campaignId
			});
		}

		throw redirect(303, '/admin/campaigns');
	}
};
