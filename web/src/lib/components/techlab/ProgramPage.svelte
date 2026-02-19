<script lang="ts">
	import type { TrainingFaq, TrainingSession, TrainingStat } from '$lib/data/training/types';
	import FaqBlocks from '$lib/components/faq/FaqBlocks.svelte';
	import {
		hasExternalRegistration,
		isSessionDraft,
		isSessionHappeningNow,
		isSessionUpcoming,
		normalizeToday
	} from '$lib/data/training/session-utils';
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import EventCard from '$lib/components/events/EventCard.svelte';
	import type { TechlabProgram } from '$lib/data/techlab/types';
	import {
		listTestimonialsForSku,
		listTestimonialsForSlug,
		type Testimonial
	} from '$lib/data/testimonials';

	export let program: TechlabProgram;
	export let backLink: { href: string; label: string } | undefined = undefined;

	const trainingTermsFaq: TrainingFaq = {
		key: 'training_terms',
		question: 'Where can I review the Training Terms & Conditions?',
		blocks: [
			{
				type: 'paragraph',
				text: "These answers complement Cambermast's Training Terms & Conditions."
			},
			{
				type: 'link',
				label: 'Training Terms & Conditions',
				href: '/training/terms'
			}
		]
	};

	let faqsWithTerms: TrainingFaq[] = [];

	let statsBeforeCta: TrainingStat[] = [];
	let statsAfterCta: TrainingStat[] = [];
	let ctaInsertIndex = -1;
	const today = normalizeToday();
	let registerableSessions: TrainingSession[] = [];
	let programTestimonials: Testimonial[] = [];

	const normalizeLabel = (label?: string): string | undefined => label?.toLowerCase().trim();
	const scheduleTeamLabel = 'schedule your team';
	const isScheduleTeamLabel = (label?: string): boolean =>
		normalizeLabel(label) === scheduleTeamLabel;

	const formatTestimonialRole = (testimonial: Testimonial): string => {
		if (testimonial.jobTitle && testimonial.company) {
			return `${testimonial.jobTitle}, ${testimonial.company}`;
		}
		return testimonial.jobTitle ?? testimonial.company ?? '';
	};

	$: {
		const stats = program?.stats ?? [];
		ctaInsertIndex = stats.findIndex((stat) => normalizeLabel(stat.label) === 'cost');
		statsBeforeCta = ctaInsertIndex >= 0 ? stats.slice(0, ctaInsertIndex + 1) : stats;
		statsAfterCta = ctaInsertIndex >= 0 ? stats.slice(ctaInsertIndex + 1) : [];
	}

	$: {
		const sessions = program?.sessions?.filter((session) => !isSessionDraft(session)) ?? [];
		registerableSessions = sessions.filter(
			(session) =>
				session.startDate &&
				hasExternalRegistration(session) &&
				isSessionUpcoming(session, today) &&
				!isSessionHappeningNow(session, new Date())
		);
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

	$: faqsWithTerms = program?.faqs?.length ? [...program.faqs, trainingTermsFaq] : [];
</script>

{#if backLink}
	<nav class="tlp-breadcrumb">
		<a href={backLink.href} class="tlp-back">
			<span aria-hidden="true">←</span>
			{backLink.label}
		</a>
	</nav>
{/if}

<article class="tlp-shell">
	<section class="tlp-hero">
		<div class="tlp-hero__text">
			<p class="tlp-eyebrow">TechLAB × Cambermast</p>
			<h1>{program.title}</h1>
			{#if program.nickname}
				<p class="tlp-subtitle">{program.nickname}</p>
			{/if}
			<p class="tlp-lead">{program.tagline}</p>
			<p class="tlp-body">{program.description}</p>
			{#if program.secondaryDescription}
				<p class="tlp-body">{program.secondaryDescription}</p>
			{/if}
			<div class="tlp-ctas">
				<a
					class="tlp-btn tlp-btn--primary"
					href={program.primaryCta.url}
					class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
				>
					{program.primaryCta.label}
				</a>
				<a class="tlp-btn tlp-btn--ghost" href={program.secondaryCta.url}>
					{program.secondaryCta.label}
				</a>
			</div>
			<div class="tlp-meta">
				<span>Led by Bill Raymond</span>
				<span class="tlp-dot" aria-hidden="true"></span>
				<span>Official TechLAB program</span>
			</div>
		</div>
		<div class="tlp-hero__panel">
			{#if program.heroImage}
				<img
					src={program.heroImage}
					alt={program.heroImageAlt ?? program.title}
					class="tlp-hero__image"
					loading="lazy"
				/>
			{/if}
			{#if program.stats?.length}
				<div class="tlp-stat-grid">
					{#each statsBeforeCta as stat (stat.label)}
						<div class="tlp-stat">
							<p class="tlp-stat__label">{stat.label}</p>
							{#if Array.isArray(stat.value)}
								<ul class="tlp-stat__list">
									{#each stat.value as option}
										<li>{option}</li>
									{/each}
								</ul>
							{:else}
								<p class="tlp-stat__value">{stat.value}</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	{#if program.stats?.length && program.primaryCta && ctaInsertIndex >= 0}
		<div class="tlp-panel tlp-panel--inline">
			<div>
				<p class="tlp-eyebrow tlp-eyebrow--small">Ready to plan</p>
				<h3 class="tlp-panel__title">Lock in your team’s session</h3>
				<p class="tlp-body">
					Set dates, pick the delivery format, and tailor examples to your workflows.
				</p>
			</div>
			<a
				class="tlp-btn tlp-btn--primary"
				href={program.primaryCta.url}
				class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
			>
				{program.primaryCta.label}
			</a>
		</div>
	{/if}

	{#if statsAfterCta.length}
		<section class="tlp-panel">
			<h2 class="tlp-section-title">What to expect</h2>
			<div class="tlp-stat-grid tlp-stat-grid--wide">
				{#each statsAfterCta as stat (stat.label)}
					<div class="tlp-stat">
						<p class="tlp-stat__label">{stat.label}</p>
						{#if Array.isArray(stat.value)}
							<ul class="tlp-stat__list">
								{#each stat.value as option}
									<li>{option}</li>
								{/each}
							</ul>
						{:else}
							<p class="tlp-stat__value">{stat.value}</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if registerableSessions.length}
		<section class="tlp-panel">
			<h2 class="tlp-section-title">Upcoming dates</h2>
			<div class="tlp-session-grid">
				{#each registerableSessions as session ((session.registerUrl ?? '') + session.name + session.date)}
					<EventCard
						title={session.name}
						date={session.date}
						time={session.time}
						location={session.location}
						typeLabel="Training"
						registerUrl={session.registerUrl}
						registerLabel="Register ↗"
						tone="upcoming"
					/>
				{/each}
			</div>
		</section>
	{/if}

	{#if program.objectives?.length || program.prerequisites?.length}
		<section class="tlp-panel tlp-panel--split">
			{#if program.objectives?.length}
				<div>
					<h2 class="tlp-section-title">What you’ll learn</h2>
					<ul class="tlp-list">
						{#each program.objectives as objective}
							<li>{objective}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if program.prerequisites?.length}
				<div class="tlp-panel__side">
					<h3 class="tlp-section-subtitle">Prerequisites</h3>
					<ul class="tlp-list">
						{#each program.prerequisites as prerequisite}
							<li>{prerequisite}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}

	{#if program.takeaways?.length}
		<section class="tlp-panel">
			<h2 class="tlp-section-title">Results you can use</h2>
			<ul class="tlp-grid-list">
				{#each program.takeaways as takeaway}
					<li>{takeaway}</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if program.agenda?.length}
		<section class="tlp-panel">
			<h2 class="tlp-section-title">Agenda</h2>
			<div class="tlp-agenda">
				{#each program.agenda as block}
					<div class="tlp-agenda__item">
						<p class="tlp-agenda__title">{block.title}</p>
						<ul class="tlp-list tlp-list--compact">
							{#each block.details as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if program.resources?.length || program.testimonial}
		<section class="tlp-panel tlp-panel--split">
			{#if program.resources?.length}
				<div>
					<h2 class="tlp-section-title">Included in this workshop</h2>
					<ul class="tlp-list">
						{#each program.resources as resource}
							<li>{resource}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if program.testimonial}
				<ReviewCard quote={program.testimonial.quote} author={program.testimonial.author} />
			{/if}
		</section>
	{/if}

	{#if programTestimonials.length}
		<section class="tlp-panel">
			<h2 class="tlp-section-title">What learners are saying</h2>
			<div class="tlp-review-grid">
				{#each programTestimonials as testimonial}
					<ReviewCard
						quote={testimonial.quote}
						author={testimonial.displayName}
						role={formatTestimonialRole(testimonial)}
						photoUrl={testimonial.photoUrl}
					/>
				{/each}
			</div>
		</section>
	{/if}

	{#if program.aboutTrainer}
		<section class="tlp-panel tlp-panel--split">
			<div>
				<h2 class="tlp-section-title">{program.aboutTrainer.title}</h2>
				<div class="tlp-trainer">
					{#if program.aboutTrainer.photo}
						<img
							src={program.aboutTrainer.photo}
							alt={program.aboutTrainer.photoAlt ?? program.aboutTrainer.name}
							class="tlp-trainer__photo"
						/>
					{/if}
					<div>
						<p class="tlp-trainer__name">{program.aboutTrainer.name}</p>
						<p class="tlp-trainer__role">{program.aboutTrainer.role}</p>
						<p class="tlp-body">{program.aboutTrainer.summary}</p>
					</div>
				</div>
			</div>
			{#if program.aboutTrainer.highlights?.length}
				<ul class="tlp-list">
					{#each program.aboutTrainer.highlights as highlight}
						<li>{highlight}</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}

	{#if program.faqs?.length}
		<section class="tlp-panel">
			<h2 class="tlp-section-title">Frequently asked questions</h2>
			<div class="tlp-faqs">
				{#each faqsWithTerms as faq}
					<details class="tlp-faq">
						<summary>{faq.question}</summary>
						<FaqBlocks blocks={faq.blocks} />
					</details>
				{/each}
			</div>
		</section>
	{/if}

	<section class="tlp-cta">
		<div>
			<p class="tlp-eyebrow tlp-eyebrow--small">Next step</p>
			<h2>Bring this program to your team</h2>
			<p class="tlp-body">
				Set a date, tailor scenarios to your workflows, and deliver AI outcomes with TechLAB and
				Cambermast.
			</p>
		</div>
		<div class="tlp-ctas">
			<a
				class="tlp-btn tlp-btn--primary"
				href={program.primaryCta.url}
				class:schedule-team-button={isScheduleTeamLabel(program.primaryCta?.label)}
			>
				{program.primaryCta.label}
			</a>
			<a class="tlp-btn tlp-btn--ghost" href={program.secondaryCta.url}>
				{program.secondaryCta.label}
			</a>
		</div>
	</section>
</article>

<style>
	.tlp-shell {
		max-width: 1080px;
		margin: 0 auto 4rem;
		padding: 1rem 1.25rem 0;
		font-family: 'Lato', 'Open Sans', 'Helvetica Neue', Arial, sans-serif;
		color: #0d1a2b;
	}

	.tlp-breadcrumb {
		max-width: 1080px;
		margin: 1rem auto 0;
		padding: 0 1.25rem;
	}

	.tlp-back {
		color: #0b6fbf;
		font-weight: 700;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.tlp-hero {
		display: grid;
		grid-template-columns: 1.2fr 0.8fr;
		gap: 1.25rem;
		background: linear-gradient(135deg, #0d1a2b 0%, #0b6fbf 70%, #0da7dc 100%);
		color: #ffffff;
		padding: 1.5rem;
		border-radius: 22px;
		box-shadow: 0 22px 48px -24px rgba(13, 26, 43, 0.55);
	}

	.tlp-hero__text h1 {
		margin: 0.35rem 0 0.5rem;
		font-size: clamp(2rem, 2.9vw, 2.4rem);
		letter-spacing: -0.01em;
	}

	.tlp-eyebrow {
		text-transform: uppercase;
		font-weight: 800;
		letter-spacing: 0.08em;
		font-size: 0.75rem;
		color: #b8dfff;
		margin: 0;
	}

	.tlp-eyebrow--small {
		color: #0b6fbf;
	}

	.tlp-subtitle {
		margin: 0 0 0.35rem;
		font-weight: 700;
		color: #e5f1fb;
	}

	.tlp-lead {
		font-size: 1.05rem;
		line-height: 1.6;
		color: #ddebfa;
		margin: 0 0 0.4rem;
	}

	.tlp-body {
		color: #e5f0fa;
		line-height: 1.55;
		margin: 0 0 0.6rem;
	}

	.tlp-ctas {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin: 0.8rem 0;
	}

	.tlp-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 1.05rem;
		border-radius: 12px;
		font-weight: 800;
		text-decoration: none;
		font-size: 0.98rem;
	}

	.tlp-btn--primary {
		background: #00a5e3;
		color: #0d1a2b;
		border: 1px solid #00a5e3;
		box-shadow: 0 12px 30px -16px rgba(0, 165, 227, 0.7);
	}

	.tlp-btn--primary:hover {
		background: #00b5ff;
	}

	.tlp-btn--ghost {
		background: rgba(255, 255, 255, 0.12);
		color: #e5f0fa;
		border: 1px solid rgba(255, 255, 255, 0.25);
	}

	.tlp-btn--ghost:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.tlp-meta {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		flex-wrap: wrap;
		color: #d7e8f9;
		font-weight: 700;
	}

	.tlp-dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: #8bd3ff;
		display: inline-flex;
	}

	.tlp-hero__panel {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.22);
		border-radius: 18px;
		padding: 1rem;
		backdrop-filter: blur(4px);
	}

	.tlp-hero__image {
		width: 100%;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.35);
		margin-bottom: 0.75rem;
		object-fit: cover;
	}

	.tlp-stat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.65rem;
	}

	.tlp-stat-grid--wide {
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}

	.tlp-stat {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 12px;
		padding: 0.75rem;
		color: #0d1a2b;
		background-color: #ffffff;
	}

	.tlp-stat__label {
		text-transform: uppercase;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		font-weight: 800;
		color: #0b6fbf;
		margin: 0 0 0.35rem;
	}

	.tlp-stat__value {
		margin: 0;
		font-weight: 700;
		color: #0d1a2b;
	}

	.tlp-stat__list {
		list-style: disc;
		margin: 0;
		padding-left: 1.1rem;
		color: #1f2e43;
		display: grid;
		gap: 0.35rem;
		font-weight: 600;
	}

	.tlp-panel {
		background: #ffffff;
		border: 1px solid #e4ecf5;
		border-radius: 18px;
		padding: 1.4rem;
		margin-top: 1.2rem;
		box-shadow: 0 16px 38px -24px rgba(13, 26, 43, 0.45);
	}

	.tlp-panel--inline {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.tlp-panel--split {
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: 1rem;
	}

	.tlp-section-title {
		margin: 0 0 0.75rem;
		letter-spacing: -0.01em;
	}

	.tlp-section-subtitle {
		margin: 0 0 0.5rem;
	}

	.tlp-session-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 0.75rem;
	}


	.tlp-list {
		list-style: disc;
		padding-left: 1.15rem;
		margin: 0;
		display: grid;
		gap: 0.45rem;
		color: #24364c;
	}

	.tlp-list--compact {
		gap: 0.35rem;
	}

	.tlp-grid-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.75rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tlp-grid-list li {
		background: #f6f9fd;
		border: 1px solid #e1ebf4;
		border-radius: 12px;
		padding: 0.85rem;
		font-weight: 600;
		color: #20344b;
	}

	.tlp-agenda {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.9rem;
	}

	.tlp-agenda__item {
		border: 1px solid #e4ecf5;
		border-radius: 12px;
		padding: 0.9rem;
		background: #f8fbff;
	}

	.tlp-agenda__title {
		margin: 0 0 0.35rem;
		font-weight: 800;
		color: #0d1a2b;
	}

	.tlp-panel__side {
		background: #f6f9fd;
		border-radius: 12px;
		padding: 0.9rem;
		border: 1px solid #e1ebf4;
	}

	.tlp-review-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.75rem;
	}

	.tlp-trainer {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.9rem;
		align-items: center;
	}

	.tlp-trainer__photo {
		height: 96px;
		width: 96px;
		border-radius: 18px;
		object-fit: cover;
		border: 2px solid #0b6fbf;
		box-shadow: 0 10px 24px -16px rgba(11, 111, 191, 0.65);
	}

	.tlp-trainer__name {
		margin: 0;
		font-weight: 800;
		color: #0d1a2b;
	}

	.tlp-trainer__role {
		margin: 0.1rem 0 0.35rem;
		color: #0b6fbf;
		font-weight: 700;
		text-transform: uppercase;
		font-size: 0.85rem;
	}

	.tlp-faqs {
		display: grid;
		gap: 0.6rem;
	}

	.tlp-faq {
		border: 1px solid #e4ecf5;
		border-radius: 12px;
		padding: 0.85rem 0.95rem;
		background: #f8fbff;
	}

	.tlp-faq summary {
		font-weight: 800;
		color: #0d1a2b;
		cursor: pointer;
	}

	.tlp-cta {
		background: linear-gradient(135deg, #0d1a2b 0%, #0b6fbf 70%, #0da7dc 100%);
		color: #ffffff;
		border-radius: 18px;
		padding: 1.4rem;
		margin-top: 1.25rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.9rem;
		box-shadow: 0 18px 42px -24px rgba(0, 79, 143, 0.6);
	}

	@media (max-width: 960px) {
		.tlp-hero {
			grid-template-columns: 1fr;
		}

		.tlp-panel--split {
			grid-template-columns: 1fr;
		}

		.tlp-trainer {
			grid-template-columns: 1fr;
			text-align: left;
		}
	}
</style>
