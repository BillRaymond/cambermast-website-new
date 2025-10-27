<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import { getTrainingProgram } from '$lib/data/training';
	import type { TrainingProgram, TrainingSession } from '$lib/data/training/types';
	import CatalogCard from '$lib/components/training/CatalogCard.svelte';
	import type { CatalogCardData } from '$lib/components/training/catalog-card-data';

	const section = catalog.training;
	const pageHeading = section.catalogLabel ?? section.label;
	const scheduleLabel = 'Schedule your team';

	const getProgramForRoute = (route?: string): TrainingProgram | undefined => {
		if (!route) return undefined;
		const slug = route.split('/').filter(Boolean).pop();
		return slug ? getTrainingProgram(slug) : undefined;
	};

	const isExternalUrl = (url?: string): boolean => /^https?:\/\//i.test(url ?? '');

	const getScheduleUrl = (program?: TrainingProgram): string => program?.secondaryCta?.url ?? '/contact';

	const gatherUpcomingSessions = (program?: TrainingProgram): TrainingSession[] =>
		(program?.sessions ?? []).filter((session) => isExternalUrl(session.registerUrl));

	// Title for the page and services we offer from JSON
	const items: CatalogCardData[] = (section.items ?? [])
		.filter((i) => i.published ?? true)
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
		.map((item) => {
			const program = getProgramForRoute(item.route);
			const durationStat = program?.stats?.find((stat) => stat.label.toLowerCase() === 'duration');
			const upcomingSessions = gatherUpcomingSessions(program);

			return {
				...item,
				sku: program?.sku,
				duration: durationStat?.value,
				upcomingSessions,
				scheduleUrl: getScheduleUrl(program),
				scheduleLabel
			};
		});
</script>

<h1 class="mb-5 text-3xl font-bold">{pageHeading}</h1>
<p class="mb-8 text-gray-700">{section.headline}</p>
<div class="mb-8 text-sm text-gray-600">
	Prefer a quick reference?{' '}
	<a
		href="/training/table"
		class="font-semibold text-blue-600 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-700"
	>
		View the table layout
	</a>.
</div>

<section class="mb-12">
		<div class="grid gap-5 md:grid-cols-3">
			{#each items as item (item.route ?? item.title)}
				<CatalogCard item={item} scheduleTeamLabel={scheduleLabel} />
			{/each}
		</div>
	</section>

<section class="rounded-2xl border bg-gray-50 p-5">
	<h3 class="text-lg font-semibold">Not sure where to start?</h3>
	<p class="mt-1.5 text-gray-700">
		Tell us your team’s goals and constraints—we’ll recommend a path that gets results quickly.
	</p>
	<a href="/contact" class="mt-3 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>
