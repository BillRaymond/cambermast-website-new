<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import { getTrainingProgram } from '$lib/data/training';
	import type { TrainingProgram, TrainingStat } from '$lib/data/training/types';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getProgramCertificateText } from '$lib/data/training/program-meta';

	const section = catalog.training;
	const pageTitle = 'Cambermast Training Programs';

	const normalizeLabel = (label?: string): string | undefined => label?.toLowerCase().trim();
	const findStat = (
		program: TrainingProgram | undefined,
		match: string
	): TrainingStat | undefined =>
		program?.stats?.find((stat) => normalizeLabel(stat.label) === normalizeLabel(match));

	const statToString = (stat?: TrainingStat): string =>
		!stat ? '' : Array.isArray(stat.value) ? stat.value.join(', ') : stat.value;

	const statToArray = (stat?: TrainingStat): string[] =>
		!stat ? [] : Array.isArray(stat.value) ? stat.value : [stat.value];

	const items = (section.items ?? [])
		.filter((item) => item.published ?? true)
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
		.map((item) => {
			const slug = item.route?.split('/').filter(Boolean).pop() ?? '';
			const program: TrainingProgram | undefined = slug ? getTrainingProgram(slug) : undefined;

			const duration = statToString(findStat(program, 'duration'));
			const certificateText = getProgramCertificateText(program);
			const formatLines = [
				...statToArray(findStat(program, 'format')),
				...(certificateText ? [certificateText] : [])
			];
			const cost = statToString(findStat(program, 'cost'));

			return {
				title: item.title ?? program?.title ?? '',
				route: item.route ?? (program ? `/training/${program.slug}` : ''),
				sku: program?.sku ?? '',
				duration,
				formatLines,
				cost,
				summary: item.summary ?? program?.tagline ?? '',
				certificateText,
				videoUrl: program?.videoUrl
			};
		});

	const copyrightYear = new Date().getFullYear();
	const pageMeta = getSeo('/training/print');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/training/print" />

<svelte:head>
	<style>
		@media print {
			body {
				background: #fff;
			}
			a {
				color: inherit;
				text-decoration: none;
			}
		}
	</style>
</svelte:head>

<main class="mx-auto max-w-5xl px-6 py-10 text-gray-900">
	<header class="mb-8 flex flex-col items-center gap-4 text-center">
		<a href="/training/table" class="inline-flex items-center justify-center">
			<img src="/images/cambermast-logo-full.png" alt="Cambermast logo" class="h-16 w-auto" />
		</a>
		<h1 class="text-3xl font-bold tracking-wide uppercase">{pageTitle}</h1>
		<p class="text-xs text-gray-600">
			All programs follow Cambermast's
			<a class="font-semibold text-blue-700 underline" href="/training/terms"
				>Training Terms &amp; Conditions</a
			>.
		</p>
	</header>

	<table class="w-full border-collapse text-left text-sm leading-relaxed">
		<thead>
			<tr
				class="border-y border-gray-300 bg-gray-100 text-xs font-semibold tracking-wide uppercase"
			>
				<th class="px-4 py-3">Program</th>
				<th class="px-4 py-3">Duration</th>
				<th class="px-4 py-3">Format</th>
				<th class="px-4 py-3">Cost</th>
			</tr>
		</thead>
		<tbody>
			{#each items as program}
				<tr class="border-b border-gray-200 align-top">
					<td class="px-4 py-3">
						<p class="font-semibold text-gray-900">{program.title}</p>
						{#if program.sku}
							<p class="text-xs font-semibold tracking-wide text-gray-600 uppercase">
								({program.sku})
							</p>
						{/if}
						{#if program.summary}
							<p class="mt-1 text-xs text-gray-600">{program.summary}</p>
						{/if}
						{#if program.certificateText || program.videoUrl}
							<div class="mt-1 flex flex-col gap-1 text-xs font-semibold text-blue-700">
								{#if program.certificateText}
									<p>{program.certificateText}</p>
								{/if}
								{#if program.videoUrl}
									<a
										href={program.videoUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1 underline decoration-blue-200 underline-offset-4"
									>
										Watch the trailer
										<span aria-hidden="true">↗</span>
									</a>
								{/if}
							</div>
						{/if}
					</td>
					<td class="px-4 py-3">{program.duration || '-'}</td>
					<td class="px-4 py-3">
						{#if program.formatLines.length}
							{#each program.formatLines as line}
								<div>{line}</div>
							{/each}
						{:else}
							-
						{/if}
					</td>
					<td class="px-4 py-3">{program.cost || '-'}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<footer class="mt-12 text-center text-xs text-gray-500">
		<p>© {copyrightYear} Cambermast LLC. · AI Agility in Action™️ · All rights reserved.</p>
	</footer>
</main>
