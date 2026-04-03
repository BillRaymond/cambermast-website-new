import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { EventSource } from '$lib/data/events/types';
import { isLumaRegistrationUrl } from '$lib/data/events';
import { normalizeEventSessions } from '$lib/data/events/timeline';
import { buildAdminEventLumaEntries, type AdminEventLumaEntry } from '$lib/view-models/admin-event-luma';
import { listEventUi } from '$lib/view-models/events';
import { eventsPath, eventsSchemaPath, lumaArtifactsRoot, webRoot } from '$lib/server/data-paths';
import type { LumaPublishRecord } from '$lib/server/luma-publish-registry';
import { chromium } from '@playwright/test';

export type LumaPublishStatus =
	| 'not_applicable'
	| 'missing_required_fields'
	| 'too_early'
	| 'ready_to_create_private'
	| 'late_review'
	| 'awaiting_luma_review'
	| 'ready_to_link_live_url';

export type LumaPublishStatusDetails = {
	status: LumaPublishStatus;
	statusLabel: string;
	statusReason: string;
	missingFields: string[];
	firstSessionStartAtUtc?: string;
	firstSessionStartInDays?: number;
	recommendedWindowLabel: string;
	recommendedWindowMinDays: number;
	recommendedWindowMaxDays: number;
};

export type LumaRuntimeConfig = {
	createUrl: string;
	storageStatePath: string;
	storageStateExists: boolean;
	headless: boolean;
};

export type LumaCreatePrivateResult = {
	eventId: string;
	status: 'success';
	privateManageUrl: string;
	publicUrl?: string;
	startedAt: string;
	finishedAt: string;
	artifactDir: string;
	logs: string[];
};

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

let cachedValidateEvents: ReturnType<typeof ajv.compile> | null = null;

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const createUrlDefault = 'https://lu.ma/create';
const storageStateDefault = path.join(webRoot, '.auth', 'luma.json');

const lateReviewDays = 3;
const absoluteTooEarlyDays = 60;

const windowByEventType: Record<string, { minDays: number; maxDays: number }> = {
	training_session: { minDays: 21, maxDays: 45 },
	webinar: { minDays: 10, maxDays: 21 },
	talk: { minDays: 10, maxDays: 21 },
	panel: { minDays: 10, maxDays: 21 },
	roundtable: { minDays: 10, maxDays: 21 },
	fireside: { minDays: 10, maxDays: 21 },
	community: { minDays: 10, maxDays: 21 },
	event: { minDays: 10, maxDays: 21 }
};

const toJsonString = (value: unknown): string => `${JSON.stringify(value, null, '\t')}\n`;

const toTimestamp = (value?: string): number => (value ? new Date(value).valueOf() : Number.NaN);

const toLocalImagePath = (imageUrl?: string): string | undefined => {
	const trimmed = imageUrl?.trim();
	if (!trimmed || !trimmed.startsWith('/')) return undefined;
	return path.join(webRoot, 'static', trimmed.replace(/^\/+/, ''));
};

const ensureEventValidator = async () => {
	if (cachedValidateEvents) return cachedValidateEvents;
	const schemaRaw = await fs.readFile(eventsSchemaPath, 'utf-8');
	cachedValidateEvents = ajv.compile(JSON.parse(schemaRaw));
	return cachedValidateEvents;
};

const readEventRegistry = async (): Promise<{ events: EventSource[] }> => {
	const raw = await fs.readFile(eventsPath, 'utf-8');
	return JSON.parse(raw) as { events: EventSource[] };
};

const writeEventRegistry = async (registry: { events: EventSource[] }): Promise<void> => {
	const validate = await ensureEventValidator();
	const valid = validate(registry);
	if (!valid) {
		throw new Error(`Events schema validation failed: ${ajv.errorsText(validate.errors)}`);
	}
	await fs.writeFile(eventsPath, toJsonString(registry), 'utf-8');
};

const getWindowForEventType = (eventType: string) =>
	windowByEventType[eventType] ?? { minDays: 10, maxDays: 21 };

const formatWindowLabel = (minDays: number, maxDays: number): string =>
	`${minDays.toString()}-${maxDays.toString()} days before start`;

const pushMissingField = (missingFields: string[], condition: boolean, label: string) => {
	if (condition) missingFields.push(label);
};

export const getLumaRuntimeConfig = (): LumaRuntimeConfig => {
	const storageStatePath = process.env.LUMA_STORAGE_STATE_PATH?.trim() || storageStateDefault;
	return {
		createUrl: process.env.LUMA_CREATE_URL?.trim() || createUrlDefault,
		storageStatePath,
		storageStateExists: existsSync(storageStatePath),
		headless: process.env.LUMA_HEADLESS?.trim() === 'false' ? false : true
	};
};

export const getEventForLumaWorkflow = (eventIdOrSlug: string): AdminEventLumaEntry | undefined => {
	const event = listEventUi({ includeDrafts: true, includeUnlisted: true }).find(
		(candidate) => candidate.id === eventIdOrSlug || candidate.slug === eventIdOrSlug
	);
	if (!event) return undefined;
	return buildAdminEventLumaEntries([event])[0];
};

export const deriveLumaPublishStatus = (
	entry: AdminEventLumaEntry,
	record?: LumaPublishRecord,
	referenceTimestamp: number = Date.now()
): LumaPublishStatusDetails => {
	const { minDays, maxDays } = getWindowForEventType(entry.eventType);
	const recommendedWindowLabel = formatWindowLabel(minDays, maxDays);
	const firstTimestamp = toTimestamp(entry.firstSessionStartAtUtc);
	const firstSessionStartInDays = Number.isFinite(firstTimestamp)
		? Math.ceil((firstTimestamp - referenceTimestamp) / MS_IN_DAY)
		: undefined;

	const missingFields: string[] = [];
	pushMissingField(missingFields, !entry.title.trim(), 'Title');
	pushMissingField(missingFields, !entry.startDateTimeCopy.trim(), 'First session date/time');
	pushMissingField(missingFields, !entry.descriptionCopy.trim(), 'Description or summary');
	pushMissingField(missingFields, !entry.previewImageUrl?.trim(), 'Image');
	pushMissingField(missingFields, !entry.locationLabel.trim(), 'Location');
	pushMissingField(missingFields, !entry.visibility.trim(), 'Visibility');

	if (record?.reviewStatus === 'reviewed') {
		return {
			status: 'ready_to_link_live_url',
			statusLabel: 'Ready to link live URL',
			statusReason: 'Private event reviewed. Publish on Luma, then attach the live URL here.',
			missingFields,
			firstSessionStartAtUtc: entry.firstSessionStartAtUtc,
			firstSessionStartInDays,
			recommendedWindowLabel,
			recommendedWindowMinDays: minDays,
			recommendedWindowMaxDays: maxDays
		};
	}

	if (record?.privateManageUrl && record.reviewStatus !== 'live_linked') {
		return {
			status: 'awaiting_luma_review',
			statusLabel: 'Awaiting Luma review',
			statusReason: 'Private Luma event exists. Review and publish it in Luma before linking the live URL.',
			missingFields,
			firstSessionStartAtUtc: entry.firstSessionStartAtUtc,
			firstSessionStartInDays,
			recommendedWindowLabel,
			recommendedWindowMinDays: minDays,
			recommendedWindowMaxDays: maxDays
		};
	}

	if (
		entry.hasLumaRegistration ||
		entry.registrationStatus !== 'none' ||
		entry.registrationUrl?.trim() ||
		entry.visibility !== 'public' ||
		entry.lifecycleStatus !== 'scheduled' ||
		entry.occurrence !== 'future'
	) {
		return {
			status: 'not_applicable',
			statusLabel: 'Not applicable',
			statusReason: 'This event is already linked, not public, or no longer eligible for private Luma creation.',
			missingFields,
			firstSessionStartAtUtc: entry.firstSessionStartAtUtc,
			firstSessionStartInDays,
			recommendedWindowLabel,
			recommendedWindowMinDays: minDays,
			recommendedWindowMaxDays: maxDays
		};
	}

	if (missingFields.length > 0) {
		return {
			status: 'missing_required_fields',
			statusLabel: 'Missing required fields',
			statusReason: 'Complete the required event content before creating a private Luma event.',
			missingFields,
			firstSessionStartAtUtc: entry.firstSessionStartAtUtc,
			firstSessionStartInDays,
			recommendedWindowLabel,
			recommendedWindowMinDays: minDays,
			recommendedWindowMaxDays: maxDays
		};
	}

	if (!Number.isFinite(firstTimestamp) || firstTimestamp <= referenceTimestamp) {
		return {
			status: 'not_applicable',
			statusLabel: 'Not applicable',
			statusReason: 'This event does not have a future first session.',
			missingFields,
			firstSessionStartAtUtc: entry.firstSessionStartAtUtc,
			firstSessionStartInDays,
			recommendedWindowLabel,
			recommendedWindowMinDays: minDays,
			recommendedWindowMaxDays: maxDays
		};
	}

	if ((firstSessionStartInDays ?? 0) > absoluteTooEarlyDays || (firstSessionStartInDays ?? 0) > maxDays) {
		return {
			status: 'too_early',
			statusLabel: 'Too early',
			statusReason: `Recommended private creation window is ${recommendedWindowLabel}.`,
			missingFields,
			firstSessionStartAtUtc: entry.firstSessionStartAtUtc,
			firstSessionStartInDays,
			recommendedWindowLabel,
			recommendedWindowMinDays: minDays,
			recommendedWindowMaxDays: maxDays
		};
	}

	if ((firstSessionStartInDays ?? 0) < lateReviewDays || (firstSessionStartInDays ?? 0) < minDays) {
		return {
			status: 'late_review',
			statusLabel: 'Late review',
			statusReason: 'This event is close to start. Create privately only after a careful final check.',
			missingFields,
			firstSessionStartAtUtc: entry.firstSessionStartAtUtc,
			firstSessionStartInDays,
			recommendedWindowLabel,
			recommendedWindowMinDays: minDays,
			recommendedWindowMaxDays: maxDays
		};
	}

	return {
		status: 'ready_to_create_private',
		statusLabel: 'Ready to create private',
		statusReason: `Inside the recommended private creation window: ${recommendedWindowLabel}.`,
		missingFields,
		firstSessionStartAtUtc: entry.firstSessionStartAtUtc,
		firstSessionStartInDays,
		recommendedWindowLabel,
		recommendedWindowMinDays: minDays,
		recommendedWindowMaxDays: maxDays
	};
};

const waitForVisible = async (page: import('@playwright/test').Page, selectors: string[]) => {
	for (const selector of selectors) {
		const locator = page.locator(selector).first();
		if (await locator.count()) {
			await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
			if (await locator.isVisible().catch(() => false)) return locator;
		}
	}
	return null;
};

const fillFirstAvailable = async (
	page: import('@playwright/test').Page,
	selectors: string[],
	value: string
): Promise<boolean> => {
	if (!value.trim()) return false;
	const locator = await waitForVisible(page, selectors);
	if (!locator) return false;
	await locator.click({ timeout: 5000 }).catch(() => null);
	await locator.fill(value);
	return true;
};

const clickFirstAvailable = async (
	page: import('@playwright/test').Page,
	selectors: string[]
): Promise<boolean> => {
	const locator = await waitForVisible(page, selectors);
	if (!locator) return false;
	await locator.click();
	return true;
};

const uploadImageIfPossible = async (
	page: import('@playwright/test').Page,
	imagePath: string | undefined
): Promise<boolean> => {
	if (!imagePath || !existsSync(imagePath)) return false;

	for (const selector of ['input[type="file"]', 'input[accept*="image"]']) {
		const locator = page.locator(selector).first();
		if ((await locator.count()) > 0) {
			await locator.setInputFiles(imagePath);
			return true;
		}
	}

	return false;
};

const clickButtonByName = async (
	page: import('@playwright/test').Page,
	patterns: RegExp[]
): Promise<boolean> => {
	for (const pattern of patterns) {
		const button = page.getByRole('button', { name: pattern }).first();
		if ((await button.count()) > 0) {
			await button.click().catch(() => null);
			return true;
		}
	}
	return false;
};

const chooseMostPrivateVisibility = async (
	page: import('@playwright/test').Page,
	log: (message: string) => void
): Promise<void> => {
	const directOptions = [/private/i, /unlisted/i, /invite[- ]only/i, /hidden/i];
	for (const pattern of directOptions) {
		const option = page.getByRole('radio', { name: pattern }).first();
		if ((await option.count()) > 0) {
			await option.check().catch(() => null);
			log(`Selected visibility option matching ${pattern.toString()}.`);
			return;
		}
	}

	if (await clickButtonByName(page, [/visibility/i, /public/i])) {
		for (const pattern of directOptions) {
			const option =
				page.getByRole('menuitemradio', { name: pattern }).first() ||
				page.getByRole('option', { name: pattern }).first();
			if ((await option.count()) > 0) {
				await option.click().catch(() => null);
				log(`Selected visibility option matching ${pattern.toString()} from menu.`);
				return;
			}
		}
	}

	throw new Error('Unable to select a private or unlisted visibility option in the Luma UI.');
};

const extractKnownUrl = (text: string): string | undefined => {
	const match = text.match(/https?:\/\/(?:www\.)?(?:lu\.ma|luma\.com)\/[^\s)"']+/i);
	return match?.[0];
};

const capturePossiblePublicUrl = async (page: import('@playwright/test').Page): Promise<string | undefined> => {
	const text = await page.locator('body').innerText().catch(() => '');
	return extractKnownUrl(text);
};

export const createPrivateLumaEvent = async (
	entry: AdminEventLumaEntry,
	options: { force?: boolean } = {}
): Promise<LumaCreatePrivateResult> => {
	if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('/ms-playwright')) {
		process.env.PLAYWRIGHT_BROWSERS_PATH = '/ms-playwright';
	}

	const config = getLumaRuntimeConfig();
	if (!config.storageStateExists) {
		throw new Error(
			`Missing Luma storage state at ${config.storageStatePath}. Sign in with Playwright and save storage state before running private creation.`
		);
	}

	const status = deriveLumaPublishStatus(entry);
	if (!options.force && status.status !== 'ready_to_create_private' && status.status !== 'late_review') {
		throw new Error(`Event is not eligible for private Luma creation: ${status.statusReason}`);
	}

	const artifactId = `${entry.id}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
	const artifactDir = path.join(lumaArtifactsRoot, artifactId);
	await fs.mkdir(artifactDir, { recursive: true });

	const logs: string[] = [];
	const log = (message: string) => logs.push(`[${new Date().toISOString()}] ${message}`);
	const startedAt = new Date().toISOString();
	const imagePath = toLocalImagePath(entry.previewImageUrl);
	const firstSession = normalizeEventSessions([
		{
			startAtUtc: entry.firstSessionStartAtUtc ?? '',
			endAtUtc: entry.firstSessionEndAtUtc ?? entry.firstSessionStartAtUtc ?? ''
		}
	])[0];

	if (!firstSession) {
		throw new Error('The event must have a valid first session to create a private Luma event.');
	}

	const browser = await chromium.launch({ headless: config.headless });
	try {
		const context = await browser.newContext({ storageState: config.storageStatePath });
		const page = await context.newPage();
		await page.goto(config.createUrl, { waitUntil: 'domcontentloaded' });
		await page.screenshot({ path: path.join(artifactDir, '01-create-page.png'), fullPage: true });

		const titleFilled = await fillFirstAvailable(page, ['input[name="title"]', 'input[placeholder*="title" i]'], entry.nameCopy);
		if (!titleFilled) throw new Error('Unable to find the event title field in the Luma create form.');
		log('Filled event title.');

		await fillFirstAvailable(
			page,
			['textarea[name="description"]', 'textarea[placeholder*="description" i]', '[contenteditable="true"]'],
			entry.descriptionCopy
		);
		log('Filled description.');

		await fillFirstAvailable(page, ['input[type="date"]', 'input[name*="date" i]'], new Date(firstSession.startTimestamp).toISOString().slice(0, 10));
		await fillFirstAvailable(
			page,
			['input[type="time"]', 'input[name*="start" i]', 'input[placeholder*="start time" i]'],
			new Date(firstSession.startTimestamp).toISOString().slice(11, 16)
		);
		await fillFirstAvailable(
			page,
			['input[name*="end" i]', 'input[placeholder*="end time" i]'],
			new Date(firstSession.endTimestamp).toISOString().slice(11, 16)
		);
		log('Filled first session timing.');

		if (entry.locationLabel.trim()) {
			await clickButtonByName(page, [/online/i, /virtual/i]).catch(() => null);
			await fillFirstAvailable(
				page,
				['input[name*="location" i]', 'input[placeholder*="location" i]', 'input[placeholder*="where" i]'],
				entry.locationLabel
			);
			log('Filled location.');
		}

		if (entry.priceCopy.trim()) {
			await fillFirstAvailable(
				page,
				['input[name*="price" i]', 'input[placeholder*="price" i]', 'input[inputmode="decimal"]'],
				entry.priceCopy
			);
			log('Filled price.');
		}

		const uploadedImage = await uploadImageIfPossible(page, imagePath);
		if (uploadedImage) {
			log(`Uploaded image from ${imagePath}.`);
		} else {
			log('Skipped image upload because no compatible file input was found.');
		}

		await chooseMostPrivateVisibility(page, log);
		await page.screenshot({ path: path.join(artifactDir, '02-filled-private.png'), fullPage: true });

		const submitted =
			(await clickButtonByName(page, [/create event/i, /continue/i, /save/i, /next/i])) ||
			(await clickFirstAvailable(page, ['button[type="submit"]']));
		if (!submitted) {
			throw new Error('Unable to find the final create/save button in the Luma create form.');
		}
		log('Submitted private event creation form.');

		await page.waitForLoadState('domcontentloaded');
		await page.waitForTimeout(2500);
		await page.screenshot({ path: path.join(artifactDir, '03-after-submit.png'), fullPage: true });

		const privateManageUrl = page.url();
		if (!/https?:\/\/(?:www\.)?(?:lu\.ma|luma\.com)\//i.test(privateManageUrl)) {
			throw new Error('Luma did not navigate to a recognizable event management URL after create.');
		}

		const publicUrl = await capturePossiblePublicUrl(page);
		const finishedAt = new Date().toISOString();
		await fs.writeFile(path.join(artifactDir, 'run-log.txt'), `${logs.join('\n')}\n`, 'utf-8');

		return {
			eventId: entry.id,
			status: 'success',
			privateManageUrl,
			publicUrl,
			startedAt,
			finishedAt,
			artifactDir,
			logs
		};
	} catch (error) {
		await fs.writeFile(path.join(artifactDir, 'run-log.txt'), `${logs.join('\n')}\n`, 'utf-8').catch(() => null);
		throw error;
	} finally {
		await browser.close();
	}
};

export const attachLiveLumaUrlToEvent = async (input: {
	eventId: string;
	liveUrl: string;
	ctaLabel?: string;
}): Promise<void> => {
	const liveUrl = input.liveUrl.trim();
	if (!isLumaRegistrationUrl(liveUrl)) {
		throw new Error('Live URL must be a valid Luma or Lu.ma URL.');
	}

	const registry = await readEventRegistry();
	const index = registry.events.findIndex((event) => event.id === input.eventId);
	if (index < 0) {
		throw new Error(`Unable to find event ${input.eventId} in events.json.`);
	}

	const current = registry.events[index];
	registry.events[index] = {
		...current,
		registrationStatus: 'external',
		cta: {
			...current.cta,
			label: input.ctaLabel?.trim() || 'Register now',
			url: liveUrl
		}
	};

	await writeEventRegistry(registry);
};
