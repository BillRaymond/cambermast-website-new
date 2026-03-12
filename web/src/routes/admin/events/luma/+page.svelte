<script lang="ts">
	import { browser } from '$app/environment';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import EventCard from '$lib/components/events/EventCard.svelte';
	import type {
		AdminEventLumaEntry,
		AdminEventLumaOccurrence
	} from '$lib/view-models/admin-event-luma';
	import type { PageData } from './$types';

	export let data: PageData;

	type OccurrenceFilter = 'all' | AdminEventLumaOccurrence;

	const pageMeta = {
		title: 'Luma event copy helper | Admin | Cambermast',
		description: 'Internal helper for assembling copy-ready event details for Luma.'
	};

	const events = data.events ?? [];
	const occurrenceLabels: Record<OccurrenceFilter, string> = {
		all: 'All',
		future: 'Future',
		current: 'Current',
		past: 'Past',
		canceled_postponed: 'Canceled/Postponed'
	};

	let search = '';
	let occurrenceFilter: OccurrenceFilter = 'all';
	let onlyMissingRegistration = true;
	let selectedSlug = events[0]?.slug ?? '';
	let copiedKey = '';
	let copiedLabel = 'Copied';
	let copyError = '';

	const setCopied = (key: string, label = 'Copied') => {
		copiedKey = key;
		copiedLabel = label;
		setTimeout(() => {
			if (copiedKey === key) {
				copiedKey = '';
				copiedLabel = 'Copied';
			}
		}, 1200);
	};

	const iconClass = (key: string): string =>
		`inline-flex items-center rounded border px-3 py-1.5 text-xs font-semibold transition ${
			copiedKey === key
				? 'border-emerald-200 bg-emerald-50 text-emerald-800'
				: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900'
		} ${copiedKey === key ? 'scale-[1.02]' : 'scale-100'} motion-safe:transition-transform`;

	const countByOccurrence = (occurrence: OccurrenceFilter): number =>
		events.filter((event) => occurrence === 'all' || event.occurrence === occurrence).length;

	$: normalizedSearch = search.trim().toLowerCase();
	$: filteredEvents = events.filter((event) => {
		if (onlyMissingRegistration && event.hasLumaRegistration) return false;
		if (occurrenceFilter !== 'all' && event.occurrence !== occurrenceFilter) return false;
		if (normalizedSearch && !event.searchText.includes(normalizedSearch)) return false;
		return true;
	});
	$: if (filteredEvents.length && !filteredEvents.some((event) => event.slug === selectedSlug)) {
		selectedSlug = filteredEvents[0].slug;
	}
	$: if (!filteredEvents.length && selectedSlug) selectedSlug = '';
	$: selectedEvent = filteredEvents.find((event) => event.slug === selectedSlug) ?? null;

	const copyToClipboard = async (value: string, key: string, label = 'Copied') => {
		copyError = '';
		if (!browser || !navigator.clipboard) {
			copyError = 'Clipboard access is unavailable in this browser.';
			return;
		}

		try {
			await navigator.clipboard.writeText(value);
			setCopied(key, label);
		} catch (error) {
			console.warn('Unable to copy text', error);
			copyError = 'Unable to copy to the clipboard.';
		}
	};

	const copyEventImage = async (entry: AdminEventLumaEntry) => {
		copyError = '';
		if (
			!browser ||
			!navigator.clipboard ||
			typeof ClipboardItem === 'undefined'
		) {
			copyError = 'Image clipboard copy is unavailable in this browser.';
			return;
		}
		if (!entry.imageCopyCandidates.length) {
			copyError = 'No image is available for this event.';
			return;
		}

		for (const candidate of entry.imageCopyCandidates) {
			try {
				const response = await fetch(candidate);
				if (!response.ok) continue;
				const blob = await response.blob();
				if (!blob.size) continue;
				const mimeType =
					blob.type ||
					(candidate.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg');
				await navigator.clipboard.write([new ClipboardItem({ [mimeType]: blob })]);
				const usedFallback = mimeType === 'image/jpeg' || candidate.toLowerCase().includes('.jp');
				setCopied(
					`copy:image:${entry.slug}`,
					usedFallback ? 'Copied JPG' : 'Copied PNG'
				);
				return;
			} catch (error) {
				console.warn('Unable to copy image candidate', candidate, error);
			}
		}

		copyError = 'Unable to copy the event image. PNG was unavailable and JPG fallback also failed.';
	};
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/admin/events/luma"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Luma event copy helper</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		Find internal events, review the existing calendar card, and copy a Luma-ready event name,
		description, and image without changing the source registry content.
	</p>
</header>

<section class="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
	<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div class="min-w-0 flex-1">
			<label class="text-xs font-semibold tracking-wide text-gray-500 uppercase" for="luma-search">
				Search events
			</label>
			<input
				id="luma-search"
				bind:value={search}
				type="search"
				placeholder="Search by event name, slug, id, type, or partner"
				class="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
			/>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				class={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
					onlyMissingRegistration
						? 'border-blue-200 bg-blue-50 text-blue-800'
						: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900'
				}`}
				on:click={() => (onlyMissingRegistration = !onlyMissingRegistration)}
			>
				{onlyMissingRegistration ? 'Missing Luma link only' : 'Include linked events'}
			</button>
		</div>
	</div>

	<div class="mt-4 flex flex-wrap gap-2">
		{#each Object.entries(occurrenceLabels) as [key, label]}
			<button
				type="button"
				class={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
					occurrenceFilter === key
						? 'border-blue-200 bg-blue-50 text-blue-800'
						: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900'
				}`}
				on:click={() => (occurrenceFilter = key as OccurrenceFilter)}
			>
				{label} ({countByOccurrence(key as OccurrenceFilter)})
			</button>
		{/each}
	</div>

	<p class="mt-4 text-sm text-gray-600">
		Showing <span class="font-semibold text-gray-900">{filteredEvents.length}</span> of
		<span class="font-semibold text-gray-900">{events.length}</span> internal events.
	</p>

	{#if copyError}
		<p class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
			{copyError}
		</p>
	{/if}
</section>

<section class="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
	<div class="space-y-4">
		{#if filteredEvents.length}
			{#each filteredEvents as entry}
				<div
					class={`rounded-3xl border p-3 transition ${
						selectedEvent?.slug === entry.slug
							? 'border-blue-200 bg-blue-50/40 shadow-sm'
							: 'border-gray-200 bg-white'
					}`}
				>
					<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
						<div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
							<span>{occurrenceLabels[entry.occurrence]}</span>
							{#if entry.hasLumaRegistration}
								<span class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
									Has Luma link
								</span>
							{:else}
								<span class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800">
									Missing Luma link
								</span>
							{/if}
						</div>
						<button
							type="button"
							class={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
								selectedEvent?.slug === entry.slug
									? 'border-blue-200 bg-blue-50 text-blue-800'
									: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900'
							}`}
							on:click={() => (selectedSlug = entry.slug)}
						>
							{selectedEvent?.slug === entry.slug ? 'Selected' : 'Select'}
						</button>
					</div>

					<EventCard
						title={entry.card.title}
						tagline={entry.card.tagline}
						date={entry.card.date}
						time={entry.card.time}
						location={entry.card.location}
						hostText={entry.card.hostText}
						image={entry.card.image}
						imageAlt={entry.card.imageAlt}
						certificateText={entry.card.certificateText}
						videoUrl={entry.card.videoUrl}
						typeLabel={entry.card.typeLabel}
						registerUrl={entry.card.registerUrl}
						registerLabel={entry.card.registerLabel}
						statusLabel={entry.card.statusLabel}
						startTimestamp={entry.card.startTimestamp}
						learnMoreUrl={entry.card.learnMoreUrl}
						partnerText={entry.card.partnerText}
						speakerText={entry.card.speakerText}
						tone={entry.card.tone}
						variant="calendar"
						enableLiveCountdown={true}
					/>
				</div>
			{/each}
		{:else}
			<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-600">
				No events match the current search and filter settings.
			</div>
		{/if}
	</div>

	<div class="xl:sticky xl:top-6 xl:self-start">
		{#if selectedEvent}
			<section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Selected event</p>
						<h2 class="mt-2 text-xl font-semibold text-gray-900">{selectedEvent.title}</h2>
						<p class="mt-1 text-sm text-gray-600">
							<a class="text-blue-700 hover:text-blue-900 hover:underline" href={selectedEvent.eventUrl}>
								{selectedEvent.eventUrl}
							</a>
						</p>
					</div>
					<div class="text-right text-xs text-gray-500">
						<p>{occurrenceLabels[selectedEvent.occurrence]}</p>
						<p class="mt-1">{selectedEvent.typeLabel}</p>
					</div>
				</div>

				<div class="mt-6 space-y-6">
					<div>
						<div class="flex items-center justify-between gap-3">
							<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Image</p>
							<button
								type="button"
								class={iconClass(`copy:image:${selectedEvent.slug}`)}
								on:click={() => copyEventImage(selectedEvent)}
							>
								{copiedKey === `copy:image:${selectedEvent.slug}` ? copiedLabel : selectedEvent.imageCopyLabel}
							</button>
						</div>
						{#if selectedEvent.previewImageUrl}
							<img
								src={selectedEvent.previewImageUrl}
								alt={selectedEvent.imageAlt}
								class="mt-3 aspect-[3/2] w-full rounded-2xl border border-gray-200 object-cover"
								loading="lazy"
							/>
							<p class="mt-2 text-xs text-gray-500">
								Tries PNG first, then JPG/JPEG if PNG is unavailable.
							</p>
						{:else}
							<p class="mt-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-600">
								No image is currently available for this event.
							</p>
						{/if}
					</div>

					<div>
						<div class="flex items-center justify-between gap-3">
							<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Event name</p>
							<button
								type="button"
								class={iconClass(`copy:name:${selectedEvent.slug}`)}
								on:click={() =>
									copyToClipboard(selectedEvent.nameCopy, `copy:name:${selectedEvent.slug}`)
								}
							>
								{copiedKey === `copy:name:${selectedEvent.slug}` ? copiedLabel : 'Copy'}
							</button>
						</div>
						<input
							readonly
							class="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none"
							value={selectedEvent.nameCopy}
						/>
					</div>

					<div>
						<div class="flex items-center justify-between gap-3">
							<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
								Start date | start time | end time
							</p>
							<button
								type="button"
								class={iconClass(`copy:start:${selectedEvent.slug}`)}
								on:click={() =>
									copyToClipboard(
										selectedEvent.startDateTimeCopy,
										`copy:start:${selectedEvent.slug}`
									)
								}
							>
								{copiedKey === `copy:start:${selectedEvent.slug}` ? copiedLabel : 'Copy'}
							</button>
						</div>
						<input
							readonly
							class="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none"
							value={selectedEvent.startDateTimeCopy}
						/>
					</div>

					<div>
						<div class="flex items-center justify-between gap-3">
							<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Tagline</p>
							<button
								type="button"
								class={iconClass(`copy:tagline:${selectedEvent.slug}`)}
								on:click={() =>
									copyToClipboard(selectedEvent.tagline, `copy:tagline:${selectedEvent.slug}`)
								}
							>
								{copiedKey === `copy:tagline:${selectedEvent.slug}` ? copiedLabel : 'Copy'}
							</button>
						</div>
						<input
							readonly
							class="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none"
							value={selectedEvent.tagline}
						/>
					</div>

					<div>
						<div class="flex items-center justify-between gap-3">
							<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Description</p>
							<button
								type="button"
								class={iconClass(`copy:description:${selectedEvent.slug}`)}
								on:click={() =>
									copyToClipboard(
										selectedEvent.descriptionCopy,
										`copy:description:${selectedEvent.slug}`
									)
								}
							>
								{copiedKey === `copy:description:${selectedEvent.slug}` ? copiedLabel : 'Copy'}
							</button>
						</div>
						<textarea
							readonly
							rows="10"
							class="mt-3 h-56 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 focus:outline-none"
							value={selectedEvent.descriptionCopy}
						></textarea>
					</div>

					<div>
						<div class="flex items-center justify-between gap-3">
							<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Price</p>
							<button
								type="button"
								class={iconClass(`copy:price:${selectedEvent.slug}`)}
								on:click={() =>
									copyToClipboard(selectedEvent.priceCopy, `copy:price:${selectedEvent.slug}`)
								}
								disabled={!selectedEvent.priceCopy}
							>
								{copiedKey === `copy:price:${selectedEvent.slug}` ? copiedLabel : 'Copy'}
							</button>
						</div>
						<input
							readonly
							class="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none"
							value={selectedEvent.priceCopy || 'No price listed'}
						/>
					</div>
				</div>
			</section>
		{:else}
			<section class="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-600">
				Select an event to review its copy-ready Luma content.
			</section>
		{/if}
	</div>
</section>
