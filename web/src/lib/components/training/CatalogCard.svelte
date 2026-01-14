<script lang="ts">
	import SessionCard from '$lib/components/SessionCard.svelte';
	import type { CatalogCardData } from './catalog-card-data';
	export let item: CatalogCardData;
	export let scheduleTeamLabel: string;

	const hasScheduleButton = (scheduleUrl?: string): boolean => Boolean(scheduleUrl);
	const isScheduleTeamButton = (label?: string): boolean =>
		(label ?? '').toLowerCase().trim() === scheduleTeamLabel.toLowerCase();

let rawTitle: string;
let titleSlug: string;
let sessionsSectionId: string;

$: hasUpcomingSessions = Boolean(item.upcomingSessions?.length);
$: hasHappeningSessions = Boolean(item.happeningSessions?.length);
$: rawTitle = item.title ?? '';
$: titleSlug = rawTitle
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, '-')
	.replace(/(^-+|-+$)/g, '');
$: sessionsSectionId = `${titleSlug || 'training'}-sessions`;

const scrollToSessionsSection = (): void => {
	if (typeof document === 'undefined') return;
	const el = document.getElementById(sessionsSectionId);
	el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<article
	class="relative flex h-full flex-col rounded-2xl border bg-white p-5 text-center shadow-sm transition"
	class:border-blue-300={hasUpcomingSessions}
	class:shadow-md={hasUpcomingSessions}
	class:ring-1={hasUpcomingSessions}
	class:ring-blue-200={hasUpcomingSessions}
	class:catalog-card--glow={hasUpcomingSessions}
>
	{#if item.image}
		<img
			src={item.image}
			alt={item.imageAlt ?? item.title}
			class="mb-3 w-full rounded-xl object-cover"
			loading="lazy"
		/>
	{/if}
	<h2 class="text-xl font-semibold">{item.title}</h2>
	{#if item.sku}
		<p class="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
			({item.sku})
		</p>
	{/if}
{#if hasUpcomingSessions || hasHappeningSessions}
		<button
			type="button"
			class="mt-3 inline-flex items-center justify-center gap-2 self-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 transition hover:bg-blue-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
			on:click={scrollToSessionsSection}
		>
			<span class="h-2 w-2 rounded-full bg-blue-500"></span>
			{hasUpcomingSessions ? 'New dates added' : 'Cohort in progress'}
		</button>
	{/if}
	{#if item.videoUrl}
		<a
			href={item.videoUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-800"
		>
			Watch the trailer
			<span aria-hidden="true">↗</span>
		</a>
	{/if}
	{#if item.summary}<p class="mt-1.5 text-gray-600">{item.summary}</p>{/if}
	{#if item.bullets?.length}
		<ul class="bullet-list mt-3 space-y-1.5 text-left text-gray-700">
			{#each item.bullets as bullet}
				<li>{bullet}</li>
			{/each}
		</ul>
	{/if}
	{#if item.route}
		<div class="mt-auto flex w-full flex-col items-center gap-3 pt-5">
				{#if item.duration}
					<p class="text-sm font-semibold text-gray-700">
						Duration:
						{#if Array.isArray(item.duration)}
							{item.duration.join(', ')}
						{:else}
							{item.duration}
						{/if}
					</p>
				{/if}
				{#if item.certificateText}
					<div class="text-sm font-semibold text-blue-700">
						{#if item.certificateText}
							<p>{item.certificateText}</p>
						{/if}
					</div>
				{/if}
			{#if item.upcomingSessions?.length}
				<div
					id={sessionsSectionId}
					class="w-full rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left"
				>
					<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
						Upcoming sessions
					</p>
					<ul class="mt-3 space-y-3">
						{#each item.upcomingSessions as session (session.registerUrl + session.date)}
							<li>
								<SessionCard
									title={session.name}
									date={session.date}
									time={session.time}
									location={session.location}
									ctaUrl={session.registerUrl}
									ctaLabel="Register ↗"
									tone="upcoming"
								/>
							</li>
						{/each}
					</ul>
				</div>
			{:else if item.happeningSessions?.length}
				<div
					id={sessionsSectionId}
					class="w-full rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left"
				>
					<p class="text-xs font-semibold uppercase tracking-wide text-amber-700">
						Happening now
					</p>
					<ul class="mt-3 space-y-3">
						{#each item.happeningSessions as session (session.name + (session.startDate ?? session.date))}
							<li>
								<SessionCard
									title={session.name}
									date={session.date}
									time={session.time}
									location={session.location}
									statusLabel={`Enrollment closed — ends ${session.endDate ?? 'soon'}`}
									tone="happening"
								/>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if hasScheduleButton(item.scheduleUrl)}
				<a
					href={item.scheduleUrl}
					class="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
					class:schedule-team-button={isScheduleTeamButton(item.scheduleLabel)}
				>
					{item.scheduleLabel ?? scheduleTeamLabel}
				</a>
			{/if}
			<a
				href={item.route}
				class="inline-flex w-full justify-center rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-700 transition hover:border-blue-500 hover:text-blue-900"
			>
				Learn more
			</a>
		</div>
	{/if}
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

	@media (prefers-reduced-motion: reduce) {
		.catalog-card--glow::after {
			animation: none;
			opacity: 0;
			box-shadow: none;
		}
	}
</style>
