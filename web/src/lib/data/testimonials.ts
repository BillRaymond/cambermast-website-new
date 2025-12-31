/**
 * Central testimonial registry.
 *
 * Workflows (like n8n) can regenerate this module when approved testimonials arrive.
 * Each entry ties back to a training SKU so both the public training pages and
 * TechLAB pages can render the same quotes without hitting an API.
 */

export type Testimonial = {
	id: string;
	programSku: string;
	programSlug: string;
	programRoute: string;
	displayName: string;
	jobTitle?: string;
	company?: string;
	rating: number;
	quote: string;
	allowPublicUse: boolean;
	featured?: boolean;
	source?: 'form' | 'manual' | 'import';
	createdAt: string;
};

export const testimonials: Testimonial[] = [
	{
		id: 'tm-cm-tr-001-001',
		programSku: 'CM-TR-001',
		programSlug: 'ai-fundamentals',
		programRoute: '/training/ai-fundamentals',
		displayName: 'Jasmine R.',
		jobTitle: 'Director of Demand Gen',
		rating: 5,
		quote:
			'Our marketing squad left the session with a shared language for AI and a repeatable prompting playbook we now use daily.',
		allowPublicUse: true,
		source: 'manual',
		createdAt: '2024-01-05'
	},
	{
		id: 'tm-cm-tr-001-002',
		programSku: 'CM-TR-001',
		programSlug: 'ai-fundamentals',
		programRoute: '/training/ai-fundamentals',
		displayName: 'Miguel A.',
		jobTitle: 'VP, Product Operations',
		rating: 5,
		quote:
			'Bill connects strategy to hands-on practice better than any other AI workshop we have brought in.',
		allowPublicUse: true,
		source: 'manual',
		createdAt: '2024-01-18'
	},
	{
		id: 'tm-cm-tr-001-003',
		programSku: 'CM-TR-001',
		programSlug: 'ai-fundamentals',
		programRoute: '/training/ai-fundamentals',
		displayName: 'Priya D.',
		jobTitle: 'Agency Managing Partner',
		rating: 5,
		quote: 'I was able to immediately apply what I learned and saved hours in my first week.',
		allowPublicUse: true,
		source: 'manual',
		createdAt: '2024-01-25'
	},
	{
		id: 'tm-cm-tr-002-001',
		programSku: 'CM-TR-002',
		programSlug: 'ai-accelerator-workshop',
		programRoute: '/training/ai-accelerator-workshop',
		displayName: 'Leslie K.',
		jobTitle: 'Director of Marketing',
		rating: 5,
		quote: 'We ramped new team members on AI in a single week and now ship campaigns faster than ever.',
		allowPublicUse: true,
		source: 'manual',
		createdAt: '2024-02-10'
	},
	{
		id: 'tm-cm-tr-002-002',
		programSku: 'CM-TR-002',
		programSlug: 'ai-accelerator-workshop',
		programRoute: '/training/ai-accelerator-workshop',
		displayName: 'Jordan H.',
		jobTitle: 'Head of Customer Operations',
		rating: 5,
		quote: 'The accelerator gave us the systems to keep AI projects organized and compliant.',
		allowPublicUse: true,
		source: 'manual',
		createdAt: '2024-02-18'
	},
	{
		id: 'tm-cm-tr-002-003',
		programSku: 'CM-TR-002',
		programSlug: 'ai-accelerator-workshop',
		programRoute: '/training/ai-accelerator-workshop',
		displayName: 'Bill R.',
		jobTitle: 'Director of Enablement',
		company: 'Northwind Robotics',
		rating: 5,
		quote:
			'The accelerator gave our go-to-market team a shared AI language and weekly labs that translated straight into reusable workflows. We left with templates that saved us hours the following sprint.',
		allowPublicUse: true,
		source: 'import',
		createdAt: '2025-12-31T00:40:59.882Z'
	},
	{
		id: 'tm-cm-tr-002-004',
		programSku: 'CM-TR-002',
		programSlug: 'ai-accelerator-workshop',
		programRoute: '/training/ai-accelerator-workshop',
		displayName: 'Bill R.',
		jobTitle: 'Director of Enablement',
		company: 'Northwind Robotics',
		rating: 5,
		quote:
			'The accelerator gave our go-to-market team a shared AI language and weekly labs that translated straight into reusable workflows. We left with templates that saved us hours the following sprint.',
		allowPublicUse: true,
		source: 'import',
		createdAt: '2025-12-31T01:20:35.910Z'
	},
	{
		id: 'tm-cm-tr-004-001',
		programSku: 'CM-TR-004',
		programSlug: 'ai-automation-with-agents',
		programRoute: '/training/ai-automation-with-agents',
		displayName: 'Alex G.',
		jobTitle: 'Director of Automation',
		rating: 5,
		quote:
			'We launched an intake bot that now triages 80% of partner requests before a human touches them.',
		allowPublicUse: true,
		source: 'manual',
		createdAt: '2024-03-04'
	},
	{
		id: 'tm-cm-tr-004-002',
		programSku: 'CM-TR-004',
		programSlug: 'ai-automation-with-agents',
		programRoute: '/training/ai-automation-with-agents',
		displayName: 'Morgan T.',
		jobTitle: 'Lead Solutions Engineer',
		rating: 5,
		quote:
			'The workshop demystified n8n for our engineers and gave us the guardrails we needed to ship safely.',
		allowPublicUse: true,
		source: 'manual',
		createdAt: '2024-03-12'
	},
	{
		id: 'tm-cm-tr-draft-001-001',
		programSku: 'CM-TR-DRAFT-001',
		programSlug: 'ai-power-prompting-draft',
		programRoute: '/training/ai-power-prompting-draft',
		displayName: 'Cambermast Reviewer',
		rating: 5,
		quote: 'Placeholder: replace with real testimonial before launch.',
		allowPublicUse: false,
		source: 'manual',
		createdAt: '2024-04-01'
	}
];

export const listTestimonials = (): Testimonial[] => [...testimonials];

export const listTestimonialsForSku = (sku?: string): Testimonial[] =>
	sku ? testimonials.filter((testimonial) => testimonial.programSku === sku) : [];

export const listTestimonialsForSlug = (slug?: string): Testimonial[] =>
	slug ? testimonials.filter((testimonial) => testimonial.programSlug === slug) : [];
