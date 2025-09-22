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
<section class="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
	<!-- Background gradient -->
	<div class="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>

	<!-- Content grid -->
	<div
		class="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2"
	>
		<!-- Left: logo + text + CTA -->
		<div class="text-center md:text-left">
			<img
				src="/images/cambermast-logo-full.png"
				alt="Cambermast Logo"
				class="mx-auto mb-6 h-12 w-auto md:mx-0 md:h-14"
			/>

			<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
				AI Training & Consulting
			</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600 md:mx-0">
				Your first and last stop for AI.
			</p>

			<div class="mt-8 flex items-center justify-center gap-3 md:justify-start">
				<a
					href="/contact"
					class="inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow hover:bg-blue-700"
				>
					Book a call
				</a>
			</div>
		</div>

		<!-- Right: portrait -->
		<div class="flex justify-center md:justify-end">
			<img
				src="/images/bill.jpg"
				alt="Bill Raymond"
				class="max-h-80 rounded-2xl border border-gray-200 object-cover shadow-2xl"
			/>
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
