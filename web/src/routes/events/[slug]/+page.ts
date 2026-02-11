import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getEvent, listEvents } from '$lib/data/events';
import { getPartnerByCode } from '$lib/data/partners';
import { getTrainingProgram } from '$lib/data/training';
import type { PageLoad } from './$types';

export const prerender = true;

export const entries = () =>
	listEvents({ includeDrafts: dev, includeUnlisted: true }).map((event) => ({ slug: event.slug }));

export const load: PageLoad = ({ params }) => {
	const event = getEvent(params.slug, { includeDrafts: dev, includeUnlisted: true });

	if (!event) {
		throw error(404, 'Event not found');
	}

	const partner =
		event.partnerCode && event.partnerCode !== 'NONE'
			? getPartnerByCode(event.partnerCode)
			: undefined;
	const relatedProgramSlug = event.programRef?.programSlug ?? event.relatedProgramSlugs?.[0];
	const relatedProgram = relatedProgramSlug ? getTrainingProgram(relatedProgramSlug) : undefined;

	return { event, partner, relatedProgram };
};
