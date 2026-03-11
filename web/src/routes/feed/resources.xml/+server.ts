import { SITE_ORIGIN } from '$lib/config/site';
import { listResources } from '$lib/data/resources';
import { buildRssFeed, rssResponse, toRssAuthor } from '$lib/server/rss';

export const prerender = true;

const origin = SITE_ORIGIN.replace(/\/$/, '');

export const GET = () => {
	const items = listResources()
		.slice(0, 25)
		.map((resource) => ({
			title: resource.title,
			link: `${origin}${resource.route}`,
			description: resource.summary,
			pubDate: resource.publishedAt,
			guid: `${origin}${resource.route}`,
			author: toRssAuthor(resource.author ?? 'Cambermast LLC'),
			categories: [resource.category]
		}));

	return rssResponse(
		buildRssFeed({
			title: 'Cambermast Resources',
			link: `${origin}/resources`,
			description: 'Educational resources and preparation guides from Cambermast.',
			selfUrl: `${origin}/feed/resources.xml`,
			items
		})
	);
};
