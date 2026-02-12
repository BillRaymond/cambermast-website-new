import { error } from '@sveltejs/kit';
import { getEvent, listEvents } from '$lib/data/events';
import { getPartnerByCode } from '$lib/data/partners';
import { getTrainingProgramBySku } from '$lib/data/training';
import type { PageLoad } from './$types';

export const prerender = true;

export const entries = () =>
	listEvents({ includeDrafts: true, includeUnlisted: true }).map((event) => ({ slug: event.slug }));

export const load: PageLoad = ({ params }) => {
	const event = getEvent(params.slug, { includeDrafts: true, includeUnlisted: true });

	if (!event) {
		throw error(404, 'Event not found');
	}

	const partner =
		event.partnerCode && event.partnerCode !== 'NONE'
			? getPartnerByCode(event.partnerCode)
			: undefined;
	const relatedProgramSku = event.programRef?.sku;
	const relatedProgram = relatedProgramSku ? getTrainingProgramBySku(relatedProgramSku) : undefined;

	return { event, partner, relatedProgram };
};
