import path from 'node:path';
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import { Buffer } from 'node:buffer';

type SaveImageInput = {
	slug: string;
	squareDataUrl: string;
	landscapeDataUrl: string;
	portraitDataUrl: string;
};

type WritePlanEntry = {
	variant: 'square' | 'landscape' | 'portrait';
	baseFileName: string;
	dataUrl: string;
};

const TEMPLATE_PUBLIC_PREFIX = '/images/admin/image-gen/templates/';

const resolveWebRoot = (): string => {
	const cwd = process.cwd();
	const direct = path.join(cwd, 'static');
	const nested = path.join(cwd, 'web', 'static');
	if (existsSync(direct)) return cwd;
	if (existsSync(nested)) return path.join(cwd, 'web');
	return cwd;
};

const webRoot = resolveWebRoot();

const toSafeSlug = (value: string): string => value.trim().toLowerCase();

export const validateSlugOrThrow = (slug: string): string => {
	const normalized = toSafeSlug(slug);
	if (!/^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/.test(normalized)) {
		throw new Error(
			'Slug must use lowercase letters, numbers, and hyphens, with optional "/" for subfolders.'
		);
	}
	return normalized;
};

const decodeDataUrlToBuffer = (dataUrl: string): Buffer => {
	const [meta, b64] = dataUrl.split(',');
	if (!meta || !b64 || !meta.includes(';base64')) {
		throw new Error('Invalid data URL payload');
	}
	return Buffer.from(b64, 'base64');
};

const buildVersionedPath = async (dir: string, baseName: string): Promise<{ fileName: string; version: number }> => {
	const ext = path.extname(baseName);
	const stem = baseName.slice(0, -ext.length);
	let version = 1;

	while (true) {
		const fileName = version === 1 ? baseName : `${stem}-v${version.toString()}${ext}`;
		const fullPath = path.join(dir, fileName);
		try {
			await fs.access(fullPath);
			version += 1;
		} catch {
			return { fileName, version };
		}
	}
};

export const listTemplateImageUrls = async (): Promise<string[]> => {
	const templatesDir = path.join(webRoot, 'static', 'images', 'admin', 'image-gen', 'templates');
	const entries = await fs.readdir(templatesDir, { withFileTypes: true }).catch(() => []);
	const files = entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
		.sort((a, b) => a.localeCompare(b));
	return files.map((name) => `${TEMPLATE_PUBLIC_PREFIX}${name}`);
};

export const saveSelectedImagesToWebsite = async (input: SaveImageInput) => {
	const safeSlug = validateSlugOrThrow(input.slug);
	const targetDir = path.join(webRoot, 'static', 'images', 'generated', safeSlug);
	await fs.mkdir(targetDir, { recursive: true });

	const writePlan: WritePlanEntry[] = [
		{ variant: 'square', baseFileName: 'hero-square.jpg', dataUrl: input.squareDataUrl },
		{ variant: 'landscape', baseFileName: 'hero-landscape.jpg', dataUrl: input.landscapeDataUrl },
		{ variant: 'portrait', baseFileName: 'hero-portrait.jpg', dataUrl: input.portraitDataUrl }
	];

	const writes: Array<{
		variant: WritePlanEntry['variant'];
		absolutePath: string;
		publicUrl: string;
		fileName: string;
		version: number;
	}> = [];

	try {
		for (const item of writePlan) {
			const { fileName, version } = await buildVersionedPath(targetDir, item.baseFileName);
			const absolutePath = path.join(targetDir, fileName);
			await fs.writeFile(absolutePath, decodeDataUrlToBuffer(item.dataUrl));
			writes.push({
				variant: item.variant,
				absolutePath,
				publicUrl: `/images/generated/${safeSlug}/${fileName}`,
				fileName,
				version
			});
		}
	} catch (error) {
		await Promise.all(
			writes.map((entry) =>
				fs.unlink(entry.absolutePath).catch(() => {
					console.warn('Failed to roll back image write', entry.absolutePath);
				})
			)
		);
		throw error;
	}

	return {
		slug: safeSlug,
		files: writes
	};
};
