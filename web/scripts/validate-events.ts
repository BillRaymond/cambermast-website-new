import fs from 'node:fs/promises';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { eventsPath, eventsSchemaPath, campaignsPath } from '../src/lib/server/data-paths';
import { getEventCampaignIntegrityIssues } from '../src/lib/server/event-campaign-integrity';

const [eventsRaw, eventsSchemaRaw, campaignsRaw] = await Promise.all([
	fs.readFile(eventsPath, 'utf-8'),
	fs.readFile(eventsSchemaPath, 'utf-8'),
	fs.readFile(campaignsPath, 'utf-8')
]);

const eventRegistry = JSON.parse(eventsRaw) as { events: unknown[] };
const eventSchema = JSON.parse(eventsSchemaRaw);
const campaignRegistry = JSON.parse(campaignsRaw) as { campaigns: unknown[] };

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const validate = ajv.compile(eventSchema);
const valid = validate(eventRegistry);

if (!valid) {
	console.error('Events validation failed.');
	console.error(ajv.errorsText(validate.errors, { separator: '\n' }));
	process.exit(1);
}

const integrityIssues = getEventCampaignIntegrityIssues(
	eventRegistry.events as never[],
	campaignRegistry.campaigns as never[]
);

if (integrityIssues.length > 0) {
	console.error('Event-campaign integrity validation failed.');
	console.error(integrityIssues.join('\n'));
	process.exit(1);
}

console.log('Events are valid.');
