import type { TrainingSession } from '$lib/data/training/types';

export type CatalogCardData = {
	title: string;
	summary?: string;
	bullets?: string[];
	image?: string;
	imageAlt?: string;
	route?: string;
	sku?: string;
	duration?: string | string[];
	upcomingSessions?: TrainingSession[];
	happeningSessions?: TrainingSession[];
	scheduleUrl?: string;
	scheduleLabel?: string;
};
