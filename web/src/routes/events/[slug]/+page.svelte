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
	const descriptionMarkdown =
		typeof event.description === 'string'
			? event.description
			: (event.description?.bodyMd ?? event.description?.summary ?? '');
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

<section class="bg-gradient-to-b from-slate-100 via-white to-white pb-24 pt-12 md:pt-16">
	<div class="mx-auto max-w-6xl px-5">
		<div class="mb-8">
			<a
				href="/events"
				class="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900"
			>
				&larr; Back to events
			</a>
		</div>

		{#if isUpcomingScheduledEvent}
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

	{#if isUpcomingScheduledEvent && canRegister}
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
