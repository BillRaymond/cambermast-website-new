import { dev } from '$app/environment';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { listResources } from '$lib/data/resources';
import { listTrainingPrograms } from '$lib/data/training';
import { listEventUi } from '$lib/view-models/events';
import { listImageGenPromptStandards, type ImageGenPromptStandard } from '$lib/data/image-gen-standards';
import {
	DEFAULT_LANDSCAPE_PROMPT,
	DEFAULT_PORTRAIT_PROMPT,
	DEFAULT_SQUARE_PROMPT,
	DEFAULT_TEMPLATE_URL,
	IMAGE_GEN_DEFAULT_COUNT,
	IMAGE_GEN_MAX_COUNT,
	IMAGE_GEN_MIN_COUNT
} from '$lib/server/image-gen/types';

import type { PageServerLoad } from './$types';

export const prerender = false;

type DestinationType = 'events' | 'training' | 'resources' | 'featured-images';

type DestinationOption = {
	slug: string;
	label: string;
	description?: string;
};

type DestinationReference = {
	id: string;
	slug: string;
	label: string;
	description?: string;
	url: string;
	fallbackUrl: string;
	promptSourceLabel?: string;
	prompts?: {
		square: string;
		landscape: string;
		portrait: string;
	};
};

const toTitleCase = (value: string): string =>
	value
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');

const resolveWebRoot = (): string => {
	const cwd = process.cwd();
	const direct = path.join(cwd, 'static');
	const nested = path.join(cwd, 'web', 'static');
	if (existsSync(direct)) return cwd;
	if (existsSync(nested)) return path.join(cwd, 'web');
	return cwd;
};

const webRoot = resolveWebRoot();

const assetKeyExists = (assetKey?: string): assetKey is string => {
	if (!assetKey) return false;
	const normalized = assetKey.replace(/^\/+/, '');
	return existsSync(path.join(webRoot, 'static', 'images', 'generated', normalized));
};

const toPublicGeneratedUrl = (assetKey: string): string =>
	`/images/generated/${assetKey.replace(/^\/+/, '')}`;

const toReferenceAssetKey = (assetKey: string): string | null => {
	const normalized = assetKey.replace(/^\/+/, '');
	const match = normalized.match(/^(.*\/)?(hero-(?:square|landscape|portrait))(-v\d+)?\.jpe?g$/i);
	if (!match) return null;
	const directory = match[1] ?? '';
	const base = match[2];
	const version = match[3] ?? '';
	return `${directory}${base}-reference${version}.png`;
};

const toPreferredGeneratedUrl = (assetKey?: string): { url: string; fallbackUrl: string } | null => {
	if (!assetKeyExists(assetKey)) return null;
	const fallbackUrl = toPublicGeneratedUrl(assetKey);
	const referenceAssetKey = toReferenceAssetKey(assetKey);
	if (referenceAssetKey && assetKeyExists(referenceAssetKey)) {
		return { url: toPublicGeneratedUrl(referenceAssetKey), fallbackUrl };
	}
	return { url: fallbackUrl, fallbackUrl };
};

const toPreferredPublicUrl = (url?: string): { url: string; fallbackUrl: string } | null => {
	if (!url?.trim()) return null;
	const trimmed = url.trim();
	if (!trimmed.startsWith('/images/generated/')) {
		return { url: trimmed, fallbackUrl: trimmed };
	}
	const assetKey = trimmed.replace(/^\/images\/generated\//, '');
	return toPreferredGeneratedUrl(assetKey) ?? { url: trimmed, fallbackUrl: trimmed };
};

const compareVersionedNames = (a: string, b: string): number => {
	const versionOf = (value: string): number => {
		const match = value.match(/-v(\d+)\./i);
		return match ? Number.parseInt(match[1] ?? '1', 10) : 1;
	};
	const versionDiff = versionOf(b) - versionOf(a);
	if (versionDiff !== 0) return versionDiff;
	return a.localeCompare(b);
};

const chooseFeaturedImageFile = (fileNames: string[]): string | null => {
	const pick = (pattern: RegExp): string | null =>
		fileNames.filter((name) => pattern.test(name)).sort(compareVersionedNames)[0] ?? null;

	return (
		pick(/^hero-square-reference(?:-v\d+)?\.png$/i) ??
		pick(/^hero-square(?:-[a-z0-9-]+)?\.png$/i) ??
		pick(/^hero-square(?:-v\d+)?\.jpe?g$/i) ??
		pick(/^hero-landscape-reference(?:-v\d+)?\.png$/i) ??
		pick(/^hero-landscape(?:-[a-z0-9-]+)?\.png$/i) ??
		pick(/^hero-landscape(?:-v\d+)?\.jpe?g$/i) ??
		null
	);
};

const getLatestStandardsBySlug = (): Map<string, ImageGenPromptStandard> => {
	const latestBySlug = new Map<string, ImageGenPromptStandard>();
	for (const entry of listImageGenPromptStandards()) {
		const current = latestBySlug.get(entry.slug);
		if (!current || new Date(entry.createdAt).valueOf() > new Date(current.createdAt).valueOf()) {
			latestBySlug.set(entry.slug, entry);
		}
	}
	return latestBySlug;
};

const toReferenceFromStandard = (
	fullSlug: string,
	label: string,
	description: string | undefined,
	standard?: ImageGenPromptStandard
): DestinationReference | null => {
	if (!standard) return null;
	const preferred =
		toPreferredGeneratedUrl(standard.assetKeys.square) ??
		toPreferredGeneratedUrl(standard.assetKeys.landscape);
	if (!preferred) return null;
	return {
		id: fullSlug,
		slug: fullSlug.replace(/^[^/]+\//, ''),
		label,
		description,
		url: preferred.url,
		fallbackUrl: preferred.fallbackUrl,
		promptSourceLabel: new Date(standard.createdAt).toLocaleString(),
		prompts: standard.prompts
	};
};

const toTrainingReference = (
	program: ReturnType<typeof listTrainingPrograms>[number],
	latestStandardsBySlug: Map<string, ImageGenPromptStandard>
): DestinationReference | null => {
	const fullSlug = `training/${program.slug}`;
	const standardReference = toReferenceFromStandard(
		fullSlug,
		program.title,
		program.sku ?? program.route,
		latestStandardsBySlug.get(fullSlug)
	);
	if (standardReference) return standardReference;

	const preferred = toPreferredPublicUrl(program.heroImage ?? program.ogImage ?? program.catalog?.image);
	if (!preferred) return null;
	return {
		id: fullSlug,
		slug: program.slug,
		label: program.title,
		description: program.sku ?? program.route,
		url: preferred.url,
		fallbackUrl: preferred.fallbackUrl
	};
};

const listFeaturedImageOptions = async (): Promise<DestinationOption[]> => {
	const featuredImagesDir = path.join(webRoot, 'static', 'images', 'generated', 'featured-images');
	const entries = await readdir(featuredImagesDir, { withFileTypes: true }).catch(() => []);

	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => ({
			slug: entry.name,
			label: toTitleCase(entry.name)
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
};

const listFeaturedImageReferences = async (
	latestStandardsBySlug: Map<string, ImageGenPromptStandard>
): Promise<DestinationReference[]> => {
	const featuredImagesDir = path.join(webRoot, 'static', 'images', 'generated', 'featured-images');
	const entries = await readdir(featuredImagesDir, { withFileTypes: true }).catch(() => []);
	const references: DestinationReference[] = [];

	for (const entry of entries.filter((value) => value.isDirectory())) {
		const slug = entry.name;
		const fullSlug = `featured-images/${slug}`;
		const label = toTitleCase(slug);
		const standardReference = toReferenceFromStandard(
			fullSlug,
			label,
			undefined,
			latestStandardsBySlug.get(fullSlug)
		);
		if (standardReference) {
			references.push(standardReference);
			continue;
		}

		const absoluteDir = path.join(featuredImagesDir, slug);
		const fileNames = await readdir(absoluteDir).catch(() => []);
		const chosenFile = chooseFeaturedImageFile(fileNames);
		if (!chosenFile) continue;
		const publicUrl = `/images/generated/featured-images/${slug}/${chosenFile}`;
		references.push({
			id: fullSlug,
			slug,
			label,
			url: publicUrl,
			fallbackUrl: publicUrl
		});
	}

	return references.sort((a, b) => a.label.localeCompare(b.label));
};

export const load: PageServerLoad = async () => {
	const latestStandardsBySlug = getLatestStandardsBySlug();
	const [featuredImageOptions, featuredImageReferences] = await Promise.all([
		listFeaturedImageOptions(),
		listFeaturedImageReferences(latestStandardsBySlug)
	]);
	const trainingPrograms = listTrainingPrograms({ includeDrafts: true });
	const trainingReferenceBySlug = new Map(
		trainingPrograms
			.map((program) => [program.slug, toTrainingReference(program, latestStandardsBySlug)] as const)
			.filter((entry): entry is readonly [string, DestinationReference] => entry[1] !== null)
	);
	const trainingReferenceBySku = new Map(
		trainingPrograms
			.map((program) => [program.sku, toTrainingReference(program, latestStandardsBySlug)] as const)
			.filter(
				(entry): entry is readonly [string, DestinationReference] =>
					typeof entry[0] === 'string' && entry[0].trim().length > 0 && entry[1] !== null
			)
	);

	const trainingReferences: DestinationReference[] = trainingPrograms
		.map((program) => toTrainingReference(program, latestStandardsBySlug))
		.filter((entry): entry is DestinationReference => entry !== null)
		.sort((a, b) => a.label.localeCompare(b.label));

	const resourceReferences: DestinationReference[] = listResources({ includeDrafts: true })
		.map((resource) => {
			const fullSlug = `resources/${resource.slug}`;
			const standardReference = toReferenceFromStandard(
				fullSlug,
				resource.title,
				resource.publishedAt,
				latestStandardsBySlug.get(fullSlug)
			);
			if (standardReference) return standardReference;

			const preferred = toPreferredPublicUrl(resource.imageSrc);
			if (!preferred) return null;
			return {
				id: fullSlug,
				slug: resource.slug,
				label: resource.title,
				description: resource.publishedAt,
				url: preferred.url,
				fallbackUrl: preferred.fallbackUrl
			};
		})
		.filter((entry): entry is DestinationReference => entry !== null)
		.sort((a, b) => a.label.localeCompare(b.label));

	const eventReferences: DestinationReference[] = listEventUi({
		includeDrafts: true,
		includeUnlisted: true
	})
		.flatMap((event) => {
			const fullSlug = `events/${event.slug}`;
			const eventReference =
				toReferenceFromStandard(
					fullSlug,
					event.title,
					event.lifecycleStatus,
					latestStandardsBySlug.get(fullSlug)
				) ??
				(() => {
					const preferred = toPreferredPublicUrl(event.heroImage ?? event.image);
					if (!preferred) return null;
					return {
						id: fullSlug,
						slug: event.slug,
						label: event.title,
						description: event.lifecycleStatus,
						url: preferred.url,
						fallbackUrl: preferred.fallbackUrl
					} satisfies DestinationReference;
				})();

			const parentProgramSlug = event.template?.sourceProgramSlug?.trim() ?? '';
			const parentProgramSku = event.template?.sourceProgramSku?.trim() ?? '';
			const parentProgramReference =
				(parentProgramSlug ? trainingReferenceBySlug.get(parentProgramSlug) : undefined) ??
				(parentProgramSku ? trainingReferenceBySku.get(parentProgramSku) : undefined);

			const relatedTrainingReference = parentProgramReference
				? {
						...parentProgramReference,
						id: `${fullSlug}::training/${parentProgramReference.slug}`,
						slug: event.slug,
						label: `${parentProgramReference.label} (Training program)`,
						description: parentProgramReference.description
					}
				: null;

			return [eventReference, relatedTrainingReference].filter(
				(entry): entry is DestinationReference => entry !== null
			);
		})
		.sort((a, b) => {
			const slugCompare = a.slug.localeCompare(b.slug);
			if (slugCompare !== 0) return slugCompare;
			const aIsTrainingProgram = a.id.includes('::training/');
			const bIsTrainingProgram = b.id.includes('::training/');
			if (aIsTrainingProgram !== bIsTrainingProgram) return aIsTrainingProgram ? 1 : -1;
			return a.label.localeCompare(b.label);
		});

	return {
		isDev: dev,
		destinationOptions: {
			events: eventReferences.map((event) => ({
				slug: event.slug,
				label: event.label,
				description: event.description
			})),
			training: trainingReferences.map((program) => ({
				slug: program.slug,
				label: program.label,
				description: program.description
			})),
			resources: resourceReferences.map((resource) => ({
				slug: resource.slug,
				label: resource.label,
				description: resource.description
			})),
			'featured-images': featuredImageOptions
		},
		destinationReferences: {
			events: eventReferences,
			training: trainingReferences,
			resources: resourceReferences,
			'featured-images': featuredImageReferences
		},
		defaultTemplateUrl: DEFAULT_TEMPLATE_URL,
		defaultPrompts: {
			square: DEFAULT_SQUARE_PROMPT,
			landscape: DEFAULT_LANDSCAPE_PROMPT,
			portrait: DEFAULT_PORTRAIT_PROMPT
		},
		defaultN: IMAGE_GEN_DEFAULT_COUNT,
		minN: IMAGE_GEN_MIN_COUNT,
		maxN: IMAGE_GEN_MAX_COUNT
	};
};
