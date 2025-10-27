<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import Card from '$lib/components/ServiceCard.svelte';
	import { listTrainingPrograms } from '$lib/data/training';
	import type { TrainingProgram, TrainingSession } from '$lib/data/training/types';
	import {
		getSessionStartTimestamp,
		hasExternalRegistration,
		isSessionUpcoming,
		normalizeToday
	} from '$lib/data/training/session-utils';

	const year = new Date().getFullYear();

	type CatalogSection = {
		label: string;
		headline: string;
		route?: string;
		icon?: string;
		testimonial?: string;
		testimonialCta?: { href: string; label: string };
		author?: string;
	};

	const catalogSections = catalog as Record<string, Partial<CatalogSection>>;

	const sections = Object.entries(catalogSections)
		.filter(([slug, sec]) => slug !== 'home' && Boolean(sec?.label) && Boolean(sec?.headline))
		.map(([slug, sec]) => ({ slug, ...sec })) as Array<{ slug: string } & CatalogSection>;

	const today = normalizeToday();

	const upcomingSessions = listTrainingPrograms()
		.flatMap((program: TrainingProgram) =>
			(program.sessions ?? []).map((session) => ({ program, session }))
		)
		.filter(({ session }) => hasExternalRegistration(session))
		.filter(({ session }) => isSessionUpcoming(session, today))
		.sort((a, b) => {
			const startA = getSessionStartTimestamp(a.session);
			const startB = getSessionStartTimestamp(b.session);
			return startA - startB;
		}) satisfies Array<{
		program: TrainingProgram;
		session: TrainingSession;
	}>;

	const MILLISECONDS_IN_HOUR = 1000 * 60 * 60;
	const MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR;

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

	const getSessionMeta = (program: TrainingProgram, session: TrainingSession) => {
		const trimmedName = session.name?.trim();
		const displayName = trimmedName && trimmedName.length > 0 ? trimmedName : program.title;
		const showProgramTitle = Boolean(trimmedName) && trimmedName !== program.title;
		return { displayName, showProgramTitle };
	};

	const featuredUpcoming = upcomingSessions[0];

	const featuredMeta = featuredUpcoming
		? getSessionMeta(featuredUpcoming.program, featuredUpcoming.session)
		: null;

	const featuredDisplayName =
		featuredMeta?.displayName ?? featuredUpcoming?.program.title ?? '';
	const showFeaturedProgramTitle = featuredMeta?.showProgramTitle ?? false;

	const featuredStartTimestamp = featuredUpcoming
		? getSessionStartTimestamp(featuredUpcoming.session)
		: null;

	const featuredUrgency = getUrgencyLabel(featuredStartTimestamp);

	const upcomingCards = upcomingSessions.map((entry) => {
		const meta = getSessionMeta(entry.program, entry.session);
		const startTimestamp = getSessionStartTimestamp(entry.session);
		return {
			...entry,
			displayName: meta.displayName,
			showProgramTitle: meta.showProgramTitle,
			startTimestamp,
			urgency: getUrgencyLabel(startTimestamp)
		};
	});
</script>

<svelte:head>
	<!-- Favicon -->
	<link rel="icon" href="/images/cambermast-favicon.ico" />

	<!-- Apple Touch Icons -->
	<link rel="apple-touch-icon" href="/images/cambermast-apple-touch-icon.png" />
	<link rel="apple-touch-icon" sizes="57x57" href="/images/cambermast-apple-touch-icon-57x57.png" />
	<link rel="apple-touch-icon" sizes="60x60" href="/images/cambermast-apple-touch-icon-60x60.png" />
	<link rel="apple-touch-icon" sizes="72x72" href="/images/cambermast-apple-touch-icon-72x72.png" />
	<link rel="apple-touch-icon" sizes="76x76" href="/images/cambermast-apple-touch-icon-76x76.png" />
	<link
		rel="apple-touch-icon"
		sizes="114x114"
		href="/images/cambermast-apple-touch-icon-114x114.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="120x120"
		href="/images/cambermast-apple-touch-icon-120x120.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="144x144"
		href="/images/cambermast-apple-touch-icon-144x144.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="152x152"
		href="/images/cambermast-apple-touch-icon-152x152.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="167x167"
		href="/images/cambermast-apple-touch-icon-167x167.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="180x180"
		href="/images/cambermast-apple-touch-icon-180x180.png"
	/>

	<!-- Android / Chrome Icons -->
	<link
		rel="icon"
		type="image/png"
		sizes="192x192"
		href="/images/cambermast-android-chrome-192x192.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="256x256"
		href="/images/cambermast-android-chrome-256x256.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="384x384"
		href="/images/cambermast-android-chrome-384x384.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="512x512"
		href="/images/cambermast-android-chrome-512x512.png"
	/>

	<!-- Manifest -->
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<!-- Full-bleed hero -->
<section class="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-blue-50">
	<!-- Removed gradient background, replaced with a subtle blue tint using bg-blue-50 -->

	<div class="relative mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
		<!-- Left: headline only -->
		<div class="flex max-w-md flex-col gap-3">
			{#if featuredUpcoming}
				<div class="flex flex-wrap items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-hero">
					<span class="next-pill">Next up</span>
					<div class="min-w-0 flex-1">
						{#if showFeaturedProgramTitle}
							<p class="text-[0.7rem] font-semibold uppercase tracking-wide text-blue-500">
								{featuredUpcoming.program.title}
							</p>
						{/if}
						<p class="text-sm font-semibold leading-snug text-gray-900">{featuredDisplayName}</p>
						<p class="text-xs text-gray-600">{featuredUpcoming.session.date}</p>
						{#if featuredUrgency}
							<p class="text-xs font-semibold text-blue-600">{featuredUrgency}</p>
						{/if}
					</div>
					{#if featuredUpcoming.session.registerUrl}
						<a
							href={featuredUpcoming.session.registerUrl}
							target="_blank"
							rel="noopener"
							class="register-cta"
						>
							Register
							<span aria-hidden="true">→</span>
						</a>
					{/if}
				</div>
			{:else}
				<h1 class="text-1xl font-extrabold tracking-tight text-gray-900">
					Applying AI leadership skills.<br />
				</h1>
			{/if}
		</div>

		<!-- Right: portrait with name below -->
		<div class="flex flex-shrink-0 flex-col items-center">
			<img
				src="/images/bill.jpg"
				alt="Bill Raymond"
				class="h-16 w-16 rounded-2xl border border-gray-200 object-cover shadow-xl"
			/>
			<div class="mt-2 text-center leading-tight">
				<span class="block text-xs font-semibold text-gray-900">Bill Raymond</span>
				<span class="block text-[0.68rem] font-medium text-gray-500">Founder, Cambermast LLC</span>
			</div>
		</div>
	</div>
</section>

<!-- Add podcast and newsletter buttons -->
<div class="mt-6 flex flex-wrap justify-center gap-3.5">
	<a
		href="https://billtalksai.com/"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
	>
		<span class="md:hidden">📰 Newsletter</span>
		<span class="hidden md:inline">📰 The Bill Talks AI Newsletter</span>
	</a>
	<a
		href="https://agileinaction.com/"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-gray-800"
	>
		<span class="md:hidden">🎙️ Podcast</span>
		<span class="hidden md:inline">🎙️ The Agile in Action Podcast</span>
	</a>
	<a
		href="https://youtube.com/@bill-raymond"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-red-700"
	>
		<span class="md:hidden">▶️ YouTube</span>
		<span class="hidden md:inline">▶️ Bill on YouTube</span>
	</a>
	<a
		href="/contact"
		class="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-emerald-700"
	>
		<span class="md:hidden">✉️ Contact</span>
		<span class="hidden md:inline">✉️ Contact Bill</span>
	</a>
	<a
		href="https://www.linkedin.com/in/williamraymond/"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-sky-700"
	>
		<span class="md:hidden">💼 LinkedIn</span>
		<span class="hidden md:inline">💼 Bill on LinkedIn</span>
	</a>
</div>

{#if upcomingCards.length}
	<section class="mx-auto mt-6 w-full px-4">
		<div
			class="mx-auto max-w-5xl rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 shadow-sm"
		>
			<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
				Upcoming sessions and events
			</p>
			<div class="mt-3 overflow-x-auto">
				<div class="flex gap-4 pb-2 pr-1">
					{#each upcomingCards as upcoming (upcoming.program.slug + (upcoming.session.startDate ?? ''))}
						<a
							href={upcoming.session.registerUrl}
							target="_blank"
							rel="noopener"
							class="group session-pill flex min-w-[18rem] max-w-xs flex-col gap-3 rounded-[26px] border border-blue-100 bg-white/80 px-5 py-4 text-left transition hover:-translate-y-1.5 hover:border-blue-200 hover:bg-white/95"
						>
							{#if upcoming.showProgramTitle}
								<span class="session-pill__program">{upcoming.program.title}</span>
							{/if}
							<div class="flex flex-col gap-1">
								<p class="session-pill__name">{upcoming.displayName}</p>
								<p class="session-pill__meta">{upcoming.session.date}</p>
								{#if upcoming.session.time}
									<p class="session-pill__meta">{upcoming.session.time}</p>
								{/if}
								{#if upcoming.session.location}
									<p class="session-pill__meta">{upcoming.session.location}</p>
								{/if}
								{#if upcoming.session.partner}
									<p class="session-pill__partner">{upcoming.session.partner}</p>
								{/if}
								{#if upcoming.session.spots}
									<p class="session-pill__spots">{upcoming.session.spots}</p>
								{/if}
							</div>
							<div class="mt-auto flex items-center justify-between gap-3 pt-2">
								{#if upcoming.urgency}
									<span class="session-pill__urgency">{upcoming.urgency}</span>
								{:else if upcoming.session.spots}
									<span class="session-pill__urgency session-pill__urgency--muted">
										{upcoming.session.spots}
									</span>
								{:else}
									<span class="session-pill__urgency session-pill__urgency--muted">
										Open for registration
									</span>
								{/if}
								<span class="session-pill__cta">
									Register
									<span class="register-arrow" aria-hidden="true">→</span>
								</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Cards rendered from JSON (label + headline only) -->
<section class="mt-9 grid gap-5 md:grid-cols-3">
	{#each sections as s}
		<Card
			icon={s.icon}
			label={s.label}
			headline={s.headline}
			testimonial={s.testimonial}
			author={s.author}
			route={s.route}
			testimonialCta={s.testimonialCta}
		/>
	{/each}
</section>
<!-- Add a section break line -->
<hr class="my-10 border-gray-300" />
<!-- Upcoming events embed -->
<section class="mt-10 flex flex-col items-center px-3.5">
	<h2 class="mb-3 text-center text-2xl font-bold text-gray-900">
		Bill's Upcoming Training and Speaking Events
	</h2>
	<div class="mb-5 flex justify-center">
		<a
			href="https://luma.com/BillTalksAI?k=c"
			target="_blank"
			rel="noopener"
			class="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
		>
			View Events on Lu.ma
		</a>
	</div>
	<div class="w-full max-w-5xl overflow-hidden rounded-lg shadow-sm">
		<iframe
			title="Bill Talks AI upcoming events calendar"
			src="https://luma.com/embed/calendar/cal-WiCb89B8ouz3ZFH/events"
			class="h-[560px] w-full"
			loading="lazy"
			frameborder="0"
			style="border: 1px solid #bfcbda88; border-radius: 4px;"
			allowfullscreen
		></iframe>
	</div>
</section>
<!-- Add a section break line -->
<hr class="my-10 border-gray-300" />
<!-- Microsoft Project Server Service-->
<section>
	<div class="mt-10 flex flex-col items-center">
		<h2 class="text-1xl mb-3 font-bold text-gray-900">
			Are you a Microsoft Project Server customer?
		</h2>
		<p class="mb-5 max-w-xl text-center text-gray-700">
			Did you know that Bill Raymond wrote the book on Microsoft Project Server? Microsoft stopped
			supporting it, but you may still be using this beloved product. Cambermast partners with
			<a class="inline-link" href="https://projecthosts.com">ProjectHosts</a> to provide hosting and
			support for Microsoft Project Server.
		</p>

		<!-- svelte-ignore a11y_consider_explicit_label -->
		<p>
			<a
				href="https://cambermast.com/services/microsoft-project-server/"
				target="_blank"
				rel="noopener"
				class="text-1xl rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-green-700"
				>Learn More ></a
			>
		</p>
	</div>
</section>

<style>
	.inline-link {
		color: #2563eb;
		font-weight: 600;
		text-decoration: underline;
		text-decoration-thickness: 0.08em;
		text-underline-offset: 0.2em;
		transition: color 0.2s ease-in-out;
	}

	.inline-link:hover {
		color: #1d4ed8;
	}

	.inline-link:focus-visible {
		outline: 2px solid #1d4ed8;
		outline-offset: 2px;
	}

	.shadow-hero {
		box-shadow: 0 18px 45px rgba(37, 99, 235, 0.18);
		backdrop-filter: blur(12px);
	}

	.next-pill {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.85rem;
		border-radius: 999px;
		background: rgba(37, 99, 235, 0.1);
		color: #1d4ed8;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		animation: pillGlow 8s ease-in-out infinite;
	}

	.next-pill::before {
		content: '';
		display: inline-block;
		height: 0.55rem;
		width: 0.55rem;
		border-radius: 999px;
		background: #2563eb;
		box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.35);
		animation: pulseDot 2.6s ease-out infinite;
	}

	.register-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 1rem;
		border-radius: 999px;
		background: #2563eb;
		color: #fff;
		font-size: 0.75rem;
		font-weight: 700;
		text-decoration: none;
		box-shadow: 0 16px 30px rgba(37, 99, 235, 0.28);
		transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	.register-cta span {
		display: inline-block;
		animation: arrowNudge 2s ease-in-out infinite;
	}

	.register-cta:hover {
		background: #1e40af;
		transform: translateY(-3px);
		box-shadow: 0 20px 35px rgba(30, 64, 175, 0.35);
	}

	.register-cta:hover span {
		transform: translateX(5px);
		animation-play-state: paused;
	}

	.session-pill {
		position: relative;
		overflow: hidden;
		background-image: linear-gradient(
			135deg,
			rgba(219, 234, 254, 0.6),
			#ffffff 45%,
			rgba(191, 219, 254, 0.4)
		);
		background-size: 180% 180%;
		box-shadow: 0 16px 32px rgba(37, 99, 235, 0.12);
		backdrop-filter: blur(12px);
		animation: cardGlow 18s ease-in-out infinite;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease,
			border-color 0.25s ease,
			background-position 1.4s ease;
	}

	.session-pill:hover {
		box-shadow: 0 20px 44px rgba(37, 99, 235, 0.22);
		background-position: 100% 50%;
	}

	.session-pill__program {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #1e3a8a;
		background: rgba(191, 219, 254, 0.35);
		border-radius: 999px;
		padding: 0.2rem 0.6rem;
	}

	.session-pill__name {
		font-size: 1rem;
		font-weight: 700;
		color: #111827;
		line-height: 1.3;
	}

	.session-pill__meta {
		font-size: 0.8rem;
		color: #4b5563;
	}

	.session-pill__partner {
		font-size: 0.75rem;
		color: #374151;
		font-style: italic;
	}

	.session-pill__spots {
		font-size: 0.75rem;
		color: #1f2937;
		font-weight: 600;
	}

	.session-pill__urgency {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		background: rgba(37, 99, 235, 0.12);
		color: #1d4ed8;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.01em;
	}

	.session-pill__urgency::before {
		content: '';
		height: 0.4rem;
		width: 0.4rem;
		border-radius: 999px;
		background: #1d4ed8;
		box-shadow: 0 0 0 0 rgba(29, 78, 216, 0.4);
		animation: pulseDot 2.8s ease-out infinite;
	}

	.session-pill__urgency--muted {
		background: rgba(191, 219, 254, 0.32);
		color: #1f2937;
	}

	.session-pill__urgency--muted::before {
		display: none;
	}

	.session-pill__cta {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		background: rgba(37, 99, 235, 0.18);
		color: #1e40af;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease;
	}

	.group:hover .session-pill__cta {
		background: #2563eb;
		color: #fff;
		transform: translateX(2px);
	}

	.register-arrow {
		display: inline-block;
		animation: arrowNudge 2.4s ease-in-out infinite;
	}

	.group:hover .register-arrow {
		transform: translateX(4px);
		animation-play-state: paused;
	}

	@keyframes pillGlow {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
			background: rgba(37, 99, 235, 0.11);
		}
		50% {
			box-shadow: 0 0 30px 8px rgba(180, 198, 252, 0.55);
			background: rgba(37, 99, 235, 0.16);
		}
	}

	@keyframes pulseDot {
		0% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.35);
		}
		70% {
			transform: scale(1.05);
			box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
		}
		100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
		}
	}

	@keyframes arrowNudge {
		0%,
		100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(4px);
		}
	}

	@keyframes cardGlow {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.next-pill,
		.next-pill::before,
		.register-cta span,
		.register-arrow,
		.session-pill,
		.session-pill__urgency::before {
			animation: none !important;
		}
		.register-cta:hover span,
		.group:hover .register-arrow,
		.group:hover .session-pill__cta {
			transform: none;
		}
	}
</style>
