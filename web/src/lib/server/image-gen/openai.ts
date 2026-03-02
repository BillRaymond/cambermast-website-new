import { IMAGE_GEN_MODEL, type ImageGenSize } from '$lib/server/image-gen/types';
import { Buffer } from 'node:buffer';

type OpenAiImagePayload = {
	model: typeof IMAGE_GEN_MODEL;
	prompt: string;
	size: ImageGenSize;
	n: number;
	images: Array<{ image_url: string }>;
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

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/images/edits';

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
	templateImageDataUrl: string;
}): OpenAiImagePayload => ({
	model: IMAGE_GEN_MODEL,
	prompt: input.prompt,
	size: input.size,
	n: input.n,
	images: [{ image_url: input.templateImageDataUrl }]
});

export const generateImagesWithOpenAi = async (input: {
	apiKey: string;
	prompt: string;
	size: ImageGenSize;
	n: number;
	templateImageDataUrl: string;
}): Promise<{ payloadPreview: OpenAiImagePayload; dataUrls: string[] }> => {
	const payloadPreview = buildPayloadPreview(input);

	const response = await fetch(OPENAI_ENDPOINT, {
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
