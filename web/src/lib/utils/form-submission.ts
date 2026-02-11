const DEFAULT_ERROR_MESSAGE = 'Something went wrong.';
export const DEFAULT_WEBHOOK_TIMEOUT_MS = 15000;

type TimedJsonPostOptions = Omit<RequestInit, 'body' | 'method' | 'signal'> & {
	timeoutMs?: number;
};

export const postJsonWithTimeout = async (
	url: string,
	payload: unknown,
	options: TimedJsonPostOptions = {}
): Promise<Response> => {
	const { timeoutMs = DEFAULT_WEBHOOK_TIMEOUT_MS, headers, ...init } = options;
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetch(url, {
			...init,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...headers
			},
			body: JSON.stringify(payload),
			signal: controller.signal
		});
	} finally {
		clearTimeout(timeoutId);
	}
};

export const getWebhookSubmissionErrorMessage = (err: unknown, origin?: string): string => {
	if (!err || typeof err !== 'object') return DEFAULT_ERROR_MESSAGE;

	const record = err as { name?: unknown; message?: unknown };
	const name = typeof record.name === 'string' ? record.name : '';
	const message = typeof record.message === 'string' ? record.message : DEFAULT_ERROR_MESSAGE;

	if (name === 'AbortError') {
		return 'Request timed out while contacting the webhook. Please try again.';
	}

	if (message === 'Failed to fetch') {
		return origin
			? `Network error contacting the webhook. Please allow CORS for ${origin}.`
			: 'Network error contacting the webhook.';
	}

	return message || DEFAULT_ERROR_MESSAGE;
};
