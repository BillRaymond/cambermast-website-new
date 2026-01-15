<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { listTools, type Tool } from '$lib/data/tools';

	const tools: Tool[] = listTools();

	const customTitle = 'AI Tools & Calculators | Cambermast';
	const customDescription =
		'Free AI tools and calculators to help you learn AI workflows, measure impact, and build confidence with agentic automation.';
</script>

<SeoHead title={customTitle} description={customDescription} path="/tools" />

<!-- Hero Section -->
<section class="mb-10">
	<div class="mx-auto max-w-4xl text-center">
		<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
			AI Tools & Calculators
		</h1>
		<p class="mt-4 text-lg text-gray-600">
			Free, research-backed tools to help you learn AI, understand impact, and build confidence
			with automation.
		</p>
	</div>
</section>

<!-- Tools Grid -->
<section class="mb-16">
	<div class="mx-auto max-w-6xl">
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each tools as tool}
				<a
					href={tool.route}
					class="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
				>
					<!-- Icon & Title -->
					<div class="mb-3 flex items-start justify-between">
						<div>
							<div class="mb-2 text-3xl">{tool.icon}</div>
							<h2 class="text-xl font-bold text-gray-900 group-hover:text-blue-600">
								{tool.title}
							</h2>
						</div>
						{#if tool.status === 'beta'}
							<span
								class="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
							>
								Beta
							</span>
						{:else if tool.status === 'coming-soon'}
							<span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
								Coming Soon
							</span>
						{/if}
					</div>

					<!-- Category Badge -->
					<div class="mb-3">
						<span class="inline-block rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
							{tool.category}
						</span>
					</div>

					<!-- Description -->
					<p class="mb-4 text-sm text-gray-700">
						{tool.description}
					</p>

					<!-- Features List -->
					<ul class="space-y-1">
						{#each tool.features as feature}
							<li class="flex items-start text-xs text-gray-600">
								<span class="mr-2 text-green-600">✓</span>
								<span>{feature}</span>
							</li>
						{/each}
					</ul>

					<!-- CTA Arrow -->
					<div class="mt-4 flex items-center text-sm font-semibold text-blue-600">
						<span>Try it now</span>
						<span class="ml-1 transition-transform group-hover:translate-x-1">→</span>
					</div>
				</a>
			{/each}
		</div>

		{#if tools.length === 0}
			<div class="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
				<p class="text-gray-600">No tools available yet. Check back soon!</p>
			</div>
		{/if}
	</div>
</section>

<!-- Supporting Content -->
<section class="mb-16">
	<div class="mx-auto max-w-4xl">
		<div class="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8">
			<h2 class="mb-4 text-2xl font-bold text-gray-900">Why Use These Tools?</h2>
			<div class="space-y-4 text-gray-700">
				<p>
					AI adoption fails when it's treated as a side project instead of a skill you can build.
					These tools help you:
				</p>
				<ul class="ml-6 list-disc space-y-2">
					<li>
						<strong>See the opportunity</strong> with clear, realistic impact signals
					</li>
					<li>
						<strong>Build confidence</strong> with simple, credible outputs you can explain
					</li>
					<li>
						<strong>Identify gaps</strong> in skills, processes, and readiness before you invest
					</li>
					<li>
						<strong>Make faster decisions</strong> with research-backed assumptions
					</li>
				</ul>
				<p class="font-semibold text-blue-900">
					All calculations use research-backed defaults so your results feel grounded and usable.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="mb-16">
	<div class="mx-auto max-w-4xl rounded-2xl bg-gray-900 p-8 text-center text-white">
		<h2 class="mb-4 text-3xl font-bold">Need Help Building Your AI Strategy?</h2>
		<p class="mb-6 text-lg text-gray-300">
			Tools provide the data. Training provides the execution. Let's help your team turn
			projections into production-ready agents.
		</p>
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<a
				href="/training/ai-automation-with-agents"
				class="inline-block rounded-lg bg-blue-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
			>
				View AI Automation Workshop
			</a>
			<a
				href="/contact"
				class="inline-block rounded-lg border-2 border-white bg-transparent px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-gray-900"
			>
				Schedule a Consultation
			</a>
		</div>
	</div>
</section>
