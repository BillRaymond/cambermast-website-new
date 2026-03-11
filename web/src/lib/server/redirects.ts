import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RedirectEntry, RedirectRegistry } from '$lib/data/redirects/types';
import { validateRedirectRegistry } from '$lib/data/redirects/validation';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const redirectsPath = path.resolve(__dirname, '../data/redirects/redirects.json');

const toJsonString = (value: RedirectRegistry): string => `${JSON.stringify(value, null, '\t')}\n`;

export const readRedirectRegistryFromDisk = async (): Promise<RedirectRegistry> => {
	const raw = await fs.readFile(redirectsPath, 'utf-8');
	return JSON.parse(raw) as RedirectRegistry;
};

export const writeRedirectRegistryToDisk = async (registry: RedirectRegistry): Promise<void> => {
	const nextRegistry: RedirectRegistry = {
		redirects: [...registry.redirects].sort((a, b) => a.sourcePath.localeCompare(b.sourcePath))
	};
	const errors = validateRedirectRegistry(nextRegistry);
	if (errors.length > 0) {
		throw new Error(errors.join('\n'));
	}

	await fs.writeFile(redirectsPath, toJsonString(nextRegistry), 'utf-8');
};

export const upsertRedirectEntryInRegistry = (
	registry: RedirectRegistry,
	entry: RedirectEntry,
	previousSourcePath?: string
): RedirectRegistry => {
	const redirects = registry.redirects.filter((candidate) => candidate.sourcePath !== previousSourcePath);
	const existingIndex = redirects.findIndex((candidate) => candidate.sourcePath === entry.sourcePath);
	if (existingIndex >= 0) {
		redirects.splice(existingIndex, 1, entry);
	} else {
		redirects.push(entry);
	}
	return { redirects };
};

export const deleteRedirectEntryFromRegistry = (
	registry: RedirectRegistry,
	sourcePath: string
): RedirectRegistry => ({
	redirects: registry.redirects.filter((entry) => entry.sourcePath !== sourcePath)
});
