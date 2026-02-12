/**
 * Central testimonial registry.
 *
 * Workflows (like n8n) can regenerate this module when approved testimonials arrive.
 * Each entry ties back to a training SKU so both the public training pages and
 * TechLAB pages can render the same quotes without hitting an API.
 */

import testimonialsJson from './testimonials.json';

export type Testimonial = {
	id: string;
	programSku: string;
	programSlug: string;
	programRoute: string;
	displayName: string;
	jobTitle?: string;
	company?: string;
	photoUrl?: string | null;
	rating: number;
	quote: string;
	allowPublicUse: boolean;
	featured?: boolean;
	source?: 'form' | 'manual' | 'import' | 'training-testimonial';
	createdAt: string;
};

export const testimonials: Testimonial[] = testimonialsJson as Testimonial[];

export const listTestimonials = (): Testimonial[] => [...testimonials];

export const listTestimonialsForSku = (sku?: string): Testimonial[] =>
	sku ? testimonials.filter((testimonial) => testimonial.programSku === sku) : [];

export const listTestimonialsForSlug = (slug?: string): Testimonial[] =>
	slug ? testimonials.filter((testimonial) => testimonial.programSlug === slug) : [];
