import { SITE_ORIGIN } from '$lib/config/site';
import { listTrainingPrograms } from '$lib/data/training';
import { buildRssFeed, rssResponse, toRssAuthor } from '$lib/server/rss';

const origin = SITE_ORIGIN.replace(/\/$/, '');

export const buildTrainingProgramsFeedXml = (selfPath: string = '/feed/training-programs.xml') => {
	const items = listTrainingPrograms()
		.filter((program) => Boolean(program.publishedAt))
		.sort((a, b) => new Date(b.publishedAt ?? '').valueOf() - new Date(a.publishedAt ?? '').valueOf())
		.slice(0, 25)
		.map((program) => ({
			title: program.title,
			link: `${origin}${program.route}`,
			description: program.description,
			pubDate: program.publishedAt ?? new Date().toISOString(),
			guid: `${origin}${program.route}`,
			author: toRssAuthor(
				program.aboutTrainer?.name ?? program.eventDefaults?.hosts?.[0]?.name ?? 'Cambermast LLC'
			),
			categories: ['training-program']
		}));

	return buildRssFeed({
		title: 'Cambermast Training Programs',
		link: `${origin}/training`,
		description: 'Published Cambermast training programs and workshop catalog updates.',
		selfUrl: `${origin}${selfPath}`,
		items
	});
};

export const buildTrainingProgramsFeedResponse = (selfPath?: string): Response =>
	rssResponse(buildTrainingProgramsFeedXml(selfPath));
