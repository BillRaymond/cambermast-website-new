<script lang="ts">
	import { onMount } from 'svelte';
	import catalog from '$lib/data/catalog.json';
	import Card from '$lib/components/ServiceCard.svelte';
	import UpcomingSessionsCarousel from '$lib/components/home/UpcomingSessionsCarousel.svelte';
	import {
		listExternalEvents,
		getExternalEventStartTimestamp,
		isExternalEventUpcoming
	} from '$lib/data/external-events';
	import type { ExternalEvent } from '$lib/data/external-events';
	import { listTrainingPrograms } from '$lib/data/training';
	import type { TrainingProgram, TrainingSession } from '$lib/data/training/types';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
import {
	getSessionStartTimestamp,
	hasExternalRegistration,
	isSessionDraft,
	isSessionHappeningNow,
	isSessionUpcoming,
	normalizeToday
} from '$lib/data/training/session-utils';
import { getProgramCertificateText } from '$lib/data/training/program-meta';

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
const endDateFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric'
});

const formatEndLabel = (value?: string): string => {
	if (!value) return 'current cohort';
	const parsed = new Date(value);
	if (Number.isNaN(parsed.valueOf())) return value;
	return endDateFormatter.format(parsed);
};

type UpcomingTrainingEntry = {
	type: 'training';
	program: TrainingProgram;
	session: TrainingSession;
	startTimestamp: number;
	certificateText?: string;
	videoUrl?: string;
};

type UpcomingExternalEntry = {
	type: 'external';
	event: ExternalEvent;
	startTimestamp: number;
};

type UpcomingEntry = UpcomingTrainingEntry | UpcomingExternalEntry;

type HappeningNowCard = {
	id: string;
	programTitle: string;
	sessionLabel: string;
	date: string;
	timeLines: string[];
	location?: string;
	endLabel: string;
	programRoute?: string;
	certificateText?: string;
	videoUrl?: string;
};

const toTimeLines = (value?: string | string[]): string[] =>
	Array.isArray(value) ? value : value ? [value] : [];

const getSessionMeta = (program: TrainingProgram, session: TrainingSession) => {
	const trimmedName = session.name?.trim();
	const sessionLabel =
		trimmedName && trimmedName.length > 0 && trimmedName !== program.title ? trimmedName : null;
	return {
		primaryTitle: program.title,
		sessionLabel
	};
};

const trainingSessionEntries = listTrainingPrograms()
	.flatMap((program: TrainingProgram) =>
		(program.sessions ?? []).map((session) => ({ program, session }))
	)
	.filter(({ session }) => !isSessionDraft(session));

const upcomingTrainingEntries: UpcomingTrainingEntry[] = trainingSessionEntries
	.filter(
		({ session }) =>
			session.startDate &&
			hasExternalRegistration(session) &&
			isSessionUpcoming(session, today) &&
			!isSessionHappeningNow(session, today)
	)
	.map(({ program, session }) => ({
		type: 'training' as const,
		program,
		session,
		startTimestamp: getSessionStartTimestamp(session),
		certificateText: getProgramCertificateText(program),
		videoUrl: program.videoUrl
	}));

const happeningTrainingEntries = trainingSessionEntries.filter(({ session }) =>
	session.startDate ? isSessionHappeningNow(session, today) : false
);

	const upcomingExternalEntries: UpcomingExternalEntry[] = listExternalEvents()
		.filter((event) => isExternalEventUpcoming(event, today))
		.map((event) => ({
			type: 'external' as const,
			event,
			startTimestamp: getExternalEventStartTimestamp(event)
		}));

const upcomingItems: UpcomingEntry[] = [
	...upcomingTrainingEntries,
	...upcomingExternalEntries
].sort((a, b) => a.startTimestamp - b.startTimestamp);

const happeningNowCards: HappeningNowCard[] = happeningTrainingEntries.map(
	({ program, session }, index) => {
		const meta = getSessionMeta(program, session);
		const sessionLabel = meta.sessionLabel ?? session.name ?? program.title;
		return {
			id: `happening-${program.slug}-${session.startDate ?? session.endDate ?? index}`,
			programTitle: program.title,
			sessionLabel,
			date: session.date,
			timeLines: toTimeLines(session.time),
			location: session.location,
			endLabel: formatEndLabel(session.endDate),
			programRoute: program.route,
			certificateText: getProgramCertificateText(program),
			videoUrl: program.videoUrl
		};
	}
);

	const programRoutesWithUpcoming = new Set(
		upcomingTrainingEntries.map(({ program }) => program.route)
	);

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

	const featuredUpcoming = upcomingItems[0];

	const featuredMeta =
		featuredUpcoming && featuredUpcoming.type === 'training'
			? getSessionMeta(featuredUpcoming.program, featuredUpcoming.session)
			: null;

const featuredDisplayName =
		featuredUpcoming?.type === 'training'
			? (featuredMeta?.primaryTitle ?? featuredUpcoming.program.title)
			: (featuredUpcoming?.event.title ?? '');

	const featuredSessionLabel =
		featuredUpcoming?.type === 'training'
			? (featuredMeta?.sessionLabel ?? null)
			: (featuredUpcoming?.event.sessionLabel ?? null);

	const featuredDateLabel =
		featuredUpcoming?.type === 'training'
			? featuredUpcoming.session.date
			: (featuredUpcoming?.event.date ?? '');

	const featuredRegisterUrl =
		featuredUpcoming?.type === 'training'
			? featuredUpcoming.session.registerUrl
			: (featuredUpcoming?.event.registerUrl ?? null);

const featuredUrgency = getUrgencyLabel(featuredUpcoming?.startTimestamp ?? null);

const featuredCertificateText =
	featuredUpcoming?.type === 'training' ? featuredUpcoming.certificateText : undefined;
const featuredVideoUrl =
	featuredUpcoming?.type === 'training' ? featuredUpcoming.videoUrl : undefined;

	const upcomingSlides = upcomingItems.map((entry, index) => {
		if (entry.type === 'training') {
			const meta = getSessionMeta(entry.program, entry.session);
			return {
				id:
					entry.program.slug +
					'-' +
					(entry.session.startDate ?? entry.session.date ?? index.toString(10)),
				programTitle: entry.program.title,
				sessionLabel: meta.sessionLabel,
				date: entry.session.date,
				timeLines: toTimeLines(entry.session.time),
				location: entry.session.location,
				partner: entry.session.partner,
				spots: entry.session.spots,
				urgency: getUrgencyLabel(entry.startTimestamp),
				registerUrl: entry.session.registerUrl,
				image: entry.program.ogImage ?? entry.program.heroImage,
				imageAlt: entry.program.ogImageAlt ?? entry.program.heroImageAlt ?? entry.program.title,
				certificateText: entry.certificateText,
				videoUrl: entry.videoUrl
			};
		}

		return {
			id: entry.event.id,
			programTitle: entry.event.title,
			sessionLabel: entry.event.sessionLabel,
			date: entry.event.date,
			timeLines: entry.event.timeLines,
			location: entry.event.location,
			partner: entry.event.partner,
			spots: entry.event.spots,
			urgency: getUrgencyLabel(entry.startTimestamp),
			registerUrl: entry.event.registerUrl,
			image: entry.event.image,
			imageAlt: entry.event.imageAlt ?? entry.event.title
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

	type ConnectGroup = {
		title: string;
		links: ConnectLink[];
	};

	const connectGroups: ConnectGroup[] = [
		{
			title: 'Talk with Bill',
			links: [
				{
					icon: '🕒',
					label: '30-minute Consultation',
					description: 'You define the topic for 30 minutes with Bill ($100).',
					href: 'https://cal.com/billraymond/30minconsult'
				},
				{
					icon: '🕘',
					label: '60-minute Consultation',
					description: 'You define the topic for 60 minutes with Bill ($200).',
					href: 'https://cal.com/billraymond/60minconsult'
				},
				{
					icon: '✉️',
					label: 'Contact Bill',
					description: 'Start a conversation about training or advisory work.',
					href: '/contact'
				}
			]
		},
		{
			title: 'Follow Bill',
			links: [
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
					icon: '💼',
					label: 'Bill on LinkedIn',
					description: "Follow Bill's updates and professional news.",
					href: 'https://www.linkedin.com/in/williamraymond/'
				}
			]
		}
	];

	const connectMenuButtonId = 'connect-menu-button';
	const connectMenuId = 'connect-menu-panel';
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

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/" />

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
<section class="relative left-1/2 right-1/2 z-10 -mx-[50vw] w-screen overflow-visible bg-blue-50">
	<!-- Removed gradient background, replaced with a subtle blue tint using bg-blue-50 -->

	<div class="relative mx-auto flex max-w-5xl flex-col gap-5 px-5 py-6">
		<div
			class="flex flex-col items-center gap-5 md:flex-row md:flex-wrap md:items-stretch md:justify-center md:gap-6"
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
								<p class="text-xs text-gray-600">{featuredDateLabel}</p>
								{#if featuredUrgency}
									<p class="text-xs font-semibold text-blue-600">{featuredUrgency}</p>
								{/if}
								{#if featuredCertificateText || featuredVideoUrl}
									<div class="mt-1 flex flex-col gap-1 text-[0.7rem] font-semibold text-blue-700">
										{#if featuredCertificateText}
											<p>{featuredCertificateText}</p>
										{/if}
											{#if featuredVideoUrl}
												<a
													href={featuredVideoUrl}
													target="_blank"
													rel="noopener noreferrer"
													class="inline-flex items-center gap-1 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-800"
												>
													Watch the trailer
													<span aria-hidden="true">↗</span>
												</a>
											{/if}
									</div>
								{/if}
							</div>
							{#if featuredRegisterUrl}
								<a
									href={featuredRegisterUrl}
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
			class="shadow-hero grid h-full w-full gap-4 rounded-2xl bg-white/70 px-5 py-4 text-left md:grid-cols-[minmax(0,1fr)_auto] md:grid-rows-[auto_auto] md:items-start md:gap-5"
		>
			<div class="flex flex-col gap-2.5 md:col-start-1 md:row-start-1 md:pr-2">
				<h2 class="text-sm font-semibold uppercase tracking-wide text-blue-500">
					AI leadership in action
				</h2>
				<p class="text-xs text-gray-600">
					Helping you adopt AI responsibly through project management, training, and advisory services.
				</p>
			</div>
					<div class="flex flex-col items-center gap-2 text-center md:col-start-2 md:row-span-2">
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
					<div class="flex w-full justify-center md:col-start-1 md:row-start-2 md:justify-start">
						<div class="relative w-full md:w-max" bind:this={connectMenuContainer}>
							<button
								type="button"
								id={connectMenuButtonId}
								class="flex w-full items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-2 text-[0.9rem] font-semibold text-blue-900 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 md:w-max md:px-4"
								on:click={toggleConnectMenu}
								aria-expanded={connectMenuOpen}
								aria-controls={connectMenuId}
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
									id={connectMenuId}
									class="z-30 mt-3 w-full overflow-hidden rounded-3xl border border-blue-100 bg-white/95 p-3 shadow-2xl backdrop-blur md:absolute md:left-1/2 md:top-full md:mt-2 md:w-[min(26rem,90vw)] md:-translate-x-1/2"
									aria-labelledby={connectMenuButtonId}
								>
									<div class="grid gap-3 sm:grid-cols-2">
										{#each connectGroups as group}
											<div class="rounded-2xl border border-blue-50/70 bg-blue-50/40 p-2.5">
												<p class="text-[0.65rem] font-semibold uppercase tracking-wide text-blue-700">
													{group.title}
												</p>
												<ul class="mt-1.5 space-y-1">
													{#each group.links as link}
														<li>
															<a
																href={link.href}
																target={link.href.startsWith('http') ? '_blank' : undefined}
																rel={link.href.startsWith('http') ? 'noopener' : undefined}
																class={`flex items-start gap-2.5 rounded-2xl px-3 py-2 text-left text-[0.92rem] transition hover:bg-blue-100/60 focus:bg-blue-100/60 focus:outline-none focus:ring-2 focus:ring-blue-200 ${link.highlight ? 'bg-blue-100/60' : ''}`}
																on:click={closeConnectMenu}
															>
																<span class="text-lg leading-none">{link.icon}</span>
																<span class="flex flex-col gap-1">
																	<span class="text-[0.82rem] font-semibold text-gray-900"
																		>{link.label}</span
																	>
																	<span class="text-[0.7rem] text-gray-600"
																		>{link.description}</span
																	>
																</span>
															</a>
														</li>
													{/each}
												</ul>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

{#if upcomingSlides.length}
	<section class="mx-auto mt-6 w-full px-4">
		<div class="sessions-strip mx-auto max-w-5xl px-4 py-4">
			<div
				class="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-blue-600"
			>
				<span class="uppercase">Upcoming sessions and events</span>
				<a
					href="/training/calendar"
					class="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[0.65rem] font-semibold normal-case text-blue-600 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
				>
					View calendar →
				</a>
			</div>
			<div class="mt-4">
				<UpcomingSessionsCarousel slides={upcomingSlides} />
			</div>
		</div>
	</section>
{/if}

{#if happeningNowCards.length}
	<section class="mx-auto mt-6 w-full px-4">
		<div class="happening-strip mx-auto max-w-5xl px-4 py-4">
			<div class="flex flex-col gap-0.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
				<span>Happening now</span>
				<span class="text-[0.7rem] font-normal normal-case text-amber-600">
					These cohorts are currently running; enrollment will open again soon.
				</span>
			</div>
			<div class="mt-4 grid gap-3 md:grid-cols-2">
				{#each happeningNowCards as card (card.id)}
					<article class="rounded-2xl border border-amber-200 bg-white/95 p-4 shadow-sm">
						<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
							{card.programTitle}
						</p>
						<p class="mt-0.5 text-sm font-semibold text-gray-900">{card.sessionLabel}</p>
						<p class="text-xs text-gray-600">{card.date}</p>
						{#if card.timeLines.length}
							<p class="text-xs text-gray-500">{card.timeLines.join(' • ')}</p>
						{/if}
						{#if card.location}
							<p class="text-xs text-gray-500">{card.location}</p>
						{/if}
						{#if card.certificateText || card.videoUrl}
							<div class="mt-2 flex flex-col gap-1 text-[0.65rem] font-semibold text-blue-700">
								{#if card.certificateText}
									<p>{card.certificateText}</p>
								{/if}
								{#if card.videoUrl}
									<a
										href={card.videoUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-800"
									>
										Watch the trailer
										<span aria-hidden="true">↗</span>
									</a>
								{/if}
							</div>
						{/if}
						<div class="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
							Enrollment closed — runs through {card.endLabel}
						</div>
						{#if card.programRoute}
							<a
								href={card.programRoute}
								class="mt-3 inline-flex items-center justify-center rounded-lg border border-blue-200 px-4 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:text-blue-900"
							>
								View program
							</a>
						{/if}
					</article>
				{/each}
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
				href="/services/microsoft-project-server"
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

	.happening-strip {
		position: relative;
		overflow: visible;
		border-radius: 30px;
		padding: 1.5rem 1.25rem;
		border: 1px solid rgba(251, 191, 36, 0.45);
		background: rgba(255, 251, 235, 0.7);
		box-shadow: 0 18px 40px -32px rgba(180, 83, 9, 0.35);
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
		.register-cta span {
			animation: none !important;
		}
		.register-cta:hover span {
			transform: none;
		}
	}
</style>
