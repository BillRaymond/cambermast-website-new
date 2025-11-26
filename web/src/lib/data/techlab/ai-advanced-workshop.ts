import type { TechlabProgram } from './types';

export const techlabAiAdvancedWorkshop: TechlabProgram = {
	slug: 'ai-advanced-workshop',
	route: '/techlab/ai-advanced-workshop',
	sku: 'CM-TR-003',
	title: 'AI Workshop for Modern Teams',
	nickname: 'Seven-week cohort for founder-led teams',
	tagline: 'Kick-start AI adoption for startup founders and their teams—with measurable results in seven weeks.',
	heroImage: '/images/ai-advanced.jpeg',
	heroImageAlt: 'AI Workshop for Modern Teams illustration',
	ogImage: '/images/cambermast-content-3-ai-workshop-for-modern-teams-og.jpeg',
	ogImageAlt: 'Open graph image for the AI Workshop for Modern Teams training program',
	description:
		'The AI Workshop for Modern Teams is a live, seven-week cohort that helps startup founders and their core teams weave generative AI into everyday planning, delivery, and reporting workflows.',
	secondaryDescription:
		'Each week blends strategic discussions with hands-on practice so founder teams can automate routine work, improve decision quality from day one, and collaborate with AI responsibly without needing a large operations staff.',
	primaryCta: {
		label: 'Schedule your team',
		url: '/contact'
	},
	secondaryCta: {
		label: 'Talk with Bill',
		url: '/contact'
	},
	stats: [
		{ label: 'Duration', value: 'Seven weeks, 2-hour commitment per week' },
		{ label: 'Format', value: ['🔴 Live online', '🏫 In-person available'] },
		{ label: 'Cost', value: '$1,749 per person (virtual cohort)' },
		{ label: 'Environment', value: '💙 Learn in a supportive, judgment-free environment' },
		{ label: 'Team size', value: 'Ideal for intact teams of 6-25 participants' }
	],
	audience: [
		'Startup founders and cross-functional squads getting their first AI systems off the ground.',
		'Managers responsible for scaling AI adoption without sacrificing compliance or brand voice.',
		'Leaders who want a repeatable system to evaluate, pilot, and scale AI initiatives.'
	],
	audienceExamples: [
		'Founding teams mapping the first AI-enhanced GTM motions.',
		'Operations leads improving handoffs between departments and tools.',
		'Product managers coordinating research, planning, and launch communications.',
		'Customer success and support teams balancing personalization with efficiency.',
		'Enablement groups building shared playbooks for knowledge workers.'
	],
	objectives: [
		'Automate repetitive tasks so teams can focus on strategic, human-centered work.',
		'Co-create prompts, templates, and workflows that reflect your quality standards and guardrails.',
		'Connect AI experiments to measurable outcomes, dashboards, and handoffs starting from a founder-led baseline.',
		'Turn founder deliverables—pitch decks, VC communications, and market briefings—into shared playbooks.'
	],
	prerequisites: [
		'Access to a paid account for a foundational LLM such as ChatGPT, Claude, Gemini, or Copilot.',
		'Readiness to bring real processes or projects to explore during the cohort.',
		'Commitment to experimenting within existing policies, compliance requirements, and brand guidelines.'
	],
	takeaways: [
		'Team-specific workflow maps that pinpoint where AI adds leverage.',
		'Reusable prompt libraries, playbooks, and decision frameworks.',
		'A documented adoption plan with checkpoints, owners, and success metrics.',
		'Investor-readiness toolkit with templates for decks, competitive research, and stakeholder updates.',
		'Digital certificate of completion once the Week 7 project is presented.'
	],
	sessions: [
		{
			name: 'Private Team Cohorts',
			date: 'Schedule a start date that fits your team',
			time: 'Seven weekly 2-hour sessions (virtual or on-site intensives)',
			location: 'Zoom or on-site',
			spots: 'Up to 25 participants',
			registerUrl: '/contact'
		}
	],
	agenda: [
		{
			title: 'Week 1: Adopting the AI Mindset',
			details: [
				'Explore AI foundations for founder-led teams and align on ethical guardrails.',
				'Identify quick wins that remove repetitive busywork across a lean organization.',
				'Practice prompt fundamentals for clarity, context, and accuracy.'
			]
		},
		{
			title: 'Week 2: Mapping Your Workflows',
			details: [
				'Document end-to-end processes that benefit from AI augmentation, even if they live in a founder’s head today.',
				'Align stakeholders on success metrics, handoffs, and constraints.',
				'Test AI tools that simulate common scenarios and edge cases.'
			]
		},
		{
			title: 'Week 3: Personalization at Scale',
			details: [
				'Streamline communication across channels without losing brand consistency.',
				'Automate tone, style, and format adjustments with controlled prompts.',
				'Design custom GPT instructions tailored to your team workflows and investor communications.'
			]
		},
		{
			title: 'Week 4: Accelerating Value Delivery',
			details: [
				'Standardize production workflows and remove bottlenecks.',
				'Run AI-powered audits to prioritize improvements and de-risk adoption.',
				'Plan projects and tasks that increase measurable impact.'
			]
		},
		{
			title: 'Week 5: Deep Insights and Research',
			details: [
				'Use AI to surface gaps, opportunities, and research angles—including competitor tear-downs.',
				'Co-develop outlines and drafts for upcoming deliverables like pitch decks and market updates.',
				'Define the project you will carry through Weeks 6 and 7.'
			]
		},
		{
			title: 'Week 6: Data-Driven Decisions',
			details: [
				'Instrument feedback mechanisms to evaluate AI-generated work.',
				'Apply advanced prompting to sharpen clarity and reduce variance.',
				'Review progress on team projects and share peer feedback.'
			]
		},
		{
			title: 'Week 7: Operationalizing Your Roadmap',
			details: [
				'Present final projects—often investor-ready narratives or GTM plans—and capture stakeholder feedback.',
				'Codify a long-term roadmap for AI-enabled operations.',
				'Celebrate wins and finalize support plans for sustained adoption.'
			]
		}
	],
	resources: [
		'Weekly office hours and a shared workspace for questions and feedback.',
		'Downloadable templates, prompt libraries, and adoption checklists.',
		'Digital certification recognizing successful course completion.'
	],
	aboutTrainer: {
		title: 'About your trainer',
		name: 'Bill Raymond',
		role: 'Founder, Cambermast LLC',
		photo: '/images/bill.jpg',
		photoAlt: 'Bill Raymond',
		summary:
			'Bill is a technical content strategist and AI practitioner who helps teams operationalize generative AI with measurable outcomes.',
		highlights: [
			'Author of the Bill Talks AI newsletter.',
			'Founding member of the AI Collective.',
			'NASA award winner and Microsoft MVP.',
			'Host of the Agile in Action podcast with 130+ episodes.'
		]
	},
	faqs: [
		{
			question: 'Will I receive a certificate of completion?',
			answers: ['Yes. Graduates receive a digital certificate after presenting their final project.']
		},
		{
			question: 'Will there be makeup dates?',
			answers: [
				'There are no official makeup dates, but Bill accommodates reasonable requests when scheduling conflicts arise.'
			]
		},
		{
			question: 'Do I need anything before the workshop starts?',
			answers: [
				'Bring access to a paid generative AI account (ChatGPT, Claude, Gemini, Copilot, etc.) and a project where you can apply the lessons.'
			]
		},
		{
			question: 'Are the meetings virtual or in-person?',
			answers: [
				'All cohort sessions are hosted live on Zoom, with optional on-site intensives for private teams.'
			]
		},
		{
			question: 'How can I ask questions about the course?',
			answers: [
				'Use the "Contact the Host" link on the Lu.ma event page or reach out through the Cambermast contact form.'
			]
		},
		{
			question: 'Will there be exercises and take-home work?',
			answers: [
				'Yes. Expect optional take-home exercises and encouragement to apply each lesson directly to your team workflows.'
			]
		},
		{
			question: 'Are there scheduled collaboration meetings after each class?',
			answers: [
				'Not formally, but Bill hosts weekly office hours and maintains a discussion thread for ongoing peer support.'
			]
		},
		{
			question: "I can't take this course. Are there others?",
			answers: [
				"Follow Bill's training calendar at https://lu.ma/BillTalksAI and subscribe to the Bill Talks AI newsletter for upcoming offerings."
			]
		}
	]
};

export default techlabAiAdvancedWorkshop;
