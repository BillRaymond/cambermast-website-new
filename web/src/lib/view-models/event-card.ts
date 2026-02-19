import { toConciseEventTimeLabel } from '$lib/data/events/session-labels';
import { getEventOccurrenceState, getEventSessionBounds } from '$lib/data/events/timeline';
import { getPartnerByCode } from '$lib/data/partners';
import { getTrainingProgramBySku } from '$lib/data/training';
import { getProgramCertificateText } from '$lib/data/training/program-meta';
import type { TrainingProgram } from '$lib/data/training/types';
import {
	getEventStartTimestampUi,
	getEventTypeLabelUi,
	type EventUiModel
} from '$lib/view-models/events';

export type EventCardVariant = 'calendar' | 'carousel' | 'catalog';

export type EventCardTone = 'upcoming' | 'happening';

export type EventCardModel = {
	id: string;
	title: string;
	subtitle?: string;
	date: string;
	time?: string;
	location?: string;
	hostText?: string;
	image?: string;
	imageAlt?: string;
	typeLabel: string;
	statusLabel?: string;
	certificateText?: string;
	videoUrl?: string;
	partnerText?: string;
	speakerText?: string;
	registerUrl?: string;
	registerLabel?: string;
	learnMoreUrl: string;
	tone: EventCardTone;
	eventType: string;
	eventTypeLabel: string;
	startTimestamp: number | null;
};

export type ToEventCardModelOptions = {
	program?: TrainingProgram;
	referenceTimestamp?: number;
	today?: Date;
	forceTone?: EventCardTone;
	statusLabelOverride?: string;
	registerLabelOverride?: string;
	registerDisabledOverride?: boolean;
};

const defaultLocationLabel = 'Live online';
const dateFormatter = new Intl.DateTimeFormat('en-US', {
	weekday: 'long',
	month: 'long',
	day: 'numeric',
	year: 'numeric'
});

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

const toFiniteTimestamp = (value: number): number | null => (Number.isFinite(value) ? value : null);

const toDateLabel = (event: EventUiModel, startTimestamp: number | null): string => {
	const trimmedDate = event.date?.trim();
	if (trimmedDate) return trimmedDate;
	if (startTimestamp !== null) return dateFormatter.format(new Date(startTimestamp));
	return '';
};

const getCountdownLabel = (
	startTimestamp: number | null,
	referenceTimestamp: number
): string | null => {
	if (startTimestamp === null) return null;
	const diffMs = startTimestamp - referenceTimestamp;
	if (diffMs <= 0) return null;
	return `Starts in ${formatCountdown(diffMs)}`;
};

export const toEventCardModel = (
	event: EventUiModel,
	options: ToEventCardModelOptions = {}
): EventCardModel => {
	const referenceTimestamp = options.referenceTimestamp ?? Date.now();
	const occurrenceState = getEventOccurrenceState(event, referenceTimestamp);
	const bounds = getEventSessionBounds(event);
	const isTrainingHappeningNow = event.type === 'training_session' && occurrenceState.isInProgress;
	const isHappeningNow = occurrenceState.isHappeningNow || isTrainingHappeningNow;
	const tone = options.forceTone ?? (isHappeningNow ? 'happening' : 'upcoming');
	const eventTypeLabel = getEventTypeLabelUi(event);
	const subtitle =
		event.subtitle ?? `${eventTypeLabel}${event.visibility === 'draft' ? ' · Draft' : ''}`;
	const startTimestamp = toFiniteTimestamp(
		bounds?.startTimestamp ?? getEventStartTimestampUi(event)
	);
	const relatedProgram =
		options.program ??
		(event.programRef?.sku ? getTrainingProgramBySku(event.programRef.sku) : undefined);
	const registerDisabledBase =
		event.registrationStatus === 'closed' ||
		event.registrationStatus === 'none' ||
		event.registrationStatus === 'sold_out' ||
		isTrainingHappeningNow ||
		!event.cta?.url;
	const registerDisabled =
		options.registerDisabledOverride ?? (tone === 'happening' ? true : registerDisabledBase);
	const registerLabel =
		options.registerLabelOverride ??
		(event.visibility === 'draft' && event.registrationStatus === 'none'
			? event.cta?.label || 'Draft'
			: event.registrationStatus === 'none' || isTrainingHappeningNow
				? 'Enrollment closed'
				: event.cta?.label || 'Register now');
	const countdownLabel = getCountdownLabel(startTimestamp, referenceTimestamp);
	const statusLabelDefault =
		tone === 'happening'
			? registerLabel || 'Enrollment closed'
			: (countdownLabel ?? (registerDisabled ? 'Enrollment closed' : undefined));
	const partnerText = (event.partners ?? [])
		.map((partnerRef) => getPartnerByCode(partnerRef.code)?.name ?? partnerRef.code)
		.filter((name) => Boolean(name) && name !== 'NONE')
		.join(' + ');
	const hostNames: string[] = [];
	const speakerNames: string[] = [];
	(event.speakers ?? []).forEach((speaker) => {
		const name = speaker.name?.trim();
		if (!name) return;
		const title = speaker.title?.trim().toLowerCase() ?? '';
		const isHost = title.includes('host') || title.includes('instructor');
		if (isHost) {
			hostNames.push(name);
			return;
		}
		speakerNames.push(name);
	});
	const hostText = hostNames.join(' + ');
	const speakerText = speakerNames.join(' + ');

	return {
		id: `event-${event.id ?? event.slug}`,
		title: event.title,
		subtitle,
		date: toDateLabel(event, startTimestamp),
		time: toConciseEventTimeLabel(event.time) ?? undefined,
		location: event.location ?? defaultLocationLabel,
		hostText: hostText || undefined,
		image: event.image ?? relatedProgram?.heroImage,
		imageAlt: event.imageAlt ?? relatedProgram?.heroImageAlt ?? event.title,
		typeLabel: event.type === 'training_session' ? 'Training' : eventTypeLabel,
		statusLabel: options.statusLabelOverride ?? statusLabelDefault,
		certificateText: relatedProgram ? getProgramCertificateText(relatedProgram) : undefined,
		videoUrl: relatedProgram?.videoUrl,
		partnerText: partnerText || undefined,
		speakerText: speakerText || undefined,
		registerUrl: registerDisabled ? undefined : event.cta?.url,
		registerLabel,
		learnMoreUrl: `/events/${event.slug}`,
		tone,
		eventType: event.type,
		eventTypeLabel,
		startTimestamp
	};
};
