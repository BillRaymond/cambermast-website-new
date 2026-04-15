import type { Page } from '@playwright/test';

const isRecognizedLumaUrl = (value: string | null | undefined): value is string => {
	if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) return false;
	try {
		const hostname = new URL(value.trim()).hostname.trim().toLowerCase();
		return (
			hostname === 'luma.com' ||
			hostname === 'www.luma.com' ||
			hostname === 'lu.ma' ||
			hostname === 'www.lu.ma'
		);
	} catch {
		return false;
	}
};

const isPublicLumaEventUrl = (value: string | null | undefined): value is string => {
	if (!isRecognizedLumaUrl(value)) return false;
	try {
		const parsed = new URL(value);
		const normalizedPath = parsed.pathname.replace(/\/+$/, '').toLowerCase();
		return (
			normalizedPath.length > 1 &&
			!normalizedPath.startsWith('/event/manage') &&
			!normalizedPath.startsWith('/calendar/manage') &&
			normalizedPath !== '/create'
		);
	} catch {
		return false;
	}
};

const normalizePublicLumaUrl = (value: string | null | undefined): string | undefined => {
	if (!isPublicLumaEventUrl(value)) return undefined;
	try {
		const parsed = new URL(value.trim());
		parsed.hash = '';
		return parsed.toString();
	} catch {
		return undefined;
	}
};

const waitForShareUrlSurface = async (page: Page): Promise<'event_page_link' | 'copy_button' | null> => {
	const eventPageLink = page.getByRole('link', { name: /event page/i }).first();
	const copyButton = page.getByRole('button', { name: /^copy$/i }).first();
	const deadline = Date.now() + 12000;

	while (Date.now() < deadline) {
		if ((await eventPageLink.count()) > 0 && (await eventPageLink.isVisible().catch(() => false))) {
			return 'event_page_link';
		}
		if ((await copyButton.count()) > 0 && (await copyButton.isVisible().catch(() => false))) {
			return 'copy_button';
		}
		await page.waitForTimeout(250);
	}

	return null;
};

const openShareSectionIfPossible = async (page: Page, log?: (message: string) => void): Promise<void> => {
	const shareControls = [
		page.getByRole('tab', { name: /^share$/i }).first(),
		page.getByRole('button', { name: /^share$/i }).first(),
		page.getByText(/^Share$/, { exact: true }).first()
	];

	for (const control of shareControls) {
		if ((await control.count()) === 0) continue;
		if (!(await control.isVisible().catch(() => false))) continue;
		await control.click({ force: true }).catch(() => null);
		await page.waitForTimeout(500);
		log?.('Opened the Share section.');
		return;
	}
};

export const extractPublicLumaUrlFromPage = async (page: Page): Promise<string> => {
	const eventPageLink = page.getByRole('link', { name: /event page/i }).first();
	if ((await eventPageLink.count()) > 0) {
		const href = normalizePublicLumaUrl(await eventPageLink.getAttribute('href'));
		if (href) return href;
	}

	const copyButton = page.getByRole('button', { name: /^copy$/i }).first();
	if ((await copyButton.count()) > 0) {
		const href = normalizePublicLumaUrl(
			await copyButton.evaluate((button) => {
				let current: HTMLElement | null = button.parentElement;
				for (let depth = 0; current && depth < 6; depth += 1, current = current.parentElement) {
					const anchors = Array.from(current.querySelectorAll<HTMLAnchorElement>('a[href]'));
					for (const anchor of anchors) {
						try {
							const parsed = new URL(anchor.href, window.location.href);
							const hostname = parsed.hostname.trim().toLowerCase();
							const pathname = parsed.pathname.replace(/\/+$/, '').toLowerCase();
							const isLumaHost =
								hostname === 'luma.com' ||
								hostname === 'www.luma.com' ||
								hostname === 'lu.ma' ||
								hostname === 'www.lu.ma';
							if (
								isLumaHost &&
								pathname.length > 1 &&
								!pathname.startsWith('/event/manage') &&
								!pathname.startsWith('/calendar/manage') &&
								pathname !== '/create'
							) {
								return anchor.href;
							}
						} catch {
							// Ignore malformed or unrelated anchors while scanning the local Share container.
						}
					}
				}
				return null;
			})
		);
		if (href) return href;
		throw new Error('Luma Share UI was visible, but no usable public event URL was found near the COPY button.');
	}

	throw new Error('Unable to find the Luma Share URL area. Expected an Event Page link or COPY button.');
};

export const capturePublicLumaUrlFromManagePage = async (
	page: Page,
	options: { log?: (message: string) => void; screenshotPath?: string } = {}
): Promise<string> => {
	await page.waitForLoadState('domcontentloaded').catch(() => null);
	await openShareSectionIfPossible(page, options.log);
	const surface = await waitForShareUrlSurface(page);
	if (!surface) {
		throw new Error('Unable to find the Luma Share section on the manage page.');
	}

	const publicUrl = await extractPublicLumaUrlFromPage(page);
	options.log?.(`Captured public event URL from Share UI (${surface}).`);
	if (options.screenshotPath) {
		await page.screenshot({ path: options.screenshotPath, fullPage: true });
	}
	return publicUrl;
};
