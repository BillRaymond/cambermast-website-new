import { expect, test } from '@playwright/test';

import { extractPublicLumaUrlFromPage } from '../src/lib/server/luma-share-url';

test.describe('Luma Share URL extraction', () => {
	test('prefers the Event Page link when present', async ({ page }) => {
		await page.setContent(`
			<main>
				<a href="https://luma.com/abc123" aria-label="Event Page">Event Page</a>
				<div>
					<a href="https://lu.ma/ignoreme">https://lu.ma/ignoreme</a>
					<button type="button">COPY</button>
				</div>
			</main>
		`);

		await expect(extractPublicLumaUrlFromPage(page)).resolves.toBe('https://luma.com/abc123');
	});

	test('falls back to the anchor near the COPY button', async ({ page }) => {
		await page.setContent(`
			<section>
				<div class="share-panel">
					<div class="url-row">
						<a href="https://lu.ma/daytime-may-2026">https://lu.ma/daytime-may-2026</a>
						<button type="button">COPY</button>
					</div>
				</div>
			</section>
		`);

		await expect(extractPublicLumaUrlFromPage(page)).resolves.toBe('https://lu.ma/daytime-may-2026');
	});

	test('supports nested anchor lookup up the COPY button ancestry', async ({ page }) => {
		await page.setContent(`
			<section>
				<div class="share-panel">
					<div class="outer">
						<a href="https://luma.com/events/daytime-cohort">Open event</a>
						<div class="controls">
							<div class="button-wrap">
								<button type="button">COPY</button>
							</div>
						</div>
					</div>
				</div>
			</section>
		`);

		await expect(extractPublicLumaUrlFromPage(page)).resolves.toBe(
			'https://luma.com/events/daytime-cohort'
		);
	});

	test('throws a clear error when COPY is present but no public URL anchor is nearby', async ({
		page
	}) => {
		await page.setContent(`
			<section>
				<div class="share-panel">
					<div class="url-row">
						<a href="https://luma.com/event/manage/evt-secret">Manage</a>
						<button type="button">COPY</button>
					</div>
				</div>
			</section>
		`);

		await expect(extractPublicLumaUrlFromPage(page)).rejects.toThrow(
			'no usable public event URL was found near the COPY button'
		);
	});
});
