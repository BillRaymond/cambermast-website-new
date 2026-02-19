import type { EventCardModel } from '$lib/view-models/event-card';

export type CatalogScheduleEntry = EventCardModel;

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
