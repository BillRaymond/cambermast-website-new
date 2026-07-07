const DEFAULT_ERROR_MESSAGE = 'Something went wrong.';
export const DEFAULT_WEBHOOK_TIMEOUT_MS = 15000;

type TimedJsonPostOptions = Omit<RequestInit, 'body' | 'method' | 'signal'> & {
	timeoutMs?: number;
};

const UNSAFE_WEBHOOK_CHARACTER_DEFINITIONS = [
	{
		id: 'double-quote',
		label: 'straight double quotes (")',
		pattern: /"/
	},
	{
		id: 'backslash',
		label: 'backslashes (\\)',
		pattern: /\\/
	},
	{
		id: 'line-break',
		label: 'line breaks',
		pattern: /\r|\n/
	}
] as const;

export type UnsafeWebhookCharacter = (typeof UNSAFE_WEBHOOK_CHARACTER_DEFINITIONS)[number];

export type UnsafeWebhookField = {
	key: string;
	label: string;
	value: unknown;
};

export type UnsafeWebhookFieldError = {
	key: string;
	label: string;
	characters: UnsafeWebhookCharacter[];
};

const formatList = (items: string[]): string => {
	if (items.length === 0) return '';
	if (items.length === 1) return items[0];
	if (items.length === 2) return `${items[0]} and ${items[1]}`;
	return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

export const getUnsafeWebhookCharacters = (value: unknown): UnsafeWebhookCharacter[] => {
	if (typeof value !== 'string' || !value) return [];
	return UNSAFE_WEBHOOK_CHARACTER_DEFINITIONS.filter((definition) =>
		definition.pattern.test(value)
	);
};

export const formatUnsafeWebhookCharacterList = (characters: UnsafeWebhookCharacter[]): string =>
	formatList(characters.map((character) => character.label));

export const getUnsafeWebhookFieldErrors = (
	fields: UnsafeWebhookField[]
): UnsafeWebhookFieldError[] =>
	fields
		.map((field) => ({
			key: field.key,
			label: field.label,
			characters: getUnsafeWebhookCharacters(field.value)
		}))
		.filter((field): field is UnsafeWebhookFieldError => field.characters.length > 0);

export const getUnsafeWebhookSubmissionMessage = (errors: UnsafeWebhookFieldError[]): string => {
	if (!errors.length) return '';
	const characters = new Map<string, UnsafeWebhookCharacter>();
	for (const error of errors) {
		for (const character of error.characters) {
			characters.set(character.id, character);
		}
	}
	const characterList = formatUnsafeWebhookCharacterList([...characters.values()]);
	const fieldList = formatList(errors.map((error) => error.label));
	return `Please remove ${characterList} from ${fieldList} before submitting. This temporary form cannot safely send those characters yet.`;
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
