type RssItem = {
	title: string;
	link: string;
	description: string;
	pubDate: string;
	guid?: string;
	author?: string;
	categories?: string[];
};

type RssChannel = {
	title: string;
	link: string;
	description: string;
	selfUrl: string;
	items: RssItem[];
	lastBuildDate?: string;
};

const escapeXml = (value: string): string =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

const toRfc2822 = (value: string): string => {
	const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value;
	return new Date(normalized).toUTCString();
};

const renderItem = (item: RssItem): string => {
	const categories = (item.categories ?? [])
		.filter(Boolean)
		.map((category) => `<category>${escapeXml(category)}</category>`)
		.join('');

	return [
		'<item>',
		`<title>${escapeXml(item.title)}</title>`,
		`<link>${escapeXml(item.link)}</link>`,
		`<description>${escapeXml(item.description)}</description>`,
		`<pubDate>${escapeXml(toRfc2822(item.pubDate))}</pubDate>`,
		`<guid isPermaLink="true">${escapeXml(item.guid ?? item.link)}</guid>`,
		item.author ? `<author>${escapeXml(item.author)}</author>` : '',
		categories,
		'</item>'
	]
		.filter(Boolean)
		.join('');
};

export const buildRssFeed = (channel: RssChannel): string => {
	const newestPubDate =
		channel.lastBuildDate ??
		channel.items.reduce<string | undefined>((latest, item) => {
			if (!latest) return item.pubDate;
			return new Date(item.pubDate).valueOf() > new Date(latest).valueOf() ? item.pubDate : latest;
		}, channel.items[0]?.pubDate);

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		'<channel>',
		`<title>${escapeXml(channel.title)}</title>`,
		`<link>${escapeXml(channel.link)}</link>`,
		`<description>${escapeXml(channel.description)}</description>`,
		newestPubDate ? `<lastBuildDate>${escapeXml(toRfc2822(newestPubDate))}</lastBuildDate>` : '',
		`<atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="application/rss+xml" />`,
		...channel.items.map(renderItem),
		'</channel>',
		'</rss>'
	].join('');
};

export const toRssAuthor = (name: string): string => `bill.raymond@cambermast.com (${name})`;

export const rssResponse = (body: string): Response =>
	new Response(body, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8'
		}
	});
