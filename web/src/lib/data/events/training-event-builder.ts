import type { EventSource, EventRegistrationStatus, EventVisibility } from './types';
import { deriveEventDateLabel, deriveEventTimeLabel } from './session-labels';
import { getEventSessionBounds } from './timeline';
import { getTrainingProgramBySku } from '../training';
import type { TrainingProgram } from '../training/types';
import { getFaqPresetItemsSnapshot } from '../faq-presets';

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

const EVENT_TIME_ZONE_IANA = 'America/Los_Angeles';
const DAYS_BETWEEN_SESSIONS = 7;
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

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

const toSessionCount = (durationDays: number): number =>
	Math.max(1, Math.round(durationDays / DAYS_BETWEEN_SESSIONS));

const parseUsdAmount = (value?: string | string[]): number | undefined => {
	const raw = Array.isArray(value) ? value.join(' ') : value;
	if (!raw) return undefined;
	const match = raw.match(/\$([0-9][0-9,]*(?:\.[0-9]{1,2})?)/);
	if (!match) return undefined;
	const normalized = match[1].replace(/,/g, '');
	const amount = Number.parseFloat(normalized);
	return Number.isFinite(amount) ? amount : undefined;
};

const getProgramTicketPriceUsd = (program: TrainingProgram): number =>
	parseUsdAmount(program.stats?.find((stat) => stat.label.toLowerCase() === 'cost')?.value) ?? 0;

const toClonedArray = <T>(items?: T[]): T[] | undefined =>
	items?.length ? JSON.parse(JSON.stringify(items)) : undefined;

const toTrainingEventAgenda = (
	agenda: TrainingProgram['agenda']
): EventSource['agenda'] | undefined => {
	if (!(agenda && agenda.length > 0)) return undefined;

	return agenda.map((block) => {
		const details = block.details ?? [];
		const [outcome, ...rest] = details;
		return {
			title: block.title,
			...(outcome ? { outcome } : {}),
			...(rest.length ? { details: rest.join(' ') } : {})
		};
	});
};

const toTrainingEventDescription = (program: TrainingProgram): EventSource['description'] => {
	const summary = program.secondaryDescription ?? program.description;
	const sections: string[] = [];

	if (program.description) sections.push(program.description);

	if (program.objectives?.length) {
		sections.push(['## Outcomes', ...program.objectives.map((item) => `- ${item}`)].join('\n'));
	}
	if (program.takeaways?.length) {
		sections.push(
			['## What You Will Build', ...program.takeaways.map((item) => `- ${item}`)].join('\n')
		);
	}
	if (program.audience?.length) {
		sections.push(
			['## Who This Is For', ...program.audience.map((item) => `- ${item}`)].join('\n')
		);
	}

	return {
		summary,
		bodyMd: sections.join('\n\n')
	};
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
	const eventDefaultHosts = program.eventDefaults?.hosts ?? [];
	if (!eventDefaultHosts.length) {
		throw new Error(
			`Program "${program.slug}" is missing eventDefaults.hosts. Add at least one host before generating training events.`
		);
	}
	const eventSpeakers: EventSource['speakers'] = eventDefaultHosts.map((host) => ({
		name: host.name,
		title: host.title,
		shortBio: host.shortBio,
		photo: host.photo,
		photoAlt: host.photoAlt
	}));
	const partnerCodes = input.partnerCodes ?? program.eventDefaults?.partnerCodes;

	const startDateParts = parseDateParts(input.startDate);
	const startTimeParts = parseTimeParts(input.startTimeLocal ?? template.defaultStartTimeLocal);
	const durationDays = input.durationDays ?? template.durationDays;
	const estimatedHoursCommitment = input.estimatedHoursCommitment ?? template.hoursPerDayCommitment;
	const sessionDurationMinutes = Math.round(estimatedHoursCommitment * 60);
	if (sessionDurationMinutes <= 0) {
		throw new Error('estimatedHoursCommitment must be greater than zero.');
	}
	if (durationDays < 1) {
		throw new Error('durationDays must be at least 1.');
	}
	const sessionCount = toSessionCount(durationDays);
	const firstSessionStartTimestamp = toZonedTimestamp(
		startDateParts,
		startTimeParts,
		EVENT_TIME_ZONE_IANA
	);
	const sessions = Array.from({ length: sessionCount }, (_, index) => {
		const startTimestamp =
			firstSessionStartTimestamp + index * DAYS_BETWEEN_SESSIONS * MILLISECONDS_IN_DAY;
		const endTimestamp = startTimestamp + sessionDurationMinutes * 60 * 1000;
		return {
			startAtUtc: new Date(startTimestamp).toISOString(),
			endAtUtc: new Date(endTimestamp).toISOString()
		};
	});

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
			program.description ??
			`${program.title} runs for ${sessionCount} session(s), ${sessionDurationMinutes} minutes per session.`,
		sessions,
		visibility: input.visibility ?? 'public',
		lifecycleStatus: 'scheduled',
		registrationStatus: input.registrationStatus ?? 'open',
		cta: {
			label: input.ctaLabel ?? 'Register now',
			url: input.ctaUrl ?? program.route
		},
		timeZoneIana: EVENT_TIME_ZONE_IANA,
		location: {
			mode: 'online',
			publicLabel: template.defaultLocationLabel ?? 'Online',
			detailsVisibility: 'public'
		},
		ticketing: {
			currency: 'USD',
			amountUsd: getProgramTicketPriceUsd(program)
		},
		registrationSettings: {
			approvalRequired: false,
			capacity: { type: 'unlimited' }
		},
		programRef: {
			sku: program.sku
		},
		template: {
			kind: 'training_event_v1',
			sourceProgramSku: program.sku,
			sourceProgramSlug: program.slug,
			sourceProgramRoute: program.route
		},
		faq:
			program.faqs && program.faqs.length > 0
				? JSON.parse(JSON.stringify(program.faqs))
				: getFaqPresetItemsSnapshot('training-signup-core-v1'),
		schedule: {
			durationDays,
			estimatedHoursCommitment
		},
		description: toTrainingEventDescription(program),
		highlights: toClonedArray(program.catalog?.bullets) ?? toClonedArray(program.objectives),
		audienceBullets: toClonedArray(program.audience),
		buildBullets: toClonedArray(program.takeaways),
		outcomes: toClonedArray(program.objectives),
		agenda: toTrainingEventAgenda(program.agenda),
		speakers: eventSpeakers,
		partners: partnerCodes?.map((code) => ({ code })),
		videoUrl: program.videoUrl,
		heroImage: program.heroImage ?? program.ogImage,
		heroImageAlt: program.heroImageAlt ?? program.ogImageAlt ?? program.title,
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
	const bounds = getEventSessionBounds(event);
	if (!bounds) {
		throw new Error('Could not derive draft schedule bounds from event sessions.');
	}
	const derivedTimeLabel = deriveEventTimeLabel(
		event.sessions,
		EVENT_TIME_ZONE_IANA,
		template.defaultTimeZoneLabel
	);

	return {
		startAtUtc: bounds.startAtUtc,
		endAtUtc: bounds.endAtUtc,
		date: deriveEventDateLabel(event.sessions, EVENT_TIME_ZONE_IANA),
		time:
			typeof derivedTimeLabel === 'string'
				? derivedTimeLabel
				: (derivedTimeLabel?.join(', ') ?? ''),
		timezone: template.defaultTimeZoneLabel,
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
