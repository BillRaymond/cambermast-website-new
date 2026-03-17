import fs from 'node:fs/promises';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { campaignsPath, campaignsSchemaPath, eventsPath } from '../src/lib/server/data-paths';
import { getEventCampaignIntegrityIssues } from '../src/lib/server/event-campaign-integrity';

const [campaignsRaw, campaignsSchemaRaw, eventsRaw] = await Promise.all([
	fs.readFile(campaignsPath, 'utf-8'),
	fs.readFile(campaignsSchemaPath, 'utf-8'),
	fs.readFile(eventsPath, 'utf-8')
]);

const campaignRegistry = JSON.parse(campaignsRaw) as { campaigns: unknown[] };
const campaignSchema = JSON.parse(campaignsSchemaRaw);
const eventRegistry = JSON.parse(eventsRaw) as { events: unknown[] };

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const validate = ajv.compile(campaignSchema);
const valid = validate(campaignRegistry);

if (!valid) {
	console.error('Campaign validation failed.');
	console.error(ajv.errorsText(validate.errors, { separator: '\n' }));
	process.exit(1);
}

const integrityIssues = getEventCampaignIntegrityIssues(
	eventRegistry.events as never[],
	campaignRegistry.campaigns as never[]
);

if (integrityIssues.length > 0) {
	console.error('Campaign-event integrity validation failed.');
	console.error(integrityIssues.join('\n'));
	process.exit(1);
}

console.log('Campaigns are valid.');
