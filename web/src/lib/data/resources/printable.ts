import { getResource, listResources } from '$lib/data/resources';
import { runtimeDev } from '$lib/utils/runtime-env';

import {
	aiCodingPromptGuide,
	type PrintableResource
} from '$lib/data/resources/printable/ai-coding-prompt-guide';

const printableResourceContentBySlug = {
	'ai-coding-prompt-guide': aiCodingPromptGuide
} as const satisfies Record<string, PrintableResource>;

const isPrintableResourceEnabled = (slug: string): boolean => {
	const resource = getResource(slug, { includeDrafts: true });
	return Boolean(resource?.pdf?.enabled);
};

const withCurrentHeroImage = (resource: PrintableResource): PrintableResource => {
	const registryResource = getResource(resource.slug, { includeDrafts: true });
	const landscapeUrl = registryResource?.images?.current?.landscape?.url;
	return landscapeUrl ? { ...resource, heroImage: landscapeUrl } : resource;
};

export const listPrintableResources = (): PrintableResource[] =>
	Object.values(printableResourceContentBySlug)
		.filter((resource) => isPrintableResourceEnabled(resource.slug))
		.filter((resource) => runtimeDev || !resource.draft)
		.map(withCurrentHeroImage)
		.slice()
		.sort((left, right) => new Date(right.publishedAt).valueOf() - new Date(left.publishedAt).valueOf());

export const getPrintableResource = (slug: string): PrintableResource | undefined =>
	listPrintableResources().find((resource) => resource.slug === slug);

export const getPrintableResourcePrintUrl = (slug: string): string =>
	getResource(slug, { includeDrafts: true })?.pdf?.printRoute ?? `/resources/${slug}/print`;

export const getPrintableResourcePdfUrl = (slug: string): string =>
	getResource(slug, { includeDrafts: true })?.pdf?.url ?? `/downloads/resources/${slug}.pdf`;

export const hasPrintableResourcePdf = (slug: string): boolean => {
	const resource = getResource(slug, { includeDrafts: true });
	return Boolean(resource?.pdf?.enabled && (runtimeDev || !resource.draft));
};

export const listPrintableResourceSlugs = (): string[] =>
	listResources({ includeDrafts: true })
		.filter((resource) => resource.pdf?.enabled)
		.map((resource) => resource.slug);

export const getPrintableResourceContent = (slug: string): PrintableResource | undefined =>
	printableResourceContentBySlug[slug as keyof typeof printableResourceContentBySlug];

export type { PrintableResource };
