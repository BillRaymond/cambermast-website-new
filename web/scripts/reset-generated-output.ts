import { existsSync, mkdirSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(webRoot, '..');
const trashRoot = path.join(repoRoot, '.generated-trash');
const runStamp = new Date().toISOString().replace(/[:.]/g, '-');

const generatedPaths = ['build', '.svelte-kit/output', '.svelte-kit/output-stale-rename-check'];

mkdirSync(trashRoot, { recursive: true });

for (const relativePath of generatedPaths) {
	const sourcePath = path.join(webRoot, relativePath);

	if (!existsSync(sourcePath)) continue;

	const sanitizedName = relativePath.replace(/[\\/]/g, '__');
	const destinationPath = path.join(trashRoot, `${runStamp}-${sanitizedName}`);

	renameSync(sourcePath, destinationPath);
}

console.log('Reset generated build artifacts.');
