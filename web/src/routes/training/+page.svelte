<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import { getTrainingProgram } from '$lib/data/training';
	import type { TrainingProgram, TrainingSession } from '$lib/data/training/types';

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
	const items = (section.items ?? [])
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
			{#each items as i}
				<article class="flex h-full flex-col rounded-2xl border bg-white p-5 text-center shadow-sm">
					{#if i.image}
						<img
							src={i.image}
							alt={i.imageAlt ?? i.title}
							class="mb-3 w-full rounded-xl object-cover"
							loading="lazy"
						/>
					{/if}
					<h2 class="text-xl font-semibold">{i.title}</h2>
					{#if i.sku}
						<p class="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
							({i.sku})
						</p>
					{/if}
					{#if i.summary}<p class="mt-1.5 text-gray-600">{i.summary}</p>{/if}
					{#if i.bullets?.length}
						<ul class="bullet-list mt-3 space-y-1.5 text-left text-gray-700">
							{#each i.bullets as b}<li>{b}</li>{/each}
						</ul>
					{/if}
				{#if i.route}
					<div class="mt-auto flex w-full flex-col items-center gap-3 pt-5">
						{#if i.duration}
							<p class="text-sm font-semibold text-gray-700">Duration: {i.duration}</p>
						{/if}
						{#if i.upcomingSessions?.length}
							<div class="w-full rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
								<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Upcoming sessions</p>
								<ul class="mt-3 space-y-3">
									{#each i.upcomingSessions as session (session.registerUrl + session.date)}
										<li class="rounded-lg border border-white/60 bg-white/80 p-3">
											<p class="text-sm font-semibold text-gray-900">{session.name}</p>
											<p class="text-xs text-gray-600">{session.date}</p>
											<p class="text-xs text-gray-600">{session.time}</p>
											<a
												href={session.registerUrl}
												class="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
											>
												Register
											</a>
										</li>
									{/each}
								</ul>
							</div>
						{:else}
						<a
							href={i.scheduleUrl}
							class="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
							class:schedule-team-button={i.scheduleLabel === scheduleLabel}
						>
							{i.scheduleLabel}
						</a>
						{/if}
						<a
							href={i.route}
							class="inline-flex w-full justify-center rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-700 transition hover:border-blue-500 hover:text-blue-900"
						>
							Learn more
						</a>
					</div>
				{/if}
				</article>
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
