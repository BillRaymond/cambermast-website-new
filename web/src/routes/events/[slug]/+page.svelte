<script lang="ts">
	import { onDestroy } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FaqBlocks from '$lib/components/faq/FaqBlocks.svelte';
	import { renderMarkdownToSafeHtml } from '$lib/utils/markdown';
	import { getEventTypeLabelUi } from '$lib/view-models/events';
	import { getProgramCertificateText } from '$lib/data/training/program-meta';
	import { listTestimonialsForSku } from '$lib/data/testimonials';
	import {
		getEventOccurrenceState,
		getEventSessionBounds,
		normalizeEventSessions
	} from '$lib/data/events/timeline';
	import { toConciseEventTimeLabel } from '$lib/data/events/session-labels';
	import type { PageData } from './$types';

	export let data: PageData;

	const event = data.event;
	const partners = data.partners ?? [];
	const relatedProgram = data.relatedProgram;

	const pacificTimeZone = 'America/Los_Angeles';
	const eventTimeZone = event.timeZoneIana ?? pacificTimeZone;
	const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const normalizedSessions = normalizeEventSessions(event.sessions ?? []);
	const eventBounds = getEventSessionBounds(event);
	const startAtTimestamp = eventBounds?.startTimestamp ?? Number.NaN;
	const endAtTimestamp = eventBounds?.endTimestamp;
	const registrationClosesTimestamp = event.registrationClosesAtUtc
		? new Date(event.registrationClosesAtUtc).valueOf()
		: undefined;
	const occurrenceState = getEventOccurrenceState(event);
	const hasMultipleSessions = normalizedSessions.length > 1;

	const isTimestampValid = Number.isFinite(startAtTimestamp);
	const hasEnded = occurrenceState.hasEnded;
	const isCanceled = event.lifecycleStatus === 'canceled';
	const isCompleted = event.lifecycleStatus === 'completed';
	const isHappeningNow = occurrenceState.isHappeningNow;
	const isTrainingInProgress = event.type === 'training_session' && occurrenceState.isInProgress;
	const isPastEvent = isCanceled || isCompleted || hasEnded;

	const isUpcoming =
		(event.lifecycleStatus === 'scheduled' || event.lifecycleStatus === 'postponed') && !isPastEvent;

	const officialDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: eventTimeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});
	const localDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: localTimeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});
	const compactOfficialDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: eventTimeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});
	const compactLocalDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: localTimeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});

	const getStatusLabel = (registrationStatus: string): string | null => {
		if (registrationStatus === 'closed') return 'Enrollment closed';
		if (registrationStatus === 'waitlist') return 'Waitlist open';
		if (registrationStatus === 'sold_out') return 'Sold out';
		if (registrationStatus === 'none') return 'Enrollment closed';
		if (registrationStatus === 'external') return null;
		return null;
	};

	const getClosedLabel = (): string => {
		if (isPastEvent) return 'This event has ended';
		if (isHappeningNow || isTrainingInProgress) return 'Enrollment closed';
		if (event.registrationStatus === 'none') return 'Enrollment closed';
		if (event.registrationStatus === 'closed') return 'Enrollment closed';
		if (event.registrationStatus === 'sold_out') return 'Enrollment closed';
		return 'Enrollment closed';
	};

	const getLocationModeLabel = (): string => {
		if (event.locationMeta.mode === 'online') return 'Online';
		if (event.locationMeta.mode === 'in_person') return 'In-person';
		if (event.locationMeta.mode === 'hybrid') return 'Hybrid';
		return 'TBD';
	};

	const getLocationDetailsNote = (): string | null => {
		if (event.locationMeta.detailsVisibility === 'post_signup') {
			return 'Location details are sent to registered attendees before the event starts.';
		}
		if (event.locationMeta.detailsVisibility === 'tbd') {
			return 'Location details are to be announced.';
		}
		return null;
	};

	const priceFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	});

	const formatTicketPrice = (): string => {
		const amountUsd = event.ticketing?.amountUsd ?? 0;
		return priceFormatter.format(amountUsd);
	};

	const buildCountdown = (milliseconds: number): string => {
		if (milliseconds <= 0) return 'Starting now';
		const totalSeconds = Math.floor(milliseconds / 1000);
		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor((totalSeconds % 86400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${days}d ${hours}h ${minutes}m ${seconds}s`;
	};

	const isUpcomingScheduledEvent =
		event.lifecycleStatus === 'scheduled' && !isPastEvent && !isHappeningNow;

	const shouldUseRegistrationCountdown =
		isUpcomingScheduledEvent &&
		!occurrenceState.hasStarted &&
		Number.isFinite(registrationClosesTimestamp);
	const countdownTargetTimestamp =
		shouldUseRegistrationCountdown
			? (registrationClosesTimestamp as number)
			: occurrenceState.nextSessionStartTimestamp ?? startAtTimestamp;
	const countdownLabelPrefix =
		shouldUseRegistrationCountdown
			? 'Registration closes in'
			: occurrenceState.hasStarted && !isPastEvent
				? 'Next session starts in'
				: 'Starts in';

	const outcomes = event.outcomes?.length ? event.outcomes : event.highlights ?? [];
	type CurriculumItem = {
		title: string;
		startsAtLabel?: string;
		outcome?: string;
		detailsLines: string[];
	};
	type TrustedByOrg = {
		name: string;
		url: string;
		logoSrc: string;
		logoAlt?: string;
	};

	const trainer = {
		name: 'Bill Raymond',
		title: 'Founder, Cambermast · Lead Instructor',
		photo: '/images/bill.jpg',
		photoAlt: 'Bill Raymond',
		bio: 'Bill helps teams put AI to work quickly and responsibly. His sessions are hands-on, practical, and focused on clear next steps you can use right away.'
	};
	const trustedBy: TrustedByOrg[] = [
		{
			name: 'Microsoft',
			url: 'https://www.microsoft.com/',
			logoSrc: '/images/trusted-by/microsoft.png'
		},
		{ name: 'NASA', url: 'https://www.nasa.gov/', logoSrc: '/images/trusted-by/nasa.png' },
		{
			name: 'DocuSign',
			url: 'https://www.docusign.com/',
			logoSrc: '/images/trusted-by/docusign.png'
		},
		{
			name: 'Duke Energy',
			url: 'https://www.duke-energy.com/',
			logoSrc: '/images/trusted-by/duke-energy.png'
		},
		{ name: 'SLB', url: 'https://www.slb.com/', logoSrc: '/images/trusted-by/slb.png' },
		{ name: 'Moen', url: 'https://www.moen.com/', logoSrc: '/images/trusted-by/moen.png' },
		{
			name: 'Digital.ai',
			url: 'https://digital.ai/',
			logoSrc: '/images/trusted-by/digital-ai.png'
		},
		{
			name: 'Red Hat',
			url: 'https://www.redhat.com/',
			logoSrc: '/images/trusted-by/red-hat.png'
		}
	];

	const sessionDatePillFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: eventTimeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	});
	const agendaItems = event.agenda ?? [];
	const curriculumItems: CurriculumItem[] =
		agendaItems.length > 0
			? agendaItems.map((agendaItem, index) => ({
					title: agendaItem.title,
					startsAtLabel:
						normalizedSessions[index] !== undefined
							? sessionDatePillFormatter.format(normalizedSessions[index].startTimestamp)
							: agendaItem.startsAtLabel,
					outcome: agendaItem.outcome,
					detailsLines: agendaItem.details ? [agendaItem.details] : []
				}))
			: (relatedProgram?.agenda ?? []).map((block, index) => ({
					title: block.title,
					startsAtLabel:
						normalizedSessions[index] !== undefined
							? sessionDatePillFormatter.format(normalizedSessions[index].startTimestamp)
							: undefined,
					detailsLines: block.details ?? []
				}));
	const faqItems = event.faq ?? [];

	let nowTimestamp = Date.now();
	let timer: ReturnType<typeof setInterval> | undefined;
	let countdownLabel = Number.isFinite(countdownTargetTimestamp)
		? buildCountdown(countdownTargetTimestamp - nowTimestamp)
		: 'TBD';

	if (
		typeof window !== 'undefined' &&
		Number.isFinite(countdownTargetTimestamp) &&
		countdownTargetTimestamp > Date.now()
	) {
		timer = setInterval(() => {
			nowTimestamp = Date.now();
			countdownLabel = buildCountdown(countdownTargetTimestamp - nowTimestamp);
		}, 1000);
	}

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	const pageTitle = `${event.title} | Cambermast Events`;
	const pageDescription = event.summary;
	const certificateText = relatedProgram ? getProgramCertificateText(relatedProgram) : undefined;
	const trailerUrl = event.videoUrl ?? relatedProgram?.videoUrl;
	const recordingUrl = event.links?.recordingUrl;
	const slidesUrl = event.links?.slidesUrl;
	const heroImage = event.heroImage ?? event.image;
	const heroImageAlt = event.heroImageAlt ?? event.imageAlt ?? event.title;
	const locationDetailsNote = getLocationDetailsNote();
	const locationModeLabel = getLocationModeLabel();
	const deliveryLabel =
		event.locationMeta.mode === 'online'
			? 'Live · Online'
			: event.locationMeta.mode === 'in_person'
				? 'Live · In-person'
				: event.locationMeta.mode === 'hybrid'
					? 'Live · Hybrid'
					: 'Live';
	const ticketPriceLabel = formatTicketPrice();

	const normalizeMarkdownInput = (value: string): string => {
		if (value.includes('\\n') && !value.includes('\n')) return value.replace(/\\n/g, '\n');
		return value;
	};
	const descriptionMarkdown =
		typeof event.description === 'string'
			? normalizeMarkdownInput(event.description)
			: normalizeMarkdownInput(event.description?.bodyMd ?? event.description?.summary ?? '');
	const descriptionHtml = renderMarkdownToSafeHtml(descriptionMarkdown);

	const statusLabel = isCanceled
		? 'Event canceled'
		: isPastEvent
			? 'Past event'
			: isTrainingInProgress
				? 'Enrollment closed'
				: getStatusLabel(event.registrationStatus);

	const canRegister =
		Boolean(event.cta?.url) &&
		!isPastEvent &&
		!isTrainingInProgress &&
		event.registrationStatus !== 'closed' &&
		event.registrationStatus !== 'none' &&
		event.registrationStatus !== 'sold_out';

	const shouldShowClosedCountdownState =
		isHappeningNow || isTrainingInProgress || !canRegister;
	const countdownPanelLabel = shouldShowClosedCountdownState
		? 'Status'
		: countdownLabelPrefix;
	const countdownPanelValue = shouldShowClosedCountdownState
		? 'Enrollment closed'
		: countdownLabel;

	const isExternalCtaUrl = Boolean(event.cta?.url?.startsWith('http'));
	const eventTimeSummary = toConciseEventTimeLabel(event.time);
	const sectionSpacingClass = canRegister
		? 'pb-28 pt-6 md:pb-32 md:pt-24'
		: 'pb-28 pt-6 md:pb-32 md:pt-6';
	const [multiSessionDateLabel, ...multiSessionSuffixParts] = event.date.split(' · ');
	const fallbackCadenceLabel =
		hasMultipleSessions && multiSessionSuffixParts.length
			? multiSessionSuffixParts.join(' · ').replace(/^Every\s+/i, 'Occurs on ')
			: undefined;
	const firstSession = normalizedSessions[0];
	const sessionWeekdayFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: eventTimeZone,
		weekday: 'long'
	});
	const firstSessionCadenceLabel =
		hasMultipleSessions && firstSession
			? (() => {
					const weekday = sessionWeekdayFormatter.format(firstSession.startTimestamp);
					return weekday;
				})()
			: undefined;
	const multiSessionCadenceLabel = firstSessionCadenceLabel ?? fallbackCadenceLabel;

	const durationDays = event.schedule?.durationDays;
	const sessionCount = normalizedSessions.length;
	const weeklyHours = event.schedule?.estimatedHoursCommitment;
	const millisecondsPerDay = 24 * 60 * 60 * 1000;
	const measuredDurationDays =
		Number.isFinite(startAtTimestamp) && Number.isFinite(endAtTimestamp)
			? Math.max(1, Math.ceil(((endAtTimestamp as number) - startAtTimestamp) / millisecondsPerDay))
			: undefined;
	const curriculumDurationDays = durationDays ?? measuredDurationDays;
	const curriculumSectionTitle =
		curriculumItems.length > 1 && (curriculumDurationDays ?? 0) > 7
			? 'Weekly curriculum'
			: 'Curriculum';

	const computedFormatLine = (() => {
		const parts: string[] = [];
		if (sessionCount > 1) parts.push(`${sessionCount}-session live series`);
		if (sessionCount === 1) parts.push('Single live session');
		parts.push(deliveryLabel);
		if (weeklyHours) {
			parts.push(`${weeklyHours} hours/session`);
		}
		return parts.join(' · ');
	})();
	const formatLine = event.formatLineOverride?.trim() || computedFormatLine;

	const learnBullets = (outcomes ?? []).slice(0, 3).filter(Boolean);
	const audienceBulletsSource =
		event.audienceBullets?.length ? event.audienceBullets : (relatedProgram?.audience ?? []);
	const buildBulletsSource =
		event.buildBullets?.length ? event.buildBullets : (relatedProgram?.takeaways ?? []);
	const audienceBullets = audienceBulletsSource.slice(0, 3).filter(Boolean);
	const buildBullets = buildBulletsSource.slice(0, 3).filter(Boolean);

	const testimonials = (() => {
		const sku = relatedProgram?.sku;
		if (!sku) return [];
		return listTestimonialsForSku(sku)
			.filter((testimonial) => testimonial.allowPublicUse)
			.sort((a, b) => {
				const featured = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
				if (featured !== 0) return featured;
				return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
			})
			.slice(0, 2);
	})();

	const pagePath = `/events/${event.slug}`;

	const trackRegistrationClick = (placement: 'hero' | 'sticky' | 'body') => {
		if (typeof window === 'undefined') return;
		const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
		if (typeof gtag !== 'function') return;
		gtag('event', 'event_registration_click', {
			event_slug: event.slug,
			placement,
			cta_url_is_external: isExternalCtaUrl
		});
	};

</script>

<SeoHead
	title={pageTitle}
	description={pageDescription}
	path={pagePath}
	image={event.image}
	imageAlt={event.imageAlt}
	type="article"
/>

{#if canRegister}
	<div
		class="fixed inset-x-0 top-0 z-40 hidden border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:block"
	>
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-3">
			<div class="min-w-0">
				<a href="/events" class="text-xs font-semibold text-slate-600 hover:text-slate-900">
					&larr; Return to events
				</a>
				<p class="truncate text-sm font-semibold text-slate-900">{event.title} · {ticketPriceLabel}</p>
				{#if Number.isFinite(countdownTargetTimestamp)}
					<p class="mt-0.5 text-xs text-slate-600">{countdownLabelPrefix}: {countdownLabel}</p>
				{/if}
			</div>
			<a
				href={event.cta.url}
				class="inline-flex shrink-0 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
				target={isExternalCtaUrl ? '_blank' : undefined}
				rel={isExternalCtaUrl ? 'noopener noreferrer' : undefined}
				on:click={() => trackRegistrationClick('sticky')}
			>
				{event.cta.label}
			</a>
		</div>
	</div>

	<div
		class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:px-4 md:py-3"
	>
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-3">
			<div class="min-w-0">
				<p class="truncate text-sm font-semibold text-slate-900">{event.title} · {ticketPriceLabel}</p>
				{#if Number.isFinite(countdownTargetTimestamp)}
					<p class="mt-0.5 text-xs text-slate-600">{countdownLabelPrefix}: {countdownLabel}</p>
				{/if}
			</div>
			<a
				href={event.cta.url}
				class="inline-flex shrink-0 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 md:px-5 md:py-2.5"
				target={isExternalCtaUrl ? '_blank' : undefined}
				rel={isExternalCtaUrl ? 'noopener noreferrer' : undefined}
				on:click={() => trackRegistrationClick('sticky')}
			>
				{event.cta.label}
			</a>
		</div>
	</div>
{/if}

<section class={`bg-gradient-to-b from-slate-100 via-white to-white ${sectionSpacingClass}`}>
	<div class="mx-auto max-w-6xl px-3 sm:px-5">
		{#if isUpcoming}
			<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
				<article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:rounded-3xl md:p-8">
					<div class="flex flex-wrap items-center gap-2">
						<span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
							{getEventTypeLabelUi(event)}
						</span>
						{#if statusLabel}
							<span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
								{statusLabel}
							</span>
						{/if}
						{#if certificateText}
							<span
								class="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-slate-700 uppercase"
							>
								Certificate included
							</span>
						{/if}
						{#if trailerUrl}
								<a
									href={trailerUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-slate-700 uppercase transition hover:border-slate-500 hover:text-slate-900"
									aria-label="Watch trailer"
								>
								Trailer <span aria-hidden="true">↗</span>
							</a>
						{/if}
					</div>

					{#if heroImage}
						<img
							src={heroImage}
							alt={heroImageAlt}
							class="mt-5 h-56 w-full rounded-2xl border border-slate-200 object-cover md:h-72"
							loading="lazy"
						/>
					{/if}

					<h1 class="mb-6 mt-6 text-3xl font-bold text-slate-900 md:text-4xl">{event.title}</h1>
					{#if event.subtitle}
						<p class="mt-2 text-sm font-semibold tracking-wide text-slate-600 uppercase">{event.subtitle}</p>
					{/if}
					{#if formatLine}
						<p class="mt-3 text-sm font-semibold text-slate-700">{formatLine}</p>
					{/if}
					<p class="mt-4 max-w-3xl text-base text-slate-700 md:text-lg">{event.summary}</p>

					<div class="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
						<div class="grid gap-3 md:grid-cols-3">
							<div class="rounded-xl border border-slate-200 bg-white p-3">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">When</p>
								{#if hasMultipleSessions}
									<p class="mt-1 font-semibold text-slate-900">Runs {multiSessionDateLabel}</p>
									{#if multiSessionCadenceLabel}
										<p class="mt-1 text-slate-700">{multiSessionCadenceLabel}</p>
									{/if}
									{#if eventTimeSummary}
										<p class="mt-1 text-slate-700">{eventTimeSummary}</p>
									{/if}
								{:else}
									<p class="mt-1 font-semibold text-slate-900">
										{isTimestampValid ? officialDateTimeFormatter.format(startAtTimestamp) : 'TBD'}
									</p>
									{#if Number.isFinite(endAtTimestamp) && endAtTimestamp !== startAtTimestamp}
										<p class="mt-1 text-slate-600">
											Ends {officialDateTimeFormatter.format(endAtTimestamp as number)}
										</p>
									{/if}
									<p class="mt-2 text-slate-600">
										Local: {isTimestampValid ? localDateTimeFormatter.format(startAtTimestamp) : 'TBD'}
									</p>
									{#if Number.isFinite(endAtTimestamp) && endAtTimestamp !== startAtTimestamp}
										<p class="mt-1 text-slate-600">
											Ends {localDateTimeFormatter.format(endAtTimestamp as number)}
										</p>
									{/if}
								{/if}
							</div>
							<div class="rounded-xl border border-slate-200 bg-white p-3">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Commitment</p>
								<p class="mt-1 font-semibold text-slate-900">
									{sessionCount > 1
										? `${sessionCount} sessions`
										: durationDays
											? `${durationDays} day`
											: 'Single session'}
									{#if weeklyHours}
										· {weeklyHours} hours/session
									{/if}
								</p>
								{#if hasMultipleSessions && multiSessionCadenceLabel}
									<p class="mt-1 text-slate-600">{multiSessionCadenceLabel}</p>
								{/if}
							</div>
							<div class="rounded-xl border border-slate-200 bg-white p-3">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Where</p>
								<p class="mt-1 font-semibold text-slate-900">{deliveryLabel}</p>
								{#if locationDetailsNote}
									<p class="mt-1 text-slate-600">{locationDetailsNote}</p>
								{/if}
								<p class="mt-2 text-slate-700">
									<span class="font-semibold text-slate-900">Tickets:</span>
									{ticketPriceLabel} USD
								</p>
							</div>
						</div>
					</div>

					<div class="mt-6">
						{#if canRegister}
							<div class="flex flex-wrap items-center gap-3">
								<a
									href={event.cta.url}
									class="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
									target={isExternalCtaUrl ? '_blank' : undefined}
									rel={isExternalCtaUrl ? 'noopener noreferrer' : undefined}
									on:click={() => trackRegistrationClick('hero')}
								>
									{event.cta.label}
								</a>
							</div>
						{:else}
							<div class="flex flex-wrap items-center gap-3">
								<span
									class="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600"
								>
									{getClosedLabel()}
								</span>
								<a
									href="/events"
									class="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
								>
									View event calendar
								</a>
							</div>
						{/if}
					</div>

					<div class="mt-8 border-t border-slate-200 pt-6">
						<h2 class="text-xl font-semibold text-slate-900">At-a-glance</h2>
						<div class="mt-4 grid gap-4 md:grid-cols-3">
							<article class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">What you’ll learn</p>
								{#if learnBullets.length}
									<div class="mt-3 divide-y divide-slate-200 text-sm text-slate-700">
										{#each learnBullets as bullet}
											<p class="py-2">{bullet}</p>
										{/each}
									</div>
								{:else}
									<p class="mt-3 text-sm text-slate-600">See details below.</p>
								{/if}
							</article>

							<article class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Who it’s for</p>
								{#if audienceBullets.length}
									<div class="mt-3 divide-y divide-slate-200 text-sm text-slate-700">
										{#each audienceBullets as bullet}
											<p class="py-2">{bullet}</p>
										{/each}
									</div>
								{:else}
									<p class="mt-3 text-sm text-slate-600">See details below.</p>
								{/if}
							</article>

							<article class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">What you’ll build</p>
								{#if buildBullets.length}
									<div class="mt-3 divide-y divide-slate-200 text-sm text-slate-700">
										{#each buildBullets as bullet}
											<p class="py-2">{bullet}</p>
										{/each}
									</div>
								{:else}
									<p class="mt-3 text-sm text-slate-600">See details below.</p>
								{/if}
							</article>
						</div>
					</div>
					{#if canRegister}
						<div class="mt-6 flex flex-wrap items-center gap-3">
							<a
								href={event.cta.url}
								class="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
								target={isExternalCtaUrl ? '_blank' : undefined}
								rel={isExternalCtaUrl ? 'noopener noreferrer' : undefined}
								on:click={() => trackRegistrationClick('body')}
							>
								{event.cta.label}
							</a>
						</div>
					{/if}

					<div class="mt-8 border-t border-slate-200 pt-6">
						<h2 class="text-xl font-semibold text-slate-900">About your trainer</h2>
						<article class="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 md:p-6">
							<div class="flex flex-col gap-5 sm:flex-row sm:items-start">
								<img
									src={trainer.photo}
									alt={trainer.photoAlt}
									class="h-24 w-24 shrink-0 rounded-2xl border border-slate-200 object-cover"
									loading="lazy"
								/>
								<div>
									<h3 class="text-lg font-semibold text-slate-900">{trainer.name}</h3>
									<p class="text-sm font-semibold text-slate-600">{trainer.title}</p>
									<p class="mt-3 max-w-3xl text-sm text-slate-700">{trainer.bio}</p>
								</div>
							</div>
						</article>
					</div>

					<div class="mt-8 border-t border-slate-200 pt-6">
						<h2 class="text-xl font-semibold text-slate-900">Trusted by</h2>
						<div class="mt-3 grid grid-cols-4 gap-x-4 gap-y-2">
							{#each trustedBy as organization}
								<a
									href={organization.url}
									target="_blank"
									rel="noopener noreferrer"
									class="flex h-10 items-center justify-center px-1"
									aria-label={`Visit ${organization.name}`}
								>
									<img
										src={organization.logoSrc}
										alt={organization.logoAlt ?? `${organization.name} logo`}
										class="max-h-6 w-auto object-contain opacity-80 transition hover:opacity-100"
										loading="lazy"
									/>
								</a>
							{/each}
						</div>
					</div>

						{#if curriculumItems.length}
							<div id="curriculum" class="mt-8 border-t border-slate-200 pt-6 scroll-mt-24">
								<div class="flex flex-wrap items-center gap-2">
									<h2 class="text-xl font-semibold text-slate-900">{curriculumSectionTitle}</h2>
									{#if certificateText}
										<span
											class="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-slate-700 uppercase"
										>
											Certificate included
										</span>
									{/if}
								</div>
								<ul class="mt-4 space-y-3">
								{#each curriculumItems as curriculumItem}
									<li class="rounded-xl border border-slate-200 bg-slate-50 p-4">
										<div class="flex flex-wrap items-center gap-2">
											{#if curriculumItem.startsAtLabel}
												<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
													{curriculumItem.startsAtLabel}
												</span>
											{/if}
											<p class="text-sm font-semibold text-slate-900">{curriculumItem.title}</p>
										</div>
										{#if curriculumItem.outcome}
											<p class="mt-1 text-sm text-slate-700">{curriculumItem.outcome}</p>
										{/if}
										{#each curriculumItem.detailsLines as detailLine}
											<p class="mt-1 text-sm text-slate-600">{detailLine}</p>
										{/each}
									</li>
								{/each}
							</ul>
						</div>
						{#if canRegister}
							<div class="mt-6 flex flex-wrap items-center gap-3">
								<a
									href={event.cta.url}
									class="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
									target={isExternalCtaUrl ? '_blank' : undefined}
									rel={isExternalCtaUrl ? 'noopener noreferrer' : undefined}
									on:click={() => trackRegistrationClick('body')}
								>
									{event.cta.label}
								</a>
							</div>
						{/if}
					{/if}

					{#if testimonials.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">What attendees say</h2>
							<div class="mt-4 grid gap-4 md:grid-cols-2">
								{#each testimonials as testimonial}
									<figure class="rounded-2xl border border-slate-200 bg-white p-5">
										<blockquote class="text-sm text-slate-700">“{testimonial.quote}”</blockquote>
										<figcaption class="mt-4 text-xs text-slate-600">
											<span class="font-semibold text-slate-900">{testimonial.displayName}</span>
											{#if testimonial.jobTitle}
												· {testimonial.jobTitle}
											{/if}
											{#if testimonial.company}
												· {testimonial.company}
											{/if}
										</figcaption>
									</figure>
								{/each}
							</div>
						</div>
					{/if}

					{#if faqItems.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">FAQ</h2>
							<div class="mt-4 space-y-3">
								{#each faqItems as faqItem}
									<details class="rounded-xl border border-slate-200 bg-white p-4">
										<summary class="cursor-pointer text-sm font-semibold text-slate-900">
											{faqItem.question}
										</summary>
										<div class="mt-2">
											<FaqBlocks blocks={faqItem.blocks} />
										</div>
									</details>
								{/each}
							</div>
						</div>
						{#if canRegister}
							<div class="mt-6 flex flex-wrap items-center gap-3">
								<a
									href={event.cta.url}
									class="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
									target={isExternalCtaUrl ? '_blank' : undefined}
									rel={isExternalCtaUrl ? 'noopener noreferrer' : undefined}
									on:click={() => trackRegistrationClick('body')}
								>
									{event.cta.label}
								</a>
							</div>
						{/if}
					{/if}

					{#if descriptionHtml}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">More details</h2>
							{#if certificateText}
								<p class="mt-2 text-sm font-semibold text-slate-700">
									This event provides a certificate of completion.
								</p>
							{/if}
							<div
								class="mt-3 max-w-none text-slate-700 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1"
							>
								{@html descriptionHtml}
							</div>
						</div>
					{/if}

					{#if partners.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">Partners</h2>
							<ul class="mt-4 grid gap-3 sm:grid-cols-2">
								{#each partners as partner}
									<li class="rounded-xl border border-slate-200 bg-slate-50 p-4">
										<p class="text-sm font-semibold text-slate-900">{partner.name}</p>
										{#if partner.role}
											<p class="mt-1 text-xs text-slate-600">{partner.role}</p>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</article>

				<aside class="hidden lg:block">
					<div class="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<a
							href="/"
							class="mb-4 inline-flex w-full items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white px-3 py-2 shadow-sm transition hover:border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
						>
							<img
								src="/images/bill.jpg"
								alt="Bill Raymond"
								class="h-11 w-11 rounded-2xl border border-gray-200 object-cover"
								loading="lazy"
							/>
							<img
								src="/images/cambermast-logo-full.png"
								alt="Cambermast logo"
								style="width:170px;min-width:170px;height:auto;"
							/>
						</a>
						<p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Live cohort training</p>
						<p class="mt-2 text-2xl font-semibold text-slate-900">{ticketPriceLabel} USD</p>
						<p class="mt-1 text-sm text-slate-600">
							{deliveryLabel}
							{#if certificateText}
								· Certificate
							{/if}
						</p>

						<div class="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
							{#if hasMultipleSessions}
								<p class="font-semibold text-slate-900">Runs {multiSessionDateLabel}</p>
								{#if multiSessionCadenceLabel}
									<p class="-mt-1 text-slate-700">{multiSessionCadenceLabel}</p>
								{/if}
								{#if eventTimeSummary}
									<p class="-mt-1 text-slate-700">{eventTimeSummary}</p>
								{/if}
							{:else}
								<div>
									<p class="font-semibold text-slate-900">Official time (Pacific Time)</p>
									{#if isTimestampValid}
										<p class="text-slate-700">{compactOfficialDateTimeFormatter.format(startAtTimestamp)}</p>
										{#if Number.isFinite(endAtTimestamp) && endAtTimestamp !== startAtTimestamp}
											<p class="mt-1 text-slate-600">
												Ends {compactOfficialDateTimeFormatter.format(endAtTimestamp as number)}
											</p>
										{/if}
									{:else}
										<p class="text-slate-700">TBD</p>
									{/if}
								</div>
								<div>
									<p class="font-semibold text-slate-900">Local time (based on your browser)</p>
									{#if isTimestampValid}
										<p class="text-slate-700">{compactLocalDateTimeFormatter.format(startAtTimestamp)}</p>
										{#if Number.isFinite(endAtTimestamp) && endAtTimestamp !== startAtTimestamp}
											<p class="mt-1 text-slate-600">
												Ends {compactLocalDateTimeFormatter.format(endAtTimestamp as number)}
											</p>
										{/if}
									{:else}
										<p class="text-slate-700">TBD</p>
									{/if}
								</div>
							{/if}
						</div>

							<div
								class={`mt-4 rounded-xl px-3 py-2 ${
									shouldShowClosedCountdownState
										? 'border border-amber-200 bg-amber-50'
										: 'border border-blue-200 bg-blue-50'
								}`}
							>
								<p
									class={`text-xs font-semibold tracking-[0.2em] uppercase ${
										shouldShowClosedCountdownState ? 'text-amber-700' : 'text-blue-700'
									}`}
								>
									{countdownPanelLabel}
								</p>
								<p class="mt-1 text-lg font-semibold text-slate-900">{countdownPanelValue}</p>
							</div>
							{#if canRegister}
								<a
									href={event.cta.url}
									class="mt-3 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
								target={isExternalCtaUrl ? '_blank' : undefined}
								rel={isExternalCtaUrl ? 'noopener noreferrer' : undefined}
								on:click={() => trackRegistrationClick('sticky')}
								>
									{event.cta.label}
								</a>
							{:else}
								<a
									href="/events"
									class="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
								>
									View event calendar
								</a>
							{/if}

						{#if locationDetailsNote}
							<p class="mt-4 text-sm text-slate-600">{locationDetailsNote}</p>
						{/if}
					</div>
				</aside>
			</div>
		{:else}
			<article class="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 md:rounded-3xl md:p-8">
				<div class="flex flex-wrap items-center gap-2">
					<span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
						{getEventTypeLabelUi(event)}
					</span>
					{#if statusLabel}
						<span class="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
							{statusLabel}
						</span>
					{/if}
				</div>

				{#if heroImage}
					<img
						src={heroImage}
						alt={heroImageAlt}
						class="mt-5 h-56 w-full rounded-2xl border border-slate-200 object-cover md:h-72"
						loading="lazy"
					/>
				{/if}

				<h1 class="mb-6 mt-6 text-3xl font-bold text-slate-900 md:text-4xl">{event.title}</h1>
				{#if event.subtitle}
					<p class="mt-2 text-sm font-semibold tracking-wide text-slate-600 uppercase">{event.subtitle}</p>
				{/if}
				<p class="mt-4 text-base text-slate-700 md:text-lg">{event.summary}</p>

				{#if isPastEvent}
					<div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
						<p class="text-sm font-semibold text-amber-900">
							{#if isCanceled}
								Sorry, this event was canceled. If you had already registered, please check your email for more details.
							{:else}
								Sorry, this event already occurred. A new event may already be available.
							{/if}
						</p>
						<a
							href="/events"
							class="mt-2 inline-flex text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
						>
							View current events calendar →
						</a>
					</div>
				{/if}

				<div class="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
					<p>
						<span class="font-semibold text-slate-900">Official time (Pacific Time):</span>
						{isTimestampValid ? officialDateTimeFormatter.format(startAtTimestamp) : 'TBD'}
					</p>
					<p>
						<span class="font-semibold text-slate-900">Your local time:</span>
						{isTimestampValid ? localDateTimeFormatter.format(startAtTimestamp) : 'TBD'}
					</p>
					<p>
						<span class="font-semibold text-slate-900">Location:</span>
						{deliveryLabel}
					</p>
					<p>
						<span class="font-semibold text-slate-900">Tickets:</span>
						{ticketPriceLabel} USD
					</p>
					{#if locationDetailsNote}
						<p class="text-slate-600">{locationDetailsNote}</p>
					{/if}
				</div>

				{#if descriptionHtml}
					<div class="mt-8 border-t border-slate-200 pt-6">
						<h2 class="text-xl font-semibold text-slate-900">About this event</h2>
						<div
							class="mt-3 max-w-none text-slate-700 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1"
						>
							{@html descriptionHtml}
						</div>
					</div>
				{/if}

				{#if recordingUrl || slidesUrl}
					<div class="mt-8 border-t border-slate-200 pt-6">
						<h2 class="text-xl font-semibold text-slate-900">Recap</h2>
						<div class="mt-3 flex flex-wrap gap-3 text-sm">
							{#if recordingUrl}
								<a
									href={recordingUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
								>
									Watch recording ↗
								</a>
							{/if}
							{#if slidesUrl}
								<a
									href={slidesUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
								>
									View slides ↗
								</a>
							{/if}
						</div>
					</div>
				{/if}
			</article>
		{/if}
	</div>
</section>
