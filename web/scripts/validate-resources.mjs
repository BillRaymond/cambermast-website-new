import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../src/lib/data/resources/resources.json');
const schemaPath = path.resolve(__dirname, '../src/lib/data/resources/resources.schema.json');
const aiCodingPromptGuidePagePath = path.resolve(
	__dirname,
	'../src/routes/resources/ai-coding-prompt-guide/+page.svelte'
);
const aiCodingPromptGuidePrintPath = path.resolve(
	__dirname,
	'../src/routes/(plain)/resources/[slug]/print/+page.svelte'
);
const aiCodingPromptGuideContentPath = path.resolve(
	__dirname,
	'../src/lib/components/resources/AiCodingPromptGuideContent.svelte'
);

const [dataRaw, schemaRaw] = await Promise.all([
	fs.readFile(dataPath, 'utf-8'),
	fs.readFile(schemaPath, 'utf-8')
]);

const data = JSON.parse(dataRaw);
const schema = JSON.parse(schemaRaw);

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) {
	console.error('Resources registry validation failed.');
	console.error(ajv.errorsText(validate.errors, { separator: '\n' }));
	process.exit(1);
}

const [aiCodingPromptGuidePageSource, aiCodingPromptGuidePrintSource, aiCodingPromptGuideContentSource] =
	await Promise.all([
		fs.readFile(aiCodingPromptGuidePagePath, 'utf-8'),
		fs.readFile(aiCodingPromptGuidePrintPath, 'utf-8'),
		fs.readFile(aiCodingPromptGuideContentPath, 'utf-8')
	]);

const sharedRendererImport = "AiCodingPromptGuideContent from '$lib/components/resources/AiCodingPromptGuideContent.svelte'";

if (!aiCodingPromptGuidePageSource.includes(sharedRendererImport)) {
	console.error(
		'AI Coding Prompt Guide page must use the shared AiCodingPromptGuideContent renderer.'
	);
	process.exit(1);
}

if (!aiCodingPromptGuidePrintSource.includes(sharedRendererImport)) {
	console.error(
		'AI Coding Prompt Guide print route must use the shared AiCodingPromptGuideContent renderer.'
	);
	process.exit(1);
}

if (!aiCodingPromptGuidePageSource.includes('<AiCodingPromptGuideContent resource={aiCodingPromptGuide} />')) {
	console.error(
		'AI Coding Prompt Guide page must render the shared content component from the canonical guide content.'
	);
	process.exit(1);
}

if (
	!aiCodingPromptGuidePrintSource.includes(
		'<AiCodingPromptGuideContent resource={resource} variant="print" />'
	)
) {
	console.error(
		'AI Coding Prompt Guide print route must render the shared content component in print mode.'
	);
	process.exit(1);
}

if (aiCodingPromptGuideContentSource.includes('.slice(')) {
	console.error(
		'AI Coding Prompt Guide shared content renderer must not truncate substantive content with slice().'
	);
	process.exit(1);
}

console.log('Resources registry is valid.');
