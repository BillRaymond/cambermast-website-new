import { listTools } from '$lib/data/tools';

type BuildToolsApiPayloadInput = {
	origin: string;
	generatedAt?: string;
};

const toAbsoluteUrl = (value: string, origin: string): string => {
	if (/^https?:\/\//i.test(value)) return value;
	if (value.startsWith('/')) return `${origin}${value}`;
	return value;
};

const toApiTool = (tool: ReturnType<typeof listTools>[number], origin: string) => ({
	id: tool.id,
	title: tool.title,
	description: tool.description,
	route: tool.route,
	url: toAbsoluteUrl(tool.route, origin),
	icon: tool.icon,
	category: tool.category,
	status: tool.status,
	features: tool.features,
	publishedDate: tool.publishedDate
});

export const buildToolsApiPayload = ({ origin, generatedAt }: BuildToolsApiPayloadInput) => ({
	generatedAt: generatedAt ?? new Date().toISOString(),
	tools: listTools().map((tool) => toApiTool(tool, origin))
});

export const buildToolsApiExamples = (origin: string) => {
	const payload = buildToolsApiPayload({ origin, generatedAt: '2026-02-13T18:15:00.000Z' });
	const first = payload.tools.at(0) ?? null;
	return {
		response: payload,
		example: first ? { generatedAt: payload.generatedAt, tools: [first] } : payload
	};
};
