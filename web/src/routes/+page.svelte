<script>
	// Note: catalog is imported here to ensure it's included in the build
	import catalog from '$lib/data/catalog.json';
	// This is for the footer copyright year
	const year = new Date().getFullYear();

	// Build the list of sections purely from { label, headline }
	// Skip any non-section keys like "home" if you add one.
	const sections = Object.entries(catalog)
		.filter(([slug, sec]) => slug !== 'home' && sec?.label && sec?.headline)
		.map(([slug, sec]) => ({ slug, ...sec }));
</script>

<!-- Full-bleed hero -->
<section class="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-blue-50">
	<!-- Removed gradient background, replaced with a subtle blue tint using bg-blue-50 -->

	<div
		class="relative mx-auto flex max-w-4xl items-center justify-between px-6"
		style="height:100px"
	>
		<!-- Left: headline only -->
		<h1 class="text-1xl font-extrabold tracking-tight text-gray-900">
			Apply AI today for success tomorrow. -Bill<br />
		</h1>

		<!-- Right: portrait with name below -->
		<div class="flex flex-shrink-0 flex-col items-center">
			<img
				src="/images/bill.jpg"
				alt="Bill Raymond"
				class="h-16 w-16 rounded-2xl border border-gray-200 object-cover shadow-2xl"
			/>
			<span class="mt-2 text-xs font-medium text-gray-500">
				Bill Raymond, Founder, Cambermast LLC
			</span>
		</div>
	</div>
</section>

<!-- Add podcast and newsletter buttons -->
<div class="mt-8 flex justify-center gap-4">
	<a
		href="https://billtalksai.com/"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-blue-700"
	>
		📰 The Bill Talks AI Newsletter
	</a>
	<a
		href="https://agileinaction.com/"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white shadow transition hover:bg-gray-800"
	>
		🎙️ The Agile in Action Podcast
	</a>
</div>

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
