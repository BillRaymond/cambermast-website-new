<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import EventCard from '$lib/components/events/EventCard.svelte';
	import { isEventUpcomingUi, listEventUi } from '$lib/view-models/events';
	import { toEventCardModel, type EventCardModel } from '$lib/view-models/event-card';

	type GroupedEntries = {
		monthLabel: string;
		items: EventCardModel[];
	};

	type FilterOption = 'all' | 'training' | `event:${string}`;

	const normalizeToday = (reference: Date = new Date()): Date => {
		const normalized = new Date(reference);
		normalized.setHours(0, 0, 0, 0);
		return normalized;
	};

	const today = normalizeToday();
	let nowMs = Date.now();
	let ticker: ReturnType<typeof setInterval> | undefined;
	let activeFilter: FilterOption = 'all';

	const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

	let upcomingEventEntries: EventCardModel[] = [];
	let upcomingEntries: EventCardModel[] = [];
	let happeningEntries: EventCardModel[] = [];
	let filteredHappeningEntries: EventCardModel[] = [];

	$: upcomingEventEntries = listEventUi()
		.filter((event) => isEventUpcomingUi(event, today))
		.map((event) => toEventCardModel(event, { referenceTimestamp: nowMs }));

	$: upcomingEntries = upcomingEventEntries
		.filter((entry) => entry.tone !== 'happening')
		.sort((a, b) => (a.startTimestamp ?? Infinity) - (b.startTimestamp ?? Infinity));

	type EventTypeFilter = {
		key: string;
		label: string;
	};

	let eventTypeFilters: EventTypeFilter[] = [];
	const hiddenEventTypeFilterKeys = new Set(['training', 'training_session', 'event', 'other']);
	const normalizeFilterLabel = (value: string): string =>
		value.trim().toLowerCase().replace(/\s+/g, ' ');
	const getEventTypeChipLabel = (filter: EventTypeFilter): string => {
		if (filter.key === 'webinar') return `🎙️ ${filter.label}`;
		return filter.label;
	};

	const handleBookmarkClick = (event: MouseEvent): void => {
		event.preventDefault();
		if (!browser) return;
		const isMac = /Mac|iPhone|iPad/i.test(navigator.platform);
		window.alert(`Use ${isMac ? 'Cmd' : 'Ctrl'} + D to bookmark this page.`);
	};

	$: eventTypeFilters = Array.from(
		new Map(
			upcomingEventEntries
				.filter((entry) => entry.eventType)
				.map((entry) => [entry.eventType, entry.eventTypeLabel])
		).entries()
	)
		.map(([key, label]) => ({ key, label }))
		.filter((filter) => !hiddenEventTypeFilterKeys.has(filter.key))
		.filter((filter) => {
			const normalized = normalizeFilterLabel(filter.label);
			return normalized !== 'training' && normalized !== 'training session';
		});

	type FilterableEntry = { eventType: string };
	const filterEntriesByType = <T extends FilterableEntry>(
		entries: T[],
		filter: FilterOption
	): T[] => {
		if (filter === 'training')
			return entries.filter((entry) => entry.eventType === 'training_session');
		if (filter.startsWith('event:')) {
			const eventType = filter.slice('event:'.length);
			return entries.filter((entry) => entry.eventType === eventType);
		}
		return entries;
	};

	$: happeningEntries = upcomingEventEntries
		.filter((entry) => entry.tone === 'happening')
		.sort((a, b) => (a.startTimestamp ?? Infinity) - (b.startTimestamp ?? Infinity));
	$: filteredHappeningEntries = filterEntriesByType(happeningEntries, activeFilter);

	const getMonthLabel = (entry: EventCardModel): string => {
		if (entry.startTimestamp) return monthFormatter.format(new Date(entry.startTimestamp));
		return 'Flexible scheduling';
	};

	let groupedEntries: GroupedEntries[] = [];

	$: groupedEntries = filterEntriesByType(upcomingEntries, activeFilter).reduce<GroupedEntries[]>(
		(groups, entry) => {
			const monthLabel = getMonthLabel(entry);
			const lastGroup = groups[groups.length - 1];
			if (!lastGroup || lastGroup.monthLabel !== monthLabel) groups.push({ monthLabel, items: [] });
			groups[groups.length - 1].items.push(entry);
			return groups;
		},
		[]
	);

	onMount(() => {
		const updateNow = () => {
			nowMs = Date.now();
		};
		updateNow();
		ticker = setInterval(updateNow, 1000);
		return () => {
			if (ticker) clearInterval(ticker);
		};
	});
</script>

<section class="bg-gradient-to-b from-blue-50/60 to-white">
	<div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
		<div class="flex flex-col gap-1">
			<div
				class="flex flex-wrap items-center gap-2 pl-5 text-xs font-semibold tracking-wide text-gray-500 uppercase"
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

			<div class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
				{#if groupedEntries.length}
					<div class="space-y-8">
						{#each groupedEntries as group}
							<section>
								<h3 class="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
									{group.monthLabel}
								</h3>
								<ul class="mt-3 space-y-4">
									{#each group.items as entry}
										<li id={entry.id}>
											<EventCard
												title={entry.title}
												subtitle={entry.subtitle}
												date={entry.date}
												time={entry.time}
												location={entry.location}
												image={entry.image}
												imageAlt={entry.imageAlt}
												certificateText={entry.certificateText}
												videoUrl={entry.videoUrl}
												typeLabel={entry.typeLabel}
												statusLabel={entry.statusLabel}
												registerUrl={entry.registerUrl}
												registerLabel={entry.registerLabel}
												learnMoreUrl={entry.learnMoreUrl}
												hostText={entry.hostText}
												partnerText={entry.partnerText}
												speakerText={entry.speakerText}
												tone={entry.tone}
												variant="calendar"
											/>
										</li>
									{/each}
								</ul>
							</section>
						{/each}
					</div>
				{:else}
					<div
						class="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-gray-600"
					>
						New public cohorts are being scheduled. Follow the Bill Talks AI newsletter or contact
						us to reserve custom training dates for your team.
					</div>
				{/if}
			</div>
		</div>

		<div class="my-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-3">
					<img
						src="/images/bill.jpg"
						alt="Bill Raymond"
						class="h-10 w-10 flex-none rounded-2xl border border-blue-100 object-cover"
						loading="lazy"
						decoding="async"
					/>
					<div class="min-w-0">
						<p class="text-sm font-semibold text-gray-900">Design a private workshop</p>
						<p class="text-sm text-gray-600">Tailor a cohort to meet your team's goals.</p>
					</div>
				</div>
				<a
					href="/contact"
					class="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"
					>Book a consultation</a
				>
			</div>
		</div>

		{#if filteredHappeningEntries.length}
			<div class="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<h2 class="text-lg font-semibold whitespace-nowrap text-amber-900">Happening now</h2>
					<p class="min-w-0 flex-1 text-xs text-amber-700">
						Bookmark
						<a
							href="/events"
							class="font-semibold underline decoration-amber-300 underline-offset-2 hover:text-amber-900"
							onclick={handleBookmarkClick}>this page</a
						>
						so you never miss another event.
					</p>
				</div>
				<ul class="mt-4 space-y-4">
					{#each filteredHappeningEntries as entry}
						<li>
							<EventCard
								title={entry.title}
								subtitle={entry.subtitle}
								date={entry.date}
								time={entry.time}
								location={entry.location}
								image={entry.image}
								imageAlt={entry.imageAlt}
								certificateText={entry.certificateText}
								videoUrl={entry.videoUrl}
								typeLabel={entry.typeLabel}
								statusLabel={entry.statusLabel}
								learnMoreUrl={entry.learnMoreUrl}
								hostText={entry.hostText}
								partnerText={entry.partnerText}
								speakerText={entry.speakerText}
								tone={entry.tone}
								variant="calendar"
							/>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
			<p class="text-sm text-slate-700">
				Looking for completed sessions?
				<a
					href="/events/archive"
					class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
					>Browse the past events archive →</a
				>
			</p>
		</div>

		<p class="text-sm text-gray-600">
			Browse the full schedule on the
			<a
				href="/events"
				class="inline-flex items-center gap-1 text-blue-700 underline underline-offset-2 hover:text-blue-900"
				>events calendar</a
			>
			and grab a seat while spots are still open.
		</p>
	</div>
</section>
