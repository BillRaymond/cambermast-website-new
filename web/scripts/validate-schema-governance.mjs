import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');

const normalize = (value) => value.split(path.sep).join('/');

const joinFromRoot = (...parts) => path.resolve(webRoot, ...parts);

const registrySchemaRoot = joinFromRoot('src/lib/data');

const manifest = {
	events: {
		registrySchema: 'src/lib/data/events/events.schema.json',
		apiSchema: 'src/lib/data/api/schemas/events-api.schema.json',
		apiBuilder: 'src/lib/data/api/events.ts',
		apiRoute: 'src/routes/api/events.json/+server.ts',
		sopMentions: [
			{
				file: 'src/routes/admin/sop/+page.svelte',
				patterns: ['/api/events.json', 'events-api.schema.json']
			}
		]
	},
	campaigns: {
		registrySchema: 'src/lib/data/campaigns.schema.json',
		apiSchema: 'src/lib/data/api/schemas/campaigns-api.schema.json',
		apiBuilder: 'src/lib/data/api/campaigns.ts',
		apiRoute: 'src/routes/api/campaigns.json/+server.ts',
		sopMentions: [
			{
				file: 'src/routes/admin/sop/+page.svelte',
				patterns: ['/api/campaigns.json', 'campaigns-api.schema.json']
			}
		]
	},
	catalog: {
		registrySchema: 'src/lib/data/catalog.schema.json',
		apiSchema: 'src/lib/data/api/schemas/catalog-api.schema.json',
		apiBuilder: 'src/lib/data/api/catalog.ts',
		apiRoute: 'src/routes/catalog.json/+server.ts',
		sopMentions: [
			{
				file: 'src/routes/admin/sop/+page.svelte',
				patterns: ['/catalog.json', 'catalog-api.schema.json']
			}
		]
	},
	training: {
		registrySchema: 'src/lib/data/training/training.schema.json',
		apiSchema: 'src/lib/data/api/schemas/training-api.schema.json',
		apiBuilder: 'src/lib/data/api/training.ts',
		apiRoute: 'src/routes/api/training.json/+server.ts',
		sopMentions: [
			{
				file: 'src/routes/admin/sop-training/+page.svelte',
				patterns: ['/api/training.json', 'training-api.schema.json']
			}
		]
	},
	tools: {
		registrySchema: 'src/lib/data/tools.schema.json',
		apiSchema: 'src/lib/data/api/schemas/tools-api.schema.json',
		apiBuilder: 'src/lib/data/api/tools.ts',
		apiRoute: 'src/routes/api/tools.json/+server.ts',
		sopMentions: [
			{
				file: 'src/routes/admin/sop/+page.svelte',
				patterns: ['/api/tools.json', 'tools-api.schema.json']
			}
		]
	},
	testimonials: {
		registrySchema: 'src/lib/data/testimonials.schema.json',
		apiSchema: 'src/lib/data/api/schemas/testimonials-api.schema.json',
		apiBuilder: 'src/lib/data/api/testimonials.ts',
		apiRoute: 'src/routes/api/testimonials.json/+server.ts',
		sopMentions: [
			{
				file: 'src/routes/admin/sop/+page.svelte',
				patterns: ['/api/testimonials.json', 'testimonials-api.schema.json']
			},
			{
				file: 'src/routes/admin/sop-testimonials/+page.svelte',
				patterns: ['/api/testimonials.json', 'testimonials-api.schema.json']
			}
		]
	}
};

const walk = async (dir) => {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(fullPath)));
			continue;
		}
		if (entry.isFile()) files.push(fullPath);
	}
	return files;
};

const fileExists = async (relativePath) => {
	try {
		const result = await stat(joinFromRoot(relativePath));
		return result.isFile();
	} catch {
		return false;
	}
};

const discoverRegistrySchemas = async () => {
	const files = await walk(registrySchemaRoot);
	return files
		.map((filePath) => normalize(path.relative(webRoot, filePath)))
		.filter((relativePath) => relativePath.endsWith('.schema.json'))
		.filter((relativePath) => !relativePath.startsWith('src/lib/data/api/schemas/'))
		.sort();
};

const ensureMentions = async (definition, domain, errors) => {
	for (const sopCheck of definition.sopMentions) {
		const sopFilePath = joinFromRoot(sopCheck.file);
		let source = '';
		try {
			source = await readFile(sopFilePath, 'utf8');
		} catch {
			errors.push(
				`[${domain}] missing SOP file: ${sopCheck.file} (add SOP coverage for this schema domain)`
			);
			continue;
		}
		for (const pattern of sopCheck.patterns) {
			if (!source.includes(pattern)) {
				errors.push(
					`[${domain}] SOP coverage missing in ${sopCheck.file}: expected mention of "${pattern}"`
				);
			}
		}
	}
};

const main = async () => {
	const errors = [];
	const discoveredSchemas = await discoverRegistrySchemas();
	const manifestEntries = Object.entries(manifest);
	const manifestSchemas = new Set(manifestEntries.map(([, entry]) => entry.registrySchema));

	for (const discoveredSchema of discoveredSchemas) {
		if (!manifestSchemas.has(discoveredSchema)) {
			errors.push(
				`Unmapped registry schema detected: ${discoveredSchema}. Add API schema/builder/route and SOP coverage for new schema.`
			);
		}
	}

	for (const [domain, definition] of manifestEntries) {
		for (const key of ['registrySchema', 'apiSchema', 'apiBuilder', 'apiRoute']) {
			const relativePath = definition[key];
			if (!(await fileExists(relativePath))) {
				errors.push(
					`[${domain}] missing required artifact: ${relativePath}. Add API schema/builder/route and SOP coverage for new schema.`
				);
			}
		}
		await ensureMentions(definition, domain, errors);
	}

	if (errors.length > 0) {
		console.error('Schema governance validation failed.');
		for (const error of errors) {
			console.error(`- ${error}`);
		}
		process.exit(1);
	}

	console.log('Schema governance validation passed.');
};

await main();
