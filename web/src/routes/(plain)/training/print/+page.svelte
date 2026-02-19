<script lang="ts">
	import { listTrainingPrograms } from '$lib/data/training';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import {
		findProgramStat,
		getProgramCertificateText,
		statValueToArray,
		statValueToText
	} from '$lib/data/training/program-meta';

	const pageTitle = 'Cambermast Training Programs';

	const items = listTrainingPrograms()
		.filter((program) => program.catalog?.published ?? true)
		.sort((a, b) => (a.catalog?.order ?? 999) - (b.catalog?.order ?? 999))
		.map((program) => {
			const duration = statValueToText(findProgramStat(program, 'duration')?.value) ?? '';
			const certificateText = getProgramCertificateText(program);
			const formatLines = [...statValueToArray(findProgramStat(program, 'format')?.value)];
			const cost = statValueToText(findProgramStat(program, 'cost')?.value) ?? '';

			return {
				title: program.title,
				route: program.route,
				sku: program.sku ?? '',
				duration,
				formatLines,
				cost,
				summary: program.catalog?.summary ?? program.tagline,
				certificateText,
				videoUrl: program.videoUrl
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
							<div class="mt-1.5 flex flex-wrap items-center gap-2">
								{#if program.certificateText}
									<span
										class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[0.7rem] font-medium text-blue-700/80 normal-case"
									>
										📜 Certificate included
									</span>
								{/if}
								{#if program.videoUrl}
									<a
										href={program.videoUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[0.7rem] font-medium text-blue-700/80 normal-case"
									>
										🎬 Watch the trailer
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
