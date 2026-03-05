import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const featuredDir = path.join(
	webRoot,
	'static',
	'images',
	'generated',
	'featured-images',
	'cambermast-default'
);
const logoPath = path.join(webRoot, 'static', 'images', 'cambermast-logo-full.png');

const jobs = [
	{ input: 'hero-landscape.jpg', output: 'hero-landscape-branded.png' },
	{ input: 'hero-portrait.jpg', output: 'hero-portrait-branded.png' },
	{ input: 'hero-square.jpg', output: 'hero-square-branded.png' }
];

const toInt = (value) => Math.max(1, Math.round(value));

const compose = async ({ input, output }) => {
	const inputPath = path.join(featuredDir, input);
	const outputPath = path.join(featuredDir, output);

	const baseImage = sharp(inputPath);
	const baseMeta = await baseImage.metadata();
	if (!baseMeta.width || !baseMeta.height) {
		throw new Error(`Unable to read dimensions for ${inputPath}`);
	}

	const logoTargetWidth = toInt(baseMeta.width * 0.7);
	const logoBuffer = await sharp(logoPath)
		.resize({ width: logoTargetWidth, fit: 'inside', withoutEnlargement: true })
		.png()
		.toBuffer();

	await baseImage
		.composite([{ input: logoBuffer, gravity: 'center' }])
		.png()
		.toFile(outputPath);

	const outputMeta = await sharp(outputPath).metadata();
	console.log(
		`${output} created (${outputMeta.width ?? '?'}x${outputMeta.height ?? '?'}) from ${input}`
	);
};

const main = async () => {
	await fs.access(featuredDir);
	await fs.access(logoPath);
	for (const job of jobs) {
		await compose(job);
	}
};

main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
