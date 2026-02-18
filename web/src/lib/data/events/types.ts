import type { FaqItem } from '$lib/data/faq/types';

export type KnownEventType =
	| 'training_session'
	| 'webinar'
	| 'conference_talk'
	| 'community'
	| 'workshop'
	| 'talk'
	| 'panel'
	| 'roundtable'
	| 'fireside'
	| 'event'
	| 'other';

export type EventType = KnownEventType | (string & {});

export type EventVisibility = 'public' | 'unlisted' | 'draft';

export type EventLifecycleStatus = 'scheduled' | 'postponed' | 'canceled' | 'completed';

export type EventRegistrationStatus =
	| 'open'
	| 'closed'
	| 'external'
	| 'none'
	| 'waitlist'
	| 'sold_out';

export type EventLocationMode = 'online' | 'in_person' | 'hybrid';

export type EventLocationDetailsVisibility = 'public' | 'post_signup' | 'tbd';

export type EventSession = {
	startAtUtc: string;
	endAtUtc: string;
};

export type EventSpeaker = {
	name: string;
	title: string;
	shortBio?: string;
	photo?: string;
	photoAlt?: string;
};

export type EventPartnerRole = 'host' | 'sponsor' | 'community' | 'media' | 'partner';

export type EventPartner = {
	code: string;
	role?: EventPartnerRole;
};

export type EventCta = {
	label: string;
	url?: string;
	campaignId?: string;
};

export type EventLocation = {
	mode: EventLocationMode;
	publicLabel: string;
	detailsVisibility: EventLocationDetailsVisibility;
	joinUrl?: string;
	mapUrl?: string;
	venueName?: string;
};

export type EventTicketing = {
	currency: 'USD';
	amountUsd: number;
};

export type EventCapacity = {
	type: 'unlimited' | 'limited';
	limit?: number;
};

export type EventRegistrationSettings = {
	approvalRequired?: boolean;
	capacity?: EventCapacity;
};

export type EventProgramRef = {
	sku: string;
};

export type EventSchedule = {
	durationDays: number;
	estimatedHoursCommitment: number;
};

export type EventDescription = {
	summary?: string;
	bodyMd?: string;
};

export type EventAgendaItem = {
	title: string;
	startsAtLabel?: string;
	outcome?: string;
	details?: string;
};

export type EventFaqItem = FaqItem;

export type EventLinks = {
	recordingUrl?: string;
	slidesUrl?: string;
	conferenceUrl?: string;
};

export type EventSource = {
	id: string;
	slug: string;
	title: string;
	subtitle?: string;
	type: EventType;
	summary: string;
	sessions: EventSession[];
	visibility: EventVisibility;
	lifecycleStatus: EventLifecycleStatus;
	registrationStatus: EventRegistrationStatus;
	cta: EventCta;
	location: EventLocation;
	tagline?: string;
	description?: string | EventDescription;
	highlights?: string[];
	audienceBullets?: string[];
	buildBullets?: string[];
	outcomes?: string[];
	agenda?: EventAgendaItem[];
	faq?: EventFaqItem[];
	image?: string;
	imageAlt?: string;
	speakers?: EventSpeaker[];
	programRef?: EventProgramRef;
	schedule?: EventSchedule;
	partners?: EventPartner[];
	campaignId?: string;
	links?: EventLinks;
	typeLabel?: string;
	timeZoneIana?: string;
	registrationClosesAtUtc?: string;
	ticketing?: EventTicketing;
	registrationSettings?: EventRegistrationSettings;
	heroImage?: string;
	heroImageAlt?: string;
};

export type Event = Omit<EventSource, 'location'> & {
	locationMeta: EventLocation;
	location: string;
	typeLabel: string;
	startAtUtc: string;
	endAtUtc: string;
	date: string;
	time?: string | string[];
	timezone: string;
	timeZoneIana: string;
};
