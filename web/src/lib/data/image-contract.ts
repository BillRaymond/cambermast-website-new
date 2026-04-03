export type ImageVariant = {
	url: string;
};

export type ImagePromptSet = {
	square: string;
	landscape: string;
	portrait: string;
};

export type ImageReferenceSourceType =
	| 'none'
	| 'default_image'
	| 'training_reference'
	| 'local_template'
	| 'upload'
	| 'generated_asset'
	| 'manual'
	| 'legacy_migration';

export type ImageReference = {
	url?: string | null;
	sourceType: ImageReferenceSourceType;
	label: string;
};

export type ImageKind = 'default' | 'generated' | 'manual';

export type EntityCurrentImageSet = {
	square: ImageVariant;
	landscape: ImageVariant;
	portrait: ImageVariant;
	alt: string;
	kind: ImageKind;
	prompts: ImagePromptSet;
	reference: ImageReference;
	historyId: string;
};

export type EntityImages = {
	current: EntityCurrentImageSet;
};

export const EMPTY_IMAGE_PROMPTS: ImagePromptSet = {
	square: '',
	landscape: '',
	portrait: ''
};

export const createEntityImages = (input: {
	landscape: string;
	alt: string;
	square?: string;
	portrait?: string;
	kind?: ImageKind;
	prompts?: Partial<ImagePromptSet>;
	reference?: Partial<ImageReference>;
	historyId: string;
}): EntityImages => ({
	current: {
		square: { url: input.square ?? input.landscape },
		landscape: { url: input.landscape },
		portrait: { url: input.portrait ?? input.landscape },
		alt: input.alt,
		kind: input.kind ?? 'manual',
		prompts: {
			square: input.prompts?.square ?? '',
			landscape: input.prompts?.landscape ?? '',
			portrait: input.prompts?.portrait ?? ''
		},
		reference: {
			url: input.reference?.url ?? null,
			sourceType: input.reference?.sourceType ?? 'manual',
			label: input.reference?.label ?? 'Manual image selection'
		},
		historyId: input.historyId
	}
});

export const getLandscapeImageUrl = (images?: EntityImages): string | undefined =>
	images?.current.landscape.url;

export const getPortraitImageUrl = (images?: EntityImages): string | undefined =>
	images?.current.portrait.url;

export const getSquareImageUrl = (images?: EntityImages): string | undefined =>
	images?.current.square.url;

export const getImageAlt = (images?: EntityImages): string | undefined => images?.current.alt;
