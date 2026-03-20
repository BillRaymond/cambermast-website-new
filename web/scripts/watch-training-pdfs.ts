import { watch } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { buildTrainingBrochureModel } from '../src/lib/data/training/brochure';
import { listTrainingPrograms } from '../src/lib/data/training';
import { listTestimonials } from '../src/lib/data/testimonials';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const pdfOutputDir = path.join(webRoot, 'static', 'downloads', 'training');

type RelevantEntry = {
	path: string;
	kind: 'file' | 'dir';
};

const sourceRelevantEntries: RelevantEntry[] = [
	{
		path: path.join('src', 'routes', '(plain)', 'training', '[slug]', 'print', '+page.svelte'),
		kind: 'file'
	},
	{
		path: path.join('src', 'routes', '(plain)', 'training', '[slug]', 'print', '+page.ts'),
		kind: 'file'
	},
	{
		path: path.join('src', 'lib', 'data', 'training'),
		kind: 'dir'
	},
	{
		path: path.join('src', 'lib', 'data', 'training', 'brochure.ts'),
		kind: 'file'
	},
	{
		path: path.join('src', 'lib', 'data', 'testimonials.json'),
		kind: 'file'
	},
	{
		path: path.join('src', 'lib', 'data', 'testimonials.ts'),
		kind: 'file'
	},
	{
		path: path.join('src', 'lib', 'data', 'partners.ts'),
		kind: 'file'
	},
	{
		path: path.join('src', 'routes', 'about', '+page.svelte'),
		kind: 'file'
	}
] as const;

const imageLiteralSources = [
	path.join('src', 'routes', '(plain)', 'training', '[slug]', 'print', '+page.svelte'),
	path.join('src', 'routes', 'about', '+page.svelte'),
	path.join('src', 'lib', 'data', 'training', 'brochure.ts'),
	path.join('src', 'lib', 'data', 'partners.ts')
] as const;

const normalizePath = (input: string): string => path.normalize(input);

const toRelativeStaticAssetPath = (assetPath: string): string | undefined => {
	if (!assetPath.startsWith('/images/')) return undefined;
	return path.join('static', assetPath.slice(1));
};

const extractImageLiteralPaths = async (relativePath: string): Promise<string[]> => {
	const absolutePath = path.join(webRoot, relativePath);
	const fileContents = await readFile(absolutePath, 'utf8');
	const matches = fileContents.matchAll(/['"`](\/images\/[^'"`\s]+)['"`]/g);
	return Array.from(matches, (match) => match[1]);
};

const collectDynamicAssetEntries = async (): Promise<RelevantEntry[]> => {
	const literalAssets = (
		await Promise.all(imageLiteralSources.map((relativePath) => extractImageLiteralPaths(relativePath)))
	).flat();

	const brochureAssets = listTrainingPrograms({ includeDrafts: true }).flatMap((program) => {
		const brochure = buildTrainingBrochureModel(program);
		return [brochure.heroImage, brochure.trainer?.photo].filter((value): value is string => Boolean(value));
	});

	const testimonialAssets = listTestimonials()
		.map((testimonial) => testimonial.photoUrl ?? undefined)
		.filter((value): value is string => Boolean(value));

	const assetEntries = new Set(
		[...literalAssets, ...brochureAssets, ...testimonialAssets]
			.map((assetPath) => toRelativeStaticAssetPath(assetPath))
			.filter((assetPath): assetPath is string => Boolean(assetPath))
	);

	return Array.from(assetEntries, (assetPath) => ({ path: assetPath, kind: 'file' as const }));
};

const getRelevantEntries = async (): Promise<RelevantEntry[]> => {
	const dynamicAssetEntries = await collectDynamicAssetEntries();
	const dedupedEntries = new Map<string, RelevantEntry>();

	for (const entry of [...sourceRelevantEntries, ...dynamicAssetEntries]) {
		dedupedEntries.set(`${entry.kind}:${normalizePath(entry.path)}`, {
			...entry,
			path: normalizePath(entry.path)
		});
	}

	return Array.from(dedupedEntries.values());
};

let relevantEntries: RelevantEntry[] = [];

const shouldTriggerForPath = (candidatePath: string): boolean => {
	const normalizedCandidate = normalizePath(candidatePath);
	return relevantEntries.some((entry) => {
		if (entry.kind === 'file') {
			return normalizedCandidate === entry.path;
		}

		return (
			normalizedCandidate === entry.path ||
			normalizedCandidate.startsWith(`${entry.path}${path.sep}`)
		);
	});
};

const walkRelevantFiles = async (entry: RelevantEntry): Promise<string[]> => {
	const targetPath = path.join(webRoot, entry.path);
	const targetStats = await stat(targetPath).catch(() => null);
	if (!targetStats) return [];

	if (entry.kind === 'file') {
		return [targetPath];
	}
	if (targetStats.isFile()) {
		return shouldTriggerForPath(path.relative(webRoot, targetPath)) ? [targetPath] : [];
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

const collectRelevantSourceFiles = async (): Promise<string[]> => {
	const files = await Promise.all(relevantEntries.map((entry) => walkRelevantFiles(entry)));
	return files.flat();
};

const getNewestSourceMtime = async (): Promise<number> => {
	const files = await collectRelevantSourceFiles();
	const mtimes = await Promise.all(files.map(async (file) => (await stat(file)).mtimeMs));
	return mtimes.length ? Math.max(...mtimes) : 0;
};

const getOldestPdfMtime = async (): Promise<number> => {
	const entries = await readdir(pdfOutputDir, { withFileTypes: true }).catch(() => []);
	const pdfFiles = entries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.pdf'))
		.map((entry) => path.join(pdfOutputDir, entry.name));

	if (pdfFiles.length === 0) return 0;

	const mtimes = await Promise.all(pdfFiles.map(async (file) => (await stat(file)).mtimeMs));
	return Math.min(...mtimes);
};

const needsRegeneration = async (): Promise<boolean> => {
	const [newestSourceMtime, oldestPdfMtime] = await Promise.all([
		getNewestSourceMtime(),
		getOldestPdfMtime()
	]);

	return oldestPdfMtime === 0 || newestSourceMtime > oldestPdfMtime;
};

let isGenerating = false;
let rerunRequested = false;
let debounceTimer: NodeJS.Timeout | undefined;
let stopWatching = () => {};

const refreshWatchers = async () => {
	stopWatching();
	relevantEntries = await getRelevantEntries();

	const directories = new Set(
		relevantEntries.map((entry) =>
			path.join(webRoot, entry.kind === 'dir' ? entry.path : path.dirname(entry.path))
		)
	);

	const watchers = Array.from(directories, (directory) =>
		watch(directory, { persistent: true }, (_eventType, filename) => {
			if (!filename) return;
			const relativePath = path.relative(webRoot, path.join(directory, filename.toString()));
			if (!shouldTriggerForPath(relativePath)) return;
			console.log(`[training-pdfs] Change detected: ${relativePath}`);
			queueRegeneration(relativePath);
		})
	);

	stopWatching = () => {
		for (const watcher of watchers) watcher.close();
	};
};

const generatePdfs = async (reason: string) => {
	if (isGenerating) {
		rerunRequested = true;
		return;
	}

	isGenerating = true;
	console.log(`[training-pdfs] Regenerating PDFs (${reason})...`);

	try {
		await new Promise<void>((resolve, reject) => {
			const child = spawn(
				process.platform === 'win32' ? 'npx.cmd' : 'npx',
				['tsx', './scripts/generate-training-pdfs.ts', '--mode=dev'],
				{
					cwd: webRoot,
					stdio: 'inherit',
					env: { ...process.env }
				}
			);

			child.on('error', reject);
			child.on('exit', (code) => {
				if (code === 0) {
					resolve();
					return;
				}
				reject(new Error(`PDF generation exited with code ${code ?? 'unknown'}`));
			});
		});

		console.log('[training-pdfs] PDFs are up to date.');
		await refreshWatchers();
	} finally {
		isGenerating = false;
	}

	if (rerunRequested) {
		rerunRequested = false;
		await generatePdfs('follow-up changes');
	}
};

const queueRegeneration = (reason: string) => {
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		void generatePdfs(reason).catch((error) => {
			console.error('[training-pdfs] Regeneration failed.');
			console.error(error);
		});
	}, 300);
};

const start = async () => {
	const once = process.argv.includes('--once');
	await refreshWatchers();

	if (await needsRegeneration()) {
		await generatePdfs('startup stale check');
	} else {
		console.log('[training-pdfs] Existing PDFs are current. Watcher is idle.');
	}

	if (once) {
		stopWatching();
		return;
	}

	console.log('[training-pdfs] Watching brochure inputs for changes...');
};

start().catch((error) => {
	console.error('[training-pdfs] Watcher failed to start.');
	console.error(error);
	process.exit(1);
});
