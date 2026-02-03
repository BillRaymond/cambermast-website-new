<script lang="ts">
	import { onMount } from 'svelte';
	import {
		listExternalEvents,
		getExternalEventStartTimestamp,
		isExternalEventUpcoming
	} from '$lib/data/external-events';
	import type { ExternalEvent } from '$lib/data/external-events';
	import {
		getEventStartTimestamp,
		getEventTypeLabel,
		isEventUpcoming,
		listEvents
	} from '$lib/data/events';
	import type { Event } from '$lib/data/events/types';
import { listTrainingPrograms } from '$lib/data/training';
import type { TrainingProgram, TrainingSession } from '$lib/data/training/types';
import { getProgramCertificateText } from '$lib/data/training/program-meta';
import {
	getSessionStartTimestamp,
	hasExternalRegistration,
	isSessionUpcoming,
	isSessionHappeningNow,
	normalizeToday
} from '$lib/data/training/session-utils';

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
		type: 'training' | 'external' | 'event';
		title: string;
		subtitle: string | null;
		eventType?: string;
		eventTypeLabel?: string;
		startTimestamp: number | null;
		dateText: string;
		metaDetails: string[];
		partnerText: string | null;
		registerUrl: string;
		learnMoreUrl?: string;
		image: EntryImage | null;
		certificateText?: string;
		videoUrl?: string;
		isHappening?: boolean;
		happeningEndLabel?: string;
	};

type GroupedEntries = {
	monthLabel: string;
	items: Array<{ entry: UpcomingEntry; index: number }>;
};

	type FilterOption = 'all' | 'training' | 'events' | `event:${string}`;

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

const endDateFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'long',
	day: 'numeric',
	year: 'numeric'
});

	const getSessionLabel = (program: TrainingProgram, session: TrainingSession): string | null => {
		const trimmed = session.name?.trim();
		return trimmed && trimmed.length > 0 && trimmed !== program.title ? trimmed : null;
	};

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

	const getCountdownLabel = (
		startTimestamp: number | null,
		referenceMs: number
	): string | null => {
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
		if (startTimestamp) {
			return dateFormatter.format(new Date(startTimestamp));
		}
		return fallback;
	};

const formatTimeLabel = (value?: string | string[]): string | null => {
	if (!value) return null;
	return Array.isArray(value) ? value.join(' / ') : value;
};

const formatEndLabel = (value?: string): string => {
	if (!value) return 'soon';
	const parsed = new Date(value);
	if (Number.isNaN(parsed.valueOf())) return value;
	return endDateFormatter.format(parsed);
};

const defaultLocationLabel = 'Live online';

	const getProgramImage = (program: TrainingProgram): EntryImage => {
		const heroImage = program.heroImage
			? {
					src: program.heroImage,
					alt: program.heroImageAlt ?? program.title
				}
			: null;
		const ogImage = program.ogImage
			? {
					src: program.ogImage,
					alt: program.ogImageAlt ?? program.title
				}
			: null;

		return {
			desktop: heroImage ?? ogImage,
			mobile: ogImage ?? heroImage,
			aspect: 'wide'
		};
	};

	const getEventCardImage = (event: Event): EntryImage => {
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

const getEventImage = (event: ExternalEvent): EntryImage => {
	const image = event.image
		? {
				src: event.image,
				alt: event.imageAlt ?? event.title
				}
			: null;
		return {
			desktop: image,
			mobile: image,
		aspect: event.imageAspect ?? 'wide'
	};
};

const createTrainingEntry = (
	program: TrainingProgram,
	session: TrainingSession,
	index: number,
	overrides: Partial<UpcomingEntry> = {}
): UpcomingEntry => {
	const startTimestamp = toFiniteTimestamp(getSessionStartTimestamp(session));
	const sessionLabel = getSessionLabel(program, session);
	const timeLabel = formatTimeLabel(session.time);
	const locationLabel = session.location ?? defaultLocationLabel;
	const metaDetails: string[] = [];
	if (timeLabel) metaDetails.push(timeLabel);
	if (locationLabel) metaDetails.push(locationLabel);
	if (session.spots) metaDetails.push(session.spots);

	const { isHappening = false, ...rest } = overrides;

	const entry: UpcomingEntry = {
		id:
			rest.id ??
			`training-${program.slug}-${isHappening ? 'happening' : 'upcoming'}-${index}`,
		type: 'training',
		title: program.title,
		subtitle: sessionLabel,
		startTimestamp,
		dateText: formatDateLabel(startTimestamp, session.date),
		metaDetails,
		partnerText: session.partner ?? null,
		registerUrl: session.registerUrl,
		learnMoreUrl: program.route,
		image: getProgramImage(program),
		certificateText: getProgramCertificateText(program),
		videoUrl: program.videoUrl,
		isHappening,
		...rest
	};

	return entry;
};

const toFiniteTimestamp = (value: number): number | null =>
	Number.isFinite(value) ? value : null;

let upcomingTrainingEntries: UpcomingEntry[] = [];
let happeningTrainingEntries: UpcomingEntry[] = [];
let upcomingExternalEntries: UpcomingEntry[] = [];
let upcomingEventEntries: UpcomingEntry[] = [];
let upcomingEntries: UpcomingEntry[] = [];

$: upcomingTrainingEntries = listTrainingPrograms()
	.flatMap((program) => (program.sessions ?? []).map((session) => ({ program, session })))
	.filter(({ session }) => hasExternalRegistration(session))
	.filter(
		({ session }) => isSessionUpcoming(session, today) && !isSessionHappeningNow(session, now)
	)
	.map(({ program, session }, index) => createTrainingEntry(program, session, index));

$: happeningTrainingEntries = listTrainingPrograms()
	.flatMap((program) => (program.sessions ?? []).map((session) => ({ program, session })))
	.filter(({ session }) => session.startDate && isSessionHappeningNow(session, now))
	.map(({ program, session }, index) =>
		createTrainingEntry(program, session, index, {
			isHappening: true,
			happeningEndLabel: formatEndLabel(session.endDate ?? session.date)
		})
	);

$: upcomingExternalEntries = listExternalEvents()
	.filter((event) => isExternalEventUpcoming(event, today))
	.map((event, index) => {
		const startTimestamp = toFiniteTimestamp(getExternalEventStartTimestamp(event));
		const timeLabel = formatTimeLabel(event.timeLines);
		const locationLabel = event.location ?? defaultLocationLabel;
		const metaDetails: string[] = [];
		if (timeLabel) metaDetails.push(timeLabel);
		if (locationLabel) metaDetails.push(locationLabel);
		if (event.spots) metaDetails.push(event.spots);

		return {
			id: `external-${event.id ?? index}`,
			type: 'external' as const,
			title: event.title,
			subtitle: event.sessionLabel ?? null,
			startTimestamp,
			dateText: formatDateLabel(startTimestamp, event.date),
			metaDetails,
			partnerText: event.partner ?? null,
			registerUrl: event.registerUrl,
			image: getEventImage(event)
		};
	});

	$: upcomingEventEntries = listEvents()
		.filter((event) => isEventUpcoming(event, today))
		.map((event, index) => {
			const startTimestamp = toFiniteTimestamp(getEventStartTimestamp(event));
			const timeLabel = formatTimeLabel(event.time);
		const locationLabel = event.location ?? defaultLocationLabel;
		const metaDetails: string[] = [];
		if (timeLabel) metaDetails.push(timeLabel);
		if (locationLabel) metaDetails.push(locationLabel);

		const relatedProgramSlug = event.relatedProgramSlugs?.[0];
		const relatedProgram = relatedProgramSlug
			? listTrainingPrograms().find((program) => program.slug === relatedProgramSlug)
			: undefined;

			const eventTypeLabel = getEventTypeLabel(event);
			const subtitle = `${eventTypeLabel}${event.draft ? ' · Draft' : ''}`;

			return {
				id: `event-${event.id ?? index}`,
				type: 'event' as const,
				title: event.title,
				subtitle,
				eventType: event.type,
				eventTypeLabel,
				startTimestamp,
				dateText: formatDateLabel(startTimestamp, event.date),
				metaDetails,
				partnerText: null,
				registerUrl: event.registerUrl,
			learnMoreUrl: relatedProgram?.route ?? '/events',
			image: getEventCardImage(event)
		};
	});

	$: upcomingEntries = [
		...upcomingTrainingEntries,
		...upcomingExternalEntries,
		...upcomingEventEntries
	].sort((a, b) => (a.startTimestamp ?? Infinity) - (b.startTimestamp ?? Infinity));

	type EventTypeFilter = {
		key: string;
		label: string;
	};

	let eventTypeFilters: EventTypeFilter[] = [];

	$: eventTypeFilters = Array.from(
		new Map(
			upcomingEventEntries
				.filter((entry) => entry.eventType)
				.map((entry) => [
					entry.eventType as string,
					entry.eventTypeLabel ?? (entry.eventType as string)
				])
		).entries()
	).map(([key, label]) => ({ key, label }));

	const filteredUpcomingEntries = (entries: UpcomingEntry[], filter: FilterOption): UpcomingEntry[] => {
		if (filter === 'training') {
			return entries.filter((entry) => entry.type === 'training');
		}
		if (filter === 'events') {
			return entries.filter((entry) => entry.type !== 'training');
		}
		if (filter.startsWith('event:')) {
			const eventType = filter.slice('event:'.length);
			return entries.filter(
				(entry) => entry.type === 'event' && entry.eventType === eventType
			);
		}
		return entries;
	};

let happeningEntries: UpcomingEntry[] = [];

$: happeningEntries = [...happeningTrainingEntries].sort(
	(a, b) => (a.startTimestamp ?? Infinity) - (b.startTimestamp ?? Infinity)
);

	const getMonthLabel = (entry: UpcomingEntry): string => {
		if (entry.startTimestamp) {
			return monthFormatter.format(new Date(entry.startTimestamp));
		}
		return 'Flexible scheduling';
	};

	let groupedEntries: GroupedEntries[] = [];
	let firstTodayIndex = -1;

	$: groupedEntries = filteredUpcomingEntries(upcomingEntries, activeFilter).reduce<GroupedEntries[]>(
		(groups, entry, index) => {
		const monthLabel = getMonthLabel(entry);
		const lastGroup = groups[groups.length - 1];
		if (!lastGroup || lastGroup.monthLabel !== monthLabel) {
			groups.push({ monthLabel, items: [] });
		}
		groups[groups.length - 1].items.push({ entry, index });
		return groups;
	},
	[]);

	$: firstTodayIndex = filteredUpcomingEntries(upcomingEntries, activeFilter).findIndex(
		({ startTimestamp }) =>
		isTodayTimestamp(startTimestamp)
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
		<header class="flex flex-col gap-5">
			<h1 class="text-3xl font-bold text-gray-900">
				Upcoming AI workshops, cohorts, and events you can join
			</h1>
		</header>

		<div class="flex flex-col gap-1">
			<div class="flex flex-wrap items-center gap-2 pl-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
				<span class="text-[0.65rem]">Filter</span>
				<button
					type="button"
					onclick={() => (activeFilter = 'all')}
					aria-pressed={activeFilter === 'all'}
					class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide transition ${
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
					class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide transition ${
						activeFilter === 'training'
							? 'border-blue-200 bg-blue-600/10 text-blue-700'
							: 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
					}`}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true" class="h-3 w-3" fill="currentColor">
						<path d="M12 3l10 5-10 5-10-5 10-5zm0 7l6-3v4.5c0 2.5-4 4.5-6 4.5s-6-2-6-4.5V7l6 3zm7 4.5v4a1 1 0 01-2 0v-4h2z" />
					</svg>
					Training
				</button>
					<button
						type="button"
						onclick={() => (activeFilter = 'events')}
						aria-pressed={activeFilter === 'events'}
						class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide transition ${
							activeFilter === 'events'
								? 'border-emerald-200 bg-emerald-600/10 text-emerald-700'
								: 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
						}`}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true" class="h-3 w-3" fill="currentColor">
							<path d="M9 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3zm7 1a1 1 0 011 1v6a5 5 0 01-4 4.9V19h3a1 1 0 110 2H8a1 1 0 110-2h3v-3.1A5 5 0 017 11V5a1 1 0 112 0v6a3 3 0 006 0V5a1 1 0 011-1z" />
						</svg>
						Events
					</button>
					{#if eventTypeFilters.length}
						{#each eventTypeFilters as filter}
							<button
								type="button"
								onclick={() => (activeFilter = `event:${filter.key}`)}
								aria-pressed={activeFilter === `event:${filter.key}`}
								class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide transition ${
									activeFilter === `event:${filter.key}`
										? 'border-emerald-200 bg-emerald-600/10 text-emerald-700'
										: 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
								}`}
							>
								{filter.label}
							</button>
						{/each}
					{/if}
				</div>

			<div class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
			{#if groupedEntries.length}
				<div class="space-y-8">
					{#each groupedEntries as group}
						<section>
							<h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
								{group.monthLabel}
							</h3>
							<ul class="mt-3 space-y-4">
								{#each group.items as item}
									{@const { entry, index } = item}
									{@const cardId = entry.id}
									{@const isTodaySession = index === firstTodayIndex}
						{@const entryImage = entry.image}
						<li id={cardId}>
							<article
								class={`relative rounded-xl border border-blue-100 bg-blue-50/60 p-4 pb-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 ${
									isTodaySession ? 'ring-2 ring-blue-400' : ''
								}`}
								aria-labelledby={`${cardId}-title`}
							>
							<div class="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
											<div class="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
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
														{entry.title}
													</p>
													<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
														{entry.dateText}
													</p>
													{#if entry.metaDetails.length}
														<p class="text-xs text-gray-600">{entry.metaDetails.join(' · ')}</p>
													{/if}
													{#if entry.startTimestamp}
														{@const countdownLabel = getCountdownLabel(entry.startTimestamp, nowMs)}
														{#if countdownLabel}
															<div class="mt-1 flex flex-wrap items-center gap-2">
																<span
																	class="inline-flex items-center rounded-full bg-blue-600/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-blue-700 tabular-nums"
																>
																	{isTodaySession ? `Today · ${countdownLabel}` : countdownLabel}
																</span>
																{#if entry.type === 'training'}
																	<span class="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-600/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-blue-700">
																		<svg viewBox="0 0 24 24" aria-hidden="true" class="h-3 w-3" fill="currentColor">
																			<path d="M12 3l10 5-10 5-10-5 10-5zm0 7l6-3v4.5c0 2.5-4 4.5-6 4.5s-6-2-6-4.5V7l6 3zm7 4.5v4a1 1 0 01-2 0v-4h2z" />
																		</svg>
																		Training
																	</span>
																	{:else}
																		<span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-600/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-emerald-700">
																			<svg viewBox="0 0 24 24" aria-hidden="true" class="h-3 w-3" fill="currentColor">
																				<path d="M9 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3zm7 1a1 1 0 011 1v6a5 5 0 01-4 4.9V19h3a1 1 0 110 2H8a1 1 0 110-2h3v-3.1A5 5 0 017 11V5a1 1 0 112 0v6a3 3 0 006 0V5a1 1 0 011-1z" />
																			</svg>
																			{entry.eventTypeLabel ?? 'Event'}
																		</span>
																	{/if}
															</div>
														{/if}
													{/if}
													{#if entry.certificateText || entry.videoUrl}
														<div class="mt-2 flex flex-col gap-1 text-xs font-semibold text-blue-700">
															{#if entry.certificateText}
																<p>{entry.certificateText}</p>
															{/if}
															{#if entry.videoUrl}
																<a
																	href={entry.videoUrl}
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
													{#if entry.partnerText}
														<p class="mt-2 text-[0.65rem] uppercase tracking-wide text-gray-500">
															In partnership with {entry.partnerText}
														</p>
													{/if}
													{#if entry.registerUrl || entry.learnMoreUrl}
														<div class="mt-3 grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
															{#if entry.registerUrl}
																<a
																	href={entry.registerUrl}
																	target="_blank"
																	rel="noopener"
																	class="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
																>
																	Register now
																</a>
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
				<div class="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-gray-600">
					New public cohorts are being scheduled. Follow the Bill Talks AI newsletter or contact us
					to reserve custom training dates for your team.
				</div>
			{/if}
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
						<p class="text-xs font-semibold uppercase tracking-wide text-blue-600"></p>
						<p class="text-sm font-semibold text-gray-900">Design a private workshop</p>
						<p class="text-sm text-gray-600">Tailor a cohort to meet your team's goals.</p>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:items-end">
					<a
						href="/contact"
						class="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
					>
						Book a consultation
					</a>
				</div>
			</div>
		</div>

		{#if activeFilter !== 'events' && happeningEntries.length}
			<div class="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<h2 class="whitespace-nowrap text-lg font-semibold text-amber-900">Happening now</h2>
					<p class="min-w-0 flex-1 text-xs text-amber-700">
						Bookmark this page so you never miss another event
					</p>
				</div>
				<ul class="mt-4 space-y-4">
					{#each happeningEntries as entry}
						<li>
							<article class="relative rounded-xl border border-amber-200 bg-white p-4 pb-3 shadow-sm">
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
															<source
																media="(min-width: 640px)"
																srcset={entry.image.desktop.src}
															/>
														{/if}
														{#if entry.image.mobile?.src}
															<source
																media="(max-width: 639px)"
																srcset={entry.image.mobile.src}
															/>
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
											<p class="text-sm font-semibold text-gray-900">{entry.title}</p>
											<p class="text-xs font-semibold uppercase tracking-wide text-amber-700">
												{entry.dateText}
											</p>
											<div class="mt-1 flex flex-wrap items-center gap-2">
												<span
													class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-800"
												>
													Enrollment closed, running now
												</span>
												<span class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100/70 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-amber-800">
													<svg viewBox="0 0 24 24" aria-hidden="true" class="h-3 w-3" fill="currentColor">
														<path d="M12 3l10 5-10 5-10-5 10-5zm0 7l6-3v4.5c0 2.5-4 4.5-6 4.5s-6-2-6-4.5V7l6 3zm7 4.5v4a1 1 0 01-2 0v-4h2z" />
													</svg>
													Training
												</span>
											</div>
											{#if entry.metaDetails.length}
												<p class="text-xs text-gray-600">{entry.metaDetails.join(' · ')}</p>
											{/if}
											{#if entry.certificateText || entry.videoUrl}
												<div class="mt-2 flex flex-col gap-1 text-xs font-semibold text-blue-700">
													{#if entry.certificateText}
														<p>{entry.certificateText}</p>
													{/if}
													{#if entry.videoUrl}
														<a
															href={entry.videoUrl}
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
											{#if entry.partnerText}
												<p class="mt-2 text-[0.65rem] uppercase tracking-wide text-gray-500">
													In partnership with {entry.partnerText}
												</p>
											{/if}
											{#if entry.registerUrl || entry.learnMoreUrl}
												<div class="mt-3 grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
													{#if entry.registerUrl}
														<a
															href={entry.registerUrl}
															target="_blank"
															rel="noopener"
															aria-disabled="true"
															class="inline-flex w-full items-center justify-center rounded-lg bg-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-600 shadow-sm"
														>
															Enrollment closed, running now
														</a>
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
