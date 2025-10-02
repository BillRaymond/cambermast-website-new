<script>
	import catalog from '$lib/data/catalog.json';
	import { getTrainingProgram } from '$lib/data/training';

	const section = catalog.training;

	const getDurationForRoute = (route) => {
		if (!route) return undefined;
		const slug = route.split('/').filter(Boolean).pop();
		if (!slug) return undefined;
		const program = getTrainingProgram(slug);
		const durationStat = program?.stats?.find((stat) => stat.label.toLowerCase() === 'duration');
		return durationStat?.value;
	};

	// Title for the page and services we offer from JSON
	const items = (section.items ?? [])
		.filter((i) => i.published ?? true)
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
		.map((item) => ({ ...item, duration: getDurationForRoute(item.route) }));
</script>

<h1 class="mb-5 text-3xl font-bold">{section.label}</h1>
<p class="mb-8 text-gray-700">{section.headline}</p>

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
					{#if i.summary}<p class="mt-1.5 text-gray-600">{i.summary}</p>{/if}
					{#if i.bullets?.length}
						<ul class="mt-3 list-disc space-y-1.5 pl-5 text-left text-gray-700 marker:text-blue-500">
							{#each i.bullets as b}<li>{b}</li>{/each}
						</ul>
					{/if}
						{#if i.route}
							<div class="mt-auto flex flex-col items-center gap-2 pt-5">
							{#if i.duration}
								<p class="text-sm font-semibold text-gray-700">Duration: {i.duration}</p>
							{/if}
							<a
								href={i.route}
								class="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
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
