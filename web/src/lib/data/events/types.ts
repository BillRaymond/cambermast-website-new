export type KnownEventType =
	| 'event'
	| 'webinar'
	| 'talk'
	| 'workshop'
	| 'panel'
	| 'roundtable'
	| 'fireside'
	| 'other';

export type EventType = KnownEventType | (string & {});

export type EventSpeaker = {
	name: string;
	title: string;
	photo?: string;
	photoAlt?: string;
};

export type Event = {
	id: string;
	slug: string;
	title: string;
	type: EventType;
	typeLabel?: string;
	tagline?: string;
	summary: string;
	description: string;
	highlights?: string[];
	date: string;
	time?: string | string[];
	timezone?: string;
	startAt: string;
	endAt?: string;
	location?: string;
	registerUrl: string;
	registerLabel?: string;
	image?: string;
	imageAlt?: string;
	speakers?: EventSpeaker[];
	relatedProgramSlugs?: string[];
	draft?: boolean;
};
