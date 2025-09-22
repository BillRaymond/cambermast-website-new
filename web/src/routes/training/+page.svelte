<script>
	const workshops = [
		{
			title: 'AI Fundamentals',
			summary: 'Plain-English foundation: what AI can + can’t do, and how to use it responsibly.',
			bullets: ['Core concepts', 'Prompting patterns', 'Risks & guardrails']
		},
		{
			title: 'Productivity with AI',
			summary: 'Everyday workflows for email, docs, slides, and quick automations.',
			bullets: ['Writing & editing', 'Summarization & synthesis', 'Content reuse']
		},
		{
			title: 'AI for Leaders',
			summary: 'Enable teams, pick tools, and measure impact without over-engineering.',
			bullets: ['Governance patterns', 'Selecting tools', 'Scaling pilots']
		}
	];
</script>

<h1 class="mb-6 text-3xl font-bold">AI Training</h1>
<p class="mb-10 text-gray-700">
	Hands-on workshops to build practical skills that your team can apply immediately.
</p>

<section class="mb-12">
	<div class="grid gap-6 md:grid-cols-3">
		{#each workshops as w}
			<article class="rounded-2xl border bg-white p-6 shadow-sm">
				<h3 class="text-xl font-semibold">{w.title}</h3>
				<p class="mt-2 text-gray-600">{w.summary}</p>
				<ul class="mt-4 list-disc space-y-1 pl-5 text-gray-700">
					{#each w.bullets as b}<li>{b}</li>{/each}
				</ul>
			</article>
		{/each}
	</div>
</section>

<section class="rounded-2xl border bg-gray-50 p-6">
	<h3 class="text-lg font-semibold">Not sure where to start?</h3>
	<p class="mt-2 text-gray-700">
		Tell us your team’s goals and constraints—we’ll recommend a path that gets results quickly.
	</p>
	<a href="/contact" class="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
		>Contact us</a
	>
</section>
