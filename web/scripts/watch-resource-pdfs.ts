import { watch } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { listPrintableResources } from '../src/lib/data/resources/printable';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const pdfOutputDir = path.join(webRoot, 'static', 'downloads', 'resources');

type RelevantEntry = {
	path: string;
	kind: 'file' | 'dir';
};

const sourceRelevantEntries: RelevantEntry[] = [
	{
		path: path.join('src', 'routes', '(plain)', 'resources', '[slug]', 'print', '+page.svelte'),
		kind: 'file'
	},
	{
		path: path.join('src', 'routes', '(plain)', 'resources', '[slug]', 'print', '+page.ts'),
		kind: 'file'
	},
	{
		path: path.join('src', 'routes', 'resources', 'ai-coding-prompt-guide', '+page.svelte'),
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
		path: path.join('src', 'lib', 'data', 'resources', 'printable'),
		kind: 'dir'
	},
	{
		path: path.join('src', 'lib', 'data', 'resources', 'resources.json'),
		kind: 'file'
	}
];

const imageEntries = listPrintableResources()
	.map((resource) => resource.heroImage)
	.filter((value): value is string => value.startsWith('/images/'))
	.map((assetPath) => ({
		path: path.join('static', assetPath.slice(1)),
		kind: 'file' as const
	}));

let relevantEntries: RelevantEntry[] = [...sourceRelevantEntries, ...imageEntries];

const normalizePath = (input: string): string => path.normalize(input);

const shouldTriggerForPath = (candidatePath: string): boolean => {
	const normalizedCandidate = normalizePath(candidatePath);
	return relevantEntries.some((entry) => {
		if (entry.kind === 'file') {
			return normalizedCandidate === normalizePath(entry.path);
		}

		const normalizedEntryPath = normalizePath(entry.path);
		return (
			normalizedCandidate === normalizedEntryPath ||
			normalizedCandidate.startsWith(`${normalizedEntryPath}${path.sep}`)
		);
	});
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
	relevantEntries = [...sourceRelevantEntries, ...imageEntries];

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
			console.log(`[resource-pdfs] Change detected: ${relativePath}`);
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
	console.log(`[resource-pdfs] Regenerating PDFs (${reason})...`);

	try {
		await new Promise<void>((resolve, reject) => {
			const child = spawn(
				process.platform === 'win32' ? 'npx.cmd' : 'npx',
				['tsx', './scripts/generate-resource-pdfs.ts', '--mode=dev'],
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

		console.log('[resource-pdfs] PDFs are up to date.');
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
		void generatePdfs(reason);
	}, 250);
};

const run = async () => {
	await refreshWatchers();

	if (await needsRegeneration()) {
		await generatePdfs('startup check');
	} else {
		console.log('[resource-pdfs] PDFs are already up to date.');
	}
};

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
