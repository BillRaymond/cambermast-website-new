export type NewsPostBlock =
	| { type: 'paragraph'; text: string }
	| { type: 'heading'; text: string }
	| { type: 'list'; items: string[] };

export type NewsPost = {
	slug: string;
	title: string;
	date: string; // ISO date string for stable sorting/formatting
	author: string;
	featuredImage: string;
	featuredImageAlt: string;
	excerpt: string;
	tags?: string[];
	readTimeMinutes?: number;
	body: NewsPostBlock[];
};

const isoToTimestamp = (isoDate: string): number => Date.parse(isoDate);

export const NEWS_FEATURED_IMAGE_BASE = '/images';

export const resolveFeaturedImage = (image: string): string => {
	if (!image) return `${NEWS_FEATURED_IMAGE_BASE}/default.jpg`;
	if (image.startsWith('http') || image.startsWith('/')) return image;
	const base = NEWS_FEATURED_IMAGE_BASE.replace(/\/$/, '');
	const sanitized = image.replace(/^\//, '');
	return `${base}/${sanitized}`;
};

export const newsPosts: NewsPost[] = [
	{
		slug: 'ai-adoption-playbook',
		title: 'Inside our AI adoption playbook for 2025 planning',
		date: '2024-12-15',
		author: 'Cambermast Team',
		featuredImage: 'ai-automation.jpg',
		featuredImageAlt: 'Product leader planning an AI automation roadmap with sticky notes',
		excerpt:
			'How we help teams move from pilots to production with a simple 90-day AI adoption loop.',
		tags: ['AI adoption', 'News'],
		readTimeMinutes: 4,
		body: [
			{
				type: 'paragraph',
				text: 'Many teams we work with are planning their 2025 roadmaps and want clarity on how to move from experimentation to responsible production AI. We are sharing the same adoption loop we use internally to de-risk rollouts while keeping momentum high.'
			},
			{
				type: 'heading',
				text: 'What’s inside the loop'
			},
			{
				type: 'list',
				items: [
					'Focused discovery: pick three candidate workflows and define a measurable outcome for each.',
					'Build labs: rapid, hands-on sessions where domain experts and technical leads co-create prompts, automations, and guardrails.',
					'Lightweight governance: a short checklist for privacy, bias review, and model selection before anything reaches production.',
					'Production sprint: a 30-day push to ship one well-defined win with monitoring and human-in-the-loop controls.'
				]
			},
			{
				type: 'paragraph',
				text: 'Teams that follow this loop typically unlock one reliable automation within the first 45 days. From there, we help them prioritize a pipeline of follow-on use cases and hand off playbooks their teams can reuse without us.'
			},
			{
				type: 'heading',
				text: 'Where we are using it'
			},
			{
				type: 'paragraph',
				text: 'We are currently applying this approach with product teams, PMOs, and customer success organizations that need to balance speed with compliance. If you want to see the playbook in action, reach out and we will share a walkthrough tailored to your stack.'
			}
		]
	}
];

export const listNewsPosts = (): NewsPost[] =>
	[...newsPosts].sort((a, b) => isoToTimestamp(b.date) - isoToTimestamp(a.date));

export const getNewsPost = (slug: string): NewsPost | undefined =>
	newsPosts.find((post) => post.slug === slug);
