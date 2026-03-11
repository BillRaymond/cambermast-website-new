import { SITE_ORIGIN } from '$lib/config/site';
import { isEventUpcoming, listEvents } from '$lib/data/events';
import { buildRssFeed, rssResponse, toRssAuthor } from '$lib/server/rss';

export const prerender = true;

const origin = SITE_ORIGIN.replace(/\/$/, '');

export const GET = () => {
	const items = listEvents()
		.filter((event) => event.visibility === 'public')
		.filter((event) => event.type === 'training_session')
		.filter((event) => isEventUpcoming(event))
		.sort((a, b) => new Date(a.startAtUtc).valueOf() - new Date(b.startAtUtc).valueOf())
		.slice(0, 25)
		.map((event) => ({
			title: event.title,
			link: `${origin}/events/${event.slug}`,
			description: event.summary,
			pubDate: event.startAtUtc,
			guid: `${origin}/events/${event.slug}`,
			author: toRssAuthor(event.speakers?.[0]?.name ?? 'Bill Raymond'),
			categories: ['training']
		}));

	return rssResponse(
		buildRssFeed({
			title: 'Cambermast Training Events',
			link: `${origin}/events`,
			description: 'Upcoming Cambermast training events and cohorts.',
			selfUrl: `${origin}/feed/events.xml`,
			items
		})
	);
};
