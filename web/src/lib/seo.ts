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
		title: 'Contact Cambermast | Get in Touch About Anything',
		description:
			'Reach out about training, advisory services, automations, or any question you want to discuss with the Cambermast team.'
	},
	'/connect': {
		title: 'Book a Consultation with Bill Raymond | Cambermast',
		description:
			'Pick a paid consultation time with Bill Raymond, or start with a free 15-minute chat.'
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
	'/training/terms': {
		title: 'Training Terms & Conditions | Cambermast',
		description:
			'Review refund policies, credits, transfers, and conduct requirements for all Cambermast instructor-led trainings.'
	},
	'/resources/tips': {
		title: 'Training Tips | Get the Most from Live Sessions | Cambermast',
		description:
			'Prepare for live Cambermast training with practical tips on setup, tools, and participation.'
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
	'/resources': {
		title: 'Resources for AI Training & Delivery | Cambermast',
		description:
			'Access practical checklists and guides that help teams prepare for Cambermast training and apply the work.'
	},
	'/strategy': {
		title: 'AI Advisory & Project Management | Cambermast',
		description:
			'Partner with Cambermast for AI advisory sprints, governance, and project leadership that turn pilots into repeatable wins.'
	},
	'/tools': {
		title: 'AI Job Readiness Tools | Cambermast',
		description:
			'Explore assessments, self-assessments, and AI tools focused on job readiness, skill gaps, and role-fit decisions.'
	},
	'/tools/agentic-roi-calculator': {
		title: 'Agentic ROI Calculator: Quantify Your Manual Tax & Reclaim Capacity',
		description:
			'Calculate operational overhead and reclaimed work capacity with AI agents. Research-backed calculator showing exactly how much time your team loses to repetitive tasks, focus loss, and manual handoffs.'
	},
	'/tools/ai-readiness-assessment': {
		title: 'AI Readiness Assessment | Cambermast Tools',
		description:
			'Assess AI readiness across skills, workflows, and governance to guide training decisions.'
	},
	'/tools/ai-tool-comparison': {
		title: 'AI Tool Fit Comparison | Cambermast Tools',
		description:
			'Compare AI tools by role fit, learning curve, and workflow readiness.'
	},
	'/gdpr': {
		title: 'GDPR & Privacy at Cambermast',
		description:
			'See how Cambermast handles contact and testimonial submissions, which third parties we use, and how to exercise your GDPR rights.'
	},
	'/services/microsoft-project-server': {
		title: 'Microsoft Project Server Migration Support | Cambermast',
		description:
			'Move off Microsoft Project Server 2013/2016/2019 with Cambermast and Project Hosts before end-of-support hits July 14, 2026.'
	}
};

export const getSeo = (path: string): SeoMeta => {
	const override = pageSeo[path];
	return override ? { ...defaultSeo, ...override } : defaultSeo;
};
