import { listTrainingPrograms } from '$lib/data/training';

type BuildTrainingApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

const isAbsoluteUrl = (value: string): boolean =>
	/^https?:\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('tel:');

const toAbsoluteUrl = (value: string, origin: string): string => {
	if (isAbsoluteUrl(value)) return value;
	if (value.startsWith('/')) return `${origin}${value}`;
	return value;
};

const mapUrlsToAbsolute = (value: unknown, origin: string): unknown => {
	if (typeof value === 'string') {
		return toAbsoluteUrl(value, origin);
	}

	if (Array.isArray(value)) {
		return value.map((entry) => mapUrlsToAbsolute(entry, origin));
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
				key,
				mapUrlsToAbsolute(nestedValue, origin)
			])
		);
	}

	return value;
};

export const buildTrainingApiPayload = ({ origin, generatedAt }: BuildTrainingApiPayloadInput) => ({
	generatedAt: generatedAt ?? new Date().toISOString(),
	programs: mapUrlsToAbsolute(listTrainingPrograms(), origin) as ReturnType<typeof listTrainingPrograms>
});

export const buildTrainingApiExamples = (origin: string) => {
	const payload = buildTrainingApiPayload({ origin, generatedAt: '2026-02-14T17:00:00.000Z' });
	const first = payload.programs.at(0) ?? null;
	return {
		response: payload,
		example: first ? { generatedAt: payload.generatedAt, programs: [first] } : payload
	};
};
