import eventsData from './events.json';
import { runtimeDev } from '$lib/utils/runtime-env';
import { deriveEventDateLabel, deriveEventTimeLabel } from './session-labels';
import { deriveEventScheduleFromSessions, getEventSessionBounds } from './timeline';
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

const withDefault = <T>(value: T | undefined, fallback: T): T =>
	value === undefined ? fallback : value;

const isLumaHostname = (hostname: string): boolean => {
	const normalized = hostname.trim().toLowerCase();
	return (
		normalized === 'luma.com' ||
		normalized === 'www.luma.com' ||
		normalized === 'lu.ma' ||
		normalized === 'www.lu.ma'
	);
};

export const isLumaRegistrationUrl = (url: string): boolean => {
	if (!/^https?:\/\//i.test(url)) return false;
	try {
		return isLumaHostname(new URL(url).hostname);
	} catch {
		return false;
	}
};

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

const toTypeLabel = (type: EventType, typeLabel?: string): string => {
	const trimmed = typeLabel?.trim();
	if (trimmed) return trimmed;
	if (DEFAULT_TYPE_LABELS[type]) return DEFAULT_TYPE_LABELS[type];
	return type.charAt(0).toUpperCase() + type.slice(1);
};

const toPublicLocationLabel = (event: EventSource): string => {
	if (event.type === 'training_session' && event.location.mode === 'online') return 'Online';
	return event.location.publicLabel;
};

const resolveEvent = (event: EventSource): Event => {
	const bounds = getEventSessionBounds(event);
	const startAtUtc = bounds?.startAtUtc ?? event.sessions[0]?.startAtUtc ?? '';
	const endAtUtc = bounds?.endAtUtc ?? event.sessions[event.sessions.length - 1]?.endAtUtc ?? startAtUtc;
	const visibility = coerceVisibility(event);
	const lifecycleStatus = coerceLifecycleStatus(event.lifecycleStatus);
	const registrationStatus = coerceRegistrationStatus(event);
	const ctaLabel = event.cta?.label ?? 'Register now';
	const ctaUrl = event.cta?.url ?? '';
	const typeLabel = toTypeLabel(event.type, event.typeLabel);
	const timeZoneIana = event.timeZoneIana ?? PACIFIC_TIME_ZONE;
	const timezoneLabel = 'PT';

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
			campaignId: event.cta?.campaignId ?? event.campaignId
		},
		locationMeta: event.location,
		location: toPublicLocationLabel(event),
		typeLabel,
		date: deriveEventDateLabel(event.sessions, timeZoneIana),
		time: deriveEventTimeLabel(event.sessions, timeZoneIana, timezoneLabel),
		timezone: timezoneLabel,
		timeZoneIana,
		schedule: event.schedule ?? deriveEventScheduleFromSessions(event.sessions)
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
	const { includeDrafts = runtimeDev, includeUnlisted = false } = options;
	return resolvedEvents.filter((event) => isVisible(event, { includeDrafts, includeUnlisted }));
};

export const getEvent = (slug: string, options: ListEventsOptions = {}): Event | undefined =>
	listEvents({ includeDrafts: true, ...options }).find((event) => event.slug === slug);

export const isEventDraft = (event: Event): boolean => event.visibility === 'draft';

export const isEventUpcoming = (
	event: Event,
	today: Date = new Date(),
	options: ListEventsOptions = {},
	referenceTimestamp: number = Date.now()
): boolean => {
	const { includeDrafts = runtimeDev, includeUnlisted = false } = options;
	if (!isVisible(event, { includeDrafts, includeUnlisted })) return false;
	if (event.lifecycleStatus === 'canceled' || event.lifecycleStatus === 'completed') return false;
	const start = toTimestamp(event.startAtUtc);
	if (Number.isNaN(start)) return false;
	const end = toTimestamp(event.endAtUtc) || start;
	const cutoffTimestamp = Math.max(today.getTime(), referenceTimestamp);
	return end >= cutoffTimestamp;
};

export const getEventStartTimestamp = (event: Event): number => {
	const timestamp = toTimestamp(event.startAtUtc);
	return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

export const getEventTypeLabel = (event: Event): string => event.typeLabel;

export const isEventOpenSoon = (
	event: Pick<Event, 'registrationStatus' | 'cta' | 'lifecycleStatus' | 'startAtUtc' | 'endAtUtc'>,
	referenceTimestamp: number = Date.now()
): boolean => {
	if (event.registrationStatus !== 'none') return false;
	if (event.cta?.url?.trim()) return false;
	if (event.lifecycleStatus !== 'scheduled' && event.lifecycleStatus !== 'postponed') return false;
	const startTimestamp = toTimestamp(event.startAtUtc);
	if (Number.isNaN(startTimestamp)) return false;
	return startTimestamp >= referenceTimestamp;
};

export const getEventRegistrationUrl = (
	event: Pick<Event, 'campaignId' | 'cta'>
): string | undefined => {
	const ctaUrl = event.cta?.url?.trim();
	if (ctaUrl && isLumaRegistrationUrl(ctaUrl)) return ctaUrl;
	return undefined;
};

export {
	buildTrainingSessionEventFromProgram,
	buildTrainingSessionEventFromProgramSku,
	buildTrainingDraftScheduleFromProgram,
	buildTrainingDraftScheduleFromProgramSku
} from './training-event-builder';
