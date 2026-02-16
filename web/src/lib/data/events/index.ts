import { dev } from '$app/environment';
import eventsData from './events.json';
import type {
	Event,
	EventSource,
	EventLifecycleStatus,
	EventRegistrationStatus,
	EventType,
	EventVisibility
} from './types';

type ListEventsOptions = {
	includeDrafts?: boolean;
	includeUnlisted?: boolean;
};

const PACIFIC_TIME_ZONE = 'America/Los_Angeles';

const events = (eventsData.events ?? []) as EventSource[];

const DEFAULT_TYPE_LABELS: Record<string, string> = {
	training_session: 'Training session',
	webinar: 'Webinar',
	conference_talk: 'Conference talk',
	community: 'Community',
	workshop: 'Workshop',
	talk: 'Talk',
	panel: 'Panel',
	roundtable: 'Roundtable',
	fireside: 'Fireside',
	event: 'Event',
	other: 'Other'
};

const pacificDateFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: PACIFIC_TIME_ZONE,
	month: 'long',
	day: 'numeric',
	year: 'numeric'
});

const withDefault = <T>(value: T | undefined, fallback: T): T =>
	value === undefined ? fallback : value;

const coerceVisibility = (event: EventSource): EventVisibility => {
	return withDefault(event.visibility, 'public');
};

const coerceLifecycleStatus = (value?: EventLifecycleStatus): EventLifecycleStatus =>
	withDefault(value, 'scheduled');

const coerceRegistrationStatus = (event: EventSource): EventRegistrationStatus => {
	if (event.registrationStatus) return event.registrationStatus;
	const ctaUrl = event.cta?.url;
	if (!ctaUrl) return 'none';
	return /^https?:\/\//i.test(ctaUrl) ? 'external' : 'open';
};

const toTimestamp = (value?: string): number => {
	if (!value) return Number.NaN;
	const parsed = new Date(value);
	return parsed.valueOf();
};

const toPacificDateLabel = (value: string): string => {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.valueOf())) return value;
	return pacificDateFormatter.format(parsed);
};

const toTypeLabel = (type: EventType, typeLabel?: string): string => {
	const trimmed = typeLabel?.trim();
	if (trimmed) return trimmed;
	if (DEFAULT_TYPE_LABELS[type]) return DEFAULT_TYPE_LABELS[type];
	return type.charAt(0).toUpperCase() + type.slice(1);
};

const resolveEvent = (event: EventSource): Event => {
	const startAtUtc = event.startAtUtc;
	const endAtUtc = event.endAtUtc;
	const visibility = coerceVisibility(event);
	const lifecycleStatus = coerceLifecycleStatus(event.lifecycleStatus);
	const registrationStatus = coerceRegistrationStatus(event);
	const ctaLabel = event.cta?.label ?? 'Register';
	const ctaUrl = event.cta?.url ?? '';
	const typeLabel = toTypeLabel(event.type, event.typeLabel);

	return {
		...event,
		startAtUtc,
		endAtUtc,
		visibility,
		lifecycleStatus,
		registrationStatus,
		cta: {
			label: ctaLabel,
			url: ctaUrl || undefined,
			campaignId: event.cta?.campaignId
		},
		locationMeta: event.location,
		location: event.location.publicLabel,
		typeLabel,
		date: event.date ?? toPacificDateLabel(startAtUtc),
		time: event.time,
		timezone: event.timezone ?? 'PT'
	};
};

const resolvedEvents = events.map(resolveEvent);

const isVisible = (
	event: Event,
	options: { includeDrafts: boolean; includeUnlisted: boolean }
): boolean => {
	if (event.visibility === 'public') return true;
	if (event.visibility === 'unlisted') return options.includeUnlisted || options.includeDrafts;
	return options.includeDrafts;
};

export const listEvents = (options: ListEventsOptions = {}): Event[] => {
	const { includeDrafts = dev, includeUnlisted = false } = options;
	return resolvedEvents.filter((event) => isVisible(event, { includeDrafts, includeUnlisted }));
};

export const getEvent = (slug: string, options: ListEventsOptions = {}): Event | undefined =>
	listEvents({ includeDrafts: true, ...options }).find((event) => event.slug === slug);

export const isEventDraft = (event: Event): boolean => event.visibility === 'draft';

export const isEventUpcoming = (
	event: Event,
	today: Date = new Date(),
	options: ListEventsOptions = {}
): boolean => {
	const { includeDrafts = dev, includeUnlisted = false } = options;
	if (!isVisible(event, { includeDrafts, includeUnlisted })) return false;
	if (event.lifecycleStatus === 'canceled' || event.lifecycleStatus === 'completed') return false;
	const start = toTimestamp(event.startAtUtc);
	if (Number.isNaN(start)) return false;
	const end = toTimestamp(event.endAtUtc) || start;
	return end >= today.getTime();
};

export const getEventStartTimestamp = (event: Event): number => {
	const timestamp = toTimestamp(event.startAtUtc);
	return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

export const getEventTypeLabel = (event: Event): string => event.typeLabel;

export const getEventRegistrationUrl = (
	event: Pick<Event, 'campaignId' | 'cta'>
): string | undefined => {
	const campaignId = event.campaignId ?? event.cta?.campaignId;
	if (campaignId) return `/c/${campaignId}`;
	return event.cta?.url;
};

export {
	buildTrainingSessionEventFromProgram,
	buildTrainingSessionEventFromProgramSku,
	buildTrainingDraftScheduleFromProgram,
	buildTrainingDraftScheduleFromProgramSku
} from './training-event-builder';
