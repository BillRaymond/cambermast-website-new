import { SITE_ORIGIN } from '$lib/config/site';
import { listNewsPosts } from '$lib/data/news';
import { buildRssFeed, rssResponse, toRssAuthor } from '$lib/server/rss';

export const prerender = true;

const origin = SITE_ORIGIN.replace(/\/$/, '');

export const GET = () => {
	const items = listNewsPosts()
		.slice(0, 25)
		.map((post) => ({
			title: post.title,
			link: `${origin}/news/${post.slug}`,
			description: post.excerpt,
			pubDate: post.date,
			guid: `${origin}/news/${post.slug}`,
			author: toRssAuthor(post.author),
			categories: post.tags ?? []
		}));

	return rssResponse(
		buildRssFeed({
			title: 'Cambermast Articles',
			link: `${origin}/news`,
			description: 'Cambermast long-form articles, news, and thought leadership content.',
			selfUrl: `${origin}/feed/articles.xml`,
			items
		})
	);
};
