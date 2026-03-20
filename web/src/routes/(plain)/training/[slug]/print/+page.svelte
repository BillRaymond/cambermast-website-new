<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { buildTrainingBrochureModel } from '$lib/data/training/brochure';
	import type { PageData } from './$types';

	export let data: PageData;

	const brochure = buildTrainingBrochureModel(data.program);
	const seoTitle = `${brochure.title} Brochure | Cambermast`;
	const seoDescription = brochure.tagline;
	const pagePath = brochure.printUrl;
	const copyrightYear = new Date().getFullYear();
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	path={pagePath}
	image={brochure.heroImage}
	imageAlt={brochure.heroImageAlt}
	type="article"
/>

<svelte:head>
	<meta name="robots" content="noindex,follow" />
	<style>
		:global(body) {
			background:
				radial-gradient(circle at top, rgba(191, 219, 254, 0.3), transparent 40%),
				linear-gradient(180deg, #eff6ff 0%, #ffffff 26%);
			color: #111827;
		}

		@media print {
			:global(body) {
				background: #fff;
			}

			:global(a) {
				color: inherit;
				text-decoration: none;
			}
		}
	</style>
</svelte:head>

<main class="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 text-gray-900 print:max-w-none print:px-0">
	<section class="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-lg print:shadow-none">
		<div class="grid gap-8 p-8 md:grid-cols-[1.5fr_0.9fr]">
			<div>
				<p class="text-sm font-semibold tracking-[0.22em] text-blue-700 uppercase">
					Cambermast Training Brochure
				</p>
				{#if brochure.sku}
					<p class="mt-2 text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
						{brochure.sku}
					</p>
				{/if}
				<h1 class="mt-3 text-4xl font-bold tracking-tight text-gray-950">{brochure.title}</h1>
				{#if brochure.nickname}
					<p class="mt-2 text-base font-medium text-blue-700">{brochure.nickname}</p>
				{/if}
				<p class="mt-4 max-w-2xl text-xl leading-relaxed text-gray-700">{brochure.tagline}</p>
				<div class="mt-6 space-y-3 text-base leading-relaxed text-gray-700">
					<p>{brochure.summary}</p>
					{#if brochure.secondarySummary}
						<p>{brochure.secondarySummary}</p>
					{/if}
				</div>
				<div class="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
					<a
						href={brochure.route}
						class="rounded-full bg-blue-700 px-4 py-2 text-white transition hover:bg-blue-800"
					>
						View full program
					</a>
					<a
						href={brochure.pdfUrl}
						rel="external"
						class="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
					>
						Download PDF
					</a>
				</div>
			</div>

			<div class="space-y-4">
				{#if brochure.heroImage}
					<img
						src={brochure.heroImage}
						alt={brochure.heroImageAlt}
						class="w-full rounded-[1.5rem] border border-blue-100 object-cover shadow-sm"
					/>
				{/if}
				<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
					{#if brochure.stats.duration}
						<div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
							<p class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Duration</p>
							<p class="mt-1 text-sm font-medium text-gray-900">{brochure.stats.duration}</p>
						</div>
					{/if}
					{#if brochure.stats.format.length}
						<div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
							<p class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Format</p>
							<ul class="mt-2 space-y-1 text-sm font-medium text-gray-900">
								{#each brochure.stats.format as line}
									<li>{line}</li>
								{/each}
							</ul>
						</div>
					{/if}
					{#if brochure.stats.cost}
						<div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
							<p class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Cost</p>
							<p class="mt-1 text-sm font-medium text-gray-900">{brochure.stats.cost}</p>
						</div>
					{/if}
					{#if brochure.stats.certificate}
						<div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
							<p class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Certificate</p>
							<p class="mt-1 text-sm font-medium text-gray-900">{brochure.stats.certificate}</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<section class="grid gap-6 md:grid-cols-2">
		{#if brochure.audience.length}
			<div class="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm break-inside-avoid">
				<h2 class="text-2xl font-semibold text-gray-950">Who this is for</h2>
				<ul class="mt-4 space-y-3 text-gray-700">
					{#each brochure.audience as item}
						<li class="flex gap-3">
							<span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500"></span>
							<span>{item}</span>
						</li>
					{/each}
				</ul>
				{#if brochure.audienceExamples.length}
					<h3 class="mt-6 text-lg font-semibold text-gray-950">Examples</h3>
					<ul class="mt-3 space-y-3 text-gray-700">
						{#each brochure.audienceExamples as item}
							<li class="flex gap-3">
								<span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-400"></span>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}

		{#if brochure.outcomes.length}
			<div class="rounded-[1.75rem] border border-blue-100 bg-blue-50 p-6 shadow-sm break-inside-avoid">
				<h2 class="text-2xl font-semibold text-gray-950">Outcomes</h2>
				<ul class="mt-4 space-y-3 text-gray-800">
					{#each brochure.outcomes as item}
						<li class="flex gap-3">
							<span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600"></span>
							<span>{item}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</section>

	<section class="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
		{#if brochure.agenda.length}
			<div class="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="text-2xl font-semibold text-gray-950">Agenda highlights</h2>
				<div class="mt-5 grid gap-4">
					{#each brochure.agenda as block}
						<article class="rounded-2xl border border-gray-100 bg-gray-50 p-4 break-inside-avoid">
							<h3 class="text-lg font-semibold text-gray-950">{block.title}</h3>
							<ul class="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
								{#each block.details as detail}
									<li class="flex gap-3">
										<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"></span>
										<span>{detail}</span>
									</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>
			</div>
		{/if}

		<div class="space-y-6">
			{#if brochure.takeaways.length}
				<section class="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm break-inside-avoid">
					<h2 class="text-2xl font-semibold text-gray-950">What you'll leave with</h2>
					<ul class="mt-4 space-y-3 text-gray-700">
						{#each brochure.takeaways as item}
							<li class="flex gap-3">
								<span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500"></span>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if brochure.trainer}
				<section class="rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-sm break-inside-avoid">
					<p class="text-sm font-semibold tracking-wide text-blue-700 uppercase">
						{brochure.trainer.title}
					</p>
					<div class="mt-4 flex items-start gap-4">
						{#if brochure.trainer.photo}
							<img
								src={brochure.trainer.photo}
								alt={brochure.trainer.photoAlt}
								class="h-20 w-20 rounded-2xl object-cover"
							/>
						{/if}
						<div>
							<h2 class="text-2xl font-semibold text-gray-950">{brochure.trainer.name}</h2>
							<p class="text-sm font-medium text-blue-700">{brochure.trainer.role}</p>
						</div>
					</div>
					<p class="mt-4 text-sm leading-relaxed text-gray-700">{brochure.trainer.summary}</p>
					{#if brochure.trainer.highlights.length}
						<ul class="mt-4 space-y-2 text-sm text-gray-700">
							{#each brochure.trainer.highlights as item}
								<li class="flex gap-3">
									<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"></span>
									<span>{item}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/if}

			{#if brochure.stats.environment || brochure.stats.partner}
				<section class="rounded-[1.75rem] border border-amber-100 bg-amber-50 p-6 shadow-sm break-inside-avoid">
					<h2 class="text-2xl font-semibold text-gray-950">Why teams choose this program</h2>
					<div class="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
						{#if brochure.stats.environment}
							<p>{brochure.stats.environment}</p>
						{/if}
						{#if brochure.stats.partner}
							<p>{brochure.stats.partner}</p>
						{/if}
					</div>
				</section>
			{/if}
		</div>
	</section>

	<footer class="flex flex-col gap-2 border-t border-gray-200 pt-4 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
		<p>Cambermast LLC · AI Agility in Action · {copyrightYear}</p>
		<p>
			<a href={brochure.route} class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4">
				{brochure.route}
			</a>
		</p>
	</footer>
</main>
