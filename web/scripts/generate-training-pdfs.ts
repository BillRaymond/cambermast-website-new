import { existsSync } from 'node:fs';
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
const requestedOriginArg = process.argv.find((argument) => argument.startsWith('--origin='));
const requestedOrigin = requestedOriginArg?.slice('--origin='.length).trim() || undefined;
const serverPort = mode === 'dev' ? 4174 : 4173;
const serverOrigin = `http://127.0.0.1:${serverPort}`;
const downloadsDir =
	mode === 'dev' ? staticDownloadsDir : path.join(buildDir, 'downloads', 'training');
const forcedOrigin = requestedOrigin?.replace(/\/$/, '') || undefined;

if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('/ms-playwright')) {
	process.env.PLAYWRIGHT_BROWSERS_PATH = '/ms-playwright';
}

const escapeHtml = (value: string): string =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

const formatGeneratedAt = (date: Date): string =>
	new Intl.DateTimeFormat('en-US', {
		dateStyle: 'long',
		timeStyle: 'short',
		timeZone: 'UTC'
	}).format(date) + ' UTC';

const buildHeaderTemplate = (title: string, sku?: string): string => `
	<div style="width: 100%; padding: 0 0.5in; font-size: 8px; color: #4b5563; font-family: Arial, sans-serif;">
		<div style="position: relative; width: 100%; border-bottom: 1px solid #d1d5db; padding-bottom: 6px;">
			<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
			<span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(title)}</span>
			<span style="white-space: nowrap;">https://cambermast.com</span>
			</div>
			<span style="position: absolute; left: 50%; top: 0; transform: translateX(-50%); white-space: nowrap; text-align: center;">${sku ? escapeHtml(sku) : ''}</span>
		</div>
	</div>
`;

const buildFooterTemplate = (generatedAt: string): string => `
	<div style="width: 100%; padding: 0 0.5in; font-size: 8px; color: #4b5563; font-family: Arial, sans-serif;">
		<div style="width: 100%; border-top: 1px solid #d1d5db; padding-top: 6px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
			<span>Copyright CAMBERMAST LLC&trade;</span>
			<span>Generated ${escapeHtml(generatedAt)}</span>
			<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
		</div>
	</div>
`;

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

const ensureServer = async () => {
	const healthcheckUrl = `${serverOrigin}/training`;

	try {
		await waitForServer(healthcheckUrl, 1);
		return { server: null, reusedExistingServer: true };
	} catch {
		const server = startServer();
		await waitForServer(healthcheckUrl);
		return { server, reusedExistingServer: false };
	}
};

const printPrograms = listTrainingPrograms()
	.filter((program) => program.catalog?.published ?? true)
	.map((program) => ({
		slug: program.slug,
		title: program.title,
		sku: program.sku,
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

	const { server: previewServer, reusedExistingServer } = await ensureServer();
	let browser;

	try {
		browser = await chromium.launch({ headless: true });
		if (reusedExistingServer) {
			console.log(`Reusing existing browser-render server at ${serverOrigin}.`);
		}

		for (const program of printPrograms) {
			const page = await browser.newPage();
			const url = new URL(`${serverOrigin}${program.printPath}`);
			if (forcedOrigin) {
				url.searchParams.set('origin', forcedOrigin);
			}
			const generatedAt = formatGeneratedAt(new Date());
			console.log(`Generating PDF for ${program.slug} from ${url.toString()}`);
			await page.goto(url.toString(), { waitUntil: 'networkidle' });
			await page.pdf({
				path: program.outputPath,
				format: 'Letter',
				printBackground: true,
				displayHeaderFooter: true,
				headerTemplate: buildHeaderTemplate(program.title, program.sku),
				footerTemplate: buildFooterTemplate(generatedAt),
				margin: {
					top: '0.75in',
					right: '0.5in',
					bottom: '0.85in',
					left: '0.5in'
				}
			});
			await page.close();
		}
	} finally {
		await browser?.close();
		if (previewServer && !previewServer.killed) {
			previewServer.kill('SIGTERM');
		}
	}
};

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
