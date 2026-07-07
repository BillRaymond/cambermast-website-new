import { expect, test, type Page } from '@playwright/test';

const turnstileMock = `
window.turnstile = {
	render: (_container, options) => {
		setTimeout(() => options && options.callback && options.callback('test-token'), 0);
		return 'test-widget';
	},
	reset: () => {},
	remove: () => {}
};
if (window.onTurnstileLoad) window.onTurnstileLoad();
`;

const routeTurnstileMock = async (page: Page) => {
	await page.route('https://challenges.cloudflare.com/**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/javascript',
			body: turnstileMock
		});
	});
};

const formCases = [
	{
		name: 'contact form',
		route: '/contact',
		fieldLabel: /Your message/i,
		unsafeValue: 'Please quote "exactly"',
		safeValue: 'Please quote exactly',
		expectedCharacter: /straight double quotes/i,
		buttonName: /Send message/i
	},
	{
		name: 'pre-training survey',
		route: '/forms/pre-training-survey',
		fieldLabel: /Which AI tools or AI-powered features/i,
		unsafeValue: 'First line\nSecond line',
		safeValue: 'I use ChatGPT for summaries.',
		expectedCharacter: /line breaks/i,
		buttonName: /Submit survey/i
	},
	{
		name: 'post-training survey',
		route: '/forms/post-training-survey',
		fieldLabel: /What was your top takeaway/i,
		unsafeValue: 'Great \\ practical examples',
		safeValue: 'Great practical examples',
		expectedCharacter: /backslashes/i,
		buttonName: /Submit survey/i
	},
	{
		name: 'testimonial form',
		route: '/forms/testimonials',
		fieldLabel: /What made this training valuable/i,
		unsafeValue: 'It gave our team a "real" workflow',
		safeValue: 'It gave our team a real workflow',
		expectedCharacter: /straight double quotes/i,
		buttonName: /Share my story/i
	}
];

test.describe('temporary n8n form character guard', () => {
	for (const formCase of formCases) {
		test(`${formCase.name} warns and prevents submission for unsafe webhook characters`, async ({
			page
		}) => {
			await routeTurnstileMock(page);
			await page.goto(formCase.route);

			const field = page.getByLabel(formCase.fieldLabel);
			const submitButton = page.getByRole('button', { name: formCase.buttonName });

			await field.fill(formCase.unsafeValue);

			await expect(page.getByText(formCase.expectedCharacter).first()).toBeVisible();
			await expect(
				page.getByText(/This temporary form cannot safely send those characters yet/i).first()
			).toBeVisible();
			await expect(submitButton).toBeDisabled();

			await field.fill(formCase.safeValue);

			await expect(
				page.getByText(/This temporary form cannot safely send those characters yet/i)
			).toHaveCount(0);
			await expect(submitButton).toBeEnabled();
		});
	}
});
