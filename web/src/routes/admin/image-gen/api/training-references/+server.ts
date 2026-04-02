import { json } from '@sveltejs/kit';
import { listTrainingPrograms } from '$lib/data/training';
import { listImageGenPromptStandards } from '$lib/data/image-gen-standards';
import path from 'node:path';
import { access } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export const prerender = false;

type TrainingReferenceField = 'generatedSquare' | 'generatedLandscape' | 'heroImage' | 'ogImage';

type TrainingReference = {
	programSku?: string;
	programTitle: string;
	field: TrainingReferenceField;
	url: string;
	label: string;
};

const isFetchableImageUrl = (value: string): boolean =>
	value.startsWith('/') || /^https?:\/\//i.test(value);

const resolveWebRoot = (): string => {
	const cwd = process.cwd();
	const direct = path.join(cwd, 'static');
	const nested = path.join(cwd, 'web', 'static');
	if (existsSync(direct)) return cwd;
	if (existsSync(nested)) return path.join(cwd, 'web');
	return cwd;
};

const webRoot = resolveWebRoot();

const localPublicUrlExists = async (url: string): Promise<boolean> => {
	if (!url.startsWith('/')) return false;
	const normalized = url.replace(/^\/+/, '');
	const absolute = path.join(webRoot, 'static', normalized);
	try {
		await access(absolute);
		return true;
	} catch {
		return false;
	}
};

const isUsableReferenceUrl = async (value: string): Promise<boolean> => {
	if (!isFetchableImageUrl(value)) return false;
	if (!value.startsWith('/')) return true;
	return localPublicUrlExists(value);
};

const toPublicGeneratedUrl = (assetKey: string): string => `/images/${assetKey.replace(/^\/+/, '')}`;

const toSiblingPngAssetKey = (assetKey: string): string | null => {
	const normalized = assetKey.replace(/^\/+/, '');
	if (/\.png$/i.test(normalized)) return normalized;
	if (!/\.jpe?g$/i.test(normalized)) return null;
	return normalized.replace(/\.jpe?g$/i, '.png');
};

const toPreferredReferenceUrl = async (assetKey?: string): Promise<string | undefined> => {
	if (!assetKey) return undefined;
	const siblingPngAssetKey = toSiblingPngAssetKey(assetKey);
	if (siblingPngAssetKey) {
		const siblingPngUrl = toPublicGeneratedUrl(siblingPngAssetKey);
		if (await localPublicUrlExists(siblingPngUrl)) {
			return siblingPngUrl;
		}
	}
	return toPublicGeneratedUrl(assetKey);
};

const getLatestTrainingStandardAssetUrls = (): Map<string, { square?: string; landscape?: string }> => {
	const latestBySlug = new Map<string, { createdAt: string; square?: string; landscape?: string }>();

	for (const entry of listImageGenPromptStandards()) {
		if (entry.destinationType !== 'training') continue;
		const slug = entry.slug.replace(/^training\//, '').trim();
		if (!slug) continue;

		const current = latestBySlug.get(slug);
		if (current && new Date(current.createdAt).valueOf() >= new Date(entry.createdAt).valueOf()) {
			continue;
		}

		latestBySlug.set(slug, {
			createdAt: entry.createdAt,
			square: entry.assetKeys.square,
			landscape: entry.assetKeys.landscape
		});
	}

	return new Map(
		Array.from(latestBySlug.entries()).map(([slug, value]) => [
			slug,
			{ square: value.square, landscape: value.landscape }
		])
	);
};

export const GET = async () => {
	if (!import.meta.env.DEV) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const programs = listTrainingPrograms({ includeDrafts: true });
	const latestStandardAssetUrls = getLatestTrainingStandardAssetUrls();
	const deduped = new Map<string, TrainingReference>();

	for (const program of programs) {
		const latestStandard = latestStandardAssetUrls.get(program.slug);
		const preferredGeneratedSquareUrl = await toPreferredReferenceUrl(latestStandard?.square);
		const preferredGeneratedLandscapeUrl = await toPreferredReferenceUrl(latestStandard?.landscape);
		const entries: Array<{ field: TrainingReferenceField; url?: string }> = [
			{ field: 'generatedSquare', url: preferredGeneratedSquareUrl },
			{ field: 'generatedLandscape', url: preferredGeneratedLandscapeUrl },
			{ field: 'heroImage', url: program.heroImage },
			{ field: 'ogImage', url: program.ogImage }
		];

		let selected: { field: TrainingReferenceField; url: string } | undefined;
		for (const entry of entries) {
			const rawUrl = entry.url?.trim();
			if (!rawUrl || deduped.has(rawUrl)) continue;
			if (!(await isUsableReferenceUrl(rawUrl))) continue;
			selected = { field: entry.field, url: rawUrl };
			break;
		}

		if (!selected || deduped.has(selected.url)) continue;
		const skuLabel = program.sku?.trim() ? `${program.sku} · ` : '';
		deduped.set(selected.url, {
			programSku: program.sku,
			programTitle: program.title,
			field: selected.field,
			url: selected.url,
			label: `${skuLabel}${program.title} (${selected.field})`
		});
	}

	return json({ references: Array.from(deduped.values()) });
};
