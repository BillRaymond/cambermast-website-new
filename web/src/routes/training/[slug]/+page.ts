import { error } from '@sveltejs/kit';

import { isEventUpcoming, listEvents } from '$lib/data/events';
import { getTrainingProgram } from '$lib/data/training';

import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ params }) => {
	const program = getTrainingProgram(params.slug);

	if (!program) {
		throw error(404, 'Training program not found');
	}

	const relatedEvents = listEvents()
		.filter((event) => isEventUpcoming(event))
		.filter((event) => event.relatedProgramSlugs?.includes(program.slug));

	return { program, relatedEvents };
};
