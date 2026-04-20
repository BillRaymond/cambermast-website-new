import type { EntityImages } from '$lib/data/image-contract';

export type ResourcePdf = {
	enabled: boolean;
	printRoute: string;
	url: string;
};

export type ResourceEntry = {
	id: string;
	slug: string;
	route: string;
	title: string;
	summary: string;
	category: string;
	publishedAt: string;
	author?: string;
	images: EntityImages;
	pdf?: ResourcePdf;
	label?: string;
	draft?: boolean;
};

export type ResourcesRegistry = {
	resources: ResourceEntry[];
};
