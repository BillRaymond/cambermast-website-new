import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import eventsApiSchema from '../src/lib/data/api/schemas/events-api.schema.json';
import campaignsApiSchema from '../src/lib/data/api/schemas/campaigns-api.schema.json';
import enumsApiSchema from '../src/lib/data/api/schemas/enums-api.schema.json';
import catalogApiSchema from '../src/lib/data/api/schemas/catalog-api.schema.json';
import trainingApiSchema from '../src/lib/data/api/schemas/training-api.schema.json';
import testimonialsApiSchema from '../src/lib/data/api/schemas/testimonials-api.schema.json';
import toolsApiSchema from '../src/lib/data/api/schemas/tools-api.schema.json';
import faqPresetsApiSchema from '../src/lib/data/api/schemas/faq-presets-api.schema.json';
import { buildEventsApiExamples, buildEventsApiPayload } from '../src/lib/data/api/events';
import { buildCampaignsApiExamples, buildCampaignsApiPayload } from '../src/lib/data/api/campaigns';
import { buildEnumsApiExamples, buildEnumsApiPayload } from '../src/lib/data/api/enums';
import { buildCatalogApiExamples, buildCatalogApiPayload } from '../src/lib/data/api/catalog';
import { buildTrainingApiExamples, buildTrainingApiPayload } from '../src/lib/data/api/training';
import {
	buildTestimonialsApiExamples,
	buildTestimonialsApiPayload
} from '../src/lib/data/api/testimonials';
import { buildToolsApiExamples, buildToolsApiPayload } from '../src/lib/data/api/tools';
import {
	buildFaqPresetsApiExamples,
	buildFaqPresetsApiPayload
} from '../src/lib/data/api/faq-presets';
import { SITE_ORIGIN } from '../src/lib/config/site';

const origin = SITE_ORIGIN.replace(/\/$/, '');

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const assertValid = (name: string, schema: object, payload: unknown) => {
	const validate = ajv.compile(schema);
	const valid = validate(payload);
	if (!valid) {
		console.error(`Validation failed: ${name}`);
		console.error(ajv.errorsText(validate.errors, { separator: '\n' }));
		process.exit(1);
	}
};

const eventsPayload = buildEventsApiPayload({ origin, generatedAt: '2026-02-12T18:15:00.000Z' });
const eventsExamples = buildEventsApiExamples(origin);
assertValid('events api payload', eventsApiSchema as object, eventsPayload);
assertValid('events api example', eventsApiSchema as object, eventsExamples.example);
if (eventsExamples.partnerExample) {
	assertValid(
		'events api partner example',
		eventsApiSchema as object,
		eventsExamples.partnerExample
	);
}

const campaignsPayload = buildCampaignsApiPayload({
	origin,
	generatedAt: '2026-02-12T18:15:00.000Z'
});
const campaignsExamples = buildCampaignsApiExamples(origin);
assertValid('campaigns api payload', campaignsApiSchema as object, campaignsPayload);
assertValid('campaigns api example', campaignsApiSchema as object, campaignsExamples.example);
if (campaignsExamples.partnerExample) {
	assertValid(
		'campaigns api partner example',
		campaignsApiSchema as object,
		campaignsExamples.partnerExample
	);
}

const enumsPayload = buildEnumsApiPayload({ generatedAt: '2026-02-12T18:15:00.000Z' });
const enumsExamples = buildEnumsApiExamples();
assertValid('enums api payload', enumsApiSchema as object, enumsPayload);
assertValid('enums api example', enumsApiSchema as object, enumsExamples.example);

const catalogPayload = buildCatalogApiPayload({ origin });
const catalogExamples = buildCatalogApiExamples(origin);
assertValid('catalog api payload', catalogApiSchema as object, catalogPayload);
assertValid('catalog api example', catalogApiSchema as object, catalogExamples.example);

const trainingPayload = buildTrainingApiPayload({
	origin,
	generatedAt: '2026-02-14T17:00:00.000Z'
});
const trainingExamples = buildTrainingApiExamples(origin);
assertValid('training api payload', trainingApiSchema as object, trainingPayload);
assertValid('training api example', trainingApiSchema as object, trainingExamples.example);

const testimonialsPayload = buildTestimonialsApiPayload({
	origin,
	generatedAt: '2026-02-13T18:15:00.000Z'
});
const testimonialsExamples = buildTestimonialsApiExamples(origin);
assertValid('testimonials api payload', testimonialsApiSchema as object, testimonialsPayload);
assertValid(
	'testimonials api example',
	testimonialsApiSchema as object,
	testimonialsExamples.example
);

const toolsPayload = buildToolsApiPayload({
	origin,
	generatedAt: '2026-02-13T18:15:00.000Z'
});
const toolsExamples = buildToolsApiExamples(origin);
assertValid('tools api payload', toolsApiSchema as object, toolsPayload);
assertValid('tools api example', toolsApiSchema as object, toolsExamples.example);

const faqPresetsPayload = buildFaqPresetsApiPayload({
	origin,
	generatedAt: '2026-02-18T19:00:00.000Z'
});
const faqPresetsExamples = buildFaqPresetsApiExamples(origin);
assertValid('faq presets api payload', faqPresetsApiSchema as object, faqPresetsPayload);
assertValid('faq presets api example', faqPresetsApiSchema as object, faqPresetsExamples.example);

console.log('API responses and examples are valid.');
