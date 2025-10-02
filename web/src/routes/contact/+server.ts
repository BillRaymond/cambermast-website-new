import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WEBHOOK_URL = 'https://n8n.cambermast.com/webhook/0095b76c-c32c-49ce-a59d-de6435af2b3e';

export const POST: RequestHandler = async ({ request, fetch }) => {
	let payload: Record<string, unknown>;

	try {
		payload = await request.json();
	} catch (err) {
		throw error(400, 'Invalid JSON payload');
	}

	let response: Response;

	try {
		response = await fetch(WEBHOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	} catch (err) {
		throw error(502, 'Unable to reach the contact service');
	}

	if (!response.ok) {
		const body = await response.text().catch(() => '');
		throw error(response.status, body ? `Contact service responded with ${response.status}: ${body}` : `Contact service responded with ${response.status}`);
	}

	return json({ success: true });
};
