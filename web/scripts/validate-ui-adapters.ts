import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('src');
const TARGET_DIRS = [path.join(ROOT, 'routes'), path.join(ROOT, 'lib', 'components')];
const EXTENSIONS = new Set(['.ts', '.js', '.svelte']);
const FORBIDDEN_PATTERNS = [
	/\bimport\s+(?!type\b)[^;]*\bfrom\s+['"]\$lib\/data\/(events|campaigns)(?:\/index)?['"]/,
	/\bimport\(\s*['"]\$lib\/data\/(events|campaigns)(?:\/index)?['"]\s*\)/
];

const shouldCheckFile = (filePath: string): boolean => {
	const normalized = filePath.split(path.sep).join('/');
	if (normalized.includes('/src/lib/components/')) return true;
	if (!normalized.includes('/src/routes/')) return false;
	if (normalized.includes('/src/routes/api/')) return false;
	return (
		normalized.endsWith('.svelte') || /\/\+(page|layout)(\.server)?\.(ts|js)$/.test(normalized)
	);
};

const walk = async (dir: string): Promise<string[]> => {
	const entries = await readdir(dir, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) return walk(fullPath);
			if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) return [fullPath];
			return [];
		})
	);

	return nested.flat();
};

const main = async () => {
	const files = (await Promise.all(TARGET_DIRS.map((dir) => walk(dir)))).flat();
	const violations: string[] = [];

	for (const filePath of files) {
		if (!shouldCheckFile(filePath)) continue;
		const source = await readFile(filePath, 'utf8');
		for (const pattern of FORBIDDEN_PATTERNS) {
			if (pattern.test(source)) {
				violations.push(path.relative(process.cwd(), filePath));
				break;
			}
		}
	}

	if (violations.length > 0) {
		console.error(
			'UI adapter validation failed. Use view-model adapters instead of direct data imports.'
		);
		for (const violation of violations.sort()) {
			console.error(`- ${violation}`);
		}
		process.exit(1);
	}

	console.log('UI adapter validation passed.');
};

await main();
