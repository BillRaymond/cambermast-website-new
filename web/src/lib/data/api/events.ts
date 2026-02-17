import eventsData from '$lib/data/events/events.json';
import type { EventSource } from '$lib/data/events/types';

type BuildEventsApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

type PublicEvent = EventSource;

const publicEvents = ((eventsData.events ?? []) as PublicEvent[])
	.filter((candidate) => {
		if (candidate.visibility !== 'public') return false;
		if (!candidate.startAtUtc) return false;
		if (!candidate.location) return false;
		if (!candidate.cta) return false;
		if (!candidate.lifecycleStatus || !candidate.registrationStatus) return false;
		return true;
	})
	.sort((a, b) => new Date(a.startAtUtc ?? '').valueOf() - new Date(b.startAtUtc ?? '').valueOf());

const toApiEvent = (event: PublicEvent, origin: string) => ({
	id: event.id,
	slug: event.slug,
	title: event.title,
	subtitle: event.subtitle,
	type: event.type,
	typeLabel: event.typeLabel,
	tagline: event.tagline,
	summary: event.summary,
	description: event.description,
	highlights: event.highlights,
	startAtUtc: event.startAtUtc,
	endAtUtc: event.endAtUtc,
	date: event.date,
	time: event.time,
	timezone: event.timezone,
	timeZoneIana: event.timeZoneIana,
	visibility: event.visibility,
	lifecycleStatus: event.lifecycleStatus,
	registrationStatus: event.registrationStatus,
	cta: event.cta!,
	location: event.location!,
	ticketing: event.ticketing,
	registrationSettings: event.registrationSettings,
	speakers: event.speakers,
	programRef: event.programRef,
	schedule: event.schedule,
	partners: event.partners,
	campaignId: event.campaignId,
	links: event.links,
	heroImage: event.heroImage,
	heroImageAlt: event.heroImageAlt,
	image: event.image,
	imageAlt: event.imageAlt,
	url: `${origin}/events/${event.slug}`
});

export const buildEventsApiPayload = ({ origin, generatedAt }: BuildEventsApiPayloadInput) => ({
	generatedAt: generatedAt ?? new Date().toISOString(),
	events: publicEvents.map((event) => toApiEvent(event, origin))
});

export const buildEventsApiExamples = (origin: string) => {
	const payload = buildEventsApiPayload({ origin, generatedAt: '2026-02-12T18:15:00.000Z' });
	const first = payload.events.at(0) ?? null;
	const partner = payload.events.find((event) => (event.partners?.length ?? 0) > 0) ?? null;
	return {
		response: payload,
		example: first ? { generatedAt: payload.generatedAt, events: [first] } : payload,
		partnerExample: partner ? { generatedAt: payload.generatedAt, events: [partner] } : null
	};
};
