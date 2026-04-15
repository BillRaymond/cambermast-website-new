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
import { uploadImageIfPossible } from '$lib/server/luma-image-upload';
import { capturePublicLumaUrlFromManagePage } from '$lib/server/luma-share-url';
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

export type LumaRefreshPublicUrlResult = {
	eventId: string;
	status: 'success';
	privateManageUrl: string;
	publicUrl: string;
	startedAt: string;
	finishedAt: string;
	artifactDir: string;
	logs: string[];
};

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

let cachedValidateEvents: ReturnType<typeof ajv.compile> | null = null;

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const createUrlDefault = 'https://luma.com/calendar/manage/cal-WiCb89B8ouz3ZFH';
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

const formatLumaDate = (timestamp: number, timeZone: string): string =>
	new Intl.DateTimeFormat('en-US', {
		timeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(timestamp);

const formatLumaDateNeedle = (timestamp: number, timeZone: string): string =>
	new Intl.DateTimeFormat('en-US', {
		timeZone,
		month: 'short',
		day: 'numeric'
	}).format(timestamp);

const getLumaDateParts = (
	timestamp: number,
	timeZone: string
): { year: number; month: number; day: number } => {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	}).formatToParts(timestamp);
	return {
		year: Number(parts.find((part) => part.type === 'year')?.value ?? '0'),
		month: Number(parts.find((part) => part.type === 'month')?.value ?? '0'),
		day: Number(parts.find((part) => part.type === 'day')?.value ?? '0')
	};
};

const formatLumaTime = (timestamp: number, timeZone: string): string => {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	}).formatToParts(timestamp);
	const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
	const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
	return `${hour}:${minute}`;
};

const formatLumaTimeOption = (timestamp: number, timeZone: string): string =>
	new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(timestamp);

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

const openLumaCreatePage = async (
	page: import('@playwright/test').Page,
	createUrl: string,
	log: (message: string) => void
): Promise<void> => {
	await page.goto(createUrl, { waitUntil: 'domcontentloaded' });
	await page.waitForTimeout(1200);

	if (/\/create(?:\?|$)/i.test(page.url())) {
		log(`Opened Luma create page directly from ${createUrl}.`);
		return;
	}

	const addEventButton = page.getByRole('button', { name: /add event/i }).first();
	if ((await addEventButton.count()) > 0 && (await addEventButton.isVisible().catch(() => false))) {
		await addEventButton.click();
		await page.waitForTimeout(300);

		const createNewEventOption = page.getByText(/Create New Event/i).first();
		if ((await createNewEventOption.count()) === 0) {
			throw new Error('Opened the calendar Events menu, but Create New Event was not available.');
		}

		await createNewEventOption.click();
		await page.waitForLoadState('domcontentloaded').catch(() => null);
		await page.waitForTimeout(1200);
		log('Opened the create form from the calendar Events plus menu.');
		return;
	}

	const createEventLink = page.getByRole('link', { name: /^Create Event$/i }).first();
	if ((await createEventLink.count()) > 0 && (await createEventLink.isVisible().catch(() => false))) {
		await createEventLink.click();
		await page.waitForLoadState('domcontentloaded').catch(() => null);
		await page.waitForTimeout(1200);
		log('Opened the create form from the calendar Create Event link.');
		return;
	}

	throw new Error(
		'Unable to open the Luma create form. Expected either a calendar Events plus button or a Create Event link.'
	);
};

const fillNthVisible = async (
	page: import('@playwright/test').Page,
	selector: string,
	index: number,
	value: string,
	options: { afterFillPress?: string } = {}
): Promise<boolean> => {
	if (!value.trim()) return false;
	const locator = page.locator(selector).nth(index);
	if ((await locator.count()) === 0) return false;
	await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
	if (!(await locator.isVisible().catch(() => false))) return false;
	await locator.click({ timeout: 5000 }).catch(() => null);
	await locator.fill(value);
	if (options.afterFillPress) {
		await page.keyboard.press(options.afterFillPress).catch(() => null);
	}
	return true;
};

const dismissFloatingPortalIfPresent = async (
	page: import('@playwright/test').Page
): Promise<void> => {
	const portal = page.locator('[data-floating-ui-portal]').last();
	if ((await portal.count()) === 0) return;
	await page.keyboard.press('Escape').catch(() => null);
	await page.waitForTimeout(200);
	await page
		.evaluate(() => {
			const active = document.activeElement as HTMLElement | null;
			active?.blur?.();
		})
		.catch(() => null);
	await page.waitForTimeout(100);
	await page.keyboard.press('Tab').catch(() => null);
	await page.waitForTimeout(100);
	await page.keyboard.press('Escape').catch(() => null);
	await page.waitForTimeout(150);
};

const setLumaTime = async (
	page: import('@playwright/test').Page,
	inputIndex: number,
	timestamp: number,
	timeZone: string
): Promise<boolean> => {
	const input = page.locator('input[type="time"]').nth(inputIndex);
	if ((await input.count()) === 0) return false;
	await input.click({ timeout: 5000 }).catch(() => null);
	await page.waitForTimeout(200);

	const optionLabel = formatLumaTimeOption(timestamp, timeZone);
	const option = page.locator('[data-floating-ui-portal]').last().getByText(optionLabel, { exact: true }).first();
	if ((await option.count()) > 0) {
		await option.click({ force: true }).catch(() => null);
		await page.waitForTimeout(200);
		await dismissFloatingPortalIfPresent(page);
		return true;
	}

	await input.fill(formatLumaTime(timestamp, timeZone)).catch(() => null);
	await page.keyboard.press('Tab').catch(() => null);
	await page.waitForTimeout(200);
	await dismissFloatingPortalIfPresent(page);
	return true;
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeLumaTitleNeedle = (value: string): string =>
	value
		.replace(/^[^\p{L}\p{N}]+/u, '')
		.replace(/\s*\([^)]*\)\s*/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const openCreatedEventFromEventsList = async (
	page: import('@playwright/test').Page,
	entry: AdminEventLumaEntry,
	log: (message: string) => void
): Promise<boolean> => {
	if (!/https?:\/\/(?:www\.)?(?:lu\.ma|luma\.com)\/events/i.test(page.url())) return false;
	const titleNeedle = normalizeLumaTitleNeedle(entry.title) || normalizeLumaTitleNeedle(entry.nameCopy);
	if (!titleNeedle) return false;

	const heading = page.getByText(new RegExp(escapeRegExp(titleNeedle), 'i')).first();
	if ((await heading.count()) === 0) return false;

	const card = heading.locator('xpath=ancestor::div[contains(@class, "content-card")]').first();
	if ((await card.count()) === 0) return false;

	const manageButton = card.getByText(/manage event/i).first();
	if ((await manageButton.count()) > 0) {
		await manageButton.click({ force: true }).catch(() => null);
	} else {
		await card.click({ force: true }).catch(() => null);
	}
	await page.waitForLoadState('domcontentloaded').catch(() => null);
	await page.waitForTimeout(1500);
	log('Opened created event from the Luma events list.');
	return !/\/events(?:\/?$|\?)/i.test(page.url());
};

const pickLumaDate = async (
	page: import('@playwright/test').Page,
	inputIndex: number,
	timestamp: number,
	timeZone: string
): Promise<boolean> => {
	const input = page.locator('input[type="text"].dt-input').nth(inputIndex);
	if ((await input.count()) === 0) return false;
	const { year, month, day } = getLumaDateParts(timestamp, timeZone);
	const targetMonthSelector = `[data-lux-date-picker-month="${year.toString()}-${month.toString()}"]`;
	const targetNeedle = formatLumaDateNeedle(timestamp, timeZone);

	for (let outerAttempt = 0; outerAttempt < 2; outerAttempt += 1) {
		await dismissFloatingPortalIfPresent(page);
		await input.click({ timeout: 5000, force: true }).catch(() => null);
		await page.waitForTimeout(300);

		for (let monthAdvance = 0; monthAdvance < 12; monthAdvance += 1) {
			const dayCell = page
				.locator(`${targetMonthSelector} .day:not(.disabled)`)
				.filter({ hasText: new RegExp(`^${day.toString()}$`) })
				.first();
			if ((await dayCell.count()) > 0) {
				await dayCell.click({ timeout: 5000 }).catch(() => null);
				await page.waitForTimeout(300);
				await dismissFloatingPortalIfPresent(page);
				const currentValue = (await input.inputValue().catch(() => '')).trim();
				if (currentValue.includes(targetNeedle)) return true;
				break;
			}

			const nextMonthButton = page.locator('[data-floating-ui-portal] .header .icon.right:not(.disabled)').last();
			if ((await nextMonthButton.count()) === 0) break;
			await nextMonthButton.click({ timeout: 5000 }).catch(() => null);
			await page.waitForTimeout(250);
		}
	}

	await dismissFloatingPortalIfPresent(page);
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

const setTimezoneIfPossible = async (
	page: import('@playwright/test').Page,
	timeZoneIana: string | undefined,
	log: (message: string) => void
): Promise<boolean> => {
	if (!timeZoneIana) return false;

	const preferredLabels = {
		'America/Los_Angeles': 'Pacific Time - Los Angeles'
	} as const;
	const label = preferredLabels[timeZoneIana as keyof typeof preferredLabels];
	if (!label) return false;

	const opened =
		(await clickFirstAvailable(page, [
			'text=GMT+00:00',
			'text=UTC',
			'[class*="tz-input"]',
			'[class*="tz-display"]'
		])) || (await clickButtonByName(page, [/utc/i, /gmt/i]));
	if (!opened) return false;

	await page.waitForTimeout(500);
	const option = page.getByText(label, { exact: true }).first();
	if ((await option.count()) === 0) return false;
	await option.click();
	log(`Selected timezone ${label}.`);
	return true;
};

const fillDescriptionModal = async (
	page: import('@playwright/test').Page,
	value: string,
	log: (message: string) => void
): Promise<boolean> => {
	if (!value.trim()) return false;
	const opened = await clickFirstAvailable(page, [
		'[role="button"]:has-text("Add Description")',
		'text=Add Description'
	]);
	if (!opened) return false;
	await page.waitForTimeout(500);

	const editor = page.getByRole('textbox').last();
	if ((await editor.count()) === 0) return false;
	await editor.click();
	await editor.fill(value);
	await page.getByRole('button', { name: /^done$/i }).click().catch(() => null);
	await page.waitForTimeout(300);
	log('Filled description.');
	return true;
};

const setLocation = async (
	page: import('@playwright/test').Page,
	entry: AdminEventLumaEntry,
	log: (message: string) => void
): Promise<boolean> => {
	const opened = await clickFirstAvailable(page, [
		'text=Add Event Location',
		'[role="button"]:has-text("Add Event Location")'
	]);
	if (!opened) return false;
	await page.waitForTimeout(500);

	if (entry.locationMode === 'online') {
		const zoomOption = page.getByText('Create Zoom meeting', { exact: true }).first();
		if ((await zoomOption.count()) > 0) {
			await zoomOption.click();
			await page.waitForTimeout(500);
			log('Selected Create Zoom meeting for location.');
			return true;
		}
	}

	if (entry.locationLabel.trim()) {
		const textarea = page.locator('textarea[placeholder*="location" i], textarea[placeholder*="virtual link" i]').first();
		if ((await textarea.count()) > 0) {
			await textarea.fill(entry.locationLabel);
			log('Filled location text.');
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
		await page.waitForTimeout(400);
		const floatingMenu = page.locator('[data-floating-ui-portal]').last();
		const menuOptions = [
			{
				locator: floatingMenu.getByText(/^Private$/, { exact: true }).first(),
				label: 'Private'
			},
			{
				locator: floatingMenu.getByText(/Unlisted/, { exact: false }).first(),
				label: 'Unlisted'
			},
			{
				locator: page.locator('[data-floating-ui-portal] .title').filter({ hasText: /^Private$/ }).first(),
				label: 'Private'
			},
			{
				locator: page.locator('[data-floating-ui-portal] .title').filter({ hasText: /^Unlisted$/ }).first(),
				label: 'Unlisted'
			},
			{
				locator: page.locator('[data-floating-ui-portal] .desc').filter({
					hasText: 'Only people with the link can register.'
				}).first(),
				label: 'Unlisted'
			}
		];
		for (const option of menuOptions) {
			if ((await option.locator.count()) === 0) continue;
			await option.locator.click({ force: true }).catch(() => null);
			log(`Selected visibility option ${option.label} from menu.`);
			return;
		}

		await page.keyboard.press('ArrowDown').catch(() => null);
		await page.keyboard.press('Enter').catch(() => null);
		log('Selected visibility option with keyboard fallback.');
		return;
	}

	throw new Error('Unable to select a private or unlisted visibility option in the Luma UI.');
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
		{ startAtUtc: entry.firstSessionStartAtUtc ?? '', endAtUtc: entry.firstSessionEndAtUtc ?? '' },
		{ startAtUtc: entry.lastSessionStartAtUtc ?? '', endAtUtc: entry.lastSessionEndAtUtc ?? '' }
	]).filter((session) => Number.isFinite(session.startTimestamp));
	const firstSessionRecord = firstSession[0];
	const lastSessionRecord = firstSession.at(-1);

	if (!firstSessionRecord || !lastSessionRecord) {
		throw new Error('The event must have a valid first session to create a private Luma event.');
	}

	const browser = await chromium.launch({ headless: config.headless });
	try {
		const context = await browser.newContext({
			storageState: config.storageStatePath,
			locale: 'en-US',
			timezoneId: entry.timeZoneIana?.trim() || 'America/Los_Angeles'
		});
		const page = await context.newPage();
		await openLumaCreatePage(page, config.createUrl, log);
		await page.screenshot({ path: path.join(artifactDir, '01-create-page.png'), fullPage: true });

		const titleFilled = await fillFirstAvailable(page, [
			'textarea[placeholder="Event Name"]',
			'input[name="title"]',
			'input[placeholder*="title" i]'
		], entry.nameCopy);
		if (!titleFilled) throw new Error('Unable to find the event title field in the Luma create form.');
		log('Filled event title.');

		await chooseMostPrivateVisibility(page, log);

		if (!(await fillDescriptionModal(page, entry.descriptionCopy, log))) {
			log('Skipped description because no compatible description editor was found.');
		}

		await setTimezoneIfPossible(page, entry.timeZoneIana, log);

		const eventTimeZone = entry.timeZoneIana?.trim() || 'America/Los_Angeles';
		const startDatePicked = await pickLumaDate(page, 0, firstSessionRecord.startTimestamp, eventTimeZone);
		const startTimeSet = await setLumaTime(page, 0, firstSessionRecord.startTimestamp, eventTimeZone);
		const endDatePicked = await pickLumaDate(page, 1, lastSessionRecord.startTimestamp, eventTimeZone);
		const endTimeSet = await setLumaTime(page, 1, lastSessionRecord.endTimestamp, eventTimeZone);
		const startDateValue = (await page.locator('input[type="text"].dt-input').nth(0).inputValue().catch(() => '')).trim();
		const endDateValue = (await page.locator('input[type="text"].dt-input').nth(1).inputValue().catch(() => '')).trim();
		if (
			!startDatePicked ||
			!startTimeSet ||
			!endDatePicked ||
			!endTimeSet ||
			!startDateValue.includes(formatLumaDateNeedle(firstSessionRecord.startTimestamp, eventTimeZone)) ||
			!endDateValue.includes(formatLumaDateNeedle(lastSessionRecord.startTimestamp, eventTimeZone))
		) {
			throw new Error(
				`Unable to set the Luma event schedule correctly. Start="${startDateValue}" End="${endDateValue}".`
			);
		}
		log('Filled first session timing.');

		if (entry.locationLabel.trim() || entry.locationMode === 'online') {
			if (!(await setLocation(page, entry, log))) {
				log('Skipped location because no compatible location editor was found.');
			}
		}

		if (entry.priceCopy.trim()) {
			const filledPrice = await fillFirstAvailable(
				page,
				['input[name*="price" i]', 'input[placeholder*="price" i]', 'input[inputmode="decimal"]'],
				entry.priceCopy
			);
			if (filledPrice) {
				log('Filled price.');
			} else {
				log('Skipped price because no compatible price input was found.');
			}
		}

		const imageUpload = await uploadImageIfPossible(page, imagePath);
		if (imageUpload.attempted) {
			const methodLabel =
				imageUpload.method === 'direct_input'
					? 'direct file input'
					: imageUpload.method === 'file_chooser'
						? 'native file chooser'
						: 'unknown method';
			log(
				`Attempted image upload from ${imagePath} using ${methodLabel}${
					imageUpload.triggerDescription ? ` (${imageUpload.triggerDescription})` : ''
				}.`
			);
			if (imageUpload.confirmed) {
				log(
					`Confirmed image upload via ${imageUpload.confirmationReason ?? 'an available UI signal'}.`
				);
			} else {
				log(
					imageUpload.warning ??
						'Image upload was attempted, but no confirmation signal appeared in the Luma UI.'
				);
			}
			await page.screenshot({ path: path.join(artifactDir, '02-image-upload-attempt.png'), fullPage: true });
		} else {
			log(
				imageUpload.warning ??
					'Skipped image upload because no compatible Luma upload control was found.'
			);
		}

		await page.screenshot({ path: path.join(artifactDir, '03-filled-private.png'), fullPage: true });

		let submitted =
			(await clickButtonByName(page, [/create event/i, /continue/i, /save/i, /next/i])) ||
			(await clickFirstAvailable(page, ['button[type="submit"]']));
		if (submitted) {
			log('Submitted private event creation form.');
			await page.waitForLoadState('domcontentloaded').catch(() => null);
			await page.waitForTimeout(2500);
		} else if (await openCreatedEventFromEventsList(page, entry, log)) {
			submitted = true;
		} else {
			throw new Error('Unable to find the final create/save button in the Luma create form.');
		}

		await page.screenshot({ path: path.join(artifactDir, '04-after-submit.png'), fullPage: true });

		const privateManageUrl = page.url();
		if (!/https?:\/\/(?:www\.)?(?:lu\.ma|luma\.com)\//i.test(privateManageUrl)) {
			throw new Error('Luma did not navigate to a recognizable event management URL after create.');
		}

		const publicUrl = await capturePublicLumaUrlFromManagePage(page, {
			log,
			screenshotPath: path.join(artifactDir, '05-share-section.png')
		});
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

export const refreshExistingLumaPublicUrl = async (input: {
	entry: AdminEventLumaEntry;
	privateManageUrl: string;
}): Promise<LumaRefreshPublicUrlResult> => {
	if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('/ms-playwright')) {
		process.env.PLAYWRIGHT_BROWSERS_PATH = '/ms-playwright';
	}

	const config = getLumaRuntimeConfig();
	if (!config.storageStateExists) {
		throw new Error(
			`Missing Luma storage state at ${config.storageStatePath}. Sign in with Playwright and save storage state before refreshing the public Luma URL.`
		);
	}
	if (!/https?:\/\/(?:www\.)?(?:lu\.ma|luma\.com)\//i.test(input.privateManageUrl)) {
		throw new Error('Private manage URL must be a valid Luma or Lu.ma URL.');
	}

	const artifactId = `${input.entry.id}-refresh-${new Date().toISOString().replace(/[:.]/g, '-')}`;
	const artifactDir = path.join(lumaArtifactsRoot, artifactId);
	await fs.mkdir(artifactDir, { recursive: true });

	const logs: string[] = [];
	const log = (message: string) => logs.push(`[${new Date().toISOString()}] ${message}`);
	const startedAt = new Date().toISOString();
	const browser = await chromium.launch({ headless: config.headless });

	try {
		const context = await browser.newContext({
			storageState: config.storageStatePath,
			locale: 'en-US',
			timezoneId: input.entry.timeZoneIana?.trim() || 'America/Los_Angeles'
		});
		const page = await context.newPage();
		await page.goto(input.privateManageUrl, { waitUntil: 'domcontentloaded' });
		await page.screenshot({ path: path.join(artifactDir, '01-manage-page.png'), fullPage: true });
		log(`Opened existing private manage page ${input.privateManageUrl}.`);

		const publicUrl = await capturePublicLumaUrlFromManagePage(page, {
			log,
			screenshotPath: path.join(artifactDir, '02-share-section.png')
		});
		const finishedAt = new Date().toISOString();
		await fs.writeFile(path.join(artifactDir, 'run-log.txt'), `${logs.join('\n')}\n`, 'utf-8');

		return {
			eventId: input.entry.id,
			status: 'success',
			privateManageUrl: input.privateManageUrl,
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
