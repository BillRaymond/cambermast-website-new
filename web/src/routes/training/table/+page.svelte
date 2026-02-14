<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import { listTrainingPrograms } from '$lib/data/training';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import {
		findProgramStat,
		getProgramCertificateText,
		statValueToArray,
		statValueToText
	} from '$lib/data/training/program-meta';
	import { listUpcomingTrainingEntriesForProgram } from '$lib/data/training/schedule';

	const section = catalog.training;
	const pageHeading = `${section.catalogLabel ?? section.label}`;

	const items = listTrainingPrograms()
		.filter((program) => program.catalog?.published ?? true)
		.sort((a, b) => (a.catalog?.order ?? 999) - (b.catalog?.order ?? 999))
		.map((program) => {
			const duration = statValueToText(findProgramStat(program, 'duration')?.value) ?? '';
			const certificateText = getProgramCertificateText(program);
			const registerableSession = listUpcomingTrainingEntriesForProgram(program?.sku)[0];
			const formatLines = [
				...statValueToArray(findProgramStat(program, 'format')?.value),
				...(certificateText ? [certificateText] : [])
			];
			const cost = statValueToText(findProgramStat(program, 'cost')?.value) ?? '';

			return {
				title: program.title,
				route: program.route,
				sku: program.sku ?? '',
				duration,
				formatLines,
				cost,
				certificateText,
				videoUrl: program.videoUrl,
				scheduleLabel: program.primaryCta?.label ?? 'Schedule your team',
				scheduleUrl: program.primaryCta?.url ?? '/contact',
				registerUrl: registerableSession?.registerUrl,
				registerLabel: registerableSession?.registerLabel ?? 'Register now',
				summary: program.catalog?.summary ?? program.tagline
			};
		});

	const pageMeta = getSeo('/training/table');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/training/table" />

<h1 class="mb-2 text-3xl font-bold">{pageHeading}</h1>
<p class="mb-6 text-gray-700">
	Compare programs at a glance. This view keeps the core details handy for proposals, invoices, or
	internal planning.
</p>
<a
	href="/training"
	class="mb-6 inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-500 hover:text-blue-900"
>
	← Back to training
</a>
<a
	href="/training/print"
	target="_blank"
	rel="noopener"
	class="mb-8 inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-500 hover:text-blue-900 print:hidden"
>
	🖨️ Print-friendly view
</a>

<div class="overflow-x-auto rounded-2xl border bg-white shadow-sm">
	<table class="w-full min-w-[720px] table-auto border-collapse text-left">
		<thead class="bg-gray-50 text-xs font-semibold tracking-wide text-gray-600 uppercase">
			<tr>
				<th class="border-b px-4 py-3">Program</th>
				<th class="border-b px-4 py-3">Duration</th>
				<th class="border-b px-4 py-3">Format</th>
				<th class="border-b px-4 py-3">Cost</th>
				<th class="border-b px-4 py-3">Summary</th>
				<th class="border-b px-4 py-3">Actions</th>
			</tr>
		</thead>
		<tbody class="text-sm text-gray-800">
			{#each items as program}
				<tr class="even:bg-gray-50/70">
					<td class="border-t px-4 py-3 align-top">
						<div class="flex flex-col gap-0.5">
							<a
								href={program.route}
								class="font-semibold text-blue-700 transition hover:text-blue-900"
							>
								{program.title}
							</a>
							{#if program.sku}
								<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
									({program.sku})
								</p>
							{/if}
							{#if program.summary}
								<p class="text-xs text-gray-500">{program.summary}</p>
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
											class="inline-flex items-center gap-1 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-800"
										>
											Watch the trailer
											<span aria-hidden="true">↗</span>
										</a>
									{/if}
								</div>
							{/if}
						</div>
					</td>
					<td class="border-t px-4 py-3">{program.duration || '-'}</td>
					<td class="border-t px-4 py-3">
						{#if program.formatLines.length}
							{#each program.formatLines as line}
								<div>{line}</div>
							{/each}
						{:else}
							-
						{/if}
					</td>
					<td class="border-t px-4 py-3">{program.cost || '-'}</td>
					<td class="max-w-xs border-t px-4 py-3">{program.summary || '-'}</td>
					<td class="border-t px-4 py-3">
						<div class="flex flex-col gap-2">
							{#if program.registerUrl}
								<a
									href={program.registerUrl}
									class="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-center text-xs font-semibold text-white shadow transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span
										class="h-2 w-2 rounded-full bg-blue-200 shadow-[0_0_10px_rgba(147,197,253,0.85)]"
										aria-hidden="true"
									></span>
									{program.registerLabel}
								</a>
							{/if}
							<a
								href={program.scheduleUrl}
								class="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
							>
								{program.scheduleLabel}
							</a>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
