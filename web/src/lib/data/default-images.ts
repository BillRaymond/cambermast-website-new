import registryData from './default-images.json';

export type DefaultImageSet = {
	square: string;
	landscape: string;
	portrait: string;
	alt: string;
};

export type DefaultImagesRegistry = {
	version: 1;
	updatedAt: string;
	defaults: {
		events: DefaultImageSet;
		training: DefaultImageSet;
		resources: DefaultImageSet;
	};
};

const registry = registryData as DefaultImagesRegistry;

export const getDefaultImagesRegistry = (): DefaultImagesRegistry => ({
	version: registry.version,
	updatedAt: registry.updatedAt,
	defaults: {
		events: { ...registry.defaults.events },
		training: { ...registry.defaults.training },
		resources: { ...registry.defaults.resources }
	}
});

export const getDefaultImageSet = (
	domain: keyof DefaultImagesRegistry['defaults']
): DefaultImageSet => ({ ...registry.defaults[domain] });
