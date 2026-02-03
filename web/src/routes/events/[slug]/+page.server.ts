import { error } from '@sveltejs/kit';

import { dev } from '$app/environment';
import { getEvent } from '$lib/data/events';
import { listTrainingPrograms } from '$lib/data/training';

import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = ({ params }) => {
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
