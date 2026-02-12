import { error } from '@sveltejs/kit';

import { getTrainingProgram } from '$lib/data/training';
import { isEventUpcomingUi, listEventUi } from '$lib/view-models/events';

import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ params }) => {
	const program = getTrainingProgram(params.slug);

	if (!program) {
		throw error(404, 'Training program not found');
	}

	const relatedEvents = listEventUi()
		.filter((event) => isEventUpcomingUi(event))
		.filter((event) => event.programRef?.sku === program.sku);

	return { program, relatedEvents };
};
