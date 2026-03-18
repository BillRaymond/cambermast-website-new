import { SITE_ORIGIN } from '$lib/config/site';
import { isEventUpcoming, listEvents } from '$lib/data/events';
import { buildRssFeed, rssResponse, toRssAuthor } from '$lib/server/rss';

const origin = SITE_ORIGIN.replace(/\/$/, '');

export const buildEventsFeedResponse = (selfPath = '/feed/events.xml'): Response => {
	const items = listEvents()
		.filter((event) => event.visibility === 'public')
		.filter((event) => isEventUpcoming(event))
		.sort((a, b) => new Date(a.startAtUtc).valueOf() - new Date(b.startAtUtc).valueOf())
		.slice(0, 25)
		.map((event) => ({
			title: event.title,
			link: `${origin}/events/${event.slug}`,
			description: event.summary,
			pubDate: event.startAtUtc,
			guid: `${origin}/events/${event.slug}`,
			author: toRssAuthor(event.speakers?.[0]?.name ?? 'Cambermast LLC'),
			categories: [event.typeLabel || event.type]
		}));

	return rssResponse(
		buildRssFeed({
			title: 'Cambermast Calendar of Events',
			link: `${origin}/events`,
			description: 'Upcoming Cambermast training cohorts, workshops, and speaking events.',
			selfUrl: `${origin}${selfPath}`,
			items
		})
	);
};
