import type { TechlabProgram } from './types';

export const techlabAiAcceleratorWorkshop = {
	slug: 'ai-accelerator-workshop',
	route: '/techlab/ai-accelerator-workshop',
	sku: 'CM-TR-002',
	title: 'AI Accelerator Workshop',
	nickname: 'From core prompting to professional AI systems',
	tagline:
		'Bundle AI Power Prompting with advanced build labs so your team launches repeatable AI workflows that run the business better.',
	heroImage: '/images/ai-accelerator.jpeg',
	heroImageAlt: 'AI Accelerator Workshop illustration',
	ogImage: '/images/cambermast-content-2-ai-accelerator-workshop-og.jpeg',
	ogImageAlt: 'Open graph image for the AI Accelerator Workshop training program',
	description:
		'The AI Accelerator Workshop includes the AI Power Prompting course and layers on professional AI features so you can run your business more efficiently. You will leave with hands-on practice using custom GPTs, AI projects, and research frameworks tailored to your workflows across four focused weeks.',
	secondaryDescription:
		'This blended, four-week program is ideal for teams who want a head start with AI fundamentals and the confidence to operationalize advanced capabilities without reinventing the wheel each time.',
	primaryCta: {
		label: 'Schedule your team',
		url: '/contact'
	},
	secondaryCta: {
		label: 'Talk with Bill',
		url: '/contact'
	},
	stats: [
		{ label: 'Duration', value: 'Four weeks, 2-hour commitment per week' },
		{ label: 'Format', value: ['🔴 Live online', '🏫 In-person available'] },
		{ label: 'Cost', value: '$849 per person (virtual cohort)' },
		{ label: 'Environment', value: '💙 Learn in a supportive, judgment-free environment' },
		{ label: 'What’s included', value: 'AI Power Prompting + advanced build labs' },
		{ label: 'In-person', value: 'Custom pricing available for on-site training' }
	],
	audience: [
		'Beginners who want to get a head start with AI and immediately apply it to their business.',
		'Operators eager to save time with repeatable AI processes like customer support, marketing content, and FAQ responses.'
	],
	audienceExamples: [
		'Small-business owners building their first AI playbooks.',
		'Customer experience leaders standardizing responses with AI assists.',
		'Marketing teams accelerating campaign copy and creative briefs.',
		'Operations managers codifying internal knowledge into reusable AI projects.'
	],
	objectives: [
		'Master the fundamentals of AI prompting and responsible use.',
		'Configure custom GPTs that reflect your brand voice and processes.',
		'Launch AI projects that organize prompts, files, and context for ongoing work.',
		'Practice deep research techniques to inform strategy, competitor intel, and planning.'
	],
	prerequisites: [
		'A ChatGPT Plus, Enterprise, or comparable account with access to custom GPTs and projects.',
		'Willingness to share sample processes or content to tailor exercises.',
		'Curiosity and a laptop capable of running modern browsers.'
	],
	takeaways: [
		'Ready-to-use prompt templates covering core and advanced use cases.',
		'Custom GPTs configured around your business scenarios.',
		'Project spaces that keep prompts, files, and context organized for future work.',
		'Research frameworks that turn AI findings into confident decisions.'
	],
	sessions: [
		{
			name: 'Private Team Workshop',
			date: 'Schedule a date that fits your team',
			time: 'Four weekly 2-hour sessions (virtual) or condensed on-site delivery',
			location: 'Zoom or on-site',
			spots: 'Up to 25 participants',
			registerUrl: '/contact'
		}
	],
	agenda: [
		{
			title: 'Week 1: AI Power Prompting Core',
			details: [
				'Cover everything inside the AI Power Prompting curriculum.',
				'Practice the four core prompt types across writing, analysis, and ideation.',
				'Adopt responsible-use guardrails that build trust inside your team.'
			]
		},
		{
			title: 'Week 2: Custom GPT Foundations',
			details: [
				'Map business processes that benefit from custom GPTs.',
				'Configure custom instructions, knowledge, and actions that keep outputs on brand.',
				'Test and iterate GPT behaviors with real scenarios from your organization.'
			]
		},
		{
			title: 'Week 3: AI Projects & Workflow Organization',
			details: [
				'Organize prompts, files, and context inside AI project spaces.',
				'Create reusable folders for marketing, support, and operations workflows.',
				'Share project spaces with teammates so everyone stays on the same page.'
			]
		},
		{
			title: 'Week 4: Market-Ready AI Delivery',
			details: [
				'Use advanced AI research strategies for competitor analysis and market planning.',
				'Combine AI insights with curated human sources to maintain accuracy.',
				'Package your offering for GPT marketplace listings and discovery.',
				'Plan follow-up experiments that keep your automations relevant.'
			]
		}
	],
	resources: [
		'Workbook that combines AI Power Prompting and accelerator exercises.',
		'Custom GPT configuration checklists and sample knowledge base templates.',
		'Research brief template that transforms findings into presentations.',
		'Post-workshop office hours to refine GPTs and projects.'
	],
	reviews: [
		{
			quote:
				'We ramped new team members on AI in a single week and now ship campaigns faster than ever.',
			author: 'Leslie K.',
			role: 'Director of Marketing'
		},
		{
			quote:
				'The accelerator gave us the systems to keep AI projects organized and compliant.',
			author: 'Jordan H.',
			role: 'Head of Customer Operations'
		}
	],
	testimonial: {
		quote:
			'Our small business now has reusable AI assets that save hours each week—we no longer start from scratch.',
		author: 'Nia F., Founder'
	},
	aboutTrainer: {
		title: 'About your trainer',
		name: 'Bill Raymond',
		role: 'Founder, Cambermast LLC',
		photo: '/images/bill.jpg',
		photoAlt: 'Bill Raymond',
		summary:
			'Bill helps teams adopt AI responsibly, blending foundational skills with advanced automation tactics that stick inside your business.',
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
			question: 'Do we need AI experience before attending?',
			answers: [
				'No. The workshop starts with AI Power Prompting to establish the fundamentals and then moves into advanced capabilities with plenty of guided practice.'
			]
		},
		{
			question: 'Can we tailor the advanced modules?',
			answers: [
				'Yes. Private cohorts can swap modules or double down on areas like custom GPTs, AI research, or automation workflows.'
			]
		},
		{
			question: 'Is there post-workshop support?',
			answers: [
				'You receive office hours and follow-up resources to ensure your custom GPTs and projects keep delivering value.'
			]
		}
	]
} satisfies TechlabProgram;

export default techlabAiAcceleratorWorkshop;
