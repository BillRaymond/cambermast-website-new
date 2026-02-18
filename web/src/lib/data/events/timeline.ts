import type { Event, EventSession } from './types';

export type NormalizedEventSession = EventSession & {
	startTimestamp: number;
	endTimestamp: number;
};

export type EventSessionBounds = {
	startAtUtc: string;
	endAtUtc: string;
	startTimestamp: number;
	endTimestamp: number;
};

export type EventOccurrenceState = {
	hasStarted: boolean;
	hasEnded: boolean;
	isHappeningNow: boolean;
	isInProgress: boolean;
	nextSessionStartTimestamp?: number;
	currentSessionEndTimestamp?: number;
	sessionsCount: number;
};

const toTimestamp = (value: string): number => new Date(value).valueOf();

export const normalizeEventSessions = (sessions: EventSession[]): NormalizedEventSession[] =>
	sessions
		.map((session) => {
			const startTimestamp = toTimestamp(session.startAtUtc);
			const endTimestamp = toTimestamp(session.endAtUtc);
			return {
				...session,
				startTimestamp,
				endTimestamp
			};
		})
		.filter(
			(session) =>
				Number.isFinite(session.startTimestamp) &&
				Number.isFinite(session.endTimestamp) &&
				session.endTimestamp >= session.startTimestamp
		)
		.sort((a, b) => a.startTimestamp - b.startTimestamp);

export const getEventSessionBounds = (event: Pick<Event, 'sessions'>): EventSessionBounds | undefined => {
	const sessions = normalizeEventSessions(event.sessions ?? []);
	if (sessions.length === 0) return undefined;
	const first = sessions[0];
	const endTimestamp = sessions.reduce(
		(maxTimestamp, session) => Math.max(maxTimestamp, session.endTimestamp),
		first.endTimestamp
	);
	const endSession = sessions.find((session) => session.endTimestamp === endTimestamp) ??
		sessions[sessions.length - 1];

	return {
		startAtUtc: first.startAtUtc,
		endAtUtc: endSession.endAtUtc,
		startTimestamp: first.startTimestamp,
		endTimestamp
	};
};

export const getEventOccurrenceState = (
	event: Pick<Event, 'sessions'>,
	referenceTimestamp: number = Date.now()
): EventOccurrenceState => {
	const sessions = normalizeEventSessions(event.sessions ?? []);
	if (!sessions.length) {
		return {
			hasStarted: false,
			hasEnded: false,
			isHappeningNow: false,
			isInProgress: false,
			sessionsCount: 0
		};
	}

	const bounds = getEventSessionBounds(event);
	if (!bounds) {
		return {
			hasStarted: false,
			hasEnded: false,
			isHappeningNow: false,
			isInProgress: false,
			sessionsCount: sessions.length
		};
	}

	const currentSession = sessions.find(
		(session) =>
			session.startTimestamp <= referenceTimestamp && session.endTimestamp >= referenceTimestamp
	);
	const nextSession = sessions.find((session) => session.startTimestamp > referenceTimestamp);
	const hasStarted = bounds.startTimestamp <= referenceTimestamp;
	const hasEnded = bounds.endTimestamp < referenceTimestamp;
	const isHappeningNow = Boolean(currentSession);

	return {
		hasStarted,
		hasEnded,
		isHappeningNow,
		isInProgress: hasStarted && !hasEnded,
		nextSessionStartTimestamp: nextSession?.startTimestamp,
		currentSessionEndTimestamp: currentSession?.endTimestamp,
		sessionsCount: sessions.length
	};
};
