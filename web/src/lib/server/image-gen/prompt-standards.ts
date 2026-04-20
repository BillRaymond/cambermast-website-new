import path from 'node:path';
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { ImageGenDestinationType, ImageGenStage } from '$lib/server/image-gen/types';
import type {
	ImageGenPromptStandard,
	ImageGenPromptStandardsRegistry
} from '$lib/data/image-gen-standards';
import type { ImageReference } from '$lib/data/image-contract';
import { resolveImageDestinationPathOrThrow } from '$lib/server/image-gen/files';

type PromptStandardDestinationType = Exclude<ImageGenDestinationType, 'static-templates'>;

type PromptSet = {
	square: string;
	landscape: string;
	portrait: string;
};

type WriteResultLike = {
	variant: ImageGenStage;
	fileName?: string;
	publicUrl: string;
};

type AppendImageGenPromptStandardInput = {
	destinationType: PromptStandardDestinationType;
	destinationSlug: string;
	customBasePath?: string;
	prompts: PromptSet;
	writes: WriteResultLike[];
	reference?: Partial<ImageReference>;
};

const resolveWebRoot = (): string => {
	const cwd = process.cwd();
	const direct = path.join(cwd, 'static');
	const nested = path.join(cwd, 'web', 'static');
	if (existsSync(direct)) return cwd;
	if (existsSync(nested)) return path.join(cwd, 'web');
	return cwd;
};

const webRoot = resolveWebRoot();
const registryPath = path.join(webRoot, 'src', 'lib', 'data', 'image-gen-standards.json');
const schemaPath = path.join(webRoot, 'src', 'lib', 'data', 'image-gen-standards.schema.json');
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
let validateRegistry: ReturnType<Ajv['compile']> | null = null;

const toJsonString = (value: unknown): string => `${JSON.stringify(value, null, '\t')}\n`;

const getFileNameFromPublicUrl = (publicUrl: string): string => {
	const parts = publicUrl.split('/').filter(Boolean);
	return parts.at(-1) ?? '';
};

const ensurePrompt = (value: string, label: string): string => {
	const prompt = value.trim();
	if (!prompt) throw new Error(`${label} prompt is required.`);
	return prompt;
};

const getEntitySlug = (destination: {
	destinationType: ImageGenDestinationType;
	destinationSlug: string;
	relativeDir: string;
}): string =>
	destination.destinationType === 'custom' ? destination.relativeDir : destination.destinationSlug;

const readRegistry = async (): Promise<ImageGenPromptStandardsRegistry> => {
	const raw = await fs.readFile(registryPath, 'utf-8');
	return JSON.parse(raw) as ImageGenPromptStandardsRegistry;
};

const getRegistryValidator = async () => {
	if (validateRegistry) return validateRegistry;
	const schemaRaw = await fs.readFile(schemaPath, 'utf-8');
	validateRegistry = ajv.compile(JSON.parse(schemaRaw));
	return validateRegistry;
};

export const appendImageGenPromptStandard = async (input: AppendImageGenPromptStandardInput) => {
	const destination = resolveImageDestinationPathOrThrow({
		destinationType: input.destinationType,
		destinationSlug: input.destinationSlug,
		customBasePath: input.customBasePath
	});

	const prompts = {
		square: ensurePrompt(input.prompts.square, 'Square'),
		landscape: ensurePrompt(input.prompts.landscape, 'Landscape'),
		portrait: ensurePrompt(input.prompts.portrait, 'Portrait')
	};

	const byVariant = new Map<ImageGenStage, WriteResultLike>();
	for (const write of input.writes) {
		if (
			write.variant === 'square' ||
			write.variant === 'landscape' ||
			write.variant === 'portrait'
		) {
			byVariant.set(write.variant, write);
		}
	}

	const square = byVariant.get('square');
	const landscape = byVariant.get('landscape');
	const portrait = byVariant.get('portrait');
	if (!square || !landscape || !portrait) {
		throw new Error(
			'Square, landscape, and portrait files are required to record prompt standards.'
		);
	}

	const toAssetKey = (write: WriteResultLike): string => {
		const fileName = (write.fileName || getFileNameFromPublicUrl(write.publicUrl)).trim();
		if (!fileName) throw new Error(`Unable to determine filename for ${write.variant}.`);
		return `${destination.relativeDir}/${fileName}`;
	};

	const entry: ImageGenPromptStandard = {
		id: randomUUID().replace(/-/g, '').slice(0, 16),
		createdAt: new Date().toISOString(),
		entityType: input.destinationType,
		entitySlug: getEntitySlug(destination),
		assetKeys: {
			square: toAssetKey(square),
			landscape: toAssetKey(landscape),
			portrait: toAssetKey(portrait)
		},
		prompts,
		reference: {
			url: input.reference?.url ?? null,
			sourceType: input.reference?.sourceType ?? 'none',
			label: input.reference?.label?.trim() || 'No reference image used'
		}
	};

	const registry = await readRegistry();
	const nextRegistry: ImageGenPromptStandardsRegistry = {
		version: 1,
		updatedAt: new Date().toISOString(),
		standards: [entry, ...(registry.standards ?? [])].slice(0, 500)
	};

	const validate = await getRegistryValidator();
	if (!validate(nextRegistry)) {
		throw new Error(
			`Image gen standards schema validation failed: ${ajv.errorsText(validate.errors)}`
		);
	}

	await fs.writeFile(registryPath, toJsonString(nextRegistry), 'utf-8');
	return entry;
};
