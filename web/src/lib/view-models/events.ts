import type { Event } from '$lib/data/events/types';
import {
	getEvent,
	isEventOpenSoon,
	getEventRegistrationUrl,
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
		labelWithPrice: string;
		url?: string;
		campaignId?: string;
	};
};

const usdFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
	maximumFractionDigits: 2
});

const getPriceBadgeLabel = (event: Event): string | undefined => {
	const amountUsd = event.ticketing?.amountUsd;
	if (!Number.isFinite(amountUsd) || amountUsd === undefined || amountUsd < 0) return undefined;
	if (amountUsd === 0) return 'Free';
	return usdFormatter.format(amountUsd);
};

const withPricingInRegisterLabel = (registerLabel: string, event: Event): string => {
	const trimmed = registerLabel.trim();
	if (!trimmed) return registerLabel;
	if (!/^register\b/i.test(trimmed)) return registerLabel;
	if (/\$\d|free/i.test(trimmed)) return registerLabel;
	const priceBadgeLabel = getPriceBadgeLabel(event);
	if (!priceBadgeLabel) return registerLabel;
	if (priceBadgeLabel === 'Free') {
		if (/^register now$/i.test(trimmed)) return 'Register free';
		return `${registerLabel} · Free`;
	}
	return `${registerLabel} · ${priceBadgeLabel}`;
};

export const toEventUiModel = (event: Event): EventUiModel => {
	const location = event.locationMeta?.publicLabel ?? event.location ?? 'TBD';
	const ctaUrl = getEventRegistrationUrl(event)?.trim() || undefined;
	const preferredLabel = event.cta?.label?.trim();
	const ctaLabel = preferredLabel
		? preferredLabel
		: isEventOpenSoon(event)
			? 'Open soon'
			: ctaUrl
				? 'Register now'
				: 'Enrollment closed';

	return {
		...event,
		title: event.title?.trim() || 'Untitled event',
		summary: event.summary?.trim() || '',
		location,
		cta: {
			label: ctaLabel,
			labelWithPrice: withPricingInRegisterLabel(ctaLabel, event),
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

export const isEventOpenSoonUi = (event: Event, referenceTimestamp?: number): boolean =>
	isEventOpenSoon(event, referenceTimestamp);
