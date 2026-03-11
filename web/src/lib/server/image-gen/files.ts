import path from 'node:path';
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import type { ImageGenDestinationType } from '$lib/server/image-gen/types';

type SaveImageInput = {
	destinationType: ImageGenDestinationType;
	destinationSlug: string;
	customBasePath?: string;
	squareDataUrl: string;
	landscapeDataUrl: string;
	portraitDataUrl: string;
	selectedSources: {
		square?: { minioKey?: string; minioUrl?: string };
		landscape?: { minioKey?: string; minioUrl?: string };
		portrait?: { minioKey?: string; minioUrl?: string };
	};
	prompts: {
		square: string;
		landscape: string;
		portrait: string;
	};
};

type WritePlanEntry = {
	variant: 'square' | 'landscape' | 'portrait';
	baseFileName: string;
	dataUrl: string;
};

type MetadataWritePlanEntry = {
	kind: 'selected-minio-locations' | 'stage-prompts';
	baseFileName: string;
	contents: string;
};

const TEMPLATE_PUBLIC_PREFIX = '/images/admin/image-gen/templates/';
const MINIO_BROWSER_BASE = 'https://minio-on-hstgr.tail8a5127.ts.net/browser/blobs/';

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
const DESTINATION_TYPE_PATHS: Record<Exclude<ImageGenDestinationType, 'custom'>, string> = {
	events: 'events',
	training: 'training',
	resources: 'resources',
	'featured-images': 'featured-images'
};

export const validateSlugOrThrow = (slug: string): string => {
	const normalized = toSafeSlug(slug);
	if (!/^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/.test(normalized)) {
		throw new Error(
			'Slug must use lowercase letters, numbers, and hyphens, with optional "/" for subfolders.'
		);
	}
	return normalized;
};

export const resolveImageDestinationPathOrThrow = (input: {
	destinationType?: ImageGenDestinationType;
	destinationSlug: string;
	customBasePath?: string;
}): {
	destinationType: ImageGenDestinationType;
	destinationSlug: string;
	customBasePath?: string;
	relativeDir: string;
	publicBaseUrl: string;
} => {
	const destinationType = input.destinationType ?? 'custom';
	const destinationSlug = validateSlugOrThrow(input.destinationSlug);
	if (destinationType === 'custom') {
		const customBasePath = input.customBasePath?.trim()
			? validateSlugOrThrow(input.customBasePath)
			: '';
		const relativeDir = customBasePath ? `${customBasePath}/${destinationSlug}` : destinationSlug;
		return {
			destinationType,
			destinationSlug,
			customBasePath: customBasePath || undefined,
			relativeDir,
			publicBaseUrl: `/images/generated/${relativeDir}`
		};
	}

	return {
		destinationType,
		destinationSlug,
		relativeDir: `${DESTINATION_TYPE_PATHS[destinationType]}/${destinationSlug}`,
		publicBaseUrl: `/images/generated/${DESTINATION_TYPE_PATHS[destinationType]}/${destinationSlug}`
	};
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
	const destination = resolveImageDestinationPathOrThrow({
		destinationType: input.destinationType,
		destinationSlug: input.destinationSlug,
		customBasePath: input.customBasePath
	});
	const targetDir = path.join(webRoot, 'static', 'images', 'generated', destination.relativeDir);
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
	const metadataWrites: Array<{
		kind: MetadataWritePlanEntry['kind'];
		absolutePath: string;
		publicUrl: string;
		fileName: string;
		version: number;
	}> = [];
	const writtenPaths: string[] = [];

	const getMinioLocation = (entry?: { minioKey?: string; minioUrl?: string }): string => {
		if (entry?.minioUrl?.trim()) return entry.minioUrl.trim();
		if (entry?.minioKey?.trim()) {
			return `${MINIO_BROWSER_BASE}${entry.minioKey.trim().replace(/^\/+/, '')}`;
		}
		return 'not-available';
	};

	try {
		for (const item of writePlan) {
			const { fileName, version } = await buildVersionedPath(targetDir, item.baseFileName);
			const absolutePath = path.join(targetDir, fileName);
			await fs.writeFile(absolutePath, decodeDataUrlToBuffer(item.dataUrl));
			writtenPaths.push(absolutePath);
			writes.push({
				variant: item.variant,
				absolutePath,
				publicUrl: `${destination.publicBaseUrl}/${fileName}`,
				fileName,
				version
			});
		}

		const minioLocationsText = [
			`path: ${destination.relativeDir}`,
			`square: ${getMinioLocation(input.selectedSources.square)}`,
			`landscape: ${getMinioLocation(input.selectedSources.landscape)}`,
			`portrait: ${getMinioLocation(input.selectedSources.portrait)}`
		].join('\n');
		const promptsText = [
			'Square prompt:',
			input.prompts.square,
			'',
			'Landscape prompt:',
			input.prompts.landscape,
			'',
			'Portrait prompt:',
			input.prompts.portrait
		].join('\n');
		const metadataPlan: MetadataWritePlanEntry[] = [
			{
				kind: 'selected-minio-locations',
				baseFileName: 'selected-minio-locations.txt',
				contents: `${minioLocationsText}\n`
			},
			{
				kind: 'stage-prompts',
				baseFileName: 'stage-prompts.txt',
				contents: `${promptsText}\n`
			}
		];

		for (const item of metadataPlan) {
			const { fileName, version } = await buildVersionedPath(targetDir, item.baseFileName);
			const absolutePath = path.join(targetDir, fileName);
			await fs.writeFile(absolutePath, item.contents, 'utf8');
			writtenPaths.push(absolutePath);
			metadataWrites.push({
				kind: item.kind,
				absolutePath,
				publicUrl: `${destination.publicBaseUrl}/${fileName}`,
				fileName,
				version
			});
		}
	} catch (error) {
		await Promise.all(
			writtenPaths.map((absolutePath) =>
				fs.unlink(absolutePath).catch(() => {
					console.warn('Failed to roll back generated file write', absolutePath);
				})
			)
		);
		throw error;
	}

	return {
		destination,
		files: writes,
		metadataFiles: metadataWrites
	};
};
