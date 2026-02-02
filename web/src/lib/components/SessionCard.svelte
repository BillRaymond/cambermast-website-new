<script lang="ts">
	export let title: string;
	export let date: string | undefined;
	export let time: string | string[] | undefined;
	export let location: string | undefined;
	export let eyebrow: string | undefined;
	export let subtitle: string | undefined;
	export let ctaUrl: string | undefined;
	export let ctaLabel = 'Register ↗';
	export let statusLabel: string | undefined;
	export let scheduleTeam = false;
	export let tone: 'upcoming' | 'happening' | 'neutral' = 'upcoming';

	$: timeLines = Array.isArray(time) ? time : time ? [time] : [];
	$: toneClasses =
		tone === 'happening'
			? 'border-amber-100 bg-amber-50/70 shadow-sm'
			: tone === 'neutral'
				? 'border-slate-200 bg-slate-50/70 shadow-sm'
				: 'border-blue-100 bg-white shadow-sm';
	$: eyebrowClasses =
		tone === 'happening'
			? 'text-amber-700'
			: tone === 'neutral'
				? 'text-slate-600'
				: 'text-blue-600';
	$: statusClasses =
		tone === 'happening'
			? 'border-amber-200 bg-white text-amber-700'
			: tone === 'neutral'
				? 'border-slate-200 bg-white text-slate-600'
				: 'border-blue-100 bg-blue-50 text-blue-700';
</script>

<article class={`flex w-full rounded-xl border p-4 ${toneClasses}`}>
	<div class="flex w-full flex-wrap items-end gap-3">
		<div class="min-w-[12rem] flex-1 space-y-1.5">
			{#if eyebrow}
				<p class={`text-[0.65rem] font-semibold uppercase tracking-wide ${eyebrowClasses}`}>
					{eyebrow}
				</p>
			{/if}
			{#if ctaUrl}
				<a
					href={ctaUrl}
					class="text-sm font-semibold text-gray-900 transition hover:text-blue-500"
				>
					{title}
				</a>
			{:else}
				<p class="text-sm font-semibold text-gray-900">{title}</p>
			{/if}
			{#if subtitle}
				<p class="text-xs font-medium text-gray-600">{subtitle}</p>
			{/if}
			{#if date}
				<p class="text-sm text-gray-700">{date}</p>
			{/if}
			{#if timeLines.length}
				<div class="space-y-1 text-xs text-gray-500">
					{#each timeLines as timeEntry}
						<p>{timeEntry}</p>
					{/each}
				</div>
			{/if}
			{#if location}
				<p class="text-xs text-gray-500">{location}</p>
			{/if}
		</div>
		{#if ctaUrl}
			<a
				href={ctaUrl}
				class="ml-auto inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
				class:schedule-team-button={scheduleTeam}
			>
				{ctaLabel}
			</a>
		{:else if statusLabel}
			<div
				class={`ml-auto rounded-lg border px-3 py-2 text-center text-xs font-semibold ${statusClasses}`}
			>
				{statusLabel}
			</div>
		{/if}
	</div>
</article>
