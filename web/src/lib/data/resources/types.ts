export type ResourceEntry = {
	id: string;
	slug: string;
	route: string;
	title: string;
	summary: string;
	category: string;
	publishedAt: string;
	author?: string;
	imageSrc?: string;
	imageAlt?: string;
	label?: string;
	draft?: boolean;
};

export type ResourcesRegistry = {
	resources: ResourceEntry[];
};
