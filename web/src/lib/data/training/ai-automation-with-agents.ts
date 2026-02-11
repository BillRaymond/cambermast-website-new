import type { TrainingProgram } from './types';

export const aiAutomationWithAgents = {
	slug: 'ai-automation-with-agents',
	route: '/training/ai-automation-with-agents',
	sku: 'CM-TR-004',
	title: 'AI Automation with Agents Workshop',
	nickname: 'Six-week cohort for applied agent builders',
	tagline:
		'Automate internal processes with AI agents that act like team members, across six weeks of guided practice.',
	heroImage: '/images/ai-automation.jpg',
	heroImageAlt: 'AI Automation with Agents Workshop illustration',
	ogImage: '/images/cambermast-content-4-ai-automation-with-agents-workshop-og.jpeg',
	ogImageAlt: 'Open graph image for the AI Automation with Agents workshop training program',
	description:
		'The AI Automation with Agents Workshop is a live, six-week cohort on automating internal processes with reliable AI agents. We tackle real-world scenarios where an agent behaves like a teammate, coordinating steps and escalating to people when necessary.',
	secondaryDescription:
		'Across weekly 2-hour sessions you will design, build, and optimize agents using tools like n8n, OpenAI, and best-practice API integrations. That way your team leaves with something running.',
	primaryCta: {
		label: 'Schedule your team',
		url: '/contact'
	},
	secondaryCta: {
		label: 'See more automation work',
		url: '/agents'
	},
	stats: [
		{ label: 'Duration', value: 'Six weeks, 2-hour commitment per week' },
		{ label: 'Format', value: ['🔴 Live online', '🏫 In-person available'] },
		{ label: 'Cost', value: '$1,749 per person (virtual cohort)' },
		{ label: 'Certificate', value: '📜 Personalized certificate included' },
		{ label: 'Environment', value: '💙 Learn in a supportive, judgment-free environment' },
		{ label: 'In-person', value: 'Custom fees for SF Bay Area or on-site sessions' },
		{
			label: 'Done-for-you option',
			value: 'Request a quote if you prefer us to build the agents for you'
		},
		{ label: 'Support', value: 'Includes 30-day coaching and monitoring check-ins' }
	],
	audience: [
		'Technically proficient builders who want to automate business processes with AI agents.',
		'Teams eager to design automations that save hours each week.'
	],
	audienceExamples: [
		'Operations managers automating intake, triage, and handoffs.',
		'Automation engineers connecting AI models to internal APIs.',
		'Consultants delivering managed automations for clients.',
		'Founders validating AI-powered back-office assistants.'
	],
	objectives: [
		'Understand what an AI agent is, how it works, and when to keep humans in the loop.',
		'Build production-ready n8n automations that orchestrate AI models, APIs, and business rules.',
		'Optimize agents for cost, latency, and reliability, with monitoring plans to match.'
	],
	prerequisites: [
		'Comfort working with APIs, webhooks, or automation tools like Zapier and n8n.',
		'Active accounts for the AI providers you plan to use (OpenAI, Anthropic, or Azure OpenAI).',
		'Access to a realistic process or dataset you want to automate.'
	],
	takeaways: [
		'A working agent that automates a real scenario from your business.',
		'Blueprint documenting architecture, prompts, and integration patterns.',
		'Checklists for human handoffs, escalation, and monitoring.',
		'Optimization plan to keep usage costs predictable.'
	],
	sessions: [
		{
			name: 'Winter 2025-2026 Open Enrollment',
			date: 'Dec 4, 2025 - Jan 22, 2026 (Wednesdays)',
			time: ['10:00 am-12:00 pm PT', '1:00-3:00 pm ET'],
			startDate: '2025-12-04',
			endDate: '2026-01-22',
			location: 'Live on Zoom',
			spots: 'Open enrollment',
			registerUrl: 'https://cambermast.com/contact',
			draft: true
		},
		{
			name: 'Private Team Cohorts',
			date: 'Schedule a start date that fits your team',
			time: 'Six weekly 2-hour sessions or compressed on-site blocks',
			location: 'Zoom or on-site (SF Bay Area)',
			spots: 'Up to 15 participants',
			registerUrl: '/contact'
		}
	],
	agenda: [
		{
			title: 'Week 1: Agent Foundations',
			details: [
				'Define what AI agents are, how they orchestrate tools, and where they excel.',
				'Map a target process, decision points, and human checkpoints.',
				'Set up secure access to APIs, knowledge bases, and action nodes.'
			]
		},
		{
			title: 'Week 2: Opportunity Mapping & Scoping',
			details: [
				'Prioritize candidate workloads based on impact, complexity, and data access.',
				'Design human-in-the-loop checkpoints that keep people informed.',
				'Draft success metrics and reliability thresholds for your agent.'
			]
		},
		{
			title: 'Week 3: Build Core Agent Loops',
			details: [
				'Assemble n8n workflows that call AI models, parse responses, and trigger APIs.',
				'Frame prompts and instructions that make the agent trustworthy.',
				'Prototype audit trails and safe fallbacks before production.'
			]
		},
		{
			title: 'Week 4: Guardrails and Human Handoffs',
			details: [
				'Implement routing logic that escalates decisions to the right humans.',
				'Add validation steps, retries, and structured outputs to reduce errors.',
				'Document standard operating procedures for exception handling.'
			]
		},
		{
			title: 'Week 5: Observability & Optimization',
			details: [
				'Run evaluation loops to monitor accuracy, latency, and cost.',
				'Tune prompts, memory strategies, and caching for efficiency.',
				'Instrument alerts and dashboards so issues surface fast.'
			]
		},
		{
			title: 'Week 6: Launch & Scale Roadmap',
			details: [
				'Define rollout plans, SLAs, and documentation for your team.',
				'Plan additional agent use cases and integrations.',
				'Schedule follow-up coaching and monitoring checkpoints.'
			]
		}
	],
	resources: [
		'Agent architecture handbook with reusable modules and prompts.',
		'Configuration checklists and runbooks for on-call responders.',
		'30-day support channel to review logs and iterate on automations.'
	],
	testimonial: {
		quote: 'The team left with a production-ready agent plus the knowledge to keep improving it.',
		author: 'Samira H., COO'
	},
	aboutTrainer: {
		title: 'About your trainer',
		name: 'Bill Raymond',
		role: 'Founder, Cambermast LLC',
		photo: '/images/bill.jpg',
		photoAlt: 'Bill Raymond',
		summary:
			'Bill has delivered AI automations and agent pilots for startups and enterprises, helping teams balance speed with responsible deployment.',
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
			question: 'What technical skills should our team have?',
			answers: [
				'A basic understanding of APIs or automation platforms is ideal. We provide pre-work to get everyone on the same page before the workshop.'
			]
		},
		{
			question: 'Can you build the automation for us?',
			answers: [
				'Yes. If you would rather have the agent delivered for you, request a custom quote and we will scope a build-and-handoff engagement.'
			]
		},
		{
			question: 'Do you offer on-site workshops?',
			answers: [
				'We regularly run in-person sessions in the SF Bay Area and can travel for private company engagements.'
			]
		}
	]
} satisfies TrainingProgram;

export default aiAutomationWithAgents;
