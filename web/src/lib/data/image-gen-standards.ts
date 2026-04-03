import standardsData from './image-gen-standards.json';
import type { ImagePromptSet, ImageReference } from '$lib/data/image-contract';

export type ImageGenPromptStandard = {
	id: string;
	createdAt: string;
	entityType: 'events' | 'training' | 'resources' | 'featured-images' | 'custom';
	entitySlug: string;
	assetKeys: {
		square: string;
		landscape: string;
		portrait: string;
	};
	prompts: ImagePromptSet;
	reference: ImageReference;
};

export type ImageGenPromptStandardsRegistry = {
	version: 1;
	updatedAt: string;
	standards: ImageGenPromptStandard[];
};

const registry = standardsData as ImageGenPromptStandardsRegistry;

export const listImageGenPromptStandards = (): ImageGenPromptStandard[] => [
	...(registry.standards ?? [])
];

export const getImageGenPromptStandardsRegistry = (): ImageGenPromptStandardsRegistry => ({
	version: registry.version,
	updatedAt: registry.updatedAt,
	standards: listImageGenPromptStandards()
});
