import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import { getRedirectImpactSummary } from '$lib/data/redirects';
import type { RedirectCategory, RedirectEntry, RedirectRegistry } from '$lib/data/redirects';
import { normalizeRedirectPath } from '$lib/data/redirects/validation';
import {
	readRedirectRegistryFromDisk,
	upsertRedirectEntryInRegistry,
	writeRedirectRegistryToDisk
} from '$lib/server/redirects';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

const categoryOptions: RedirectCategory[] = [
	'api',
	'catalog',
	'feed',
	'history',
	'machine-readable',
	'nav',
	'other'
];

const statusCodeOptions = [301, 302, 307, 308] as const;

const toPageEntry = (entry: RedirectEntry) => ({
	...entry,
	impactTags: getRedirectImpactSummary(entry)
});

const sortRedirectsForAdmin = (redirects: RedirectEntry[]) =>
	[...redirects].sort((a, b) => {
		if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
		return a.sourcePath.localeCompare(b.sourcePath);
	});

const toCounts = (registry: RedirectRegistry) => {
	const redirects = registry.redirects;
	return {
		total: redirects.length,
		enabled: redirects.filter((entry) => entry.enabled).length,
		disabled: redirects.filter((entry) => !entry.enabled).length,
		feed: redirects.filter((entry) => entry.sourcePath.startsWith('/feed/')).length,
		api: redirects.filter((entry) => entry.sourcePath.startsWith('/api/')).length,
		nav: redirects.filter((entry) => entry.sourcePath === '/calendar').length
	};
};

const parseEntryFromFormData = (formData: FormData): RedirectEntry => ({
	sourcePath: normalizeRedirectPath(String(formData.get('sourcePath') ?? '')),
	targetPath: normalizeRedirectPath(String(formData.get('targetPath') ?? '')),
	statusCode: Number(formData.get('statusCode') ?? 308) as (typeof statusCodeOptions)[number],
	enabled: formData.get('enabled') === 'on',
	notes: String(formData.get('notes') ?? '').trim() || undefined,
	category: (String(formData.get('category') ?? '').trim() || undefined) as RedirectCategory | undefined,
	allowRestrictedTarget: formData.get('allowRestrictedTarget') === 'on' || undefined
});

export const load: PageServerLoad = async () => {
	const registry = await readRedirectRegistryFromDisk();
	return {
		isDev: dev,
		redirects: sortRedirectsForAdmin(registry.redirects).map(toPageEntry),
		counts: toCounts(registry),
		categoryOptions,
		statusCodeOptions
	};
};

const ensureDevWrite = () => {
	if (!dev) {
		return fail(404, { message: 'Redirect registry editing is only available in development.' });
	}
	return null;
};

const toFailure = (message: string, values?: Record<string, string | boolean | undefined>) =>
	fail(400, { message, values });

export const actions: Actions = {
	create: async ({ request }) => {
		const devFailure = ensureDevWrite();
		if (devFailure) return devFailure;

		const formData = await request.formData();
		const entry = parseEntryFromFormData(formData);

		try {
			const registry = await readRedirectRegistryFromDisk();
			const nextRegistry = upsertRedirectEntryInRegistry(registry, entry);
			await writeRedirectRegistryToDisk(nextRegistry);
		} catch (error) {
			return toFailure(error instanceof Error ? error.message : 'Unable to save redirect.', {
				sourcePath: entry.sourcePath,
				targetPath: entry.targetPath,
				statusCode: String(entry.statusCode),
				enabled: entry.enabled,
				notes: entry.notes,
				category: entry.category,
				allowRestrictedTarget: entry.allowRestrictedTarget
			});
		}

		throw redirect(303, '/admin/redirects');
	},
	update: async ({ request }) => {
		const devFailure = ensureDevWrite();
		if (devFailure) return devFailure;

		const formData = await request.formData();
		const originalSourcePath = normalizeRedirectPath(String(formData.get('originalSourcePath') ?? ''));
		const entry = parseEntryFromFormData(formData);

		try {
			const registry = await readRedirectRegistryFromDisk();
			const nextRegistry = upsertRedirectEntryInRegistry(registry, entry, originalSourcePath);
			await writeRedirectRegistryToDisk(nextRegistry);
		} catch (error) {
			return toFailure(error instanceof Error ? error.message : 'Unable to update redirect.', {
				sourcePath: entry.sourcePath,
				targetPath: entry.targetPath,
				statusCode: String(entry.statusCode),
				enabled: entry.enabled,
				notes: entry.notes,
				category: entry.category,
				allowRestrictedTarget: entry.allowRestrictedTarget
			});
		}

		throw redirect(303, '/admin/redirects');
	}
};
