<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import { getTrainingProgram } from '$lib/data/training';
	import type { TrainingProgram, TrainingStat } from '$lib/data/training/types';

	const section = catalog.training;
	const pageHeading = `${section.catalogLabel ?? section.label} — Table View`;

	const normalizeLabel = (label?: string): string | undefined => label?.toLowerCase().trim();
	const findStat = (program: TrainingProgram | undefined, match: string): TrainingStat | undefined =>
		program?.stats?.find((stat) => normalizeLabel(stat.label) === normalizeLabel(match));

	const formatStatValue = (stat?: TrainingStat): string =>
		!stat
			? ''
			: Array.isArray(stat.value)
				? stat.value.join(', ')
				: stat.value;

	const items = (section.items ?? [])
		.filter((item) => item.published ?? true)
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
		.map((item) => {
			const program: TrainingProgram | undefined = item.route
				? getTrainingProgram(
						item.route
							.split('/')
							.filter(Boolean)
							.pop() ?? ''
					)
				: undefined;

			const duration = formatStatValue(findStat(program, 'duration'));
			const format = formatStatValue(findStat(program, 'format'));
			const cost = formatStatValue(findStat(program, 'cost'));

			return {
				title: item.title ?? program?.title ?? '',
				route: item.route ?? (program ? `/training/${program.slug}` : ''),
				sku: program?.sku ?? '',
				duration,
				format,
				cost,
				scheduleLabel: program?.primaryCta?.label ?? 'Schedule your team',
				scheduleUrl: program?.primaryCta?.url ?? '/contact',
				contactUrl: program?.secondaryCta?.url ?? '/contact',
				contactLabel: program?.secondaryCta?.label ?? 'Talk with Bill',
				summary: item.summary ?? program?.tagline ?? ''
			};
		});
</script>

<svelte:head>
	<title>{pageHeading}</title>
</svelte:head>

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
		<thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
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
								<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
									({program.sku})
								</p>
							{/if}
							{#if program.summary}
								<p class="text-xs text-gray-500">{program.summary}</p>
							{/if}
						</div>
					</td>
					<td class="border-t px-4 py-3">{program.duration || '—'}</td>
					<td class="border-t px-4 py-3">{program.format || '—'}</td>
					<td class="border-t px-4 py-3">{program.cost || '—'}</td>
					<td class="border-t px-4 py-3 max-w-xs">{program.summary || '—'}</td>
					<td class="border-t px-4 py-3">
						<div class="flex flex-col gap-2">
							<a
								href={program.scheduleUrl}
								class="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
							>
								{program.scheduleLabel}
							</a>
							<a
								href={program.contactUrl}
								class="inline-flex items-center justify-center rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-500 hover:text-blue-900"
							>
								{program.contactLabel}
							</a>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
