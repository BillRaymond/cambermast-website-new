import { IMAGE_GEN_MODEL, type ImageGenSize } from '$lib/server/image-gen/types';
import { Buffer } from 'node:buffer';

type OpenAiImagePayload = {
	model: typeof IMAGE_GEN_MODEL;
	prompt: string;
	size: ImageGenSize;
	n: number;
	images?: Array<{ image_url: string }>;
};

type OpenAiImageResponse = {
	data?: Array<{
		b64_json?: string;
		url?: string;
	}>;
	error?: {
		message?: string;
	};
};

const OPENAI_EDITS_ENDPOINT = 'https://api.openai.com/v1/images/edits';
const OPENAI_GENERATIONS_ENDPOINT = 'https://api.openai.com/v1/images/generations';

const toDataUrl = async (entry: { b64_json?: string; url?: string }): Promise<string> => {
	if (typeof entry.b64_json === 'string' && entry.b64_json.length > 0) {
		return `data:image/png;base64,${entry.b64_json}`;
	}
	if (typeof entry.url === 'string' && entry.url.length > 0) {
		const response = await fetch(entry.url);
		if (!response.ok) {
			throw new Error(`Unable to fetch generated image URL (${response.status})`);
		}
		const bytes = await response.arrayBuffer();
		const b64 = Buffer.from(bytes).toString('base64');
		return `data:image/png;base64,${b64}`;
	}
	throw new Error('OpenAI image response is missing image payload');
};

export const buildPayloadPreview = (input: {
	prompt: string;
	size: ImageGenSize;
	n: number;
	templateImageDataUrl?: string;
}): OpenAiImagePayload => {
	const basePayload: Omit<OpenAiImagePayload, 'images'> = {
		model: IMAGE_GEN_MODEL,
		prompt: input.prompt,
		size: input.size,
		n: input.n
	};
	if (input.templateImageDataUrl?.startsWith('data:image/')) {
		return {
			...basePayload,
			images: [{ image_url: input.templateImageDataUrl }]
		};
	}
	return basePayload;
};

export const generateImagesWithOpenAi = async (input: {
	apiKey: string;
	prompt: string;
	size: ImageGenSize;
	n: number;
	templateImageDataUrl?: string;
}): Promise<{ payloadPreview: OpenAiImagePayload; dataUrls: string[] }> => {
	const payloadPreview = buildPayloadPreview(input);
	const endpoint = payloadPreview.images ? OPENAI_EDITS_ENDPOINT : OPENAI_GENERATIONS_ENDPOINT;

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${input.apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payloadPreview)
	});

	const json = (await response.json().catch(() => null)) as OpenAiImageResponse | null;
	if (!response.ok) {
		const message =
			json?.error?.message ??
			`OpenAI image generation failed with status ${response.status.toString()}`;
		throw new Error(message);
	}

	const data = Array.isArray(json?.data) ? json.data : [];
	const dataUrls = await Promise.all(data.map((entry) => toDataUrl(entry)));
	if (dataUrls.length === 0) {
		throw new Error('OpenAI returned no generated images');
	}

	return { payloadPreview, dataUrls };
};
