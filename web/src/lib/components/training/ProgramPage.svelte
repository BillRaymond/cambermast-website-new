<script lang="ts">
import ReviewCard from '$lib/components/ReviewCard.svelte';
import SessionCard from '$lib/components/SessionCard.svelte';
import { getEventTypeLabel } from '$lib/data/events';
import type { Event } from '$lib/data/events/types';
import type {
	TrainingFaq,
	TrainingProgram,
	TrainingSession,
	TrainingStat
} from '$lib/data/training/types';
import {
	getSessionStartTimestamp,
	hasExternalRegistration,
	isSessionDraft,
	isSessionHappeningNow,
	isSessionUpcoming,
	normalizeToday
} from '$lib/data/training/session-utils';
import {
	listTestimonialsForSku,
	listTestimonialsForSlug,
	type Testimonial
} from '$lib/data/testimonials';

	type BackLink = {
		href: string;
		label: string;
	};

	export let program: TrainingProgram;
	export let backLink: BackLink | undefined = undefined;
	export let relatedEvents: Event[] = [];

	const getFaqAnswers = (faq: TrainingFaq): string[] =>
		faq.answers ?? (faq.answer ? [faq.answer] : []);

	type ExtendedFaq = TrainingFaq & { __isTrainingTerms?: boolean };

let statsBeforeCta: TrainingStat[] = [];
let statsAfterCta: TrainingStat[] = [];
let ctaInsertIndex = -1;
const today = normalizeToday();
let nonDraftSessions: TrainingSession[] = [];
let upcomingSessions: TrainingSession[] = [];
let happeningSessions: TrainingSession[] = [];
let registerableSessions: TrainingSession[] = [];
let featuredRegistrationSession: TrainingSession | undefined;
let videoEmbedUrl: string | undefined;
let certificateText: string | undefined;
let programTestimonials: Testimonial[] = [];
let faqsWithTerms: ExtendedFaq[] = [];

const trainingTermsFaq: ExtendedFaq = {
	question: 'Where can I review the Training Terms & Conditions?',
	answer: "These answers complement Cambermast's Training Terms & Conditions.",
	__isTrainingTerms: true
};

	const normalizeLabel = (label?: string): string | undefined => label?.toLowerCase().trim();
	const scheduleTeamLabel = 'schedule your team';
	const isScheduleTeamLabel = (label?: string): boolean => normalizeLabel(label) === scheduleTeamLabel;
	const getYouTubeVideoId = (value?: string): string | undefined => {
		if (!value) return undefined;
		try {
			const parsed = new URL(value);
			const host = parsed.hostname.toLowerCase();
			if (host.includes('youtube') || host.includes('youtu.be')) {
				if (host === 'youtu.be') {
					return parsed.pathname.replace('/', '') || undefined;
				}
				if (parsed.pathname.startsWith('/embed/')) {
					return parsed.pathname.split('/')[2];
				}
				if (parsed.pathname === '/watch') {
					return parsed.searchParams.get('v') ?? undefined;
				}
			}
		} catch {
			return undefined;
		}
		return undefined;
	};

	const getVideoEmbedUrl = (value?: string): string | undefined => {
		if (!value) return undefined;
		const youtubeId = getYouTubeVideoId(value);
		if (youtubeId) {
			return `https://www.youtube.com/embed/${youtubeId}`;
		}
		return value;
	};

	const getStatByLabel = (
		stats: TrainingStat[] | undefined,
		targetLabel: string
	): TrainingStat | undefined => stats?.find((stat) => normalizeLabel(stat.label) === targetLabel);

const toStatText = (value?: string | string[]): string | undefined =>
	Array.isArray(value) ? value.join(', ') : value;

const formatTestimonialRole = (testimonial: Testimonial): string => {
	if (testimonial.jobTitle && testimonial.company) {
		return `${testimonial.jobTitle}, ${testimonial.company}`;
	}
	return testimonial.jobTitle ?? testimonial.company ?? '';
};

const toTimeLines = (value?: string | string[]): string[] =>
	Array.isArray(value) ? value : value ? [value] : [];

	$: {
		const stats = program?.stats ?? [];
		ctaInsertIndex = stats.findIndex(
			(stat) => normalizeLabel(stat.label) === 'cost'
		);
		statsBeforeCta = ctaInsertIndex >= 0 ? stats.slice(0, ctaInsertIndex + 1) : stats;
		statsAfterCta = ctaInsertIndex >= 0 ? stats.slice(ctaInsertIndex + 1) : [];
	}

	$: nonDraftSessions =
		program?.sessions?.filter((session) => !isSessionDraft(session)) ?? [];

	const formatSessionDate = (value?: string): string | undefined => {
		if (!value) return undefined;
		const parsed = new Date(value);
		if (Number.isNaN(parsed.valueOf())) return undefined;
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(parsed);
	};

	const getHappeningLabel = (session: TrainingSession): string => {
		const end = formatSessionDate(session.endDate);
		return 'Enrollment closed, running now';
	};

	const isUpcomingSession = (session: TrainingSession): boolean => {
		if (!session.startDate) return true;
		return !isSessionHappeningNow(session, today) && isSessionUpcoming(session, today);
	};

	$: upcomingSessions = nonDraftSessions.filter((session) => isUpcomingSession(session));

	$: happeningSessions = nonDraftSessions.filter((session) =>
		session.startDate ? isSessionHappeningNow(session, today) : false
	);

	$: registerableSessions = upcomingSessions.filter((session) => hasExternalRegistration(session));
	$: videoEmbedUrl = getVideoEmbedUrl(program?.videoUrl);
	$: certificateText = toStatText(getStatByLabel(program?.stats, 'certificate')?.value);
	$: faqsWithTerms = program?.faqs?.length
		? [...program.faqs, trainingTermsFaq]
		: [];

	$: {
		if (!registerableSessions.length) {
			featuredRegistrationSession = undefined;
		} else {
			const sorted = [...registerableSessions].sort(
				(a, b) => getSessionStartTimestamp(a) - getSessionStartTimestamp(b)
			);
			featuredRegistrationSession = sorted[0];
		}
	}

	$: {
		if (!program) {
			programTestimonials = [];
		} else if (program.sku) {
			programTestimonials = listTestimonialsForSku(program.sku);
		} else {
			programTestimonials = listTestimonialsForSlug(program.slug);
		}
	}
</script>

{#if backLink}
	<nav class="mx-auto max-w-5xl px-4 pt-3 pb-1 md:px-6 md:pt-4">
		<a
			href={backLink.href}
			class="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
		>
			<span aria-hidden="true">&larr;</span>
			{backLink.label}
		</a>
	</nav>
{/if}

<main class="mx-auto flex max-w-5xl flex-col gap-12 px-3.5 pb-10 pt-5 md:px-5 md:pt-6">
	<section class="rounded-3xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm md:p-9">
		<div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
			<div class="md:max-w-2xl">
				<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Training Program</p>
				{#if program.sku}
					<p class="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
						({program.sku})
					</p>
				{/if}
				{#if program.heroImage}
					<img
						src={program.heroImage}
						alt={program.heroImageAlt ?? program.title}
						class="mt-5 w-full rounded-2xl border border-blue-100 object-cover"
						loading="lazy"
					/>
				{/if}
				{#if program.slug === 'ai-workshop-for-content-creators'}
					<div class="mt-2 flex flex-col gap-1 text-sm font-semibold text-blue-700">
						{#if program.videoUrl}
							<a
								href={program.videoUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-800"
							>
								🎬 Watch the trailer
								<span aria-hidden="true">↗</span>
							</a>
						{/if}
						<p class="text-xs font-semibold uppercase tracking-wide text-amber-700">
							In partnership with The Content Wrangler
						</p>
					</div>
				{/if}
				<h1 class="mt-1.5 text-4xl font-bold text-gray-900">{program.title}</h1>
				{#if program.nickname}
					<p class="mt-1 text-sm font-medium text-blue-600">{program.nickname}</p>
				{/if}
				{#if registerableSessions.length}
					<div class="mt-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
						<p
							class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600"
						>
							<span class="h-2 w-2 rounded-full bg-blue-500"></span>
							Upcoming dates
						</p>
						<div class="mt-3 grid gap-3">
							{#each registerableSessions as session ((session.registerUrl ?? '') + session.name + session.date)}
								<SessionCard
									title={session.name}
									date={session.date}
									time={session.time}
									location={session.location}
									ctaUrl={session.registerUrl}
									ctaLabel={session.registerUrl === '/contact' ? 'Schedule your team' : 'Register now'}
									scheduleTeam={session.registerUrl === '/contact'}
									tone="upcoming"
								/>
							{/each}
						</div>
					</div>
				{/if}
				<p class="mt-5 text-lg text-gray-700">{program.tagline}</p>
				<p class="mt-2.5 text-base text-gray-600">{program.description}</p>
				{#if program.secondaryDescription}
					<p class="mt-2.5 text-base text-gray-600">{program.secondaryDescription}</p>
				{/if}
				{#if relatedEvents.length}
					<div class="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">
								Related upcoming events
							</p>
							<a
								href="/training/calendar"
								class="text-xs font-semibold text-emerald-700 underline decoration-emerald-200 underline-offset-4"
							>
								View calendar
							</a>
						</div>
						<ul class="mt-3 space-y-3">
							{#each relatedEvents as event}
								<li class="rounded-xl border border-emerald-100 bg-white p-3">
									<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<div class="flex flex-wrap items-center gap-2">
											<span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-600/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-emerald-700">
												<svg viewBox="0 0 24 24" aria-hidden="true" class="h-3 w-3" fill="currentColor">
													<path d="M9 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3zm7 1a1 1 0 011 1v6a5 5 0 01-4 4.9V19h3a1 1 0 110 2H8a1 1 0 110-2h3v-3.1A5 5 0 017 11V5a1 1 0 112 0v6a3 3 0 006 0V5a1 1 0 011-1z" />
												</svg>
												Event
											</span>
											<span class="text-xs font-semibold uppercase tracking-wide text-emerald-600">
												{getEventTypeLabel(event)}
											</span>
											{#if event.draft}
												<span class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-amber-700">
													Draft
												</span>
											{/if}
										</div>
										<p class="text-sm font-semibold text-gray-900">{event.title}</p>
											<p class="text-xs text-gray-600">{event.date}</p>
											{#if event.time}
												<p class="text-xs text-gray-600">{toTimeLines(event.time).join(' · ')}</p>
											{/if}
										</div>
										<div>
											<a
												href={event.registerUrl}
												target="_blank"
												rel="noopener"
												class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
											>
												Register ↗
											</a>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
				{#if program.videoUrl || certificateText}
					<div class="mt-4 space-y-2">
						{#if program.videoUrl}
							<div
								class="w-full overflow-hidden rounded-2xl border border-blue-100 bg-black shadow"
								style="aspect-ratio: 16 / 9;"
							>
								<iframe
									src={videoEmbedUrl}
									title={`Watch ${program.title} overview`}
									class="h-full w-full"
									loading="lazy"
									referrerpolicy="strict-origin-when-cross-origin"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowfullscreen
								></iframe>
							</div>
						{/if}
						<div class="flex flex-col gap-1.5 text-sm font-semibold text-blue-700">
							{#if certificateText}
								<p class="flex items-center gap-2 text-blue-700">
									{certificateText}
								</p>
							{/if}
							{#if program.videoUrl}
								<a
									href={program.videoUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-2 text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-800"
								>
									Watch the trailer
									<span aria-hidden="true">↗</span>
								</a>
							{/if}
						</div>
					</div>
				{/if}
				<div class="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold">
					<a
						href={program.primaryCta.url}
						class="text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
						class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
					>
						{program.primaryCta.label}
					</a>
					<a
						href={program.secondaryCta.url}
						class="text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
					>
						{program.secondaryCta.label}
					</a>
				</div>
			</div>
	{#if program.stats?.length}
		<div class="flex flex-col gap-3.5 rounded-2xl bg-white p-5 shadow md:sticky md:top-6 md:w-64">
			{#if program.primaryCta && ctaInsertIndex < 0}
				<a
					href={program.primaryCta.url}
					class="text-center text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
					class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
				>
					{program.primaryCta.label}
				</a>
			{/if}
			<ul class="grid gap-3">
				{#each statsBeforeCta as stat (stat.label)}
					<li class="rounded-xl border border-blue-100 bg-blue-50 p-3.5">
						<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">{stat.label}</p>
						{#if Array.isArray(stat.value)}
							<ul class="mt-1.5 list-none space-y-1.5 text-sm font-medium text-gray-900">
								{#each stat.value as option}
									<li class="leading-snug">{option}</li>
								{/each}
							</ul>
						{:else}
							<p class="mt-1.5 text-sm font-medium text-gray-900">{stat.value}</p>
						{/if}
					</li>
					{#if featuredRegistrationSession && normalizeLabel(stat.label) === 'cost'}
						<a
							href={featuredRegistrationSession.registerUrl}
							class="register-cta mt-1 block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
						>
							Register now
						</a>
					{/if}
				{/each}
			</ul>
			{#if program.primaryCta && ctaInsertIndex >= 0}
				<a
					href={program.primaryCta.url}
					class="text-center text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
					class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
				>
					{program.primaryCta.label}
				</a>
			{/if}
			{#if statsAfterCta.length}
				<ul class="grid gap-3">
					{#each statsAfterCta as stat (stat.label)}
						<li class="rounded-xl border border-blue-100 bg-blue-50 p-3.5">
							<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">{stat.label}</p>
							{#if Array.isArray(stat.value)}
								<ul class="mt-1.5 list-none space-y-1.5 text-sm font-medium text-gray-900">
									{#each stat.value as option}
										<li class="leading-snug">{option}</li>
									{/each}
								</ul>
							{:else}
								<p class="mt-1.5 text-sm font-medium text-gray-900">{stat.value}</p>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
		</div>
	</section>

	{#if happeningSessions.length}
		<section class="rounded-2xl border border-blue-200 bg-white p-5 shadow">
			<h2 class="text-2xl font-semibold text-gray-900">Happening now</h2>
			<div class="mt-3.5 grid gap-3 md:grid-cols-2">
				{#each happeningSessions as session ((session.registerUrl ?? '') + session.name + session.date)}
					<SessionCard
						title={session.name}
						date={session.date}
						time={session.time}
						location={session.location}
						statusLabel={getHappeningLabel(session)}
						tone="happening"
					/>
				{/each}
			</div>
		</section>
	{/if}

	{#if programTestimonials.length}
		<section class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each programTestimonials as testimonial}
				<ReviewCard
					quote={testimonial.quote}
					author={testimonial.displayName}
					role={formatTestimonialRole(testimonial)}
					photoUrl={testimonial.photoUrl}
				/>
			{/each}
		</section>
	{/if}

	{#if program.audience?.length || program.audienceExamples?.length}
		<section class="grid gap-6 md:grid-cols-2">
			{#if program.audience?.length}
				<div class="rounded-2xl bg-white p-5 shadow">
					<h2 class="text-2xl font-semibold text-gray-900">Who it's for</h2>
					<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
						{#each program.audience as group}
							<li>{group}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if program.audienceExamples?.length}
				<div class="rounded-2xl border border-blue-100 bg-white p-5 shadow">
					<h2 class="text-2xl font-semibold text-gray-900">Designed for people like you</h2>
					<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
						{#each program.audienceExamples as example}
							<li>{example}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}

	{#if program.objectives?.length || program.prerequisites?.length}
		<section class="grid gap-6 md:grid-cols-2">
			{#if program.objectives?.length}
				<div class="rounded-2xl border border-blue-100 bg-blue-50 p-5">
					<h2 class="text-2xl font-semibold text-gray-900">Learning objectives</h2>
					<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-800">
						{#each program.objectives as objective}
							<li>{objective}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if program.prerequisites?.length}
				<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow">
					<h2 class="text-2xl font-semibold text-gray-900">Prerequisites</h2>
					<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
						{#each program.prerequisites as prerequisite}
							<li>{prerequisite}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}

	{#if program.takeaways?.length || registerableSessions.length || happeningSessions.length}
		<section class="grid gap-6 md:grid-cols-2">
			{#if program.takeaways?.length}
				<div class="rounded-2xl border border-blue-100 bg-white p-5 shadow">
					<h2 class="text-2xl font-semibold text-gray-900">Results you can use</h2>
					<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
						{#each program.takeaways as takeaway}
							<li>{takeaway}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if registerableSessions.length}
				<div class="rounded-2xl bg-white p-5 shadow">
					<h3 class="text-lg font-semibold text-gray-900">Upcoming dates</h3>
					<ul class="mt-3.5 space-y-4">
						{#each registerableSessions as session (session.registerUrl + session.date)}
							<li>
								<SessionCard
									title={session.name}
									date={session.date}
									time={session.time}
									location={session.location}
									ctaUrl={session.registerUrl}
									ctaLabel="Register now"
									tone="upcoming"
								/>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}

	{#if program.sessions?.length && program.primaryCta}
		<div class="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 shadow md:flex md:items-center md:justify-between">
			<div class="md:max-w-xl">
				<h3 class="text-xl font-semibold text-gray-900">Lock in your seat</h3>
				<p class="mt-1.5 text-sm text-gray-600">
					Pick the session that fits you best or reach out for a private workshop.
				</p>
			</div>
			<a
				href={program.primaryCta.url}
				class="mt-3 text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900 md:mt-0"
				class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
			>
				{program.primaryCta.label}
			</a>
		</div>
	{/if}

	{#if program.agenda?.length}
		<section class="rounded-3xl bg-white p-6 shadow md:p-8">
			<h2 class="text-2xl font-semibold text-gray-900">Agenda</h2>
			<div class="mt-5 grid gap-5 md:grid-cols-3">
				{#each program.agenda as block}
					<div class="rounded-2xl border border-blue-100 p-4">
						<h3 class="text-lg font-semibold text-blue-700">{block.title}</h3>
						<ul class="bullet-list mt-2.5 space-y-1.5 text-sm text-gray-700">
							{#each block.details as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</section>
		{#if program.primaryCta}
			<div class="mt-5 flex flex-col gap-3.5 rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow md:flex-row md:items-center md:justify-between">
				<div class="md:max-w-xl">
					<h3 class="text-xl font-semibold text-gray-900">Ready to work through this agenda with us?</h3>
					<p class="mt-1.5 text-sm text-gray-600">
						Secure your spot now and get the playbook delivered to your team.
					</p>
				</div>
			<a
				href={program.primaryCta.url}
				class="text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
				class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
			>
				{program.primaryCta.label}
			</a>
			</div>
		{/if}
	{/if}

	{#if program.resources?.length || program.testimonial}
		<section class="grid gap-6 md:grid-cols-2">
			{#if program.resources?.length}
				<div class="rounded-2xl border border-blue-100 bg-blue-50 p-5">
					<h2 class="text-2xl font-semibold text-gray-900">Included in the workshop</h2>
					<ul class="bullet-list mt-3.5 space-y-2.5 text-gray-700">
						{#each program.resources as resource}
							<li>{resource}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if program.testimonial}
				<div class="flex h-full flex-col gap-3.5">
					<ReviewCard quote={program.testimonial.quote} author={program.testimonial.author} />
					{#if program.primaryCta}
						<a
							href={program.primaryCta.url}
							class="mt-1.5 inline-flex items-center justify-center self-start text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
							class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
						>
							{program.primaryCta.label}
						</a>
					{/if}
				</div>
			{/if}
		</section>
	{/if}

	{#if program.aboutTrainer}
		<section class="rounded-3xl bg-white p-6 shadow md:p-8">
			<h2 class="text-2xl font-semibold text-gray-900">{program.aboutTrainer.title}</h2>
			<div class="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
				<div class="flex flex-col items-center gap-5 lg:flex-1 lg:flex-row lg:items-start lg:gap-6">
					{#if program.aboutTrainer.photo}
						<img
							src={program.aboutTrainer.photo}
							alt={program.aboutTrainer.photoAlt ?? program.aboutTrainer.name}
							class="h-36 w-36 rounded-3xl border border-blue-100 object-cover shadow-lg"
						/>
					{/if}
					<div class="text-center lg:max-w-xl lg:text-left">
						<p class="text-lg font-semibold text-gray-900">{program.aboutTrainer.name}</p>
						<p class="mt-1 text-sm uppercase tracking-wide text-blue-600">
							{program.aboutTrainer.role}
						</p>
						<p class="mt-3 text-base text-gray-700">{program.aboutTrainer.summary}</p>
					</div>
				</div>
				{#if program.aboutTrainer.highlights?.length}
					<ul class="bullet-list w-full space-y-2.5 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-gray-800 lg:max-w-sm lg:flex-shrink-0">
						{#each program.aboutTrainer.highlights as highlight}
							<li>{highlight}</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>
	{/if}

	{#if program.faqs?.length}
		<section>
			<h2 class="text-2xl font-semibold text-gray-900">Frequently asked questions</h2>
			<div class="mt-5 space-y-4">
				{#each faqsWithTerms as faq}
					<details class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
						<summary class="cursor-pointer text-lg font-semibold text-gray-900">
							{faq.question}
						</summary>
						{#if faq.__isTrainingTerms}
							<div class="mt-3 flex items-start gap-2.5 text-gray-700">
								<span class="mt-0.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
								<p class="text-gray-700">
									These answers complement Cambermast's
									<a class="font-semibold text-blue-600 underline" href="/training/terms"
										>Training Terms &amp; Conditions</a
									>.
								</p>
							</div>
						{:else}
							{#each getFaqAnswers(faq) as answer, index}
								<div
									class="flex items-start gap-2.5 text-gray-700"
									class:mt-3={index === 0}
									class:mt-2={index > 0}
								>
									<span class="mt-0.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
									<p class="whitespace-pre-line text-gray-700">{answer}</p>
								</div>
							{/each}
						{/if}
					</details>
				{/each}
			</div>
		</section>
	{/if}

	<section class="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white md:flex md:items-center md:justify-between md:gap-6 md:p-10">
		<div class="md:max-w-xl">
			<h2 class="text-3xl font-bold">Ready to bring AI clarity to your team?</h2>
			<p class="mt-3 text-lg text-blue-100">
				Schedule your team or talk with Bill to customize the training for your organization.
			</p>
		</div>
		<div class="mt-5 flex flex-col gap-3 md:mt-0">
			<a
				href={program.primaryCta.url}
				class="inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 transition hover:text-blue-100"
				class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
			>
				{program.primaryCta.label}
			</a>
			<a
				href={program.secondaryCta.url}
				class="inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 transition hover:text-blue-100"
			>
				{program.secondaryCta.label}
			</a>
		</div>
	</section>
</main>

<style>
	.register-cta {
		box-shadow: 0 8px 22px rgba(30, 64, 175, 0.18);
	}
</style>
