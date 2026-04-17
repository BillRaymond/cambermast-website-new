import { SITE_ORIGIN } from '$lib/config/site';
import catalog from '$lib/data/catalog.json';
import { listNewsPosts } from '$lib/data/news';
import { listTechlabPrograms } from '$lib/data/techlab';
import { listTrainingPrograms } from '$lib/data/training';
import { listEventUi } from '$lib/view-models/events';

const origin = SITE_ORIGIN.replace(/\/$/, '');

const staticRoutes = [
	'/',
	'/about',
	'/contact',
	'/agents',
	'/api',
	'/strategy',
	'/training',
	'/events',
	'/events/archive',
	'/training/table',
	'/training/print',
	'/training/terms',
	'/news',
	'/faq',
	'/testimonials',
	'/resources',
	'/resources/ai-coding-prompt-guide',
	'/resources/ai-workshop-code-and-automate-with-ai-setup',
	'/resources/ai-personalization',
	'/resources/ask-me-anything-pricing',
	'/resources/attendee-training-tips',
	'/gdpr',
	'/services/microsoft-project-server',
	'/techlab',
	'/llms.txt',
	'/ai.txt',
	'/api/catalog.json',
	'/api/commerce-products.json',
	'/catalog.json',
	'/api/events.json',
	'/api/training.json',
	'/api/resources.json',
	'/api/default-images.json',
	'/api/redirects.json',
	'/api/faq-presets.json',
	'/api/testimonials.json',
	'/api/tools.json',
	'/api/image-gen-standards.json',
	'/api/enums.json',
	'/api/campaigns.json',
	'/feed/events.xml',
	'/feed/openai-products.jsonl.gz',
	'/feed/resources.xml',
	'/feed/articles.xml',
	'/feed/training-programs.xml'
];

const excludedPrefixes = ['/internal', '/admin', '/forms', '/tools', '/campaigns'];

const shouldExclude = (route: string): boolean =>
	excludedPrefixes.some((prefix) => route === prefix || route.startsWith(`${prefix}/`));

const getCatalogRoutes = (): string[] =>
	Object.values(catalog)
		.flatMap((section: any) => {
			const sectionRoute = typeof section?.route === 'string' ? [section.route] : [];
			const itemRoutes = Array.isArray(section?.items)
				? (section.items as Array<{ route?: string }>)
						.map((item) => item.route)
						.filter((route): route is string => Boolean(route))
				: [];
			return [...sectionRoute, ...itemRoutes];
		})
		.filter(Boolean);

const getTrainingRoutes = (): string[] =>
	listTrainingPrograms().map((program) => program.route ?? `/training/${program.slug}`);
const getTechlabRoutes = (): string[] =>
	listTechlabPrograms().map((program) => program.route ?? `/techlab/${program.slug}`);

const getNewsRoutes = (): string[] => listNewsPosts().map((post) => `/news/${post.slug}`);
const getEventRoutes = (): string[] =>
	listEventUi({ includeDrafts: false, includeUnlisted: false }).map(
		(event) => `/events/${event.slug}`
	);
const uniquePaths = (): string[] => {
	const paths = new Set<string>();
	for (const path of [
		...staticRoutes,
		...getCatalogRoutes(),
		...getTrainingRoutes(),
		...getTechlabRoutes(),
		...getNewsRoutes(),
		...getEventRoutes()
	]) {
		if (!path) continue;
		const normalized = path.startsWith('/') ? path : `/${path}`;
		if (shouldExclude(normalized)) continue;
		paths.add(normalized);
	}
	return Array.from(paths).sort();
};

const buildSitemap = (paths: string[]): string => {
	const urls = paths
		.map((path) => {
			const loc = `${origin}${path}`;
			return `<url><loc>${loc}</loc></url>`;
		})
		.join('');

	return (
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
	);
};

export const prerender = true;

export const GET = () => {
	const body = buildSitemap(uniquePaths());
	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
};
