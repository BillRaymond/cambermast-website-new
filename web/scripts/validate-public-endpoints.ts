import { gunzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GET as getCatalogApi } from '../src/routes/api/catalog.json/+server';
import { GET as getCommerceApi } from '../src/routes/api/commerce-products.json/+server';
import { GET as getEventsApi } from '../src/routes/api/events.json/+server';
import { GET as getRedirectsApi } from '../src/routes/api/redirects.json/+server';
import { GET as getResourcesApi } from '../src/routes/api/resources.json/+server';
import { GET as getTrainingApi } from '../src/routes/api/training.json/+server';
import { GET as getCalendarFeed } from '../src/routes/feed/calendar.xml/+server';
import { GET as getEventsFeed } from '../src/routes/feed/events.xml/+server';
import { GET as getOpenAiProductsFeed } from '../src/routes/feed/openai-products.jsonl.gz/+server';
import { GET as getResourcesFeed } from '../src/routes/feed/resources.xml/+server';
import { GET as getTrainingProgramsFeed } from '../src/routes/feed/training-programs.xml/+server';
import {
	buildCommerceProductsApiPayload,
	toOpenAiCommerceFeedItem
} from '../src/lib/data/api/commerce-products';
import { SITE_ORIGIN } from '../src/lib/config/site';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const origin = SITE_ORIGIN.replace(/\/$/, '');

const assert = (condition: unknown, message: string): asserts condition => {
	if (!condition) {
		throw new Error(message);
	}
};

const assertResponseOk = (label: string, response: Response) => {
	assert(response.ok, `${label} failed with status ${response.status}`);
};

const mockUrlEvent = (pathname: string) => ({
	url: new URL(`http://localhost:5173${pathname}`)
});

const assertHeaderIncludes = (
	response: Response,
	headerName: string,
	expected: string,
	label: string
) => {
	const value = response.headers.get(headerName) ?? '';
	assert(
		value.toLowerCase().includes(expected.toLowerCase()),
		`${label} missing ${headerName}: expected to include "${expected}", got "${value || '(empty)'}"`
	);
};

const readJson = async (label: string, response: Response) => {
	assertResponseOk(label, response);
	assertHeaderIncludes(response, 'content-type', 'application/json', label);
	return response.json();
};

const readText = async (label: string, response: Response) => {
	assertResponseOk(label, response);
	return response.text();
};

const validateJsonEndpoints = async () => {
	const checks = [
		{
			label: '/api/commerce-products.json',
			response: getCommerceApi(),
			validate: (payload: any) => {
				assert(Array.isArray(payload.items), 'commerce payload must include items[]');
				assert(
					payload.itemCount === payload.items.length,
					'commerce itemCount must match items length'
				);
			}
		},
		{
			label: '/api/events.json',
			response: getEventsApi(mockUrlEvent('/api/events.json')),
			validate: (payload: any) => {
				assert(Array.isArray(payload.events), 'events payload must include events[]');
			}
		},
		{
			label: '/api/training.json',
			response: getTrainingApi(),
			validate: (payload: any) => {
				assert(Array.isArray(payload.programs), 'training payload must include programs[]');
			}
		},
		{
			label: '/api/catalog.json',
			response: getCatalogApi(),
			validate: (payload: any) => {
				assert(
					payload.catalog && typeof payload.catalog === 'object',
					'catalog payload must include catalog'
				);
				assert(
					Array.isArray(payload.trainingPrograms),
					'catalog payload must include trainingPrograms[]'
				);
			}
		},
		{
			label: '/api/resources.json',
			response: getResourcesApi(),
			validate: (payload: any) => {
				assert(Array.isArray(payload.resources), 'resources payload must include resources[]');
			}
		},
		{
			label: '/api/redirects.json',
			response: getRedirectsApi(mockUrlEvent('/api/redirects.json')),
			validate: (payload: any) => {
				assert(Array.isArray(payload.redirects), 'redirects payload must include redirects[]');
			}
		}
	];

	for (const check of checks) {
		const payload = await readJson(check.label, check.response);
		check.validate(payload);
	}
};

const validateXmlFeeds = async () => {
	const feeds = [
		{ label: '/feed/calendar.xml', response: getCalendarFeed() },
		{ label: '/feed/events.xml', response: getEventsFeed() },
		{ label: '/feed/resources.xml', response: getResourcesFeed() },
		{ label: '/feed/training-programs.xml', response: getTrainingProgramsFeed() }
	];

	for (const feed of feeds) {
		assertHeaderIncludes(feed.response, 'content-type', 'xml', feed.label);
		const body = await readText(feed.label, feed.response);
		assert(body.includes('<rss'), `${feed.label} must render RSS XML`);
	}
};

const validateGzipFeed = async () => {
	const response = getOpenAiProductsFeed();
	const label = '/feed/openai-products.jsonl.gz';
	assertResponseOk(label, response);
	assertHeaderIncludes(response, 'content-type', 'application/gzip', label);
	const buffer = Buffer.from(await response.arrayBuffer());
	const decompressed = gunzipSync(buffer).toString('utf8');
	const lines = decompressed.split('\n').filter(Boolean);
	assert(lines.length > 0, `${label} must contain at least one JSONL row`);
	const previewPayload = buildCommerceProductsApiPayload({ origin });
	assert(
		lines.length === previewPayload.itemCount,
		`${label} row count must match /api/commerce-products.json itemCount`
	);

	const expectedRows = previewPayload.items.map((item) =>
		JSON.stringify(toOpenAiCommerceFeedItem(item))
	);
	for (const [index, line] of lines.entries()) {
		let parsedLine: Record<string, unknown>;
		try {
			parsedLine = JSON.parse(line);
		} catch (error) {
			throw new Error(`${label} contains invalid JSON on line ${index + 1}: ${String(error)}`);
		}
		assert(!('sourceType' in parsedLine), `${label} line ${index + 1} must not expose sourceType`);
		assert(!('sourceId' in parsedLine), `${label} line ${index + 1} must not expose sourceId`);
		assert(
			line === expectedRows[index],
			`${label} line ${index + 1} must match the normalized preview payload row`
		);
	}
};

const validateMachineReadableLinks = async () => {
	const layoutSource = await readFile(path.join(webRoot, 'src/routes/+layout.svelte'), 'utf8');
	const apiPageSource = await readFile(path.join(webRoot, 'src/routes/api/+page.svelte'), 'utf8');
	const adminPageSource = await readFile(
		path.join(webRoot, 'src/routes/admin/+page.svelte'),
		'utf8'
	);

	for (const href of [
		'/api/commerce-products.json',
		'/api/events.json',
		'/api/training.json',
		'/api/catalog.json',
		'/api/resources.json',
		'/api/redirects.json',
		'/feed/openai-products.jsonl.gz',
		'/feed/events.xml',
		'/feed/resources.xml',
		'/feed/articles.xml',
		'/feed/training-programs.xml',
		'/llms.txt'
	]) {
		assert(
			layoutSource.includes(`href="${href}" rel="external"`),
			`Footer machine-readable link ${href} must use rel="external"`
		);
	}

	assert(
		apiPageSource.includes('href={endpoint.href}\n\t\t\t\trel="external"') ||
			apiPageSource.includes('href={endpoint.href}\r\n\t\t\t\trel="external"'),
		'/api page endpoint cards must use rel="external"'
	);
	assert(
		apiPageSource.includes('href={feed.href} rel="external"'),
		'/api page feed links must use rel="external"'
	);
	assert(
		apiPageSource.includes('href={file.href} rel="external"'),
		'/api page guidance links must use rel="external"'
	);
	assert(
		adminPageSource.includes('href="/api/commerce-products.json"\n\t\t\t\trel="external"') ||
			adminPageSource.includes('href="/api/commerce-products.json"\r\n\t\t\t\trel="external"'),
		'admin commerce API shortcut must use rel="external"'
	);
	assert(
		adminPageSource.includes('href="/feed/openai-products.jsonl.gz"\n\t\t\t\trel="external"') ||
			adminPageSource.includes('href="/feed/openai-products.jsonl.gz"\r\n\t\t\t\trel="external"'),
		'admin commerce feed shortcut must use rel="external"'
	);
};

const main = async () => {
	await validateJsonEndpoints();
	await validateXmlFeeds();
	await validateGzipFeed();
	await validateMachineReadableLinks();
	console.log('Public machine-readable endpoints and link behaviors are valid.');
};

await main();
