import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { chromium } from '@playwright/test';

import { listPrintableResources } from '../src/lib/data/resources/printable';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const buildDir = path.join(webRoot, 'build');
const staticDownloadsDir = path.join(webRoot, 'static', 'downloads', 'resources');

type Mode = 'build' | 'dev';

const requestedMode = process.argv.includes('--mode=dev') ? 'dev' : 'build';
const mode: Mode = requestedMode === 'dev' ? 'dev' : 'build';
const requestedOriginArg = process.argv.find((argument) => argument.startsWith('--origin='));
const requestedOrigin = requestedOriginArg?.slice('--origin='.length).trim() || undefined;
const serverPort = mode === 'dev' ? 4176 : 4175;
const serverOrigin = `http://127.0.0.1:${serverPort}`;
const downloadsDir =
	mode === 'dev' ? staticDownloadsDir : path.join(buildDir, 'downloads', 'resources');
const forcedOrigin = requestedOrigin?.replace(/\/$/, '') || undefined;

if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('/ms-playwright')) {
	process.env.PLAYWRIGHT_BROWSERS_PATH = '/ms-playwright';
}

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

	const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
		cwd: webRoot,
		stdio: 'inherit',
		env: { ...process.env }
	});

	return child;
};

const ensureServer = async () => {
	const healthcheckUrl = `${serverOrigin}/resources`;

	try {
		await waitForServer(healthcheckUrl, 1);
		return { server: null, reusedExistingServer: true };
	} catch {
		const server = startServer();
		await waitForServer(healthcheckUrl);
		return { server, reusedExistingServer: false };
	}
};

const printableResources = listPrintableResources().map((resource) => ({
	slug: resource.slug,
	title: resource.title,
	printPath: `/resources/${resource.slug}/print`,
	outputPath: path.join(downloadsDir, `${resource.slug}.pdf`)
}));

const run = async () => {
	if (!printableResources.length) {
		console.log('No published printable resources found for PDF generation.');
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

		for (const resource of printableResources) {
			const page = await browser.newPage();
			const url = new URL(`${serverOrigin}${resource.printPath}`);
			if (forcedOrigin) {
				url.searchParams.set('origin', forcedOrigin);
			}
			console.log(`Generating PDF for ${resource.slug} from ${url.toString()}`);
			await page.goto(url.toString(), { waitUntil: 'networkidle' });
			await page.pdf({
				path: resource.outputPath,
				format: 'Letter',
				printBackground: true,
				displayHeaderFooter: false,
				scale: 0.86,
				margin: {
					top: '0.3in',
					right: '0.3in',
					bottom: '0.3in',
					left: '0.3in'
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
