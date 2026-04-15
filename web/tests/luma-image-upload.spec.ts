import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

import { uploadImageIfPossible } from '../src/lib/server/luma-image-upload';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const imagePath = path.resolve(
	testDir,
	'../static/images/featured-images/cambermast-default/hero-square.jpg'
);

test.describe('Luma image upload helper', () => {
	test('succeeds with a direct file input', async ({ page }) => {
		await page.setContent(`
			<form>
				<label>
					Upload image
					<input id="direct-upload" type="file" accept="image/*" />
				</label>
				<img id="preview" hidden alt="Cover preview" />
			</form>
			<script>
				const input = document.getElementById('direct-upload');
				const preview = document.getElementById('preview');
				input.addEventListener('change', () => {
					if (!input.files || input.files.length === 0) return;
					preview.src = URL.createObjectURL(input.files[0]);
					preview.hidden = false;
				});
			</script>
		`);

		const result = await uploadImageIfPossible(page, imagePath);

		expect(result).toMatchObject({
			attempted: true,
			uploaded: true,
			confirmed: true,
			method: 'direct_input',
			triggerDescription: 'input[type="file"]',
			confirmationReason: 'preview_image'
		});
		await expect(page.locator('#preview')).toBeVisible();
	});

	test('uses the native file chooser path when only a button trigger is available', async ({
		page
	}) => {
		await page.setContent(`
			<form>
				<button id="upload-trigger" type="button" aria-label="Add Photo">Add Photo</button>
				<input id="chooser-input" type="file" accept="image/*" hidden />
				<img id="preview" hidden alt="Cover preview" />
			</form>
			<script>
				const button = document.getElementById('upload-trigger');
				const input = document.getElementById('chooser-input');
				const preview = document.getElementById('preview');
				button.addEventListener('click', () => input.click());
				input.addEventListener('change', () => {
					if (!input.files || input.files.length === 0) return;
					preview.src = URL.createObjectURL(input.files[0]);
					preview.hidden = false;
				});
			</script>
		`);

		const result = await uploadImageIfPossible(page, imagePath);

		expect(result).toMatchObject({
			attempted: true,
			uploaded: true,
			confirmed: true,
			method: 'file_chooser',
			triggerDescription: 'button[name=/add photo|upload image|change photo|cover image|event image/i]',
			confirmationReason: 'preview_image'
		});
		await expect(page.locator('#preview')).toBeVisible();
	});

	test('prefers an accessible upload button name before fallback selectors', async ({ page }) => {
		await page.setContent(`
			<form>
				<button id="accessible-trigger" type="button" aria-label="Add Photo">Add Photo</button>
				<button id="fallback-trigger" type="button"><span>Fallback image tile</span></button>
				<input id="chooser-input" type="file" accept="image/*" hidden />
			</form>
			<script>
				const accessibleTrigger = document.getElementById('accessible-trigger');
				const fallbackTrigger = document.getElementById('fallback-trigger');
				const input = document.getElementById('chooser-input');
				let lastTrigger = '';
				accessibleTrigger.addEventListener('click', () => {
					lastTrigger = 'accessible';
					input.click();
				});
				fallbackTrigger.addEventListener('click', () => {
					lastTrigger = 'fallback';
					input.click();
				});
				input.addEventListener('change', () => {
					accessibleTrigger.textContent = 'Change photo (' + lastTrigger + ')';
					accessibleTrigger.setAttribute('aria-label', 'Change photo (' + lastTrigger + ')');
					fallbackTrigger.setAttribute('data-last-trigger', lastTrigger);
				});
			</script>
		`);

		const result = await uploadImageIfPossible(page, imagePath);

		expect(result).toMatchObject({
			attempted: true,
			uploaded: true,
			confirmed: true,
			method: 'file_chooser',
			triggerDescription: 'button[name=/add photo|upload image|change photo|cover image|event image/i]',
			confirmationReason: 'change_photo_state'
		});
		await expect(page.locator('#accessible-trigger')).toHaveText(/Change photo \(accessible\)/);
		await expect(page.locator('#fallback-trigger')).toHaveAttribute('data-last-trigger', 'accessible');
	});

	test('returns an unattempted result when no upload control exists', async ({ page }) => {
		await page.setContent('<form><p>No image upload here.</p></form>');

		const result = await uploadImageIfPossible(page, imagePath);

		expect(result).toMatchObject({
			attempted: false,
			uploaded: false,
			confirmed: false
		});
		expect(result.warning).toContain('No compatible Luma image upload control');
	});

	test('returns an unconfirmed result when a chooser opens but no confirmation signal appears', async ({
		page
	}) => {
		await page.setContent(`
			<form>
				<button id="upload-trigger" type="button" aria-label="Add Photo">Add Photo</button>
				<input id="chooser-input" type="file" accept="image/*" hidden />
			</form>
			<script>
				const button = document.getElementById('upload-trigger');
				const input = document.getElementById('chooser-input');
				button.addEventListener('click', () => input.click());
				input.addEventListener('change', () => {
					input.remove();
				});
			</script>
		`);

		const result = await uploadImageIfPossible(page, imagePath);

		expect(result).toMatchObject({
			attempted: true,
			uploaded: true,
			confirmed: false,
			method: 'file_chooser',
			triggerDescription: 'button[name=/add photo|upload image|change photo|cover image|event image/i]'
		});
		expect(result.warning).toContain('no confirmation signal appeared');
	});
});
