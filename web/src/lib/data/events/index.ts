import { dev } from '$app/environment';
import { normalizeToday } from '$lib/data/training/session-utils';
import eventsData from './events.json';
import type { Event } from './types';

type ListEventsOptions = {
	includeDrafts?: boolean;
};

const events = (eventsData.events ?? []) as Event[];

export const listEvents = (options: ListEventsOptions = {}): Event[] => {
	const { includeDrafts = dev } = options;
	return includeDrafts ? [...events] : events.filter((event) => !event.draft);
};

export const getEvent = (slug: string, options: ListEventsOptions = {}): Event | undefined =>
	listEvents({ includeDrafts: true, ...options }).find((event) => event.slug === slug);

export const isEventDraft = (event: Event): boolean => Boolean(event.draft);

const toNormalizedTimestamp = (value: string): number => {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.valueOf())) return Number.NaN;
	const normalized = new Date(parsed);
	normalized.setHours(0, 0, 0, 0);
	return normalized.getTime();
};

export const isEventUpcoming = (
	event: Event,
	today: Date = normalizeToday(),
	options: ListEventsOptions = {}
): boolean => {
	const { includeDrafts = dev } = options;
	if (isEventDraft(event) && !includeDrafts) return false;
	const start = toNormalizedTimestamp(event.startAt);
	if (Number.isNaN(start)) return false;
	const end = event.endAt ? toNormalizedTimestamp(event.endAt) : start;
	return end >= today.getTime();
};

export const getEventStartTimestamp = (event: Event): number => {
	const parsed = new Date(event.startAt);
	const timestamp = parsed.valueOf();
	return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

export const getEventTypeLabel = (event: Event): string => {
	const trimmed = event.typeLabel?.trim();
	if (trimmed) return trimmed;
	return event.type.charAt(0).toUpperCase() + event.type.slice(1);
};
