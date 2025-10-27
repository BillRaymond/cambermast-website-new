<script lang="ts">
	import { onMount } from 'svelte';
	import catalog from '$lib/data/catalog.json';
	import Card from '$lib/components/ServiceCard.svelte';
	import { listTrainingPrograms } from '$lib/data/training';
	import type { TrainingProgram, TrainingSession } from '$lib/data/training/types';
	import { getSeo } from '$lib/seo';
	import {
		getSessionStartTimestamp,
		hasExternalRegistration,
		isSessionUpcoming,
		normalizeToday
	} from '$lib/data/training/session-utils';

	const year = new Date().getFullYear();

	type CatalogItem = {
		id?: string;
		route?: string;
	};

	type CatalogSection = {
		label: string;
		headline: string;
		route?: string;
		icon?: string;
		testimonial?: string;
		testimonialCta?: { href: string; label: string };
		author?: string;
		homeorder?: number;
		items?: CatalogItem[];
	};

	type SectionWithUpcoming = { slug: string } & CatalogSection & {
			hasUpcomingSessions: boolean;
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

	const programRoutesWithUpcoming = new Set(upcomingSessions.map(({ program }) => program.route));

	const sectionsWithUpcoming: SectionWithUpcoming[] = sections.map((section) => {
		const itemRoutes = (section.items ?? [])
			.map((item) => item.route)
			.filter((route): route is string => Boolean(route));
		const hasUpcomingSessions =
			itemRoutes.some((route) => programRoutesWithUpcoming.has(route)) ||
			(section.slug === 'training' && programRoutesWithUpcoming.size > 0);
		return {
			...section,
			hasUpcomingSessions
		};
	});

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
		const sessionLabel =
			trimmedName && trimmedName.length > 0 && trimmedName !== program.title ? trimmedName : null;
		return {
			primaryTitle: program.title,
			sessionLabel
		};
	};

	const featuredUpcoming = upcomingSessions[0];

	const featuredMeta = featuredUpcoming
		? getSessionMeta(featuredUpcoming.program, featuredUpcoming.session)
		: null;

	const featuredDisplayName = featuredMeta?.primaryTitle ?? featuredUpcoming?.program.title ?? '';
	const featuredSessionLabel = featuredMeta?.sessionLabel ?? null;

	const featuredStartTimestamp = featuredUpcoming
		? getSessionStartTimestamp(featuredUpcoming.session)
		: null;

	const featuredUrgency = getUrgencyLabel(featuredStartTimestamp);

	const upcomingCards = upcomingSessions.map((entry) => {
		const meta = getSessionMeta(entry.program, entry.session);
		const startTimestamp = getSessionStartTimestamp(entry.session);
		return {
			...entry,
			sessionLabel: meta.sessionLabel,
			startTimestamp,
			urgency: getUrgencyLabel(startTimestamp)
		};
	});

	const pageMeta = getSeo('/');

	type ConnectLink = {
		icon: string;
		label: string;
		description: string;
		href: string;
		highlight?: boolean;
	};

	const connectLinks: ConnectLink[] = [
		{
			icon: '📰',
			label: 'The Bill Talks AI Newsletter',
			description: 'Weekly insights for AI leaders and practitioners.',
			href: 'https://billtalksai.com/',
			highlight: true
		},
		{
			icon: '🎙️',
			label: 'The Agile in Action Podcast',
			description: 'Listen to expert conversations on modern leadership.',
			href: 'https://agileinaction.com/'
		},
		{
			icon: '▶️',
			label: 'Bill on YouTube',
			description: 'Video walkthroughs and sessions on AI adoption.',
			href: 'https://youtube.com/@bill-raymond'
		},
		{
			icon: '✉️',
			label: 'Contact Bill',
			description: 'Start a conversation about training or advisory work.',
			href: '/contact'
		},
		{
			icon: '💼',
			label: 'Bill on LinkedIn',
			description: "Follow Bill's updates and professional news.",
			href: 'https://www.linkedin.com/in/williamraymond/'
		}
	];

	let connectMenuOpen = false;
	let connectMenuContainer: HTMLDivElement | null = null;

	const closeConnectMenu = () => {
		connectMenuOpen = false;
	};

	const toggleConnectMenu = () => {
		connectMenuOpen = !connectMenuOpen;
	};

	const handleDocumentClick = (event: MouseEvent) => {
		if (!connectMenuOpen || !connectMenuContainer) return;
		const target = event.target as Node | null;
		if (target && connectMenuContainer.contains(target)) return;
		closeConnectMenu();
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			closeConnectMenu();
		}
	};

	onMount(() => {
		document.addEventListener('click', handleDocumentClick);
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('click', handleDocumentClick);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:head>
	<title>{pageMeta.title}</title>
	{#if pageMeta.description}
		<meta name="description" content={pageMeta.description} />
	{/if}

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
<section class="relative left-1/2 right-1/2 z-10 -mx-[50vw] w-screen overflow-visible bg-blue-50">
	<!-- Removed gradient background, replaced with a subtle blue tint using bg-blue-50 -->

	<div class="relative mx-auto flex max-w-5xl flex-col gap-5 px-5 py-6">
		<div
			class="flex flex-col items-center gap-5 md:flex-row md:items-stretch md:justify-center md:gap-6"
		>
			<!-- Left: headline only -->
			<div class="flex w-full flex-col gap-3 md:w-[27.5rem] md:flex-none md:self-stretch">
				{#if featuredUpcoming}
					<div class="shadow-hero flex h-full flex-col gap-3 rounded-2xl bg-white/70 p-3">
						<span class="next-pill self-start">Next up</span>
						<div class="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-6">
							<div class="min-w-0 flex-1">
								<p class="text-sm font-semibold leading-snug text-gray-900">
									{featuredDisplayName}
								</p>
								{#if featuredSessionLabel}
									<p class="text-xs font-medium text-blue-600">{featuredSessionLabel}</p>
								{/if}
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
									class="register-cta shrink-0 self-end md:self-auto"
								>
									Register
									<span aria-hidden="true">↗</span>
								</a>
							{/if}
						</div>
					</div>
				{:else}
					<h1 class="text-1xl font-extrabold tracking-tight text-gray-900">
						Applying AI leadership skills.<br />
					</h1>
				{/if}
			</div>

			<!-- Right: portrait with name below in a matching card -->
			<div
				class="flex flex-shrink-0 flex-col items-center md:w-[27.5rem] md:flex-none md:items-stretch"
			>
				<div
					class="shadow-hero grid h-full w-full gap-4 rounded-2xl bg-white/70 px-5 py-4 text-left md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-5"
				>
					<div class="flex flex-col gap-2.5 md:pr-2">
						<h2 class="text-sm font-semibold uppercase tracking-wide text-blue-500">
							AI leadership in action
						</h2>
						<p class="text-xs text-gray-600">
							Helping you adopt AI responsibly through project management, training, and advisory
							services.
						</p>
						<div class="flex w-full justify-start">
							<div class="relative w-full" bind:this={connectMenuContainer}>
								<button
									type="button"
									class="flex w-full items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-2 text-[0.9rem] font-semibold text-blue-900 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 md:w-max md:px-4"
									on:click={toggleConnectMenu}
									aria-haspopup="true"
									aria-expanded={connectMenuOpen}
								>
									<span class="text-base leading-none">🤝</span>
									<span>Connect with Bill</span>
									<svg
										class="h-4 w-4 text-blue-700 transition-transform"
										class:rotate-180={connectMenuOpen}
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.7a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
											clip-rule="evenodd"
										/>
									</svg>
								</button>
								{#if connectMenuOpen}
									<div
										class="absolute left-1/2 z-30 mt-3 w-[min(18rem,80vw)] -translate-x-1/2 overflow-hidden rounded-3xl border border-blue-100 bg-white/95 p-2 shadow-2xl backdrop-blur md:left-0 md:translate-x-0"
										role="menu"
										aria-label="Connect with Bill"
									>
										{#each connectLinks as link}
											<a
												href={link.href}
												target={link.href.startsWith('http') ? '_blank' : undefined}
												rel={link.href.startsWith('http') ? 'noopener' : undefined}
												class="flex items-start gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
												role="menuitem"
												on:click={closeConnectMenu}
												class:bg-blue-50={link.highlight}
											>
												<span class="text-xl leading-none">{link.icon}</span>
												<span class="flex flex-col gap-1">
													<span class="text-sm font-semibold text-gray-900">{link.label}</span>
													<span class="text-xs text-gray-600">{link.description}</span>
												</span>
											</a>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					</div>
					<div class="flex flex-col items-center gap-2 text-center">
						<img
							src="/images/bill.jpg"
							alt="Bill Raymond"
							class="h-16 w-16 rounded-2xl border border-gray-200 object-cover shadow-xl"
						/>
						<div class="leading-tight">
							<span class="block text-xs font-semibold text-gray-900">Bill Raymond</span>
							<span class="block text-[0.68rem] font-medium text-gray-500"
								>Founder, Cambermast LLC</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

{#if upcomingCards.length}
	<section class="mx-auto mt-6 w-full px-4">
		<div class="sessions-strip mx-auto max-w-5xl px-4 py-4">
			<div class="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-blue-600">
				<span class="uppercase">Upcoming sessions and events</span>
				<a
					href="/training/calendar"
					class="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[0.65rem] font-semibold text-blue-600 normal-case transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
				>
					View calendar →
				</a>
			</div>
			<div class="mt-3 overflow-x-auto overflow-y-visible">
				<div class="flex gap-4 pb-6 pr-1">
					{#each upcomingCards as upcoming, index (upcoming.program.slug + (upcoming.session.startDate ?? ''))}
						<a
							href={upcoming.session.registerUrl}
							target="_blank"
							rel="noopener"
							class="session-pill group flex min-w-[18rem] max-w-xs flex-col gap-3 rounded-[26px] border border-blue-100 bg-white/80 px-5 py-4 text-left transition hover:border-blue-200 hover:bg-white/95"
							style={`--session-stagger: ${index * 90}ms;`}
						>
							<div class="flex flex-col gap-1">
								<p class="session-pill__name">{upcoming.program.title}</p>
								{#if upcoming.sessionLabel}
									<p class="session-pill__tag">{upcoming.sessionLabel}</p>
								{/if}
								<p class="session-pill__meta">{upcoming.session.date}</p>
								{#if upcoming.session.time}
									{#if Array.isArray(upcoming.session.time)}
										{#each upcoming.session.time as timeEntry}
											<p class="session-pill__meta">{timeEntry}</p>
										{/each}
									{:else}
										<p class="session-pill__meta">{upcoming.session.time}</p>
									{/if}
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
								<span class="session-pill__cta"> Register ↗ </span>
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
	{#each sectionsWithUpcoming as s}
		<Card
			icon={s.icon}
			label={s.label}
			headline={s.headline}
			testimonial={s.testimonial}
			author={s.author}
			route={s.route}
			testimonialCta={s.testimonialCta}
			hasUpcomingSessions={s.hasUpcomingSessions}
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

	.sessions-strip {
		position: relative;
		overflow: visible;
		border-radius: 30px;
		padding: 1.5rem 1.25rem;
		border: 1px solid rgba(148, 197, 253, 0.45);
		background: rgba(226, 237, 255, 0.55);
		box-shadow: 0 22px 44px -40px rgba(30, 64, 175, 0.45);
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
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			background 0.2s ease;
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
		background: rgba(255, 255, 255, 0.97);
		box-shadow: 0 10px 24px -20px rgba(15, 23, 42, 0.35);
		backdrop-filter: blur(8px);
		transition:
			box-shadow 0.16s ease,
			border-color 0.16s ease,
			background-color 0.16s ease;
		border-radius: 26px;
		opacity: 0;
		transform: translateY(20px);
		animation: sessionPillFade 0.45s ease-out forwards;
		animation-delay: var(--session-stagger, 0ms);
	}

	.session-pill:hover {
		box-shadow: 0 12px 24px -20px rgba(15, 23, 42, 0.38);
		background-color: rgba(255, 255, 255, 0.99);
	}

	.session-pill__name {
		font-size: 1rem;
		font-weight: 700;
		color: #111827;
		line-height: 1.3;
	}

	.session-pill__tag {
		font-size: 0.75rem;
		font-weight: 600;
		color: #1d4ed8;
		background: rgba(191, 219, 254, 0.35);
		border-radius: 999px;
		padding: 0.25rem 0.6rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		letter-spacing: 0.01em;
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
		text-transform: none;
		letter-spacing: 0.02em;
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

	@keyframes sessionPillFade {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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

	@media (prefers-reduced-motion: reduce) {
		.next-pill,
		.next-pill::before,
		.register-cta span,
		.session-pill__urgency::before {
			animation: none !important;
		}
		.session-pill {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
		}
		.register-cta:hover span,
		.group:hover .session-pill__cta {
			transform: none;
		}
	}
</style>
