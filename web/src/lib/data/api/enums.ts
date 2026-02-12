import eventsSchema from '$lib/data/events/events.schema.json';
import campaignsSchema from '$lib/data/campaigns.schema.json';
import { listPartners } from '$lib/data/partners';

type JsonObject = Record<string, unknown>;

type BuildEnumsApiPayloadInput = {
	generatedAt?: string;
};

const getAtPath = (obj: unknown, path: string[]): unknown =>
	path.reduce<unknown>((acc, key) => {
		if (!acc || typeof acc !== 'object') return undefined;
		return (acc as JsonObject)[key];
	}, obj);

const getEnum = (obj: unknown, path: string[]): string[] => {
	const value = getAtPath(obj, path);
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is string => typeof entry === 'string');
};

const getString = (obj: unknown, path: string[]): string | undefined => {
	const value = getAtPath(obj, path);
	return typeof value === 'string' ? value : undefined;
};

export const buildEnumsApiPayload = ({ generatedAt }: BuildEnumsApiPayloadInput = {}) => ({
	generatedAt: generatedAt ?? new Date().toISOString(),
	enums: {
		eventVisibility: getEnum(eventsSchema, ['$defs', 'event', 'properties', 'visibility', 'enum']),
		eventLifecycleStatus: getEnum(eventsSchema, [
			'$defs',
			'event',
			'properties',
			'lifecycleStatus',
			'enum'
		]),
		eventRegistrationStatus: getEnum(eventsSchema, [
			'$defs',
			'event',
			'properties',
			'registrationStatus',
			'enum'
		]),
		eventLocationMode: getEnum(eventsSchema, [
			'$defs',
			'event',
			'properties',
			'location',
			'properties',
			'mode',
			'enum'
		]),
		eventLocationDetailsVisibility: getEnum(eventsSchema, [
			'$defs',
			'event',
			'properties',
			'location',
			'properties',
			'detailsVisibility',
			'enum'
		])
	},
	patterns: {
		eventId: getString(eventsSchema, ['$defs', 'event', 'properties', 'id', 'pattern']),
		eventSlug: getString(eventsSchema, ['$defs', 'event', 'properties', 'slug', 'pattern']),
		campaignId: getString(campaignsSchema, ['$defs', 'campaign', 'properties', 'id', 'pattern']),
		utmContent: getString(campaignsSchema, [
			'$defs',
			'campaign',
			'properties',
			'params',
			'properties',
			'utm_content',
			'pattern'
		]),
		partnerCode: getString(eventsSchema, ['$defs', 'event', 'properties', 'partnerCode', 'pattern'])
	},
	knownPartnerCodes: listPartners().map((partner) => partner.code)
});

export const buildEnumsApiExamples = () => {
	const payload = buildEnumsApiPayload({ generatedAt: '2026-02-12T18:15:00.000Z' });
	return {
		response: payload,
		example: payload,
		partnerExample: null
	};
};
