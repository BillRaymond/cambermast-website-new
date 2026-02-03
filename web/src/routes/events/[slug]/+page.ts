import { error } from '@sveltejs/kit';

import { dev } from '$app/environment';
import { getEvent, listEvents } from '$lib/data/events';
import { listTrainingPrograms } from '$lib/data/training';

import type { PageLoad } from './$types';

export const prerender = true;

export const entries = () =>
	listEvents({ includeDrafts: false }).map((event) => ({ slug: event.slug }));

export const load: PageLoad = ({ params }) => {
	const event = getEvent(params.slug, { includeDrafts: dev });

	if (!event || (event.draft && !dev)) {
		throw error(404, 'Event not found');
	}

	const relatedPrograms = event.relatedProgramSlugs?.length
		? listTrainingPrograms().filter((program) =>
				event.relatedProgramSlugs?.includes(program.slug)
		  )
		: [];

	return { event, relatedPrograms };
};
