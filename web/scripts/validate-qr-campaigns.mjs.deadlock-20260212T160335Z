import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../src/lib/data/qr-campaigns.json');
const schemaPath = path.resolve(__dirname, '../src/lib/data/qr-campaigns.schema.json');

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
	console.error('QR campaign validation failed.');
	console.error(ajv.errorsText(validate.errors, { separator: '\n' }));
	process.exit(1);
}

console.log('QR campaigns are valid.');
