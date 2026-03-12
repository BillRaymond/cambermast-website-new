import {
	getImageGenPromptStandardsRegistry,
	type ImageGenPromptStandard
} from '$lib/data/image-gen-standards';
import path from 'node:path';
import { existsSync } from 'node:fs';

type BuildImageGenStandardsApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

const toAbsoluteImageUrl = (assetKey: string, origin: string): string =>
	`${origin}/images/generated/${assetKey}`;

const resolveWebRoot = (): string => {
	const cwd = process.cwd();
	const direct = path.join(cwd, 'static');
	const nested = path.join(cwd, 'web', 'static');
	if (existsSync(direct)) return cwd;
	if (existsSync(nested)) return path.join(cwd, 'web');
	return cwd;
};

const webRoot = resolveWebRoot();

const assetKeyExists = (assetKey: string): boolean => {
	const normalized = assetKey.replace(/^\/+/, '');
	const absolutePath = path.join(webRoot, 'static', 'images', 'generated', normalized);
	return existsSync(absolutePath);
};

const toSiblingPngAssetKey = (assetKey: string): string | null => {
	const normalized = assetKey.replace(/^\/+/, '');
	if (/\.png$/i.test(normalized)) return normalized;
	if (!/\.jpe?g$/i.test(normalized)) return null;
	return normalized.replace(/\.jpe?g$/i, '.png');
};

const toExistingReferenceAssetUrl = (assetKey: string, origin: string): string | null => {
	const siblingPngAssetKey = toSiblingPngAssetKey(assetKey);
	if (siblingPngAssetKey && assetKeyExists(siblingPngAssetKey)) {
		return toAbsoluteImageUrl(siblingPngAssetKey, origin);
	}
	return null;
};

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
	assetAvailability: {
		square: assetKeyExists(entry.assetKeys.square),
		landscape: assetKeyExists(entry.assetKeys.landscape),
		portrait: assetKeyExists(entry.assetKeys.portrait)
	},
	referenceAssetUrls: {
		square: toExistingReferenceAssetUrl(entry.assetKeys.square, origin),
		landscape: toExistingReferenceAssetUrl(entry.assetKeys.landscape, origin),
		portrait: toExistingReferenceAssetUrl(entry.assetKeys.portrait, origin)
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
