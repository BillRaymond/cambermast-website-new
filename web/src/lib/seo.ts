export type SeoMeta = {
	title: string;
	description?: string;
};

export const defaultSeo: SeoMeta = {
	title: 'Cambermast | AI Agility in Action',
	description:
		'Cambermast helps teams adopt AI with confidence through hands-on training, advisory sprints, and automation services.'
};

type SeoOverrides = Record<string, Partial<SeoMeta>>;

export const pageSeo: SeoOverrides = {
	'/': {
		title: 'Cambermast | AI Agility in Action',
		description:
			'Practical AI training, advisory, and automation so your teams learn quickly and ship results.'
	},
	'/about': {
		title: 'About Cambermast | AI Agility in Action',
		description:
			'Meet Bill Raymond and the partners who guide organizations through practical AI adoption.'
	},
	'/contact': {
		title: 'Contact Cambermast | Plan AI Training & Advisory',
		description:
			'Reach out to schedule AI training, request advisory support, or scope an automation with the Cambermast team.'
	},
	'/training': {
		title: 'AI Training Programs | Cambermast',
		description:
			'Browse hands-on AI workshops and cohorts that help your teams experiment, build, and scale with confidence.'
	},
	'/training/table': {
		title: 'AI Training Catalog Table View | Cambermast',
		description:
			'Compare Cambermast AI workshops side by side with duration, format, and cost details for proposals and planning.'
	},
	'/training/calendar': {
		title: 'AI Training Calendar | Cambermast',
		description:
			'Review upcoming AI workshops, public cohorts, and private training dates, then register or schedule a session for your team.'
	},
	'/training/print': {
		title: 'Cambermast Training Programs | Print View',
		description:
			'Print a one-page summary of Cambermast AI training offerings to share with stakeholders and decision makers.'
	},
	'/testimonials': {
		title: 'AI Training Testimonials | Cambermast',
		description:
			'Browse testimonials from Cambermast training cohorts and workshops, grouped by program.'
	},
	'/agents': {
		title: 'AI Agents & Automation Services | Cambermast',
		description:
			'Design and launch reliable AI automations with n8n, APIs, and human-in-the-loop guardrails.'
	},
	'/strategy': {
		title: 'AI Advisory & Project Management | Cambermast',
		description:
			'Partner with Cambermast for AI advisory sprints, governance, and project leadership that turn pilots into repeatable wins.'
	}
};

export const getSeo = (path: string): SeoMeta => {
	const override = pageSeo[path];
	return override ? { ...defaultSeo, ...override } : defaultSeo;
};
