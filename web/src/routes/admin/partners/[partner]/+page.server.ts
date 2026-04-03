import { access, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { SITE_ORIGIN } from '$lib/config/site';
import { getLandscapeImageUrl } from '$lib/data/image-contract';
import { getPartnerByCode } from '$lib/data/partners';
import { listTrainingPrograms } from '$lib/data/training';
import { listCampaignUi } from '$lib/view-models/campaigns';
import { listEventUi } from '$lib/view-models/events';
import type { PageServerLoad } from './$types';

export const prerender = true;

const origin = SITE_ORIGIN.replace(/\/$/, '');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogv', '.ogg']);
const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.json', '.csv', '.log', '.yaml', '.yml']);
const GENERATED_EVENTS_PREFIX = '/images/events/';
const GENERATED_TRAINING_PREFIX = '/images/training/';

type AssetKind = 'image' | 'video' | 'text' | 'file';

type CampaignAsset = {
	name: string;
	relativePath: string;
	url: string;
	extension: string;
	sizeBytes: number;
	kind: AssetKind;
};

const pathExists = async (targetPath: string): Promise<boolean> =>
	access(targetPath)
		.then(() => true)
		.catch(() => false);

const toGeneratedEventSlugFromImagePath = (imagePath?: string): string | null => {
	if (!imagePath) return null;
	const trimmed = imagePath.trim();
	if (!trimmed.startsWith(GENERATED_EVENTS_PREFIX)) return null;
	const relative = trimmed.slice(GENERATED_EVENTS_PREFIX.length);
	const [slug] = relative.split('/');
	return slug?.trim() ? slug : null;
};

const toGeneratedTrainingSlugFromImagePath = (imagePath?: string): string | null => {
	if (!imagePath) return null;
	const trimmed = imagePath.trim();
	if (!trimmed.startsWith(GENERATED_TRAINING_PREFIX)) return null;
	const relative = trimmed.slice(GENERATED_TRAINING_PREFIX.length);
	const [slug] = relative.split('/');
	return slug?.trim() ? slug : null;
};

const toEventSlug = (landingPath: string): string | null => {
	const match = landingPath.match(/^\/events\/([^/?#]+)/);
	return match?.[1] ?? null;
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

const toPublicTrainingAssetUrl = (trainingSlug: string, relativePath: string): string => {
	const encodedPath = relativePath
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');
	return `/images/training/${encodeURIComponent(trainingSlug)}/${encodedPath}`;
};

const listAssetsRecursively = async (
	directory: string,
	slug: string,
	toPublicUrl: (slug: string, relativePath: string) => string,
	prefix = ''
): Promise<CampaignAsset[]> => {
	const entries = await readdir(directory, { withFileTypes: true });
	const sortedEntries = entries.sort((a, b) => a.name.localeCompare(b.name));
	const assets: CampaignAsset[] = [];

	for (const entry of sortedEntries) {
		const absolutePath = path.join(directory, entry.name);
		const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			const nestedAssets = await listAssetsRecursively(
				absolutePath,
				slug,
				toPublicUrl,
				relativePath
			);
			assets.push(...nestedAssets);
			continue;
		}
		if (!entry.isFile()) continue;

		const fileStat = await stat(absolutePath);
		const extension = path.extname(entry.name).toLowerCase();
		assets.push({
			name: entry.name,
			relativePath,
			url: toPublicUrl(slug, relativePath),
			extension,
			sizeBytes: fileStat.size,
			kind: toAssetKind(extension)
		});
	}

	return assets;
};

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

const resolveGeneratedTrainingRoot = async (): Promise<string | null> => {
	const cwd = process.cwd();
	const candidates = [
		path.join(cwd, 'static', 'images', 'training'),
		path.join(cwd, 'web', 'static', 'images', 'training')
	];

	for (const candidate of candidates) {
		if (await pathExists(candidate)) return candidate;
	}

	return null;
};

export const load: PageServerLoad = async ({ params }) => {
	const partnerKey = params.partner?.toLowerCase() ?? '';
	const campaigns = listCampaignUi(origin).filter(
		(campaign) => campaign.partner?.toLowerCase() === partnerKey
	);
	const events = listEventUi({ includeDrafts: true, includeUnlisted: true });
	const trainingPrograms = listTrainingPrograms({ includeDrafts: true }).filter((program) =>
		program.eventDefaults?.partnerCodes?.some(
			(code) => getPartnerByCode(code)?.slug?.toLowerCase() === partnerKey
		)
	);

	const generatedSlugByCampaignId = new Map<string, string>();
	for (const event of events) {
		const generatedSlug =
			toGeneratedEventSlugFromImagePath(getLandscapeImageUrl(event.images)) ??
			event.slug;
		generatedSlugByCampaignId.set(event.campaignId, generatedSlug);
	}

	const generatedEventsRoot = await resolveGeneratedEventsRoot();
	const generatedTrainingRoot = await resolveGeneratedTrainingRoot();
	const campaignGeneratedAssets: Record<string, CampaignAsset[]> = {};
	const eventGeneratedAssets: Record<string, CampaignAsset[]> = {};
	const trainingGeneratedAssets: Record<string, CampaignAsset[]> = {};

	if (generatedEventsRoot) {
		for (const event of events) {
			const isPartnerEvent = (event.partners ?? []).some(
				(partnerRef) => getPartnerByCode(partnerRef.code)?.slug?.toLowerCase() === partnerKey
			);
			if (!isPartnerEvent) continue;

			const generatedSlug =
				toGeneratedEventSlugFromImagePath(getLandscapeImageUrl(event.images)) ??
				event.slug;
			const eventDir = path.join(generatedEventsRoot, generatedSlug);
			if (!(await pathExists(eventDir))) {
				eventGeneratedAssets[event.slug] = [];
				continue;
			}

			eventGeneratedAssets[event.slug] = await listAssetsRecursively(
				eventDir,
				generatedSlug,
				toPublicAssetUrl
			);
		}

		for (const campaign of campaigns) {
			const eventSlug =
				generatedSlugByCampaignId.get(campaign.id) ?? toEventSlug(campaign.landingPath);
			if (!eventSlug) {
				campaignGeneratedAssets[campaign.id] = [];
				continue;
			}

			const eventDir = path.join(generatedEventsRoot, eventSlug);
			if (!(await pathExists(eventDir))) {
				campaignGeneratedAssets[campaign.id] = [];
				continue;
			}

			campaignGeneratedAssets[campaign.id] = await listAssetsRecursively(
				eventDir,
				eventSlug,
				toPublicAssetUrl
			);
		}
	}

	if (generatedTrainingRoot) {
		for (const program of trainingPrograms) {
			const generatedSlug =
				toGeneratedTrainingSlugFromImagePath(getLandscapeImageUrl(program.images)) ??
				program.slug;
			const trainingDir = path.join(generatedTrainingRoot, generatedSlug);
			if (!(await pathExists(trainingDir))) {
				trainingGeneratedAssets[program.slug] = [];
				continue;
			}

			trainingGeneratedAssets[program.slug] = await listAssetsRecursively(
				trainingDir,
				generatedSlug,
				toPublicTrainingAssetUrl
			);
		}
	}

	return { campaignGeneratedAssets, eventGeneratedAssets, trainingGeneratedAssets };
};
