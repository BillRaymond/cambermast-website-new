<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import { getEventTypeLabel } from '$lib/data/events';
	import type { PageData } from './$types';

	export let data: PageData;

	const event = data.event;
	const relatedPrograms = data.relatedPrograms ?? [];
	const eventTypeLabel = getEventTypeLabel(event);
	const registerLabel = event.registerLabel ?? 'Register';

	const toTimeLines = (value?: string | string[]): string[] =>
		Array.isArray(value) ? value : value ? [value] : [];

	const timeLines = toTimeLines(event.time);
	const metaLines = [
		event.date,
		...timeLines,
		event.timezone ? `Timezone: ${event.timezone}` : null,
		event.location
	].filter((line): line is string => Boolean(line));

	const canonicalPath = `/events/${event.slug}`;
	const seoTitle = `${event.title} | Cambermast Events`;
	const seoDescription = event.summary ?? event.description;
	const seoImage = event.image;
	const seoImageAlt = event.imageAlt ?? event.title;
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	path={canonicalPath}
	image={seoImage}
	imageAlt={seoImageAlt}
	type="article"
/>

<svelte:head>
	<link rel="canonical" href={`${SITE_ORIGIN.replace(/\/$/, '')}${canonicalPath}`} />
</svelte:head>

<main class="relative overflow-hidden bg-slate-950 text-white">
	<div class="absolute inset-0">
		<div class="absolute -top-40 left-10 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl"></div>
		<div class="absolute top-10 right-0 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl"></div>
		<div class="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"></div>
	</div>

	<section class="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-12 pt-12 md:pt-16">
		<nav>
			<a
				href="/training/calendar"
				class="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
			>
				<span aria-hidden="true">←</span>
				Back to training calendar
			</a>
		</nav>

		<div class="grid gap-10 md:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
			<div class="flex flex-col gap-6">
				<div class="flex flex-wrap items-center gap-3">
					<span class="rounded-full border border-emerald-200 bg-emerald-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
						<span class="inline-flex items-center gap-1.5">
							<svg viewBox="0 0 24 24" aria-hidden="true" class="h-3 w-3" fill="currentColor">
								<path d="M9 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3zm7 1a1 1 0 011 1v6a5 5 0 01-4 4.9V19h3a1 1 0 110 2H8a1 1 0 110-2h3v-3.1A5 5 0 017 11V5a1 1 0 112 0v6a3 3 0 006 0V5a1 1 0 011-1z" />
							</svg>
							Event
						</span>
					</span>
					<span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
						{eventTypeLabel}
					</span>
					{#if event.draft}
						<span class="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
							Draft
						</span>
					{/if}
					{#if event.tagline}
						<span class="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
							{event.tagline}
						</span>
					{/if}
				</div>
				<h1 class="text-4xl font-semibold leading-tight md:text-5xl">{event.title}</h1>
				<p class="max-w-2xl text-lg text-white/80">{event.summary}</p>

				<div class="flex flex-wrap gap-3">
					<a
						href={event.registerUrl}
						target="_blank"
						rel="noopener"
						class="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/40 transition hover:bg-cyan-300"
					>
						{registerLabel} ↗
					</a>
					{#if relatedPrograms.length > 0}
						<a
							href={relatedPrograms[0].route}
							class="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/60"
						>
							Related training
						</a>
					{/if}
				</div>
			</div>

			<aside class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40">
				<p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Event details</p>
				<ul class="mt-4 space-y-2 text-sm text-white/80">
					{#each metaLines as line}
						<li class="flex items-start gap-3">
							<span class="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
							<span>{line}</span>
						</li>
					{/each}
				</ul>
				<div class="mt-6 rounded-2xl bg-white/10 p-4">
					<p class="text-sm font-semibold text-white">Secure your seat</p>
					<p class="mt-1 text-xs text-white/70">
						Registration is handled through the linked signup page.
					</p>
					<a
						href={event.registerUrl}
						target="_blank"
						rel="noopener"
						class="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
					>
						{registerLabel} ↗
					</a>
				</div>
			</aside>
		</div>
	</section>
</main>

<section class="mx-auto max-w-6xl px-5 py-12">
	<div class="grid gap-10 md:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
		<div class="flex flex-col gap-6">
			<h2 class="text-2xl font-semibold text-slate-900">What to expect</h2>
			<p class="text-base text-slate-700">{event.description}</p>
			{#if event.highlights?.length}
				<ul class="space-y-3 text-sm text-slate-700">
					{#each event.highlights as highlight}
						<li class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
							<span class="mt-1 h-2 w-2 rounded-full bg-cyan-500"></span>
							<span>{highlight}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		{#if event.image}
			<div class="flex items-start justify-center">
				<img
					src={event.image}
					alt={event.imageAlt ?? event.title}
					class="w-full max-w-md rounded-3xl border border-slate-200 object-cover shadow-xl"
					loading="lazy"
				/>
			</div>
		{/if}
	</div>
</section>

{#if event.speakers?.length}
	<section class="bg-slate-50">
		<div class="mx-auto max-w-6xl px-5 py-12">
			<h2 class="text-2xl font-semibold text-slate-900">Meet the speakers</h2>
			<div class="mt-6 grid gap-4 md:grid-cols-2">
				{#each event.speakers as speaker}
					<div class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
						{#if speaker.photo}
							<img
								src={speaker.photo}
								alt={speaker.photoAlt ?? speaker.name}
								class="h-16 w-16 rounded-full object-cover"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-500">
								{speaker.name
									.split(' ')
									.map((chunk) => chunk[0])
									.slice(0, 2)
									.join('')}
							</div>
						{/if}
						<div>
							<p class="text-sm font-semibold text-slate-900">{speaker.name}</p>
							<p class="text-xs text-slate-600">{speaker.title}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

{#if relatedPrograms.length > 0}
	<section class="mx-auto max-w-6xl px-5 py-12">
		<div class="flex flex-col gap-6">
			<h2 class="text-2xl font-semibold text-slate-900">Related training</h2>
			<div class="grid gap-4 md:grid-cols-2">
				{#each relatedPrograms as program}
					<a
						href={program.route}
						class="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
					>
						<div class="flex items-start gap-4">
							{#if program.ogImage || program.heroImage}
								<img
									src={program.ogImage ?? program.heroImage}
									alt={program.ogImageAlt ?? program.heroImageAlt ?? program.title}
									class="h-16 w-16 rounded-xl object-cover"
									loading="lazy"
								/>
							{/if}
							<div>
								<p class="text-sm font-semibold text-slate-900 group-hover:text-cyan-700">
									{program.title}
								</p>
								{#if program.tagline}
									<p class="mt-1 text-xs text-slate-600">{program.tagline}</p>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}
