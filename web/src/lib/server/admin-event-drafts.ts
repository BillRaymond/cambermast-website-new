import { promises as fs } from 'node:fs';
import crypto from 'node:crypto';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {
	buildTrainingDraftScheduleFromProgramSku,
	buildTrainingSessionEventFromProgramSku
} from '$lib/data/events';
import { getFaqPresetItemsSnapshot } from '$lib/data/faq-presets';
import { getTrainingProgramBySku } from '$lib/data/training';
import type { Campaign } from '$lib/data/campaigns';
import { getPartnerByCode } from '$lib/data/partners';
import type { EventSource } from '$lib/data/events/types';
import {
	buildDefaultEventCampaign,
	assertEventCampaignIntegrity,
	resolveCampaignPartnerFromEvent,
	type CampaignRegistry,
	type EventRegistry
} from '$lib/server/event-campaign-integrity';
import {
	eventsPath,
	eventsSchemaPath,
	campaignsPath,
	campaignsSchemaPath
} from '$lib/server/data-paths';

export type DraftAction = 'preview' | 'save';
export type DraftMode = 'training' | 'external';
export type CampaignMode = 'auto' | 'existing';

export type DraftRequestPayload = {
	action: DraftAction;
	mode: DraftMode;
	confirmWrite?: boolean;
	eventInput: {
		id: string;
		slug: string;
		title?: string;
		tagline?: string;
		summary?: string;
		type?: string;
		typeLabel?: string;
		visibility?: EventSource['visibility'];
		lifecycleStatus?: EventSource['lifecycleStatus'];
		registrationStatus?: EventSource['registrationStatus'];
		ctaLabel?: string;
		ctaUrl?: string;
		timeZoneIana?: string;
		locationMode?: EventSource['location']['mode'];
		locationPublicLabel?: string;
		locationDetailsVisibility?: EventSource['location']['detailsVisibility'];
		sessions?: Array<{ startAtUtc: string; endAtUtc: string }>;
		programSku?: string;
		startDate?: string;
		startTimeLocal?: string;
		durationDays?: number;
		estimatedHoursCommitment?: number;
		partnerCodes?: string[];
		descriptionBodyMd?: string;
		highlights?: string[];
		audienceBullets?: string[];
		outcomes?: string[];
		agenda?: Array<{ title: string; details?: string[] }>;
		faq?: Array<{ question: string; answer: string }>;
		heroImage?: string;
		heroImageAlt?: string;
		image?: string;
		imageAlt?: string;
	};
	campaignInput?: {
		mode: CampaignMode;
		campaignId?: string;
		partner?: string;
		partnerLabel?: string;
		utmSource?: string;
		utmMedium?: string;
		utmCampaign?: string;
		src?: string;
		ad?: string;
		description?: string;
	};
	imageSelection?: {
		heroImage?: string;
		image?: string;
		heroImageAlt?: string;
		imageAlt?: string;
	};
};

export type DraftResponse = {
	eventDraft: EventSource;
	campaignDraft: Campaign | null;
	validation: {
		eventIdExists: boolean;
		eventSlugExists: boolean;
		campaignIdExists: boolean;
		campaignLandingPathExists: boolean;
	};
	writes?: {
		eventsPath: string;
		campaignsPath?: string;
	};
};

export const BASE36_ID_PATTERN = /^[a-z0-9]{6}$/;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const toTrimmed = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const toTrimmedArray = (value: unknown): string[] =>
	Array.isArray(value) ? value.map((item) => toTrimmed(item)).filter(Boolean) : [];

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

let cachedValidateEvents: ReturnType<typeof ajv.compile> | null = null;
let cachedValidateCampaigns: ReturnType<typeof ajv.compile> | null = null;

const loadEventRegistry = async (): Promise<EventRegistry> => {
	const raw = await fs.readFile(eventsPath, 'utf-8');
	return JSON.parse(raw) as EventRegistry;
};

const loadCampaignRegistry = async (): Promise<CampaignRegistry> => {
	const raw = await fs.readFile(campaignsPath, 'utf-8');
	return JSON.parse(raw) as CampaignRegistry;
};

const ensureEventValidator = async () => {
	if (cachedValidateEvents) return cachedValidateEvents;
	const schemaRaw = await fs.readFile(eventsSchemaPath, 'utf-8');
	cachedValidateEvents = ajv.compile(JSON.parse(schemaRaw));
	return cachedValidateEvents;
};

const ensureCampaignValidator = async () => {
	if (cachedValidateCampaigns) return cachedValidateCampaigns;
	const schemaRaw = await fs.readFile(campaignsSchemaPath, 'utf-8');
	cachedValidateCampaigns = ajv.compile(JSON.parse(schemaRaw));
	return cachedValidateCampaigns;
};

const createBase36Id = (): string => {
	const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
	const bytes = crypto.randomBytes(6);
	let out = '';
	for (const byte of bytes) out += alphabet[byte % 36];
	return out;
};

export const createDefaultEventId = (): string => createBase36Id();

const assertBase36Id = (value: string, field: string): void => {
	if (!BASE36_ID_PATTERN.test(value)) {
		throw new Error(`${field} must be a 6-char base36 string (^[a-z0-9]{6}$).`);
	}
};

const assertSlug = (value: string, field: string): void => {
	if (!SLUG_PATTERN.test(value)) {
		throw new Error(`${field} must be lowercase URL-safe (^[a-z0-9]+(?:-[a-z0-9]+)*$).`);
	}
};

const assertUtcTimestamp = (value: string, field: string): void => {
	if (!value || Number.isNaN(new Date(value).valueOf()) || !value.endsWith('Z')) {
		throw new Error(`${field} must be a valid UTC ISO timestamp ending in Z.`);
	}
};

const toExternalEvent = (payload: DraftRequestPayload): EventSource => {
	const input = payload.eventInput;
	const id = toTrimmed(input.id);
	const slug = toTrimmed(input.slug);
	const title = toTrimmed(input.title);
	const tagline = toTrimmed(input.tagline);
	const summary = toTrimmed(input.summary);
	const ctaLabel = toTrimmed(input.ctaLabel) || 'Learn more';
	const locationPublicLabel = toTrimmed(input.locationPublicLabel) || 'Online';
	const sessions = (input.sessions ?? []).map((session, index) => {
		const startAtUtc = toTrimmed(session.startAtUtc);
		const endAtUtc = toTrimmed(session.endAtUtc);
		assertUtcTimestamp(startAtUtc, `sessions[${index.toString()}].startAtUtc`);
		assertUtcTimestamp(endAtUtc, `sessions[${index.toString()}].endAtUtc`);
		return { startAtUtc, endAtUtc };
	});

	if (!title) throw new Error('title is required for external events.');
	if (!tagline) throw new Error('tagline is required for external events.');
	if (!summary) throw new Error('summary is required for external events.');
	if (!sessions.length) throw new Error('At least one session is required for external events.');

	const descriptionBodyMd = toTrimmed(input.descriptionBodyMd);
	const highlights = (input.highlights ?? []).map((item) => toTrimmed(item)).filter(Boolean);
	const audienceBullets = (input.audienceBullets ?? [])
		.map((item) => toTrimmed(item))
		.filter(Boolean);
	const outcomes = (input.outcomes ?? []).map((item) => toTrimmed(item)).filter(Boolean);
	const agenda = (input.agenda ?? [])
		.map((item) => ({
			title: toTrimmed(item.title),
			details: toTrimmedArray(item.details)
		}))
		.filter((item) => Boolean(item.title))
		.map((item) => ({
			title: item.title,
			details: item.details.length ? item.details : undefined
		}));
	const faq = (input.faq ?? [])
		.map((item, index) => ({
			key: `faq_${(index + 1).toString().padStart(2, '0')}`,
			question: toTrimmed(item.question),
			blocks: [{ type: 'paragraph' as const, text: toTrimmed(item.answer) }]
		}))
		.filter((item) => item.question && item.blocks[0].text);

	return {
		id,
		slug,
		title,
		tagline,
		type: toTrimmed(input.type) || 'event',
		typeLabel: toTrimmed(input.typeLabel) || undefined,
		summary,
		sessions,
		visibility: input.visibility ?? 'draft',
		lifecycleStatus: input.lifecycleStatus ?? 'scheduled',
		registrationStatus: input.registrationStatus ?? 'closed',
		cta: {
			label: ctaLabel,
			url: toTrimmed(input.ctaUrl) || undefined,
			campaignId: id
		},
		description: descriptionBodyMd ? { summary, bodyMd: descriptionBodyMd } : undefined,
		highlights: highlights.length ? highlights : undefined,
		audienceBullets: audienceBullets.length ? audienceBullets : undefined,
		outcomes: outcomes.length ? outcomes : undefined,
		agenda: agenda.length ? agenda : undefined,
		faq: faq.length ? faq : getFaqPresetItemsSnapshot('event-signup-core-v1'),
		timeZoneIana: 'America/Los_Angeles',
		location: {
			mode: input.locationMode ?? 'online',
			publicLabel: locationPublicLabel,
			detailsVisibility: input.locationDetailsVisibility ?? 'public'
		},
		heroImage: toTrimmed(input.heroImage) || '/images/cambermast-social-sharing-1.png',
		image: toTrimmed(input.image) || '/images/cambermast-social-sharing-1.png',
		heroImageAlt: toTrimmed(input.heroImageAlt) || title,
		imageAlt: toTrimmed(input.imageAlt) || title,
		partners: (input.partnerCodes ?? []).map((code) => ({ code })),
		campaignId: id
	};
};

const toTrainingEvent = (payload: DraftRequestPayload): EventSource => {
	const input = payload.eventInput;
	const programSku = toTrimmed(input.programSku);
	const startDate = toTrimmed(input.startDate);
	if (!programSku) throw new Error('programSku is required for training events.');
	if (!startDate) throw new Error('startDate is required for training events.');
	if (!getTrainingProgramBySku(programSku))
		throw new Error(`Training program ${programSku} not found.`);

	const event = buildTrainingSessionEventFromProgramSku({
		programSku,
		id: toTrimmed(input.id),
		slug: toTrimmed(input.slug),
		startDate,
		startTimeLocal: toTrimmed(input.startTimeLocal) || undefined,
		durationDays:
			typeof input.durationDays === 'number' && Number.isFinite(input.durationDays)
				? input.durationDays
				: undefined,
		estimatedHoursCommitment:
			typeof input.estimatedHoursCommitment === 'number' &&
			Number.isFinite(input.estimatedHoursCommitment)
				? input.estimatedHoursCommitment
				: undefined,
		summary: toTrimmed(input.summary) || undefined,
		visibility: input.visibility ?? 'draft',
		registrationStatus: input.registrationStatus ?? 'none',
		ctaLabel: toTrimmed(input.ctaLabel) || undefined,
		ctaUrl: toTrimmed(input.ctaUrl) || undefined,
		partnerCodes: input.partnerCodes ?? undefined
	});

	event.campaignId = event.id;
	event.cta = {
		...event.cta,
		campaignId: event.cta.campaignId ?? event.id
	};

	if (input.lifecycleStatus) event.lifecycleStatus = input.lifecycleStatus;
	if (toTrimmed(input.title)) event.title = toTrimmed(input.title);
	if (toTrimmed(input.typeLabel)) event.typeLabel = toTrimmed(input.typeLabel);
	if (toTrimmed(input.descriptionBodyMd)) {
		const summary = toTrimmed(input.summary) || event.summary;
		event.description = { summary, bodyMd: toTrimmed(input.descriptionBodyMd) };
	}
	if (input.highlights?.length) {
		event.highlights = input.highlights.map((item) => toTrimmed(item)).filter(Boolean);
	}
	if (input.audienceBullets?.length) {
		event.audienceBullets = input.audienceBullets.map((item) => toTrimmed(item)).filter(Boolean);
	}
	if (input.outcomes?.length) {
		event.outcomes = input.outcomes.map((item) => toTrimmed(item)).filter(Boolean);
	}
	if (input.agenda?.length) {
		event.agenda = input.agenda
			.map((item) => ({
				title: toTrimmed(item.title),
				details: toTrimmedArray(item.details)
			}))
			.filter((item) => Boolean(item.title))
			.map((item) => ({
				title: item.title,
				details: item.details.length ? item.details : undefined
			}));
	}
	if (input.faq?.length) {
		event.faq = input.faq
			.map((item, index) => ({
				key: `faq_${(index + 1).toString().padStart(2, '0')}`,
				question: toTrimmed(item.question),
				blocks: [{ type: 'paragraph' as const, text: toTrimmed(item.answer) }]
			}))
			.filter((item) => item.question && item.blocks[0].text);
	}
	if (toTrimmed(input.heroImage)) event.heroImage = toTrimmed(input.heroImage);
	if (toTrimmed(input.image)) event.image = toTrimmed(input.image);
	if (toTrimmed(input.heroImageAlt)) event.heroImageAlt = toTrimmed(input.heroImageAlt);
	if (toTrimmed(input.imageAlt)) event.imageAlt = toTrimmed(input.imageAlt);
	if (input.sessions?.length) {
		event.sessions = input.sessions.map((session, index) => {
			const startAtUtc = toTrimmed(session.startAtUtc);
			const endAtUtc = toTrimmed(session.endAtUtc);
			assertUtcTimestamp(startAtUtc, `sessions[${index.toString()}].startAtUtc`);
			assertUtcTimestamp(endAtUtc, `sessions[${index.toString()}].endAtUtc`);
			return { startAtUtc, endAtUtc };
		});
	}
	if (input.locationMode || input.locationPublicLabel || input.locationDetailsVisibility) {
		event.location = {
			...event.location,
			mode: input.locationMode ?? event.location.mode,
			publicLabel: toTrimmed(input.locationPublicLabel) || event.location.publicLabel,
			detailsVisibility: input.locationDetailsVisibility ?? event.location.detailsVisibility
		};
	}

	return event;
};

const applyImageSelection = (event: EventSource, payload: DraftRequestPayload): EventSource => {
	const selection = payload.imageSelection;
	if (!selection) return event;
	const next = { ...event };
	const heroImage = toTrimmed(selection.heroImage);
	const image = toTrimmed(selection.image);
	const heroImageAlt = toTrimmed(selection.heroImageAlt);
	const imageAlt = toTrimmed(selection.imageAlt);
	if (heroImage) next.heroImage = heroImage;
	if (image) next.image = image;
	if (heroImageAlt) next.heroImageAlt = heroImageAlt;
	if (imageAlt) next.imageAlt = imageAlt;
	return next;
};

const buildCampaignDraft = (
	payload: DraftRequestPayload,
	eventDraft: EventSource,
	existingCampaigns: Campaign[]
): Campaign | null => {
	const mode = payload.campaignInput?.mode ?? 'auto';

	if (mode === 'existing') {
		const campaignId = toTrimmed(payload.campaignInput?.campaignId);
		if (!campaignId) throw new Error('campaignId is required when campaign mode is existing.');
		const existing = existingCampaigns.find((campaign) => campaign.id === campaignId);
		if (!existing) throw new Error(`Campaign ${campaignId} does not exist.`);
		const expectedLandingPath = `/events/${eventDraft.slug}`;
		if (existing.landingPath !== expectedLandingPath) {
			throw new Error(
				`Existing campaign ${campaignId} must use landingPath ${expectedLandingPath} for this event.`
			);
		}
		return { ...existing };
	}

	const campaignId = toTrimmed(payload.campaignInput?.campaignId) || eventDraft.id;
	assertSlug(campaignId, 'campaignId');
	const derivedPartner = resolveCampaignPartnerFromEvent(eventDraft);

	return buildDefaultEventCampaign({
		id: eventDraft.id,
		slug: eventDraft.slug,
		title: eventDraft.title,
		campaignId,
		partner: toTrimmed(payload.campaignInput?.partner) || derivedPartner.partner,
		partnerLabel: toTrimmed(payload.campaignInput?.partnerLabel) || derivedPartner.partnerLabel,
		description: toTrimmed(payload.campaignInput?.description) || undefined,
		utmSource: toTrimmed(payload.campaignInput?.utmSource) || 'qr',
		utmMedium: toTrimmed(payload.campaignInput?.utmMedium) || 'offline',
		utmCampaign: toTrimmed(payload.campaignInput?.utmCampaign) || 'events',
		src: toTrimmed(payload.campaignInput?.src) || 'qr',
		ad: toTrimmed(payload.campaignInput?.ad) || undefined
	});
};

const toJsonString = (value: unknown): string => `${JSON.stringify(value, null, '\t')}\n`;

const getCollisions = (
	eventDraft: EventSource,
	campaignDraft: Campaign | null,
	eventRegistry: EventRegistry,
	campaignRegistry: CampaignRegistry,
	payload: DraftRequestPayload
) => {
	const campaignMode = payload.campaignInput?.mode ?? 'auto';
	return {
		eventIdExists: eventRegistry.events.some((event) => event.id === eventDraft.id),
		eventSlugExists: eventRegistry.events.some((event) => event.slug === eventDraft.slug),
		campaignIdExists:
			campaignMode === 'existing'
				? false
				: Boolean(campaignDraft?.id) &&
					campaignRegistry.campaigns.some((campaign) => campaign.id === campaignDraft?.id),
		campaignLandingPathExists:
			campaignMode === 'existing'
				? false
				: Boolean(campaignDraft?.landingPath) &&
					campaignRegistry.campaigns.some(
						(campaign) => campaign.landingPath === campaignDraft?.landingPath
					)
	};
};

const throwOnCollision = (collisions: DraftResponse['validation']): void => {
	if (collisions.eventIdExists) {
		throw new Error('Event ID already exists in events.json. Choose a different 6-char ID.');
	}
	if (collisions.eventSlugExists) {
		throw new Error('Event slug already exists in events.json. Choose a unique slug.');
	}
	if (collisions.campaignIdExists) {
		throw new Error('Campaign ID already exists in campaigns.json. Choose a unique campaign ID.');
	}
	if (collisions.campaignLandingPathExists) {
		throw new Error(
			'Campaign landingPath already exists in campaigns.json. Use a different event slug or campaign.'
		);
	}
};

const validateRegistries = async (
	eventRegistry: EventRegistry,
	campaignRegistry: CampaignRegistry
) => {
	const validateEvents = await ensureEventValidator();
	const eventsValid = validateEvents(eventRegistry);
	if (!eventsValid) {
		throw new Error(`Events schema validation failed: ${ajv.errorsText(validateEvents.errors)}`);
	}

	const validateCampaigns = await ensureCampaignValidator();
	const campaignsValid = validateCampaigns(campaignRegistry);
	if (!campaignsValid) {
		throw new Error(
			`Campaigns schema validation failed: ${ajv.errorsText(validateCampaigns.errors)}`
		);
	}

	assertEventCampaignIntegrity(eventRegistry.events, campaignRegistry.campaigns);
};

const withCampaignLinkage = (
	eventDraft: EventSource,
	campaignDraft: Campaign | null,
	campaignMode: CampaignMode
): EventSource => {
	const campaignId = campaignDraft?.id;
	if (!campaignId) return eventDraft;
	return {
		...eventDraft,
		campaignId,
		cta: {
			...eventDraft.cta,
			campaignId
		}
	};
};

export const buildDrafts = async (payload: DraftRequestPayload): Promise<DraftResponse> => {
	const eventId = toTrimmed(payload.eventInput.id);
	const eventSlug = toTrimmed(payload.eventInput.slug);
	assertBase36Id(eventId, 'eventInput.id');
	assertSlug(eventSlug, 'eventInput.slug');

	const eventRegistry = await loadEventRegistry();
	const campaignRegistry = await loadCampaignRegistry();

	let eventDraft =
		payload.mode === 'training' ? toTrainingEvent(payload) : toExternalEvent(payload);
	const campaignDraft = buildCampaignDraft(payload, eventDraft, campaignRegistry.campaigns);
	eventDraft = withCampaignLinkage(
		eventDraft,
		campaignDraft,
		payload.campaignInput?.mode ?? 'auto'
	);
	eventDraft = applyImageSelection(eventDraft, payload);

	if (!eventDraft.heroImage || !eventDraft.image) {
		throw new Error(
			'heroImage and image are required. Generate/select images or set URLs manually.'
		);
	}

	const validation = getCollisions(
		eventDraft,
		campaignDraft,
		eventRegistry,
		campaignRegistry,
		payload
	);

	if (payload.action === 'save') {
		if (!payload.confirmWrite) throw new Error('confirmWrite must be true for save action.');
		throwOnCollision(validation);

		const nextEvents: EventRegistry = {
			events: [...eventRegistry.events, eventDraft]
		};
		const nextCampaigns: CampaignRegistry = {
			...campaignRegistry,
			campaigns:
				campaignDraft && (payload.campaignInput?.mode ?? 'auto') !== 'existing'
					? [...campaignRegistry.campaigns, campaignDraft]
					: campaignRegistry.campaigns
		};

		await validateRegistries(nextEvents, nextCampaigns);

		await fs.writeFile(eventsPath, toJsonString(nextEvents), 'utf-8');
		if (nextCampaigns.campaigns.length !== campaignRegistry.campaigns.length) {
			await fs.writeFile(campaignsPath, toJsonString(nextCampaigns), 'utf-8');
		}

		return {
			eventDraft,
			campaignDraft,
			validation,
			writes: {
				eventsPath,
				campaignsPath:
					nextCampaigns.campaigns.length !== campaignRegistry.campaigns.length
						? campaignsPath
						: undefined
			}
		};
	}

	return { eventDraft, campaignDraft, validation };
};

type TrainingDraftArtifactsInput = {
	programSku: string;
	startDate: string;
	id: string;
	campaignId: string;
	slug: string;
	startTimeLocal?: string;
	durationDays?: number;
	estimatedHoursCommitment?: number;
	overwrite?: boolean;
};

type TrainingDraftArtifactsResult = {
	scheduleDraft: ReturnType<typeof buildTrainingDraftScheduleFromProgramSku>;
	eventDraft: EventSource;
	campaignDraft: Campaign | null;
	validation: DraftResponse['validation'];
};

export const buildTrainingDraftArtifacts = async (
	input: TrainingDraftArtifactsInput
): Promise<TrainingDraftArtifactsResult> => {
	const scheduleDraft = buildTrainingDraftScheduleFromProgramSku({
		programSku: input.programSku,
		startDate: input.startDate,
		startTimeLocal: input.startTimeLocal,
		durationDays: input.durationDays,
		estimatedHoursCommitment: input.estimatedHoursCommitment
	});

	const draft = await buildDrafts({
		action: 'preview',
		mode: 'training',
		eventInput: {
			id: input.id,
			slug: input.slug,
			programSku: input.programSku,
			startDate: input.startDate,
			startTimeLocal: input.startTimeLocal,
			durationDays: input.durationDays,
			estimatedHoursCommitment: input.estimatedHoursCommitment,
			visibility: 'draft',
			registrationStatus: 'none',
			ctaLabel: 'Open soon'
		},
		campaignInput: {
			mode: 'auto',
			campaignId: input.campaignId
		}
	});

	if (!input.overwrite) {
		throwOnCollision(draft.validation);
	}

	return {
		scheduleDraft,
		eventDraft: draft.eventDraft,
		campaignDraft: draft.campaignDraft,
		validation: draft.validation
	};
};

export const getDraftPageDefaults = () => {
	const eventId = createBase36Id();
	return {
		eventId,
		campaignId: eventId,
		defaultPartner: getPartnerByCode('NONE')?.code === 'NONE' ? 'cambermast' : 'cambermast'
	};
};
