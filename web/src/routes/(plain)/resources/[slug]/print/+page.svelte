<script lang="ts">
	import AiCodingPromptGuideContent from '$lib/components/resources/AiCodingPromptGuideContent.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const resource = data.resource;
	const seoTitle = `${resource.title} PDF | Cambermast`;
	const pagePath = `/resources/${resource.slug}/print`;
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
			font-family: 'Liberation Sans', Arial, Helvetica, sans-serif;
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
			.print-table,
			.print-keep-together {
				break-inside: avoid;
				page-break-inside: avoid;
				box-shadow: none;
			}

			pre,
			code {
				font-family: 'Liberation Mono', 'Courier New', monospace;
			}

			.print-page-break-after {
				break-after: page;
			}
		}
	</style>
</svelte:head>

<main class="print-main mx-auto flex max-w-5xl flex-col gap-4 px-5 py-6 text-[12px] text-gray-900 print:max-w-none print:px-0">
	<section class="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-start">
			<figure class="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white sm:w-48 sm:shrink-0">
				<img
					src={resource.heroImage}
					alt={resource.heroImageAlt}
					class="h-auto w-full object-contain"
				/>
			</figure>
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
			</div>
		</div>
	</section>

	<AiCodingPromptGuideContent resource={resource} variant="print" />
</main>
