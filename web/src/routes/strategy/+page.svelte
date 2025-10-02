<script>
	import catalog from '$lib/data/catalog.json';
	const section = catalog.strategy;

	// Title for the page and services we offer from JSON
	const items = (section.items ?? [])
		.filter((i) => i.published ?? true)
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
</script>

<h1 class="mb-5 text-3xl font-bold">{section.label}</h1>
<p class="mb-8 text-gray-700">{section.headline}</p>

<section class="mb-12">
	<div class="grid gap-5 md:grid-cols-2">
		{#each items as i}
			<article class="rounded-2xl border bg-white p-5 shadow-sm">
				<h2 class="text-xl font-semibold">{i.title}</h2>
				{#if i.summary}<p class="mt-1.5 text-gray-600">{i.summary}</p>{/if}
				{#if i.bullets?.length}
					<ul class="mt-3 list-disc space-y-1.5 pl-5 text-gray-700">
						{#each i.bullets as b}<li>{b}</li>{/each}
					</ul>
				{/if}
			</article>
		{/each}
	</div>
</section>

<section class="rounded-2xl border bg-gray-50 p-5">
	<h3 class="text-lg font-semibold">Not sure where to start?</h3>
	<p class="mt-1.5 text-gray-700">
		Tell us your goals and constraints—we’ll recommend the smallest move that proves value.
	</p>
	<a href="/contact" class="mt-3 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>
