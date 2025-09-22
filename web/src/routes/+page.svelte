<script>
	const year = new Date().getFullYear();
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
			<a
				href="/training"
				class="inline-block rounded-lg border border-gray-300 px-5 py-3 text-gray-800 hover:bg-gray-100"
			>
				AI Training
			</a>
		</div>
	</div>
</section>

<!-- Below here, content uses the layout's container automatically -->
<section class="mt-12 grid gap-6 md:grid-cols-3">
	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<h3 class="text-xl font-semibold">AI Training</h3>
		<p class="mt-2 text-gray-600">
			Hands-on sessions: AI fundamentals, prompting, productivity, and “ship it” playbooks.
		</p>
	</article>

	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<h3 class="text-xl font-semibold">AI Strategy</h3>
		<p class="mt-2 text-gray-600">
			Roadmaps, governance, and vendor choices—so your team moves confidently.
		</p>
	</article>

	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<h3 class="text-xl font-semibold">AI Agents</h3>
		<p class="mt-2 text-gray-600">
			n8n + APIs for docs, email, and data flows that actually save time.
		</p>
	</article>
</section>

<footer class="py-10">
	<div class="text-center text-sm text-gray-500">
		© {year} Cambermast LLC ·
		<a class="underline" href="mailto:hello@cambermast.com">hello@cambermast.com</a>
	</div>
</footer>
