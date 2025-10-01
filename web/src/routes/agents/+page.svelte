<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import { getTrainingProgram } from '$lib/data/training';
	import type { TrainingProgram } from '$lib/data/training/types';

	const section = catalog.agents;

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

	type EnrichedItem = CatalogItem & {
		duration?: string | string[];
		linkHref?: string;
	};

	const getProgram = (route?: string): TrainingProgram | undefined => {
		if (!route) return undefined;
		const slug = route.split('/').filter(Boolean).pop();
		return slug ? getTrainingProgram(slug) : undefined;
	};

	const withSourceQuery = (route?: string): string | undefined => {
		if (!route) return undefined;
		const separator = route.includes('?') ? '&' : '?';
		return `${route}${separator}via=agents`;
	};

	const items: EnrichedItem[] = ((section.items ?? []) as CatalogItem[])
		.filter((item) => item.published ?? true)
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
		.map((item) => {
			const program = getProgram(item.route);
			const durationStat = program?.stats?.find(
				(stat) => stat.label?.toLowerCase() === 'duration'
			);

			return {
				...item,
				image: item.image ?? program?.heroImage,
				imageAlt: item.imageAlt ?? program?.heroImageAlt ?? item.title,
				duration: durationStat?.value,
				linkHref: withSourceQuery(item.route)
			};
		});
</script>

<h1 class="mb-6 text-3xl font-bold">{section.label}</h1>
<p class="mb-10 text-gray-700">{section.headline}</p>

<section class="mb-12">
	<div class="grid gap-6 md:grid-cols-3">
		{#each items as item}
			<article class="flex h-full flex-col rounded-2xl border bg-white p-6 text-center shadow-sm">
				{#if item.image}
					<img
						src={item.image}
						alt={item.imageAlt ?? item.title}
						class="mb-4 w-full rounded-xl object-cover"
						loading="lazy"
					/>
				{/if}
				<h2 class="text-xl font-semibold">{item.title}</h2>
				{#if item.summary}<p class="mt-2 text-gray-600">{item.summary}</p>{/if}
				{#if item.bullets?.length}
					<ul class="mt-4 space-y-1 text-left text-gray-700">
						{#each item.bullets as bullet}
							<li class="flex items-start gap-2">
								<span class="mt-1 h-1 w-1 rounded-full bg-blue-500"></span>
								<span>{bullet}</span>
							</li>
						{/each}
					</ul>
				{/if}
				{#if item.route}
					{#if item.duration}
						<p class="mt-6 text-sm font-semibold text-gray-700">Duration: {item.duration}</p>
					{/if}
					<a
						href={item.linkHref ?? item.route}
						class={`inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700 ${item.duration ? 'mt-2' : 'mt-6'}`}
					>
						Learn more
					</a>
				{/if}
			</article>
		{/each}
	</div>
</section>

<section class="rounded-2xl border bg-gray-50 p-6">
	<h3 class="text-lg font-semibold">Need help scoping an automation?</h3>
	<p class="mt-2 text-gray-700">
		Tell us what your team wants to streamline, and we'll recommend the fastest path to a working agent.
	</p>
	<a href="/contact" class="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>
