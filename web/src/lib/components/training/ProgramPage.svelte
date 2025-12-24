<script lang="ts">
	import ReviewCard from '$lib/components/ReviewCard.svelte';
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
		isSessionUpcoming,
		normalizeToday
	} from '$lib/data/training/session-utils';

	type BackLink = {
		href: string;
		label: string;
	};

	export let program: TrainingProgram;
	export let backLink: BackLink | undefined = undefined;

	const getFaqAnswers = (faq: TrainingFaq): string[] =>
		faq.answers ?? (faq.answer ? [faq.answer] : []);

	let statsBeforeCta: TrainingStat[] = [];
	let statsAfterCta: TrainingStat[] = [];
	let ctaInsertIndex = -1;
	const today = normalizeToday();
	let visibleSessions: TrainingSession[] = [];
	let registerableSessions: TrainingSession[] = [];
	let featuredRegistrationSession: TrainingSession | undefined;

	const normalizeLabel = (label?: string): string | undefined => label?.toLowerCase().trim();
	const scheduleTeamLabel = 'schedule your team';
	const isScheduleTeamLabel = (label?: string): boolean => normalizeLabel(label) === scheduleTeamLabel;

	$: {
		const stats = program?.stats ?? [];
		ctaInsertIndex = stats.findIndex(
			(stat) => normalizeLabel(stat.label) === 'cost'
		);
		statsBeforeCta = ctaInsertIndex >= 0 ? stats.slice(0, ctaInsertIndex + 1) : stats;
		statsAfterCta = ctaInsertIndex >= 0 ? stats.slice(ctaInsertIndex + 1) : [];
	}

	$: visibleSessions =
		program?.sessions?.filter((session) => {
			if (isSessionDraft(session)) return false;
			return session.startDate ? isSessionUpcoming(session, today) : true;
		}) ?? [];

	$: registerableSessions = visibleSessions.filter((session) =>
		hasExternalRegistration(session)
	);

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
				{#if featuredRegistrationSession}
					<a
						href={featuredRegistrationSession.registerUrl}
						class="register-pill mt-4 inline-flex items-center gap-3 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
					>
						<span class="register-pill__pulse" aria-hidden="true"></span>
						<span class="flex flex-col leading-tight text-left">
							<span class="text-xs font-medium uppercase tracking-wide text-blue-100"
								>Next public cohort</span
							>
							<span class="text-sm font-semibold text-white">{featuredRegistrationSession.date}</span>
						</span>
						<span class="text-sm font-semibold text-white">Register now ↗</span>
					</a>
				{/if}
				<h1 class="mt-1.5 text-4xl font-bold text-gray-900">{program.title}</h1>
				{#if program.nickname}
					<p class="mt-1 text-sm font-medium text-blue-600">{program.nickname}</p>
				{/if}
				<p class="mt-5 text-lg text-gray-700">{program.tagline}</p>
				<p class="mt-2.5 text-base text-gray-600">{program.description}</p>
				{#if program.secondaryDescription}
					<p class="mt-2.5 text-base text-gray-600">{program.secondaryDescription}</p>
				{/if}
				<div class="mt-6 flex flex-wrap gap-2.5">
					<a
						href={program.primaryCta.url}
						class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-base font-semibold text-white shadow transition hover:bg-blue-700"
						class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
					>
						{program.primaryCta.label}
					</a>
					<a
						href={program.secondaryCta.url}
						class="inline-flex items-center justify-center rounded-xl border border-blue-200 px-5 py-2.5 text-base font-semibold text-blue-700 transition hover:border-blue-500 hover:text-blue-900"
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
					class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
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
							Register now ↗
						</a>
					{/if}
				{/each}
			</ul>
			{#if program.primaryCta && ctaInsertIndex >= 0}
				<a
					href={program.primaryCta.url}
					class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
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

	{#if visibleSessions.length}
		<section class="rounded-2xl border border-blue-100 bg-white p-5 shadow">
			<h2 class="text-2xl font-semibold text-gray-900">Upcoming dates</h2>
			<div class="mt-3.5 grid gap-3 md:grid-cols-2">
				{#each visibleSessions as session ((session.registerUrl ?? '') + session.name + session.date)}
					<div class="flex h-full flex-col justify-between rounded-xl border border-gray-100 bg-gray-50 p-3.5">
						<div>
							<p class="text-sm font-semibold text-gray-900">{session.name}</p>
							<p class="mt-0.5 text-sm text-gray-700">{session.date}</p>
							{#if session.time}
								{#if Array.isArray(session.time)}
									<div class="mt-0.5 space-y-1 text-xs text-gray-500">
										{#each session.time as timeEntry}
											<p>{timeEntry}</p>
										{/each}
									</div>
								{:else}
									<p class="text-xs text-gray-500">{session.time}</p>
								{/if}
							{/if}
							{#if session.location}
								<p class="text-xs text-gray-500">{session.location}</p>
							{/if}
						</div>
						{#if session.registerUrl}
								<a
									href={session.registerUrl}
									class="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
									class:schedule-team-button={session.registerUrl === '/contact'}
								>
									{session.registerUrl === '/contact' ? 'Schedule your team' : 'Register ↗'}
							</a>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if program.reviews?.length}
		<section class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each program.reviews as review}
				<ReviewCard quote={review.quote} author={review.author} role={review.role} />
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

	{#if program.takeaways?.length || program.sessions?.length}
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
			{#if program.sessions?.length}
				<div class="rounded-2xl bg-white p-5 shadow">
					<h3 class="text-lg font-semibold text-gray-900">Upcoming & private sessions</h3>
					<ul class="mt-3.5 space-y-4">
						{#each program.sessions as session}
							<li class="rounded-xl border border-blue-100 p-3.5">
								<p class="text-sm font-semibold text-gray-900">{session.name}</p>
								<p class="mt-1 text-sm text-gray-600">{session.date}</p>
								{#if session.time}
									{#if Array.isArray(session.time)}
										<div class="mt-0.5 space-y-1 text-sm text-gray-600">
											{#each session.time as timeEntry}
												<p>{timeEntry}</p>
											{/each}
										</div>
									{:else}
										<p class="text-sm text-gray-600">{session.time}</p>
									{/if}
								{/if}
								<p class="mt-1 text-sm text-gray-600">{session.location}</p>
								<p class="mt-1 text-xs uppercase tracking-wide text-blue-600">{session.spots}</p>
								<a
									href={session.registerUrl}
									class="mt-2.5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
									class:schedule-team-button={session.registerUrl === '/contact'}
								>
									{session.registerUrl === '/contact' ? 'Schedule your team' : 'Register ↗'}
								</a>
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
				class="mt-3 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 md:mt-0"
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
				class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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
				<blockquote class="flex h-full flex-col gap-3.5 rounded-2xl bg-white p-5 shadow">
					<p class="text-lg font-medium text-gray-800">“{program.testimonial.quote}”</p>
					<cite class="text-sm font-semibold text-gray-600">{program.testimonial.author}</cite>
					{#if program.primaryCta}
						<a
							href={program.primaryCta.url}
							class="mt-1.5 inline-flex items-center justify-center self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
							class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
						>
							{program.primaryCta.label}
						</a>
					{/if}
				</blockquote>
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
				{#each program.faqs as faq}
					<details class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
						<summary class="cursor-pointer text-lg font-semibold text-gray-900">
							{faq.question}
						</summary>
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
				class="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-700 shadow transition hover:bg-blue-50"
				class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
			>
				{program.primaryCta.label}
			</a>
			<a
				href={program.secondaryCta.url}
				class="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
			>
				{program.secondaryCta.label}
			</a>
		</div>
	</section>
</main>

<style>
	.register-pill {
		position: relative;
	}

	.register-pill__pulse {
		position: relative;
		display: inline-flex;
		height: 0.85rem;
		width: 0.85rem;
		border-radius: 9999px;
		background-color: rgba(255, 255, 255, 0.9);
		box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
		animation: pulse-ring 1.5s infinite;
	}

	@keyframes pulse-ring {
		0% {
			box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
		}
		70% {
			box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
		}
	}

	.register-cta {
		box-shadow: 0 8px 22px rgba(30, 64, 175, 0.18);
	}
</style>
