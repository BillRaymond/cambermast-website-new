import type { TrainingProgram } from './types';

export const aiAdvancedWorkshop = {
	slug: 'ai-advanced-workshop',
	title: 'AI Advanced Workshop',
	nickname: 'Seven weeks to operationalize advanced AI',
	tagline:
		'Co-design advanced AI playbooks that automate decisions, elevate customer touchpoints, and improve how your team delivers work.',
	heroImage: '/images/ai-advanced.jpeg',
	heroImageAlt: 'AI Advanced Workshop illustration',
	description:
		'The AI Advanced Workshop builds upon the AI Accelerator workshop by sharing how you can use advanced AI features to improve how you run your business. This is a custom course built specifically for you and your business.',
	secondaryDescription:
		'Across seven weeks we help you identify the advanced use cases that matter, prototype with your data and tools, and coach your team until the workflows stick.',
	primaryCta: {
		label: 'Start your custom plan',
		url: '/contact'
	},
	secondaryCta: {
		label: 'Explore other workshops',
		url: '/training'
	},
	stats: [
		{ label: 'Duration', value: 'Seven weeks, 2-hour commitment per week' },
		{ label: 'Format', value: ['🔴 Live online', '🏫 In-person option available'] },
		{ label: 'Planning Investment', value: '$1,500 for two 1-hour consultations to shape the agenda' },
		{ label: 'Virtual Pricing', value: '$1,749 per participant for Zoom-based cohorts' },
		{ label: 'In-person', value: 'Custom pricing available for on-site delivery' }
	],
	audience: [
		'Experienced AI users ready to expand automation and augmentation across the business.',
		'Leaders willing to invest time upfront to design an engagement that delivers exactly what they need.'
	],
	audienceExamples: [
		'Heads of operations aligning AI with service delivery teams.',
		'Marketing and revenue leaders orchestrating multi-channel personalization.',
		'Innovation managers combining AI, data, and automation squads.',
		'Product teams training assistants on proprietary knowledge bases.'
	],
	objectives: [
		'Prioritize the advanced AI initiatives that unlock measurable business outcomes.',
		'Design guardrails, data flows, and accountability for scaled AI adoption.',
		'Prototype advanced workflows, then document and hand off playbooks your teams can run.'
	],
	prerequisites: [
		'Foundational understanding of prompting and responsible AI use.',
		'Access to the AI platforms you plan to use (ChatGPT Enterprise, Claude Team, custom models, or automation stacks).',
		'Availability for weekly 2-hour working sessions across the seven-week cadence.'
	],
	takeaways: [
		'Custom AI roadmap with milestones, responsibilities, and ROI targets.',
		'Advanced prompt libraries, automations, and agent blueprints built for your workflows.',
		'Enablement materials to onboard new team members quickly.',
		'Executive-ready briefing that explains outcomes, risks, and next investments.'
	],
	sessions: [
		{
			name: 'Discovery & Alignment',
			date: 'Scheduled with your leadership team',
			time: '60-minute kickoff',
			location: 'Zoom (optional on-site)',
			spots: 'Core stakeholders',
			registerUrl: '/contact'
		},
		{
			name: 'Weekly Advanced Labs',
			date: 'Weeks 1–6',
			time: '2-hour live build sessions',
			location: 'Zoom + shared workspace',
			spots: 'Up to 25 team members',
			registerUrl: '/contact'
		},
		{
			name: 'Executive Playbook Review',
			date: 'Week 7',
			time: '60-minute strategy wrap-up',
			location: 'Zoom or on-site presentation',
			spots: 'Leadership + project team',
			registerUrl: '/contact'
		}
	],
	agenda: [
		{
			title: 'Week 1: Advanced Discovery',
			details: [
				'Map priority workflows, data sources, and compliance considerations.',
				'Select high-value AI opportunities and define success metrics.',
				'Align executive sponsors and delivery teams on goals and guardrails.'
			]
		},
		{
			title: 'Week 2: Opportunity Prioritization & Roadmapping',
			details: [
				'Score advanced use cases against impact, effort, and readiness.',
				'Sequence near-term pilots and supporting enablers on a shared roadmap.',
				'Align executive sponsors on ROI targets and guardrails for the build weeks.'
			]
		},
		{
			title: 'Week 3: Prototyping Sprints',
			details: [
				'Build AI co-pilots and automations that plug into existing systems.',
				'Set up evaluation loops to measure quality, latency, and cost.',
				'Capture decisions in reusable prompt and workflow templates.'
			]
		},
		{
			title: 'Week 4: Data & Governance',
			details: [
				'Define approval flows, escalation paths, and human-in-the-loop checkpoints.',
				'Configure secure access to documents, APIs, and knowledge bases.',
				'Document risk mitigations and compliance responsibilities.'
			]
		},
		{
			title: 'Week 5: Enablement & Change',
			details: [
				'Coach team leads on adoption tactics and performance tracking.',
				'Plan internal communications and reinforcement sessions.',
				'Equip champions with training guides and office-hour formats.'
			]
		},
		{
			title: 'Week 6: Scale & Measure',
			details: [
				'Standardize reporting on AI impact across teams.',
				'Prepare executive updates that articulate value and next bets.',
				'Identify follow-on experiments to keep momentum.'
			]
		},
		{
			title: 'Week 7: Executive Playbook & Transition',
			details: [
				'Finalize automation runbooks, prompt libraries, and support models.',
				'Deliver an executive-ready briefing that shares wins, risks, and next bets.',
				'Define ongoing coaching, office hours, and success metrics post-engagement.'
			]
		}
	],
	resources: [
		'Custom AI enablement hub with recordings, templates, and SOPs.',
		'Executive briefing deck and ROI calculator.',
		'Optional office hours between sessions for implementation support.'
	],
	reviews: [
		{
			quote:
				'Our advanced cohort finally aligned on which automations to scale and how to measure success. This program built the shared playbook.',
			author: 'Chloe M.',
			role: 'Chief Operations Officer'
		},
		{
			quote:
				'The weekly labs turned advanced AI theory into production-ready workflows tailored to our data stack.',
			author: 'Rahul P.',
			role: 'Head of Product Innovation'
		}
	],
	testimonial: {
		quote: 'The engagement brought clarity to our AI roadmap and helped us upskill leaders at the same time.',
		author: 'Dana L., VP of Strategy'
	},
	aboutTrainer: {
		title: 'About your trainer',
		name: 'Bill Raymond',
		role: 'Founder, Cambermast LLC',
		photo: '/images/bill.jpg',
		photoAlt: 'Bill Raymond',
		summary:
			'Bill partners with leadership teams to scale AI adoption responsibly—tying advanced technology back to measurable business value.',
		highlights: [
			'Author of the Bill Talks AI newsletter.',
			'Founding member of the AI Collective.',
			'NASA award winner.',
			'Microsoft MVP.',
			'Host of the Agile in Action podcast with 130+ episodes.'
		]
	},
	faqs: [
		{
			question: 'How customized is the curriculum?',
			answers: [
				'Every engagement starts with discovery and co-planning so that the weekly labs focus on your real workflows and data.',
				'We can expand or swap modules as priorities evolve during the seven weeks.'
			]
		},
		{
			question: 'Can we include other teams mid-program?',
			answers: [
				'Yes. We recommend selecting champions in advance, but we can run supplemental enablement sessions to bring new participants up to speed.'
			]
		},
		{
			question: 'What if we only need portions of the workshop?',
			answers: [
				'We can adapt the schedule into a shorter accelerator or focused lab. Reach out and we will design the right format together.'
			]
		}
	]
} satisfies TrainingProgram;

export default aiAdvancedWorkshop;
