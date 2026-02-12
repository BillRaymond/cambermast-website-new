import type { Event } from '$lib/data/events/types';
import {
	getEvent,
	getEventStartTimestamp,
	getEventTypeLabel,
	isEventUpcoming,
	listEvents
} from '$lib/data/events';

export type EventUiModel = Event & {
	title: string;
	summary: string;
	location: string;
	cta: {
		label: string;
		url?: string;
		campaignId?: string;
	};
};

export const toEventUiModel = (event: Event): EventUiModel => {
	const location = event.locationMeta?.publicLabel ?? event.location ?? 'TBD';
	const ctaLabel =
		event.cta?.label?.trim() || event.registerLabel?.trim() || 'Registration unavailable';
	const ctaUrl = event.cta?.url?.trim() || event.registerUrl?.trim() || undefined;

	return {
		...event,
		title: event.title?.trim() || 'Untitled event',
		summary: event.summary?.trim() || '',
		location,
		cta: {
			label: ctaLabel,
			url: ctaUrl,
			campaignId: event.cta?.campaignId ?? event.campaignId
		}
	};
};

export const toEventUiList = (events: Event[]): EventUiModel[] => events.map(toEventUiModel);

type ListEventsOptions = Parameters<typeof listEvents>[0];

export const listEventUi = (options: ListEventsOptions = {}): EventUiModel[] =>
	toEventUiList(listEvents(options));

export const getEventUi = (
	slug: string,
	options: ListEventsOptions = {}
): EventUiModel | undefined => {
	const event = getEvent(slug, options);
	return event ? toEventUiModel(event) : undefined;
};

export const isEventUpcomingUi = (
	event: Event,
	today: Date = new Date(),
	options: ListEventsOptions = {}
): boolean => isEventUpcoming(event, today, options);

export const getEventStartTimestampUi = (event: Event): number => getEventStartTimestamp(event);

export const getEventTypeLabelUi = (event: Event): string => getEventTypeLabel(event);
