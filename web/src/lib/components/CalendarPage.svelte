<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import EventCard from '$lib/components/events/EventCard.svelte';
	import type { EventUiModel } from '$lib/view-models/events';
	import {
		getEventStartTimestampUi,
		getEventTypeLabelUi,
		isEventUpcomingUi,
		listEventUi
	} from '$lib/view-models/events';
	import { toConciseEventTimeLabel } from '$lib/data/events/session-labels';
	import { getEventOccurrenceState, getEventSessionBounds } from '$lib/data/events/timeline';
	import { getTrainingProgramBySku } from '$lib/data/training';
	import { getPartnerByCode } from '$lib/data/partners';
	import { getProgramCertificateText } from '$lib/data/training/program-meta';

	type UpcomingEntry = {
		id: string;
		title: string;
		subtitle: string | null;
		eventType?: string;
		eventTypeLabel?: string;
		startTimestamp: number | null;
		dateText: string;
		timeText?: string;
		locationText?: string;
		partnerText: string | null;
		speakerText: string | null;
		registerUrl?: string;
		registerLabel?: string;
		registerDisabled?: boolean;
		learnMoreUrl?: string;
		image?: string;
		imageAlt?: string;
		certificateText?: string;
		videoUrl?: string;
		isHappening?: boolean;
	};

	type GroupedEntries = {
		monthLabel: string;
		items: Array<{ entry: UpcomingEntry; index: number }>;
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
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	const formatCountdown = (diffMs: number): string => {
		const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
		const seconds = totalSeconds % 60;
		const totalMinutes = Math.floor(totalSeconds / 60);
		const minutes = totalMinutes % 60;
		const totalHours = Math.floor(totalMinutes / 60);
		const hours = totalHours % 24;
		const days = Math.floor(totalHours / 24);
		const pad = (value: number) => value.toString().padStart(2, '0');
		if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
		if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
		if (minutes > 0) return `${pad(minutes)}:${pad(seconds)}`;
		return `${seconds}s`;
	};

	const getCountdownLabel = (startTimestamp: number | null, referenceMs: number): string | null => {
		if (startTimestamp === null || !Number.isFinite(startTimestamp)) return null;
		const diffMs = startTimestamp - referenceMs;
		if (diffMs <= 0) return null;
		return `Starts in ${formatCountdown(diffMs)}`;
	};

	const isTodayTimestamp = (timestamp: number | null): boolean => {
		if (timestamp === null) return false;
		const sessionDate = new Date(timestamp);
		return (
			sessionDate.getFullYear() === today.getFullYear() &&
			sessionDate.getMonth() === today.getMonth() &&
			sessionDate.getDate() === today.getDate()
		);
	};

	const formatDateLabel = (startTimestamp: number | null, fallback: string): string => {
		const trimmedFallback = fallback?.trim();
		if (trimmedFallback) return trimmedFallback;
		if (startTimestamp) return dateFormatter.format(new Date(startTimestamp));
		return fallback;
	};

	const defaultLocationLabel = 'Live online';

	const getEntryStatusPill = (
		entry: UpcomingEntry,
		countdownLabel: string | null,
		isTodaySession: boolean
	): string | null => {
		if (countdownLabel) return isTodaySession ? `Today · ${countdownLabel}` : countdownLabel;
		if (entry.isHappening) return 'Enrollment closed';
		return null;
	};

	const toFiniteTimestamp = (value: number): number | null =>
		Number.isFinite(value) ? value : null;

	let upcomingEventEntries: UpcomingEntry[] = [];
	let upcomingEntries: UpcomingEntry[] = [];
	let happeningEntries: UpcomingEntry[] = [];
	let filteredHappeningEntries: UpcomingEntry[] = [];

	$: upcomingEventEntries = listEventUi()
		.filter((event) => isEventUpcomingUi(event, today))
		.map((event, index) => {
			const occurrenceState = getEventOccurrenceState(event, nowMs);
			const bounds = getEventSessionBounds(event);
			const isTrainingHappeningNow =
				event.type === 'training_session' && occurrenceState.isInProgress;
			const isHappening = occurrenceState.isHappeningNow || isTrainingHappeningNow;

			const startTimestamp = toFiniteTimestamp(bounds?.startTimestamp ?? getEventStartTimestampUi(event));
			const timeText = toConciseEventTimeLabel(event.time) ?? undefined;
			const locationText = event.location ?? defaultLocationLabel;

			const eventTypeLabel = getEventTypeLabelUi(event);
			const subtitle =
				event.subtitle ?? `${eventTypeLabel}${event.visibility === 'draft' ? ' · Draft' : ''}`;
			const registerDisabled =
				event.registrationStatus === 'closed' ||
				event.registrationStatus === 'none' ||
				event.registrationStatus === 'sold_out' ||
				isTrainingHappeningNow;
			const registerUrl = registerDisabled ? undefined : event.cta?.url;
			const registerLabel =
				event.visibility === 'draft' && event.registrationStatus === 'none'
					? event.cta?.label || 'Draft'
					: event.registrationStatus === 'none' || isTrainingHappeningNow
					? 'Enrollment closed'
					: event.cta?.label || 'Register now';

			const isCourseEvent = event.type === 'training_session';
			const courseProgramSku = event.programRef?.sku;
			const courseProgram =
				courseProgramSku && isCourseEvent ? getTrainingProgramBySku(courseProgramSku) : undefined;
			const partnerNames = (event.partners ?? [])
				.map((partnerRef) => getPartnerByCode(partnerRef.code)?.name ?? partnerRef.code)
				.filter((name) => name && name !== 'NONE');
			const partnerText = partnerNames.length ? partnerNames.join(' + ') : null;
			const speakerNames = (event.speakers ?? [])
				.map((speaker) => speaker.name?.trim())
				.filter((name): name is string => Boolean(name));
			const speakerText = speakerNames.length ? speakerNames.join(' + ') : null;

			const eventLandingUrl = `/events/${event.slug}`;

			return {
				id: `event-${event.id ?? index}`,
				title: event.title,
				subtitle,
				eventType: event.type,
				eventTypeLabel,
				startTimestamp,
				dateText: formatDateLabel(startTimestamp, event.date),
				timeText,
				locationText,
				partnerText,
				speakerText,
				registerUrl,
				registerLabel,
				registerDisabled,
				learnMoreUrl: eventLandingUrl,
				image: event.image,
				imageAlt: event.imageAlt,
				certificateText: courseProgram ? getProgramCertificateText(courseProgram) : undefined,
				videoUrl: courseProgram?.videoUrl,
				isHappening
			};
		});

	$: upcomingEntries = upcomingEventEntries
		.filter((entry) => !entry.isHappening)
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
				.map((entry) => [
					entry.eventType as string,
					entry.eventTypeLabel ?? (entry.eventType as string)
				])
		).entries()
	)
		.map(([key, label]) => ({ key, label }))
		.filter((filter) => !hiddenEventTypeFilterKeys.has(filter.key))
		.filter((filter) => {
			const normalized = normalizeFilterLabel(filter.label);
			return normalized !== 'training' && normalized !== 'training session';
		});

	type FilterableEntry = { eventType?: string };
	const filterEntriesByType = <T extends FilterableEntry>(entries: T[], filter: FilterOption): T[] => {
		if (filter === 'training') return entries.filter((entry) => entry.eventType === 'training_session');
		if (filter.startsWith('event:')) {
			const eventType = filter.slice('event:'.length);
			return entries.filter((entry) => entry.eventType === eventType);
		}
		return entries;
	};

	$: happeningEntries = upcomingEventEntries
		.filter((entry) => entry.isHappening)
		.sort((a, b) => (a.startTimestamp ?? Infinity) - (b.startTimestamp ?? Infinity));
	$: filteredHappeningEntries = filterEntriesByType(happeningEntries, activeFilter);

	const getMonthLabel = (entry: UpcomingEntry): string => {
		if (entry.startTimestamp) return monthFormatter.format(new Date(entry.startTimestamp));
		return 'Flexible scheduling';
	};

	let groupedEntries: GroupedEntries[] = [];
	let firstTodayIndex = -1;

	$: groupedEntries = filterEntriesByType(upcomingEntries, activeFilter).reduce<GroupedEntries[]>(
		(groups, entry, index) => {
			const monthLabel = getMonthLabel(entry);
			const lastGroup = groups[groups.length - 1];
			if (!lastGroup || lastGroup.monthLabel !== monthLabel) groups.push({ monthLabel, items: [] });
			groups[groups.length - 1].items.push({ entry, index });
			return groups;
		},
		[]
	);

	$: firstTodayIndex = filterEntriesByType(upcomingEntries, activeFilter).findIndex(({ startTimestamp }) =>
		isTodayTimestamp(startTimestamp)
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
			<div class="flex flex-wrap items-center gap-2 pl-5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
				<span class="text-[0.65rem]">Filter</span>
				<button type="button" onclick={() => (activeFilter = 'all')} aria-pressed={activeFilter === 'all'} class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase transition ${
					activeFilter === 'all' ? 'border-blue-200 bg-blue-600/10 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
				}`}>
					All
				</button>
				<button type="button" onclick={() => (activeFilter = 'training')} aria-pressed={activeFilter === 'training'} class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase transition ${
					activeFilter === 'training' ? 'border-blue-200 bg-blue-600/10 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
				}`}>
					Training
				</button>
				{#if eventTypeFilters.length}
					{#each eventTypeFilters as filter}
						<button type="button" onclick={() => (activeFilter = `event:${filter.key}`)} aria-pressed={activeFilter === `event:${filter.key}`} class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide uppercase transition ${
							activeFilter === `event:${filter.key}` ? 'border-emerald-200 bg-emerald-600/10 text-emerald-700' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
						}`}>
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
								<h3 class="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">{group.monthLabel}</h3>
								<ul class="mt-3 space-y-4">
									{#each group.items as item}
										{@const { entry, index } = item}
										{@const countdownLabel = entry.startTimestamp ? getCountdownLabel(entry.startTimestamp, nowMs) : null}
										{@const statusPill = getEntryStatusPill(entry, countdownLabel, index === firstTodayIndex)}
										<li id={entry.id}>
											<EventCard
												title={entry.title}
												subtitle={entry.subtitle ?? undefined}
												date={entry.dateText}
												time={entry.timeText}
												location={entry.locationText}
												image={entry.image}
												imageAlt={entry.imageAlt}
												certificateText={entry.certificateText ? '📜 Certificate included' : undefined}
												videoUrl={entry.videoUrl}
												typeLabel={entry.eventType === 'training_session' ? 'Training' : (entry.eventTypeLabel ?? 'Event')}
												statusLabel={statusPill ?? undefined}
												registerUrl={entry.registerDisabled ? undefined : entry.registerUrl}
												registerLabel={entry.registerLabel ?? 'Register now'}
												learnMoreUrl={entry.learnMoreUrl}
												tone="upcoming"
											/>
											{#if entry.partnerText || entry.speakerText}
												<div class="mt-2 space-y-1 pl-1">
													{#if entry.partnerText}<p class="text-[0.65rem] tracking-wide text-gray-500 uppercase">In partnership with {entry.partnerText}</p>{/if}
													{#if entry.speakerText}<p class="text-xs text-gray-600">Speakers: {entry.speakerText}</p>{/if}
												</div>
											{/if}
										</li>
									{/each}
								</ul>
							</section>
						{/each}
					</div>
				{:else}
					<div class="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-gray-600">
						New public cohorts are being scheduled. Follow the Bill Talks AI newsletter or contact us to reserve custom training dates for your team.
					</div>
				{/if}
			</div>
		</div>

		<div class="my-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-3">
					<img src="/images/bill.jpg" alt="Bill Raymond" class="h-10 w-10 flex-none rounded-2xl border border-blue-100 object-cover" loading="lazy" decoding="async" />
					<div class="min-w-0">
						<p class="text-sm font-semibold text-gray-900">Design a private workshop</p>
						<p class="text-sm text-gray-600">Tailor a cohort to meet your team's goals.</p>
					</div>
				</div>
				<a href="/contact" class="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none">Book a consultation</a>
			</div>
		</div>

		{#if filteredHappeningEntries.length}
			<div class="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<h2 class="text-lg font-semibold whitespace-nowrap text-amber-900">Happening now</h2>
					<p class="min-w-0 flex-1 text-xs text-amber-700">
						Bookmark
						<a href="/events" class="font-semibold underline decoration-amber-300 underline-offset-2 hover:text-amber-900" onclick={handleBookmarkClick}>this page</a>
						so you never miss another event.
					</p>
				</div>
				<ul class="mt-4 space-y-4">
					{#each filteredHappeningEntries as entry}
						<li>
							<EventCard
								title={entry.title}
								subtitle={entry.subtitle ?? undefined}
								date={entry.dateText}
								time={entry.timeText}
								location={entry.locationText}
								image={entry.image}
								imageAlt={entry.imageAlt}
								certificateText={entry.certificateText ? '📜 Certificate included' : undefined}
								videoUrl={entry.videoUrl}
								typeLabel={entry.eventType === 'training_session' ? 'Training' : (entry.eventTypeLabel ?? 'Event')}
								statusLabel={entry.registerLabel || 'Enrollment closed'}
								learnMoreUrl={entry.learnMoreUrl}
								tone="happening"
							/>
							{#if entry.partnerText || entry.speakerText}
								<div class="mt-2 space-y-1 pl-1">
									{#if entry.partnerText}<p class="text-[0.65rem] tracking-wide text-gray-500 uppercase">In partnership with {entry.partnerText}</p>{/if}
									{#if entry.speakerText}<p class="text-xs text-gray-600">Speakers: {entry.speakerText}</p>{/if}
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
			<p class="text-sm text-slate-700">
				Looking for completed sessions?
				<a href="/events/archive" class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900">Browse the past events archive →</a>
			</p>
		</div>

		<p class="text-sm text-gray-600">
			Browse the full schedule on the
			<a href="/events" class="inline-flex items-center gap-1 text-blue-700 underline underline-offset-2 hover:text-blue-900">events calendar</a>
			and grab a seat while spots are still open.
		</p>
	</div>
</section>
