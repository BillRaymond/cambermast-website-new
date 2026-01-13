<script lang="ts">
	import type { ToolInfo } from '$lib/data/tools';

	export let tool: ToolInfo;

	const primaryCta = {
		label: 'View upcoming dates',
		url: '/training/calendar'
	};

	const statusLabel = (status?: ToolInfo['status']) => (status === 'beta' ? 'Beta' : 'Coming soon');
	const statusBadgeClass = (status?: ToolInfo['status']) =>
		status === 'beta'
			? 'bg-amber-50 text-amber-700'
			: 'bg-blue-50 text-blue-700';
</script>

<header class="mb-10 space-y-4">
	<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Tool preview</p>
	<h1 class="text-3xl font-bold text-gray-900">{tool.title}</h1>
	<p class="max-w-2xl text-gray-700">{tool.summary}</p>
	<div class="flex flex-wrap items-center gap-3">
		<span
			class={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadgeClass(
				tool.status
			)}`}
		>
			{statusLabel(tool.status)}
		</span>
		<span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
			Last updated {tool.lastUpdated}
		</span>
	</div>
	<div class="flex flex-wrap gap-3">
		<a
			href={primaryCta.url}
			class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
		>
			{primaryCta.label}
		</a>
		{#if tool.secondaryCta}
			<a
				href={tool.secondaryCta.url}
				class="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
			>
				{tool.secondaryCta.label}
			</a>
		{/if}
	</div>
</header>

<section class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold text-gray-900">Who it&apos;s for</h2>
		<ul class="mt-4 list-disc space-y-2 pl-5 text-gray-700">
			{#each tool.audience as item}
				<li>{item}</li>
			{/each}
		</ul>
	</article>
	<article class="rounded-2xl border bg-gray-50 p-6">
		<h2 class="text-xl font-semibold text-gray-900">What you&apos;ll get</h2>
		<p class="mt-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Output artifact</p>
		<ul class="mt-3 list-disc space-y-2 pl-5 text-gray-700">
			{#each tool.outputs as output}
				<li>{output}</li>
			{/each}
		</ul>
	</article>
</section>

<section class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold text-gray-900">How it will work</h2>
		<ol class="mt-4 list-decimal space-y-2 pl-5 text-gray-700">
			{#each tool.howItWorks as step}
				<li>{step}</li>
			{/each}
		</ol>
	</article>
	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold text-gray-900">Why teams use this</h2>
		<ul class="mt-4 list-disc space-y-2 pl-5 text-gray-700">
			{#each tool.valueProps as prop}
				<li>{prop}</li>
			{/each}
		</ul>
	</article>
</section>

<section class="mt-6 grid gap-6 lg:grid-cols-2">
	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold text-gray-900">Methodology</h2>
		<ul class="mt-4 list-disc space-y-2 pl-5 text-gray-700">
			{#each tool.methodology as item}
				<li>{item}</li>
			{/each}
		</ul>
		<h3 class="mt-6 text-lg font-semibold text-gray-900">Assumptions</h3>
		<ul class="mt-3 list-disc space-y-2 pl-5 text-gray-700">
			{#each tool.assumptions as item}
				<li>{item}</li>
			{/each}
		</ul>
	</article>
	<article class="rounded-2xl border bg-gray-50 p-6">
		<h2 class="text-xl font-semibold text-gray-900">Privacy note</h2>
		<p class="mt-3 text-gray-700">{tool.privacyNote}</p>
	</article>
</section>

<section class="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">FAQs</h2>
	<div class="mt-4 space-y-4">
		{#each tool.faqs as faq}
			<div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
				<p class="font-semibold text-gray-900">{faq.question}</p>
				<p class="mt-2 text-gray-700">{faq.answer}</p>
			</div>
		{/each}
	</div>
</section>

<section class="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">Related training</h2>
	<div class="mt-4 grid gap-4 md:grid-cols-3">
		{#each tool.relatedTraining as item}
			<a
				href={item.href}
				class="flex h-full flex-col justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200"
			>
				<div>
					<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Training</p>
					<h3 class="mt-2 text-lg font-semibold text-gray-900">{item.title}</h3>
					<p class="mt-2 text-sm text-gray-700">{item.description}</p>
				</div>
				<span class="mt-4 text-sm font-semibold text-blue-700">Explore program</span>
			</a>
		{/each}
	</div>
</section>
