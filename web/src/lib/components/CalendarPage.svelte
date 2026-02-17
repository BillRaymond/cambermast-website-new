<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { EventUiModel } from '$lib/view-models/events';
	import {
		getEventStartTimestampUi,
		getEventTypeLabelUi,
		isEventUpcomingUi,
		listEventUi
	} from '$lib/view-models/events';
	import { getTrainingProgramBySku } from '$lib/data/training';
	import { getPartnerByCode } from '$lib/data/partners';
	import { getProgramCertificateText } from '$lib/data/training/program-meta';

	type ProgramImage = {
		src: string;
		alt: string;
	};

	type EntryImage = {
		desktop: ProgramImage | null;
		mobile: ProgramImage | null;
		aspect: 'wide' | 'square';
	};

	type UpcomingEntry = {
		id: string;
		type: 'event';
		title: string;
		titleUrl?: string;
		subtitle: string | null;
		eventType?: string;
		eventTypeLabel?: string;
		startTimestamp: number | null;
		dateText: string;
		metaDetails: string[];
		partnerText: string | null;
		speakerText: string | null;
		registerUrl?: string;
		registerLabel?: string;
		registerDisabled?: boolean;
		learnMoreUrl?: string;
		image: EntryImage | null;
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
	let now = new Date();
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
		if (days > 0) {
			return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
		}
		if (hours > 0) {
			return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
		}
		if (minutes > 0) {
			return `${pad(minutes)}:${pad(seconds)}`;
		}
		return `${seconds}..`;
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

	const formatTimeLabel = (value?: string | string[]): string | null => {
		if (!value) return null;
		return Array.isArray(value) ? value.join(' / ') : value;
	};

	const defaultLocationLabel = 'Live online';

	const getEntryStatusPill = (
		entry: UpcomingEntry,
		countdownLabel: string | null,
		isTodaySession: boolean
	): string | null => {
		if (countdownLabel) return isTodaySession ? `Today · ${countdownLabel}` : countdownLabel;
		if (entry.isHappening) {
			if (entry.registerDisabled && entry.registerLabel) return entry.registerLabel;
			return 'Running now';
		}
		return null;
	};

	const getEventCardImage = (event: EventUiModel): EntryImage => {
		const image = event.image
			? {
					src: event.image,
					alt: event.imageAlt ?? event.title
				}
			: null;

		return {
			desktop: image,
			mobile: image,
			aspect: 'wide'
		};
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
			const startAtTimestamp = new Date(event.startAtUtc).valueOf();
			const endAtTimestamp = event.endAtUtc ? new Date(event.endAtUtc).valueOf() : startAtTimestamp;
			const isHappening =
				Number.isFinite(startAtTimestamp) &&
				Number.isFinite(endAtTimestamp) &&
				startAtTimestamp <= nowMs &&
				endAtTimestamp >= nowMs;
			const isTrainingHappeningNow = isHappening && event.type === 'training_session';

			const startTimestamp = toFiniteTimestamp(getEventStartTimestampUi(event));
			const timeLabel = formatTimeLabel(event.time);
			const locationLabel = event.location ?? defaultLocationLabel;
			const metaDetails: string[] = [];
			if (timeLabel) metaDetails.push(timeLabel);
			if (locationLabel) metaDetails.push(locationLabel);

			const eventTypeLabel = getEventTypeLabelUi(event);
			const subtitle =
				event.subtitle ?? `${eventTypeLabel}${event.visibility === 'draft' ? ' · Draft' : ''}`;
			const registerDisabled =
				event.registrationStatus === 'closed' ||
				event.registrationStatus === 'none' ||
				event.registrationStatus === 'sold_out' ||
				isTrainingHappeningNow;
			const registerUrl = registerDisabled ? undefined : event.cta?.url;
			const baseRegisterLabel =
				isTrainingHappeningNow
					? 'Enrollment closed'
					: event.registrationStatus === 'none'
					? 'Enrollment closed'
					: event.cta?.label || 'Register now';
			const registerLabel = baseRegisterLabel;
			const isCourseEvent = event.type === 'training_session';
			const courseProgramSku = event.programRef?.sku;
			const courseProgram =
				courseProgramSku && isCourseEvent ? getTrainingProgramBySku(courseProgramSku) : undefined;
			const courseProgramRoute =
				courseProgramSku && isCourseEvent ? (courseProgram?.route ?? undefined) : null;
			const partnerNames = (event.partners ?? [])
				.map((partnerRef) => getPartnerByCode(partnerRef.code)?.name ?? partnerRef.code)
				.filter((name) => name && name !== 'NONE');
			const partnerName = partnerNames.length ? partnerNames.join(' + ') : null;
			const speakerNames = (event.speakers ?? [])
				.map((speaker) => speaker.name?.trim())
				.filter((name): name is string => Boolean(name));
			const speakerText = speakerNames.length ? speakerNames.join(' + ') : null;

			const eventLandingUrl = `/events/${event.slug}`;
			const titleUrl = courseProgramRoute ?? eventLandingUrl;
			const learnMoreUrl = eventLandingUrl;

			return {
				id: `event-${event.id ?? index}`,
				type: 'event',
				title: event.title,
				titleUrl,
				subtitle,
				eventType: event.type,
				eventTypeLabel,
				startTimestamp,
				dateText: formatDateLabel(startTimestamp, event.date),
				metaDetails,
				partnerText: partnerName,
				speakerText,
				registerUrl,
				registerLabel,
				registerDisabled,
				learnMoreUrl,
				image: getEventCardImage(event),
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

		const bookmarkTitle = document.title || 'Cambermast Events';
		const bookmarkUrl = window.location.href;
		const windowWithBookmarks = window as Window & {
			external?: { AddFavorite?: (url: string, title?: string) => void };
			sidebar?: { addPanel?: (title: string, url: string, unused?: string) => void };
		};

		try {
			if (typeof windowWithBookmarks.external?.AddFavorite === 'function') {
				windowWithBookmarks.external.AddFavorite(bookmarkUrl, bookmarkTitle);
				return;
			}
			if (typeof windowWithBookmarks.sidebar?.addPanel === 'function') {
				windowWithBookmarks.sidebar.addPanel(bookmarkTitle, bookmarkUrl, '');
				return;
			}
		} catch {
			// Fall through to keyboard shortcut guidance.
		}

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

	type FilterableEntry = {
		eventType?: string;
	};

	const filterEntriesByType = <T extends FilterableEntry>(
		entries: T[],
		filter: FilterOption
	): T[] => {
		if (filter === 'training') {
			return entries.filter((entry) => entry.eventType === 'training_session');
		}
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
		if (entry.startTimestamp) {
			return monthFormatter.format(new Date(entry.startTimestamp));
		}
		return 'Flexible scheduling';
	};

	let groupedEntries: GroupedEntries[] = [];
	let firstTodayIndex = -1;

	$: groupedEntries = filterEntriesByType(upcomingEntries, activeFilter).reduce<
		GroupedEntries[]
	>((groups, entry, index) => {
		const monthLabel = getMonthLabel(entry);
		const lastGroup = groups[groups.length - 1];
		if (!lastGroup || lastGroup.monthLabel !== monthLabel) {
			groups.push({ monthLabel, items: [] });
		}
		groups[groups.length - 1].items.push({ entry, index });
		return groups;
	}, []);

	$: firstTodayIndex = filterEntriesByType(upcomingEntries, activeFilter).findIndex(
		({ startTimestamp }) => isTodayTimestamp(startTimestamp)
	);

	onMount(() => {
		const updateNow = () => {
			now = new Date();
			nowMs = now.getTime();
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
					<svg viewBox="0 0 24 24" aria-hidden="true" class="h-3 w-3" fill="currentColor">
						<path
							d="M12 3l10 5-10 5-10-5 10-5zm0 7l6-3v4.5c0 2.5-4 4.5-6 4.5s-6-2-6-4.5V7l6 3zm7 4.5v4a1 1 0 01-2 0v-4h2z"
						/>
					</svg>
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
									{#each group.items as item}
										{@const { entry, index } = item}
										{@const cardId = entry.id}
										{@const isTodaySession = index === firstTodayIndex}
										{@const entryImage = entry.image}
										{@const countdownLabel = entry.startTimestamp
											? getCountdownLabel(entry.startTimestamp, nowMs)
											: null}
										{@const statusPill = getEntryStatusPill(entry, countdownLabel, isTodaySession)}
										{@const isCourseEntry =
											entry.type === 'event' && entry.eventType === 'training_session'}
										<li id={cardId}>
											<article
												class={`relative rounded-xl border border-blue-100 bg-blue-50/60 p-4 pb-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 ${
													isTodaySession ? 'ring-2 ring-blue-400' : ''
												}`}
												aria-labelledby={`${cardId}-title`}
											>
												<div
													class="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between"
												>
													<div
														class="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5"
													>
														<div class="flex w-full flex-col gap-3 sm:w-48">
															{#if entryImage?.mobile || entryImage?.desktop}
																{@const isSquare = entryImage.aspect === 'square'}
																{@const desktopWidthClass = 'sm:w-48'}
																{@const imageFitClass = 'object-cover object-center'}
																<div
																	class={`relative h-44 w-full overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm ${desktopWidthClass} sm:h-36`}
																>
																	<picture
																		class="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"
																	>
																		{#if entryImage.desktop?.src}
																			<source
																				media="(min-width: 640px)"
																				srcset={entryImage.desktop.src}
																			/>
																		{/if}
																		{#if entryImage.mobile?.src}
																			<source
																				media="(max-width: 639px)"
																				srcset={entryImage.mobile.src}
																			/>
																		{/if}
																		<img
																			src={entryImage.desktop?.src ?? entryImage.mobile?.src}
																			alt={entryImage.desktop?.alt ??
																				entryImage.mobile?.alt ??
																				entry.title}
																			class={`h-full w-full ${imageFitClass}`}
																			loading="lazy"
																		/>
																	</picture>
																</div>
															{/if}
														</div>
														<div class="flex-1" id={`${cardId}-title`}>
															<p class="text-sm font-semibold text-gray-900">
																{#if entry.titleUrl}
																	<a
																		href={entry.titleUrl}
																		class="underline decoration-transparent underline-offset-4 transition hover:text-blue-900 hover:decoration-blue-200"
																	>
																		{entry.title}
																	</a>
																{:else}
																	{entry.title}
																{/if}
															</p>
															<p
																class="text-xs font-semibold tracking-wide text-blue-600 uppercase"
															>
																{entry.dateText}
															</p>
															<div class="mt-1 flex flex-wrap items-center gap-2">
																{#if statusPill}
																	<span
																		class={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase tabular-nums ${
																			entry.isHappening
																				? 'bg-amber-100 text-amber-800'
																				: 'bg-blue-600/10 text-blue-700'
																		}`}
																	>
																		{statusPill}
																	</span>
																{/if}
																	{#if entry.certificateText}
																		<span
																			class="inline-flex items-center rounded-full border border-blue-200 bg-white/70 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-blue-700 uppercase"
																		>
																			📜 Certificate included
																		</span>
																	{/if}
																{#if entry.videoUrl}
																	<a
																		href={entry.videoUrl}
																		target="_blank"
																		rel="noopener noreferrer"
																		class="inline-flex items-center rounded-full border border-blue-200 bg-white/70 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-blue-700 uppercase transition hover:bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none"
																		aria-label="Watch the trailer (opens in new tab)"
																	>
																		▶ Trailer <span aria-hidden="true">↗</span>
																	</a>
																{/if}
																{#if isCourseEntry}
																	<span
																		class="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-600/10 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-blue-700 uppercase"
																	>
																		<svg
																			viewBox="0 0 24 24"
																			aria-hidden="true"
																			class="h-3 w-3"
																			fill="currentColor"
																		>
																			<path
																				d="M12 3l10 5-10 5-10-5 10-5zm0 7l6-3v4.5c0 2.5-4 4.5-6 4.5s-6-2-6-4.5V7l6 3zm7 4.5v4a1 1 0 01-2 0v-4h2z"
																			/>
																		</svg>
																		Training
																	</span>
																{:else}
																	<span
																		class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-600/10 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-emerald-700 uppercase"
																	>
																		<svg
																			viewBox="0 0 24 24"
																			aria-hidden="true"
																			class="h-3 w-3"
																			fill="currentColor"
																		>
																			<path
																				d="M9 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3zm7 1a1 1 0 011 1v6a5 5 0 01-4 4.9V19h3a1 1 0 110 2H8a1 1 0 110-2h3v-3.1A5 5 0 017 11V5a1 1 0 112 0v6a3 3 0 006 0V5a1 1 0 011-1z"
																			/>
																		</svg>
																		{entry.eventTypeLabel ?? 'Event'}
																	</span>
																{/if}
															</div>
															{#if entry.metaDetails.length}
																<p class="text-xs text-gray-600">{entry.metaDetails.join(' · ')}</p>
															{/if}
															{#if entry.partnerText}
																<p
																	class="mt-2 text-[0.65rem] tracking-wide text-gray-500 uppercase"
																>
																	In partnership with {entry.partnerText}
																</p>
															{/if}
															{#if entry.speakerText}
																<p class="mt-1 text-xs text-gray-600">Speakers: {entry.speakerText}</p>
															{/if}
															{#if entry.registerLabel || entry.learnMoreUrl}
																<div
																	class="mt-3 grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center"
																>
																	{#if entry.registerLabel}
																		{#if entry.registerUrl && !entry.registerDisabled}
																			<a
																				href={entry.registerUrl}
																				target="_blank"
																				rel="noopener"
																				class="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
																			>
																				{entry.registerLabel}
																			</a>
																		{:else}
																			<span
																				aria-disabled="true"
																				class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-600 shadow-sm"
																			>
																				{entry.registerLabel}
																			</span>
																		{/if}
																	{:else}
																		<div class="hidden sm:block" aria-hidden="true"></div>
																	{/if}
																	{#if entry.learnMoreUrl}
																		<a
																			href={entry.learnMoreUrl}
																			class="inline-flex items-center justify-end font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
																		>
																			Learn more →
																		</a>
																	{/if}
																</div>
															{/if}
														</div>
													</div>
												</div>
											</article>
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
						<p class="text-xs font-semibold tracking-wide text-blue-600 uppercase"></p>
						<p class="text-sm font-semibold text-gray-900">Design a private workshop</p>
						<p class="text-sm text-gray-600">Tailor a cohort to meet your team's goals.</p>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:items-end">
					<a
						href="/contact"
						class="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"
					>
						Book a consultation
					</a>
				</div>
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
								onclick={handleBookmarkClick}
							>
								this page
							</a>
							so you never miss another event.
						</p>
					</div>
				<ul class="mt-4 space-y-4">
					{#each filteredHappeningEntries as entry}
						<li>
							<article
								class="relative rounded-xl border border-amber-200 bg-white p-4 pb-3 shadow-sm"
							>
								<div class="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
									<div class="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
										<div class="flex w-full flex-col gap-3 sm:w-48">
											{#if entry.image?.mobile || entry.image?.desktop}
												{@const isSquare = entry.image.aspect === 'square'}
												{@const desktopWidthClass = 'sm:w-48'}
												{@const imageFitClass = 'object-cover object-center'}
												<div
													class={`relative h-44 w-full overflow-hidden rounded-xl border border-amber-100 bg-white shadow-sm ${desktopWidthClass} sm:h-36`}
												>
													<picture
														class="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-100"
													>
														{#if entry.image.desktop?.src}
															<source media="(min-width: 640px)" srcset={entry.image.desktop.src} />
														{/if}
														{#if entry.image.mobile?.src}
															<source media="(max-width: 639px)" srcset={entry.image.mobile.src} />
														{/if}
														<img
															src={entry.image.desktop?.src ?? entry.image.mobile?.src}
															alt={entry.image.desktop?.alt ??
																entry.image.mobile?.alt ??
																entry.title}
															class={`h-full w-full ${imageFitClass}`}
															loading="lazy"
														/>
													</picture>
												</div>
											{/if}
										</div>
										<div class="flex-1">
											<p class="text-sm font-semibold text-gray-900">
												{#if entry.titleUrl}
													<a
														href={entry.titleUrl}
														class="underline decoration-transparent underline-offset-4 transition hover:text-blue-900 hover:decoration-blue-200"
													>
														{entry.title}
													</a>
												{:else}
													{entry.title}
												{/if}
											</p>
											<p class="text-xs font-semibold tracking-wide text-amber-700 uppercase">
												{entry.dateText}
											</p>
											<div class="mt-1 flex flex-wrap items-center gap-2">
												<span
													class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-amber-800 uppercase"
												>
													Enrollment closed
												</span>
													{#if entry.certificateText}
														<span
															class="inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-amber-800 uppercase"
														>
															📜 Certificate included
														</span>
													{/if}
												{#if entry.videoUrl}
													<a
														href={entry.videoUrl}
														target="_blank"
														rel="noopener noreferrer"
														class="inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-amber-800 uppercase transition hover:bg-white focus:ring-2 focus:ring-amber-200 focus:outline-none"
														aria-label="Watch the trailer (opens in new tab)"
													>
														▶ Trailer <span aria-hidden="true">↗</span>
													</a>
												{/if}
												<span
													class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100/70 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-amber-800 uppercase"
												>
													<svg
														viewBox="0 0 24 24"
														aria-hidden="true"
														class="h-3 w-3"
														fill="currentColor"
													>
														<path
															d="M12 3l10 5-10 5-10-5 10-5zm0 7l6-3v4.5c0 2.5-4 4.5-6 4.5s-6-2-6-4.5V7l6 3zm7 4.5v4a1 1 0 01-2 0v-4h2z"
														/>
													</svg>
													Training
												</span>
											</div>
											{#if entry.metaDetails.length}
												<p class="text-xs text-gray-600">{entry.metaDetails.join(' · ')}</p>
											{/if}
											{#if entry.partnerText}
												<p class="mt-2 text-[0.65rem] tracking-wide text-gray-500 uppercase">
													In partnership with {entry.partnerText}
												</p>
											{/if}
											{#if entry.speakerText}
												<p class="mt-1 text-xs text-gray-600">Speakers: {entry.speakerText}</p>
											{/if}
											{#if entry.registerUrl || entry.learnMoreUrl}
												<div
													class="mt-3 grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center"
												>
													{#if entry.registerUrl}
														<span
															aria-disabled="true"
															class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-600 shadow-sm"
														>
															Enrollment closed
														</span>
													{:else}
														<div class="hidden sm:block" aria-hidden="true"></div>
													{/if}
													{#if entry.learnMoreUrl}
														<a
															href={entry.learnMoreUrl}
															class="inline-flex items-center justify-end font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
														>
															Learn more →
														</a>
													{/if}
												</div>
											{/if}
										</div>
									</div>
								</div>
							</article>
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
				>
					Browse the past events archive →
				</a>
			</p>
		</div>

		<p class="text-sm text-gray-600">
			Browse the full schedule on
			<a
				href="https://luma.com/BillTalksAI?k=c"
				target="_blank"
				rel="noopener"
				class="inline-flex items-center gap-1 text-blue-700 underline underline-offset-2 hover:text-blue-900"
				>Lu.ma</a
			>
			and grab a seat while spots are still open.
		</p>
	</div>
</section>
