import { listResources } from '$lib/data/resources';

type BuildResourcesApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

const toAbsoluteUrl = (value: string, origin: string): string => {
	if (/^https?:\/\//i.test(value)) return value;
	if (value.startsWith('/')) return `${origin}${value}`;
	return value;
};

const toApiResource = (resource: ReturnType<typeof listResources>[number], origin: string) => ({
	id: resource.id,
	slug: resource.slug,
	route: resource.route,
	url: toAbsoluteUrl(resource.route, origin),
	title: resource.title,
	summary: resource.summary,
	category: resource.category,
	publishedAt: resource.publishedAt,
	author: resource.author,
	imageSrc: resource.imageSrc ? toAbsoluteUrl(resource.imageSrc, origin) : undefined,
	imageAlt: resource.imageAlt,
	label: resource.label
});

export const buildResourcesApiPayload = ({ origin, generatedAt }: BuildResourcesApiPayloadInput) => ({
	generatedAt: generatedAt ?? new Date().toISOString(),
	resources: listResources().map((resource) => toApiResource(resource, origin))
});

export const buildResourcesApiExamples = (origin: string) => {
	const payload = buildResourcesApiPayload({
		origin,
		generatedAt: '2026-03-11T10:00:00.000Z'
	});
	const first = payload.resources.at(0) ?? null;
	return {
		response: payload,
		example: first ? { generatedAt: payload.generatedAt, resources: [first] } : payload
	};
};
