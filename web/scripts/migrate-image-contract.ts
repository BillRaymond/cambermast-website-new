import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

type LegacyHistoryEntry = {
	id: string;
	createdAt: string;
	destinationType: 'events' | 'training' | 'resources' | 'featured-images' | 'custom';
	slug: string;
	assetKeys: {
		square: string;
		landscape: string;
		portrait: string;
	};
	prompts: {
		square: string;
		landscape: string;
		portrait: string;
	};
};

type HistoryEntry = {
	id: string;
	createdAt: string;
	entityType: 'events' | 'training' | 'resources' | 'featured-images' | 'custom';
	entitySlug: string;
	assetKeys: {
		square: string;
		landscape: string;
		portrait: string;
	};
	prompts: {
		square: string;
		landscape: string;
		portrait: string;
	};
	reference: {
		url?: string | null;
		sourceType:
			| 'none'
			| 'default_image'
			| 'training_reference'
			| 'local_template'
			| 'upload'
			| 'generated_asset'
			| 'manual'
			| 'legacy_migration';
		label: string;
	};
};

type CurrentImages = {
	current: {
		square: { url: string };
		landscape: { url: string };
		portrait: { url: string };
		alt: string;
		kind: 'default' | 'generated' | 'manual';
		prompts: {
			square: string;
			landscape: string;
			portrait: string;
		};
		reference: {
			url?: string | null;
			sourceType:
				| 'none'
				| 'default_image'
				| 'training_reference'
				| 'local_template'
				| 'upload'
				| 'generated_asset'
				| 'manual'
				| 'legacy_migration';
			label: string;
		};
		historyId: string;
	};
};

type DefaultImageSet = {
	square: string;
	landscape: string;
	portrait: string;
	alt: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');

const readJson = async <T>(relativePath: string): Promise<T> =>
	JSON.parse(await fs.readFile(path.join(webRoot, relativePath), 'utf8')) as T;

const writeJson = async (relativePath: string, value: unknown) => {
	await fs.writeFile(
		path.join(webRoot, relativePath),
		`${JSON.stringify(value, null, '\t')}\n`,
		'utf8'
	);
};

const toPublicUrl = (assetKey: string): string => `/images/${assetKey.replace(/^\/+/, '')}`;

const stripEntityPrefix = (entityType: string, value: string): string =>
	value.startsWith(`${entityType}/`) ? value.slice(entityType.length + 1) : value;

const makeSyntheticId = (...parts: string[]): string =>
	crypto.createHash('sha1').update(parts.join('::')).digest('hex').slice(0, 16);

const replaceVariantStem = (
	url: string,
	fromVariant: 'landscape' | 'square' | 'portrait',
	toVariant: 'landscape' | 'square' | 'portrait'
): string => url.replace(`hero-${fromVariant}`, `hero-${toVariant}`);

const localAssetExists = async (publicUrl: string): Promise<boolean> => {
	if (!publicUrl.startsWith('/')) return false;
	try {
		await fs.access(path.join(webRoot, 'static', publicUrl.replace(/^\/+/, '')));
		return true;
	} catch {
		return false;
	}
};

const buildPromptsForManualState = (label: string) => ({
	square: `${label}. Migrated from legacy image data without preserved generation prompts.`,
	landscape: `${label}. Migrated from legacy image data without preserved generation prompts.`,
	portrait: `${label}. Migrated from legacy image data without preserved generation prompts.`
});

const buildPromptsForDefaultState = (label: string) => ({
	square: `${label}. Domain default image set assigned during image contract migration.`,
	landscape: `${label}. Domain default image set assigned during image contract migration.`,
	portrait: `${label}. Domain default image set assigned during image contract migration.`
});

const normalizeLegacyHistory = (
	entry: LegacyHistoryEntry
): HistoryEntry => ({
	id: entry.id,
	createdAt: entry.createdAt,
	entityType: entry.destinationType,
	entitySlug: stripEntityPrefix(entry.destinationType, entry.slug),
	assetKeys: entry.assetKeys,
	prompts: entry.prompts,
	reference: {
		url: null,
		sourceType:
			entry.destinationType === 'featured-images' && stripEntityPrefix(entry.destinationType, entry.slug) === 'cambermast-default'
				? 'default_image'
				: 'legacy_migration',
		label:
			entry.destinationType === 'featured-images' && stripEntityPrefix(entry.destinationType, entry.slug) === 'cambermast-default'
				? 'Cambermast default featured image set'
				: 'Legacy migration: reference image URL was not preserved'
	}
});

const historyEntryMatchesLandscape = (entry: HistoryEntry, landscapeUrl: string): boolean =>
	toPublicUrl(entry.assetKeys.landscape) === landscapeUrl;

const buildSyntheticHistoryEntry = (
	input: {
		entityType: 'events' | 'training' | 'resources';
		entitySlug: string;
		landscapeUrl: string;
		squareUrl: string;
		portraitUrl: string;
		kind: 'default' | 'manual';
		alt: string;
	}
): HistoryEntry => {
	const prompts =
		input.kind === 'default'
			? buildPromptsForDefaultState(input.alt)
			: buildPromptsForManualState(input.alt);
	const historyId = makeSyntheticId(
		input.entityType,
		input.entitySlug,
		input.landscapeUrl,
		input.kind
	);
	return {
		id: historyId,
		createdAt: new Date().toISOString(),
		entityType: input.entityType,
		entitySlug: input.entitySlug,
		assetKeys: {
			square: input.squareUrl.replace(/^\/images\//, ''),
			landscape: input.landscapeUrl.replace(/^\/images\//, ''),
			portrait: input.portraitUrl.replace(/^\/images\//, '')
		},
		prompts,
		reference: {
			url: input.kind === 'default' ? input.landscapeUrl : null,
			sourceType: input.kind === 'default' ? 'default_image' : 'legacy_migration',
			label:
				input.kind === 'default'
					? 'Domain default image set'
					: 'Legacy migration: image preserved without generation provenance'
		}
	};
};

const resolveManualVariantUrls = async (landscapeUrl: string) => {
	const squareCandidate = replaceVariantStem(landscapeUrl, 'landscape', 'square');
	const portraitCandidate = replaceVariantStem(landscapeUrl, 'landscape', 'portrait');
	const squareExists = await localAssetExists(squareCandidate);
	const portraitExists = await localAssetExists(portraitCandidate);
	return {
		square: squareExists ? squareCandidate : landscapeUrl,
		landscape: landscapeUrl,
		portrait: portraitExists ? portraitCandidate : landscapeUrl
	};
};

const migrateEntityImages = async (input: {
	entityType: 'events' | 'training' | 'resources';
	entitySlug: string;
	landscapeUrl?: string;
	alt?: string;
	defaultSet: DefaultImageSet;
	historyEntries: HistoryEntry[];
}): Promise<{ images: CurrentImages; historyEntry: HistoryEntry | null }> => {
	const landscapeUrl = input.landscapeUrl?.trim();
	const alt = input.alt?.trim() || input.defaultSet.alt;

	if (landscapeUrl) {
		const matchedHistory = input.historyEntries.find(
			(entry) =>
				entry.entityType === input.entityType &&
				entry.entitySlug === input.entitySlug &&
				historyEntryMatchesLandscape(entry, landscapeUrl)
		);
		if (matchedHistory) {
			return {
				images: {
					current: {
						square: { url: toPublicUrl(matchedHistory.assetKeys.square) },
						landscape: { url: toPublicUrl(matchedHistory.assetKeys.landscape) },
						portrait: { url: toPublicUrl(matchedHistory.assetKeys.portrait) },
						alt,
						kind: 'generated',
						prompts: matchedHistory.prompts,
						reference: matchedHistory.reference,
						historyId: matchedHistory.id
					}
				},
				historyEntry: null
			};
		}

		const manualUrls = await resolveManualVariantUrls(landscapeUrl);
		const historyEntry = buildSyntheticHistoryEntry({
			entityType: input.entityType,
			entitySlug: input.entitySlug,
			landscapeUrl: manualUrls.landscape,
			squareUrl: manualUrls.square,
			portraitUrl: manualUrls.portrait,
			kind: 'manual',
			alt
		});
		return {
			images: {
				current: {
					square: { url: manualUrls.square },
					landscape: { url: manualUrls.landscape },
					portrait: { url: manualUrls.portrait },
					alt,
					kind: 'manual',
					prompts: historyEntry.prompts,
					reference: historyEntry.reference,
					historyId: historyEntry.id
				}
			},
			historyEntry
		};
	}

	const historyEntry = buildSyntheticHistoryEntry({
		entityType: input.entityType,
		entitySlug: input.entitySlug,
		landscapeUrl: input.defaultSet.landscape,
		squareUrl: input.defaultSet.square,
		portraitUrl: input.defaultSet.portrait,
		kind: 'default',
		alt
	});
	return {
		images: {
			current: {
				square: { url: input.defaultSet.square },
				landscape: { url: input.defaultSet.landscape },
				portrait: { url: input.defaultSet.portrait },
				alt,
				kind: 'default',
				prompts: historyEntry.prompts,
				reference: historyEntry.reference,
				historyId: historyEntry.id
			}
		},
		historyEntry
	};
};

const main = async () => {
	const [eventsRegistry, trainingRegistry, resourcesRegistry, standardsRegistry, defaultImages] =
		await Promise.all([
			readJson<{ events: Array<Record<string, unknown>> }>('src/lib/data/events/events.json'),
			readJson<{ programs: Array<Record<string, unknown>> }>('src/lib/data/training/training.json'),
			readJson<{ resources: Array<Record<string, unknown>> }>('src/lib/data/resources/resources.json'),
			readJson<{ version: 1; updatedAt: string; standards: LegacyHistoryEntry[] }>(
				'src/lib/data/image-gen-standards.json'
			),
			readJson<{ defaults: { events: DefaultImageSet; training: DefaultImageSet; resources: DefaultImageSet } }>(
				'src/lib/data/default-images.json'
			)
		]);

	const historyEntries = standardsRegistry.standards.map(normalizeLegacyHistory);
	const syntheticHistoryEntries: HistoryEntry[] = [];

	const migratedEvents = await Promise.all(
		(eventsRegistry.events ?? []).map(async (event) => {
			const slug = typeof event.slug === 'string' ? event.slug : '';
			const landscapeUrl =
				(typeof event.heroImage === 'string' && event.heroImage) ||
				(typeof event.image === 'string' && event.image) ||
				'';
			const alt =
				(typeof event.heroImageAlt === 'string' && event.heroImageAlt) ||
				(typeof event.imageAlt === 'string' && event.imageAlt) ||
				(typeof event.title === 'string' ? event.title : defaultImages.defaults.events.alt);
			const { images, historyEntry } = await migrateEntityImages({
				entityType: 'events',
				entitySlug: slug,
				landscapeUrl,
				alt,
				defaultSet: defaultImages.defaults.events,
				historyEntries
			});
			if (historyEntry) syntheticHistoryEntries.push(historyEntry);
			const {
				heroImage: _heroImage,
				heroImageAlt: _heroImageAlt,
				image: _image,
				imageAlt: _imageAlt,
				...rest
			} = event;
			return {
				...rest,
				images
			};
		})
	);

	const migratedPrograms = await Promise.all(
		(trainingRegistry.programs ?? []).map(async (program) => {
			const slug = typeof program.slug === 'string' ? program.slug : '';
			const catalog =
				program.catalog && typeof program.catalog === 'object'
					? { ...(program.catalog as Record<string, unknown>) }
					: undefined;
			const landscapeUrl =
				(typeof program.heroImage === 'string' && program.heroImage) ||
				(typeof catalog?.image === 'string' && catalog.image) ||
				(typeof program.ogImage === 'string' && program.ogImage) ||
				'';
			const alt =
				(typeof program.heroImageAlt === 'string' && program.heroImageAlt) ||
				(typeof catalog?.imageAlt === 'string' && catalog.imageAlt) ||
				(typeof program.ogImageAlt === 'string' && program.ogImageAlt) ||
				(typeof program.title === 'string' ? program.title : defaultImages.defaults.training.alt);
			const { images, historyEntry } = await migrateEntityImages({
				entityType: 'training',
				entitySlug: slug,
				landscapeUrl,
				alt,
				defaultSet: defaultImages.defaults.training,
				historyEntries
			});
			if (historyEntry) syntheticHistoryEntries.push(historyEntry);
			if (catalog) {
				delete catalog.image;
				delete catalog.imageAlt;
			}
			const {
				heroImage: _heroImage,
				heroImageAlt: _heroImageAlt,
				ogImage: _ogImage,
				ogImageAlt: _ogImageAlt,
				...rest
			} = program;
			return {
				...rest,
				catalog,
				images
			};
		})
	);

	const migratedResources = await Promise.all(
		(resourcesRegistry.resources ?? []).map(async (resource) => {
			const slug = typeof resource.slug === 'string' ? resource.slug : '';
			const landscapeUrl = typeof resource.imageSrc === 'string' ? resource.imageSrc : '';
			const alt =
				(typeof resource.imageAlt === 'string' && resource.imageAlt) ||
				(typeof resource.title === 'string'
					? `${resource.title} featured image.`
					: defaultImages.defaults.resources.alt);
			const { images, historyEntry } = await migrateEntityImages({
				entityType: 'resources',
				entitySlug: slug,
				landscapeUrl,
				alt,
				defaultSet: defaultImages.defaults.resources,
				historyEntries
			});
			if (historyEntry) syntheticHistoryEntries.push(historyEntry);
			const { imageSrc: _imageSrc, imageAlt: _imageAlt, ...rest } = resource;
			return {
				...rest,
				images
			};
		})
	);

	const nextHistory = {
		version: 1 as const,
		updatedAt: new Date().toISOString(),
		standards: [...syntheticHistoryEntries, ...historyEntries]
			.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())
			.slice(0, 500)
	};

	await Promise.all([
		writeJson('src/lib/data/events/events.json', { events: migratedEvents }),
		writeJson('src/lib/data/training/training.json', { programs: migratedPrograms }),
		writeJson('src/lib/data/resources/resources.json', { resources: migratedResources }),
		writeJson('src/lib/data/image-gen-standards.json', nextHistory)
	]);

	console.log('Migrated event, training, resource, and image history registries to the new image contract.');
};

await main();
