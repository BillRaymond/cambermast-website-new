<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const resource = data.resource;
	const seoTitle = `${resource.title} PDF | Cambermast`;
	const pagePath = `/resources/${resource.slug}/print`;

	const primaryCheatSheetRows = resource.cheatSheet.rows.slice(0, 5);
</script>

<SeoHead
	title={seoTitle}
	description={resource.description}
	path={pagePath}
	image={resource.heroImage}
	imageAlt={resource.heroImageAlt}
	type="article"
/>

<svelte:head>
	<meta name="robots" content="noindex,follow" />
	<style>
		body {
			background:
				radial-gradient(circle at top, rgba(219, 234, 254, 0.35), transparent 40%),
				linear-gradient(180deg, #eff6ff 0%, #ffffff 30%);
			color: #111827;
		}

		.print-list,
		.print-steps {
			list-style: none;
			margin: 0;
			padding: 0;
		}

		.print-list li,
		.print-steps li {
			position: relative;
			padding-left: 0.9rem;
		}

		.print-list li::before {
			content: '•';
			position: absolute;
			left: 0;
			top: 0;
			font-weight: 700;
			color: currentColor;
		}

		.print-steps {
			counter-reset: print-steps;
		}

		.print-steps li::before {
			counter-increment: print-steps;
			content: counter(print-steps) '.';
			position: absolute;
			left: 0;
			top: 0;
			font-weight: 700;
			color: #1d4ed8;
		}

		@media print {
			body {
				background: #fff;
			}

			a {
				color: inherit;
				text-decoration: none;
			}

			.print-main {
				padding-top: 0 !important;
				padding-bottom: 0 !important;
			}

			.print-card,
			.print-table {
				break-inside: avoid;
				box-shadow: none;
			}

			.print-page-break-after {
				break-after: page;
			}
		}
	</style>
</svelte:head>

<main class="print-main mx-auto flex max-w-5xl flex-col gap-4 px-5 py-6 text-[12px] text-gray-900 print:max-w-none print:px-0">
	<section class="print-page-break-after rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
		<div class="grid gap-4 md:grid-cols-[7.5rem_1fr] md:items-start">
			<img
				src={resource.heroImage}
				alt={resource.heroImageAlt}
				class="w-full rounded-[1.2rem] border border-gray-200 object-contain"
			/>
			<div class="space-y-3">
				<div class="flex flex-wrap items-center gap-3">
					<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-blue-600 uppercase">
						{resource.label}
					</p>
					<span class="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[0.65rem] font-semibold text-blue-800">
						Quick reference
					</span>
				</div>
				<h1 class="text-3xl font-black tracking-tight text-gray-950">{resource.title}</h1>
				<p class="text-[0.88rem] leading-relaxed text-gray-700">{resource.description}</p>
					<div class="rounded-[1.2rem] border border-blue-100 bg-blue-50 px-4 py-3 text-[0.8rem] leading-relaxed text-blue-950">
						<span class="font-semibold">Rule of thumb:</span> start projects and bigger changes in
						plan mode. Handle basic app or website changes in short, focused chats.
					</div>
			</div>
		</div>

		<div class="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
			<article class="print-card rounded-[1.2rem] border border-gray-200 bg-gray-50 p-4">
				<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-gray-500 uppercase">Start here</p>
				<h2 class="mt-1 text-lg font-black tracking-tight text-gray-950">
					{resource.quickStart.title}
				</h2>
				<p class="mt-2 text-[0.8rem] leading-relaxed text-gray-700">{resource.quickStart.intro}</p>
				<ol class="print-steps mt-3 space-y-2 text-[0.76rem] leading-relaxed text-gray-700">
					{#each resource.quickStart.steps as step}
						<li>{step}</li>
					{/each}
				</ol>
			</article>

			<article class="print-table overflow-hidden rounded-[1.2rem] border border-gray-200">
				<div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
					<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-gray-500 uppercase">Mode choice</p>
					<h2 class="mt-1 text-lg font-black tracking-tight text-gray-950">
						Plan mode vs short chat
					</h2>
				</div>
				<table class="w-full border-collapse text-left text-[0.74rem] leading-relaxed">
					<thead class="bg-white">
						<tr class="border-b border-gray-200">
							<th class="px-3 py-2 font-semibold text-gray-600 uppercase">Area</th>
							<th class="px-3 py-2 font-semibold text-amber-800 uppercase">Plan mode</th>
							<th class="px-3 py-2 font-semibold text-blue-800 uppercase">Short chat</th>
						</tr>
					</thead>
					<tbody class="align-top text-gray-800">
						<tr class="border-b border-gray-200">
							<td class="px-3 py-2 font-semibold text-gray-950">Use this when</td>
							<td class="px-3 py-2">
								New projects, redesigns, unclear scope, or work touching several systems.
							</td>
							<td class="px-3 py-2">
								Small edits, bug fixes, content updates, commits, syncs, and verification.
							</td>
						</tr>
						<tr class="border-b border-gray-200 bg-gray-50/70">
							<td class="px-3 py-2 font-semibold text-gray-950">Ask for</td>
							<td class="px-3 py-2">A plan, tradeoffs, missing decisions, testing, and rollout.</td>
							<td class="px-3 py-2">The change you want, any constraints, and the done criteria.</td>
						</tr>
						<tr class="border-b border-gray-200">
							<td class="px-3 py-2 font-semibold text-gray-950">Tip to remember</td>
							<td class="px-3 py-2">If you need a PRD first, use plan mode.</td>
							<td class="px-3 py-2">
								Keep small changes in short chats, then start a fresh chat for the next task.
							</td>
						</tr>
						<tr class="border-b border-gray-200 bg-gray-50/70">
							<td class="px-3 py-2 font-semibold text-gray-950">Why it works</td>
							<td class="px-3 py-2">It reduces rework and surfaces decisions before editing starts.</td>
							<td class="px-3 py-2">It keeps small tasks fast, focused, and easier to review.</td>
						</tr>
						<tr class="bg-white">
							<td class="px-3 py-2 font-semibold text-gray-950">Avoid when</td>
							<td class="px-3 py-2">The task is a tiny change with an obvious answer.</td>
							<td class="px-3 py-2">The project is new, ambiguous, or has many moving parts.</td>
						</tr>
					</tbody>
				</table>
			</article>
		</div>
	</section>

	<section class="print-page-break-after rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
		<div class="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
			<div>
				<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-blue-600 uppercase">Role comparison</p>
				<h2 class="mt-1 text-2xl font-black tracking-tight text-gray-950">{resource.cheatSheet.title}</h2>
				<p class="mt-1 text-[0.82rem] leading-relaxed text-gray-700">{resource.cheatSheet.intro}</p>
			</div>
			<div class="rounded-[1.2rem] border border-blue-100 bg-blue-50 px-4 py-3">
				<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-blue-700 uppercase">Prompt formula</p>
				<p class="mt-1 text-base font-black tracking-tight text-blue-950">
					{resource.promptFormula.pattern}
				</p>
				<ul class="print-list mt-2 space-y-1.5 text-[0.74rem] leading-relaxed text-blue-950">
					{#each resource.promptFormula.fields as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="print-table mt-4 overflow-hidden rounded-[1.2rem] border border-gray-200">
			<table class="w-full border-collapse text-left text-[0.73rem] leading-relaxed">
				<thead class="bg-gray-50 text-[0.64rem] font-semibold tracking-[0.16em] text-gray-600 uppercase">
					<tr>
						<th class="border-b border-gray-200 px-3 py-2.5">Situation</th>
						<th class="border-b border-gray-200 px-3 py-2.5">Developer</th>
						<th class="border-b border-gray-200 px-3 py-2.5">AI Developer (prompting)</th>
					</tr>
				</thead>
				<tbody class="align-top text-gray-800">
					{#each primaryCheatSheetRows as row, index}
						<tr class={index % 2 === 1 ? 'bg-blue-50/30' : 'bg-white'}>
							<td class="border-t border-gray-200 px-3 py-2.5">
								<div class="font-semibold text-gray-950">{row.situation}</div>
							</td>
							<td class="border-t border-gray-200 px-3 py-2.5">{row.developer}</td>
							<td class="border-t border-gray-200 px-3 py-2.5 text-blue-950">{row.aiDeveloper}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="mt-4 rounded-[1.2rem] border border-gray-200 bg-gray-50 px-4 py-3">
			<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-gray-500 uppercase">Before you hit send</p>
			<div class="mt-2 grid gap-2 sm:grid-cols-2">
				{#each resource.finalChecklist.items as item}
					<div class="rounded-xl border border-white bg-white px-3 py-2 text-[0.74rem] leading-relaxed text-gray-800">
						{item}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
		<div class="grid gap-4 md:grid-cols-2">
			<article class="print-card rounded-[1.2rem] border border-blue-100 bg-blue-50 p-4">
				<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-blue-700 uppercase">Small changes</p>
				<h2 class="mt-1 text-lg font-black tracking-tight text-gray-950">
					Keep the chat short
				</h2>
				<ol class="print-steps mt-3 space-y-1.5 text-[0.75rem] leading-relaxed text-gray-700">
					<li>{resource.smallChangeGuidance.steps[0]}</li>
					<li>{resource.smallChangeGuidance.steps[1]}</li>
					<li>{resource.smallChangeGuidance.steps[2]}</li>
					<li>{resource.smallChangeGuidance.steps[3]}</li>
					<li>{resource.smallChangeGuidance.steps[4]}</li>
				</ol>
				<ul class="print-list mt-3 space-y-1.5 text-[0.74rem] leading-relaxed text-gray-700">
					{#each resource.smallChangeGuidance.reminders as item}
						<li>{item}</li>
					{/each}
				</ul>
			</article>

			<article class="print-card rounded-[1.2rem] border border-amber-100 bg-amber-50 p-4">
				<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-amber-700 uppercase">Bigger work</p>
				<h2 class="mt-1 text-lg font-black tracking-tight text-gray-950">
					Start with planning mode
				</h2>
				<ol class="print-steps mt-3 space-y-1.5 text-[0.75rem] leading-relaxed text-gray-700">
					<li>{resource.planningGuidance.steps[0]}</li>
					<li>{resource.planningGuidance.steps[1]}</li>
					<li>{resource.planningGuidance.steps[2]}</li>
					<li>{resource.planningGuidance.steps[3]}</li>
					<li>{resource.planningGuidance.steps[4]}</li>
				</ol>
				<ul class="print-list mt-3 space-y-1.5 text-[0.74rem] leading-relaxed text-gray-700">
					{#each resource.planningGuidance.reminders as item}
						<li>{item}</li>
					{/each}
				</ul>
			</article>
		</div>

		<div class="mt-4">
			<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-blue-600 uppercase">Copy-ready prompts</p>
			<h2 class="mt-1 text-2xl font-black tracking-tight text-gray-950">Two high-value examples</h2>
		</div>

		<div class="mt-3 grid gap-3">
			{#each resource.copyReadyPrompts.groups.slice(0, 2) as group}
				<section class="rounded-[1.1rem] border border-gray-200 bg-gray-50 p-3">
					<div class="grid gap-3 md:grid-cols-[0.32fr_0.68fr] md:items-start">
						<div>
							<h3 class="text-sm font-bold text-gray-950">{group.title}</h3>
							<p class="mt-1 text-[0.72rem] leading-relaxed text-gray-700">{group.description}</p>
						</div>
						<pre class="whitespace-pre-wrap rounded-xl bg-gray-900 p-3 font-mono text-[0.68rem] leading-relaxed text-gray-100"><code>{group.prompt}</code></pre>
					</div>
				</section>
			{/each}
		</div>
	</section>
</main>
