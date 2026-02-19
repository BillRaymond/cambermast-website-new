<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeo } from '$lib/seo';
	import { getEventTypeLabelUi, listEventUi } from '$lib/view-models/events';
	import type { EventUiModel } from '$lib/view-models/events';

	type FilterOption = 'all' | 'training' | `event:${string}`;

	type ArchiveEntry = {
		id: string;
		title: string;
		slug: string;
		eventType: string;
		eventTypeLabel: string;
		dateText: string;
		summary: string;
		statusLabel: string;
		recordingUrl?: string;
		slidesUrl?: string;
	};

	type EventTypeFilter = {
		key: string;
		label: string;
	};

	const pageMeta = getSeo('/events/archive');
	const nowMs = Date.now();
	const activeFilterDefault: FilterOption = 'all';
	let activeFilter: FilterOption = activeFilterDefault;

	const isPastEvent = (event: EventUiModel): boolean => {
		const startAtTimestamp = new Date(event.startAtUtc).valueOf();
		const endAtTimestamp = event.endAtUtc ? new Date(event.endAtUtc).valueOf() : startAtTimestamp;
		if (event.lifecycleStatus === 'canceled' || event.lifecycleStatus === 'completed') return true;
		if (!Number.isFinite(endAtTimestamp)) return false;
		return endAtTimestamp < nowMs;
	};

	const getArchiveStatusLabel = (event: EventUiModel): string => {
		if (event.lifecycleStatus === 'canceled') return 'Canceled';
		return 'Completed';
	};

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'America/Los_Angeles'
	});

	const toDateText = (event: EventUiModel): string => {
		const fallback = event.date?.trim();
		if (fallback) return fallback;
		const startAtTimestamp = new Date(event.startAtUtc).valueOf();
		if (!Number.isFinite(startAtTimestamp)) return 'Date TBD';
		return dateFormatter.format(startAtTimestamp);
	};

	const archiveEntries: ArchiveEntry[] = listEventUi()
		.filter((event) => isPastEvent(event))
		.sort((a, b) => {
			const aTs = new Date(a.endAtUtc ?? a.startAtUtc).valueOf();
			const bTs = new Date(b.endAtUtc ?? b.startAtUtc).valueOf();
			return bTs - aTs;
		})
		.map((event) => ({
			id: event.id,
			title: event.title,
			slug: event.slug,
			eventType: event.type,
			eventTypeLabel: getEventTypeLabelUi(event),
			dateText: toDateText(event),
			summary: event.summary,
			statusLabel: getArchiveStatusLabel(event),
			recordingUrl: event.links?.recordingUrl,
			slidesUrl: event.links?.slidesUrl
		}));

	const hiddenEventTypeFilterKeys = new Set(['training', 'training_session', 'event', 'other']);
	const normalizeFilterLabel = (value: string): string =>
		value.trim().toLowerCase().replace(/\s+/g, ' ');

	const eventTypeFilters: EventTypeFilter[] = Array.from(
		new Map(archiveEntries.map((entry) => [entry.eventType, entry.eventTypeLabel])).entries()
	)
		.map(([key, label]) => ({ key, label }))
		.filter((filter) => !hiddenEventTypeFilterKeys.has(filter.key))
		.filter((filter) => {
			const normalized = normalizeFilterLabel(filter.label);
			return normalized !== 'training' && normalized !== 'training session';
		});

	const getEventTypeChipLabel = (filter: EventTypeFilter): string => {
		if (filter.key === 'webinar') return `🎙️ ${filter.label}`;
		return filter.label;
	};

	const filterEntries = (entries: ArchiveEntry[], filter: FilterOption): ArchiveEntry[] => {
		if (filter === 'training') {
			return entries.filter((entry) => entry.eventType === 'training_session');
		}
		if (filter.startsWith('event:')) {
			const eventType = filter.slice('event:'.length);
			return entries.filter((entry) => entry.eventType === eventType);
		}
		return entries;
	};

	$: filteredArchiveEntries = filterEntries(archiveEntries, activeFilter);
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/events/archive" />

<h1 class="mb-6 text-3xl font-bold">Past events archive</h1>
<p class="max-w-3xl text-gray-700">
	Review completed and canceled events. Recaps and recordings are posted per event when available.
</p>

<section class="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
	<div
		class="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase"
	>
		<span class="text-[0.65rem]">Filter</span>
		<button
			type="button"
			onclick={() => (activeFilter = 'all')}
			aria-pressed={activeFilter === 'all'}
			class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase transition ${
				activeFilter === 'all'
					? 'border-blue-200 bg-blue-600/10 text-blue-700'
					: 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
			}`}
		>
			All
		</button>
		<button
			type="button"
			onclick={() => (activeFilter = 'training')}
			aria-pressed={activeFilter === 'training'}
			class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase transition ${
				activeFilter === 'training'
					? 'border-blue-200 bg-blue-600/10 text-blue-700'
					: 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
			}`}
		>
			Training
		</button>
		{#if eventTypeFilters.length}
			{#each eventTypeFilters as filter}
				<button
					type="button"
					onclick={() => (activeFilter = `event:${filter.key}`)}
					aria-pressed={activeFilter === `event:${filter.key}`}
					class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase transition ${
						activeFilter === `event:${filter.key}`
							? 'border-emerald-200 bg-emerald-600/10 text-emerald-700'
							: 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
					}`}
				>
					{getEventTypeChipLabel(filter)}
				</button>
			{/each}
		{/if}
	</div>

	{#if filteredArchiveEntries.length}
		<ul class="mt-4 space-y-3">
			{#each filteredArchiveEntries as entry}
				<li class="rounded-xl border border-slate-200 bg-slate-50 p-4">
					<div class="flex flex-wrap items-center gap-2">
						<span
							class="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-slate-700 uppercase"
						>
							{entry.statusLabel}
						</span>
						<span
							class="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-slate-600 uppercase"
						>
							{entry.eventTypeLabel}
						</span>
					</div>
					<p class="mt-2 text-sm font-semibold text-slate-900">
						<a
							href={`/events/${entry.slug}`}
							class="underline decoration-transparent underline-offset-4 transition hover:text-blue-900 hover:decoration-blue-200"
						>
							{entry.title}
						</a>
					</p>
					<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">{entry.dateText}</p>
					<p class="mt-1 text-sm text-slate-700">{entry.summary}</p>
					<div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
						{#if entry.recordingUrl}
							<a
								href={entry.recordingUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
							>
								Watch recording ↗
							</a>
						{/if}
						{#if entry.slidesUrl}
							<a
								href={entry.slidesUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
							>
								View slides ↗
							</a>
						{/if}
						{#if !entry.recordingUrl && !entry.slidesUrl}
							<span class="text-xs text-slate-500">No recap assets published for this event.</span>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-4 text-sm text-slate-600">No past events match the current filter.</p>
	{/if}
</section>

<p class="mt-6 text-sm text-gray-600">
	Want upcoming cohorts and live sessions instead?
	<a
		href="/events"
		class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
	>
		Return to the calendar →
	</a>
</p>
