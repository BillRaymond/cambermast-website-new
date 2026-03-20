import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { chromium } from '@playwright/test';

import { listTrainingPrograms } from '../src/lib/data/training';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const buildDir = path.join(webRoot, 'build');
const staticDownloadsDir = path.join(webRoot, 'static', 'downloads', 'training');

type Mode = 'build' | 'dev';

const requestedMode = process.argv.includes('--mode=dev') ? 'dev' : 'build';
const mode: Mode = requestedMode === 'dev' ? 'dev' : 'build';
const serverPort = mode === 'dev' ? 4174 : 4173;
const serverOrigin = `http://127.0.0.1:${serverPort}`;
const downloadsDir =
	mode === 'dev' ? staticDownloadsDir : path.join(buildDir, 'downloads', 'training');

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForServer = async (url: string, attempts = 40) => {
	for (let index = 0; index < attempts; index += 1) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
		} catch {
			// Keep waiting for the preview server to come up.
		}
		await wait(500);
	}
	throw new Error(`Preview server did not become ready at ${url}`);
};

const startServer = () => {
	const args =
		mode === 'dev'
			? ['vite', 'dev', '--host', '127.0.0.1', '--port', String(serverPort), '--strictPort']
			: ['vite', 'preview', '--host', '127.0.0.1', '--port', String(serverPort), '--strictPort'];

	const child = spawn(
		process.platform === 'win32' ? 'npx.cmd' : 'npx',
		args,
		{
			cwd: webRoot,
			stdio: 'inherit',
			env: { ...process.env }
		}
	);

	return child;
};

const printPrograms = listTrainingPrograms()
	.filter((program) => program.catalog?.published ?? true)
	.map((program) => ({
		slug: program.slug,
		printPath: `${program.route ?? `/training/${program.slug}`}/print`,
		outputPath: path.join(downloadsDir, `${program.slug}.pdf`)
	}));

const run = async () => {
	if (!printPrograms.length) {
		console.log('No published training programs found for brochure generation.');
		return;
	}

	await rm(downloadsDir, { recursive: true, force: true });
	await mkdir(downloadsDir, { recursive: true });

	const previewServer = startServer();
	let browser;

	try {
		await waitForServer(`${serverOrigin}/training`);
		browser = await chromium.launch({ headless: true });

		for (const program of printPrograms) {
			const page = await browser.newPage();
			const url = `${serverOrigin}${program.printPath}`;
			console.log(`Generating PDF for ${program.slug} from ${url}`);
			await page.goto(url, { waitUntil: 'networkidle' });
			await page.pdf({
				path: program.outputPath,
				format: 'Letter',
				printBackground: true,
				margin: {
					top: '0.5in',
					right: '0.5in',
					bottom: '0.5in',
					left: '0.5in'
				}
			});
			await page.close();
		}
	} finally {
		await browser?.close();
		if (!previewServer.killed) {
			previewServer.kill('SIGTERM');
		}
	}
};

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
