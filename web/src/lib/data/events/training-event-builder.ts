import type { EventSource, EventRegistrationStatus, EventVisibility } from './types';
import { getTrainingProgramBySku } from '../training';
import type { TrainingProgram } from '../training/types';

type BuildTrainingEventInput = {
	program: TrainingProgram;
	id: string;
	slug: string;
	startDate: string;
	durationDays?: number;
	estimatedHoursCommitment?: number;
	startTimeLocal?: string;
	subtitle?: string;
	summary?: string;
	visibility?: EventVisibility;
	registrationStatus?: EventRegistrationStatus;
	ctaLabel?: string;
	ctaUrl?: string;
	partnerCodes?: string[];
};

type BuildTrainingEventFromSkuInput = Omit<BuildTrainingEventInput, 'program'> & {
	programSku: string;
};

type BuildTrainingDraftScheduleInput = {
	program: TrainingProgram;
	startDate: string;
	startTimeLocal?: string;
	durationDays?: number;
	estimatedHoursCommitment?: number;
};

type BuildTrainingDraftScheduleFromSkuInput = Omit<BuildTrainingDraftScheduleInput, 'program'> & {
	programSku: string;
};

type TrainingDraftSchedule = {
	startAtUtc: string;
	endAtUtc: string;
	date: string;
	time: string;
	timezone: string;
	schedule: {
		durationDays: number;
		estimatedHoursCommitment: number;
	};
};

const parseTimeParts = (value: string): { hours: number; minutes: number } => {
	const trimmed = value.trim().toLowerCase();
	const isoMatch = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
	if (isoMatch) {
		const hours = Number.parseInt(isoMatch[1], 10);
		const minutes = Number.parseInt(isoMatch[2], 10);
		return { hours, minutes };
	}

	const meridiemMatch = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/.exec(trimmed);
	if (!meridiemMatch) {
		throw new Error(`Invalid time value: "${value}"`);
	}
	let hours = Number.parseInt(meridiemMatch[1], 10);
	const minutes = Number.parseInt(meridiemMatch[2] ?? '0', 10);
	const meridiem = meridiemMatch[3];
	if (meridiem === 'pm' && hours < 12) hours += 12;
	if (meridiem === 'am' && hours === 12) hours = 0;
	return { hours, minutes };
};

const parseDateParts = (value: string): { year: number; month: number; day: number } => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) {
		throw new Error(`Invalid date value: "${value}". Expected YYYY-MM-DD.`);
	}
	return {
		year: Number.parseInt(match[1], 10),
		month: Number.parseInt(match[2], 10),
		day: Number.parseInt(match[3], 10)
	};
};

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

const toZonedTimestamp = (
	dateParts: { year: number; month: number; day: number },
	timeParts: { hours: number; minutes: number },
	timeZone: string
): number => {
	const utcGuess = Date.UTC(
		dateParts.year,
		dateParts.month - 1,
		dateParts.day,
		timeParts.hours,
		timeParts.minutes,
		0,
		0
	);
	const offsetMinutes = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone);
	return utcGuess - offsetMinutes * 60 * 1000;
};

const formatLocalDate = (timestamp: number, timeZone: string): string =>
	new Intl.DateTimeFormat('en-US', {
		timeZone,
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		weekday: 'long'
	}).format(timestamp);

const formatRangeDate = (startTimestamp: number, endTimestamp: number, timeZone: string): string => {
	const start = new Date(startTimestamp);
	const end = new Date(endTimestamp);
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
	return `${formatter.format(start)} - ${formatter.format(end)}`;
};

const formatTimeRange = (
	startTimestamp: number,
	sessionLengthMinutes: number,
	timeZone: string,
	timeZoneLabel: string
): string => {
	const endTimestamp = startTimestamp + sessionLengthMinutes * 60 * 1000;
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: 'numeric',
		minute: '2-digit'
	});
	return `${formatter.format(startTimestamp)} to ${formatter.format(endTimestamp)} ${timeZoneLabel}`;
};

export const buildTrainingSessionEventFromProgram = (
	input: BuildTrainingEventInput
): EventSource => {
	const { program } = input;
	const template = program.scheduleTemplate;
	if (!template) {
		throw new Error(`Program "${program.slug}" is missing scheduleTemplate.`);
	}
	if (!program.sku) {
		throw new Error(`Program "${program.slug}" is missing sku.`);
	}

	const startDateParts = parseDateParts(input.startDate);
	const startTimeParts = parseTimeParts(input.startTimeLocal ?? template.defaultStartTimeLocal);
	const durationDays = input.durationDays ?? template.durationDays;
	const estimatedHoursCommitment =
		input.estimatedHoursCommitment ?? template.hoursPerDayCommitment;
	const sessionDurationMinutes = Math.round(estimatedHoursCommitment * 60);
	if (sessionDurationMinutes <= 0) {
		throw new Error('estimatedHoursCommitment must be greater than zero.');
	}
	if (durationDays < 1) {
		throw new Error('durationDays must be at least 1.');
	}
	const startTimestamp = toZonedTimestamp(startDateParts, startTimeParts, template.defaultTimeZone);

	const endProgramStartTimestamp = startTimestamp + (durationDays - 1) * 24 * 60 * 60 * 1000;
	const endTimestamp = endProgramStartTimestamp + sessionDurationMinutes * 60 * 1000;

	const dateText =
		durationDays > 1
			? formatRangeDate(startTimestamp, endTimestamp, template.defaultTimeZone)
			: formatLocalDate(startTimestamp, template.defaultTimeZone);
	const timeText = formatTimeRange(
		startTimestamp,
		sessionDurationMinutes,
		template.defaultTimeZone,
		template.defaultTimeZoneLabel
	);

	return {
		id: input.id,
		slug: input.slug,
		title: program.title,
		subtitle: input.subtitle,
		type: 'training_session',
		typeLabel: 'Training',
		tagline: program.tagline,
		summary:
			input.summary ??
			`${program.title} runs for ${durationDays} day(s), ${sessionDurationMinutes} minutes per session.`,
		startAtUtc: new Date(startTimestamp).toISOString(),
		endAtUtc: new Date(endTimestamp).toISOString(),
		visibility: input.visibility ?? 'public',
		lifecycleStatus: 'scheduled',
		registrationStatus: input.registrationStatus ?? 'open',
		cta: {
			label: input.ctaLabel ?? 'Register now',
			url: input.ctaUrl ?? program.route
		},
		date: dateText,
		time: timeText,
		timezone: template.defaultTimeZoneLabel,
		location: {
			mode: 'online',
			publicLabel: template.defaultLocationLabel ?? 'Online',
			detailsVisibility: 'public'
		},
		programRef: {
			sku: program.sku
		},
		schedule: {
			durationDays,
			estimatedHoursCommitment
		},
		partners: input.partnerCodes?.map((code) => ({ code })),
		image: program.ogImage ?? program.heroImage,
		imageAlt: program.ogImageAlt ?? program.heroImageAlt ?? program.title
	};
};

export const buildTrainingSessionEventFromProgramSku = (
	input: BuildTrainingEventFromSkuInput
): EventSource => {
	const program = getTrainingProgramBySku(input.programSku);
	if (!program) {
		throw new Error(`No training program found for SKU "${input.programSku}".`);
	}
	const { programSku, ...rest } = input;
	return buildTrainingSessionEventFromProgram({
		...rest,
		program
	});
};

export const buildTrainingDraftScheduleFromProgram = (
	input: BuildTrainingDraftScheduleInput
): TrainingDraftSchedule => {
	const { program } = input;
	const template = program.scheduleTemplate;
	if (!template) {
		throw new Error(`Program "${program.slug}" is missing scheduleTemplate.`);
	}

	const event = buildTrainingSessionEventFromProgram({
		program,
		id: 'draft',
		slug: 'draft',
		startDate: input.startDate,
		startTimeLocal: input.startTimeLocal,
		durationDays: input.durationDays,
		estimatedHoursCommitment: input.estimatedHoursCommitment
	});

	return {
		startAtUtc: event.startAtUtc,
		endAtUtc: event.endAtUtc ?? event.startAtUtc,
		date: event.date ?? '',
		time: typeof event.time === 'string' ? event.time : (event.time?.join(', ') ?? ''),
		timezone: event.timezone ?? template.defaultTimeZoneLabel,
		schedule: {
			durationDays: event.schedule?.durationDays ?? template.durationDays,
			estimatedHoursCommitment:
				event.schedule?.estimatedHoursCommitment ?? template.hoursPerDayCommitment
		}
	};
};

export const buildTrainingDraftScheduleFromProgramSku = (
	input: BuildTrainingDraftScheduleFromSkuInput
): TrainingDraftSchedule => {
	const program = getTrainingProgramBySku(input.programSku);
	if (!program) {
		throw new Error(`No training program found for SKU "${input.programSku}".`);
	}

	const { programSku, ...rest } = input;
	return buildTrainingDraftScheduleFromProgram({
		...rest,
		program
	});
};
