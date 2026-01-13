export type ToolInfo = {
	slug: string;
	title: string;
	summary: string;
	valueProps: string[];
	outputs: string[];
	audience: string[];
	howItWorks: string[];
	methodology: string[];
	assumptions: string[];
	privacyNote: string;
	faqs: { question: string; answer: string }[];
	relatedTraining: { title: string; description: string; href: string }[];
	lastUpdated: string;
	secondaryCta?: { label: string; url: string };
	hidden?: boolean;
	status?: 'beta' | 'coming-soon';
};

import toolsCatalog from './tools.json';

export const tools: ToolInfo[] = toolsCatalog as ToolInfo[];
