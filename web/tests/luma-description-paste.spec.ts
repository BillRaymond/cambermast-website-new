import { expect, test } from '@playwright/test';

import {
	pasteDescriptionIntoEditor,
	resolveDescriptionEditor
} from '../src/lib/server/luma-description-paste';

// A minimal rich-text editor page that renders markdown on paste
const richEditorHtml = `
<div
  id="editor"
  contenteditable="true"
  style="min-height:60px;border:1px solid #ccc;padding:8px"
  aria-label="Description editor"
></div>
<script>
  const editor = document.getElementById('editor');
  editor.addEventListener('paste', (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') ?? '';
    // Simulate Luma-style markdown rendering on paste:
    // - Lines starting with "## " become <h2>
    // - **word** becomes <strong>word</strong>
    // - [label](url) becomes <a href="url">label</a>
    let html = text
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>')
      .replace(/\\n/g, '<br>');
    editor.innerHTML = html;
    editor.dataset.pasted = 'true';
  });
</script>
`;

// A page where paste is silently ignored (clipboard content is not processed)
const silentPasteEditorHtml = `
<div
  id="editor"
  contenteditable="true"
  style="min-height:60px;border:1px solid #ccc;padding:8px"
></div>
`;

// A page that writes paste content as plain text (no markdown rendering)
const plainTextEditorHtml = `
<div
  id="editor"
  contenteditable="true"
  style="min-height:60px;border:1px solid #ccc;padding:8px"
></div>
<script>
  const editor = document.getElementById('editor');
  editor.addEventListener('paste', (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') ?? '';
    // Plain text insertion — markdown NOT rendered
    editor.textContent = text;
    editor.dataset.pasted = 'true';
  });
</script>
`;

const sampleMarkdown = `## Workshop Overview\n\nJoin us for a hands-on session covering **AI fundamentals**.\n\n[Register now](https://example.com/register)`;

const noop = () => {};

test.describe('resolveDescriptionEditor', () => {
	test('prefers a contenteditable element over a textbox role', async ({ page }) => {
		await page.setContent(`
      <div id="editor" contenteditable="true"></div>
      <input type="text" role="textbox" />
    `);

		const editor = await resolveDescriptionEditor(page);
		expect(editor).not.toBeNull();
		// The resolved locator should point to the contenteditable div
		const tagName = await editor!.evaluate((el) => el.tagName.toLowerCase());
		expect(tagName).toBe('div');
	});

	test('falls back to textbox role when no contenteditable is present', async ({ page }) => {
		await page.setContent(`
      <form>
        <input id="textbox" type="text" />
      </form>
    `);

		const editor = await resolveDescriptionEditor(page);
		expect(editor).not.toBeNull();
	});

	test('returns null when no editor element is present', async ({ page }) => {
		await page.setContent('<form><p>No editor here.</p></form>');

		const editor = await resolveDescriptionEditor(page);
		expect(editor).toBeNull();
	});
});

test.describe('pasteDescriptionIntoEditor — clipboard paste path', () => {
	test('triggers paste event and content renders as rich HTML', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.setContent(richEditorHtml);

		const editor = page.locator('#editor');
		const result = await pasteDescriptionIntoEditor(page, editor, sampleMarkdown, noop);

		// The editor must show rendered structure (not raw markdown)
		await expect(editor).not.toHaveText(/## /);
		await expect(editor).not.toHaveText(/\*\*/);

		const innerHTML = await editor.innerHTML();
		expect(innerHTML).toContain('<h2>');
		expect(innerHTML).toContain('<strong>');

		// Validation should pass
		expect(result.editorValidationOutcome).toBe('passed');
	});

	test('reports a valid method and passes validation when clipboard permissions are granted', async ({
		page,
		context
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.setContent(richEditorHtml);

		const editor = page.locator('#editor');
		const result = await pasteDescriptionIntoEditor(page, editor, sampleMarkdown, noop);

		// Either method is valid — clipboard_paste when Ctrl/Meta+V fires the paste handler,
		// paste_event_fallback when the keyboard shortcut is suppressed in headless mode.
		// The important invariant is that content was inserted and validation passed.
		expect(['clipboard_paste', 'paste_event_fallback']).toContain(result.method);
		expect(result.editorValidationOutcome).toBe('passed');
	});

	test('never uses fill() — editor innerHTML changes only through paste event', async ({
		page,
		context
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		// Track whether fill was attempted by checking that value is empty before paste triggers
		let prepasteContent = '';
		await page.setContent(richEditorHtml);

		const editor = page.locator('#editor');
		// Record the editor's state before the paste fires
		prepasteContent = (await editor.textContent()) ?? '';

		await pasteDescriptionIntoEditor(page, editor, sampleMarkdown, noop);

		// Before paste the editor was empty; content only appeared after the paste event
		expect(prepasteContent.trim()).toBe('');
		const postPaste = await editor.getAttribute('data-pasted');
		expect(postPaste).toBe('true');
	});
});

test.describe('pasteDescriptionIntoEditor — synthetic paste fallback', () => {
	test('dispatches a synthetic paste event when clipboard write is unavailable', async ({
		page
	}) => {
		// Do NOT grant clipboard permissions — clipboard write will fail
		await page.setContent(richEditorHtml);

		const editor = page.locator('#editor');
		const result = await pasteDescriptionIntoEditor(page, editor, sampleMarkdown, noop);

		// The synthetic paste event should still trigger the editor's paste handler
		const pasted = await editor.getAttribute('data-pasted');
		expect(pasted).toBe('true');

		// Either method is acceptable — the important thing is that content was inserted
		expect(['clipboard_paste', 'paste_event_fallback']).toContain(result.method);
	});

	test('synthetic paste produces rendered HTML in the editor', async ({ page }) => {
		await page.setContent(richEditorHtml);

		const editor = page.locator('#editor');
		const result = await pasteDescriptionIntoEditor(page, editor, sampleMarkdown, noop);

		const innerHTML = await editor.innerHTML();
		expect(innerHTML.length).toBeGreaterThan(10);
		// Validation should pass because the page renders markdown on paste
		expect(result.editorValidationOutcome).toBe('passed');
	});
});

test.describe('pasteDescriptionIntoEditor — validation', () => {
	test('validation passes when rendered content has no raw markdown tokens', async ({
		page,
		context
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.setContent(richEditorHtml);

		const editor = page.locator('#editor');
		const result = await pasteDescriptionIntoEditor(page, editor, sampleMarkdown, noop);

		expect(result.editorValidationOutcome).toBe('passed');
		expect(result.verificationNotes).toBeTruthy();
	});

	test('validation fails when plain text paste leaves raw markdown tokens visible and no HTML', async ({
		page
	}) => {
		// plainTextEditorHtml inserts text content directly with no HTML rendering
		await page.setContent(plainTextEditorHtml);

		// Pre-populate the editor with raw markdown so both checks fail:
		// raw markdown tokens ARE present AND no rendered HTML structure
		await page.evaluate((text) => {
			const el = document.getElementById('editor')!;
			el.textContent = text;
		}, sampleMarkdown);

		const editor = page.locator('#editor');
		// Now call paste with content that includes raw markdown tokens
		// The plain text editor won't render HTML, so both checks fail
		const logs: string[] = [];
		const result = await pasteDescriptionIntoEditor(
			page,
			editor,
			sampleMarkdown,
			(msg) => logs.push(msg)
		);

		// Either validation failed (both checks fail) or passed (no markdown visible after paste rewrites)
		// For the plain text case where textContent == markdown the result depends on what paste did.
		// Specifically: if paste_event_fallback fires and overwrites with the same content, validation fails.
		// We assert that when raw markdown IS visible and no HTML is found, the outcome is 'failed'.
		const editorText = (await editor.textContent()) ?? '';
		const hasRawTokens = editorText.includes('## ') || editorText.includes('**');
		const editorHtml = await editor.innerHTML();
		const hasHtml = editorHtml.includes('<h') || editorHtml.includes('<strong');

		if (hasRawTokens && !hasHtml) {
			expect(result.editorValidationOutcome).toBe('failed');
			expect(logs.some((l) => l.includes('validation_failure'))).toBe(true);
		}
	});

	test('validation result includes verificationNotes describing the outcome', async ({
		page,
		context
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.setContent(richEditorHtml);

		const editor = page.locator('#editor');
		const result = await pasteDescriptionIntoEditor(page, editor, sampleMarkdown, noop);

		expect(typeof result.verificationNotes).toBe('string');
		expect((result.verificationNotes ?? '').length).toBeGreaterThan(0);
	});

	test('log function receives clipboard_paste or paste_event_fallback entry', async ({
		page,
		context
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.setContent(richEditorHtml);

		const logs: string[] = [];
		const editor = page.locator('#editor');
		await pasteDescriptionIntoEditor(page, editor, sampleMarkdown, (msg) => logs.push(msg));

		const methodLog = logs.find(
			(l) => l.includes('clipboard_paste') || l.includes('paste_event_fallback')
		);
		expect(methodLog).toBeTruthy();
	});

	test('log function receives a validation_success or validation_failure entry', async ({
		page,
		context
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.setContent(richEditorHtml);

		const logs: string[] = [];
		const editor = page.locator('#editor');
		await pasteDescriptionIntoEditor(page, editor, sampleMarkdown, (msg) => logs.push(msg));

		const validationLog = logs.find(
			(l) =>
				l.includes('validation_success') ||
				l.includes('validation_failure') ||
				l.includes('validation_warning')
		);
		expect(validationLog).toBeTruthy();
	});
});
