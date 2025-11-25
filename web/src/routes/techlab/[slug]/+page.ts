import { error } from '@sveltejs/kit';

import { getTechlabProgram } from '$lib/data/techlab';

import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ params }) => {
	const program = getTechlabProgram(params.slug);

	if (!program) {
		throw error(404, 'TechLAB program not found');
	}

	return { program };
};
