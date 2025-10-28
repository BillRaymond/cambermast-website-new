import { normalizeToday } from '$lib/data/training/session-utils';

export type ExternalEvent = {
	id: string;
	title: string;
	sessionLabel?: string;
	date: string;
	timeLines: string[];
	location?: string;
	partner?: string;
	spots?: string;
	registerUrl: string;
	image?: string;
	imageAlt?: string;
	imageAspect?: 'wide' | 'square';
	startAt: string;
	endAt?: string;
	draft?: boolean;
};

const externalEvents: ExternalEvent[] = [
	{
		id: 'evt-OuDQEPAM8sx9feB',
		title: 'Introducing ChatGPT Atlas',
		sessionLabel: 'Live webinar • Demo & Q&A',
		date: 'October 29, 2025',
		timeLines: ['1:00 PM – 2:00 PM PT', 'Zoom webinar'],
		location: 'Virtual (Zoom)',
		spots: 'Free registration',
		registerUrl: 'https://luma.com/xhe620ie',
		image: 'https://images.lumacdn.com/event-covers/7h/eaed03b4-ebf3-40de-bc19-79444c1d671e.png',
		imageAlt: 'Introducing ChatGPT Atlas webinar cover art',
		imageAspect: 'square',
		startAt: '2025-10-29T20:00:00.000Z',
		endAt: '2025-10-29T21:00:00.000Z'
	},
	{
		id: 'evt-c3QdiejUu18IB5Y',
		title: 'AI Automations – From Idea to Impact',
		sessionLabel: 'Hands-on workshop • Build your first workflow',
		date: 'November 21, 2025',
		timeLines: ['9:00 AM – 12:00 PM PST', 'In-person session'],
		location: 'San Francisco, CA',
		partner: 'Jennifer Hufnagel',
		spots: '12 seats remaining',
		registerUrl: 'https://luma.com/1u9yp7wj',
		image: 'https://images.lumacdn.com/event-covers/1q/b4ebc9c1-045b-4224-b1b8-deb4efcf542e.webp',
		imageAlt: 'AI Automations workshop cover art',
		imageAspect: 'square',
		startAt: '2025-11-21T17:00:00.000Z',
		endAt: '2025-11-21T20:00:00.000Z'
	}
];

const toNormalizedTimestamp = (value: string): number => {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.valueOf())) return Number.NaN;
	const normalized = new Date(parsed);
	normalized.setHours(0, 0, 0, 0);
	return normalized.getTime();
};

export const listExternalEvents = (): ExternalEvent[] => externalEvents;

export const isExternalEventDraft = (event: ExternalEvent): boolean => Boolean(event.draft);

export const isExternalEventUpcoming = (
	event: ExternalEvent,
	today: Date = normalizeToday()
): boolean => {
	if (isExternalEventDraft(event)) return false;
	const start = toNormalizedTimestamp(event.startAt);
	if (Number.isNaN(start)) return false;
	const end = event.endAt ? toNormalizedTimestamp(event.endAt) : start;
	return end >= today.getTime();
};

export const getExternalEventStartTimestamp = (event: ExternalEvent): number => {
	const parsed = new Date(event.startAt);
	const timestamp = parsed.valueOf();
	return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};
