import { existsSync } from 'node:fs';
import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import net from 'node:net';

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
const requestedSlugs = Array.from(
	new Set(
		process.argv
			.filter((argument) => argument.startsWith('--slug='))
			.map((argument) => argument.slice('--slug='.length).trim())
			.filter(Boolean)
	)
);
const downloadsDir =
	mode === 'dev' ? staticDownloadsDir : path.join(buildDir, 'downloads', 'resources');
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

const buildHeaderTemplate = (title: string, label?: string): string => `
	<div style="width: 100%; padding: 0 0.5in; font-size: 8px; color: #4b5563; font-family: Arial, sans-serif;">
		<div style="position: relative; width: 100%; border-bottom: 1px solid #d1d5db; padding-bottom: 6px;">
			<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
			<span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(title)}</span>
			<span style="white-space: nowrap;">https://cambermast.com</span>
			</div>
			<span style="position: absolute; left: 50%; top: 0; transform: translateX(-50%); white-space: nowrap; text-align: center;">${label ? escapeHtml(label) : ''}</span>
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

const tryListenPort = (port: number): Promise<number> =>
	new Promise((resolve, reject) => {
		const server = net.createServer();

		server.unref();

		server.on('error', reject);
		server.listen(port, '127.0.0.1', () => {
			const address = server.address();
			if (!address || typeof address === 'string') {
				server.close(() => reject(new Error('Unable to determine temporary server port.')));
				return;
			}

			const { port } = address;
			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(port);
			});
		});
	});

const getAvailablePort = async (preferredPort: number): Promise<number> => {
	try {
		return await tryListenPort(preferredPort);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'EADDRINUSE') {
			throw error;
		}
		return tryListenPort(0);
	}
};

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

const startServer = (serverPort: number) => {
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
	const preferredPort = mode === 'dev' ? 4176 : 4175;
	if (mode === 'dev') {
		const serverPort = await getAvailablePort(preferredPort);
		const serverOrigin = `http://127.0.0.1:${serverPort}`;
		const server = startServer(serverPort);
		await waitForServer(`${serverOrigin}/resources`);
		return { server, serverOrigin, reusedExistingServer: false };
	}

	const serverPort = preferredPort;
	const serverOrigin = `http://127.0.0.1:${serverPort}`;
	const healthcheckUrl = `${serverOrigin}/resources`;

	try {
		await waitForServer(healthcheckUrl, 1);
		return { server: null, serverOrigin, reusedExistingServer: true };
	} catch {
		const server = startServer(serverPort);
		await waitForServer(healthcheckUrl);
		return { server, serverOrigin, reusedExistingServer: false };
	}
};

const printableResources = listPrintableResources().map((resource) => ({
	slug: resource.slug,
	title: resource.title,
	label: resource.label.toUpperCase(),
	printPath: `/resources/${resource.slug}/print`,
	outputPath: path.join(downloadsDir, `${resource.slug}.pdf`)
}));

const printableResourceBySlug = new Map(printableResources.map((resource) => [resource.slug, resource]));

const removePdfIfPresent = async (slug: string) => {
	const outputPath = path.join(downloadsDir, `${slug}.pdf`);
	if (existsSync(outputPath)) {
		await rm(outputPath, { force: true });
		console.log(`Removed stale PDF for ${slug}`);
	}
};

const removeUnexpectedPdfs = async (expectedSlugs: string[]) => {
	const expectedFiles = new Set(expectedSlugs.map((slug) => `${slug}.pdf`));
	const entries = await readdir(downloadsDir, { withFileTypes: true }).catch(() => []);

	await Promise.all(
		entries
			.filter((entry) => entry.isFile() && entry.name.endsWith('.pdf') && !expectedFiles.has(entry.name))
			.map((entry) => rm(path.join(downloadsDir, entry.name), { force: true }))
	);
};

const run = async () => {
	await mkdir(downloadsDir, { recursive: true });

	if (!requestedSlugs.length && !printableResources.length) {
		await removeUnexpectedPdfs([]);
		console.log('No published printable resources found for PDF generation.');
		return;
	}

	const resourcesToGenerate = requestedSlugs.length
		? requestedSlugs
				.map((slug) => printableResourceBySlug.get(slug))
				.filter((resource): resource is NonNullable<typeof resource> => Boolean(resource))
		: printableResources;

	const staleTargetSlugs = requestedSlugs.filter((slug) => !printableResourceBySlug.has(slug));
	if (staleTargetSlugs.length) {
		await Promise.all(staleTargetSlugs.map((slug) => removePdfIfPresent(slug)));
	}

	if (!requestedSlugs.length) {
		await removeUnexpectedPdfs(printableResources.map((resource) => resource.slug));
	}

	if (!resourcesToGenerate.length) {
		console.log('No matching printable resources found for PDF generation.');
		return;
	}

	const { server: previewServer, serverOrigin, reusedExistingServer } = await ensureServer();
	let browser;

	try {
		browser = await chromium.launch({ headless: true });
		if (reusedExistingServer) {
			console.log(`Reusing existing browser-render server at ${serverOrigin}.`);
		}

		for (const resource of resourcesToGenerate) {
			const page = await browser.newPage();
			const url = new URL(`${serverOrigin}${resource.printPath}`);
			if (forcedOrigin) {
				url.searchParams.set('origin', forcedOrigin);
			}
			const generatedAt = formatGeneratedAt(new Date());
			console.log(`Generating PDF for ${resource.slug} from ${url.toString()}`);
			await page.goto(url.toString(), { waitUntil: 'networkidle' });
			await page.pdf({
				path: resource.outputPath,
				format: 'Letter',
				printBackground: true,
				displayHeaderFooter: true,
				headerTemplate: buildHeaderTemplate(resource.title, resource.label),
				footerTemplate: buildFooterTemplate(generatedAt),
				scale: 0.86,
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
