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
	startAtUtc: string;
	endAtUtc?: string;
	visibility: EventVisibility;
	lifecycleStatus: EventLifecycleStatus;
	registrationStatus: EventRegistrationStatus;
	cta: EventCta;
	location: EventLocation;
	tagline?: string;
	description?: string | EventDescription;
	highlights?: string[];
	image?: string;
	imageAlt?: string;
	speakers?: EventSpeaker[];
	programRef?: EventProgramRef;
	schedule?: EventSchedule;
	partners?: EventPartner[];
	campaignId?: string;
	links?: EventLinks;
	typeLabel?: string;
	date?: string;
	time?: string | string[];
	timezone?: string;
};

export type Event = Omit<EventSource, 'location'> & {
	locationMeta: EventLocation;
	location: string;
	typeLabel: string;
	date: string;
	time?: string | string[];
	timezone: string;
};
