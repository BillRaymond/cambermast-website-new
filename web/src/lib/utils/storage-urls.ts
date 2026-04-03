const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const REDACTED_C3_API_BASE = 'https://.../api/c3';
export const REDACTED_MINIO_BROWSER_BASE = 'https://.../browser/blobs/';

export const getC3ApiBase = (configuredApiBase?: string): string =>
	trimTrailingSlash(configuredApiBase?.trim() || REDACTED_C3_API_BASE);

export const getMinioBrowserBase = (configuredBrowserBase?: string): string =>
	`${trimTrailingSlash(configuredBrowserBase?.trim() || REDACTED_MINIO_BROWSER_BASE)}/`;

export const getMinioBrowserUrl = (
	minioKey: string,
	configuredBrowserBase?: string
): string => `${getMinioBrowserBase(configuredBrowserBase)}${minioKey.replace(/^\/+/, '')}`;
