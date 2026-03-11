import standardsData from './image-gen-standards.json';

export type ImageGenPromptStandard = {
	id: string;
	createdAt: string;
	destinationType: 'events' | 'training' | 'resources' | 'featured-images' | 'custom';
	slug: string;
	assetKeys: {
		square: string;
		landscape: string;
		portrait: string;
	};
	prompts: {
		square: string;
		landscape: string;
		portrait: string;
	};
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
