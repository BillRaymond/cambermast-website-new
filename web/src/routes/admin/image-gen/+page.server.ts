import { dev } from '$app/environment';
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { listResources } from '$lib/data/resources';
import { listTrainingPrograms } from '$lib/data/training';
import { listEventUi } from '$lib/view-models/events';
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

type DestinationOption = {
	slug: string;
	label: string;
	description?: string;
};

const toTitleCase = (value: string): string =>
	value
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');

const listFeaturedImageOptions = async (): Promise<DestinationOption[]> => {
	const featuredImagesDir = path.join(
		process.cwd(),
		'web',
		'static',
		'images',
		'generated',
		'featured-images'
	);
	const entries = await readdir(featuredImagesDir, { withFileTypes: true }).catch(() => []);

	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => ({
			slug: entry.name,
			label: toTitleCase(entry.name)
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
};

export const load: PageServerLoad = async () => {
	const [featuredImageOptions] = await Promise.all([listFeaturedImageOptions()]);

	return {
		isDev: dev,
		destinationOptions: {
			events: listEventUi({ includeDrafts: true, includeUnlisted: true })
				.map((event) => ({
					slug: event.slug,
					label: event.title,
					description: event.lifecycleStatus
				}))
				.sort((a, b) => a.label.localeCompare(b.label)),
			training: listTrainingPrograms({ includeDrafts: true })
				.map((program) => ({
					slug: program.slug,
					label: program.title,
					description: program.sku ?? program.route
				}))
				.sort((a, b) => a.label.localeCompare(b.label)),
			resources: listResources({ includeDrafts: true })
				.map((resource) => ({
					slug: resource.slug,
					label: resource.title,
					description: resource.publishedAt
				}))
				.sort((a, b) => a.label.localeCompare(b.label)),
			'featured-images': featuredImageOptions
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
