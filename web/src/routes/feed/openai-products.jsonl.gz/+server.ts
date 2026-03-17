import { gzipSync } from 'node:zlib';

import { SITE_ORIGIN } from '$lib/config/site';
import {
	buildCommerceProductsApiPayload,
	serializeCommerceProductsJsonl
} from '$lib/data/api/commerce-products';

export const prerender = true;

export const GET = () => {
	const origin = SITE_ORIGIN.replace(/\/$/, '');
	const payload = buildCommerceProductsApiPayload({ origin });
	const body = gzipSync(serializeCommerceProductsJsonl(payload.items));

	return new Response(body, {
		headers: {
			'Content-Type': 'application/gzip',
			'Content-Disposition': 'inline; filename="openai-products.jsonl.gz"',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
