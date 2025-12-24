import type { TrainingSession } from './types';

export const isSessionDraft = (session: TrainingSession): boolean => Boolean(session.draft);

const toNormalizedTimestamp = (value?: string): number | undefined => {
	if (!value) return undefined;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.valueOf())) return undefined;
	const normalized = new Date(parsed);
	normalized.setHours(0, 0, 0, 0);
	return normalized.getTime();
};

const toTimestamp = (value?: string): number | undefined => {
	if (!value) return undefined;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.valueOf())) return undefined;
	return parsed.getTime();
};

export const normalizeToday = (reference: Date = new Date()): Date => {
	const normalized = new Date(reference);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
};

export const hasExternalRegistration = (session: TrainingSession): boolean =>
	isExternalUrl(session.registerUrl);

export const isExternalUrl = (url?: string): boolean => /^https?:\/\//i.test(url ?? '');

export const isSessionUpcoming = (
	session: TrainingSession,
	today: Date = normalizeToday()
): boolean => {
	if (isSessionDraft(session)) return false;
	const todayValue = today.getTime();
	const startValue = toNormalizedTimestamp(session.startDate);
	if (startValue === undefined) return false;
	const endValue = toNormalizedTimestamp(session.endDate) ?? startValue;
	return endValue >= todayValue;
};

export const isSessionHappeningNow = (
	session: TrainingSession,
	today: Date = normalizeToday()
): boolean => {
	if (isSessionDraft(session)) return false;
	const todayValue = today.getTime();
	const startValue = toNormalizedTimestamp(session.startDate);
	if (startValue === undefined) return false;
	if (startValue > todayValue) return false;
	const endValue = toNormalizedTimestamp(session.endDate) ?? startValue;
	return endValue >= todayValue;
};

export const filterUpcomingSessions = (
	sessions: TrainingSession[],
	today: Date = normalizeToday()
): TrainingSession[] => sessions.filter((session) => isSessionUpcoming(session, today));

export const getSessionStartTimestamp = (session: TrainingSession): number =>
	toTimestamp(session.startDate) ?? Number.POSITIVE_INFINITY;
