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
		normalizeToday
	} from '$lib/data/training/session-utils';

	const section = catalog.agents;
	const scheduleTeamLabel = 'Schedule your team';
	const normalizeLabel = (label?: string): string | undefined => label?.toLowerCase().trim();
	const isScheduleTeamLabel = (label?: string): boolean =>
		normalizeLabel(label) === normalizeLabel(scheduleTeamLabel);

	type CatalogItem = {
		title: string;
		route?: string;
		order?: number;
		published?: boolean;
		summary?: string;
		bullets?: string[];
		image?: string;
		imageAlt?: string;
	};

	const getProgram = (route?: string): TrainingProgram | undefined => {
		if (!route) return undefined;
		const slug = route.split('/').filter(Boolean).pop();
		return slug ? getTrainingProgram(slug) : undefined;
	};

	const today = normalizeToday();
	const now = new Date();
	const getVisibleSessions = (program?: TrainingProgram): TrainingSession[] =>
		(program?.sessions ?? []).filter((session) => !isSessionDraft(session));
	const gatherUpcomingSessions = (program?: TrainingProgram): TrainingSession[] =>
		getVisibleSessions(program).filter(
			(session) =>
				session.startDate &&
				hasExternalRegistration(session) &&
				isSessionUpcoming(session, today) &&
				!isSessionHappeningNow(session, now)
		);
	const gatherHappeningSessions = (program?: TrainingProgram): TrainingSession[] =>
		getVisibleSessions(program).filter((session) =>
			session.startDate ? isSessionHappeningNow(session, now) : false
		);

	const withSourceQuery = (route?: string): string | undefined => {
		if (!route) return undefined;
		const separator = route.includes('?') ? '&' : '?';
		return `${route}${separator}via=agents`;
	};

	const items: (CatalogCardData & {
		primaryCtaUrl?: string;
		primaryCtaLabel?: string;
	})[] = ((section.items ?? []) as CatalogItem[])
		.filter((item) => item.published ?? true)
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
		.map((item) => {
			const program = getProgram(item.route);
			const durationStat = program?.stats?.find((stat) => stat.label?.toLowerCase() === 'duration');
			const upcomingSessions = gatherUpcomingSessions(program);
			const happeningSessions = gatherHappeningSessions(program);

			return {
				...item,
				image: item.image ?? program?.heroImage,
				imageAlt: item.imageAlt ?? program?.heroImageAlt ?? item.title,
				duration: durationStat?.value,
				videoUrl: program?.videoUrl,
				certificateText: getProgramCertificateText(program),
				route: withSourceQuery(item.route) ?? item.route,
				sku: program?.sku,
				upcomingSessions,
				happeningSessions,
				scheduleUrl: program?.secondaryCta?.url ?? '/contact',
				scheduleLabel: scheduleTeamLabel,
				primaryCtaUrl: program?.primaryCta?.url,
				primaryCtaLabel: program?.primaryCta?.label
			};
		});

	const primaryBooking = items.find((item) => item.primaryCtaUrl);

	const pageMeta = getSeo('/agents');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/agents" />

<h1 class="mb-5 text-3xl font-bold">{section.label}</h1>
<p class="mb-8 text-gray-700">{section.headline}</p>

<section class="mb-12">
	<div class="grid gap-5">
		{#each items as item (item.route ?? item.title)}
			<CatalogCard
				{item}
				{scheduleTeamLabel}
				showBullets={true}
				showDuration={false}
				layout="row"
			/>
		{/each}
	</div>
</section>

<section class="mb-20 rounded-2xl border bg-gray-50 p-5 md:mb-0">
	<h3 class="text-lg font-semibold">Need help scoping an automation?</h3>
	<p class="mt-1.5 text-gray-700">
		Tell us what your team wants to streamline, and we'll recommend the fastest path to a working
		agent.
	</p>
	<a href="/contact" class="mt-3 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>

{#if primaryBooking?.primaryCtaUrl}
	<div class="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-4 md:hidden">
		<a
			href={primaryBooking.primaryCtaUrl}
			class="pointer-events-auto flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
			class:schedule-team-button={isScheduleTeamLabel(primaryBooking?.primaryCtaLabel)}
		>
			{primaryBooking.primaryCtaLabel ?? scheduleTeamLabel}
		</a>
	</div>
{/if}
