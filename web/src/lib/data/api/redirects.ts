import { listRedirects } from '$lib/data/redirects';

type BuildRedirectsApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

const toAbsoluteUrl = (value: string, origin: string): string => `${origin}${value}`;

const toApiRedirect = (entry: ReturnType<typeof listRedirects>[number], origin: string) => ({
	sourcePath: entry.sourcePath,
	sourceUrl: toAbsoluteUrl(entry.sourcePath, origin),
	targetPath: entry.targetPath,
	targetUrl: toAbsoluteUrl(entry.targetPath, origin),
	statusCode: entry.statusCode,
	enabled: entry.enabled,
	category: entry.category,
	notes: entry.notes
});

export const buildRedirectsApiPayload = ({ origin, generatedAt }: BuildRedirectsApiPayloadInput) => ({
	generatedAt: generatedAt ?? new Date().toISOString(),
	redirects: listRedirects({ includeDisabled: true }).map((entry) => toApiRedirect(entry, origin))
});

export const buildRedirectsApiExamples = (origin: string) => {
	const payload = buildRedirectsApiPayload({
		origin,
		generatedAt: '2026-03-11T12:00:00.000Z'
	});
	const first = payload.redirects.at(0) ?? null;

	return {
		response: payload,
		example: first ? { generatedAt: payload.generatedAt, redirects: [first] } : payload
	};
};
