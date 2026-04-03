import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(webRoot, '..');
const trashRoot = path.join(repoRoot, '.generated-trash');
const runStamp = new Date().toISOString().replace(/[:.]/g, '-');
const retentionCount = 2;

const generatedPaths = ['build', '.svelte-kit/output', '.svelte-kit/output-stale-rename-check'];

const pruneSnapshots = (sanitizedName: string) => {
	const snapshotPrefix = `-${sanitizedName}`;
	const matchingSnapshots = readdirSync(trashRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.filter((entryName) => entryName.endsWith(snapshotPrefix))
		.sort((left, right) => right.localeCompare(left));

	for (const staleSnapshot of matchingSnapshots.slice(retentionCount)) {
		rmSync(path.join(trashRoot, staleSnapshot), { recursive: true, force: true });
	}
};

mkdirSync(trashRoot, { recursive: true });

for (const relativePath of generatedPaths) {
	const sourcePath = path.join(webRoot, relativePath);

	if (!existsSync(sourcePath)) continue;

	const sanitizedName = relativePath.replace(/[\\/]/g, '__');
	const destinationPath = path.join(trashRoot, `${runStamp}-${sanitizedName}`);

	if (existsSync(destinationPath)) {
		rmSync(destinationPath, { recursive: true, force: true });
	}

	renameSync(sourcePath, destinationPath);
	pruneSnapshots(sanitizedName);
}

console.log(`Reset generated build artifacts and kept the newest ${retentionCount} snapshot(s) per target.`);
