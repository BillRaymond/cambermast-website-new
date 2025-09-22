<script>
	const items = [
		{
			title: 'Automation Starter (n8n + APIs)',
			summary: 'Ship one real automation that saves time and is easy to maintain.',
			bullets: ['Scope & success metrics', 'Build + handoff', 'Simple monitoring']
		}
	];
</script>

<h1 class="mb-6 text-3xl font-bold">AI Agents</h1>
<p class="mb-10 text-gray-700">
	Practical automations using n8n and APIs—focused on real outcomes, not hype.
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
		Share the manual task that wastes the most time—we’ll suggest a small pilot to automate it.
	</p>
	<a href="/contact" class="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>
