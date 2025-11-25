import type { TechlabProgram } from './types';

export const techlabAiFundamentals = {
	slug: 'ai-fundamentals',
	route: '/techlab/ai-fundamentals',
	sku: 'CM-TR-001',
	title: 'AI Power Prompting',
	nickname: 'Your AI fundamentals • From prompting to productivity',
	tagline: 'A live primer on prompting: learn how AI works and how to prompt successfully.',
	heroImage: '/images/ai-fundamentals.jpeg',
	heroImageAlt: 'AI Power Prompting training workshop illustration',
	ogImage: '/images/cambermast-content-1-ai-fundamentals-ai-power-prompting-og.jpeg',
	ogImageAlt: 'Open graph image for the AI Power Prompting training program',
	description:
		'AI Power Prompting is a four-hour crash course that explains how modern AI systems work and shows you how to craft prompts that consistently deliver results.',
	secondaryDescription:
		'Build confidence through guided demos and exercises with ChatGPT, Copilot, Claude, and Gemini so you know when to reach for each tool and how to collaborate with it.',
	primaryCta: {
		label: 'Schedule your team',
		url: '/contact'
	},
	secondaryCta: {
		label: 'Talk with Bill',
		url: '/contact'
	},
	stats: [
		{ label: 'Duration', value: '4-hours' },
		{ label: 'Format', value: ['🔴 Live online', '🏫 In-person available'] },
		{ label: 'Cost', value: '$349 per person (virtual cohort)' },
		{ label: 'Environment', value: '💙 Learn in a supportive, judgment-free environment' },
		{ label: 'In-person', value: 'Custom pricing for private teams' }
	],
	audience: [
		'People just starting with AI who want a solid foundation.',
		'Professionals who want to feel more confident using AI in daily work.',
		'Curious learners ready to apply AI in practical, hands-on ways.'
	],
	audienceExamples: [
		'Team leads helping non-technical staff adopt AI safely.',
		'Knowledge workers in operations, HR, finance, or customer support.',
		'Consultants and agency pros creating AI-enhanced deliverables.',
		'Product managers and analysts pairing AI with existing workflows.',
		'Educators and L&D leaders building AI literacy programs.'
	],
	objectives: [
		'Understand how modern AI systems process inputs and generate responses.',
		'Learn the four core prompt types to improve every AI interaction.',
		'Collaborate with AI to brainstorm ideas and move work forward faster.'
	],
	prerequisites: [
		'Access to an AI chatbot (ChatGPT recommended; Claude, Gemini, or Copilot also work).',
		'Curiosity and openness to experimentation.',
		'Comfort using a modern web browser.'
	],
	takeaways: [
		'Explain AI clearly to colleagues and clients.',
		'Apply four proven prompt techniques with ready-made templates.',
		'Save hours drafting content and documents.',
		'Jump-start projects with AI-generated plans and ideas.'
	],
	sessions: [
		{
			name: 'Private Team Workshop',
			date: 'You pick the date',
			time: 'Half-day or full-day',
			location: 'On-site or virtual',
			spots: 'Up to 40 participants',
			registerUrl: '/contact'
		}
	],
	agenda: [
		{
			title: '1. AI Fundamentals',
			details: [
				'Explain AI in your own words and align on shared language.',
				'Distinguish how ChatGPT, Copilot, Claude, and Gemini approach tasks.',
				'Outline responsible-use scenarios and ethical guardrails.',
				'Explore chatbot interfaces and capture usability wins.'
			]
		},
		{
			title: '2. Prompting Basics',
			details: [
				'Break down the anatomy of an effective prompt for clarity and context.',
				'Practice the four core prompt types—zero-shot, few-shot, chain-of-thought, and chat.',
				'Rewrite weak prompts and articulate what changed.',
				'Identify and troubleshoot hallucinations.'
			]
		},
		{
			title: '3. Productivity Strategies',
			details: [
				'Draft emails, posts, and documents with AI as your writing partner.',
				'Build project plans with tasks, owners, and deadlines in minutes.',
				'Accelerate research and brainstorming for new initiatives.',
				'Analyze data by asking questions and exporting structured results.'
			]
		},
		{
			title: '4. Creative Uses for AI',
			details: [
				'Beat creative blocks with ideation sprints and story prompts.',
				'Co-develop ideas through conversational refinement.',
				'Personalize tone and style to fit different audiences.'
			]
		},
		{
			title: '5. Advanced Prompting Techniques',
			details: [
				'Design reusable prompt templates for social and marketing assets.',
				'Experiment with Custom GPTs or assistants tailored to your brand.',
				'Format outputs into tables, charts, and files ready to ship.'
			]
		},
		{
			title: '6. The Future of AI & Wrap Up',
			details: [
				'Experiment with multimodal prompting using images and files.',
				'Plan the first projects to apply back at work with measurable goals.',
				'Reflect on the most valuable techniques and share next steps.'
			]
		}
	],
	resources: [
		'Course workbook with prompt templates and examples.',
		'Earn a certificate you can showcase with pride.',
		'A free one-hour follow-up two weeks after the training.'
	],
	reviews: [
		{
			quote:
				'Our marketing squad left the session with a shared language for AI and a repeatable prompting playbook we now use daily.',
			author: 'Jasmine R.',
			role: 'Director of Demand Gen'
		},
		{
			quote:
				'Bill connects strategy to hands-on practice better than any other AI workshop we have brought in.',
			author: 'Miguel A.',
			role: 'VP, Product Operations'
		},
		{
			quote: 'I was able to immediately apply what I learned and saved hours in my first week.',
			author: 'Priya D.',
			role: 'Agency Managing Partner'
		}
	],
	testimonial: {
		quote:
			"Bill guided our leadership team through what's possible with AI while keeping us realistic about the risks.",
		author: 'Elena P., VP of Operations'
	},
	aboutTrainer: {
		title: 'About your trainer',
		name: 'Bill Raymond',
		role: 'Founder, Cambermast LLC',
		photo: '/images/bill.jpg',
		photoAlt: 'Bill Raymond',
		summary:
			'Bill focuses on AI learning and development, project management, and leadership initiatives that help teams adopt new technology responsibly.',
		highlights: [
			'Author of the Bill Talks AI newsletter.',
			'Founding member of the AI Collective.',
			'NASA award winner.',
			'Microsoft MVP.',
			'Host of the Agile in Action podcast with 130+ episodes and 30,000+ listeners.'
		]
	},
	faqs: [
		{
			question: 'How customizable is the agenda?',
			answers: [
				'If you are taking a publicly scheduled course, the agenda is fixed.',
				'For private team workshops, we can adjust the agenda to focus on specific use cases or tools.'
			]
		},
		{
			question: 'Do participants need prior AI experience?',
			answers: [
				'No. The course is designed for beginners through intermediate users, mixing demos with guided exercises.'
			]
		},
		{
			question: 'Can we host the workshop in person?',
			answers: [
				'Yes. On-site sessions include travel in the proposal; virtual cohorts are available worldwide.'
			]
		},
		{
			question: 'Do you have a letter I can send to my manager for budget approval?',
			answers: [
				'Yes! Here’s a customizable letter you can use:\n\nSubject: Request to Attend AI Training\n\nHi [Manager’s Name],\n\nI’d like to attend the upcoming [Workshop Name] with Bill Raymond. Bill is a founding member of the AI Collective (https://www.aicollective.com) and the author of the popular Bill Talks AI newsletter (https://BillTalksAI.com). His work focuses on helping professionals safely and effectively adopt AI, and this program is designed to build practical skills and confidence in everyday use.\n\nThe workshop also includes a certification that validates the skills I’ll be applying in my role. I believe this will benefit both my growth and the value I bring to our team. The cost is [insert cost]. Thank you for considering this request.\n\nHere is a link to the course: [Insert Training Program URL]\n\nBest,\n[Your Name]'
			]
		}
	]
} satisfies TechlabProgram;

export default techlabAiFundamentals;
