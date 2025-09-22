<script>
	const items = [
		{
			title: 'Advisory Sprint (2–4 weeks)',
			summary: 'Short roadmap sprint to pick the right use cases and tools.',
			bullets: ['Prioritization', 'Vendor choices', 'Light governance']
		},
		{
			title: 'Project Management',
			summary:
				'Make AI work deliver on time and with quality—without turning into a giant project.',
			bullets: [
				'Clear scope & success metrics',
				'Lightweight guardrails',
				'Weekly progress you can see'
			]
		}
	];
</script>

<h1 class="mb-6 text-3xl font-bold">AI Strategy</h1>
<p class="mb-10 text-gray-700">
	Strategic guidance and execution support—so pilots turn into repeatable wins.
</p>

<section class="mb-12">
	<div class="grid gap-6 md:grid-cols-2">
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
</section>

<section class="rounded-2xl border bg-gray-50 p-6">
	<h3 class="text-lg font-semibold">Not sure where to start?</h3>
	<p class="mt-2 text-gray-700">
		Tell us your goals and constraints—We’ll recommend the smallest move that proves value.
	</p>
	<a href="/contact" class="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>
