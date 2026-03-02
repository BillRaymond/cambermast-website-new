import { env } from '$env/dynamic/private';

export type EventAiDraftRequest = {
	mode: 'training' | 'external';
	eventContext: {
		title?: string;
		subtitle?: string;
		type?: string;
		ctaUrl?: string;
		partnerCodes?: string[];
		programSku?: string;
	};
	questionnaire: {
		audience: string;
		primaryOutcome: string;
		formatAndDelivery: string;
		partnerContext: string;
		ctaGoal: string;
		tone: string;
		constraints: string;
		keyTopics: string;
		faqFocus: string;
	};
};

export type EventAiDraftResponse = {
	title?: string;
	slug?: string;
	subtitle?: string;
	tagline?: string;
	summary?: string;
	ctaLabel?: string;
	descriptionBodyMd?: string;
	highlights?: string[];
	audienceBullets?: string[];
	outcomes?: string[];
	agenda?: Array<{
		title: string;
		outcome?: string;
		details?: string;
	}>;
	faq?: Array<{
		question: string;
		answer: string;
	}>;
};

type ChatCompletionsResponse = {
	choices?: Array<{
		message?: {
			content?: string;
		};
	}>;
	error?: { message?: string };
};

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const toTrimmed = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const toSlug = (value: string): string =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');

const normalizeArray = (items: unknown, maxItems: number): string[] => {
	if (!Array.isArray(items)) return [];
	return items
		.map((item) => toTrimmed(item))
		.filter(Boolean)
		.slice(0, maxItems);
};

const normalizeAgenda = (items: unknown): NonNullable<EventAiDraftResponse['agenda']> => {
	if (!Array.isArray(items)) return [];
	const normalized: NonNullable<EventAiDraftResponse['agenda']> = [];
	for (const item of items) {
		const row = item as Record<string, unknown>;
		const title = toTrimmed(row.title);
		if (!title) continue;
		normalized.push({
			title,
			outcome: toTrimmed(row.outcome) || undefined,
			details: toTrimmed(row.details) || undefined
		});
		if (normalized.length >= 8) break;
	}
	return normalized;
};

const normalizeFaq = (items: unknown): NonNullable<EventAiDraftResponse['faq']> => {
	if (!Array.isArray(items)) return [];
	return items
		.map((item) => {
			const row = item as Record<string, unknown>;
			const question = toTrimmed(row.question);
			const answer = toTrimmed(row.answer);
			if (!question || !answer) return null;
			return { question, answer };
		})
		.filter((row): row is NonNullable<EventAiDraftResponse['faq']>[number] => Boolean(row))
		.slice(0, 6);
};

const parseJsonFromContent = (content: string): Record<string, unknown> => {
	const direct = content.trim();
	try {
		return JSON.parse(direct) as Record<string, unknown>;
	} catch {
		const fenced = direct.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
		if (!fenced) {
			throw new Error('AI response was not valid JSON.');
		}
		return JSON.parse(fenced) as Record<string, unknown>;
	}
};

const toSafeDraft = (raw: Record<string, unknown>): EventAiDraftResponse => ({
	title: toTrimmed(raw.title) || undefined,
	slug: (() => {
		const slugRaw = toTrimmed(raw.slug);
		if (slugRaw && SLUG_PATTERN.test(slugRaw)) return slugRaw;
		const fromTitle = toSlug(toTrimmed(raw.title));
		return fromTitle || undefined;
	})(),
	subtitle: toTrimmed(raw.subtitle) || undefined,
	tagline: toTrimmed(raw.tagline) || undefined,
	summary: toTrimmed(raw.summary) || undefined,
	ctaLabel: toTrimmed(raw.ctaLabel) || undefined,
	descriptionBodyMd: toTrimmed(raw.descriptionBodyMd) || undefined,
	highlights: normalizeArray(raw.highlights, 8),
	audienceBullets: normalizeArray(raw.audienceBullets, 8),
	outcomes: normalizeArray(raw.outcomes, 8),
	agenda: normalizeAgenda(raw.agenda),
	faq: normalizeFaq(raw.faq)
});

export const generateEventAiDraft = async (
	input: EventAiDraftRequest
): Promise<{ draft: EventAiDraftResponse; raw: string }> => {
	const openaiKey = env.OPENAI_API_KEY?.trim();
	if (!openaiKey) {
		throw new Error('OPENAI_API_KEY is missing');
	}

	const systemPrompt = [
		'You are assisting with event marketing copy drafts for Cambermast.',
		'Return strict JSON only, no prose.',
		'Do not invent partners, credentials, prices, dates, or claims not present in user context.',
		'If unknown, keep fields concise or omit.',
		'Tone should be practical, clear, non-hype.',
		'JSON keys allowed: title, slug, subtitle, tagline, summary, ctaLabel, descriptionBodyMd, highlights, audienceBullets, outcomes, agenda, faq.',
		'slug must be lowercase URL-safe with hyphens.',
		'agenda items: {title, outcome?, details?}; faq items: {question, answer}.',
		'Keep arrays short and useful.'
	].join(' ');

	const userPrompt = JSON.stringify(input, null, 2);

	const response = await fetch(OPENAI_ENDPOINT, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${openaiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: OPENAI_MODEL,
			temperature: 0.4,
			response_format: { type: 'json_object' },
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			]
		})
	});

	const json = (await response.json().catch(() => null)) as ChatCompletionsResponse | null;
	if (!response.ok) {
		const message =
			json?.error?.message ?? `OpenAI text generation failed with status ${response.status.toString()}`;
		throw new Error(message);
	}

	const content = toTrimmed(json?.choices?.[0]?.message?.content);
	if (!content) throw new Error('OpenAI returned an empty response.');

	const parsed = parseJsonFromContent(content);
	const draft = toSafeDraft(parsed);
	return { draft, raw: content };
};
