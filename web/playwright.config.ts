import { existsSync } from 'node:fs';

import { defineConfig, devices } from '@playwright/test';

if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('/ms-playwright')) {
	process.env.PLAYWRIGHT_BROWSERS_PATH = '/ms-playwright';
}

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'list',
	use: {
		baseURL: 'http://127.0.0.1:5173',
		trace: 'on-first-retry'
	},
	webServer: {
		command: 'npm run dev:host',
		url: 'http://127.0.0.1:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 120000
	},
	projects: [
		{
			name: 'chromium-desktop',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'webkit-mobile',
			use: { ...devices['iPhone 13'] }
		}
	]
});
