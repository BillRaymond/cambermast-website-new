export type ImageGenStage = 'square' | 'landscape' | 'portrait';

export type ImageGenSize = '1024x1024' | '1536x1024' | '1024x1536';
export type ImageGenDestinationType =
	| 'events'
	| 'training'
	| 'resources'
	| 'featured-images'
	| 'custom';

export const IMAGE_GEN_MODEL = 'gpt-image-1.5';

export const IMAGE_GEN_DEFAULT_COUNT = 4;
export const IMAGE_GEN_MIN_COUNT = 1;
export const IMAGE_GEN_MAX_COUNT = 10;

export const DEFAULT_SQUARE_PROMPT =
	'Use the provided template image as a visual style and composition reference. Create a new image of the same type. Generate the text "CHATGPT ATLAS BROWSER: WHAT\'S NEW" and a modern, sophisticated, clean image that represents the title. Avoid: dark backgrounds, visual clichés, and imagery that anthropomorphizes AI. Avoid the top and bottom 25%.';

export const DEFAULT_LANDSCAPE_PROMPT =
	'Recreate the provided template image as a landscape. Avoid the top and bottom 25%.';

export const DEFAULT_PORTRAIT_PROMPT =
	'Recreate the provided template image in portrait format. Avoid the top and bottom 25%.';

export const STAGE_SIZE_MAP: Record<ImageGenStage, ImageGenSize> = {
	square: '1024x1024',
	landscape: '1536x1024',
	portrait: '1024x1536'
};

export const DEFAULT_TEMPLATE_URL = '/images/admin/image-gen/templates/01-template-1x1-square.jpg';

export type GenerateRequest = {
	stage: ImageGenStage;
	prompt: string;
	n: number;
	size: ImageGenSize;
	templateImageDataUrl?: string;
	destinationType?: ImageGenDestinationType;
	destinationSlug?: string;
	customBasePath?: string;
};

export type CandidateRequestPayload = {
	dataUrl: string;
	minioKey?: string;
	minioUrl?: string;
};

export type SaveSelectedRequest = {
	destinationType?: ImageGenDestinationType;
	destinationSlug: string;
	customBasePath?: string;
	prompts?: {
		square: string;
		landscape: string;
		portrait: string;
	};
	selected: {
		squareCandidateId: string;
		landscapeCandidateId: string;
		portraitCandidateId: string;
	};
	candidateMap: Record<string, CandidateRequestPayload>;
};

export type MinioUploadResult = {
	key: string;
	url?: string;
};

export type ImageGenCandidateResponse = {
	id: string;
	dataUrl: string;
	width: string;
	height: string;
	minioKey: string;
	minioUrl?: string;
	minioBrowserUrl?: string;
	minioBackupError?: string;
};

export type ImageGenGenerateResponse = {
	runId: string;
	stage: ImageGenStage;
	payloadPreview: Record<string, unknown>;
	candidates: ImageGenCandidateResponse[];
	promptBackupKey?: string;
	promptBackupUrl?: string;
	promptBackupBrowserUrl?: string;
	promptBackupError?: string;
};
