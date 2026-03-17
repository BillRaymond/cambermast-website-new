import { json } from '@sveltejs/kit';

import { SITE_ORIGIN } from '$lib/config/site';
import { buildCommerceProductsApiPayload } from '$lib/data/api/commerce-products';

export const prerender = true;

export const GET = () => {
	const origin = SITE_ORIGIN.replace(/\/$/, '');
	return json(buildCommerceProductsApiPayload({ origin }));
};
