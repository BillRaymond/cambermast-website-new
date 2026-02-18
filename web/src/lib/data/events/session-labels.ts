import type { EventSession } from './types';
import { normalizeEventSessions } from './timeline';

const PACIFIC_TIME_ZONE = 'America/Los_Angeles';

const toTimeWindowKey = (timestamp: number, timeZone: string): string =>
	new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(timestamp);

const toTimeRangeLabel = (
	startTimestamp: number,
	endTimestamp: number,
	timeZone: string,
	timeZoneLabel: string
): string => {
	const startLabel = toTimeWindowKey(startTimestamp, timeZone);
	const endLabel = toTimeWindowKey(endTimestamp, timeZone);
	return `${startLabel} to ${endLabel} ${timeZoneLabel}`;
};

export const deriveEventDateLabel = (
	sessions: EventSession[],
	timeZone: string = PACIFIC_TIME_ZONE
): string => {
	const normalized = normalizeEventSessions(sessions);
	if (!normalized.length) return 'Date TBD';

	const longDateFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
	const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		weekday: 'long'
	});

	const first = normalized[0];
	if (normalized.length === 1) {
		return longDateFormatter.format(first.startTimestamp);
	}

	const last = normalized[normalized.length - 1];
	const startDateLabel = longDateFormatter.format(first.startTimestamp);
	const endDateLabel = longDateFormatter.format(last.startTimestamp);
	const weekdaySet = new Set(
		normalized.map((session) => weekdayFormatter.format(session.startTimestamp))
	);
	const weekdaySuffix = weekdaySet.size === 1 ? ` · Every ${[...weekdaySet][0]}` : '';

	return `${startDateLabel} - ${endDateLabel}${weekdaySuffix}`;
};

export const deriveEventTimeLabel = (
	sessions: EventSession[],
	timeZone: string = PACIFIC_TIME_ZONE,
	timeZoneLabel: string = 'PT'
): string | string[] | undefined => {
	const normalized = normalizeEventSessions(sessions);
	if (!normalized.length) return undefined;

	const rangeLabels = normalized.map((session) =>
		toTimeRangeLabel(session.startTimestamp, session.endTimestamp, timeZone, timeZoneLabel)
	);

	if (rangeLabels.length === 1) return rangeLabels[0];
	if (new Set(rangeLabels).size === 1) return rangeLabels[0];

	const dayFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	});

	return normalized.map((session, index) => {
		const dayLabel = dayFormatter.format(session.startTimestamp);
		return `${dayLabel} - ${rangeLabels[index]}`;
	});
};
