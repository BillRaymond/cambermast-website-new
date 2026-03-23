<script lang="ts">
	import EventCard from '$lib/components/events/EventCard.svelte';
	import type { CatalogCardData } from './catalog-card-data';
	export let item: CatalogCardData;
	export let scheduleTeamLabel: string;
	export let showBullets = false;
	export let showDuration = true;
	export let layout: 'column' | 'row' = 'column';
	export let enableUpcomingShowAll = false;
	export let upcomingSessionsInitialLimit: number | null = null;
	export let hideHappeningWhenUpcoming = false;
	export let enableLiveCountdown = false;

	const hasScheduleButton = (scheduleUrl?: string): boolean => Boolean(scheduleUrl);
	const isScheduleTeamButton = (label?: string): boolean =>
		(label ?? '').toLowerCase().trim() === scheduleTeamLabel.toLowerCase();

	let rawTitle: string;
	let titleSlug: string;
	let sessionsSectionId: string;
	let isRowLayout: boolean;
	let hasHappeningSessions: boolean;
	let hasUpcomingOrHappening: boolean;
	let showHappeningSessions: boolean;
	let displayedHappeningSessions: NonNullable<CatalogCardData['happeningSessions']>;
	let displayedUpcomingSessions: NonNullable<CatalogCardData['upcomingSessions']>;
	let canToggleUpcomingSessions: boolean;
	let showAllUpcomingSessions = false;

	$: hasUpcomingSessions = Boolean(item.upcomingSessions?.length);
	$: hasHappeningSessions = Boolean(item.happeningSessions?.length);
	$: showHappeningSessions =
		hasHappeningSessions && (!hideHappeningWhenUpcoming || !hasUpcomingSessions);
	$: hasUpcomingOrHappening = hasUpcomingSessions || hasHappeningSessions;
	$: displayedHappeningSessions = showHappeningSessions ? (item.happeningSessions ?? []) : [];
	$: upcomingSessionsLimit =
		typeof upcomingSessionsInitialLimit === 'number' && upcomingSessionsInitialLimit > 0
			? upcomingSessionsInitialLimit
			: null;
	$: canToggleUpcomingSessions =
		Boolean(enableUpcomingShowAll) &&
		Boolean(upcomingSessionsLimit) &&
		(item.upcomingSessions?.length ?? 0) > (upcomingSessionsLimit ?? 0);
	$: displayedUpcomingSessions = canToggleUpcomingSessions
		? showAllUpcomingSessions
			? (item.upcomingSessions ?? [])
			: (item.upcomingSessions ?? []).slice(0, upcomingSessionsLimit ?? 0)
		: (item.upcomingSessions ?? []);
	$: rawTitle = item.title ?? '';
	$: titleSlug = rawTitle
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-+|-+$)/g, '');
	$: sessionsSectionId = `${titleSlug || 'training'}-sessions`;
	$: isRowLayout = layout === 'row';
</script>

<article
	class="relative flex h-full flex-col rounded-2xl border bg-white p-4 shadow-sm transition"
	class:text-center={!isRowLayout}
	class:text-left={isRowLayout}
	class:border-blue-300={hasUpcomingSessions}
	class:shadow-md={hasUpcomingSessions}
	class:ring-1={hasUpcomingSessions}
	class:ring-blue-200={hasUpcomingSessions}
	class:catalog-card--glow={hasUpcomingSessions}
	class:catalog-card--row={isRowLayout}
>
	{#if item.image}
		<div class="catalog-card__media flex flex-col gap-2">
			{#if item.route}
				<a
					href={item.route}
					class="group block focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none"
					aria-label={`View ${item.title}`}
				>
					<img
						src={item.image}
						alt={item.imageAlt ?? item.title}
						class="catalog-card__image aspect-[3/2] w-full rounded-xl object-cover transition group-hover:opacity-95"
						class:mb-3={!isRowLayout}
						loading="lazy"
					/>
				</a>
			{:else}
				<img
					src={item.image}
					alt={item.imageAlt ?? item.title}
					class="catalog-card__image aspect-[3/2] w-full rounded-xl object-cover"
					class:mb-3={!isRowLayout}
					loading="lazy"
				/>
			{/if}
			{#if item.brochureUrl}
				<a
					href={item.brochureUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex w-full items-center justify-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold text-blue-700 uppercase transition hover:bg-blue-100"
				>
					BROCHURE
				</a>
			{/if}
			{#if showBullets && item.bullets?.length && hasUpcomingOrHappening}
				<ul class="bullet-list hidden space-y-1.5 text-left text-gray-700 md:block">
					{#each item.bullets as bullet}
						<li>{bullet}</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
	<div class="catalog-card__content flex min-w-0 flex-1 flex-col">
		{#if item.route}
			<h2 class="text-xl font-semibold">
				<a
					href={item.route}
					class="transition hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none"
				>
					{item.title}
				</a>
			</h2>
		{:else}
			<h2 class="text-xl font-semibold">{item.title}</h2>
		{/if}
		{#if item.summary}<p class="mt-1 text-gray-600">{item.summary}</p>{/if}
		{#if showBullets && item.bullets?.length}
			<ul class="bullet-list mt-2 space-y-1.5 text-left text-gray-700 md:hidden">
				{#each item.bullets as bullet}
					<li>{bullet}</li>
				{/each}
			</ul>
		{/if}
		{#if item.certificateText || item.videoUrl}
			<div class="mt-1.5 flex flex-wrap items-center gap-2">
				{#if item.certificateText}
					<span
						class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[0.7rem] font-medium text-blue-700/80 normal-case"
					>
						{item.certificateText}
					</span>
				{/if}
				{#if item.videoUrl}
					<a
						href={item.videoUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[0.7rem] font-medium text-blue-700/80 normal-case transition hover:border-blue-200 hover:bg-blue-100"
					>
						🎬 Watch the trailer
					</a>
				{/if}
			</div>
		{/if}
		{#if showBullets && item.bullets?.length && !hasUpcomingOrHappening}
			<ul class="bullet-list mt-2 hidden flex-wrap gap-x-4 gap-y-2 text-left text-gray-700 md:flex">
				{#each item.bullets as bullet}
					<li>{bullet}</li>
				{/each}
			</ul>
		{/if}
		{#if item.upcomingSessions?.length}
			<div
				id={sessionsSectionId}
				class="mt-2 w-full rounded-2xl border border-blue-100 bg-blue-50 p-3 text-left"
			>
				<div class="flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-600 uppercase">
					<span class="h-2 w-2 rounded-full bg-blue-500"></span>
					<span>Upcoming sessions</span>
					{#if canToggleUpcomingSessions}
						<span aria-hidden="true">•</span>
						<button
							type="button"
							class="cursor-pointer text-xs font-semibold text-blue-700 uppercase underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
							on:click={() => (showAllUpcomingSessions = !showAllUpcomingSessions)}
						>
							{showAllUpcomingSessions ? 'Show fewer' : `Show all (${item.upcomingSessions.length})`}
						</button>
					{/if}
				</div>
				<ul class="mt-2 space-y-2.5">
					{#each displayedUpcomingSessions as session (session.id)}
						<li>
							<EventCard
								title={session.title}
								tagline={session.tagline}
								date={session.date}
								time={session.time}
								location={session.location}
								image={session.image ?? item.image}
								imageAlt={session.imageAlt ?? item.imageAlt ?? session.title}
								certificateText={session.certificateText ?? item.certificateText}
								videoUrl={session.videoUrl ?? item.videoUrl}
								typeLabel={session.typeLabel}
								brochureUrl={session.brochureUrl ?? item.brochureUrl}
								statusLabel={session.statusLabel}
								startTimestamp={session.startTimestamp}
								registerUrl={session.registerUrl}
								registerLabel={session.registerLabel ?? 'Register now'}
								learnMoreUrl={session.learnMoreUrl ?? item.route}
								hostText={session.hostText}
								partnerText={session.partnerText}
								speakerText={session.speakerText}
								tone={session.tone}
								variant="catalog"
								enableLiveCountdown={enableLiveCountdown}
							/>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
		{#if item.route}
			<div
				class="mt-auto flex w-full flex-col gap-2.5 pt-4"
				class:items-center={!isRowLayout}
				class:items-start={isRowLayout}
			>
				{#if showDuration && item.duration}
					<p class="text-sm font-semibold text-gray-700">
						Duration:
						{#if Array.isArray(item.duration)}
							{item.duration.join(', ')}
						{:else}
							{item.duration}
						{/if}
					</p>
				{/if}
				{#if displayedHappeningSessions.length}
					<div
						id={sessionsSectionId}
						class="w-full rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-left"
					>
						<p class="text-xs font-semibold tracking-wide text-amber-700 uppercase">
							Happening now
						</p>
						<ul class="mt-2 space-y-2.5">
							{#each displayedHappeningSessions as session (session.id)}
								<li>
									<EventCard
										title={session.title}
										tagline={session.tagline}
										date={session.date}
										time={session.time}
										location={session.location}
										image={session.image ?? item.image}
										imageAlt={session.imageAlt ?? item.imageAlt ?? session.title}
										certificateText={session.certificateText ?? item.certificateText}
										videoUrl={session.videoUrl ?? item.videoUrl}
										typeLabel={session.typeLabel}
										brochureUrl={session.brochureUrl ?? item.brochureUrl}
										statusLabel={session.statusLabel}
										startTimestamp={session.startTimestamp}
										learnMoreUrl={session.learnMoreUrl ?? item.route}
										hostText={session.hostText}
										partnerText={session.partnerText}
										speakerText={session.speakerText}
										tone={session.tone}
										variant="catalog"
										enableLiveCountdown={enableLiveCountdown}
									/>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
				{#if item.route}
					<div
						class="flex w-full flex-wrap items-center justify-between gap-2.5 text-sm font-semibold"
						class:catalog-card__cta-row={isRowLayout}
					>
						{#if hasScheduleButton(item.scheduleUrl)}
							<a
								href={item.scheduleUrl}
								class="text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
								class:schedule-team-button={isScheduleTeamButton(item.scheduleLabel)}
							>
								{item.scheduleLabel ?? scheduleTeamLabel}
							</a>
						{/if}
						<a
							href={item.route}
							class="text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
						>
							Learn more →
						</a>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</article>

<style>
	.catalog-card--glow {
		border-color: rgba(147, 197, 253, 0.85);
		box-shadow: 0 18px 38px -18px rgba(59, 130, 246, 0.35);
		z-index: 0;
	}

	.catalog-card--glow::after {
		content: '';
		position: absolute;
		inset: -6px;
		border-radius: inherit;
		box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.35);
		opacity: 0.75;
		transform: scale(1);
		animation: catalogCardPulse 3.6s ease-out infinite;
		pointer-events: none;
		z-index: -1;
	}

	@keyframes catalogCardPulse {
		0% {
			opacity: 0.7;
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.35);
		}
		55% {
			opacity: 0.15;
			transform: scale(1.04);
			box-shadow: 0 0 0 22px rgba(118, 169, 250, 0);
		}
		100% {
			opacity: 0;
			transform: scale(1.05);
			box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
		}
	}

	.catalog-card--row {
		flex-direction: column;
		gap: 1.25rem;
		text-align: left;
	}

	@media (min-width: 768px) {
		.catalog-card--row {
			flex-direction: row;
		}

		.catalog-card--row .catalog-card__media {
			flex: 0 0 200px;
			width: 200px;
		}

	}

	.catalog-card__cta-row {
		gap: 0.75rem 1.5rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.catalog-card--glow::after {
			animation: none;
			opacity: 0;
			box-shadow: none;
		}
	}
</style>
