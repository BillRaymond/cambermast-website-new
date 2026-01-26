import { copyFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(webDir, '..');

const mappings = [
	{
		label: 'ai.txt',
		src: path.join(repoRoot, 'ai.txt'),
		dest: path.join(webDir, 'static', 'ai.txt')
	},
	{
		label: 'llms.txt',
		src: path.join(repoRoot, 'llms.txt'),
		dest: path.join(webDir, 'static', 'llms.txt')
	}
];

const fileExists = async (filePath) => {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
};

const sync = async () => {
	for (const { label, src, dest } of mappings) {
		if (!(await fileExists(src))) {
			throw new Error(`Missing ${label} at ${src}`);
		}

		await mkdir(path.dirname(dest), { recursive: true });
		await copyFile(src, dest);
	}
};

await sync();
