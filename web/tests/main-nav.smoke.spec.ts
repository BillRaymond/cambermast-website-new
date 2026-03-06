import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const navChecks: Array<{ label: string; expectedPath: string }> = [
	{ label: 'AI Training', expectedPath: '/training' },
	{ label: 'Resources', expectedPath: '/resources' },
	{ label: 'Connect', expectedPath: '/connect' },
	{ label: 'About', expectedPath: '/about' }
];

async function openMobileNavIfNeeded(page: Page) {
	const toggle = page.getByRole('button', { name: /toggle navigation/i });
	if (await toggle.isVisible()) {
		await toggle.click();
	}
}

test.describe('Main nav smoke', () => {
	for (const navCheck of navChecks) {
		test(`navigates via \"${navCheck.label}\"`, async ({ page }) => {
			await page.goto('/');
			await openMobileNavIfNeeded(page);

			await page.getByRole('link', { name: navCheck.label, exact: true }).click();
			await expect(page).toHaveURL(new RegExp(`${navCheck.expectedPath}/?$`));
		});
	}
});
