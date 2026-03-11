import {
	getImageGenPromptStandardsRegistry,
	type ImageGenPromptStandard
} from '$lib/data/image-gen-standards';

type BuildImageGenStandardsApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

const toAbsoluteImageUrl = (assetKey: string, origin: string): string =>
	`${origin}/images/generated/${assetKey}`;

const toApiStandard = (entry: ImageGenPromptStandard, origin: string) => ({
	id: entry.id,
	createdAt: entry.createdAt,
	destinationType: entry.destinationType,
	slug: entry.slug,
	assetKeys: entry.assetKeys,
	assetUrls: {
		square: toAbsoluteImageUrl(entry.assetKeys.square, origin),
		landscape: toAbsoluteImageUrl(entry.assetKeys.landscape, origin),
		portrait: toAbsoluteImageUrl(entry.assetKeys.portrait, origin)
	},
	prompts: entry.prompts
});

export const buildImageGenStandardsApiPayload = ({
	origin,
	generatedAt
}: BuildImageGenStandardsApiPayloadInput) => {
	const registry = getImageGenPromptStandardsRegistry();
	return {
		generatedAt: generatedAt ?? new Date().toISOString(),
		version: registry.version,
		updatedAt: registry.updatedAt,
		standards: registry.standards.map((entry) => toApiStandard(entry, origin))
	};
};

export const buildImageGenStandardsApiExamples = (origin: string) => {
	const payload = buildImageGenStandardsApiPayload({
		origin,
		generatedAt: '2026-03-04T19:00:00.000Z'
	});
	const first = payload.standards.at(0) ?? null;
	return {
		response: payload,
		example: first
			? {
					generatedAt: payload.generatedAt,
					version: payload.version,
					updatedAt: payload.updatedAt,
					standards: [first]
				}
			: payload
	};
};
