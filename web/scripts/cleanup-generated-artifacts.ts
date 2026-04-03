import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(webRoot, '..');
const trashRoot = path.join(repoRoot, '.generated-trash');

const removablePaths = [
	'build',
	'build-prev',
	'build-stale',
	'.svelte-kit/output',
	'.svelte-kit/output-stale-rename-check',
	'test-results',
	'playwright-report'
];

const duplicateArtifactPattern = /^(build|build-prev|build-stale)(?: \d+)+$/;

const run = async () => {
	for (const relativePath of removablePaths) {
		await rm(path.join(webRoot, relativePath), { recursive: true, force: true });
	}

	for (const entry of readdirSync(webRoot, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		if (!duplicateArtifactPattern.test(entry.name)) continue;
		await rm(path.join(webRoot, entry.name), { recursive: true, force: true });
	}

	await rm(trashRoot, { recursive: true, force: true });

	if (!existsSync(trashRoot)) {
		mkdirSync(trashRoot, { recursive: true });
	}

	console.log('Removed disposable generated outputs, Playwright run artifacts, and archived generated trash.');
};

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
