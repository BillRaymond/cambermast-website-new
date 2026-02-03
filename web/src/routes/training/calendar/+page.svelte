<script lang="ts">
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
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
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

	const today = normalizeToday();

	const MILLISECONDS_IN_HOUR = 1000 * 60 * 60;
	const MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR;

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

	const getUrgencyLabel = (startTimestamp: number | null): string | null => {
		if (startTimestamp === null || !Number.isFinite(startTimestamp)) return null;
		const diffMs = startTimestamp - Date.now();
		if (diffMs <= 0) return 'Happening now';
		if (diffMs < MILLISECONDS_IN_HOUR) return 'Starting soon';
		if (diffMs < 2 * MILLISECONDS_IN_HOUR) return 'Starts in about an hour';
		if (diffMs < MILLISECONDS_IN_DAY) {
			const hours = Math.floor(diffMs / MILLISECONDS_IN_HOUR);
			return `Starts in ${hours} hours`;
		}
		const diffDays = Math.ceil(diffMs / MILLISECONDS_IN_DAY);
		if (diffDays === 1) return 'Starts tomorrow';
		return `Starts in ${diffDays} days`;
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

const upcomingTrainingEntries: UpcomingEntry[] = listTrainingPrograms()
	.flatMap((program) => (program.sessions ?? []).map((session) => ({ program, session })))
		.filter(({ session }) => hasExternalRegistration(session))
		.filter(
			({ session }) =>
				isSessionUpcoming(session, today) && !isSessionHappeningNow(session, today)
		)
	.map(({ program, session }, index) => createTrainingEntry(program, session, index));

const happeningTrainingEntries: UpcomingEntry[] = listTrainingPrograms()
	.flatMap((program) => (program.sessions ?? []).map((session) => ({ program, session })))
	.filter(({ session }) => session.startDate && isSessionHappeningNow(session, today))
	.map(({ program, session }, index) =>
		createTrainingEntry(program, session, index, {
			isHappening: true,
			happeningEndLabel: formatEndLabel(session.endDate ?? session.date)
		})
	);

const upcomingExternalEntries: UpcomingEntry[] = listExternalEvents()
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

const upcomingEventEntries: UpcomingEntry[] = listEvents()
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

		const subtitle = `${getEventTypeLabel(event)}${event.draft ? ' · Draft' : ''}`;

		return {
			id: `event-${event.id ?? index}`,
			type: 'event' as const,
			title: event.title,
			subtitle,
			startTimestamp,
			dateText: formatDateLabel(startTimestamp, event.date),
			metaDetails,
			partnerText: null,
			registerUrl: event.registerUrl,
			learnMoreUrl: relatedProgram?.route ?? `/events/${event.slug}`,
			image: getEventCardImage(event)
		};
	});

const upcomingEntries: UpcomingEntry[] = [
	...upcomingTrainingEntries,
	...upcomingExternalEntries,
	...upcomingEventEntries
].sort((a, b) => (a.startTimestamp ?? Infinity) - (b.startTimestamp ?? Infinity));

const happeningEntries: UpcomingEntry[] = [...happeningTrainingEntries].sort(
	(a, b) => (a.startTimestamp ?? Infinity) - (b.startTimestamp ?? Infinity)
);

	const getMonthLabel = (entry: UpcomingEntry): string => {
		if (entry.startTimestamp) {
			return monthFormatter.format(new Date(entry.startTimestamp));
		}
		return 'Flexible scheduling';
	};

	const groupedEntries = upcomingEntries.reduce<GroupedEntries[]>((groups, entry, index) => {
		const monthLabel = getMonthLabel(entry);
		const lastGroup = groups[groups.length - 1];
		if (!lastGroup || lastGroup.monthLabel !== monthLabel) {
			groups.push({ monthLabel, items: [] });
		}
		groups[groups.length - 1].items.push({ entry, index });
		return groups;
	}, []);

	const firstTodayIndex = upcomingEntries.findIndex(({ startTimestamp }) =>
		isTodayTimestamp(startTimestamp)
	);

	const pageMeta = getSeo('/training/calendar');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/training/calendar" />

<section class="bg-gradient-to-b from-blue-50/60 to-white">
	<div class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
		<header class="flex flex-col gap-5">
			<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">
				Upcoming training & events
			</p>
			<h1 class="text-3xl font-bold text-gray-900">New AI workshops and cohorts you can join</h1>
			<p class="max-w-2xl text-base text-gray-700">
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
		</header>

		<div class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
			<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
				<h2 class="whitespace-nowrap text-lg font-semibold text-gray-900">Upcoming sessions</h2>
			</div>

			{#if groupedEntries.length}
				<div class="mt-6 space-y-8">
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
														{@const imageFitClass = 'object-contain'}
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
													<div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
														<span>{entry.dateText}</span>
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
																Event
															</span>
														{/if}
													</div>
													<p class="mt-1 text-sm font-semibold text-gray-900">
														{entry.title}
													</p>
													{#if entry.metaDetails.length}
														<p class="text-xs text-gray-600">{entry.metaDetails.join(' · ')}</p>
													{/if}
													{#if isTodaySession}
														<span
															class="mt-1 inline-flex items-center rounded-full bg-emerald-600/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700"
														>
															Today
														</span>
													{/if}
													{#if entry.startTimestamp}
														{#if getUrgencyLabel(entry.startTimestamp)}
															<p
																class="mt-1 inline-flex items-center rounded-full bg-blue-600/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-blue-700"
															>
																{getUrgencyLabel(entry.startTimestamp)}
															</p>
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

		<div class="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm">
			<h2 class="text-lg font-semibold text-gray-900">Design a private workshop</h2>
			<p class="mt-1 text-sm text-gray-600">
				Tailor a cohort to your team’s goals, tooling, and delivery timeline with Bill Raymond.
			</p>
			<div class="mt-4 flex flex-wrap gap-3">
				<a
					href="/contact"
					class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
				>
					Talk with Bill
				</a>
				<a
					href="/training"
					class="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:text-blue-900"
				>
					Browse training catalog
				</a>
			</div>
		</div>

		{#if happeningEntries.length}
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
												{@const imageFitClass = 'object-contain'}
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
											<div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
												<span>{entry.dateText}</span>
												<span class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100/70 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-amber-800">
													<svg viewBox="0 0 24 24" aria-hidden="true" class="h-3 w-3" fill="currentColor">
														<path d="M12 3l10 5-10 5-10-5 10-5zm0 7l6-3v4.5c0 2.5-4 4.5-6 4.5s-6-2-6-4.5V7l6 3zm7 4.5v4a1 1 0 01-2 0v-4h2z" />
													</svg>
													Training
												</span>
											</div>
											<p class="mt-1 text-sm font-semibold text-gray-900">{entry.title}</p>
											{#if entry.metaDetails.length}
												<p class="text-xs text-gray-600">{entry.metaDetails.join(' · ')}</p>
											{/if}
											<p
												class="mt-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-800"
											>
												Enrollment closed, running now
											</p>
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
	</div>
</section>
