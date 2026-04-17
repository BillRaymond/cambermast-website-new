<script lang="ts">
	import ResourceHeader from '$lib/components/resources/ResourceHeader.svelte';
	import { getResource } from '$lib/data/resources';
	import {
		aiCodingPromptGuide,
		aiCodingPromptGuidePdfUrl,
		aiCodingPromptGuidePrintUrl
	} from '$lib/data/resources/printable/ai-coding-prompt-guide';
	import { getImageAlt, getLandscapeImageUrl } from '$lib/data/image-contract';

	const resource = getResource('ai-coding-prompt-guide');
	const heroImage = getLandscapeImageUrl(resource?.images) ?? aiCodingPromptGuide.heroImage;
	const heroImageAlt = getImageAlt(resource?.images) ?? aiCodingPromptGuide.heroImageAlt;
	const prdPhrase = 'Product Requirements Document (PRD)';
</script>

<ResourceHeader
	title={aiCodingPromptGuide.title}
	description={aiCodingPromptGuide.description}
	path="/resources/ai-coding-prompt-guide"
	imageSrc={heroImage}
	imageAlt={heroImageAlt}
	label={resource?.label ?? aiCodingPromptGuide.label}
>
	<div slot="actions" class="flex flex-wrap gap-3 pt-1">
		<a
			href={aiCodingPromptGuidePdfUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center justify-center rounded-full border border-blue-700 bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:border-blue-800 hover:bg-blue-700"
		>
			Download the PDF
		</a>
		<a
			href={aiCodingPromptGuidePrintUrl}
			class="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"
		>
			Open print view
		</a>
	</div>
</ResourceHeader>

<nav class="mb-10 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
	<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">On this page</p>
	<ul class="mt-3 flex flex-wrap gap-2">
		{#each [
			{ href: '#quick-start', label: 'Quick start' },
			{ href: '#work-modes', label: 'Two ways to work' },
			{ href: '#cheat-sheet', label: 'Role differences' },
			{ href: '#mindset', label: 'AI coding mindset' },
			{ href: '#prompt-formula', label: 'Prompt formula' },
			{ href: '#checklist', label: 'Before you hit send' }
		] as item}
			<li>
				<a href={item.href} class="inline-flex items-center rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50">
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<section id="quick-start" class="mb-12">
	<div class="overflow-hidden rounded-[2rem] border border-blue-100 bg-linear-to-br from-blue-50 via-white to-amber-50 shadow-sm">
		<div class="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
			<div class="space-y-5">
				<div class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase shadow-sm">
					<span class="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
					{aiCodingPromptGuide.quickStart.eyebrow}
				</div>
				<div class="space-y-3">
					<h2 class="max-w-3xl text-3xl font-black tracking-tight text-gray-950">
						{aiCodingPromptGuide.quickStart.title}
					</h2>
					<p class="max-w-3xl text-base leading-relaxed text-gray-700">
						{aiCodingPromptGuide.quickStart.intro}
					</p>
				</div>
				<div class="grid gap-4 md:grid-cols-2">
					{#each aiCodingPromptGuide.workModes.modes as mode, index}
						<article class="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
							<div class="flex items-center gap-3">
								<div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
									{index + 1}
								</div>
								<h3 class="text-lg font-black tracking-tight text-gray-950">{mode.name}</h3>
							</div>

							<p class="mt-4 text-sm leading-relaxed text-gray-700">{mode.summary}</p>

							<div class="mt-4 rounded-[1.75rem] border border-gray-200 bg-gray-50 p-5">
								<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">
									Best for
								</p>
								<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
									{#each mode.reasonsToUse as item}
										<li>{item}</li>
									{/each}
								</ul>
								<div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-relaxed text-amber-950">
									<span class="font-bold">Tip:</span> {mode.memoryTip}
								</div>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<section id="work-modes" class="mb-12 space-y-6">
	<div class="max-w-3xl space-y-3">
		<h2 class="text-3xl font-black tracking-tight text-gray-950">
			{aiCodingPromptGuide.workModes.title}
		</h2>
		<p class="text-gray-700">{aiCodingPromptGuide.workModes.intro}</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		{#each aiCodingPromptGuide.workModes.modes as mode, index}
			<article class="rounded-[2rem] border border-blue-200 bg-blue-50/60 p-6 shadow-sm">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<div class="flex items-center gap-3">
						<div class="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
							{index + 1}
						</div>
						<h3 class="text-2xl font-black tracking-tight text-gray-950">{mode.name}</h3>
						</div>
						<p class="mt-3 text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase">
							{mode.badge}
						</p>
					</div>
					<div class="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900 uppercase shadow-sm">
						{index === 0 ? 'PRD first' : 'Do the work'}
					</div>
				</div>

				<p class="mt-4 text-sm leading-relaxed text-gray-700">
					{#if mode.name === 'Plan mode'}
						{mode.summary.split(prdPhrase)[0]}<strong>{prdPhrase}</strong>{mode.summary.split(prdPhrase)[1]}
					{:else}
						{mode.summary}
					{/if}
				</p>

				<div class="mt-6 grid gap-4 sm:grid-cols-2">
					<div class="rounded-2xl border border-white/90 bg-white/90 p-4">
						<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">Use this when</p>
						<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
							{#each mode.reasonsToUse as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>

					<div class="rounded-2xl border border-white/90 bg-white/90 p-4">
						<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">
							What to ask for
						</p>
						<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
							{#each mode.askFor as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>
				</div>

				<div class="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium leading-relaxed text-blue-950">
					<span class="font-bold">Best practice:</span> {mode.memoryTip}
				</div>

				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<div class="rounded-2xl border border-gray-200 bg-white px-4 py-3">
						<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">
							What to expect
						</p>
						<p class="mt-2 text-sm leading-relaxed text-gray-700">{mode.expect}</p>
					</div>
					<div class="rounded-2xl border border-gray-200 bg-white px-4 py-3">
						<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">
							Why this works
						</p>
						<p class="mt-2 text-sm leading-relaxed text-gray-700">{mode.whyItWorks}</p>
					</div>
				</div>

				<div class="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
					<p class="text-xs font-semibold tracking-[0.18em] text-rose-700 uppercase">
						When not to use it
					</p>
					<p class="mt-2 text-sm leading-relaxed text-rose-950">{mode.notFor}</p>
				</div>
			</article>
		{/each}
	</div>
</section>

<section id="cheat-sheet" class="mb-12 space-y-6">
	<div class="max-w-3xl space-y-3">
		<h2 class="text-3xl font-black tracking-tight text-gray-950">
			{aiCodingPromptGuide.cheatSheet.title}
		</h2>
		<p class="text-gray-700">{aiCodingPromptGuide.cheatSheet.intro}</p>
	</div>

	<div class="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full min-w-[900px] border-collapse text-left">
				<thead class="bg-gray-50 text-xs font-semibold tracking-[0.18em] text-gray-600 uppercase">
					<tr>
						<th class="border-b border-gray-200 px-4 py-4">Situation</th>
						<th class="border-b border-gray-200 px-4 py-4">Developer</th>
						<th class="border-b border-gray-200 px-4 py-4">AI Developer (prompting)</th>
					</tr>
				</thead>
				<tbody class="align-top text-sm text-gray-800">
					{#each aiCodingPromptGuide.cheatSheet.rows as row, index}
						<tr class={index % 2 === 1 ? 'bg-blue-50/30' : ''}>
							<td class="border-t border-gray-200 px-4 py-4 font-semibold text-gray-950">
								{row.situation}
							</td>
							<td class="border-t border-gray-200 px-4 py-4 leading-relaxed text-gray-700">
								{row.developer}
							</td>
							<td class="border-t border-gray-200 px-4 py-4">
								<div class="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3 leading-relaxed text-blue-950">
									{row.aiDeveloper}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<section id="mindset" class="mb-6 max-w-3xl space-y-3">
	<h2 class="text-3xl font-black tracking-tight text-gray-950">The AI coding mindset</h2>
	<p class="text-gray-700">
		The next step is learning how to think about the work in the right mode. Focused changes
		stay scoped to one area and can include many related tweaks, while bigger efforts need more
		planning, clearer scope, and better sequencing before implementation starts.
	</p>
</section>

<section class="mb-12 grid gap-6 xl:grid-cols-[1fr_1fr]">
	<article class="rounded-[2rem] border border-blue-200 bg-linear-to-br from-blue-50 via-white to-blue-100/70 p-6 shadow-sm">
		<div class="flex flex-wrap items-center gap-3">
			<span class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
				1
			</span>
			<div>
				<p class="text-sm font-semibold tracking-[0.18em] text-blue-700 uppercase">Bigger work</p>
				<h2 class="text-2xl font-black tracking-tight text-gray-950">
					{aiCodingPromptGuide.planningGuidance.title}
				</h2>
			</div>
		</div>

		<p class="mt-4 text-gray-700">{aiCodingPromptGuide.planningGuidance.intro}</p>

		<ol class="mt-4 grid grid-cols-2 gap-2">
			{#each aiCodingPromptGuide.planningGuidance.steps as step, index}
				<li class="flex items-center gap-3 rounded-2xl border border-white/90 bg-white/90 px-4 py-3 shadow-sm">
					<span class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
						{index + 1}
					</span>
					<span class="text-sm leading-relaxed text-gray-700">{step}</span>
				</li>
			{/each}
		</ol>

		<div class="mt-6 rounded-2xl border border-blue-100 bg-white px-4 py-4">
			<p class="text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">Planning reminders</p>
			<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
				{#each aiCodingPromptGuide.planningGuidance.reminders as item}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
	</article>

	<article class="rounded-[2rem] border border-blue-200 bg-linear-to-br from-blue-50 via-white to-blue-100/70 p-6 shadow-sm">
		<div class="flex flex-wrap items-center gap-3">
			<span class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
				2
			</span>
			<div>
				<p class="text-sm font-semibold tracking-[0.18em] text-blue-700 uppercase">Focused changes</p>
				<h2 class="text-2xl font-black tracking-tight text-gray-950">
					{aiCodingPromptGuide.smallChangeGuidance.title}
				</h2>
			</div>
		</div>

		<p class="mt-4 text-gray-700">{aiCodingPromptGuide.smallChangeGuidance.intro}</p>

		<ol class="mt-4 grid grid-cols-2 gap-2">
			{#each aiCodingPromptGuide.smallChangeGuidance.steps as step, index}
				<li class="flex items-center gap-3 rounded-2xl border border-white/90 bg-white/90 px-4 py-3 shadow-sm">
					<span class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
						{index + 1}
					</span>
					<span class="text-sm leading-relaxed text-gray-700">{step}</span>
				</li>
			{/each}
		</ol>

		<div class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
			<p class="text-sm text-blue-900"><span class="font-bold">Tip:</span> {aiCodingPromptGuide.smallChangeGuidance.commitTip}</p>
		</div>

		<div class="mt-4 rounded-2xl border border-blue-100 bg-white px-4 py-4">
			<p class="text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">Why focused, scoped chats help</p>
			<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
				{#each aiCodingPromptGuide.smallChangeGuidance.reminders as item}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
	</article>
</section>

<section id="prompt-formula" class="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
	<article class="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-semibold tracking-[0.18em] text-blue-700 uppercase">Prompt formula</p>
		<h2 class="mt-2 text-3xl font-black tracking-tight text-gray-950">
			{aiCodingPromptGuide.promptFormula.title}
		</h2>
		<p class="mt-4 text-gray-700">{aiCodingPromptGuide.promptFormula.intro}</p>
		<div class="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
			<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">Choose your mode first</p>
			<p class="mt-1 text-sm text-gray-700">{aiCodingPromptGuide.promptFormula.modeCallout}</p>
		</div>
		<div class="mt-4 rounded-[1.5rem] border border-blue-100 bg-linear-to-r from-blue-50 to-white px-5 py-5 shadow-sm">
			<p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">The CORD formula</p>
			<p class="mt-1 text-lg font-black tracking-tight text-blue-950">
				{aiCodingPromptGuide.promptFormula.pattern}
			</p>
			<div class="mt-4 space-y-3">
				{#each aiCodingPromptGuide.promptFormula.examples as example, i}
					<div>
						<p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">{i + 1}. {example.label}</p>
						<p class="mt-1 text-sm leading-relaxed text-gray-700 italic">{example.prompt}</p>
					</div>
				{/each}
			</div>
		</div>
		<ul class="mt-5 grid grid-cols-2 gap-3 text-sm leading-relaxed text-gray-700">
			{#each aiCodingPromptGuide.promptFormula.fields as item}
				<li class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
					<span class="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
						{item[0]}
					</span>
					<span>{item}</span>
				</li>
			{/each}
		</ul>
	</article>

	<article class="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-semibold tracking-[0.18em] text-blue-700 uppercase">Copy-ready prompts</p>
		<h2 class="mt-2 text-3xl font-black tracking-tight text-gray-950">
			{aiCodingPromptGuide.copyReadyPrompts.title}
		</h2>
		<div class="mt-6 space-y-4">
			{#each aiCodingPromptGuide.copyReadyPrompts.groups as group}
				<section class="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div>
							<h3 class="text-lg font-bold text-gray-950">{group.title}</h3>
							<p class="mt-1 text-sm text-gray-700">{group.description}</p>
						</div>
					</div>
					<pre class="mt-4 whitespace-pre-wrap rounded-2xl bg-gray-900 p-4 font-mono text-sm leading-relaxed text-gray-100"><code>{group.prompt}</code></pre>
				</section>
			{/each}
		</div>
	</article>
</section>

<section id="checklist" class="mb-12">
	<div class="rounded-[2rem] border border-blue-200 bg-linear-to-br from-blue-50 via-white to-blue-100/70 p-6 shadow-sm lg:p-8">
		<div class="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
			<div>
				<p class="text-sm font-semibold tracking-[0.18em] text-blue-700 uppercase">Final check</p>
				<h2 class="mt-2 text-3xl font-black tracking-tight text-gray-950">
					{aiCodingPromptGuide.finalChecklist.title}
				</h2>
				<p class="mt-4 max-w-xl text-gray-700">
					A good AI coding prompt does not need to be long. It just needs the right starting
					mode, enough context, and a clear finish line.
				</p>
			</div>

			<ul class="grid gap-3 sm:grid-cols-2">
				{#each aiCodingPromptGuide.finalChecklist.items as item}
					<li class="rounded-2xl border border-white/90 bg-white/90 px-4 py-4 text-sm leading-relaxed text-gray-800 shadow-sm">
						{item}
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
