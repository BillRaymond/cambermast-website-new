import { json } from '@sveltejs/kit';

import { tools } from '$lib/data/tools';
import { SITE_ORIGIN } from '$lib/config/site';

const PRODUCTION_BASE_URL = SITE_ORIGIN;

const isAbsoluteUrl = (value: string): boolean =>
	/^https?:\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('tel:');

const toAbsoluteUrl = (value: string): string => {
	if (isAbsoluteUrl(value)) {
		return value;
	}

	if (value.startsWith('/')) {
		return `${PRODUCTION_BASE_URL}${value}`;
	}

	return value;
};

const mapUrlsToAbsolute = (value: unknown): unknown => {
	if (typeof value === 'string') {
		return toAbsoluteUrl(value);
	}

	if (Array.isArray(value)) {
		return value.map(mapUrlsToAbsolute);
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
				key,
				mapUrlsToAbsolute(nestedValue)
			])
		);
	}

	return value;
};

export const prerender = true;

export const GET = () => json({ tools: mapUrlsToAbsolute(tools) });
