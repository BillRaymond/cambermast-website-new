<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getEventTypeLabel } from '$lib/data/events';
	import type { PageData } from './$types';

	export let data: PageData;

	const events = data.events ?? [];
	const today = new Date();

	const toTimestamp = (value: string): number => {
		const parsed = new Date(value);
		const timestamp = parsed.valueOf();
		return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
	};

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const todayTimestamp = todayStart.getTime();

	const upcomingEvents = [...events]
		.filter((event) => toTimestamp(event.startAt) >= todayTimestamp)
		.sort((a, b) => toTimestamp(a.startAt) - toTimestamp(b.startAt));

	const pastEvents = [...events]
		.filter((event) => toTimestamp(event.startAt) < todayTimestamp)
		.sort((a, b) => toTimestamp(b.startAt) - toTimestamp(a.startAt));

	const formatTime = (value?: string | string[]): string | null => {
		if (!value) return null;
		return Array.isArray(value) ? value.join(' · ') : value;
	};

	const getEventBadge = (eventType: string, isDraft?: boolean): string =>
		isDraft ? `${eventType} · Draft` : eventType;

	const pageMeta = {
		title: 'Events & Webinars | Cambermast',
		description:
			'Browse upcoming Cambermast events, webinars, talks, and workshops. Register for live sessions and related training.'
	};
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/events" />

<section class="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
	<div class="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14">
		<div class="rounded-3xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-xs text-cyan-100">
			<p class="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-cyan-200">
				Dev-only reference
			</p>
			<div class="mt-2 grid gap-2 text-[0.7rem] text-cyan-100/90 md:grid-cols-2">
				<div>
					<p class="font-semibold text-cyan-100">Training images</p>
					<p>Hero sizes in use: 1920×1080 and 3840×2160.</p>
					<p>Open graph sizes: 1920×1080.</p>
				</div>
				<div>
					<p class="font-semibold text-cyan-100">Event images</p>
					<p>Current Lu.ma cover image: 800×800 (square).</p>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Cambermast events</p>
			<h1 class="text-4xl font-semibold md:text-5xl">Events, webinars, and live sessions</h1>
			<p class="max-w-2xl text-base text-white/80">
				Join upcoming Cambermast-hosted events to learn from real-world AI delivery experiences,
				connect with practitioners, and explore related training.
			</p>
			<a
				href="/calendar"
				class="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/50"
			>
				View full training calendar →
			</a>
		</div>

		{#if upcomingEvents.length}
			<div class="grid gap-4">
				{#each upcomingEvents as event}
					<article class="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/40">
						<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
							<div class="flex flex-col gap-3">
								<p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
									{getEventBadge(getEventTypeLabel(event), event.draft)}
								</p>
								<h2 class="text-2xl font-semibold text-white">{event.title}</h2>
								{#if event.tagline}
									<p class="text-sm text-white/70">{event.tagline}</p>
								{/if}
								<p class="text-sm text-white/70">{event.date}</p>
								{#if event.time}
									<p class="text-xs text-white/60">{formatTime(event.time)}</p>
								{/if}
								<p class="text-sm text-white/80">{event.summary}</p>
							</div>
							<div class="flex flex-col gap-2 md:items-end">
								<a
									href={event.registerUrl}
									target="_blank"
									rel="noopener"
									class="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-400/40 transition hover:bg-cyan-300"
								>
									{event.registerLabel ?? 'Register'} ↗
								</a>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
				No upcoming events are listed right now. Check the training calendar for the latest schedule.
			</div>
		{/if}
	</div>
</section>

{#if pastEvents.length}
	<section class="bg-white">
		<div class="mx-auto max-w-6xl px-5 py-12">
			<h2 class="text-2xl font-semibold text-slate-900">Past events</h2>
			<div class="mt-6 grid gap-4 md:grid-cols-2">
				{#each pastEvents as event}
					<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
						<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
							{getEventBadge(getEventTypeLabel(event), event.draft)}
						</p>
						<p class="mt-2 text-sm font-semibold text-slate-900">{event.title}</p>
						<p class="text-xs text-slate-600">{event.date}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}
