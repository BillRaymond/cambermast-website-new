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
	images: {
		current: {
			...resource.images.current,
			square: { url: toAbsoluteUrl(resource.images.current.square.url, origin) },
			landscape: { url: toAbsoluteUrl(resource.images.current.landscape.url, origin) },
			portrait: { url: toAbsoluteUrl(resource.images.current.portrait.url, origin) },
			reference: {
				...resource.images.current.reference,
				url: resource.images.current.reference.url
					? toAbsoluteUrl(resource.images.current.reference.url, origin)
					: null
			}
		}
	},
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
