import standardsData from './image-gen-standards.json';
import type { ImagePromptSet, ImageReference } from '$lib/data/image-contract';

export type ImageGenFormatVariant = 'square' | 'landscape' | 'portrait';

export type ImageGenFormatContract = {
	width: number;
	height: number;
	aspectRatio: string;
	label: string;
	use: string;
};

export const IMAGE_GEN_FORMATS: Record<ImageGenFormatVariant, ImageGenFormatContract> = {
	square: {
		width: 1024,
		height: 1024,
		aspectRatio: '1:1',
		label: 'Square',
		use: 'Square site cards and square social posts'
	},
	landscape: {
		width: 1536,
		height: 864,
		aspectRatio: '16:9',
		label: 'Horizontal',
		use: 'Website heroes, event cards, and link previews'
	},
	portrait: {
		width: 1024,
		height: 1280,
		aspectRatio: '4:5',
		label: 'Portrait',
		use: 'LinkedIn and other mobile-first social posts'
	}
};

export const IMAGE_GEN_SIZE_BY_STAGE = {
	square: '1024x1024',
	landscape: '1536x864',
	portrait: '1024x1280'
} as const;

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
	formats: Record<ImageGenFormatVariant, ImageGenFormatContract>;
	standards: ImageGenPromptStandard[];
};

const registry = standardsData as ImageGenPromptStandardsRegistry;

export const listImageGenPromptStandards = (): ImageGenPromptStandard[] => [
	...(registry.standards ?? [])
];

export const getImageGenPromptStandardsRegistry = (): ImageGenPromptStandardsRegistry => ({
	version: registry.version,
	updatedAt: registry.updatedAt,
	formats: registry.formats,
	standards: listImageGenPromptStandards()
});
