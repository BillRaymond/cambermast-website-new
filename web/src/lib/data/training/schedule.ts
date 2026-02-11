import { getEventStartTimestamp, isEventUpcoming, listEvents } from '$lib/data/events';
import type { Event } from '$lib/data/events/types';
import { getTrainingProgramBySku } from '$lib/data/training';
import type { TrainingProgram } from '$lib/data/training/types';

export type TrainingScheduleEntry = {
	id: string;
	title: string;
	subtitle?: string;
	date: string;
	time?: string | string[];
	location: string;
	registerUrl?: string;
	registerLabel?: string;
	isHappeningNow: boolean;
	startTimestamp: number;
	endTimestamp: number;
	event: Event;
};

export type TrainingEventWithProgram = {
	program: TrainingProgram;
	entry: TrainingScheduleEntry;
};

const isRegisterable = (event: Event): boolean =>
	event.registrationStatus !== 'closed' &&
	event.registrationStatus !== 'none' &&
	event.registrationStatus !== 'sold_out' &&
	Boolean(event.registerUrl);

export const isTrainingEventHappeningNow = (
	event: Event,
	referenceTimestamp: number = Date.now()
): boolean => {
	if (event.type !== 'training_session') return false;
	if (event.lifecycleStatus === 'canceled' || event.lifecycleStatus === 'completed') return false;

	const startTimestamp = new Date(event.startAtUtc).valueOf();
	const fallbackEndTimestamp = Number.isFinite(startTimestamp) ? startTimestamp : Number.NaN;
	const endTimestamp = event.endAtUtc ? new Date(event.endAtUtc).valueOf() : fallbackEndTimestamp;

	return (
		Number.isFinite(startTimestamp) &&
		Number.isFinite(endTimestamp) &&
		startTimestamp <= referenceTimestamp &&
		endTimestamp >= referenceTimestamp
	);
};

export const toTrainingScheduleEntry = (
	event: Event,
	referenceTimestamp: number = Date.now()
): TrainingScheduleEntry => {
	const startTimestamp = getEventStartTimestamp(event);
	const endTimestamp = event.endAtUtc ? new Date(event.endAtUtc).valueOf() : startTimestamp;
	const canRegister = isRegisterable(event);
	const registerLabel = event.registerLabel || event.cta?.label || 'Register now';

	return {
		id: `${event.id}-${event.slug}`,
		title: event.title,
		subtitle: event.subtitle ?? event.tagline ?? undefined,
		date: event.date,
		time: event.time,
		location: event.location,
		registerUrl: canRegister ? event.registerUrl : undefined,
		registerLabel,
		isHappeningNow: isTrainingEventHappeningNow(event, referenceTimestamp),
		startTimestamp,
		endTimestamp,
		event
	};
};

export const listTrainingScheduleEntries = (
	options: { includeDrafts?: boolean; includeUnlisted?: boolean } = {},
	referenceTimestamp: number = Date.now()
): TrainingScheduleEntry[] =>
	listEvents(options)
		.filter((event) => event.type === 'training_session')
		.map((event) => toTrainingScheduleEntry(event, referenceTimestamp))
		.sort((a, b) => a.startTimestamp - b.startTimestamp);

export const listUpcomingTrainingScheduleEntries = (
	options: { includeDrafts?: boolean; includeUnlisted?: boolean } = {},
	today: Date = new Date(),
	referenceTimestamp: number = Date.now()
): TrainingScheduleEntry[] =>
	listEvents(options)
		.filter((event) => event.type === 'training_session')
		.filter((event) => isEventUpcoming(event, today))
		.map((event) => toTrainingScheduleEntry(event, referenceTimestamp))
		.filter((entry) => !entry.isHappeningNow)
		.sort((a, b) => a.startTimestamp - b.startTimestamp);

export const listHappeningTrainingScheduleEntries = (
	options: { includeDrafts?: boolean; includeUnlisted?: boolean } = {},
	referenceTimestamp: number = Date.now()
): TrainingScheduleEntry[] =>
	listEvents(options)
		.filter((event) => event.type === 'training_session')
		.map((event) => toTrainingScheduleEntry(event, referenceTimestamp))
		.filter((entry) => entry.isHappeningNow)
		.sort((a, b) => a.startTimestamp - b.startTimestamp);

export const listUpcomingTrainingEventsWithPrograms = (
	options: { includeDrafts?: boolean; includeUnlisted?: boolean } = {},
	today: Date = new Date(),
	referenceTimestamp: number = Date.now()
): TrainingEventWithProgram[] =>
	listUpcomingTrainingScheduleEntries(options, today, referenceTimestamp)
		.map((entry) => {
			const sku = entry.event.programRef?.sku;
			const program = sku ? getTrainingProgramBySku(sku) : undefined;
			return program ? { program, entry } : null;
		})
		.filter((value): value is TrainingEventWithProgram => value !== null);

export const listHappeningTrainingEventsWithPrograms = (
	options: { includeDrafts?: boolean; includeUnlisted?: boolean } = {},
	referenceTimestamp: number = Date.now()
): TrainingEventWithProgram[] =>
	listHappeningTrainingScheduleEntries(options, referenceTimestamp)
		.map((entry) => {
			const sku = entry.event.programRef?.sku;
			const program = sku ? getTrainingProgramBySku(sku) : undefined;
			return program ? { program, entry } : null;
		})
		.filter((value): value is TrainingEventWithProgram => value !== null);

export const listUpcomingTrainingEntriesForProgram = (
	programSku?: string,
	options: { includeDrafts?: boolean; includeUnlisted?: boolean } = {},
	today: Date = new Date(),
	referenceTimestamp: number = Date.now()
): TrainingScheduleEntry[] =>
	listUpcomingTrainingScheduleEntries(options, today, referenceTimestamp).filter(
		(entry) => entry.event.programRef?.sku === programSku
	);

export const listHappeningTrainingEntriesForProgram = (
	programSku?: string,
	options: { includeDrafts?: boolean; includeUnlisted?: boolean } = {},
	referenceTimestamp: number = Date.now()
): TrainingScheduleEntry[] =>
	listHappeningTrainingScheduleEntries(options, referenceTimestamp).filter(
		(entry) => entry.event.programRef?.sku === programSku
	);
