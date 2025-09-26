<script>
	// Note: catalog is imported here to ensure it's included in the build
	import catalog from '$lib/data/catalog.json';
	// import ServiceCard from '$lib/components/ServiceCard.svelte';
	import Card from '$lib/components/ServiceCard.svelte';
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
			Applying AI leadership skills.<br />
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
		<Card
			icon={s.icon}
			label={s.label}
			headline={s.headline}
			testimonial={s.testimonial}
			author={s.author}
			route={s.route}
		/>
	{/each}
</section>
<!-- Add a section break line -->
<hr class="my-12 border-gray-300" />
<!-- Upcoming events embed -->
<section class="mt-12 flex flex-col items-center px-4">
	<h2 class="mb-6 text-center text-2xl font-bold text-gray-900">Upcoming Events</h2>
	<div class="w-full max-w-4xl overflow-hidden rounded-lg shadow-sm">
		<iframe
			title="Bill Talks AI upcoming events calendar"
			src="https://luma.com/embed/calendar/cal-WiCb89B8ouz3ZFH/events"
			class="h-[600px] w-full"
			loading="lazy"
			frameborder="0"
			style="border: 1px solid #bfcbda88; border-radius: 4px;"
			allowfullscreen
		></iframe>
	</div>
</section>
<!-- Add a section break line -->
<hr class="my-12 border-gray-300" />
<!-- Microsoft Project Server Service-->
<section>
	<div class="mt-12 flex flex-col items-center">
		<h2 class="text-1xl mb-4 font-bold text-gray-900">
			Are you a Microsoft Project Server customer?
		</h2>
		<p class="mb-6 max-w-xl text-center text-gray-700">
			Did you know that Bill Raymond wrote the book on Microsoft Project Server? Microsoft stopped
			supporting it, but you may still be using this beloved product. Cambermast partners with
			<a class="inline-link" href="https://projecthosts.com">ProjectHosts</a> to provide hosting and support for Microsoft
			Project Server.
		</p>

		<!-- svelte-ignore a11y_consider_explicit_label -->
		<p>
			<a
				href="https://cambermast.com/services/microsoft-project-server/"
				target="_blank"
				rel="noopener"
				class="text-1xl rounded-lg bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700"
				>Learn More ></a
			>
		</p>
	</div>
</section>

<footer class="py-10">
	<div class="text-center text-sm text-gray-500">
		© {year} Cambermast LLC ·
		<a class="underline" href="mailto:hello@cambermast.com">hello@cambermast.com</a>
	</div>
</footer>

<style>
	.inline-link {
		color: #2563eb;
		font-weight: 600;
		text-decoration: underline;
		text-decoration-thickness: 0.08em;
		text-underline-offset: 0.2em;
		transition: color 0.2s ease-in-out;
	}

	.inline-link:hover {
		color: #1d4ed8;
	}

	.inline-link:focus-visible {
		outline: 2px solid #1d4ed8;
		outline-offset: 2px;
	}
</style>
