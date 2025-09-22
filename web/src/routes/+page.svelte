<script>
	// Note: catalog is imported here to ensure it's included in the build,
	import catalog from '$lib/data/catalog.json';
	// This is for the footer copyright year
	const year = new Date().getFullYear();

	// Build the list of sections purely from { label, headline }
	// Skip any non-section keys like "home" if you add one.
	const sections = Object.entries(catalog)
		.filter(([slug, sec]) => slug !== 'home' && sec?.label && sec?.headline)
		.map(([slug, sec]) => ({ slug, ...sec }));
</script>

<!-- Full-bleed hero (escapes the layout's container) -->
<section class="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
	<div class="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>

	<div class="relative mx-auto max-w-7xl px-6 py-20 text-center">
		<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
			AI training & consulting for teams
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
			Practical workshops, advisory, and automations that ship fast—and stay maintainable.
		</p>

		<div class="mt-8 flex items-center justify-center gap-3">
			<a
				href="/contact"
				class="inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
			>
				Book a call
			</a>
		</div>
	</div>
</section>

<!-- Cards rendered from JSON (label + headline only) -->
<section class="mt-12 grid gap-6 md:grid-cols-3">
	{#each sections as s}
		<article class="rounded-2xl border bg-white p-6 shadow-sm">
			<h3 class="text-xl font-semibold">{s.label}</h3>
			<p class="mt-2 text-gray-600">{s.headline}</p>
		</article>
	{/each}
</section>

<footer class="py-10">
	<div class="text-center text-sm text-gray-500">
		© {year} Cambermast LLC ·
		<a class="underline" href="mailto:hello@cambermast.com">hello@cambermast.com</a>
	</div>
</footer>
