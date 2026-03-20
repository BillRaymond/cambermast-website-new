<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import { buildTrainingBrochureModel } from '$lib/data/training/brochure';
	import type { PageData } from './$types';

	export let data: PageData;

	const brochure = buildTrainingBrochureModel(data.program);
	const seoTitle = `${brochure.title} Brochure | Cambermast`;
	const seoDescription = brochure.tagline;
	const pagePath = brochure.printUrl;
	const copyrightYear = new Date().getFullYear();
	const defaultOrigin = SITE_ORIGIN.replace(/\/$/, '');
	let brochureOrigin = defaultOrigin;
	let brochureAbsoluteUrl = `${defaultOrigin}${brochure.route}`;

	$: brochureOrigin = browser ? $page.url.origin.replace(/\/$/, '') : defaultOrigin;
	$: brochureAbsoluteUrl = `${brochureOrigin}${brochure.route}`;
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
		.brochure-list {
			list-style: none;
			padding-left: 0;
		}

		.brochure-list li {
			position: relative;
			padding-left: 1.1rem;
		}

		.brochure-list li::before {
			content: '•';
			position: absolute;
			left: 0;
			top: 0;
			color: currentColor;
			font-weight: 700;
		}

		body {
			background:
				radial-gradient(circle at top, rgba(191, 219, 254, 0.3), transparent 40%),
				linear-gradient(180deg, #eff6ff 0%, #ffffff 26%);
			color: #111827;
		}

		@media print {
			.brochure-main {
				display: block !important;
			}

			.brochure-main > * + * {
				margin-top: 1rem;
			}

			.brochure-main {
				padding-top: 0 !important;
				padding-bottom: 0 !important;
			}

			body {
				background: #fff;
			}

			a {
				color: inherit;
				text-decoration: none;
			}

			.brochure-cover {
				break-inside: avoid;
			}

			.brochure-card {
				break-inside: avoid;
				box-shadow: none;
				padding: 1.25rem !important;
			}

			.brochure-hero-heading {
				gap: 1rem !important;
			}

			.brochure-cover-title {
				font-size: 2rem !important;
				line-height: 1.1 !important;
			}

			.brochure-cover-tagline {
				font-size: 1.125rem !important;
				line-height: 1.5 !important;
			}

			.brochure-grid-section {
				display: block !important;
			}

			.brochure-grid-section > * + * {
				margin-top: 1.25rem;
			}

			.brochure-agenda {
				break-inside: avoid;
			}

			.print-page-break-after {
				display: block;
				break-after: page;
				page-break-after: always;
			}

			.brochure-agenda-heading {
				break-after: avoid-page;
				page-break-after: avoid;
			}

			.brochure-sidebar > * + * {
				margin-top: 1.25rem;
			}

			.brochure-list {
				font-size: 0.95rem;
			}

			.brochure-list li {
				padding-left: 1rem;
			}
		}
	</style>
</svelte:head>

<main class="brochure-main mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 text-gray-900 print:max-w-none print:px-0">
	<section class="brochure-cover px-2 print:px-0">
		<div class="grid gap-8 md:grid-cols-[1.5fr_0.9fr]">
			<div class="space-y-6">
				<div class="brochure-hero-heading grid gap-6 print:grid-cols-[10rem_1fr] print:items-start md:grid-cols-[11rem_1fr] md:items-start">
				{#if brochure.heroImage}
					<div class="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-blue-50 shadow-sm print:w-40">
						<img
							src={brochure.heroImage}
							alt={brochure.heroImageAlt}
							class="aspect-square h-full w-full object-cover"
						/>
					</div>
				{/if}

					<div>
						<p class="text-sm font-semibold tracking-[0.22em] text-blue-700 uppercase">
							Cambermast Training Brochure
						</p>
						{#if brochure.sku}
							<p class="mt-2 text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
								{brochure.sku}
							</p>
						{/if}
						<h1 class="brochure-cover-title mt-3 text-4xl font-bold tracking-tight text-gray-950">{brochure.title}</h1>
						{#if brochure.nickname}
							<p class="mt-2 text-base font-medium text-blue-700">{brochure.nickname}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-4 text-base leading-relaxed text-gray-700">
					<p class="brochure-cover-tagline max-w-3xl text-xl leading-relaxed text-gray-700">{brochure.tagline}</p>
					<p>{brochure.summary}</p>
					{#if brochure.secondarySummary}
						<p>{brochure.secondarySummary}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-4">
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
							<p class="mt-2 text-sm font-medium text-gray-900">
								{brochure.stats.format.join(' • ')}
							</p>
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

	{#if brochure.outcomes.length}
		<section class="px-2 print:px-0">
			<div class="brochure-card rounded-[1.75rem] border border-blue-100 bg-blue-50 p-6 shadow-sm break-inside-avoid">
				<h2 class="text-2xl font-semibold text-gray-950">Outcomes</h2>
				<ul class="brochure-list mt-4 space-y-3 text-gray-800">
					{#each brochure.outcomes as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	{#if brochure.audience.length}
		<section class="px-2 print:px-0">
			<div class="brochure-card rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm break-inside-avoid">
				<h2 class="text-2xl font-semibold text-gray-950">Who this is for</h2>
				<ul class="brochure-list mt-4 space-y-3 text-gray-700">
					{#each brochure.audience as item}
						<li>{item}</li>
					{/each}
				</ul>
				{#if brochure.audienceExamples.length}
					<h3 class="mt-6 text-lg font-semibold text-gray-950">Examples</h3>
					<ul class="brochure-list mt-3 space-y-3 text-gray-700">
						{#each brochure.audienceExamples as item}
							<li>{item}</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>
	{/if}

	{#if brochure.trainer}
		<section class={`px-2 print:px-0 ${brochure.agenda.length ? 'print-page-break-after' : ''}`}>
			<div class="brochure-card rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-sm break-inside-avoid">
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
				<p class="mt-5 text-sm leading-relaxed text-gray-700">{brochure.trainer.summary}</p>
				{#if brochure.trainer.highlights.length}
					<div class="mt-5">
						<ul class="brochure-list space-y-2 text-sm text-gray-700">
						{#each brochure.trainer.highlights as item}
							<li>{item}</li>
						{/each}
						</ul>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<section class="brochure-grid-section grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
		{#if brochure.agenda.length}
			<div class="brochure-agenda px-2 print:px-0">
				<h2 class="brochure-agenda-heading text-2xl font-semibold text-gray-950">Agenda highlights</h2>
				<div class="mt-5 grid gap-4">
					{#each brochure.agenda as block}
						<article class="brochure-card rounded-2xl border border-gray-100 bg-gray-50 p-4 break-inside-avoid">
							<h3 class="text-lg font-semibold text-gray-950">{block.title}</h3>
							<ul class="brochure-list mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
								{#each block.details as detail}
									<li>{detail}</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>
			</div>
		{/if}

		<div class="brochure-sidebar space-y-6">
			{#if brochure.takeaways.length}
				<section class="brochure-card rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm break-inside-avoid">
					<h2 class="text-2xl font-semibold text-gray-950">What you'll leave with</h2>
					<ul class="brochure-list mt-4 space-y-3 text-gray-700">
						{#each brochure.takeaways as item}
							<li>{item}</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if brochure.stats.environment || brochure.stats.partner}
				<section class="brochure-card rounded-[1.75rem] border border-amber-100 bg-amber-50 p-6 shadow-sm break-inside-avoid">
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
			<a href={brochureAbsoluteUrl} class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4">
				{brochureAbsoluteUrl}
			</a>
		</p>
	</footer>
</main>
