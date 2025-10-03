export type TrainingCta = {
	label: string;
	url: string;
};

export type TrainingStat = {
	label: string;
	value: string | string[];
};

export type TrainingSession = {
	name: string;
	date: string;
	startDate?: string;
	endDate?: string;
	time: string;
	location: string;
	spots: string;
	registerUrl: string;
};

export type TrainingAgendaBlock = {
	title: string;
	details: string[];
};

export type TrainingTestimonial = {
	quote: string;
	author: string;
};

export type TrainingTrainer = {
	title: string;
	name: string;
	role: string;
	summary: string;
	photo?: string;
	photoAlt?: string;
	highlights?: string[];
};

export type TrainingFaq = {
	question: string;
	answers?: string[];
	answer?: string;
};

export type TrainingReview = {
	quote: string;
	author: string;
	role?: string;
};

export type TrainingProgram = {
	slug: string;
	title: string;
	nickname?: string;
	tagline: string;
	heroImage?: string;
	heroImageAlt?: string;
	description: string;
	secondaryDescription?: string;
	primaryCta: TrainingCta;
	secondaryCta: TrainingCta;
	stats?: TrainingStat[];
	audience?: string[];
	audienceExamples?: string[];
	objectives?: string[];
	prerequisites?: string[];
	takeaways?: string[];
	sessions?: TrainingSession[];
	agenda?: TrainingAgendaBlock[];
	resources?: string[];
	reviews?: TrainingReview[];
	testimonial?: TrainingTestimonial;
	aboutTrainer?: TrainingTrainer;
	faqs?: TrainingFaq[];
};
