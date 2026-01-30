<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import { getTrainingProgram } from '$lib/data/training';
	import type { TrainingProgram, TrainingSession } from '$lib/data/training/types';
	import CatalogCard from '$lib/components/training/CatalogCard.svelte';
	import type { CatalogCardData } from '$lib/components/training/catalog-card-data';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getProgramCertificateText } from '$lib/data/training/program-meta';
import {
	hasExternalRegistration,
	isSessionDraft,
	isSessionHappeningNow,
	isSessionUpcoming,
	getSessionStartTimestamp,
	normalizeToday
} from '$lib/data/training/session-utils';

	const section = catalog.training;
	const pageHeading = section.catalogLabel ?? section.label;
	const scheduleLabel = 'Schedule your team';

	const getProgramForRoute = (route?: string): TrainingProgram | undefined => {
		if (!route) return undefined;
		const slug = route.split('/').filter(Boolean).pop();
		return slug ? getTrainingProgram(slug) : undefined;
	};

	const getScheduleUrl = (program?: TrainingProgram): string => program?.secondaryCta?.url ?? '/contact';

const today = normalizeToday();

const getVisibleSessions = (program?: TrainingProgram): TrainingSession[] =>
	(program?.sessions ?? []).filter((session) => !isSessionDraft(session));

const gatherUpcomingSessions = (program?: TrainingProgram): TrainingSession[] =>
	getVisibleSessions(program).filter(
		(session) =>
			session.startDate &&
			hasExternalRegistration(session) &&
			isSessionUpcoming(session, today) &&
			!isSessionHappeningNow(session, today)
	);

const gatherHappeningSessions = (program?: TrainingProgram): TrainingSession[] =>
	getVisibleSessions(program).filter((session) =>
		session.startDate ? isSessionHappeningNow(session, today) : false
	);

const getSessionSortKey = (
	item: CatalogCardData
): { priority: number; timestamp?: number } => {
	if (item.upcomingSessions?.length) {
		return {
			priority: 0,
			timestamp: Math.min(...item.upcomingSessions.map(getSessionStartTimestamp))
		};
	}
	if (item.happeningSessions?.length) {
		return { priority: 1, timestamp: today.getTime() };
	}
	return { priority: 2 };
};

	// Title for the page and services we offer from JSON
	const items: CatalogCardData[] = (section.items ?? [])
		.filter((i) => i.published ?? true)
		.map((item) => {
			const program = getProgramForRoute(item.route);
			const durationStat = program?.stats?.find((stat) => stat.label?.toLowerCase() === 'duration');
			const upcomingSessions = gatherUpcomingSessions(program);
			const happeningSessions = gatherHappeningSessions(program);

				return {
					...item,
					sku: program?.sku,
					duration: durationStat?.value,
					videoUrl: program?.videoUrl,
					certificateText: getProgramCertificateText(program),
					upcomingSessions,
					happeningSessions,
					scheduleUrl: getScheduleUrl(program),
					scheduleLabel
				};
		})
		.sort((a, b) => {
			const aKey = getSessionSortKey(a);
			const bKey = getSessionSortKey(b);
			if (aKey.priority !== bKey.priority) return aKey.priority - bKey.priority;
			if (aKey.timestamp !== undefined && bKey.timestamp !== undefined) {
				if (aKey.timestamp !== bKey.timestamp) return aKey.timestamp - bKey.timestamp;
			} else if (aKey.timestamp !== undefined) {
				return -1;
			} else if (bKey.timestamp !== undefined) {
				return 1;
			}
			return (a.title ?? '').localeCompare(b.title ?? '', 'en', { sensitivity: 'base' });
		});

	const pageMeta = getSeo('/training');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/training" />

<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-3xl font-bold">{pageHeading}</h1>
	<a
		href="/training/table"
		class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
	>
		View the table layout
	</a>
</div>
<p class="mb-5 text-gray-700">{section.headline}</p>

<section class="mb-12">
		<div class="grid gap-5">
			{#each items as item (item.route ?? item.title)}
				<CatalogCard
					item={item}
					scheduleTeamLabel={scheduleLabel}
					showBullets={true}
					showDuration={false}
					layout="row"
				/>
			{/each}
		</div>
</section>



<section class="rounded-2xl border bg-gray-50 p-5">
	<h3 class="text-lg font-semibold">Not sure where to start?</h3>
	<p class="mt-1.5 text-gray-700">
		Tell us your team’s goals and constraints, and we’ll recommend a path that gets results quickly.
	</p>
	<a href="/contact" class="mt-3 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>
