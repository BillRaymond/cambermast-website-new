import { json } from '@sveltejs/kit';

import { SITE_ORIGIN } from '$lib/config/site';
import { buildFaqPresetsApiPayload } from '$lib/data/api/faq-presets';

export const prerender = true;

export const GET = () => {
	const origin = SITE_ORIGIN.replace(/\/$/, '');
	return json(buildFaqPresetsApiPayload({ origin }));
};
