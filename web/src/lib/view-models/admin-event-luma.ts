import { SITE_ORIGIN } from '$lib/config/site';
import { isLumaRegistrationUrl } from '$lib/data/events';
import {
	getEventOccurrenceState,
	normalizeEventSessions,
	type NormalizedEventSession
} from '$lib/data/events/timeline';
import { getPartnerByCode } from '$lib/data/partners';
import { getTrainingProgramBySku } from '$lib/data/training';
import type { TrainingProgram } from '$lib/data/training/types';
import { getImageAlt, getLandscapeImageUrl } from '$lib/data/image-contract';
import {
	toEventCardModel,
	type EventCardModel,
	type EventCardTone
} from '$lib/view-models/event-card';
import type { EventUiModel } from '$lib/view-models/events';

export type AdminEventLumaOccurrence = 'future' | 'current' | 'past' | 'canceled_postponed';

export type AdminEventLumaEntry = {
	id: string;
	slug: string;
	title: string;
	timeZoneIana?: string;
	visibility: string;
	lifecycleStatus: string;
	registrationStatus: string;
	firstSessionStartAtUtc?: string;
	firstSessionEndAtUtc?: string;
	lastSessionStartAtUtc?: string;
	lastSessionEndAtUtc?: string;
	locationMode?: string;
	locationLabel: string;
	startDateTimeCopy: string;
	tagline: string;
	priceCopy: string;
	eventUrl: string;
	eventType: string;
	typeLabel: string;
	card: EventCardModel;
	searchText: string;
	occurrence: AdminEventLumaOccurrence;
	hasLumaRegistration: boolean;
	registrationUrl?: string;
	partnerNames: string[];
	previewImageUrl?: string;
	imageAlt: string;
	imageCopyCandidates: string[];
	imageCopyLabel: string;
	youtubeUrl?: string;
	nameCopy: string;
	descriptionCopy: string;
};

const ptDateFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/Los_Angeles',
	month: 'long',
	day: 'numeric'
});
const ptDateWithYearFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/Los_Angeles',
	month: 'long',
	day: 'numeric',
	year: 'numeric'
});
const ptWeekdayFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/Los_Angeles',
	weekday: 'long'
});
const ptTimeFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/Los_Angeles',
	hour: 'numeric',
	minute: '2-digit',
	hour12: true
});
const normalizeMarkdownInput = (value: string): string => {
	if (value.includes('\\n') && !value.includes('\n')) return value.replace(/\\n/g, '\n');
	return value;
};
const siteOrigin = SITE_ORIGIN.replace(/\/$/, '');
const fallbackFormatLabel = 'Live online';

const dedupeStrings = (values: Array<string | undefined>): string[] => {
	const seen = new Set<string>();
	return values.filter((value): value is string => {
		const normalized = value?.trim();
		if (!normalized || seen.has(normalized)) return false;
		seen.add(normalized);
		return true;
	});
};

const toProductionSiteUrl = (value: string): string => {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	if (/^https?:\/\//i.test(trimmed)) {
		try {
			const parsed = new URL(trimmed);
			if (parsed.hostname === 'cambermast.com' || parsed.hostname === 'www.cambermast.com') {
				return `${siteOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
			}
		} catch {
			return trimmed;
		}
		return trimmed;
	}
	if (trimmed.startsWith('/')) return `${siteOrigin}${trimmed}`;
	return trimmed;
};

const normalizeMarkdownCopy = (value: string): string =>
	normalizeMarkdownInput(value)
		.replace(/\r\n/g, '\n')
		.replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, (_match, label: string, href: string) => {
			return `[${label}](${toProductionSiteUrl(href)})`;
		})
		.replace(
			/(?<=^|\s)(\/(about|agents|api|campaigns|contact|events|gdpr|news|resources|services|strategy|techlab|tools|training)(?:\/[^\s)\]]*)?)/gm,
			(match: string) => toProductionSiteUrl(match)
		)
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();

const toProgramDescriptionText = (program: TrainingProgram): string => {
	const sections: string[] = [];

	if (program.description?.trim()) sections.push(program.description.trim());
	if (program.secondaryDescription?.trim()) sections.push(program.secondaryDescription.trim());
	if (program.objectives?.length) {
		sections.push(`## Outcomes\n\n${program.objectives.map((item) => `- ${item}`).join('\n')}`);
	}
	if (program.takeaways?.length) {
		sections.push(
			`## What You Will Build\n\n${program.takeaways.map((item) => `- ${item}`).join('\n')}`
		);
	}
	if (program.audience?.length) {
		sections.push(
			`## Who This Is For\n\n${program.audience.map((item) => `- ${item}`).join('\n')}`
		);
	}

	return dedupeStrings(sections).join('\n\n');
};

const getDescriptionText = (event: EventUiModel, relatedProgram?: TrainingProgram): string => {
	const eventDescription =
		typeof event.description === 'string'
			? event.description
			: (event.description?.bodyMd ?? event.description?.summary ?? '');
	const hasEventSpecificDescription = Boolean(eventDescription.trim());
	const sections = dedupeStrings([
		eventDescription,
		hasEventSpecificDescription || !relatedProgram ? undefined : toProgramDescriptionText(relatedProgram)
	]);

	return sections.map((section) => normalizeMarkdownCopy(section)).join('\n\n').trim();
};

const normalizeTitleForLumaName = (title: string): string =>
	title.replace(/\s*\(([^()]+,\s*\d{4})\)\s*$/, ', $1').trim();

const formatCompactNameDateRange = (sessions: NormalizedEventSession[]): string => {
	if (!sessions.length) return '';
	const first = sessions[0];
	const last = sessions[sessions.length - 1];
	if (sessions.length === 1) return ptDateFormatter.format(first.startTimestamp);
	return `${ptDateFormatter.format(first.startTimestamp)} - ${ptDateFormatter.format(last.startTimestamp)}`;
};

const formatNameCopy = (event: EventUiModel): string => {
	const sessions = normalizeEventSessions(event.sessions ?? []);
	const baseTitle = normalizeTitleForLumaName(event.title);
	const dateRange = formatCompactNameDateRange(sessions);
	if (!dateRange) return baseTitle;
	if (event.type === 'training_session' && sessions.length > 1) {
		return `${baseTitle} (${sessions.length}-Weeks, ${dateRange})`;
	}
	if (sessions.length > 1) {
		return `${baseTitle} (${sessions.length} Sessions, ${dateRange})`;
	}
	return `${baseTitle} (${dateRange})`;
};

const applyTemplateVariables = (value: string, variables: Record<string, string>): string => {
	let result = value;
	for (const [token, replacement] of Object.entries(variables)) {
		if (!token || !replacement) continue;
		result = result.split(token).join(replacement);
	}
	return result;
};

const formatCurrencyCopy = (event: EventUiModel): string => {
	const amountUsd = event.ticketing?.amountUsd;
	if (amountUsd === undefined || !Number.isFinite(amountUsd)) return '';
	return `$${amountUsd.toFixed(2)} USD`;
};

const getFormatCopy = (event: EventUiModel, relatedProgram?: TrainingProgram): string => {
	const programFormat = relatedProgram?.stats
		?.find((stat) => stat.label.trim().toLowerCase() === 'format')
		?.value;
	if (typeof programFormat === 'string' && programFormat.trim()) return programFormat.trim();
	if (Array.isArray(programFormat)) {
		const firstTextValue = programFormat.find(
			(value): value is string => typeof value === 'string' && value.trim().length > 0
		);
		if (firstTextValue) return firstTextValue.trim();
	}

	if (event.locationMeta?.publicLabel?.trim()) {
		return event.locationMeta.mode === 'online'
			? `${fallbackFormatLabel} (${event.locationMeta.publicLabel.trim()})`
			: event.locationMeta.publicLabel.trim();
	}

	return event.locationMeta?.mode === 'online' ? fallbackFormatLabel : '';
};

const hasProgramStat = (program: TrainingProgram | undefined, label: string): boolean =>
	Boolean(
		program?.stats?.some(
			(stat) => stat.label.trim().toLowerCase() === label && `${stat.value}`.trim().length > 0
		)
	);

const getDescriptionMetaLine = (
	event: EventUiModel,
	relatedProgram: TrainingProgram | undefined
): string => {
	const parts = dedupeStrings([
		hasProgramStat(relatedProgram, 'certificate') ? 'Certificate' : undefined,
		/\blive\b/i.test(getFormatCopy(event, relatedProgram)) || (event.sessions?.length ?? 0) > 0
			? 'Live'
			: undefined,
		event.locationMeta?.mode === 'online'
			? 'Online'
			: event.locationMeta?.mode === 'hybrid'
				? 'Hybrid'
				: event.locationMeta?.mode === 'in_person'
					? 'In person'
					: undefined
	]);

	return parts.join(' • ');
};

const getFaqTemplateVariables = (
	event: EventUiModel,
	relatedProgram: TrainingProgram | undefined,
	sessions: NormalizedEventSession[]
): Record<string, string> => ({
	'[Program Name]': event.title,
	'[Dates]': formatDateRangeLine(sessions),
	'[Cost]': formatCurrencyCopy(event),
	'[Format]': getFormatCopy(event, relatedProgram),
	'[Program/Event URL]': `${siteOrigin}/events/${event.slug}`
});

const formatFaqBlock = (
	block: { type: string; text?: string; label?: string; href?: string; subject?: string; body?: string },
	templateVariables: Record<string, string>
): string => {
	if (block.type === 'paragraph') return normalizeMarkdownCopy(block.text?.trim() ?? '');
	if (block.type === 'link') {
		const label = block.label?.trim();
		const href = block.href?.trim() ? toProductionSiteUrl(block.href.trim()) : undefined;
		if (label && href) return `[${label}](${href})`;
		return href ?? label ?? '';
	}
	if (block.type === 'email_template') {
		const lines = dedupeStrings([
			block.subject
				? `**Email subject:** ${applyTemplateVariables(block.subject, templateVariables)}`
				: undefined,
			block.body
				? normalizeMarkdownCopy(applyTemplateVariables(block.body, templateVariables))
				: undefined
		]);
		return lines.join('\n');
	}
	return '';
};

const formatFaqSection = (
	event: EventUiModel,
	relatedProgram: TrainingProgram | undefined,
	sessions: NormalizedEventSession[]
): string => {
	const faqs = event.faq?.length ? event.faq : (relatedProgram?.faqs ?? []);
	if (!faqs.length) return '';
	const templateVariables = getFaqTemplateVariables(event, relatedProgram, sessions);

	return [
		'## Frequently Asked Questions',
		...faqs.flatMap((faq) => {
			const answer = faq.blocks
				.map((block) =>
					formatFaqBlock(
						block as {
							type: string;
							text?: string;
							label?: string;
							href?: string;
							subject?: string;
							body?: string;
						},
						templateVariables
					)
				)
				.filter(Boolean)
				.join('\n\n');

			return answer ? [`### ${faq.question.trim()}`, answer.trim()] : [`### ${faq.question.trim()}`];
		})
	]
		.join('\n\n')
		.trim();
};

const formatAgendaSection = (
	event: EventUiModel,
	relatedProgram: TrainingProgram | undefined,
	sessions: NormalizedEventSession[]
): string => {
	const agenda =
		event.agenda?.length
			? event.agenda.map((item) => ({ title: item.title, details: item.details ?? [] }))
			: (relatedProgram?.agenda ?? []).map((item) => ({ title: item.title, details: item.details ?? [] }));
	if (!agenda.length) return '';

	const lines: string[] = ['## Syllabus'];
	agenda.forEach((item, index) => {
		const parts = [item.title.trim()];
		const session = sessions[index];
		if (session) {
			parts.push(`${ptDateFormatter.format(session.startTimestamp)}`);
		}
		lines.push(`### ${parts.join(' | ')}`);
		item.details.forEach((detail) => lines.push(`- ${normalizeMarkdownCopy(detail.trim())}`));
		lines.push('');
	});

	return lines.join('\n').trim();
};

const formatFullScheduleSection = (sessions: NormalizedEventSession[]): string => {
	if (!sessions.length) return '';

	const weekdayNames = Array.from(
		new Set(sessions.map((session) => ptWeekdayFormatter.format(session.startTimestamp)))
	);

	const lines = ['Full Schedule'];
	if (weekdayNames.length === 1 && sessions.length > 1) {
		lines.push(`All sessions run on ${weekdayNames[0]}s.`);
	}
	lines.push('');
	sessions.forEach((session) => {
		lines.push(
			`- ${ptDateWithYearFormatter.format(session.startTimestamp)}: ${ptTimeFormatter.format(session.startTimestamp)} PT - ${ptTimeFormatter.format(session.endTimestamp)} PT`
		);
	});

	return `## Full Schedule\n\n${lines.slice(1).join('\n').trim()}`.trim();
};

const formatDateRangeLine = (sessions: NormalizedEventSession[]): string => {
	if (!sessions.length) return '';
	const first = sessions[0];
	const last = sessions[sessions.length - 1];
	if (sessions.length === 1) {
		return `${ptDateWithYearFormatter.format(first.startTimestamp)}, from ${ptTimeFormatter.format(first.startTimestamp)} PT to ${ptTimeFormatter.format(first.endTimestamp)} PT`;
	}
	return `${ptDateFormatter.format(first.startTimestamp)} - ${ptDateWithYearFormatter.format(last.startTimestamp)}, from ${ptTimeFormatter.format(first.startTimestamp)} PT to ${ptTimeFormatter.format(first.endTimestamp)} PT`;
};

const formatScheduleLead = (event: EventUiModel, sessions: NormalizedEventSession[]): string => {
	if (sessions.length < 2) return '';
	const weekdayNames = Array.from(
		new Set(sessions.map((session) => ptWeekdayFormatter.format(session.startTimestamp)))
	);
	const cadence =
		weekdayNames.length === 1 ? ` that meets on ${weekdayNames[0]}s` : '';
	if (event.type === 'training_session') {
		return `This is a ${sessions.length}-week course${cadence}.`;
	}
	return `This event includes ${sessions.length} live sessions${cadence}.`;
};

const formatStartDateTimeCopy = (sessions: NormalizedEventSession[]): string => {
	if (!sessions.length) return '';
	const first = sessions[0];
	return `${ptDateWithYearFormatter.format(first.startTimestamp)} | ${ptTimeFormatter.format(first.startTimestamp)} PT | ${ptTimeFormatter.format(first.endTimestamp)} PT`;
};

const formatPriceCopy = (event: EventUiModel): string => {
	const amountUsd = event.ticketing?.amountUsd;
	if (amountUsd === undefined || !Number.isFinite(amountUsd)) return '';
	return amountUsd.toFixed(2);
};

const getOccurrence = (event: EventUiModel): AdminEventLumaOccurrence => {
	if (event.lifecycleStatus === 'canceled' || event.lifecycleStatus === 'postponed') {
		return 'canceled_postponed';
	}
	const occurrence = getEventOccurrenceState(event);
	if (occurrence.isInProgress || occurrence.isHappeningNow) return 'current';
	if (event.lifecycleStatus === 'completed' || occurrence.hasEnded) return 'past';
	return 'future';
};

const deriveImageCandidates = (value: string | undefined): string[] => {
	const raw = value?.trim();
	if (!raw) return [];
	const urlParts = raw.match(/^(.*?)(\.(png|jpe?g|webp))([?#].*)?$/i);
	if (!urlParts) return [raw];

	const base = urlParts[1];
	const ext = urlParts[2];
	const query = urlParts[4] ?? '';
	return dedupeStrings([
		`${base}.png${query}`,
		`${base}.jpg${query}`,
		`${base}.jpeg${query}`,
		`${base}${ext}${query}`
	]);
};

const formatHostingLine = (event: EventUiModel): string => {
	const partnerNames = dedupeStrings(
		(event.partners ?? [])
			.map((partnerRef) => getPartnerByCode(partnerRef.code)?.name ?? partnerRef.code)
			.filter((name) => name && name !== 'NONE' && name !== 'Cambermast')
	);

	if (!partnerNames.length) {
		return 'This event is hosted by **Cambermast**. If you want more details, please visit this link:';
	}

	if (partnerNames.length === 1) {
		return `This event is hosted by **Cambermast** in partnership with **${partnerNames[0]}**. If you want more details, please visit this link:`;
	}

	const leadingPartners = partnerNames.slice(0, -1).map((name) => `**${name}**`).join(', ');
	const finalPartner = `**${partnerNames.at(-1)}**`;
	return `This event is hosted by **Cambermast** in partnership with ${leadingPartners}, and ${finalPartner}. If you want more details, please visit this link:`;
};

const buildDescriptionCopy = (event: EventUiModel, relatedProgram: TrainingProgram | undefined): string => {
	const sessions = normalizeEventSessions(event.sessions ?? []);
	const eventUrl = `${siteOrigin}/events/${event.slug}`;
	const trainingTermsUrl = `${siteOrigin}/training/terms`;
	const attributionLines = dedupeStrings([
		event.videoUrl ?? relatedProgram?.videoUrl
			? `🎥 Watch the intro video here: ${event.videoUrl ?? relatedProgram?.videoUrl}`
			: undefined,
		formatHostingLine(event),
		eventUrl
	]);
	const scheduleLines = dedupeStrings([
		formatScheduleLead(event, sessions) ? `**${formatScheduleLead(event, sessions)}**` : undefined,
		formatDateRangeLine(sessions),
		sessions.length > 1 ? 'See the full schedule at the end of this description.' : undefined
	]);
	const body = getDescriptionText(event, relatedProgram);
	const descriptionMetaLine = getDescriptionMetaLine(event, relatedProgram);
	const syllabus = formatAgendaSection(event, relatedProgram, sessions);
	const fullSchedule = sessions.length > 1 ? formatFullScheduleSection(sessions) : '';
	const faq = formatFaqSection(event, relatedProgram, sessions);
	const terms = `## Terms\n\nBy registering, you agree to the [training terms and conditions](${trainingTermsUrl}).`;

	return dedupeStrings([
		descriptionMetaLine,
		body,
		scheduleLines.join('\n'),
		attributionLines.join('\n'),
		syllabus,
		fullSchedule,
		faq,
		terms
	])
		.join('\n\n')
		.trim();
};

const getEventTone = (occurrence: AdminEventLumaOccurrence): EventCardTone =>
	occurrence === 'current' ? 'happening' : 'upcoming';

export const buildAdminEventLumaEntries = (events: EventUiModel[]): AdminEventLumaEntry[] =>
	events.map((event) => {
		const relatedProgram = event.programRef?.sku
			? getTrainingProgramBySku(event.programRef.sku)
			: undefined;
		const partnerNames = (event.partners ?? [])
			.map((partnerRef) => getPartnerByCode(partnerRef.code)?.name ?? partnerRef.code)
			.filter((name) => name && name !== 'NONE');
		const occurrence = getOccurrence(event);
		const sessions = normalizeEventSessions(event.sessions ?? []);
		const imageUrl =
			getLandscapeImageUrl(event.images) ?? getLandscapeImageUrl(relatedProgram?.images);
		const imageCandidates = deriveImageCandidates(imageUrl);
		const hasLumaRegistration = isLumaRegistrationUrl(event.cta?.url ?? '');

		return {
			id: event.id,
			slug: event.slug,
			title: event.title,
			timeZoneIana: event.timeZoneIana,
			visibility: event.visibility,
			lifecycleStatus: event.lifecycleStatus,
			registrationStatus: event.registrationStatus,
			firstSessionStartAtUtc: event.startAtUtc,
			firstSessionEndAtUtc: event.endAtUtc,
			lastSessionStartAtUtc: sessions.at(-1)?.startAtUtc,
			lastSessionEndAtUtc: sessions.at(-1)?.endAtUtc,
			locationMode: event.locationMeta?.mode,
			locationLabel: event.location,
			startDateTimeCopy: formatStartDateTimeCopy(normalizeEventSessions(event.sessions ?? [])),
			tagline: event.tagline,
			priceCopy: formatPriceCopy(event),
			eventUrl: `${SITE_ORIGIN.replace(/\/$/, '')}/events/${event.slug}`,
			eventType: event.type,
			typeLabel: event.typeLabel,
			card: toEventCardModel(event, {
				forceTone: getEventTone(occurrence)
			}),
			searchText: [
				event.title,
				event.slug,
				event.id,
				event.type,
				event.typeLabel,
				partnerNames.join(' '),
				event.summary
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase(),
			occurrence,
			hasLumaRegistration,
			registrationUrl: event.cta?.url,
			partnerNames,
			previewImageUrl: imageUrl,
			imageAlt: getImageAlt(event.images) ?? getImageAlt(relatedProgram?.images) ?? event.title,
			imageCopyCandidates: imageCandidates,
			imageCopyLabel: imageCandidates[0]?.toLowerCase().includes('.png') ? 'Copy PNG' : 'Copy image',
			youtubeUrl: event.videoUrl ?? relatedProgram?.videoUrl,
			nameCopy: formatNameCopy(event),
			descriptionCopy: buildDescriptionCopy(event, relatedProgram)
		};
	});
