import { SITE_ORIGIN } from '$lib/config/site';
import catalog from '$lib/data/catalog.json';
import { listEvents } from '$lib/data/events';
import { listNewsPosts } from '$lib/data/news';
import { listTrainingPrograms } from '$lib/data/training';

const origin = SITE_ORIGIN.replace(/\/$/, '');

const staticRoutes = [
	'/',
	'/about',
	'/contact',
	'/agents',
	'/strategy',
	'/training',
	'/training/calendar',
	'/training/table',
	'/training/print',
	'/training/terms',
	'/events',
	'/news',
	'/faq',
	'/testimonials',
	'/resources',
	'/resources/ai-personalization',
	'/resources/attendee-training-tips',
	'/gdpr',
	'/services/microsoft-project-server'
];

const excludedPrefixes = ['/internal', '/forms', '/tools', '/campaigns', '/techlab'];

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

const getNewsRoutes = (): string[] => listNewsPosts().map((post) => `/news/${post.slug}`);
const getEventRoutes = (): string[] =>
	listEvents().map((event) => `/events/${event.slug}`);

const uniquePaths = (): string[] => {
	const paths = new Set<string>();
	for (const path of [
		...staticRoutes,
		...getCatalogRoutes(),
		...getTrainingRoutes(),
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

	return `<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
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
