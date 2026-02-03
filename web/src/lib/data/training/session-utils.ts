import type { TrainingSession } from './types';

export const isSessionDraft = (session: TrainingSession): boolean => Boolean(session.draft);

const parseDateValue = (value?: string): Date | undefined => {
	if (!value) return undefined;
	const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (isoDateMatch) {
		const [, year, month, day] = isoDateMatch;
		const localDate = new Date(
			Number.parseInt(year, 10),
			Number.parseInt(month, 10) - 1,
			Number.parseInt(day, 10)
		);
		return Number.isNaN(localDate.valueOf()) ? undefined : localDate;
	}
	const parsed = new Date(value);
	return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
};

const toNormalizedTimestamp = (value?: string): number | undefined => {
	const parsed = parseDateValue(value);
	if (!parsed) return undefined;
	const normalized = new Date(parsed);
	normalized.setHours(0, 0, 0, 0);
	return normalized.getTime();
};

const toTimestamp = (value?: string): number | undefined => {
	const parsed = parseDateValue(value);
	return parsed?.getTime();
};

const parseStartTime = (value?: string | string[]): { hours: number; minutes: number } | null => {
	if (!value) return null;
	const timeValue = Array.isArray(value) ? value[0] : value;
	const match = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i.exec(timeValue);
	if (!match) return null;
	let hours = Number.parseInt(match[1], 10);
	const minutes = Number.parseInt(match[2] ?? '0', 10);
	const meridiem = match[3]?.toLowerCase();
	if (meridiem === 'pm' && hours < 12) hours += 12;
	if (meridiem === 'am' && hours === 12) hours = 0;
	return { hours, minutes };
};

const PACIFIC_TIME_ZONE = 'America/Los_Angeles';

const getTimeZoneOffsetMinutes = (date: Date, timeZone: string): number => {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		timeZoneName: 'shortOffset',
		hour: '2-digit',
		minute: '2-digit'
	}).formatToParts(date);
	const tz = parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
	const match = /GMT([+-]\d{1,2})(?::(\d{2}))?/i.exec(tz);
	if (!match) return 0;
	const sign = match[1].startsWith('-') ? -1 : 1;
	const hours = Math.abs(Number.parseInt(match[1], 10));
	const minutes = Number.parseInt(match[2] ?? '0', 10);
	return sign * (hours * 60 + minutes);
};

const toPacificTimestamp = (value: {
	year: number;
	month: number;
	day: number;
	hours?: number;
	minutes?: number;
}): number => {
	const { year, month, day, hours = 0, minutes = 0 } = value;
	const utcGuess = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
	const offsetMinutes = getTimeZoneOffsetMinutes(new Date(utcGuess), PACIFIC_TIME_ZONE);
	return utcGuess - offsetMinutes * 60 * 1000;
};

const getDateParts = (value?: string): { year: number; month: number; day: number } | null => {
	const parsed = parseDateValue(value);
	if (!parsed) return null;
	return {
		year: parsed.getFullYear(),
		month: parsed.getMonth() + 1,
		day: parsed.getDate()
	};
};

const addDays = (
	parts: { year: number; month: number; day: number },
	days: number
): { year: number; month: number; day: number } => {
	const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
	return {
		year: shifted.getUTCFullYear(),
		month: shifted.getUTCMonth() + 1,
		day: shifted.getUTCDate()
	};
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
	reference: Date = new Date()
): boolean => {
	if (isSessionDraft(session)) return false;
	const referenceTimestamp = reference.getTime();
	const startParts = getDateParts(session.startDate);
	if (!startParts) return false;
	const timeParts = parseStartTime(session.time);
	const startThreshold = timeParts
		? toPacificTimestamp({
				...startParts,
				hours: timeParts.hours,
				minutes: timeParts.minutes
			})
		: toPacificTimestamp(addDays(startParts, 1));
	const endParts = getDateParts(session.endDate) ?? startParts;
	const endThreshold = toPacificTimestamp(addDays(endParts, 1));
	return referenceTimestamp >= startThreshold && referenceTimestamp < endThreshold;
};

export const filterUpcomingSessions = (
	sessions: TrainingSession[],
	today: Date = normalizeToday()
): TrainingSession[] => sessions.filter((session) => isSessionUpcoming(session, today));

export const getSessionStartTimestamp = (session: TrainingSession): number => {
	const parsedDate = parseDateValue(session.startDate);
	if (!parsedDate) return Number.POSITIVE_INFINITY;
	const timeParts = parseStartTime(session.time);
	if (timeParts) {
		parsedDate.setHours(timeParts.hours, timeParts.minutes, 0, 0);
	}
	return parsedDate.getTime();
};
