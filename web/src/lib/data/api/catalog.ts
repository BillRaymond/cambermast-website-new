import catalog from '$lib/data/catalog.json';
import { listTrainingPrograms } from '$lib/data/training';

type BuildCatalogApiPayloadInput = {
	origin: string;
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

export const buildCatalogApiPayload = ({ origin }: BuildCatalogApiPayloadInput) => {
	const trainingPrograms = listTrainingPrograms().map((program) => {
		const { sessions, ...programWithoutSchedule } = program;
		return programWithoutSchedule;
	});

	return {
		catalog: mapUrlsToAbsolute(catalog, origin),
		trainingPrograms: mapUrlsToAbsolute(trainingPrograms, origin)
	};
};

export const buildCatalogApiExamples = (origin: string) => {
	const payload = buildCatalogApiPayload({ origin });
	const first = Array.isArray(payload.trainingPrograms)
		? ((payload.trainingPrograms as Array<Record<string, unknown>>).at(0) ?? null)
		: null;
	return {
		response: payload,
		example:
			first && Array.isArray(payload.trainingPrograms)
				? {
						catalog: payload.catalog,
						trainingPrograms: [first]
					}
				: payload,
		partnerExample: null
	};
};
