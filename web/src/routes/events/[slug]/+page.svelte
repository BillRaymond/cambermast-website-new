<script lang="ts">
	import { onDestroy } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { renderMarkdownToSafeHtml } from '$lib/utils/markdown';
	import { getEventTypeLabelUi } from '$lib/view-models/events';
	import { getProgramCertificateText } from '$lib/data/training/program-meta';
	import type { PageData } from './$types';

	export let data: PageData;

	const event = data.event;
	const partners = data.partners ?? [];
	const relatedProgram = data.relatedProgram;
	const pacificTimeZone = 'America/Los_Angeles';
	const eventTimeZone = event.timeZoneIana ?? pacificTimeZone;
	const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const startAtTimestamp = new Date(event.startAtUtc).valueOf();
	const endAtTimestamp = event.endAtUtc ? new Date(event.endAtUtc).valueOf() : undefined;
	const registrationClosesTimestamp = event.registrationClosesAtUtc
		? new Date(event.registrationClosesAtUtc).valueOf()
		: undefined;

	const isTimestampValid = Number.isFinite(startAtTimestamp);
	const hasEnded = Number.isFinite(endAtTimestamp)
		? (endAtTimestamp as number) < Date.now()
		: false;
	const isCanceled = event.lifecycleStatus === 'canceled';
	const isCompleted = event.lifecycleStatus === 'completed';
	const isHappeningNow =
		Number.isFinite(startAtTimestamp) &&
		Number.isFinite(endAtTimestamp) &&
		startAtTimestamp <= Date.now() &&
		(endAtTimestamp as number) >= Date.now();
	const isTrainingHappeningNow = event.type === 'training_session' && isHappeningNow;
	const isPastEvent = isCanceled || isCompleted || hasEnded;
	const isUpcomingScheduledEvent =
		event.lifecycleStatus === 'scheduled' && !isPastEvent && !isHappeningNow;

	const officialDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: eventTimeZone,
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});

	const localDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: localTimeZone,
		weekday: 'long',
		month: 'long',
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
	const compactOfficialDateFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: eventTimeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const compactLocalDateFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: localTimeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const compactOfficialTimeFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: eventTimeZone,
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});
	const compactLocalTimeFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: localTimeZone,
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});

	const getStatusLabel = (registrationStatus: string): string | null => {
		if (registrationStatus === 'closed') return 'Enrollment closed';
		if (registrationStatus === 'waitlist') return 'Waitlist open';
		if (registrationStatus === 'sold_out') return 'Sold out';
		if (registrationStatus === 'none') return 'Enrollment closed';
		return null;
	};

	const getClosedLabel = (): string => {
		if (isPastEvent) return 'This event has ended';
		if (event.registrationStatus === 'none') return 'Enrollment closed';
		return event.cta?.label ?? 'Enrollment closed';
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

	const countdownTargetTimestamp =
		isUpcomingScheduledEvent && Number.isFinite(registrationClosesTimestamp)
			? (registrationClosesTimestamp as number)
			: startAtTimestamp;
	const countdownLabelPrefix =
		isUpcomingScheduledEvent && Number.isFinite(registrationClosesTimestamp)
			? 'Registration closes in'
			: 'Starts in';
	const outcomes = event.outcomes?.length ? event.outcomes : (event.highlights ?? []);
	const agendaItems = event.agenda ?? [];
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
	const trailerUrl = relatedProgram?.videoUrl;
	const recordingUrl = event.links?.recordingUrl;
	const slidesUrl = event.links?.slidesUrl;
	const heroImage = event.heroImage ?? event.image;
	const heroImageAlt = event.heroImageAlt ?? event.imageAlt ?? event.title;
	const locationDetailsNote = getLocationDetailsNote();
	const locationModeLabel = getLocationModeLabel();
	const ticketPriceLabel = formatTicketPrice();
	const approvalRequired = event.registrationSettings?.approvalRequired ?? false;
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
			: isTrainingHappeningNow
				? 'Enrollment closed'
				: getStatusLabel(event.registrationStatus);
	const canRegister =
		Boolean(event.cta?.url) &&
		!isPastEvent &&
		!isTrainingHappeningNow &&
		event.registrationStatus !== 'closed' &&
		event.registrationStatus !== 'none';
	const isEventPlaygroundLanding = event.slug === 'event-playground';
	const descriptionSummary =
		typeof event.description === 'string' ? undefined : event.description?.summary;
	const leadSpeaker = event.speakers?.[0];
	const leadSpeakerPhoto =
		leadSpeaker?.photo ?? (leadSpeaker?.name === 'Bill Raymond' ? '/images/bill.jpg' : undefined);
	const leadSpeakerPhotoAlt = leadSpeaker?.photoAlt ?? leadSpeaker?.name ?? 'Instructor photo';
	const removeMasterWording = (value: string): string =>
		value.replace(/^master\b/i, 'Learn').replace(/\bmaster\b/gi, 'learn');
	const officialScheduleLabel = isTimestampValid
		? compactOfficialDateTimeFormatter.format(startAtTimestamp)
		: 'TBD';
	const weeklyCommitmentLabel = (() => {
		const durationDays = event.schedule?.durationDays;
		const estimatedHours = event.schedule?.estimatedHoursCommitment;
		if (!durationDays || durationDays < 1) return undefined;
		const weeks = durationDays % 7 === 0 ? durationDays / 7 : undefined;
		const courseWindowLabel = weeks ? `${weeks}-week course` : `${durationDays}-day course`;
		if (!estimatedHours || estimatedHours <= 0) return courseWindowLabel;
		const hourLabel = estimatedHours === 1 ? 'hour' : 'hours';
		if (weeks) {
			return `${weeks}-weeks, one day weekly, ${estimatedHours} ${hourLabel}`;
		}
		return `${courseWindowLabel} · ${estimatedHours} ${hourLabel} minimum, one day each week`;
	})();
	const trustClientLogos = [
		{ name: 'Microsoft', logoSrc: '/images/trusted-by/microsoft.png' },
		{ name: 'Duke Energy', logoSrc: '/images/trusted-by/duke-energy.png' },
		{ name: 'Red Hat', logoSrc: '/images/trusted-by/red-hat.png' },
		{ name: 'Moen', logoSrc: '/images/trusted-by/moen.png' },
		{ name: 'DocuSign', logoSrc: '/images/trusted-by/docusign.png' },
		{ name: 'NASA', logoSrc: '/images/trusted-by/nasa.png' }
	];
	const durationDays = event.schedule?.durationDays;
	const durationWeeks =
		durationDays && durationDays > 0 && durationDays % 7 === 0 ? durationDays / 7 : undefined;
	const weeklyHours = event.schedule?.estimatedHoursCommitment;
	const moduleCount = agendaItems.length;
	const valueNumberCards = [
		{
			value: durationWeeks ? `${durationWeeks}` : undefined,
			title: durationWeeks === 1 ? 'Week of live instruction' : 'Weeks of live instruction',
			description:
				'Move through a focused weekly cadence so you can apply each session directly to real work.'
		},
		{
			value: weeklyHours ? `${weeklyHours}` : undefined,
			title: 'Hours each week',
			description:
				'The weekly time commitment is intentionally practical so your team can learn without disrupting delivery.'
		},
		{
			value: moduleCount > 0 ? `${moduleCount}` : undefined,
			title: moduleCount === 1 ? 'Guided module' : 'Guided modules',
			description:
				'Each module builds on the previous one, from foundations to applied implementation.'
		}
	].filter((card): card is { value: string; title: string; description: string } => Boolean(card.value));
	const eventPath = `/events/${event.slug}`;
</script>

<SeoHead
	title={pageTitle}
	description={pageDescription}
	path={eventPath}
	image={event.image}
	imageAlt={event.imageAlt}
	type="article"
/>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0;1"
	/>
</svelte:head>

<section
	class={`bg-gradient-to-b from-slate-100 via-white to-white pb-24 ${
		isEventPlaygroundLanding ? 'pt-4 md:pt-6' : 'pt-12 md:pt-16'
	}`}
>
	<div class="mx-auto max-w-6xl px-5">
		{#if !isEventPlaygroundLanding}
			<div class="mb-8">
				<a
					href="/events"
					class="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900"
				>
					&larr; Back to events
				</a>
			</div>
		{/if}

		{#if isEventPlaygroundLanding}
			<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
				<article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
					{#if heroImage}
						<img
							src={heroImage}
							alt={heroImageAlt}
							class="h-56 w-full rounded-2xl border border-slate-200 object-cover md:h-72"
							loading="lazy"
						/>
					{/if}

					<h1 class="mb-6 mt-6 text-3xl font-bold text-slate-900 md:text-4xl">{event.title}</h1>
					{#if event.subtitle}
						<p class="mt-2 text-sm font-semibold tracking-wide text-slate-600 uppercase">{event.subtitle}</p>
					{/if}
					<p class="mt-4 max-w-3xl text-base text-slate-700 md:text-lg">{event.summary}</p>
					{#if descriptionSummary}
						<p class="mt-3 max-w-3xl text-slate-600">{descriptionSummary}</p>
					{/if}
					{#if leadSpeaker}
						<div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<h2 class="text-xl font-semibold text-slate-900">Meet your trainer</h2>
							<div class="mt-3 flex items-start gap-3">
								{#if leadSpeakerPhoto}
									<img
										src={leadSpeakerPhoto}
										alt={leadSpeakerPhotoAlt}
										class="h-14 w-14 rounded-full object-cover"
										loading="lazy"
									/>
								{/if}
								<div>
									<p class="text-base font-semibold text-slate-900">{leadSpeaker.name}</p>
									<p class="text-xs font-semibold tracking-wide text-slate-600 uppercase">{leadSpeaker.title}</p>
									{#if leadSpeaker.shortBio}
										<p class="mt-2 text-sm text-slate-700">{leadSpeaker.shortBio}</p>
									{/if}
								</div>
							</div>
						</div>
					{/if}
					<div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Why attendees choose this live event</p>
						<div class="mt-3 grid gap-3 md:grid-cols-3">
							<div class="rounded-xl border border-slate-200 bg-white p-3">
								<div class="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
									<span class="material-symbols-outlined !text-base leading-none">groups</span>
								</div>
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Learn together with your cohort</p>
								<p class="mt-1 text-sm font-semibold text-slate-900">Build momentum each week with shared practice and feedback</p>
							</div>
							<div class="rounded-xl border border-slate-200 bg-white p-3">
								<div class="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
									<span class="material-symbols-outlined !text-base leading-none">workspace_premium</span>
								</div>
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">What you earn</p>
								<p class="mt-1 text-sm font-semibold text-slate-900">
									{certificateText ? 'Certificate included' : 'Practical completion outcomes'}
								</p>
							</div>
							<div class="rounded-xl border border-slate-200 bg-white p-3">
								<div class="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
									<span class="material-symbols-outlined !text-base leading-none">school</span>
								</div>
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">How you will learn</p>
								<p class="mt-1 text-sm font-semibold text-slate-900">Live event with direct instructor guidance</p>
							</div>
						</div>
						<div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
							{#each trustClientLogos as logo}
								<div class="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-white px-3">
									<img
										src={logo.logoSrc}
										alt={`${logo.name} logo`}
										class="max-h-8 w-auto object-contain"
										loading="lazy"
									/>
								</div>
							{/each}
						</div>
					</div>

					<div class="mt-6 flex flex-wrap items-center gap-3">
						{#if canRegister}
							<a
								href={event.cta.url}
								class="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
								target={event.cta.url?.startsWith('http') ? '_blank' : undefined}
								rel={event.cta.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
							>
								{event.cta.label}
							</a>
						{:else}
							<span
								class="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600"
							>
								{getClosedLabel()}
							</span>
						{/if}
					</div>

					<div class="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
						<p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Schedule and commitment</p>
						<p class="mt-2">
							<span class="font-semibold text-slate-900">Commitment:</span>
							{weeklyCommitmentLabel ?? 'Weekly cohort format'}
						</p>
						<p class="mt-2">
							<span class="font-semibold text-slate-900">Location:</span>
							{locationModeLabel} · {event.location}
						</p>
						{#if Number.isFinite(registrationClosesTimestamp)}
							<p class="mt-2">
								<span class="font-semibold text-slate-900">Registration closes:</span>
								{compactOfficialDateTimeFormatter.format(registrationClosesTimestamp as number)}
							</p>
						{/if}
					</div>
					{#if valueNumberCards.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">Why this event is worth your time</h2>
							<div class="mt-4 grid gap-4 md:grid-cols-3">
								{#each valueNumberCards as card}
									<article class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
										<p class="text-4xl font-bold text-blue-700 md:text-5xl">{card.value}</p>
										<p class="mt-2 text-lg font-semibold text-slate-900">{card.title}</p>
										<p class="mt-2 text-sm text-slate-700">{card.description}</p>
									</article>
								{/each}
							</div>
						</div>
					{/if}

					{#if outcomes.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">What you will be able to do</h2>
							<div class="mt-4 grid gap-3 md:grid-cols-2">
								{#each outcomes as outcome}
									<div class="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
										{removeMasterWording(outcome)}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if agendaItems.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">What happens each week</h2>
							<ul class="mt-4 space-y-3">
								{#each agendaItems as agendaItem}
									<li class="rounded-xl border border-slate-200 bg-slate-50 p-4">
										<div class="flex flex-wrap items-center gap-2">
											<p class="text-sm font-semibold text-slate-900">{agendaItem.title}</p>
											{#if agendaItem.startsAtLabel}
												<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
													{agendaItem.startsAtLabel}
												</span>
											{/if}
										</div>
										{#if agendaItem.outcome}
											<p class="mt-1 text-sm text-slate-700">{agendaItem.outcome}</p>
										{/if}
										{#if agendaItem.details}
											<p class="mt-1 text-sm text-slate-600">{agendaItem.details}</p>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}


					{#if descriptionHtml}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">What to expect</h2>
							<div class="prose prose-slate mt-3 max-w-none text-slate-700">
								{@html descriptionHtml}
							</div>
						</div>
					{/if}

					{#if faqItems.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">Questions answered</h2>
							<ul class="mt-4 space-y-3">
								{#each faqItems as faqItem}
									<li class="rounded-xl border border-slate-200 bg-white p-4">
										<p class="text-sm font-semibold text-slate-900">{faqItem.question}</p>
										<p class="mt-1 text-sm text-slate-700">{faqItem.answer}</p>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
						<h2 class="text-xl font-semibold text-slate-900">Ready to join this live event?</h2>
						<p class="mt-2 text-slate-700">
							Reserve your spot and apply these practices directly to your real workflows.
						</p>
						<div class="mt-4 flex flex-wrap gap-3">
							{#if canRegister}
								<a
									href={event.cta.url}
									class="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
									target={event.cta.url?.startsWith('http') ? '_blank' : undefined}
									rel={event.cta.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
								>
									{event.cta.label}
								</a>
							{/if}
						</div>
					</div>
				</article>

				<aside class="hidden lg:block">
					<div class="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Join this cohort</p>
						<p class="mt-2 text-2xl font-semibold text-slate-900">{ticketPriceLabel} USD</p>
						<p class="mt-1 text-sm text-slate-600">{locationModeLabel} · {event.location}</p>
						<div class="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
							<div>
								<p class="font-semibold text-slate-900">Official</p>
								{#if isTimestampValid}
									<p class="text-slate-700">{compactOfficialDateFormatter.format(startAtTimestamp)}</p>
									<p class="text-slate-700">{compactOfficialTimeFormatter.format(startAtTimestamp)}</p>
								{:else}
									<p class="text-slate-700">TBD</p>
								{/if}
							</div>
							<div>
								<p class="font-semibold text-slate-900">Local</p>
								{#if isTimestampValid}
									<p class="text-slate-700">{compactLocalDateFormatter.format(startAtTimestamp)}</p>
									<p class="text-slate-700">{compactLocalTimeFormatter.format(startAtTimestamp)}</p>
								{:else}
									<p class="text-slate-700">TBD</p>
								{/if}
							</div>
						</div>
						<div class="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
							<p class="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase">{countdownLabelPrefix}</p>
							<p class="mt-1 text-lg font-semibold text-slate-900">{countdownLabel}</p>
						</div>
						{#if canRegister}
							<a
								href={event.cta.url}
								class="mt-4 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
								target={event.cta.url?.startsWith('http') ? '_blank' : undefined}
								rel={event.cta.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
							>
								{event.cta.label}
							</a>
							<div class="mt-3 flex flex-wrap gap-2">
								<span
									class="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
								>
									Live training
								</span>
								{#if certificateText}
									<span
										class="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
									>
										Certificate included
									</span>
								{/if}
								<span
									class="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
								>
									Cohort-based learning
								</span>
							</div>
						{:else}
							<p class="mt-4 rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-600">
								{getClosedLabel()}
							</p>
						{/if}
						<div class="mt-4 space-y-1.5 border-t border-slate-200 pt-3 text-sm text-slate-700">
							{#if locationDetailsNote}
								<p class="text-slate-600">{locationDetailsNote}</p>
							{/if}
						</div>
					</div>
				</aside>
			</div>
		{:else if isUpcomingScheduledEvent}
			<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
				<article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
					<div class="flex flex-wrap items-center gap-2">
						<span
							class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
						>
							{getEventTypeLabelUi(event)}
						</span>
						{#if statusLabel}
							<span
								class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
							>
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
					<p class="max-w-3xl text-gray-700 md:text-lg">{event.summary}</p>

					{#if outcomes.length}
						<div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">What you get</p>
							<ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
								{#each outcomes as outcome}
									<li>{outcome}</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
							<p class="font-semibold text-slate-900">Official time ({eventTimeZone})</p>
							<p class="mt-1">{isTimestampValid ? officialDateTimeFormatter.format(startAtTimestamp) : 'TBD'}</p>
						</div>
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
							<p class="font-semibold text-slate-900">Your local time</p>
							<p class="mt-1">{isTimestampValid ? localDateTimeFormatter.format(startAtTimestamp) : 'TBD'}</p>
						</div>
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
							<p class="font-semibold text-slate-900">Location mode</p>
							<p class="mt-1">{locationModeLabel}</p>
						</div>
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
							<p class="font-semibold text-slate-900">Location</p>
							<p class="mt-1">{event.location}</p>
						</div>
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
							<p class="font-semibold text-slate-900">Tickets</p>
							<p class="mt-1">{ticketPriceLabel} USD</p>
						</div>
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
							<p class="font-semibold text-slate-900">Approval required</p>
							<p class="mt-1">{approvalRequired ? 'Yes' : 'No'}</p>
						</div>
					</div>

					{#if locationDetailsNote}
						<p class="mt-3 text-sm text-slate-600">{locationDetailsNote}</p>
					{/if}

					<div class="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
						<p class="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase">{countdownLabelPrefix}</p>
						<p class="mt-1 text-2xl font-semibold text-slate-900">{countdownLabel}</p>
						{#if Number.isFinite(registrationClosesTimestamp)}
							<p class="mt-1 text-sm text-blue-900">
								Registration closes {officialDateTimeFormatter.format(registrationClosesTimestamp as number)}
							</p>
						{/if}
					</div>

					<div class="mt-7 flex flex-wrap items-center gap-3">
						{#if canRegister}
							<a
								href={event.cta.url}
								class="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
								target={event.cta.url?.startsWith('http') ? '_blank' : undefined}
								rel={event.cta.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
							>
								{event.cta.label}
							</a>
						{:else}
							<span
								class="inline-flex rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600"
							>
								{getClosedLabel()}
							</span>
						{/if}
						{#if event.locationMeta.joinUrl}
							<a
								href={event.locationMeta.joinUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
							>
								Join link
							</a>
						{/if}
					</div>

					{#if agendaItems.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">Agenda</h2>
							<ul class="mt-4 space-y-3">
								{#each agendaItems as agendaItem}
									<li class="rounded-xl border border-slate-200 bg-slate-50 p-4">
										<div class="flex flex-wrap items-center gap-2">
											<p class="text-sm font-semibold text-slate-900">{agendaItem.title}</p>
											{#if agendaItem.startsAtLabel}
												<span class="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
													{agendaItem.startsAtLabel}
												</span>
											{/if}
										</div>
										{#if agendaItem.outcome}
											<p class="mt-1 text-sm text-slate-700">{agendaItem.outcome}</p>
										{/if}
										{#if agendaItem.details}
											<p class="mt-1 text-sm text-slate-600">{agendaItem.details}</p>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if event.speakers?.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">Speakers</h2>
							<ul class="mt-3 space-y-4">
								{#each event.speakers as speaker}
									<li class="flex gap-3">
										{#if speaker.photo}
											<img
												src={speaker.photo}
												alt={speaker.photoAlt ?? speaker.name}
												class="h-12 w-12 rounded-full object-cover"
												loading="lazy"
											/>
										{/if}
										<div>
											<p class="text-sm font-semibold text-slate-900">{speaker.name}</p>
											<p class="text-xs font-semibold tracking-wide text-slate-600 uppercase">{speaker.title}</p>
											{#if speaker.shortBio}
												<p class="mt-1 text-sm text-slate-700">{speaker.shortBio}</p>
											{/if}
										</div>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if descriptionHtml}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">About this event</h2>
							<div class="prose prose-slate mt-3 max-w-none text-slate-700">
								{@html descriptionHtml}
							</div>
						</div>
					{/if}

					{#if faqItems.length}
						<div class="mt-8 border-t border-slate-200 pt-6">
							<h2 class="text-xl font-semibold text-slate-900">FAQ</h2>
							<ul class="mt-4 space-y-3">
								{#each faqItems as faqItem}
									<li class="rounded-xl border border-slate-200 bg-slate-50 p-4">
										<p class="text-sm font-semibold text-slate-900">{faqItem.question}</p>
										<p class="mt-1 text-sm text-slate-700">{faqItem.answer}</p>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="mt-8 border-t border-slate-200 pt-6">
						<h2 class="text-xl font-semibold text-slate-900">Ready to register?</h2>
						<p class="mt-2 text-slate-700">Save your spot now and we will send details directly to your inbox.</p>
						{#if canRegister}
							<a
								href={event.cta.url}
								class="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
								target={event.cta.url?.startsWith('http') ? '_blank' : undefined}
								rel={event.cta.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
							>
								{event.cta.label}
							</a>
						{/if}
					</div>
				</article>

				<aside class="hidden lg:block">
					<div class="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Register</p>
						<p class="mt-2 text-2xl font-semibold text-slate-900">{ticketPriceLabel} USD</p>
						<p class="mt-1 text-sm text-slate-600">{locationModeLabel} · {event.location}</p>
						<p class="mt-2 text-sm text-slate-700">
							{isTimestampValid ? officialDateTimeFormatter.format(startAtTimestamp) : 'Schedule TBD'}
						</p>
						{#if Number.isFinite(registrationClosesTimestamp)}
							<p class="mt-1 text-sm text-slate-700">
								Registration closes {officialDateTimeFormatter.format(registrationClosesTimestamp as number)}
							</p>
						{/if}
						{#if canRegister}
							<a
								href={event.cta.url}
								class="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
								target={event.cta.url?.startsWith('http') ? '_blank' : undefined}
								rel={event.cta.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
							>
								{event.cta.label}
							</a>
						{:else}
							<p class="mt-4 rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-600">
								{getClosedLabel()}
							</p>
						{/if}
						<div class="mt-4 space-y-2 text-sm text-slate-700">
							<p>Approval required: {approvalRequired ? 'Yes' : 'No'}</p>
							{#if locationDetailsNote}
								<p>{locationDetailsNote}</p>
							{/if}
						</div>
					</div>
				</aside>
			</div>
		{:else}
			<article class="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
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

				<h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{event.title}</h1>
				{#if event.subtitle}
					<p class="mt-2 text-sm font-semibold tracking-wide text-slate-600 uppercase">{event.subtitle}</p>
				{/if}
				<p class="mt-4 text-base text-slate-700 md:text-lg">{event.summary}</p>

				{#if isPastEvent}
					<div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
						<p class="text-sm font-semibold text-amber-900">
							{#if isCanceled}
								Sorry, this event was canceled. If you had already registered, please check your email for more details. A new event may already be available. Please check our events calendar using the following link:
							{:else}
								Sorry, this event already occurred. A new event may already be available. Please check our events calendar using the following link:
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

				{#if certificateText || trailerUrl}
					<div class="mt-3 flex flex-wrap items-center gap-2">
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
								aria-label="Watch the trailer (opens in new tab)"
							>
								Trailer <span aria-hidden="true">↗</span>
							</a>
						{/if}
					</div>
				{/if}

				<div class="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
					<p>
						<span class="font-semibold text-slate-900">Official time ({eventTimeZone}):</span>
						{isTimestampValid ? officialDateTimeFormatter.format(startAtTimestamp) : 'TBD'}
					</p>
					<p>
						<span class="font-semibold text-slate-900">Your local time:</span>
						{isTimestampValid ? localDateTimeFormatter.format(startAtTimestamp) : 'TBD'}
					</p>
					<p>
						<span class="font-semibold text-slate-900">Location mode:</span>
						{locationModeLabel}
					</p>
					<p>
						<span class="font-semibold text-slate-900">Location:</span>
						{event.location}
					</p>
					{#if locationDetailsNote}
						<p>{locationDetailsNote}</p>
					{/if}
					<p>
						<span class="font-semibold text-slate-900">Tickets:</span>
						{ticketPriceLabel} USD
					</p>
					<p>
						<span class="font-semibold text-slate-900">Approval required:</span>
						{approvalRequired ? 'Yes' : 'No'}
					</p>
				</div>

				{#if descriptionHtml}
					<div class="mt-8 border-t border-slate-200 pt-6">
						<h2 class="text-xl font-semibold text-slate-900">About this event</h2>
						<div class="prose prose-slate mt-3 max-w-none text-slate-700">
							{@html descriptionHtml}
						</div>
					</div>
				{/if}

				{#if event.highlights?.length}
					<div class="mt-8 border-t border-slate-200 pt-6">
						<h2 class="text-xl font-semibold text-slate-900">Highlights</h2>
						<ul class="mt-3 list-disc space-y-2 pl-5 text-slate-700">
							{#each event.highlights as highlight}
								<li>{highlight}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if isPastEvent}
					<div class="mt-8 border-t border-slate-200 pt-6">
						<h2 class="text-xl font-semibold text-slate-900">Recap and recording policy</h2>
						<p class="mt-3 text-slate-700">
							Some past events include recap assets such as recordings or slides. Availability varies by event, and recordings are not guaranteed unless explicitly stated on the original registration page.
						</p>
						{#if recordingUrl || slidesUrl}
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
						{:else}
							<p class="mt-3 text-sm text-slate-600">No recap assets are currently published for this event.</p>
						{/if}
					</div>
				{/if}
			</article>
		{/if}
	</div>

	{#if (isUpcomingScheduledEvent || isEventPlaygroundLanding) && canRegister}
		<div class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
			<div class="mx-auto flex max-w-6xl items-center justify-between gap-3">
				<div>
					<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Register now</p>
					<p class="text-sm font-semibold text-slate-900">{ticketPriceLabel} USD</p>
				</div>
				<a
					href={event.cta.url}
					class="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
					target={event.cta.url?.startsWith('http') ? '_blank' : undefined}
					rel={event.cta.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
				>
					{event.cta.label}
				</a>
			</div>
		</div>
	{/if}
</section>
