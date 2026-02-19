import {
	getEventRegistrationUrl,
	getEventStartTimestamp,
	isEventUpcoming,
	listEvents
} from '$lib/data/events';
import { toConciseEventTimeLabel } from '$lib/data/events/session-labels';
import { getEventOccurrenceState, getEventSessionBounds } from '$lib/data/events/timeline';
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
	statusLabel?: string;
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

const formatCountdown = (diffMs: number): string => {
	const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
	const seconds = totalSeconds % 60;
	const totalMinutes = Math.floor(totalSeconds / 60);
	const minutes = totalMinutes % 60;
	const totalHours = Math.floor(totalMinutes / 60);
	const hours = totalHours % 24;
	const days = Math.floor(totalHours / 24);
	const pad = (value: number) => value.toString().padStart(2, '0');
	if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	if (minutes > 0) return `${pad(minutes)}:${pad(seconds)}`;
	return `${seconds}s`;
};

const getStatusLabel = (
	input: {
		startTimestamp: number;
		referenceTimestamp: number;
		canRegister: boolean;
		isTrainingInProgress: boolean;
	}
): string | undefined => {
	if (input.isTrainingInProgress) return 'Enrollment closed';
	if (!input.canRegister) return 'Enrollment closed';
	const diffMs = input.startTimestamp - input.referenceTimestamp;
	if (diffMs <= 0) return undefined;
	return `Starts in ${formatCountdown(diffMs)}`;
};

const isRegisterable = (event: Event): boolean =>
	event.registrationStatus !== 'closed' &&
	event.registrationStatus !== 'none' &&
	event.registrationStatus !== 'sold_out' &&
	Boolean(event.cta?.url);

export const isTrainingEventHappeningNow = (
	event: Event,
	referenceTimestamp: number = Date.now()
): boolean => {
	if (event.type !== 'training_session') return false;
	if (event.lifecycleStatus === 'canceled' || event.lifecycleStatus === 'completed') return false;
	return getEventOccurrenceState(event, referenceTimestamp).isInProgress;
};

export const toTrainingScheduleEntry = (
	event: Event,
	referenceTimestamp: number = Date.now()
): TrainingScheduleEntry => {
	const startTimestamp = getEventStartTimestamp(event);
	const endTimestamp = getEventSessionBounds(event)?.endTimestamp ?? startTimestamp;
	const canRegister = isRegisterable(event);
	const registerLabel = event.cta?.label || 'Register now';
	const isTrainingInProgress = isTrainingEventHappeningNow(event, referenceTimestamp);
	const statusLabel = getStatusLabel({
		startTimestamp,
		referenceTimestamp,
		canRegister,
		isTrainingInProgress
	});

	return {
		id: `${event.id}-${event.slug}`,
		title: event.title,
		subtitle: event.subtitle ?? event.tagline ?? undefined,
		date: event.date,
		time: toConciseEventTimeLabel(event.time),
		location: event.location,
		statusLabel,
		registerUrl: canRegister ? getEventRegistrationUrl(event) : undefined,
		registerLabel,
		isHappeningNow: isTrainingInProgress,
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
