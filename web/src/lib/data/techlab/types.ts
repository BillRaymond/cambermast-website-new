import type { TrainingProgram } from '../training/types';

export type TechlabReview = {
	quote: string;
	author: string;
	role?: string;
};

export type TechlabTestimonial = {
	quote: string;
	author: string;
};

// TechLAB mostly mirrors the main training program shape, but keeps
// its own testimonial fields for the legacy TechLAB rendering layer.
export type TechlabProgram = TrainingProgram & {
	reviews?: TechlabReview[];
	testimonial?: TechlabTestimonial;
};
