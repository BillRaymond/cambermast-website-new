import { json } from '@sveltejs/kit';

import { SITE_ORIGIN } from '$lib/config/site';
import { buildTrainingApiPayload } from '$lib/data/api/training';

export const prerender = true;

export const GET = () => {
	const origin = SITE_ORIGIN.replace(/\/$/, '');
	return json(buildTrainingApiPayload({ origin }));
};
