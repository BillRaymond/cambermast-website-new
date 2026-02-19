import { error } from '@sveltejs/kit';
import { listEventUi, getEventUi } from '$lib/view-models/events';
import { getPartnerByCode } from '$lib/data/partners';
import { getTrainingProgramBySku } from '$lib/data/training';
import type { PageLoad } from './$types';

export const prerender = true;

export const entries = () =>
	listEventUi({ includeDrafts: true, includeUnlisted: true }).map((event) => ({
		slug: event.slug
	}));

export const load: PageLoad = ({ params }) => {
	const event = getEventUi(params.slug, { includeDrafts: true, includeUnlisted: true });

	if (!event) {
		throw error(404, 'Event not found');
	}

	const partners = (event.partners ?? [])
		.map((partnerRef) => {
			const partner = getPartnerByCode(partnerRef.code);
			if (partner) {
				return { ...partner, role: partnerRef.role };
			}
			return {
				code: partnerRef.code,
				name: partnerRef.code,
				slug: partnerRef.code.toLowerCase(),
				role: partnerRef.role
			};
		})
		.filter((partner) => partner.code !== 'NONE');
	const relatedProgramSku = event.programRef?.sku;
	const relatedProgram = relatedProgramSku ? getTrainingProgramBySku(relatedProgramSku) : undefined;

	return { event, partners, relatedProgram };
};
