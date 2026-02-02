<script lang="ts">
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
	import { listTestimonials, type Testimonial } from '$lib/data/testimonials';
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
	let showLumaEmbed = false;

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

	type SectionTestimonial = {
		quote: string;
		author: string;
		role?: string;
		photoUrl?: string | null;
	};

	type UpcomingSessionCard = {
		id: string;
		programTitle: string;
		sessionTitle?: string;
		date: string;
		timeLines: string[];
		location?: string;
		registerUrl?: string;
	};

		type TrustedByOrg = {
			name: string;
			url: string;
			logoSrc?: string;
			logoAlt?: string;
		};

	type SectionWithUpcoming = { slug: string } & CatalogSection & {
			hasUpcomingSessions: boolean;
			upcomingSessions: UpcomingSessionCard[];
			testimonialRole?: string;
			testimonialPhotoUrl?: string | null;
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

		const trustedBy: TrustedByOrg[] = [
			{ name: 'Microsoft', url: 'https://www.microsoft.com/', logoSrc: '/images/trusted-by/microsoft.png' },
			{ name: 'Digital.ai', url: 'https://digital.ai/', logoSrc: '/images/trusted-by/digital-ai.png' },
			{ name: 'DocuSign', url: 'https://www.docusign.com/', logoSrc: '/images/trusted-by/docusign.png' },
			{ name: 'Acuity Inc.', url: 'https://www.acuityinc.com/', logoSrc: '/images/trusted-by/acuityinc.png' },
			{ name: 'SLB', url: 'https://www.slb.com/', logoSrc: '/images/trusted-by/slb.png' },
			{ name: 'NASA', url: 'https://www.nasa.gov/', logoSrc: '/images/trusted-by/nasa.png' },
			{ name: 'Duke Energy', url: 'https://www.duke-energy.com/', logoSrc: '/images/trusted-by/duke-energy.png' },
			{ name: 'Moen', url: 'https://www.moen.com/', logoSrc: '/images/trusted-by/moen.png' },
			{
				name: 'NYCHA',
				url: 'https://www.nyc.gov/site/nycha/index.page',
				logoSrc: '/images/trusted-by/nycha.png'
			},
			{
				name: 'AI Collective',
				url: 'https://theaicollective.ai/',
				logoSrc: '/images/trusted-by/ai-collective.png',
				logoAlt: 'The AI Collective logo'
			},
			{ name: 'Kaggle', url: 'https://www.kaggle.com/', logoSrc: '/images/trusted-by/kaggle.png' },
			{ name: 'GoSkills', url: 'https://www.goskills.com/', logoSrc: '/images/trusted-by/goskills.png' },
			{ name: 'Help Scout', url: 'https://www.helpscout.com/', logoSrc: '/images/trusted-by/help-scout.png' },
			{
				name: 'The Content Wrangler',
				url: 'https://thecontentwrangler.com/',
				logoSrc: '/images/trusted-by/the-content-wrangler.png'
			},
			{ name: 'Red Hat', url: 'https://www.redhat.com/', logoSrc: '/images/trusted-by/red-hat.png' }
		];

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

	type HappeningTrainingEntry = {
		type: 'happening';
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

	type UpcomingEntry = UpcomingTrainingEntry | HappeningTrainingEntry | UpcomingExternalEntry;

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

	const formatTestimonialRole = (testimonial: Testimonial): string | undefined => {
		if (testimonial.jobTitle && testimonial.company) {
			return `${testimonial.jobTitle}, ${testimonial.company}`;
		}
		return testimonial.jobTitle ?? testimonial.company ?? undefined;
	};

	const sortTestimonials = (a: Testimonial, b: Testimonial): number => {
		const aHasPhoto = Boolean(a.photoUrl);
		const bHasPhoto = Boolean(b.photoUrl);
		if (aHasPhoto !== bHasPhoto) return aHasPhoto ? -1 : 1;
		const aDate = Date.parse(a.createdAt || '') || 0;
		const bDate = Date.parse(b.createdAt || '') || 0;
		return bDate - aDate;
	};

	const buildSectionTestimonial = (routes: string[], fallback?: SectionTestimonial) => {
		if (!routes.length) return fallback;
		const picked = listTestimonials()
			.filter((testimonial) => testimonial.allowPublicUse && routes.includes(testimonial.programRoute))
			.sort(sortTestimonials)[0];
		if (!picked) return fallback;
		return {
			quote: picked.quote,
			author: picked.displayName,
			role: formatTestimonialRole(picked),
			photoUrl: picked.photoUrl ?? undefined
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

	const happeningItems: HappeningTrainingEntry[] = happeningTrainingEntries.map(
		({ program, session }) => ({
			type: 'happening' as const,
			program,
			session,
			startTimestamp: getSessionStartTimestamp(session),
			certificateText: getProgramCertificateText(program),
			videoUrl: program.videoUrl
		})
	);

	const getUpcomingSortKey = (item: UpcomingEntry): { priority: number; timestamp: number } => {
		const priority = item.type === 'happening' ? 1 : 0;
		return { priority, timestamp: item.startTimestamp };
	};

	const upcomingItems: UpcomingEntry[] = [
		...upcomingTrainingEntries,
		...upcomingExternalEntries,
		...happeningItems
	].sort((a, b) => {
		const aKey = getUpcomingSortKey(a);
		const bKey = getUpcomingSortKey(b);
		if (aKey.priority !== bKey.priority) return aKey.priority - bKey.priority;
		return aKey.timestamp - bKey.timestamp;
	});

	const programRoutesWithUpcoming = new Set(
		upcomingTrainingEntries.map(({ program }) => program.route)
	);

	const trainingProgramRoutes = listTrainingPrograms()
		.map((program) => program.route)
		.filter((route): route is string => Boolean(route));

	const upcomingSessionsByRoute = new Map<string, UpcomingSessionCard[]>();

	upcomingTrainingEntries.forEach(({ program, session }, index) => {
		if (!program.route || !session.date) return;
		const trimmedSessionName = session.name?.trim();
		const sessionTitle =
			trimmedSessionName && trimmedSessionName !== program.title ? trimmedSessionName : undefined;
		const entry: UpcomingSessionCard = {
			id: `${program.slug}-${session.startDate ?? session.endDate ?? index}`,
			programTitle: program.title,
			sessionTitle,
			date: session.date,
			timeLines: toTimeLines(session.time),
			location: session.location,
			registerUrl: session.registerUrl ?? undefined
		};
		const existing = upcomingSessionsByRoute.get(program.route) ?? [];
		existing.push(entry);
		upcomingSessionsByRoute.set(program.route, existing);
	});

	const allUpcomingSessions = Array.from(upcomingSessionsByRoute.values()).flat();

	const sectionsWithUpcoming: SectionWithUpcoming[] = sections.map((section) => {
		const itemRoutes = (section.items ?? [])
			.map((item) => item.route)
			.filter((route): route is string => Boolean(route));
		const testimonialFallback = section.testimonial
			? {
					quote: section.testimonial,
					author: section.author ?? 'Cambermast client'
				}
			: undefined;
		const testimonialRoutes = section.slug === 'training' ? trainingProgramRoutes : itemRoutes;
		const testimonial = buildSectionTestimonial(testimonialRoutes, testimonialFallback);
		const upcomingSessions =
			section.slug === 'training'
				? allUpcomingSessions
				: itemRoutes.flatMap((route) => upcomingSessionsByRoute.get(route) ?? []);
		const hasUpcomingSessions =
			upcomingSessions.length > 0 ||
			itemRoutes.some((route) => programRoutesWithUpcoming.has(route)) ||
			(section.slug === 'training' && programRoutesWithUpcoming.size > 0);
		return {
			...section,
			hasUpcomingSessions,
			upcomingSessions,
			testimonial: testimonial?.quote ?? section.testimonial,
			author: testimonial?.author ?? section.author,
			testimonialRole: testimonial?.role,
			testimonialPhotoUrl: testimonial?.photoUrl
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
				videoUrl: entry.videoUrl,
				isHappeningNow: false
			};
		}

		if (entry.type === 'happening') {
			const meta = getSessionMeta(entry.program, entry.session);
			return {
				id:
					entry.program.slug +
					'-happening-' +
					(entry.session.startDate ?? entry.session.date ?? index.toString(10)),
				programTitle: entry.program.title,
				sessionLabel: meta.sessionLabel,
				date: entry.session.date,
				timeLines: toTimeLines(entry.session.time),
				location: entry.session.location,
				partner: entry.session.partner,
				spots: entry.session.spots,
				urgency: 'Enrollment closed',
				registerUrl: entry.session.registerUrl,
				image: entry.program.ogImage ?? entry.program.heroImage,
				imageAlt: entry.program.ogImageAlt ?? entry.program.heroImageAlt ?? entry.program.title,
				certificateText: entry.certificateText,
				videoUrl: entry.videoUrl,
				isHappeningNow: true
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
			imageAlt: entry.event.imageAlt ?? entry.event.title,
			isHappeningNow: false
		};
	});

	const pageMeta = getSeo('/');
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

<section class="mx-auto mt-4 w-full px-4">
	<div class="sessions-strip mx-auto max-w-5xl px-4 py-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div class="flex flex-col gap-1">
				<h1 class="sessions-strip-title text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
					Upcoming sessions & events
				</h1>
				<p class="sessions-strip-subtitle text-sm text-gray-700">
					Register for public cohorts, workshops, and upcoming partner events.
				</p>
			</div>
			<a
				href="/training/calendar"
				class="sessions-strip-link inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
			>
				View calendar →
			</a>
		</div>

		{#if upcomingSlides.length}
			<div class="mt-4">
				<UpcomingSessionsCarousel slides={upcomingSlides} />
			</div>
		{:else}
			<div class="mt-4 rounded-2xl border border-blue-100 bg-white/70 px-4 py-3 text-sm text-gray-700">
				No upcoming sessions are listed right now. Check the calendar for the latest updates.
			</div>
		{/if}
	</div>
</section>

<section class="mx-auto mt-6 w-full px-4">
	<div class="mx-auto max-w-5xl px-4">
		<div class="home-trust-band rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
			<div>
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Trusted by</p>
				<div class="trusted-by-marquee mt-4" aria-label="Trusted by organizations" role="list">
					<div class="trusted-by-track">
						<div class="trusted-by-group">
							{#each trustedBy as org (org.name)}
								<div class="trusted-by-item" role="listitem">
									<a href={org.url} target="_blank" rel="noopener noreferrer" class="trusted-by-link">
										{#if org.logoSrc}
											<img
												src={org.logoSrc}
												alt={org.logoAlt ?? `${org.name} logo`}
												class="trusted-by-logo"
												loading="lazy"
												decoding="async"
											/>
										{:else}
											<span class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700">
												{org.name}
											</span>
										{/if}
									</a>
								</div>
							{/each}
						</div>

						<div class="trusted-by-spacer" aria-hidden="true"></div>

						<div class="trusted-by-group" aria-hidden="true">
							{#each trustedBy as org (org.name + '-duplicate')}
								<div class="trusted-by-item" role="listitem">
									<a
										href={org.url}
										target="_blank"
										rel="noopener noreferrer"
										tabindex="-1"
										class="trusted-by-link"
									>
										{#if org.logoSrc}
											<img
												src={org.logoSrc}
												alt=""
												class="trusted-by-logo"
												loading="lazy"
												decoding="async"
											/>
										{:else}
											<span class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700">
												{org.name}
											</span>
										{/if}
									</a>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="home-trust-cta flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-3">
					<img
						src="/images/bill.jpg"
						alt="Bill Raymond"
						class="home-trust-avatar h-10 w-10 flex-none rounded-2xl border border-gray-200 object-cover"
					/>
					<div class="min-w-0">
						<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
							AI leadership in action
						</p>
						<p class="text-sm font-semibold text-gray-900">Bill Raymond</p>
					</div>
				</div>

				<div class="flex flex-col gap-1 sm:items-end">
					<a
						href="/connect"
						class="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
					>
						Book a consultation
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Cards rendered from JSON (label + headline only) -->
<section class="mt-7 grid items-start gap-4 md:grid-cols-3">
	{#each sectionsWithUpcoming as s}
		<Card
			icon={s.icon}
			label={s.label}
			headline={s.headline}
			testimonial={s.testimonial}
			author={s.author}
			testimonialRole={s.testimonialRole}
			testimonialPhotoUrl={s.testimonialPhotoUrl}
			route={s.route}
			testimonialCta={s.testimonialCta}
			hasUpcomingSessions={s.hasUpcomingSessions}
			upcomingSessions={s.upcomingSessions}
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
	<div class="mb-4 flex justify-center">
		<a
			href="https://luma.com/BillTalksAI?k=c"
			target="_blank"
			rel="noopener"
			class="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
		>
			View Events on Lu.ma
		</a>
	</div>
	<div class="w-full max-w-5xl">
		<div class="luma-teaser rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-700 sm:hidden">
			<p class="font-semibold text-gray-900">Upcoming calendar preview</p>
			<p class="mt-1">
				See Bill's upcoming training and speaking schedule. Tap below to load the full calendar.
			</p>
			<button
				type="button"
				class="mt-3 inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
				aria-expanded={showLumaEmbed}
				aria-controls="luma-calendar-embed"
				on:click={() => {
					showLumaEmbed = !showLumaEmbed;
				}}
			>
				{showLumaEmbed ? 'Hide calendar' : 'Show calendar'}
			</button>
		</div>

		{#if showLumaEmbed}
			<div
				id="luma-calendar-embed"
				class="luma-embed mt-3 w-full overflow-hidden rounded-lg shadow-sm sm:hidden"
			>
				<iframe
					title="Bill Talks AI upcoming events calendar"
					src="https://luma.com/embed/calendar/cal-WiCb89B8ouz3ZFH/events"
					class="h-[420px] w-full"
					loading="lazy"
					frameborder="0"
					style="border: 1px solid #bfcbda88; border-radius: 4px;"
					allowfullscreen
				></iframe>
			</div>
		{/if}

		<div
			id="luma-calendar-embed-desktop"
			class="luma-embed mt-3 hidden w-full overflow-hidden rounded-lg shadow-sm sm:mt-0 sm:block"
		>
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

	.sessions-strip {
		position: relative;
		overflow: visible;
		border-radius: 30px;
		padding: 1.5rem 1.25rem;
		border: 1px solid rgba(148, 197, 253, 0.45);
		background: rgba(226, 237, 255, 0.55);
		box-shadow: 0 22px 44px -40px rgba(30, 64, 175, 0.45);
	}

	.home-trust-band {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.home-trust-cta {
		border-top: 1px solid rgba(226, 232, 240, 0.9);
	}

	.trusted-by-marquee {
		overflow: hidden;
		padding: 0.35rem 0;
	}

	.trusted-by-track {
		display: flex;
		align-items: center;
		width: max-content;
		animation: trusted-by-scroll 110s linear infinite;
		will-change: transform;
		transform: translate3d(0, 0, 0);
	}

	.trusted-by-group {
		display: flex;
		align-items: center;
		gap: 2.5rem;
	}

	.trusted-by-spacer {
		flex: 0 0 2.5rem;
	}

		.trusted-by-item {
			display: flex;
			align-items: center;
			flex: 0 0 auto;
		}

		.trusted-by-link {
			display: flex;
			align-items: center;
			text-decoration: none;
		}

		.trusted-by-link:focus-visible {
			outline: 2px solid rgba(191, 219, 254, 0.9);
			outline-offset: 6px;
			border-radius: 9999px;
		}

	.trusted-by-logo {
		height: 2rem;
		width: auto;
		max-width: 180px;
			object-fit: contain;
			opacity: 0.8;
			filter: grayscale(1);
			transition: opacity 200ms ease, filter 200ms ease;
		}

	.trusted-by-logo:hover {
		opacity: 1;
		filter: grayscale(0);
	}


	@keyframes trusted-by-scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.trusted-by-track {
			animation: none;
			transform: none;
		}
	}

	@media (max-width: 640px) {
		.sessions-strip {
			padding: 1rem;
			border-radius: 22px;
		}

		.sessions-strip-title {
			font-size: 1.05rem;
		}

		.sessions-strip-subtitle {
			font-size: 0.85rem;
		}

		.sessions-strip-link {
			align-self: flex-start;
		}

		.home-trust-band {
			padding: 1rem;
		}

		.home-trust-avatar {
			height: 2.25rem;
			width: 2.25rem;
			border-radius: 0.75rem;
		}

		.luma-teaser button[aria-expanded='true'] {
			background: rgba(219, 234, 254, 0.6);
		}
	}
</style>
