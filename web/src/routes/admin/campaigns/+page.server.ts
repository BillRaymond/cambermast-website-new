import { access, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { SITE_ORIGIN } from '$lib/config/site';
import { listCampaignUi } from '$lib/view-models/campaigns';
import { listEventUi } from '$lib/view-models/events';
import type { PageServerLoad } from './$types';

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

const GENERATED_EVENTS_PREFIX = '/images/generated/events/';

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
		path.join(cwd, 'static', 'images', 'generated', 'events'),
		path.join(cwd, 'web', 'static', 'images', 'generated', 'events')
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
	return `/images/generated/events/${encodeURIComponent(eventSlug)}/${encodedPath}`;
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

export const load: PageServerLoad = async () => {
	const campaigns = listCampaignUi(origin);
	const events = listEventUi({ includeDrafts: true, includeUnlisted: true });
	const generatedSlugByCampaignId = new Map<string, string>();
	for (const event of events) {
		if (!event.campaignId) continue;
		const generatedSlug =
			toGeneratedEventSlugFromImagePath(event.heroImage) ??
			toGeneratedEventSlugFromImagePath(event.image) ??
			event.slug;
		generatedSlugByCampaignId.set(event.campaignId, generatedSlug);
	}

	const generatedEventsRoot = await resolveGeneratedEventsRoot();
	const campaignGeneratedAssets: Record<string, CampaignAsset[]> = {};
	if (!generatedEventsRoot) return { campaignGeneratedAssets };

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

	return { campaignGeneratedAssets };
};
