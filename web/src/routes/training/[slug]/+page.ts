import { error } from '@sveltejs/kit';

import { getTrainingProgram } from '$lib/data/training';

import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ params }) => {
	const program = getTrainingProgram(params.slug);

	if (!program) {
		throw error(404, 'Training program not found');
	}

	return { program };
};
