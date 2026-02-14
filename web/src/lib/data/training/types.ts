export type TrainingCta = {
	label: string;
	url: string;
};

export type TrainingCatalogMeta = {
	id: string;
	summary: string;
	image?: string;
	imageAlt?: string;
	bullets?: string[];
	order: number;
	published?: boolean;
};

export type TrainingStat = {
	label: string;
	value: string | string[];
};

export type TrainingSession = {
	name: string;
	date: string;
	time?: string | string[];
	partner?: string;
	startDate?: string;
	endDate?: string;
	location: string;
	spots: string;
	registerUrl: string;
	draft?: boolean;
};

export type TrainingAgendaBlock = {
	title: string;
	details: string[];
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

export type TrainingScheduleTemplate = {
	durationDays: number;
	hoursPerDayCommitment: number;
	defaultStartTimeLocal: string;
	defaultTimeZone: string;
	defaultTimeZoneLabel: string;
	defaultLocationLabel?: string;
};

export type TrainingProgramPresentation = {
	heroEyebrow?: string;
	partnershipLabel?: string;
	trailerLinkLabel?: string;
	lockInSeatTitle?: string;
	lockInSeatDescription?: string;
	agendaCtaTitle?: string;
	agendaCtaDescription?: string;
	finalCtaTitle?: string;
	finalCtaDescription?: string;
	termsQuestion?: string;
	termsAnswer?: string;
};

export type TrainingProgram = {
	slug: string;
	route: string;
	sku?: string;
	catalog?: TrainingCatalogMeta;
	title: string;
	nickname?: string;
	tagline: string;
	heroImage?: string;
	heroImageAlt?: string;
	ogImage?: string;
	ogImageAlt?: string;
	videoUrl?: string;
	description: string;
	secondaryDescription?: string;
	primaryCta: TrainingCta;
	secondaryCta: TrainingCta;
	scheduleTemplate: TrainingScheduleTemplate;
	stats?: TrainingStat[];
	audience?: string[];
	audienceExamples?: string[];
	objectives?: string[];
	prerequisites?: string[];
	takeaways?: string[];
	sessions?: TrainingSession[];
	draft?: boolean;
	agenda?: TrainingAgendaBlock[];
	resources?: string[];
	aboutTrainer?: TrainingTrainer;
	faqs?: TrainingFaq[];
	presentation?: TrainingProgramPresentation;
};

export type TrainingRegistry = {
	programs: TrainingProgram[];
};
