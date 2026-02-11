<script lang="ts">
	import { onDestroy } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getEventTypeLabel } from '$lib/data/events';
	import type { PageData } from './$types';

	export let data: PageData;

	const event = data.event;
	const partner = data.partner;
	const relatedProgram = data.relatedProgram;
	const pacificTimeZone = 'America/Los_Angeles';
	const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const startAtTimestamp = new Date(event.startAtUtc).valueOf();
	const endAtTimestamp = event.endAtUtc ? new Date(event.endAtUtc).valueOf() : undefined;
	const isTimestampValid = Number.isFinite(startAtTimestamp);
	const hasEnded = Number.isFinite(endAtTimestamp)
		? (endAtTimestamp as number) < Date.now()
		: false;

	const pacificDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: pacificTimeZone,
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
		if (registrationStatus === 'none') return 'Registration unavailable';
		return null;
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

	let nowTimestamp = Date.now();
	let timer: ReturnType<typeof setInterval> | undefined;
	let countdownLabel = isTimestampValid ? buildCountdown(startAtTimestamp - nowTimestamp) : 'TBD';

	if (typeof window !== 'undefined' && isTimestampValid && startAtTimestamp > Date.now()) {
		timer = setInterval(() => {
			nowTimestamp = Date.now();
			countdownLabel = buildCountdown(startAtTimestamp - nowTimestamp);
		}, 1000);
	}

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	const pageTitle = `${event.title} | Cambermast Events`;
	const pageDescription = event.summary;
	const statusLabel = getStatusLabel(event.registrationStatus);
	const canRegister =
		Boolean(event.cta?.url) &&
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

<section class="bg-white py-12 md:py-16">
	<div class="mx-auto max-w-4xl px-5">
		<div class="mb-8">
			<a
				href="/events"
				class="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900"
			>
				&larr; Back to events
			</a>
		</div>

		<article class="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
			<div class="flex flex-wrap items-center gap-2">
				<span
					class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
				>
					{getEventTypeLabel(event)}
				</span>
				{#if statusLabel}
					<span
						class="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
					>
						{statusLabel}
					</span>
				{/if}
			</div>

			<h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
				{event.title}
			</h1>
			<p class="mt-4 text-base text-slate-700 md:text-lg">{event.summary}</p>

			<div
				class="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700"
			>
				<p>
					<span class="font-semibold text-slate-900">Official time (Pacific):</span>
					{isTimestampValid ? pacificDateTimeFormatter.format(startAtTimestamp) : 'TBD'}
				</p>
				<p>
					<span class="font-semibold text-slate-900">Your local time:</span>
					{isTimestampValid ? localDateTimeFormatter.format(startAtTimestamp) : 'TBD'}
				</p>
				<p>
					<span class="font-semibold text-slate-900">Location:</span>
					{event.location}
				</p>
			</div>

			<div class="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
				<p class="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase">Countdown</p>
				<p class="mt-1 text-2xl font-semibold text-slate-900">
					{#if !isTimestampValid}
						TBD
					{:else if hasEnded}
						Event completed
					{:else}
						{countdownLabel}
					{/if}
				</p>
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
						{event.cta?.label ?? 'Registration unavailable'}
					</span>
				{/if}
				{#if event.campaignId}
					<a
						href={`/c/${event.campaignId}`}
						class="inline-flex rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
					>
						Campaign link
					</a>
				{/if}
			</div>

			{#if partner || (event.partnerCode && event.partnerCode !== 'NONE')}
				<div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
					<p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Partner</p>
					<div class="mt-2 flex items-center gap-3">
						{#if partner?.logo}
							<img
								src={partner.logo}
								alt={`${partner.name} logo`}
								class="h-10 w-10 rounded object-contain"
								loading="lazy"
							/>
						{/if}
						<div class="min-w-0">
							<p class="text-sm font-semibold text-slate-900">
								{partner?.name ?? event.partnerCode}
							</p>
							{#if partner?.homepageUrl}
								<a
									href={partner.homepageUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="text-xs font-semibold text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-900"
								>
									Visit partner site
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			{#if relatedProgram}
				<div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
					<p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
						Related training program
					</p>
					<p class="mt-2 text-sm font-semibold text-slate-900">{relatedProgram.title}</p>
					{#if relatedProgram.tagline}
						<p class="mt-1 text-sm text-slate-700">{relatedProgram.tagline}</p>
					{/if}
					<a
						href={relatedProgram.route ?? `/training/${relatedProgram.slug}`}
						class="mt-3 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
					>
						View training program
					</a>
				</div>
			{/if}

			{#if event.description}
				<div class="mt-8 border-t border-slate-200 pt-6">
					<h2 class="text-xl font-semibold text-slate-900">About this event</h2>
					<p class="mt-3 whitespace-pre-line text-slate-700">
						{typeof event.description === 'string'
							? event.description
							: (event.description.bodyMd ?? event.description.summary ?? '')}
					</p>
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
		</article>
	</div>
</section>
