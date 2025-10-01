<script>
	import catalog from '$lib/data/catalog.json';
	const section = catalog.agents;

	// Title for the page and services we offer from JSON
	const items = (section.items ?? [])
		.filter((i) => i.published ?? true)
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
</script>

<h1 class="mb-6 text-3xl font-bold">{section.label}</h1>
<p class="mb-10 text-gray-700">{section.headline}</p>

<section class="mb-12">
	<div class="grid gap-6 md:grid-cols-2">
		{#each items as i}
			<article class="flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm">
				<h2 class="text-xl font-semibold">{i.title}</h2>
				{#if i.summary}<p class="mt-2 text-gray-600">{i.summary}</p>{/if}
				{#if i.bullets?.length}
					<ul class="mt-4 list-disc space-y-1 pl-5 text-gray-700">
						{#each i.bullets as b}<li>{b}</li>{/each}
					</ul>
				{/if}
				{#if i.route}
					<a
						href={i.route}
						class="mt-6 inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
					>
						Learn more
					</a>
				{/if}
			</article>
		{/each}
	</div>
</section>

<section class="rounded-2xl border bg-gray-50 p-6">
	<h3 class="text-lg font-semibold">Not sure where to start?</h3>
	<p class="mt-2 text-gray-700">
		Share the manual task that wastes the most time—we’ll suggest a small pilot to automate it.
	</p>
	<a href="/contact" class="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>
