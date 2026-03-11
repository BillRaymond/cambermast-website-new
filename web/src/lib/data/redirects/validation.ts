import type {
	RedirectEntry,
	RedirectImpactTag,
	RedirectRegistry,
	RedirectStatusCode
} from './types';

export const ALLOWED_REDIRECT_STATUS_CODES: RedirectStatusCode[] = [301, 302, 307, 308];
export const RESTRICTED_REDIRECT_TARGET_PREFIXES = ['/admin', '/internal', '/forms'];

const PATH_PATTERN = /^\/(?:[^?#\s]+(?:\/[^?#\s]+)*)?$/;

export const normalizeRedirectPath = (value: string): string => {
	const trimmed = value.trim();
	if (!trimmed) return '';
	if (!trimmed.startsWith('/')) return `/${trimmed}`;
	return trimmed;
};

export const isValidRedirectPath = (value: string): boolean =>
	value.length > 1 && PATH_PATTERN.test(value);

export const getRedirectImpactTags = (entry: RedirectEntry): RedirectImpactTag[] => {
	const tags = new Set<RedirectImpactTag>();
	const paths = [entry.sourcePath, entry.targetPath];

	if (paths.some((path) => path.startsWith('/feed/'))) tags.add('feed');
	if (paths.some((path) => path.startsWith('/api/'))) tags.add('api');
	if (paths.some((path) => path === '/calendar' || path === '/events')) tags.add('calendar');
	if (paths.some((path) => path === '/calendar')) tags.add('nav');
	if (paths.some((path) => path === '/training' || path === '/training-programs')) {
		tags.add('training');
	}
	if (
		paths.some((path) =>
			['/about', '/agents', '/api', '/contact', '/events', '/resources', '/strategy', '/training'].includes(
				path
			)
		)
	) {
		tags.add('public-route');
	}

	return Array.from(tags.values());
};

const detectCycle = (
	start: string,
	sourceToTarget: Map<string, string>
): string[] | null => {
	const seen = new Map<string, number>();
	const chain: string[] = [];
	let current: string | undefined = start;

	while (current) {
		const seenIndex = seen.get(current);
		if (seenIndex !== undefined) {
			return [...chain.slice(seenIndex), current];
		}

		seen.set(current, chain.length);
		chain.push(current);
		current = sourceToTarget.get(current);
	}

	return null;
};

export const validateRedirectRegistry = (registry: RedirectRegistry): string[] => {
	const errors: string[] = [];
	const sourceToTarget = new Map<string, string>();
	const seenSources = new Set<string>();

	for (const [index, rawEntry] of registry.redirects.entries()) {
		const entry = {
			...rawEntry,
			sourcePath: normalizeRedirectPath(rawEntry.sourcePath),
			targetPath: normalizeRedirectPath(rawEntry.targetPath)
		};
		const label = `redirects[${index}]`;

		if (!isValidRedirectPath(entry.sourcePath)) {
			errors.push(`${label}.sourcePath must be an internal path without query strings or fragments.`);
		}
		if (!isValidRedirectPath(entry.targetPath)) {
			errors.push(`${label}.targetPath must be an internal path without query strings or fragments.`);
		}
		if (entry.sourcePath === entry.targetPath) {
			errors.push(`${label} cannot redirect a path to itself.`);
		}
		if (!ALLOWED_REDIRECT_STATUS_CODES.includes(entry.statusCode)) {
			errors.push(`${label}.statusCode must be one of ${ALLOWED_REDIRECT_STATUS_CODES.join(', ')}.`);
		}
		if (seenSources.has(entry.sourcePath)) {
			errors.push(`${label}.sourcePath duplicates an existing redirect source: ${entry.sourcePath}`);
		}
		seenSources.add(entry.sourcePath);

		if (
			!entry.allowRestrictedTarget &&
			RESTRICTED_REDIRECT_TARGET_PREFIXES.some(
				(prefix) => entry.targetPath === prefix || entry.targetPath.startsWith(`${prefix}/`)
			)
		) {
			errors.push(
				`${label}.targetPath points to a restricted internal route. Set allowRestrictedTarget to true only when intentional.`
			);
		}

		sourceToTarget.set(entry.sourcePath, entry.targetPath);
	}

	for (const sourcePath of sourceToTarget.keys()) {
		const cycle = detectCycle(sourcePath, sourceToTarget);
		if (cycle) {
			errors.push(`Redirect loop detected: ${cycle.join(' -> ')}`);
		}
	}

	return Array.from(new Set(errors));
};
