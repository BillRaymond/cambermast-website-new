<script lang="ts">
	import { browser } from '$app/environment';
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import EventCard from '$lib/components/events/EventCard.svelte';
	import type {
		AdminEventLumaEntry,
		AdminEventLumaOccurrence
	} from '$lib/view-models/admin-event-luma';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	type OccurrenceFilter = 'all' | AdminEventLumaOccurrence;
	type WorkflowFilter = 'actionable' | 'all' | string;

	const pageMeta = {
		title: 'Luma workflow | Admin | Cambermast',
		description: 'Internal workflow for creating private Luma events, reviewing them, and linking the live URL.'
	};

	const events = data.events ?? [];
	const runtimeConfig = data.runtimeConfig;
	const occurrenceLabels: Record<OccurrenceFilter, string> = {
		all: 'All',
		future: 'Future',
		current: 'Current',
		past: 'Past',
		canceled_postponed: 'Canceled/Postponed'
	};

	let search = '';
	let occurrenceFilter: OccurrenceFilter = 'all';
	let workflowFilter: WorkflowFilter = 'actionable';
	let onlyMissingRegistration = true;
	let selectedSlug = events[0]?.slug ?? '';
	let copiedKey = '';
	let copiedLabel = 'Copied';
	let copyError = '';
	let pendingAction:
		| {
				name: 'createPrivate' | 'forceCreate' | 'markReviewed' | 'refreshPublicUrl' | 'attachLiveUrl';
				eventId: string;
		  }
		| null = null;

	const pendingActionLabels = {
		createPrivate: 'Creating private Luma event',
		forceCreate: 'Force-creating private Luma event',
		markReviewed: 'Marking the event as reviewed',
		refreshPublicUrl: 'Refreshing the public URL from the existing draft',
		attachLiveUrl: 'Attaching the live Luma URL'
	} as const;

	const pendingActionDescriptions = {
		createPrivate:
			'Running Playwright in the background. This can take a bit while Luma loads, fills the form, and opens the draft manage page.',
		forceCreate:
			'Running Playwright in the background with the timing gate bypassed. This can take a bit while Luma loads, fills the form, and opens the draft manage page.',
		markReviewed: 'Updating the internal workflow state on the server.',
		refreshPublicUrl:
			'Opening the stored Luma manage page and reading the Share section again.',
		attachLiveUrl: 'Updating the site event record with the public Luma URL.'
	} as const;

	const workflowLabels: Record<string, string> = {
		actionable: 'Actionable',
		ready_to_create_private: 'Ready',
		late_review: 'Late review',
		awaiting_luma_review: 'Awaiting review',
		ready_to_link_live_url: 'Link live URL',
		missing_required_fields: 'Missing fields',
		too_early: 'Too early',
		not_applicable: 'Not applicable'
	};

	const workflowBadgeClass = (status: string): string =>
		status === 'ready_to_create_private'
			? 'border-emerald-200 bg-emerald-50 text-emerald-800'
			: status === 'late_review'
				? 'border-amber-200 bg-amber-50 text-amber-800'
				: status === 'awaiting_luma_review'
					? 'border-sky-200 bg-sky-50 text-sky-800'
					: status === 'ready_to_link_live_url'
						? 'border-indigo-200 bg-indigo-50 text-indigo-800'
						: status === 'missing_required_fields'
							? 'border-rose-200 bg-rose-50 text-rose-800'
							: 'border-gray-200 bg-gray-50 text-gray-700';

	const isActionableStatus = (status: string): boolean =>
		status === 'ready_to_create_private' ||
		status === 'late_review' ||
		status === 'awaiting_luma_review' ||
		status === 'ready_to_link_live_url';

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

	const countByWorkflow = (workflow: WorkflowFilter): number =>
		events.filter((event) => {
			if (workflow === 'all') return true;
			if (workflow === 'actionable') return isActionableStatus(event.workflow.status);
			return event.workflow.status === workflow;
		}).length;

	$: normalizedSearch = search.trim().toLowerCase();
	$: filteredEvents = events.filter((event) => {
		if (onlyMissingRegistration && event.hasLumaRegistration) return false;
		if (occurrenceFilter !== 'all' && event.occurrence !== occurrenceFilter) return false;
		if (workflowFilter === 'actionable' && !isActionableStatus(event.workflow.status)) return false;
		if (workflowFilter !== 'actionable' && workflowFilter !== 'all' && event.workflow.status !== workflowFilter) return false;
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

	const isMutationPending = (): boolean => pendingAction !== null;

	const enhanceMutationForm = (
		name: NonNullable<typeof pendingAction>['name'],
		eventId: string
	): SubmitFunction =>
		() => {
			pendingAction = { name, eventId };
			return async ({ result }) => {
				pendingAction = null;
				await applyAction(result);
			};
		};

	$: pendingActionLabel = pendingAction ? pendingActionLabels[pendingAction.name] : '';
	$: pendingActionDescription = pendingAction ? pendingActionDescriptions[pendingAction.name] : '';
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/admin/events/luma"
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Luma workflow</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		Create a private Luma event first, do a final review in Luma, then attach the live URL only
		after you publish it there. The public Cambermast event stays in
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">Open soon</code> until that final step.
	</p>
</header>

<section class="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
	<div class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
		<p>
			<span class="font-semibold text-gray-900">Playwright session:</span>
			<code class="ml-1 rounded bg-white px-1 py-0.5 text-xs">{runtimeConfig.storageStatePath}</code>
		</p>
		<p class="mt-1">
			<span class="font-semibold text-gray-900">Available:</span>
			{runtimeConfig.storageStateExists ? 'Yes' : 'No'}
			<span class="ml-3 font-semibold text-gray-900">Create URL:</span>
			<code class="ml-1 rounded bg-white px-1 py-0.5 text-xs">{runtimeConfig.createUrl}</code>
		</p>
	</div>

	{#if form?.message}
		<p class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
			{form.message}
		</p>
	{/if}
	{#if form?.message && form?.targetId}
		<p class="mt-2 text-xs text-gray-500">Event: {form.targetId}</p>
	{/if}
	{#if pendingAction}
		<div class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-sm">
			<div class="flex flex-wrap items-center gap-2">
				<span class="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600"></span>
				<p class="font-semibold">{pendingActionLabel}</p>
				<p class="text-xs text-blue-700">Event: {pendingAction.eventId}</p>
			</div>
			<p class="mt-2 text-blue-800">{pendingActionDescription}</p>
			<p class="mt-2 text-xs text-blue-700">
				Action buttons are temporarily disabled until the server responds.
			</p>
		</div>
	{/if}

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

	<div class="mt-4 flex flex-wrap gap-2">
		{#each Object.entries(workflowLabels) as [key, label]}
			<button
				type="button"
				class={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
					workflowFilter === key
						? 'border-blue-200 bg-blue-50 text-blue-800'
						: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900'
				}`}
				on:click={() => (workflowFilter = key as WorkflowFilter)}
			>
				{label} ({countByWorkflow(key as WorkflowFilter)})
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
							<span class={`rounded-full border px-2 py-0.5 ${workflowBadgeClass(entry.workflow.status)}`}>
								{entry.workflow.statusLabel}
							</span>
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
						brochureUrl={entry.card.brochureUrl}
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
						<div class="mt-3 flex flex-wrap items-center gap-2">
							<span class={`rounded-full border px-2.5 py-1 text-xs font-semibold ${workflowBadgeClass(selectedEvent.workflow.status)}`}>
								{selectedEvent.workflow.statusLabel}
							</span>
							<span class="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
								Window: {selectedEvent.workflow.recommendedWindowLabel}
							</span>
							{#if selectedEvent.workflow.firstSessionStartInDays !== undefined}
								<span class="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
									Starts in {selectedEvent.workflow.firstSessionStartInDays} day{selectedEvent.workflow.firstSessionStartInDays === 1 ? '' : 's'}
								</span>
							{/if}
						</div>
					</div>
					<div class="text-right text-xs text-gray-500">
						<p>{occurrenceLabels[selectedEvent.occurrence]}</p>
						<p class="mt-1">{selectedEvent.typeLabel}</p>
					</div>
				</div>

				<div class="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
					<p class="font-semibold text-gray-900">Workflow status</p>
					<p class="mt-2">{selectedEvent.workflow.statusReason}</p>
					{#if selectedEvent.workflow.missingFields.length}
						<p class="mt-2 text-rose-700">
							Missing: {selectedEvent.workflow.missingFields.join(', ')}
						</p>
					{/if}
					{#if selectedEvent.privateCreatedAt}
						<p class="mt-2">
							<span class="font-semibold text-gray-900">Private created:</span>
							{selectedEvent.privateCreatedAt}
						</p>
					{/if}
					{#if selectedEvent.privateManageUrl}
						<p class="mt-2 break-all">
							<span class="font-semibold text-gray-900">Private manage URL:</span>
							<a
								class="ml-1 text-blue-700 hover:text-blue-900 hover:underline"
								href={selectedEvent.privateManageUrl}
								rel="external"
							>
								{selectedEvent.privateManageUrl}
							</a>
						</p>
					{/if}
					{#if selectedEvent.publicUrl}
						<p class="mt-2 break-all">
							<span class="font-semibold text-gray-900">Recorded public URL:</span>
							<a
								class="ml-1 text-blue-700 hover:text-blue-900 hover:underline"
								href={selectedEvent.publicUrl}
								rel="external"
							>
								{selectedEvent.publicUrl}
							</a>
						</p>
					{/if}
					{#if selectedEvent.lastRunOutcome}
						<p class="mt-2">
							<span class="font-semibold text-gray-900">Last run:</span>
							{selectedEvent.lastRunOutcome}
							{#if selectedEvent.lastRunAt}
								· {selectedEvent.lastRunAt}
							{/if}
						</p>
					{/if}
					{#if selectedEvent.lastError}
						<p class="mt-2 text-rose-700">{selectedEvent.lastError}</p>
					{/if}
					{#if selectedEvent.lastArtifactDir}
						<p class="mt-2 break-all text-xs text-gray-500">
							Artifacts: {selectedEvent.lastArtifactDir}
						</p>
					{/if}
				</div>

				<div class="mt-4 grid gap-3 md:grid-cols-2">
					<form
						method="POST"
						action="?/createPrivate"
						use:enhance={enhanceMutationForm('createPrivate', selectedEvent.id)}
						class="rounded-2xl border border-gray-200 bg-white p-4"
					>
						<input type="hidden" name="eventId" value={selectedEvent.id} />
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Private create</p>
						<p class="mt-2 text-sm text-gray-600">
							Run Playwright, create the event in Luma with the most private visibility available,
							then stop for manual review.
						</p>
						<p class="mt-2 text-xs text-gray-500">
							The workflow now tries to upload the event&apos;s square hero image automatically.
							If Luma changes the upload UI, check the artifact screenshots and run log first to see
							whether the image step was skipped or left unconfirmed.
						</p>
						<div class="mt-3 flex flex-wrap gap-2">
							<button
								type="submit"
								disabled={isMutationPending()}
								class={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white ${
									isMutationPending() ? 'cursor-not-allowed bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
								}`}
							>
								{pendingAction?.name === 'createPrivate'
									? 'Creating private event...'
									: 'Create private Luma event'}
							</button>
						</div>
					</form>

					<form
						method="POST"
						action="?/createPrivate"
						use:enhance={enhanceMutationForm('forceCreate', selectedEvent.id)}
						class="rounded-2xl border border-gray-200 bg-white p-4"
					>
						<input type="hidden" name="eventId" value={selectedEvent.id} />
						<input type="hidden" name="force" value="true" />
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Force create</p>
						<p class="mt-2 text-sm text-gray-600">
							Use this only when the timing gate says too early or missing the preferred window,
							but you still want to create the private Luma page now.
						</p>
						<div class="mt-3 flex flex-wrap gap-2">
							<button
								type="submit"
								disabled={isMutationPending()}
								class={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold ${
									isMutationPending()
										? 'cursor-not-allowed border-amber-100 bg-amber-50 text-amber-400'
										: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
								}`}
							>
								{pendingAction?.name === 'forceCreate'
									? 'Force-creating event...'
									: 'Force create private event'}
							</button>
						</div>
					</form>
				</div>

				<div class="mt-4 grid gap-3 md:grid-cols-2">
					<form
						method="POST"
						action="?/markReviewed"
						use:enhance={enhanceMutationForm('markReviewed', selectedEvent.id)}
						class="rounded-2xl border border-gray-200 bg-white p-4"
					>
						<input type="hidden" name="eventId" value={selectedEvent.id} />
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Review complete</p>
						<p class="mt-2 text-sm text-gray-600">
							Use this after you review the private Luma page and are ready to publish it there.
						</p>
						<div class="mt-3 flex flex-wrap gap-2">
							<button
								type="submit"
								disabled={isMutationPending()}
								class={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold ${
									isMutationPending()
										? 'cursor-not-allowed border-sky-100 bg-sky-50 text-sky-400'
										: 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100'
								}`}
							>
								{pendingAction?.name === 'markReviewed' ? 'Marking reviewed...' : 'Mark reviewed'}
							</button>
						</div>
					</form>

					<form
						method="POST"
						action="?/refreshPublicUrl"
						use:enhance={enhanceMutationForm('refreshPublicUrl', selectedEvent.id)}
						class="rounded-2xl border border-gray-200 bg-white p-4"
					>
						<input type="hidden" name="eventId" value={selectedEvent.id} />
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Refresh public URL</p>
						<p class="mt-2 text-sm text-gray-600">
							Open the existing Luma manage page, read the Share section, and store the current
							public event URL without recreating the event.
						</p>
						<div class="mt-3 flex flex-wrap gap-2">
							<button
								type="submit"
								disabled={isMutationPending()}
								class={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold ${
									isMutationPending()
										? 'cursor-not-allowed border-indigo-100 bg-indigo-50 text-indigo-400'
										: 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
								}`}
							>
								{pendingAction?.name === 'refreshPublicUrl'
									? 'Refreshing draft URL...'
									: 'Refresh from existing draft'}
							</button>
						</div>
					</form>
				</div>

				<div class="mt-4">
					<form
						method="POST"
						action="?/attachLiveUrl"
						use:enhance={enhanceMutationForm('attachLiveUrl', selectedEvent.id)}
						class="rounded-2xl border border-gray-200 bg-white p-4"
					>
						<input type="hidden" name="eventId" value={selectedEvent.id} />
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Attach live URL</p>
						<p class="mt-2 text-sm text-gray-600">
							After publishing the event on Luma, paste the final public event URL here to update
							the site event record.
						</p>
						<label class="mt-3 block text-xs font-semibold tracking-wide text-gray-500 uppercase" for="live-url">
							Live Luma URL
						</label>
						<input
							id="live-url"
							name="liveUrl"
							type="url"
							placeholder="https://lu.ma/..."
							disabled={isMutationPending()}
							class="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
						/>
						<label class="mt-3 block text-xs font-semibold tracking-wide text-gray-500 uppercase" for="cta-label">
							CTA label
						</label>
						<input
							id="cta-label"
							name="ctaLabel"
							type="text"
							value="Register now"
							disabled={isMutationPending()}
							class="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
						/>
						<div class="mt-3 flex flex-wrap gap-2">
							<button
								type="submit"
								disabled={isMutationPending()}
								class={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold ${
									isMutationPending()
										? 'cursor-not-allowed border-emerald-100 bg-emerald-50 text-emerald-400'
										: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
								}`}
							>
								{pendingAction?.name === 'attachLiveUrl'
									? 'Attaching live URL...'
									: 'Attach live Luma URL'}
							</button>
						</div>
					</form>
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
