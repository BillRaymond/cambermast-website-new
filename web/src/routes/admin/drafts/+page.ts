import { listTrainingScheduleEntries } from '$lib/data/training/schedule';
import { listTrainingPrograms } from '$lib/data/training';

import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	return {
		trainingPrograms: listTrainingPrograms({ includeDrafts: true }),
		trainingEvents: listTrainingScheduleEntries({ includeDrafts: true, includeUnlisted: true })
	};
};
