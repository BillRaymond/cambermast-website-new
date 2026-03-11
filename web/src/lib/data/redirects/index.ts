import redirectsRegistryData from './redirects.json';
import { runtimeDev } from '$lib/utils/runtime-env';
import type { RedirectEntry, RedirectRegistry } from './types';
import {
	getRedirectImpactTags,
	normalizeRedirectPath,
	validateRedirectRegistry
} from './validation';

const redirectsRegistry = redirectsRegistryData as RedirectRegistry;
const registryErrors = validateRedirectRegistry(redirectsRegistry);
if (registryErrors.length > 0) {
	throw new Error(`Redirect registry is invalid:\n${registryErrors.join('\n')}`);
}

const allRedirects = [...redirectsRegistry.redirects].sort((a, b) =>
	a.sourcePath.localeCompare(b.sourcePath)
);
const enabledRedirects = allRedirects.filter((entry) => entry.enabled);

type ListRedirectOptions = {
	includeDisabled?: boolean;
};

export const listRedirects = (options: ListRedirectOptions = {}): RedirectEntry[] => {
	const { includeDisabled = runtimeDev } = options;
	return includeDisabled ? [...allRedirects] : [...enabledRedirects];
};

export const getRedirectBySourcePath = (
	sourcePath: string,
	options: ListRedirectOptions = {}
): RedirectEntry | undefined => {
	const normalizedPath = normalizeRedirectPath(sourcePath);
	return listRedirects(options).find((entry) => entry.sourcePath === normalizedPath);
};

export const getRedirectImpactSummary = (entry: RedirectEntry) => getRedirectImpactTags(entry);

export type { RedirectCategory, RedirectEntry, RedirectImpactTag, RedirectRegistry, RedirectStatusCode } from './types';
