export type CatalogScheduleEntry = {
	id: string;
	title: string;
	subtitle?: string;
	date: string;
	time?: string | string[];
	location?: string;
	image?: string;
	imageAlt?: string;
	certificateText?: string;
	videoUrl?: string;
	learnMoreUrl?: string;
	typeLabel?: string;
	registerUrl?: string;
	registerLabel?: string;
	statusLabel?: string;
};

export type CatalogCardData = {
	title: string;
	summary?: string;
	bullets?: string[];
	image?: string;
	imageAlt?: string;
	route?: string;
	sku?: string;
	duration?: string | string[];
	videoUrl?: string;
	certificateText?: string;
	upcomingSessions?: CatalogScheduleEntry[];
	happeningSessions?: CatalogScheduleEntry[];
	scheduleUrl?: string;
	scheduleLabel?: string;
};
