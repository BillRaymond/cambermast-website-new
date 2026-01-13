<script lang="ts">
	import { tools } from '$lib/data/tools';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';

	const pageMeta = getSeo('/tools');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/tools" />

<header class="mb-10 space-y-3">
	<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Coming soon</p>
	<h1 class="text-3xl font-bold text-gray-900">Tools for AI job readiness</h1>
	<p class="max-w-2xl text-gray-700">
		These tools focus on role-level readiness with assessments, self-assessments, and AI tools that
		help you make smarter decisions about skills, workflows, and tool choices. They are in active
		development, and early feedback is welcome.
	</p>
</header>

<section class="grid gap-6 md:grid-cols-3">
	{#each tools as tool}
		<article class="flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold uppercase tracking-wide text-blue-600">Tool preview</span>
				<span class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
					Coming soon
				</span>
			</div>
			<h2 class="mt-3 text-xl font-semibold text-gray-900">{tool.title}</h2>
			<p class="mt-2 text-gray-700">{tool.summary}</p>
			<ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
				{#each tool.valueProps as prop}
					<li>{prop}</li>
				{/each}
			</ul>
			<div class="mt-4 rounded-xl border bg-gray-50 p-3">
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Outputs</p>
				<ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
					{#each tool.outputs as output}
						<li>{output}</li>
					{/each}
				</ul>
			</div>
			<div class="mt-5">
				<a
					href={`/tools/${tool.slug}`}
					class="inline-flex items-center justify-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:text-blue-900"
				>
					View details
				</a>
			</div>
		</article>
	{/each}
</section>
