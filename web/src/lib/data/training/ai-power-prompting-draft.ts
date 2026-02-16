import type { TrainingProgram } from './types';
// This is an example of a draft training program data file for internal review purposes.
export const aiPowerPromptingDraft = {
	slug: 'ai-power-prompting-draft',
	route: '/training/ai-power-prompting-draft',
	sku: 'CM-TR-DRAFT-001',
	catalog: {
		id: 'training-ai-power-prompting-draft',
		summary: 'Draft program data used for internal review and QA only.',
		image: '/images/ai-fundamentals.jpeg',
		imageAlt: 'AI Power Prompting lab concept art',
		bullets: [
			'Internal-only curriculum review',
			'Validate layout and content flow',
			'Capture QA and launch feedback'
		],
		order: 99,
		published: false
	},
	title: 'AI Power Prompting Lab (Draft)',
	nickname: 'Experimental prompt lab for early testers',
	tagline: 'Preview the next iteration of our AI Power Prompting experience before it launches.',
	heroImage: '/images/ai-fundamentals.jpeg',
	heroImageAlt: 'AI Power Prompting lab concept art',
	ogImage: '/images/cambermast-content-1-ai-fundamentals-ai-power-prompting-og.jpeg',
	ogImageAlt: 'Open graph image for the AI Power Prompting lab training program',
	description:
		'This is a staging version of our AI Power Prompting program that we use to test new exercises, prompts, and formats. Content is subject to change and feedback is encouraged.',
	secondaryDescription:
		'If you are previewing this page, you are likely reviewing copy or flow before launch. Make sure to double-check CTAs, scheduling details, and testimonials prior to removing the draft flag.',
	primaryCta: {
		label: 'Draft CTA (no booking)',
		url: '/contact'
	},
	secondaryCta: {
		label: 'Share feedback',
		url: '/contact'
	},
	scheduleTemplate: {
		durationDays: 1,
		hoursPerDayCommitment: 4,
		defaultStartTimeLocal: '13:00',
		defaultTimeZone: 'America/Los_Angeles',
		defaultTimeZoneLabel: 'PT',
		defaultLocationLabel: 'Online'
	},
	stats: [
		{ label: 'Duration', value: '4 hours (TBD)' },
		{ label: 'Format', value: ['🔴 Live online (draft)', '🏫 On-site TBD'] },
		{ label: 'Cost', value: '$0 (internal review only)' },
		{ label: 'Certificate', value: '📜 Certificate included' }
	],
	audience: [
		'Internal reviewers validating new program structure.',
		'Therapists of copy, design, and curriculum ensuring everything feels right.'
	],
	objectives: [
		'Confirm messaging and layout before publishing.',
		'Gather feedback on proposed exercises and pacing.'
	],
	sessions: [
		{
			name: 'Internal Review Cohort',
			date: 'Pending scheduling',
			time: 'TBD',
			location: 'Zoom (internal link to follow)',
			spots: 'Closed enrollment',
			registerUrl: 'https://example.com/draft-registration',
			draft: true
		}
	],
	agenda: [
		{
			title: 'Draft Agenda',
			details: [
				'Walk through new prompt templates and exercises.',
				'Collect reviewer feedback on flow and timing.',
				'Decide what ships with the production release.'
			]
		}
	],
	resources: ['Draft workbook (placeholder link).', 'Feedback template for reviewers.'],
	aboutTrainer: {
		title: 'About your facilitator',
		name: 'Bill Raymond',
		role: 'Founder, Cambermast LLC',
		summary:
			'Bill is running this lab to fine-tune the prompts, scripts, and examples ahead of our next release.'
	},
	draft: true
} satisfies TrainingProgram;

export default aiPowerPromptingDraft;
