import { watch } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const pdfOutputDir = path.join(webRoot, 'static', 'downloads', 'training');

const watchTargets = [
	{
		label: 'training print route',
		path: path.join(webRoot, 'src', 'routes', '(plain)', 'training', '[slug]', 'print')
	},
	{
		label: 'training data',
		path: path.join(webRoot, 'src', 'lib', 'data', 'training')
	},
	{
		label: 'data registries',
		path: path.join(webRoot, 'src', 'lib', 'data')
	},
	{
		label: 'about page',
		path: path.join(webRoot, 'src', 'routes', 'about')
	}
] as const;

const relevantPaths = [
	path.join('src', 'routes', '(plain)', 'training', '[slug]', 'print', '+page.svelte'),
	path.join('src', 'routes', '(plain)', 'training', '[slug]', 'print', '+page.ts'),
	path.join('src', 'lib', 'data', 'training'),
	path.join('src', 'lib', 'data', 'testimonials.json'),
	path.join('src', 'lib', 'data', 'testimonials.ts'),
	path.join('src', 'lib', 'data', 'partners.ts'),
	path.join('src', 'routes', 'about', '+page.svelte')
];

const normalizePath = (input: string): string => path.normalize(input);

const shouldTriggerForPath = (candidatePath: string): boolean => {
	const normalizedCandidate = normalizePath(candidatePath);
	return relevantPaths.some((watchedPath) => {
		const normalizedWatchedPath = normalizePath(watchedPath);
		return (
			normalizedCandidate === normalizedWatchedPath ||
			normalizedCandidate.startsWith(`${normalizedWatchedPath}${path.sep}`)
		);
	});
};

const walkRelevantFiles = async (targetPath: string): Promise<string[]> => {
	const targetStats = await stat(targetPath);
	if (targetStats.isFile()) {
		return shouldTriggerForPath(path.relative(webRoot, targetPath)) ? [targetPath] : [];
	}

	const entries = await readdir(targetPath, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map((entry) => walkRelevantFiles(path.join(targetPath, entry.name)))
	);
	return nested.flat();
};

const collectRelevantSourceFiles = async (): Promise<string[]> => {
	const files = await Promise.all(
		relevantPaths.map((relativePath) => walkRelevantFiles(path.join(webRoot, relativePath)))
	);
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

	if (await needsRegeneration()) {
		await generatePdfs('startup stale check');
	} else {
		console.log('[training-pdfs] Existing PDFs are current. Watcher is idle.');
	}

	if (once) return;

	for (const target of watchTargets) {
		watch(target.path, { persistent: true }, (_eventType, filename) => {
			if (!filename) return;
			const relativePath = path.join(path.relative(webRoot, target.path), filename.toString());
			if (!shouldTriggerForPath(relativePath)) return;
			console.log(`[training-pdfs] Change detected in ${target.label}: ${relativePath}`);
			queueRegeneration(relativePath);
		});
	}

	console.log('[training-pdfs] Watching brochure inputs for changes...');
};

start().catch((error) => {
	console.error('[training-pdfs] Watcher failed to start.');
	console.error(error);
	process.exit(1);
});
