import { json } from '@sveltejs/kit';

import { SITE_ORIGIN } from '$lib/config/site';
import { buildCatalogApiPayload } from '$lib/data/api/catalog';

export const prerender = true;

export const GET = () => {
	const origin = SITE_ORIGIN.replace(/\/$/, '');
	return json(buildCatalogApiPayload({ origin }));
};
