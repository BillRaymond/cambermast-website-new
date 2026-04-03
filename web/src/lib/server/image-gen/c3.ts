import type { MinioUploadResult } from '$lib/server/image-gen/types';
import { Buffer } from 'node:buffer';
import { getC3ApiBase } from '$lib/utils/storage-urls';

const toErrorText = (value: unknown): string => {
	if (typeof value === 'string') return value;
	if (value instanceof Error) return value.message;
	if (value === null || value === undefined) return '';
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
};

export const uploadToC3 = async (input: {
	apiKey: string;
	apiBase: string;
	key: string;
	dataUrl: string;
}): Promise<MinioUploadResult> => {
	const [meta, base64] = input.dataUrl.split(',');
	if (!meta || !base64 || !meta.includes(';base64')) {
		throw new Error('Invalid data URL format for C3 upload');
	}

	const mime = meta.replace(/^data:/, '').replace(/;base64$/, '') || 'image/png';
	const ext = mime.includes('jpeg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
	const bytes = Buffer.from(base64, 'base64');
	const fileName = input.key.split('/').pop() ?? `candidate.${ext}`;
	return uploadBytesToC3({
		apiBase: input.apiBase,
		apiKey: input.apiKey,
		key: input.key,
		bytes,
		contentType: mime,
		fileName
	});
};

export const uploadBytesToC3 = async (input: {
	apiKey: string;
	apiBase: string;
	key: string;
	bytes: Uint8Array;
	contentType: string;
	fileName: string;
}): Promise<MinioUploadResult> => {
	const form = new FormData();
	form.append('key', input.key);
	form.append(
		'file',
		new Blob([Buffer.from(input.bytes)], { type: input.contentType }),
		input.fileName
	);

	const response = await fetch(`${getC3ApiBase(input.apiBase)}/upload`, {
		method: 'POST',
		headers: {
			'X-C3-API-Key': input.apiKey
		},
		body: form
	});

	const json = (await response.json().catch(() => null)) as
		| {
				key?: string;
				url?: string;
				error?: unknown;
				message?: unknown;
		  }
		| null;

	if (!response.ok) {
		const messageText = toErrorText(json?.message);
		const errorText = toErrorText(json?.error);
		const detail = messageText || errorText || 'No response body';
		throw new Error(`C3 upload failed (${response.status.toString()}): ${detail}`);
	}

	return {
		key: json?.key ?? input.key,
		url: json?.url
	};
};
