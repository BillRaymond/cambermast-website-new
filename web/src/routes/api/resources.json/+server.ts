import { json } from '@sveltejs/kit';

import { SITE_ORIGIN } from '$lib/config/site';
import { buildResourcesApiPayload } from '$lib/data/api/resources';

export const prerender = true;

export const GET = () => {
	const origin = SITE_ORIGIN.replace(/\/$/, '');
	return json(buildResourcesApiPayload({ origin }));
};
