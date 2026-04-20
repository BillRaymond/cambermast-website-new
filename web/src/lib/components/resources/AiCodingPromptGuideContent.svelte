<script lang="ts">
	import { browser } from '$app/environment';
	import type { PrintableResource } from '$lib/data/resources/printable';

	type Variant = 'web' | 'print';

	export let resource: PrintableResource;
	export let variant: Variant = 'web';

	const prdPhrase = 'Product Requirements Document (PRD)';
	const contents = [
		{ href: '#prompt-formula', label: 'AI prompting formula' },
		{ href: '#plan-mode', label: 'Plan mode' },
		{ href: '#focused-chat', label: 'Focused chat' },
		{ href: '#copy-ready-prompts', label: 'Copy-ready prompts' },
		{ href: '#checklist', label: 'Before you hit send' }
	] as const;

	const emphasizePrd = (summary: string): { before: string; after: string } | null => {
		const [before, after] = summary.split(prdPhrase);
		if (after === undefined) return null;

		return { before, after };
	};

	let copiedPromptId = '';
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const handleCopyPrompt = async (id: string, value: string) => {
		if (!browser || !navigator.clipboard) return;

		try {
			await navigator.clipboard.writeText(value);
			copiedPromptId = id;

			if (copyTimer) {
				clearTimeout(copyTimer);
			}

			copyTimer = setTimeout(() => {
				copiedPromptId = '';
			}, 1600);
		} catch (error) {
			console.warn('Unable to copy prompt', error);
		}
	};
</script>

{#if variant === 'print'}
	<section class="rounded-[1.2rem] border border-gray-200 bg-white px-4 py-3">
		<div class="flex items-center gap-3">
			<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-gray-500 uppercase">Contents</p>
			<ul class="flex flex-wrap gap-1.5">
				{#each contents as item}
					<li>
						<a
							href={item.href}
							class="block rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[0.68rem] font-medium leading-none text-blue-900"
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section id="prompt-formula" class="rounded-[1.2rem] border border-gray-200 bg-white p-4 print-page-break-after">
		<div class="space-y-2">
			<h2 class="text-xl font-black tracking-tight text-gray-950">{resource.promptFormula.title}</h2>
			<p class="text-[0.8rem] leading-relaxed text-gray-700">{resource.promptFormula.intro}</p>
		</div>

		<div class="mt-4 rounded-[1rem] border border-blue-100 bg-blue-50 px-4 py-3">
			<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-blue-700 uppercase">
				Choose your mode first
			</p>
			<p class="mt-1 text-[0.78rem] leading-relaxed text-blue-950">
				{resource.promptFormula.modeCallout}
			</p>
			<p class="mt-3 text-base font-black tracking-tight text-blue-950">
				{resource.promptFormula.pattern}
			</p>
			<ul class="print-list mt-3 space-y-1.5 text-[0.74rem] leading-relaxed text-blue-950">
				{#each resource.promptFormula.fields as item}
					<li>{item}</li>
				{/each}
			</ul>
		</div>

		<div class="mt-4 grid gap-3">
			{#each resource.promptFormula.examples as example, index}
				<section class="print-card rounded-[1rem] border border-gray-200 bg-gray-50 p-3">
					<div class="flex items-center gap-3">
						<div class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[0.68rem] font-bold text-white">
							{index + 1}
						</div>
						<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-blue-600 uppercase">
							{example.label}
						</p>
					</div>
					<pre class="mt-2 whitespace-pre-wrap rounded-xl bg-gray-900 p-3 font-mono text-[0.68rem] leading-relaxed text-gray-100"><code>{example.prompt}</code></pre>
				</section>
			{/each}
		</div>
	</section>

	<div class="grid gap-4 print-page-break-after">
		{#each resource.workModes.modes as mode, index}
			{@const prdEmphasis = emphasizePrd(mode.summary)}
			<article
				id={index === 0 ? 'plan-mode' : 'focused-chat'}
				class="print-card rounded-[1rem] border border-gray-200 bg-gray-50 p-4"
			>
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<div class="flex items-center gap-3">
							<div class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
								{index + 1}
							</div>
							<h3 class="text-lg font-black tracking-tight text-gray-950">{mode.name}</h3>
						</div>
						<p class="mt-2 text-[0.68rem] font-semibold tracking-[0.18em] text-gray-500 uppercase">
							{mode.badge}
						</p>
					</div>
				</div>

				<p class="mt-3 text-[0.78rem] leading-relaxed text-gray-700">
					{#if prdEmphasis}
						{prdEmphasis.before}<strong>{prdPhrase}</strong>{prdEmphasis.after}
					{:else}
						{mode.summary}
					{/if}
				</p>

				<div class="mt-3 grid gap-3 md:grid-cols-2">
					<div class="rounded-[0.9rem] border border-white bg-white p-3">
						<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-gray-500 uppercase">
							Use this when
						</p>
						<ul class="print-list mt-2 space-y-1.5 text-[0.74rem] leading-relaxed text-gray-700">
							{#each mode.reasonsToUse as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>

					<div class="rounded-[0.9rem] border border-white bg-white p-3">
						<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-gray-500 uppercase">
							What to ask for
						</p>
						<ul class="print-list mt-2 space-y-1.5 text-[0.74rem] leading-relaxed text-gray-700">
							{#each mode.askFor as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>
				</div>

				<div class="mt-3 rounded-[0.9rem] border border-blue-100 bg-blue-50 px-3 py-2.5 text-[0.74rem] leading-relaxed text-blue-950">
					<span class="font-semibold">Best practice:</span> {mode.memoryTip}
				</div>

				<div class="mt-3 grid gap-3 md:grid-cols-2">
					<div class="rounded-[0.9rem] border border-white bg-white p-3">
						<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-gray-500 uppercase">
							What to expect
						</p>
						<p class="mt-2 text-[0.74rem] leading-relaxed text-gray-700">{mode.expect}</p>
					</div>

					<div class="rounded-[0.9rem] border border-white bg-white p-3">
						<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-gray-500 uppercase">
							Why this works
						</p>
						<p class="mt-2 text-[0.74rem] leading-relaxed text-gray-700">{mode.whyItWorks}</p>
					</div>
				</div>

				<div class="mt-3 rounded-[0.9rem] border border-rose-100 bg-rose-50 px-3 py-2.5">
					<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-rose-700 uppercase">
						When not to use it
					</p>
					<p class="mt-2 text-[0.74rem] leading-relaxed text-rose-950">{mode.notFor}</p>
				</div>
			</article>
		{/each}
	</div>

	<section id="copy-ready-prompts" class="rounded-[1.2rem] border border-gray-200 bg-white p-4">
		<div class="space-y-2">
			<h2 class="text-xl font-black tracking-tight text-gray-950">{resource.copyReadyPrompts.title}</h2>
		</div>

		<div class="mt-4 grid gap-3">
			{#each resource.copyReadyPrompts.groups as group}
				<section class="print-card rounded-[1rem] border border-gray-200 bg-gray-50 p-3">
					<h3 class="text-sm font-bold text-gray-950">{group.title}</h3>
					<p class="mt-1 text-[0.72rem] leading-relaxed text-gray-700">{group.description}</p>
					<pre class="mt-3 whitespace-pre-wrap rounded-xl bg-gray-900 p-3 font-mono text-[0.68rem] leading-relaxed text-gray-100"><code>{group.prompt}</code></pre>
				</section>
			{/each}
		</div>
	</section>

	<section id="checklist" class="print-keep-together rounded-[1.2rem] border border-gray-200 bg-white p-4">
		<div class="print-keep-together rounded-[1rem] border border-emerald-200 bg-emerald-50 p-4">
			<h2 class="text-xl font-black tracking-tight text-emerald-950">{resource.finalChecklist.title}</h2>
			<p class="mt-2 text-[0.78rem] leading-relaxed text-emerald-950">
				A good AI coding prompt does not need to be long. It just needs the right starting
				mode, enough context, and a clear finish line.
			</p>
			<ul class="mt-4 grid list-none gap-x-4 gap-y-2 pl-0 text-[0.74rem] leading-relaxed text-emerald-950 sm:grid-cols-2">
				{#each resource.finalChecklist.items as item}
					<li>
						<span class="font-semibold">✓</span> {item}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{:else}
	<section class="mb-8 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
			<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">Contents</p>
			<ul class="flex flex-wrap gap-2">
				{#each contents as item}
					<li>
						<a href={item.href} class="inline-flex items-center rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50">
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section id="prompt-formula" class="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
		<article class="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
			<p class="text-sm font-semibold tracking-[0.18em] text-blue-700 uppercase">Prompt formula</p>
			<h2 class="mt-2 text-3xl font-black tracking-tight text-gray-950">
				{resource.promptFormula.title}
			</h2>
			<p class="mt-4 text-gray-700">{resource.promptFormula.intro}</p>
			<div class="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
				<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">Choose your mode first</p>
				<p class="mt-1 text-sm text-gray-700">{resource.promptFormula.modeCallout}</p>
			</div>
			<div class="mt-4 rounded-[1.5rem] border border-blue-100 bg-linear-to-r from-blue-50 to-white px-5 py-5 shadow-sm">
				<p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">The CORD formula</p>
				<p class="mt-1 text-lg font-black tracking-tight text-blue-950">
					{resource.promptFormula.pattern}
				</p>
				<div class="mt-4 space-y-3">
					{#each resource.promptFormula.examples as example, index}
						<div class="rounded-2xl border border-white/90 bg-white/90 p-4">
							<div class="flex items-center gap-3">
								<div class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
									{index + 1}
								</div>
								<p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
									{example.label}
								</p>
							</div>
							<p class="mt-3 text-sm leading-relaxed text-gray-700 italic">{example.prompt}</p>
						</div>
					{/each}
				</div>
			</div>
			<ul class="mt-5 grid grid-cols-2 gap-3 text-sm leading-relaxed text-gray-700">
				{#each resource.promptFormula.fields as item}
					<li class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
						<span class="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
							{item[0]}
						</span>
						<span>{item}</span>
					</li>
				{/each}
			</ul>
		</article>

		<article id="copy-ready-prompts" class="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
			<p class="text-sm font-semibold tracking-[0.18em] text-blue-700 uppercase">Copy-ready prompts</p>
			<h2 class="mt-2 text-3xl font-black tracking-tight text-gray-950">
				{resource.copyReadyPrompts.title}
			</h2>
			<div class="mt-6 space-y-4">
				{#each resource.copyReadyPrompts.groups as group, index}
					<section class="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4">
						<div class="space-y-3">
							<div>
								<h3 class="text-lg font-bold text-gray-950">{group.title}</h3>
								<p class="mt-1 text-sm text-gray-700">{group.description}</p>
							</div>
						</div>
						<div class="mt-4 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
							<div class="flex items-center justify-between gap-3 border-b border-gray-800 px-4 py-3">
								<p class="text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase">
									Prompt text
								</p>
								<button
									class="copy-button inline-flex items-center gap-1.5 rounded-full border border-gray-700 bg-gray-800 px-2.5 py-1 text-[11px] font-semibold text-gray-100 shadow-sm transition hover:border-gray-500 hover:bg-gray-700"
									class:copied={copiedPromptId === `copy-ready-prompt:${index}`}
									type="button"
									aria-label={`Copy prompt: ${group.title}`}
									on:click={() => handleCopyPrompt(`copy-ready-prompt:${index}`, group.prompt)}
								>
									{#if copiedPromptId === `copy-ready-prompt:${index}`}
										<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<path
												d="M3.5 8.5 6.5 11.5 12.5 4.5"
												stroke="currentColor"
												stroke-width="1.7"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
										<span>Copied</span>
									{:else}
										<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<rect
												x="5"
												y="3"
												width="8"
												height="10"
												rx="1.5"
												stroke="currentColor"
												stroke-width="1.4"
											/>
											<path
												d="M3 10V5.5C3 4.672 3.672 4 4.5 4H10"
												stroke="currentColor"
												stroke-width="1.4"
												stroke-linecap="round"
											/>
										</svg>
										<span>Copy</span>
									{/if}
								</button>
							</div>
							<pre class="whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-gray-100"><code>{group.prompt}</code></pre>
						</div>
					</section>
				{/each}
			</div>
		</article>
	</section>

	<section class="mb-12 grid gap-6 lg:grid-cols-2">
		{#each resource.workModes.modes as mode, index}
			{@const prdEmphasis = emphasizePrd(mode.summary)}
			<article
				id={index === 0 ? 'plan-mode' : 'focused-chat'}
				class="rounded-[2rem] border border-blue-200 bg-blue-50/60 p-6 shadow-sm"
			>
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
						{#if prdEmphasis}
							{prdEmphasis.before}<strong>{prdPhrase}</strong>{prdEmphasis.after}
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
	</section>

	<section id="checklist" class="mb-12">
		<div class="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
			<p class="text-sm font-semibold tracking-[0.18em] text-emerald-800 uppercase">Final check</p>
			<h2 class="mt-2 text-3xl font-black tracking-tight text-emerald-950">
				{resource.finalChecklist.title}
			</h2>
			<p class="mt-4 max-w-3xl text-gray-700">
				A good AI coding prompt does not need to be long. It just needs the right starting
				mode, enough context, and a clear finish line.
			</p>

			<ul class="mt-5 grid list-none gap-x-4 gap-y-3 pl-0 sm:grid-cols-2">
				{#each resource.finalChecklist.items as item}
					<li class="text-sm leading-relaxed text-emerald-950">
						<span class="font-semibold">✓</span> {item}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<style>
	.copy-button {
		transform: translateY(0) scale(1);
		transition:
			transform 180ms ease,
			border-color 180ms ease,
			background-color 180ms ease,
			color 180ms ease,
			box-shadow 180ms ease;
	}

	.copy-button.copied {
		transform: translateY(-1px) scale(1.03);
		border-color: rgb(134 239 172);
		background-color: rgb(240 253 244);
		color: rgb(22 101 52);
		box-shadow: 0 10px 25px -18px rgba(22, 163, 74, 0.75);
	}

	.copy-button:active {
		transform: translateY(0) scale(0.98);
	}

	@media print {
		.copy-button {
			display: none;
		}
	}
</style>
