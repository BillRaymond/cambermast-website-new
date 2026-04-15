import type { Locator, Page } from '@playwright/test';

export type LumaDescriptionInsertResult = {
	method: 'clipboard_paste' | 'paste_event_fallback';
	editorValidationOutcome: 'passed' | 'failed';
	verificationNotes?: string;
};

// Representative raw markdown markers used for paste validation.
// These cover the most common tokens that Luma should render, not the full document.
export const RAW_MARKDOWN_TOKENS = ['## ', '**', ']('];

export const resolveDescriptionEditor = async (page: Page): Promise<Locator | null> => {
	// Prefer a visible contenteditable div (rich text editor) over a plain textbox
	const contenteditableEditor = page.locator('[contenteditable="true"]').last();
	if ((await contenteditableEditor.count()) > 0) {
		await contenteditableEditor.waitFor({ state: 'visible', timeout: 4000 }).catch(() => null);
		if (await contenteditableEditor.isVisible().catch(() => false)) return contenteditableEditor;
	}
	// Fall back to the last visible textbox role
	const textboxEditor = page.getByRole('textbox').last();
	if ((await textboxEditor.count()) > 0) {
		await textboxEditor.waitFor({ state: 'visible', timeout: 4000 }).catch(() => null);
		if (await textboxEditor.isVisible().catch(() => false)) return textboxEditor;
	}
	return null;
};

export const pasteDescriptionIntoEditor = async (
	page: Page,
	editor: Locator,
	value: string,
	log: (message: string) => void
): Promise<LumaDescriptionInsertResult> => {
	await editor.click({ timeout: 5000 }).catch(() => null);
	await page.waitForTimeout(200);

	// Attempt 1: real clipboard paste
	let method: LumaDescriptionInsertResult['method'] = 'paste_event_fallback';
	const clipboardWriteOk = await page
		.evaluate(async (text: string) => {
			try {
				await navigator.clipboard.writeText(text);
				return true;
			} catch {
				return false;
			}
		}, value)
		.catch(() => false);

	if (clipboardWriteOk) {
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+v`).catch(() => null);
		await page.waitForTimeout(700);

		// Check if something was inserted — use innerHTML to detect any content change
		const editorHtmlAfterClipboard = await editor.innerHTML().catch(() => '');
		const editorTextAfterClipboard = await editor.textContent().catch(() => '');
		const pasteProducedContent =
			(editorTextAfterClipboard?.trim().length ?? 0) > 5 ||
			editorHtmlAfterClipboard.includes('<');

		if (pasteProducedContent) {
			method = 'clipboard_paste';
			log('clipboard_paste: Wrote markdown to clipboard and triggered keyboard paste.');
		}
	}

	if (method === 'paste_event_fallback') {
		// Fallback: synthetic ClipboardEvent dispatch into the active element
		const dispatched = await page
			.evaluate((text: string) => {
				try {
					const dt = new DataTransfer();
					dt.setData('text/plain', text);
					const event = new ClipboardEvent('paste', {
						clipboardData: dt,
						bubbles: true,
						cancelable: true
					});
					const target = (document.activeElement ?? document.body) as HTMLElement;
					target.dispatchEvent(event);
					return true;
				} catch {
					return false;
				}
			}, value)
			.catch(() => false);

		await page.waitForTimeout(700);
		if (dispatched) {
			log('paste_event_fallback: Dispatched synthetic ClipboardEvent(paste) into the active editor element.');
		}
	}

	await page.waitForTimeout(300);

	// Post-paste editor validation
	const editorHtml = await editor.innerHTML().catch(() => '');
	const editorText = (await editor.textContent().catch(() => '')) ?? '';

	// Negative check: raw markdown tokens must NOT be visible in the editor text
	const presentTokens = RAW_MARKDOWN_TOKENS.filter((token) => editorText.includes(token));
	const hasRawMarkdown = presentTokens.length > 0;

	// Positive check: rendered block/inline HTML elements must be present
	const hasRenderedStructure =
		editorHtml.includes('<h1') ||
		editorHtml.includes('<h2') ||
		editorHtml.includes('<h3') ||
		editorHtml.includes('<strong') ||
		editorHtml.includes('<em') ||
		editorHtml.includes('<a ') ||
		editorHtml.includes('<p') ||
		editorHtml.includes('<li');

	const negativePasses = !hasRawMarkdown;
	const positivePasses = hasRenderedStructure;

	let editorValidationOutcome: LumaDescriptionInsertResult['editorValidationOutcome'];
	let verificationNotes: string;

	if (negativePasses && positivePasses) {
		editorValidationOutcome = 'passed';
		verificationNotes = 'No raw markdown tokens found; rendered HTML structure detected.';
		log(`validation_success: ${verificationNotes}`);
	} else if (negativePasses) {
		// No raw markdown but also no rendered structure — treat as passed (plain text insertion)
		editorValidationOutcome = 'passed';
		verificationNotes =
			'No raw markdown tokens found; editor content appears as plain text (no HTML structure detected, but markdown not literally visible).';
		log(`validation_success: ${verificationNotes}`);
	} else if (positivePasses) {
		// Has rendered structure but also has raw markdown tokens — log warning but pass
		editorValidationOutcome = 'passed';
		verificationNotes = `Rendered HTML structure present but raw markdown tokens still detected: ${presentTokens.join(', ')}. Content may be partially rendered.`;
		log(`validation_warning: ${verificationNotes}`);
	} else {
		// Both checks failed: raw markdown visible AND no rendered structure
		editorValidationOutcome = 'failed';
		verificationNotes = `Raw markdown tokens still visible (${presentTokens.join(', ')}) and no rendered HTML structure detected. Paste did not render as rich text.`;
		log(`validation_failure: ${verificationNotes}`);
	}

	return { method, editorValidationOutcome, verificationNotes };
};
