import { json } from '@sveltejs/kit';

import catalog from '$lib/data/catalog.json';
import { SITE_ORIGIN } from '$lib/config/site';
import { listTrainingPrograms } from '$lib/data/training';

/**
 * Static JSON endpoint that mirrors the catalog/training data used by the site.
 * The handler is prerendered so it deploys as a flat file; downstream automations
 * (like n8n workflows) can fetch `/catalog.json` and receive production-ready links.
 *
 * Site origin is configured in `$lib/config/site.ts`.
 */

/**
 * Absolute base URL for production. Used to prefix any relative asset or route references
 * so that consumers (like n8n) receive links that work outside the SvelteKit environment.
 */
const PRODUCTION_BASE_URL = SITE_ORIGIN;

/**
 * Determine whether a string already represents an absolute URL or protocol-specific link.
 * We skip rewriting values that already include http/https schemes as well as mailto/tel links.
 */
const isAbsoluteUrl = (value: string): boolean =>
	/^https?:\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('tel:');

/**
 * Convert a string to an absolute URL when it begins with a leading slash.
 * Strings that are already absolute or are not paths are returned unchanged.
 */
const toAbsoluteUrl = (value: string): string => {
	// Leave absolute URLs and protocol handlers untouched.
	if (isAbsoluteUrl(value)) {
		return value;
	}

	// Prefix leading-slash paths with the production base URL so links resolve correctly.
	if (value.startsWith('/')) {
		return `${PRODUCTION_BASE_URL}${value}`;
	}

	// Any other strings (e.g., IDs or plain text) pass through as-is.
	return value;
};

/**
 * Recursively traverse any JSON-compatible value and rewrite strings that represent routes/assets.
 * The function handles nested arrays and objects, mirroring the shape of the catalog data.
 */
const mapUrlsToAbsolute = (value: unknown): unknown => {
	// Direct strings can be normalized immediately.
	if (typeof value === 'string') {
		return toAbsoluteUrl(value);
	}

	// Arrays require mapping each element, preserving order.
	if (Array.isArray(value)) {
		return value.map(mapUrlsToAbsolute);
	}

	// Plain objects get their entries rewritten while keeping the same keys.
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
				key,
				mapUrlsToAbsolute(nestedValue)
			])
		);
	}

	// Non-string primitive values (numbers, booleans, null) are returned untouched.
	return value;
};

/**
 * Enable SvelteKit's static adapter to generate /catalog.json during the build.
 * This keeps the endpoint fully static and deploy-friendly.
 */
export const prerender = true;

/**
 * GET handler that exposes the catalog and training program data.
 * Relative URLs are rewritten so downstream automations receive production-ready links.
 */
export const GET = () => {
	// Pull the most up-to-date training programs at request time.
	const trainingPrograms = listTrainingPrograms().map((program) => {
		const { sessions, ...programWithoutSchedule } = program;
		return programWithoutSchedule;
	});

	// Wrap both data sources in the same transformation to ensure consistency.
	return json({
		catalog: mapUrlsToAbsolute(catalog),
		trainingPrograms: mapUrlsToAbsolute(trainingPrograms)
	});
};
