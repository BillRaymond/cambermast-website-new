<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	const items = catalog.training;
</script>

<h1 class="mb-6 text-3xl font-bold">AI Training</h1>
<p class="mb-10 text-gray-700">
	Hands-on training to build practical skills your team can apply immediately.
</p>

<div class="grid gap-6 md:grid-cols-3">
	{#each items as i}
		<article class="rounded-2xl border bg-white p-6 shadow-sm">
			<h3 class="text-xl font-semibold">{i.title}</h3>
			<p class="mt-2 text-gray-600">{i.summary}</p>
			<ul class="mt-4 list-disc space-y-1 pl-5 text-gray-700">
				{#each i.bullets as b}<li>{b}</li>{/each}
			</ul>
		</article>
	{/each}
</div>

<section class="mt-12 rounded-2xl border bg-gray-50 p-6">
	<h3 class="text-lg font-semibold">Not sure where to start?</h3>
	<p class="mt-2 text-gray-700">
		Tell us your team’s goals and constraints—we’ll recommend a path that gets results quickly.
	</p>
	<a href="/contact" class="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>
