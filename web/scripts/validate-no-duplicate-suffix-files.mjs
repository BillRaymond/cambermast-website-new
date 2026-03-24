import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const IGNORED_DIRS = new Set([
	'.git',
	'node_modules',
	'.svelte-kit',
	'build',
	'build-prev',
	'build-stale',
	'.output',
	'.vercel',
	'.netlify',
	'.wrangler'
]);
const IGNORED_RELATIVE_PATHS = new Set(['static/downloads']);

const duplicateSuffixPattern = / \d+(?:\.[^/]+)?$/;
const offenders = [];

function shouldSkipDir(name) {
	return IGNORED_DIRS.has(name);
}

function shouldSkipPath(relParts) {
	return IGNORED_RELATIVE_PATHS.has(relParts.join('/'));
}

function scanDir(dirPath, relParts = []) {
	if (shouldSkipPath(relParts)) {
		return;
	}

	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const entryPath = path.join(dirPath, entry.name);
		const nextRelParts = [...relParts, entry.name];
		const relDisplay = nextRelParts.join('/');

		if (duplicateSuffixPattern.test(entry.name)) {
			const canonicalName = entry.name.replace(/ \d+(?=(\.[^/.]+)?$)/, '');
			const canonicalPath = path.join(dirPath, canonicalName);
			if (fs.existsSync(canonicalPath)) {
				offenders.push(relDisplay);
			}
		}

		if (entry.isDirectory()) {
			if (shouldSkipDir(entry.name)) continue;
			scanDir(entryPath, nextRelParts);
		}
	}
}

scanDir(ROOT_DIR);

if (offenders.length > 0) {
	offenders.sort((a, b) => a.localeCompare(b));
	console.error('Duplicate collision-style filenames detected (numeric suffix like \" 2\", \" 3\", \" 01\"):');
	for (const relPath of offenders) {
		console.error(`- ${relPath}`);
	}
	console.error('');
	console.error('Remove the duplicate file/directory or rename it to the canonical path.');
	process.exit(1);
}

console.log('No duplicate collision-style filenames found.');
