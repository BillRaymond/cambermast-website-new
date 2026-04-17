import { error } from '@sveltejs/kit';

import { getPrintableResource, listPrintableResources } from '$lib/data/resources/printable';

import type { PageLoad } from './$types';

export const prerender = true;

export const entries = () =>
	listPrintableResources().map((resource) => ({
		slug: resource.slug
	}));

export const load: PageLoad = ({ params }) => {
	const resource = getPrintableResource(params.slug);

	if (!resource) {
		throw error(404, 'Printable resource not found');
	}

	return { resource };
};
