import type { EntityImages } from '$lib/data/image-contract';

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
	label?: string;
	draft?: boolean;
};

export type ResourcesRegistry = {
	resources: ResourceEntry[];
};
