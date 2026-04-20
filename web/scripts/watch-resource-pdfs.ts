import { watch } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const pdfOutputDir = path.join(webRoot, 'static', 'downloads', 'resources');
const resourcesRegistryPath = path.join('src', 'lib', 'data', 'resources', 'resources.json');

type ResourceRegistryEntry = {
	slug: string;
	draft?: boolean;
	pdf?: {
		enabled?: boolean;
		printRoute?: string;
		url?: string;
	};
	images?: {
		current?: {
			square?: { url?: string };
			landscape?: { url?: string };
			portrait?: { url?: string };
			reference?: { url?: string | null };
		};
	};
};

type RelevantEntry = {
	path: string;
	kind: 'file' | 'dir';
};

type PrintableSlugState = {
	slug: string;
	pageEntry: RelevantEntry;
	contentEntry: RelevantEntry;
	assetEntries: RelevantEntry[];
	inputEntries: RelevantEntry[];
};

type WatcherState = {
	sharedEntries: RelevantEntry[];
	perSlug: Map<string, PrintableSlugState>;
	registrySnapshot: Map<string, string>;
};

const sharedEntries: RelevantEntry[] = [
	{
		path: path.join('src', 'routes', '(plain)', 'resources', '[slug]', 'print', '+page.svelte'),
		kind: 'file'
	},
	{
		path: path.join('src', 'routes', '(plain)', 'resources', '[slug]', 'print', '+page.ts'),
		kind: 'file'
	},
	{
		path: path.join('scripts', 'generate-resource-pdfs.ts'),
		kind: 'file'
	},
	{
		path: path.join('src', 'lib', 'data', 'resources', 'printable.ts'),
		kind: 'file'
	},
	{
		path: resourcesRegistryPath,
		kind: 'file'
	}
];

let watcherState: WatcherState = {
	sharedEntries,
	perSlug: new Map(),
	registrySnapshot: new Map()
};

const normalizePath = (input: string): string => path.normalize(input);

const toRelativeStaticAssetPath = (assetPath: string): string | undefined => {
	if (!assetPath.startsWith('/images/')) return undefined;
	return normalizePath(path.join('static', assetPath.slice(1)));
};

const walkRelevantFiles = async (entry: RelevantEntry): Promise<string[]> => {
	const targetPath = path.join(webRoot, entry.path);
	const targetStats = await stat(targetPath).catch(() => null);
	if (!targetStats) return [];

	if (entry.kind === 'file' || targetStats.isFile()) {
		return [targetPath];
	}

	const entries = await readdir(targetPath, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map((child) =>
			walkRelevantFiles({
				path: path.join(entry.path, child.name),
				kind: child.isDirectory() ? 'dir' : 'file'
			})
		)
	);
	return nested.flat();
};

const readRegistryEntries = async (): Promise<ResourceRegistryEntry[]> => {
	const absolutePath = path.join(webRoot, resourcesRegistryPath);
	const raw = await readFile(absolutePath, 'utf8');
	const parsed = JSON.parse(raw) as { resources?: ResourceRegistryEntry[] };
	return Array.isArray(parsed.resources) ? parsed.resources : [];
};

const extractImageLiteralPaths = async (relativePath: string): Promise<string[]> => {
	const absolutePath = path.join(webRoot, relativePath);
	const fileContents = await readFile(absolutePath, 'utf8').catch(() => '');
	const matches = fileContents.matchAll(/['"`](\/images\/[^'"`\s]+)['"`]/g);
	return Array.from(matches, (match) => match[1]);
};

const getRegistrySnapshot = (entries: ResourceRegistryEntry[]): Map<string, string> =>
	new Map(
		entries
			.filter((resource) => resource.pdf?.enabled)
			.map((resource) => [resource.slug, JSON.stringify(resource)])
	);

const getPrintableSlugState = async (resource: ResourceRegistryEntry): Promise<PrintableSlugState> => {
	const pageEntry: RelevantEntry = {
		path: normalizePath(path.join('src', 'routes', 'resources', resource.slug, '+page.svelte')),
		kind: 'file'
	};
	const contentEntry: RelevantEntry = {
		path: normalizePath(path.join('src', 'lib', 'data', 'resources', 'printable', `${resource.slug}.ts`)),
		kind: 'file'
	};
	const imageVariants = [
		resource.images?.current?.square?.url,
		resource.images?.current?.landscape?.url,
		resource.images?.current?.portrait?.url,
		resource.images?.current?.reference?.url ?? undefined
	].filter((value): value is string => Boolean(value));
	const literalAssets = await extractImageLiteralPaths(contentEntry.path);
	const assetEntries = Array.from(
		new Set(
			[...imageVariants, ...literalAssets]
				.map((assetPath) => toRelativeStaticAssetPath(assetPath))
				.filter((assetPath): assetPath is string => Boolean(assetPath))
		),
		(assetPath) => ({ path: assetPath, kind: 'file' as const })
	);
	return {
		slug: resource.slug,
		pageEntry,
		contentEntry,
		assetEntries,
		inputEntries: [pageEntry, contentEntry, ...assetEntries]
	};
};

const buildWatcherState = async (): Promise<WatcherState> => {
	const entries = await readRegistryEntries();
	const printableEntries = entries.filter((resource) => resource.pdf?.enabled);
	const perSlug = new Map<string, PrintableSlugState>();

	for (const resource of printableEntries) {
		perSlug.set(resource.slug, await getPrintableSlugState(resource));
	}

	return {
		sharedEntries,
		perSlug,
		registrySnapshot: getRegistrySnapshot(entries)
	};
};

const getNewestMtimeForEntries = async (entries: RelevantEntry[]): Promise<number> => {
	const files = (await Promise.all(entries.map((entry) => walkRelevantFiles(entry)))).flat();
	if (!files.length) return 0;
	const mtimes = await Promise.all(files.map(async (file) => (await stat(file)).mtimeMs));
	return Math.max(...mtimes);
};

const getPdfMtime = async (slug: string): Promise<number> => {
	const pdfPath = path.join(pdfOutputDir, `${slug}.pdf`);
	const pdfStats = await stat(pdfPath).catch(() => null);
	return pdfStats?.mtimeMs ?? 0;
};

const getStalePdfSlugs = async (state: WatcherState): Promise<string[]> => {
	const staleSlugs: string[] = [];

	for (const [slug, slugState] of state.perSlug) {
		const [sourceMtime, pdfMtime] = await Promise.all([
			getNewestMtimeForEntries([...state.sharedEntries, ...slugState.inputEntries]),
			getPdfMtime(slug)
		]);

		if (pdfMtime === 0 || sourceMtime > pdfMtime) {
			staleSlugs.push(slug);
		}
	}

	const entries = await readdir(pdfOutputDir, { withFileTypes: true }).catch(() => []);
	const enabledSlugs = new Set(state.perSlug.keys());
	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith('.pdf')) continue;
		const slug = entry.name.slice(0, -4);
		if (!enabledSlugs.has(slug)) {
			staleSlugs.push(slug);
		}
	}

	return Array.from(new Set(staleSlugs));
};

const resolveImpact = async (
	relativePath: string
): Promise<{ mode: 'none' | 'slug' | 'all'; slugs?: string[] }> => {
	const normalizedPath = normalizePath(relativePath);
	const sharedPathSet = new Set(watcherState.sharedEntries.map((entry) => entry.path));

	if (sharedPathSet.has(normalizedPath) && normalizedPath !== normalizePath(resourcesRegistryPath)) {
		return { mode: 'all' };
	}

	if (normalizedPath === normalizePath(resourcesRegistryPath)) {
		try {
			const nextState = await buildWatcherState();
			const before = watcherState.registrySnapshot;
			const after = nextState.registrySnapshot;
			const changedSlugs = new Set<string>();

			for (const slug of new Set([...before.keys(), ...after.keys()])) {
				if (before.get(slug) !== after.get(slug)) {
					changedSlugs.add(slug);
				}
			}

			if (changedSlugs.size === 0) {
				watcherState = nextState;
				return { mode: 'none' };
			}

			watcherState = nextState;
			return changedSlugs.size === 1
				? { mode: 'slug', slugs: Array.from(changedSlugs) }
				: { mode: 'all' };
		} catch {
			return { mode: 'all' };
		}
	}

	for (const [slug, slugState] of watcherState.perSlug) {
		if (slugState.pageEntry.path === normalizedPath || slugState.contentEntry.path === normalizedPath) {
			return { mode: 'slug', slugs: [slug] };
		}

		if (slugState.assetEntries.some((entry) => entry.path === normalizedPath)) {
			return { mode: 'slug', slugs: [slug] };
		}
	}

	return { mode: 'none' };
};

let isGenerating = false;
let rerunRequested = false;
let debounceTimer: NodeJS.Timeout | undefined;
let stopWatching = () => {};
let pendingImpact: { mode: 'all' | 'slug'; slugs: Set<string> } | null = null;

const refreshWatchers = async () => {
	stopWatching();
	watcherState = await buildWatcherState();

	const relevantEntries = [
		...watcherState.sharedEntries,
		...Array.from(watcherState.perSlug.values()).flatMap((entry) => entry.inputEntries)
	];

	const directories = new Set(
		relevantEntries.map((entry) =>
			path.join(webRoot, entry.kind === 'dir' ? entry.path : path.dirname(entry.path))
		)
	);

	const watchers = Array.from(directories, (directory) =>
		watch(directory, { persistent: true }, (_eventType, filename) => {
			if (!filename) return;
			const relativePath = path.relative(webRoot, path.join(directory, filename.toString()));
			void (async () => {
				const impact = await resolveImpact(relativePath);
				if (impact.mode === 'none') return;
				console.log(`[resource-pdfs] Change detected: ${relativePath}`);
				queueRegeneration(impact, relativePath);
			})();
		})
	);

	stopWatching = () => {
		for (const watcher of watchers) watcher.close();
	};
};

const spawnGenerator = async (args: string[]) => {
	await new Promise<void>((resolve, reject) => {
		const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
			cwd: webRoot,
			stdio: 'inherit',
			env: { ...process.env }
		});

		child.on('error', reject);
		child.on('exit', (code) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(`PDF generation exited with code ${code ?? 'unknown'}`));
		});
	});
};

const generatePdfs = async (reason: string, impact?: { mode: 'all' | 'slug'; slugs: Set<string> }) => {
	if (isGenerating) {
		rerunRequested = true;
		return;
	}

	isGenerating = true;
	console.log(`[resource-pdfs] Regenerating PDFs (${reason})...`);

	try {
		const slugs = impact?.mode === 'slug' ? Array.from(impact.slugs).sort() : [];
		const generatorArgs = ['tsx', './scripts/generate-resource-pdfs.ts', '--mode=dev'];
		for (const slug of slugs) {
			generatorArgs.push(`--slug=${slug}`);
		}
		await spawnGenerator(generatorArgs);

		console.log('[resource-pdfs] PDFs are up to date.');
		await refreshWatchers();
	} finally {
		isGenerating = false;
	}

	if (rerunRequested) {
		rerunRequested = false;
		const nextImpact = pendingImpact ?? { mode: 'all' as const, slugs: new Set<string>() };
		pendingImpact = null;
		await generatePdfs('follow-up changes', nextImpact);
	}
};

const queueRegeneration = (
	impact: { mode: 'none' | 'slug' | 'all'; slugs?: string[] },
	reason: string
) => {
	if (debounceTimer) clearTimeout(debounceTimer);

	if (impact.mode === 'all') {
		pendingImpact = { mode: 'all', slugs: new Set() };
	} else if (impact.mode === 'slug') {
		if (!pendingImpact || pendingImpact.mode === 'all') {
			pendingImpact = { mode: 'slug', slugs: new Set(impact.slugs ?? []) };
		} else {
			for (const slug of impact.slugs ?? []) pendingImpact.slugs.add(slug);
		}
	}

	debounceTimer = setTimeout(() => {
		const nextImpact = pendingImpact ?? { mode: 'all' as const, slugs: new Set<string>() };
		pendingImpact = null;
		void generatePdfs(reason, nextImpact).catch((error) => {
			console.error('[resource-pdfs] Regeneration failed.');
			console.error(error);
		});
	}, 300);
};

const run = async () => {
	await refreshWatchers();

	const staleSlugs = await getStalePdfSlugs(watcherState);
	if (staleSlugs.length) {
		await generatePdfs('startup stale check', { mode: 'slug', slugs: new Set(staleSlugs) });
	} else {
		console.log('[resource-pdfs] PDFs are already up to date.');
	}
};

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
