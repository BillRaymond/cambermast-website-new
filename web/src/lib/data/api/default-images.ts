import { getDefaultImagesRegistry } from '$lib/data/default-images';

type BuildDefaultImagesApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

const toAbsoluteUrl = (value: string, origin: string): string =>
	value.startsWith('/') ? `${origin}${value}` : value;

export const buildDefaultImagesApiPayload = ({
	origin,
	generatedAt
}: BuildDefaultImagesApiPayloadInput) => {
	const registry = getDefaultImagesRegistry();
	return {
		generatedAt: generatedAt ?? new Date().toISOString(),
		version: registry.version,
		updatedAt: registry.updatedAt,
		defaults: {
			events: {
				...registry.defaults.events,
				square: toAbsoluteUrl(registry.defaults.events.square, origin),
				landscape: toAbsoluteUrl(registry.defaults.events.landscape, origin),
				portrait: toAbsoluteUrl(registry.defaults.events.portrait, origin)
			},
			training: {
				...registry.defaults.training,
				square: toAbsoluteUrl(registry.defaults.training.square, origin),
				landscape: toAbsoluteUrl(registry.defaults.training.landscape, origin),
				portrait: toAbsoluteUrl(registry.defaults.training.portrait, origin)
			},
			resources: {
				...registry.defaults.resources,
				square: toAbsoluteUrl(registry.defaults.resources.square, origin),
				landscape: toAbsoluteUrl(registry.defaults.resources.landscape, origin),
				portrait: toAbsoluteUrl(registry.defaults.resources.portrait, origin)
			}
		}
	};
};

export const buildDefaultImagesApiExamples = (origin: string) => {
	const payload = buildDefaultImagesApiPayload({
		origin,
		generatedAt: '2026-04-03T00:00:00.000Z'
	});
	return {
		response: payload,
		example: payload
	};
};
