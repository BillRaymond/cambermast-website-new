<script lang="ts">
	import { listTrainingPrograms } from '$lib/data/training';
	import type { TrainingProgram, TrainingSession } from '$lib/data/training/types';
	import { getSeo } from '$lib/seo';
	import {
		getSessionStartTimestamp,
		hasExternalRegistration,
		isSessionUpcoming,
		normalizeToday
	} from '$lib/data/training/session-utils';

	type ProgramSession = {
		program: TrainingProgram;
		session: TrainingSession;
		startTimestamp: number | null;
		sessionLabel: string | null;
	};

	type GroupedSessions = {
		monthLabel: string;
		items: Array<{ entry: ProgramSession; index: number }>;
	};

	type ProgramImage = {
		src: string;
		alt: string;
	};

	const today = normalizeToday();

	const MILLISECONDS_IN_HOUR = 1000 * 60 * 60;
	const MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR;

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

	const upcomingSessions: ProgramSession[] = listTrainingPrograms()
		.flatMap((program: TrainingProgram) =>
			(program.sessions ?? []).map((session) => ({
				program,
				session,
				startTimestamp: getSessionStartTimestamp(session),
				sessionLabel: getSessionLabel(program, session)
			}))
		)
		.filter(({ session }) => hasExternalRegistration(session))
		.filter(({ session }) => isSessionUpcoming(session, today))
		.sort((a, b) => (a.startTimestamp ?? Infinity) - (b.startTimestamp ?? Infinity));

	const isTodayTimestamp = (timestamp: number | null): boolean => {
		if (timestamp === null) return false;
		const sessionDate = new Date(timestamp);
		return (
			sessionDate.getFullYear() === today.getFullYear() &&
			sessionDate.getMonth() === today.getMonth() &&
			sessionDate.getDate() === today.getDate()
		);
	};

	const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

	const getMonthLabel = (entry: ProgramSession): string => {
		if (entry.startTimestamp) {
			return monthFormatter.format(new Date(entry.startTimestamp));
		}
		return 'Flexible scheduling';
	};

	const groupedSessions = upcomingSessions.reduce<GroupedSessions[]>((groups, entry, index) => {
		const monthLabel = getMonthLabel(entry);
		const lastGroup = groups[groups.length - 1];
		if (!lastGroup || lastGroup.monthLabel !== monthLabel) {
			groups.push({ monthLabel, items: [] });
		}
		groups[groups.length - 1].items.push({ entry, index });
		return groups;
	}, []);

	const firstTodayIndex = upcomingSessions.findIndex(({ startTimestamp }) =>
		isTodayTimestamp(startTimestamp)
	);

	const firstTodaySessionId =
		firstTodayIndex >= 0
			? `session-${upcomingSessions[firstTodayIndex].program.slug}-${firstTodayIndex}`
			: null;

	const scrollToToday = (): void => {
		if (typeof document === 'undefined') return;
		const targetId = firstTodaySessionId;
		if (!targetId) return;
		const el = document.getElementById(targetId);
		if (!el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		el.focus?.({ preventScroll: true });
	};

	const formatDate = (entry: ProgramSession): string => {
		if (entry.startTimestamp) {
			return new Intl.DateTimeFormat('en-US', {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			}).format(new Date(entry.startTimestamp));
		}

		return entry.session.date;
	};

	const formatTime = (entry: ProgramSession): string | null => {
		const { time } = entry.session;
		if (!time) return null;
		return Array.isArray(time) ? time.join(' / ') : time;
	};

	const defaultLocationLabel = 'Live online';

	const getProgramImage = (program: TrainingProgram): { desktop: ProgramImage | null; mobile: ProgramImage | null } => {
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
			mobile: ogImage ?? heroImage
		};
	};

	const pageMeta = getSeo('/training/calendar');
</script>

<svelte:head>
	<title>{pageMeta.title}</title>
	{#if pageMeta.description}
		<meta name="description" content={pageMeta.description} />
	{/if}
</svelte:head>

<section class="bg-gradient-to-b from-blue-50/60 to-white">
	<div class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
		<header class="flex flex-col gap-4">
			<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Upcoming training & events</p>
			<h1 class="text-3xl font-bold text-gray-900">
				New AI workshops and cohorts you can join
			</h1>
			<p class="max-w-2xl text-sm text-gray-600">
				We keep this list refreshed whenever new cohorts open or public workshops go live. Grab a spot, or <a href="/contact" class="inline-flex items-center gap-1 text-blue-700 underline underline-offset-2 hover:text-blue-900">contact us</a> if you want to run a private session on your schedule.
			</p>
		</header>

		<div class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
			<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
				<h2 class="text-lg font-semibold text-gray-900">
					Upcoming sessions ({upcomingSessions.length})
				</h2>
				<p class="text-xs text-gray-500">
					List sorted chronologically. Additional cohorts may be scheduled privately.
				</p>
			</div>

			{#if groupedSessions.length}
				<div class="mt-6 space-y-8">
					{#each groupedSessions as group}
						<section>
							<h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
								{group.monthLabel}
							</h3>
							<ul class="mt-3 space-y-4">
								{#each group.items as item}
									{@const { entry, index } = item}
									{@const cardId = `session-${entry.program.slug}-${index}`}
									{@const isTodaySession = index === firstTodayIndex}
									{@const programImage = getProgramImage(entry.program)}
									<li
										id={cardId}
										tabindex="-1"
										class={`rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm ${
											isTodaySession ? 'ring-2 ring-blue-400' : ''
										}`}
									>
										<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
											<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 flex-1">
												{#if programImage.mobile || programImage.desktop}
													<div class="w-full overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm sm:w-36">
														<img
															src={programImage.mobile?.src ?? programImage.desktop?.src}
															alt={programImage.mobile?.alt ?? programImage.desktop?.alt ?? entry.program.title}
															class="h-40 w-full object-cover sm:hidden"
															loading="lazy"
														/>
														<img
															src={programImage.desktop?.src ?? programImage.mobile?.src}
															alt={programImage.desktop?.alt ?? programImage.mobile?.alt ?? entry.program.title}
															class="hidden h-28 w-full object-cover sm:block"
															loading="lazy"
														/>
													</div>
												{/if}
												<div class="flex-1">
													<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
														{formatDate(entry)}
													</p>
													<p class="mt-1 text-sm font-semibold text-gray-900">
														{entry.program.title}
													</p>
													{#if entry.sessionLabel}
														<p class="text-sm text-gray-700">{entry.sessionLabel}</p>
													{/if}
													<p class="text-xs text-gray-600">
														{#if formatTime(entry)}
															{formatTime(entry)}
														{/if}
														{#if entry.session.location || !formatTime(entry)}
															· {entry.session.location ?? defaultLocationLabel}
														{/if}
														{#if entry.session.spots}
															· {entry.session.spots}
														{/if}
													</p>
													{#if isTodaySession}
														<span class="mt-1 inline-flex items-center rounded-full bg-emerald-600/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700">
															Today
														</span>
													{/if}
													{#if entry.startTimestamp}
														{#if getUrgencyLabel(entry.startTimestamp)}
															<p class="mt-1 inline-flex items-center rounded-full bg-blue-600/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-blue-700">
																{getUrgencyLabel(entry.startTimestamp)}
															</p>
														{/if}
													{/if}
												</div>
											</div>
											<div class="flex flex-col gap-2 sm:w-40">
												<a
													href={entry.session.registerUrl}
													class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
												>
													Register ↗
												</a>
												<a
													href={entry.program.route}
													class="inline-flex items-center justify-center rounded-lg border border-blue-200 px-4 py-1.5 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:text-blue-900"
												>
													Learn more
												</a>
											</div>
										</div>
									</li>
								{/each}
							</ul>
						</section>
					{/each}
				</div>
			{:else}
				<div class="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-gray-600">
					New public cohorts are being scheduled. Follow the Bill Talks AI newsletter or contact us to
					reserve custom training dates for your team.
				</div>
			{/if}
		</div>

		<div class="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm">
			<h2 class="text-lg font-semibold text-gray-900">Need a custom session?</h2>
			<p class="mt-1 text-sm text-gray-600">
				Most engagements start within 2–4 weeks. We’ll tailor the format, delivery, and examples to your
				workflows—virtual or on-site.
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
	</div>
</section>
