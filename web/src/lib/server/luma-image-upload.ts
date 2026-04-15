import { existsSync } from 'node:fs';
import type { Locator, Page } from '@playwright/test';

export type LumaImageUploadResult = {
	attempted: boolean;
	uploaded: boolean;
	confirmed: boolean;
	method?: 'direct_input' | 'file_chooser';
	triggerDescription?: string;
	confirmationReason?: 'preview_image' | 'change_photo_state' | 'input_has_file';
	warning?: string;
};

const lumaImageButtonNamePattern = /add photo|upload image|change photo|cover image|event image/i;

const confirmLumaImageUpload = async (
	page: Page
): Promise<LumaImageUploadResult['confirmationReason'] | undefined> => {
	await page.waitForLoadState('networkidle').catch(() => null);
	await page.waitForTimeout(800);

	const previewImageSelectors = [
		'form img[src^="blob:"]',
		'form img[src^="data:image/"]',
		'form img[src*="upload"]',
		'form img[src*="cover"]',
		'form img[src*="image"]',
		'form [class*="cover" i] img',
		'form [class*="image" i] img',
		'form [class*="photo" i] img'
	];
	for (const selector of previewImageSelectors) {
		const locator = page.locator(selector).first();
		if ((await locator.count()) === 0) continue;
		if (await locator.isVisible().catch(() => false)) return 'preview_image';
	}

	const changePhotoControl = page.getByRole('button', { name: /change photo|replace photo|edit photo/i }).first();
	if ((await changePhotoControl.count()) > 0 && (await changePhotoControl.isVisible().catch(() => false))) {
		return 'change_photo_state';
	}

	const selectedInput = page.locator('input[type="file"], input[accept*="image"]').first();
	if ((await selectedInput.count()) > 0) {
		const hasValue = await selectedInput
			.evaluate((node) => {
				if (!(node instanceof HTMLInputElement)) return false;
				return (node.files?.length ?? 0) > 0 || node.value.trim().length > 0;
			})
			.catch(() => false);
		if (hasValue) return 'input_has_file';
	}

	return undefined;
};

const clickFirstVisibleLocator = async (
	locators: Array<{ locator: Locator; description: string }>
): Promise<{ locator: Locator; description: string } | null> => {
	for (const candidate of locators) {
		if ((await candidate.locator.count()) === 0) continue;
		await candidate.locator.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
		if (await candidate.locator.isVisible().catch(() => false)) return candidate;
	}
	return null;
};

export const uploadImageIfPossible = async (
	page: Page,
	imagePath: string | undefined
): Promise<LumaImageUploadResult> => {
	if (!imagePath || !existsSync(imagePath)) {
		return {
			attempted: false,
			uploaded: false,
			confirmed: false,
			warning: 'No local image file was available for upload.'
		};
	}

	for (const selector of ['input[type="file"]', 'input[accept*="image"]']) {
		const locator = page.locator(selector).first();
		if ((await locator.count()) === 0) continue;
		if (!(await locator.isVisible().catch(() => false))) continue;

		await locator.setInputFiles(imagePath);
		const confirmationReason = await confirmLumaImageUpload(page);
		return {
			attempted: true,
			uploaded: true,
			confirmed: Boolean(confirmationReason),
			method: 'direct_input',
			triggerDescription: selector,
			confirmationReason,
			warning: confirmationReason
				? undefined
				: `Image upload via ${selector} was attempted but no confirmation signal appeared.`
		};
	}

	const uploadTriggers = [
		{
			locator: page.getByRole('button', { name: lumaImageButtonNamePattern }).first(),
			description: 'button[name=/add photo|upload image|change photo|cover image|event image/i]'
		},
		{
			locator: page
				.locator('form')
				.getByRole('button')
				.filter({
					has: page.locator('svg, img, [class*="image" i], [class*="photo" i], [class*="cover" i]')
				})
				.first(),
			description: 'form button with image/photo/cover affordance'
		},
		{
			locator: page
				.locator('form [class*="cover" i], form [class*="image" i], form [class*="photo" i]')
				.first(),
			description: 'top form image/photo/cover container'
		}
	];

	const trigger = await clickFirstVisibleLocator(uploadTriggers);
	if (!trigger) {
		return {
			attempted: false,
			uploaded: false,
			confirmed: false,
			warning: 'No compatible Luma image upload control was found.'
		};
	}

	const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
	await trigger.locator.click({ force: true }).catch(() => null);
	const fileChooser = await fileChooserPromise;
	if (!fileChooser) {
		return {
			attempted: true,
			uploaded: false,
			confirmed: false,
			method: 'file_chooser',
			triggerDescription: trigger.description,
			warning: `Clicked ${trigger.description}, but no native file chooser opened.`
		};
	}

	await fileChooser.setFiles(imagePath);
	const confirmationReason = await confirmLumaImageUpload(page);
	return {
		attempted: true,
		uploaded: true,
		confirmed: Boolean(confirmationReason),
		method: 'file_chooser',
		triggerDescription: trigger.description,
		confirmationReason,
		warning: confirmationReason
			? undefined
			: `Image upload via ${trigger.description} was attempted but no confirmation signal appeared.`
	};
};
