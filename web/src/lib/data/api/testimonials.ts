import { listTestimonials, type Testimonial } from '$lib/data/testimonials';

type BuildTestimonialsApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

const toAbsoluteUrl = (value: string, origin: string): string => {
	if (/^https?:\/\//i.test(value)) return value;
	if (value.startsWith('/')) return `${origin}${value}`;
	return value;
};

const publicTestimonials = listTestimonials()
	.filter((testimonial) => testimonial.allowPublicUse !== false)
	.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());

const toApiTestimonial = (testimonial: Testimonial, origin: string) => ({
	id: testimonial.id,
	programSku: testimonial.programSku,
	programSlug: testimonial.programSlug,
	programRoute: testimonial.programRoute,
	programUrl: toAbsoluteUrl(testimonial.programRoute, origin),
	displayName: testimonial.displayName,
	jobTitle: testimonial.jobTitle,
	company: testimonial.company,
	photoUrl: testimonial.photoUrl ? toAbsoluteUrl(testimonial.photoUrl, origin) : null,
	rating: testimonial.rating,
	quote: testimonial.quote,
	allowPublicUse: testimonial.allowPublicUse,
	featured: testimonial.featured,
	source: testimonial.source,
	createdAt: testimonial.createdAt
});

export const buildTestimonialsApiPayload = ({
	origin,
	generatedAt
}: BuildTestimonialsApiPayloadInput) => ({
	generatedAt: generatedAt ?? new Date().toISOString(),
	testimonials: publicTestimonials.map((testimonial) => toApiTestimonial(testimonial, origin))
});

export const buildTestimonialsApiExamples = (origin: string) => {
	const payload = buildTestimonialsApiPayload({ origin, generatedAt: '2026-02-13T18:15:00.000Z' });
	const first = payload.testimonials.at(0) ?? null;
	return {
		response: payload,
		example: first ? { generatedAt: payload.generatedAt, testimonials: [first] } : payload
	};
};
