import { listExternalEvents } from '$lib/data/external-events';
import { listTrainingPrograms } from '$lib/data/training';

import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	return {
		trainingPrograms: listTrainingPrograms({ includeDrafts: true }),
		externalEvents: listExternalEvents()
	};
};

