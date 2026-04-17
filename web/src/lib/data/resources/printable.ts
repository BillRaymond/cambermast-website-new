import { runtimeDev } from '$lib/utils/runtime-env';

import {
	aiCodingPromptGuide,
	type PrintableResource
} from '$lib/data/resources/printable/ai-coding-prompt-guide';

const printableResources = [aiCodingPromptGuide] as const satisfies readonly PrintableResource[];

export const listPrintableResources = (): PrintableResource[] =>
	printableResources
		.filter((resource) => runtimeDev || !resource.draft)
		.slice()
		.sort((left, right) => new Date(right.publishedAt).valueOf() - new Date(left.publishedAt).valueOf());

export const getPrintableResource = (slug: string): PrintableResource | undefined =>
	listPrintableResources().find((resource) => resource.slug === slug);

export const getPrintableResourcePrintUrl = (slug: string): string =>
	`/resources/${slug}/print`;

export const getPrintableResourcePdfUrl = (slug: string): string =>
	`/downloads/resources/${slug}.pdf`;

export const hasPrintableResourcePdf = (slug: string): boolean => {
	const resource = getPrintableResource(slug);
	return Boolean(resource && !resource.draft);
};

export type { PrintableResource };
