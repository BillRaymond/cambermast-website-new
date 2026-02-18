export type FaqParagraphBlock = {
	type: 'paragraph';
	text: string;
};

export type FaqLinkBlock = {
	type: 'link';
	label: string;
	href: string;
	openInNewTab?: boolean;
};

export type FaqEmailTemplateBlock = {
	type: 'email_template';
	to?: string;
	subject: string;
	body: string;
	ctaLabel?: string;
	copyButtonLabel?: string;
	copiedButtonLabel?: string;
	copiedStateMs?: number;
};

export type FaqBlock = FaqParagraphBlock | FaqLinkBlock | FaqEmailTemplateBlock;

export type FaqItem = {
	key: string;
	question: string;
	blocks: FaqBlock[];
};

export type FaqPresetAudience = 'training' | 'event';

export type FaqPreset = {
	id: string;
	audience: FaqPresetAudience;
	name: string;
	description?: string;
	items: FaqItem[];
	version: string;
};

export type FaqPresetRegistry = {
	presets: FaqPreset[];
};
