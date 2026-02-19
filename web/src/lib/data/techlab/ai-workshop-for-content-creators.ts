import type { TechlabProgram } from './types';

export const techlabAiWorkshopForContentCreators = {
	slug: 'ai-workshop-for-content-creators',
	route: '/techlab/ai-workshop-for-content-creators',
	sku: 'CM-TR-005',
	title: 'AI Workshop for Tech Writers and Content Creators',
	nickname: 'Seven-week cohort for technical communicators',
	tagline: 'AI-enhanced content workflows that deliver measurable impact in seven weeks.',
	heroImage: '/images/ai-workshop-for-content-creators.jpeg',
	heroImageAlt: 'AI Workshop for Tech Writers and Content Creators illustration',
	ogImage: '/images/cambermast-content-5-ai-workshop-for-content-creators-og.jpeg',
	ogImageAlt:
		'Open graph image for the AI Workshop for Tech Writers and Content Creators training program',
	description:
		'The AI Workshop for Tech Writers and Content Creators is a live, seven-week cohort that helps technical communicators and content teams weave generative AI into their daily production workflows.',
	secondaryDescription:
		'Across weekly 2-hour sessions, participants combine strategy discussions with hands-on practice to automate repetitive tasks, preserve brand voice, and publish higher-impact content faster.',
	primaryCta: {
		label: 'Find a start date',
		url: '/events'
	},
	secondaryCta: {
		label: 'Talk with Bill',
		url: '/contact'
	},
	scheduleTemplate: {
		durationDays: 49,
		hoursPerDayCommitment: 2,
		defaultStartTimeLocal: '10:00',
		defaultTimeZone: 'America/Los_Angeles',
		defaultTimeZoneLabel: 'PT',
		defaultLocationLabel: 'Online'
	},
	stats: [
		{ label: 'Duration', value: 'Seven weeks, 2-hour commitment per week' },
		{ label: 'Format', value: ['🔴 Live online', '🏫 In-person available'] },
		{ label: 'Cost', value: '$1,749 per person (virtual cohort)' },
		{ label: 'Environment', value: '💙 Learn in a supportive, judgment-free environment' },
		{ label: 'Partner', value: 'Presented in partnership with The Content Wrangler' }
	],
	audience: [
		'Technical communication and documentation specialists modernizing their workflows with AI.',
		'Content strategists responsible for aligning deliverables to user journeys and business goals.',
		'Knowledge teams supporting structured and unstructured content across the enterprise.'
	],
	audienceExamples: [
		'Writers translating complex technical concepts for customer-facing channels.',
		'Documentation leads maintaining product, support, and compliance libraries.',
		'Content operations teams coordinating SMEs, editors, and governance stakeholders.'
	],
	objectives: [
		'Automate repetitive content production tasks and accelerate delivery timelines.',
		'Tailor generative AI outputs to match established voice, tone, and terminology.',
		'Connect content decisions to audience journeys, measurable outcomes, and ROI.'
	],
	prerequisites: [
		'Access to a paid account for a foundational LLM such as ChatGPT, Claude, Gemini, or Copilot.',
		'Willingness to experiment with prompts inside existing style guides and compliance guardrails.',
		'A real content initiative to apply across the weekly assignments and final project.'
	],
	takeaways: [
		'Persona-driven workflows that use AI tools to surface gaps and opportunities.',
		'Ready-to-use prompt libraries, custom GPT instructions, and evaluation checklists.',
		'A documented project plan that operationalizes AI-assisted content production.',
		'Digital certificate of completion once the Week 7 project is presented.'
	],
	sessions: [
		{
			name: '❄️ Winter 2025 Open Enrollment',
			date: 'Nov 4 - Dec 30, 2025 (Tuesdays)',
			time: ['10:00 am-12:00 pm PT', '1:00-3:00 pm ET'],
			partner: 'In partnership with The Content Wrangler',
			startDate: '2025-11-04',
			endDate: '2025-12-30',
			location: 'Live on Zoom',
			spots: 'Open enrollment',
			registerUrl: 'https://luma.com/zw3izjni'
		},
		{
			name: '🌷 Spring 2026 Open Enrollment',
			date: 'Jan 27 - Mar 10, 2026 (Tuesdays)',
			time: ['10:00 am-12:00 pm PT', '1:00-3:00 pm ET'],
			partner: 'In partnership with The Content Wrangler',
			startDate: '2026-01-27',
			endDate: '2026-03-10',
			location: 'Live on Zoom',
			spots: 'Open enrollment',
			registerUrl: 'https://luma.com/nvd9y1wn'
		}
	],
	agenda: [
		{
			title: 'Week 1: Adopting the AI Mindset',
			details: [
				'Explore AI foundations for content teams and align on ethical guardrails.',
				'Map quick wins that remove repetitive production work.',
				'Practice prompt basics for clarity, structure, and factual rigor.'
			]
		},
		{
			title: 'Week 2: Mapping Your Audience Journey',
			details: [
				'Build personas and user journeys that guide AI-augmented content.',
				'Align messaging and assets to each audience touchpoint.',
				'Test AI tools that simulate reader questions and expectations.'
			]
		},
		{
			title: 'Week 3: Personalization at Scale',
			details: [
				'Deliver platform-specific versions without sacrificing consistency.',
				'Automate tone, style, and format adjustments with controlled prompts.',
				'Design custom GPT instructions to replicate your brand voice.'
			]
		},
		{
			title: 'Week 4: Accelerating Value Delivery',
			details: [
				'Streamline production workflows and remove bottlenecks.',
				'Run AI-powered content audits to prioritize improvements.',
				'Plan projects and tasks that increase overall content ROI.'
			]
		},
		{
			title: 'Week 5: Deep Content Insights',
			details: [
				'Identify gaps, new opportunities, and research angles with AI.',
				'Develop outlines and drafts for net-new assets.',
				'Define the project you will evolve through Week 7.'
			]
		},
		{
			title: 'Week 6: Data-Driven Prioritization',
			details: [
				'Use customer insights to prioritize content that converts.',
				'Apply advanced prompting techniques to sharpen clarity.',
				'Review progress on your individual or team project.'
			]
		},
		{
			title: 'Week 7: Evolving with AI',
			details: [
				'Present final projects and gather peer plus mentor feedback.',
				'Codify a long-term roadmap for AI-enabled content operations.',
				'Operationalize your workflow and celebrate the cohort completion.'
			]
		}
	],
	resources: [
		'Exclusive discount available through The Content Wrangler newsletter.',
		'Weekly office hours and a discussion thread to share work and questions.',
		'Digital certification recognizing successful course completion.'
	],
	aboutTrainer: {
		title: 'About your trainer',
		name: 'Bill Raymond',
		role: 'Founder, Cambermast LLC',
		photo: '/images/bill.jpg',
		photoAlt: 'Bill Raymond',
		summary:
			'Bill is a technical content strategist and AI practitioner who uses generative tools daily to ship human-centered documentation and learning experiences.',
		highlights: [
			'Author of the Bill Talks AI newsletter.',
			'Founding member of the AI Collective.',
			'NASA award winner and Microsoft MVP.',
			'Host of the Agile in Action podcast with 130+ episodes.'
		]
	},
	faqs: [
		{
			"key": "will_i_receive_a_certificate_of_completion",
			"question": "Will I receive a certificate of completion?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "Yes. Graduates receive a digital certificate after presenting their final project."
				}
			]
		},
		{
			"key": "will_there_be_makeup_dates",
			"question": "Will there be makeup dates?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "There are no official makeup dates, but Bill accommodates reasonable requests when scheduling conflicts arise."
				}
			]
		},
		{
			"key": "do_i_need_anything_before_the_workshop_starts",
			"question": "Do I need anything before the workshop starts?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "Bring access to a paid generative AI account (ChatGPT, Claude, Gemini, Copilot, etc.) and a project where you can apply the lessons."
				}
			]
		},
		{
			"key": "are_the_meetings_virtual_or_in_person",
			"question": "Are the meetings virtual or in-person?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "All cohort sessions are hosted live on Zoom."
				}
			]
		},
		{
			"key": "how_can_i_ask_questions_about_the_course",
			"question": "How can I ask questions about the course?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "Use the \"Contact the Host\" link on the Lu.ma event page or reach out through the Cambermast contact form."
				}
			]
		},
		{
			"key": "will_there_be_exercises_and_take_home_work",
			"question": "Will there be exercises and take-home work?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "Yes. Expect optional take-home exercises and encouragement to apply each lesson directly to your content programs."
				}
			]
		},
		{
			"key": "are_there_scheduled_collaboration_meetings_after_each_class",
			"question": "Are there scheduled collaboration meetings after each class?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "Not formally, but Bill hosts weekly office hours and maintains a discussion thread for ongoing peer support."
				}
			]
		},
		{
			"key": "i_can_t_take_this_course_are_there_others",
			"question": "I can't take this course. Are there others?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "Browse the events calendar at /events and subscribe to the Bill Talks AI newsletter for upcoming offerings."
				}
			]
		},
		{
			"key": "what_are_the_benefits_of_this_course",
			"question": "What are the benefits of this course?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "You will master AI use cases tailored to content creation and gain access to a supportive learning community."
				}
			]
		},
		{
			"key": "what_makes_bill_s_training_unique",
			"question": "What makes Bill's training unique?",
			"blocks": [
				{
					"type": "paragraph",
					"text": "Bill filters out hype, focuses on realistic outcomes, and delivers a fun, professional learning experience that celebrates individual styles."
				}
			]
		}
	]
} satisfies TechlabProgram;
