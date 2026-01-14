<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { listTechlabPrograms } from '$lib/data/techlab';
	import type { TechlabProgram } from '$lib/data/techlab/types';
import {
	hasExternalRegistration,
	isSessionDraft,
	isSessionHappeningNow,
	isSessionUpcoming,
	normalizeToday
} from '$lib/data/training/session-utils';

	const programs: TechlabProgram[] = listTechlabPrograms();

	const pageTitle = 'TechLAB × Cambermast | AI Training & Automation with Bill Raymond';
const pageDescription =
	'TechLAB and Cambermast partnered to provide AI training, agentic AI automations, and hands-on practice for founders and operators, guided by Bill Raymond for TechLAB teams.';

	const ctaPrimary = { label: 'Schedule with the team', url: '/contact' };
	const ctaSecondary = { label: 'Talk with Bill', url: '/contact' };

const statBlocks = [
	{ label: 'Focus', value: 'Founder-first AI literacy, agentic automations, fieldwork' },
	{ label: 'Audience', value: 'Founders, operators, GTM, product, and technical teams' },
	{ label: 'Formats', value: 'Live labs, private cohorts, automation pilots' },
	{ label: 'Partner', value: 'Delivered with TechLAB + Cambermast' }
];

const valueProps = [
	'Give founders investor-ready AI workflows, storylines, and proof points.',
	'Design agentic automations with human-in-the-loop guardrails TechLAB trusts.',
	'Equip operators with prompts, playbooks, and governance checklists they can run tomorrow.',
	'Pair every sprint with hands-on lab time so teams leave with measurable wins.'
];

const supportGroups = [
	{
		title: 'Founders & operators',
		copy: 'Frame the AI vision, keep investor messaging sharp, and prove traction with shipped workflows.'
	},
	{
		title: 'Product & engineering',
		copy: 'Design agentic loops, custom GPTs, and research systems that stay reliable in production.'
	},
	{
		title: 'Content & GTM teams',
		copy: 'Scale storytelling, docs, and customer comms while protecting brand and approvals.'
	}
];

const founderDeliverables = [
	{
		title: 'Agentic automation briefs',
		copy: 'Define the trigger logic, human checkpoints, and KPIs for agent-powered workflows founders can explain to investors.'
	},
	{
		title: 'Pitch deck storyboards',
		copy: 'Use structured prompts to shape story arcs, traction slides, and founder narratives that stay consistent across talk tracks.'
	},
	{
		title: 'Market intel briefs',
		copy: 'Spin up AI-assisted battle cards and competitive tear-downs with citations, so diligence and positioning stay fresh.'
	},
	{
		title: 'VC communications',
		copy: 'Draft investor updates, outreach sequences, and follow-up notes that adapt to each fund’s focus while staying on-brand.'
	}
];

const whyTechlab = [
	'Joint TechLAB × Cambermast curriculum tailored for founders and operators.',
	'Agentic automation labs built on Cambermast’s delivery playbooks and TechLAB diligence.',
	'Hands-on sessions, clear templates, and real TechLAB build examples—not theory.'
];

	type ScheduleEntry = {
		programTitle: string;
		route: string;
		heroImage?: string;
		heroImageAlt?: string;
		sessionName: string;
		date: string;
		timeText?: string;
		location?: string;
		registerUrl: string;
		ctaLabel: string;
	};

	const today = normalizeToday();
	const scheduleEntries: ScheduleEntry[] = programs
		.map((program) => {
			const session =
				program.sessions?.find(
					(entry) =>
						!isSessionDraft(entry) &&
						entry.startDate &&
						hasExternalRegistration(entry) &&
						isSessionUpcoming(entry, today) &&
						!isSessionHappeningNow(entry, today)
				) ?? null;

			if (!session) return null;

			const timeText = Array.isArray(session.time) ? session.time.join(' • ') : session.time;
			return {
				programTitle: program.title,
				route: program.route ?? `/techlab/${program.slug}`,
				heroImage: program.heroImage,
				heroImageAlt: program.heroImageAlt ?? program.title,
				sessionName: session.name,
				date: session.date,
				timeText,
				location: session.location,
				registerUrl: session.registerUrl,
				ctaLabel: 'Register'
			};
		})
		.filter((entry): entry is ScheduleEntry => Boolean(entry));
	const animatedSchedule = [...scheduleEntries, ...scheduleEntries];

	const formatStat = (program: TechlabProgram): string | undefined =>
		program.stats?.find((item) => item.label.toLowerCase() === 'format')?.value?.toString();
	const durationStat = (program: TechlabProgram): string | undefined =>
		program.stats?.find((item) => item.label.toLowerCase() === 'duration')?.value?.toString();
</script>

<SeoHead title={pageTitle} description={pageDescription} path="/techlab" />

<svelte:head>
	<meta name="robots" content="noindex" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700;900&display=swap"
	/>
</svelte:head>

<div class="techlab-shell">
	<header class="techlab-header">
		<div class="techlab-header__brand">
			<img src="/images/techlab-logo.png" alt="TechLAB logo" class="techlab-logo" />
			<div class="techlab-pair">
				<a
					class="techlab-pill"
					href="https://www.techlabcenter.com#home"
					target="_blank"
					rel="noreferrer noopener"
				>
					TechLAB
				</a>
				<a
					class="techlab-pill techlab-pill--light"
					href="https://cambermast.com"
					target="_blank"
					rel="noreferrer noopener"
				>
					Cambermast
				</a>
			</div>
		</div>
		<div class="techlab-header__actions">
			<a class="techlab-link" href="/contact">Contact</a>
		</div>
	</header>

	<main class="techlab-main">
	<section class="hero">
		<div class="hero__content">
			<p class="eyebrow">Official AI Education Partner</p>
			<h1>TechLAB × Cambermast</h1>
			<p class="lead">
				TechLAB and Cambermast partnered to provide AI training, agentic AI automations, and
				hands-on practice for founders and operators. Bill Raymond leads every session with
				TechLAB’s builders, operators, and technical teams.
			</p>
			<div class="hero__cta">
				<a class="btn btn--primary" href={ctaPrimary.url}>{ctaPrimary.label}</a>
				<a class="btn btn--ghost" href={ctaSecondary.url}>{ctaSecondary.label}</a>
			</div>
			<div class="hero__meta">
				<span>Bill Raymond • Founder, Cambermast</span>
				<span class="dot" aria-hidden="true"></span>
				<span>Delivered with TechLAB</span>
			</div>
		</div>
		<div class="hero__card">
			<h3>Built for fast-moving teams</h3>
			<ul>
				<li>Founders leave each week with investor-ready narratives, prompts, and proof points.</li>
				<li>Operators co-build agentic automations with Cambermast guardrails to stay reliable.</li>
				<li>Tap TechLAB’s mentor network plus Cambermast delivery experience to move fast with confidence.</li>
			</ul>
		</div>
	</section>

		{#if scheduleEntries.length}
		<section class="schedule">
			<div class="schedule__header">
				<div>
					<p class="eyebrow">TechLAB schedule preview</p>
					<h2>Upcoming sessions & private cohorts</h2>
					<p class="schedule__lede">
						A quick look at what’s running now. Hover to pause or tap for details.
					</p>
				</div>
				<a class="btn btn--ghost" href="/contact">
					<span>Request a private date</span>
					<span class="arrow">→</span>
				</a>
			</div>
			<div class="schedule-marquee" aria-label="Upcoming TechLAB programs">
				<div class="schedule-track">
					{#each animatedSchedule as entry, index}
						<a class="schedule-card" aria-label={entry.programTitle} href={entry.route}>
							{#if entry.heroImage}
								<div class="schedule-card__image-wrap">
									<img
										src={entry.heroImage}
										alt={entry.heroImageAlt ?? entry.programTitle}
										loading="lazy"
									/>
								</div>
							{/if}
							<div class="schedule-card__top">
								<p class="eyebrow eyebrow--small">Next up</p>
								<p class="schedule-card__date">{entry.date}</p>
								{#if entry.timeText}<p class="schedule-card__time">{entry.timeText}</p>{/if}
							</div>
							<div class="schedule-card__body">
								<div class="schedule-card__meta">
									<h3>{entry.programTitle}</h3>
									<p class="schedule-card__session">{entry.sessionName}</p>
									{#if entry.location}
										<p class="schedule-card__location">{entry.location}</p>
									{/if}
								</div>
							</div>
							<div class="schedule-card__actions">
								<span class="btn btn--primary">
									Register
									<span class="arrow arrow--animate">→</span>
								</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
		{/if}

		<section class="stats">
			{#each statBlocks as stat}
				<div class="stat">
					<p class="stat__label">{stat.label}</p>
					<p class="stat__value">{stat.value}</p>
				</div>
			{/each}
		</section>

	<section class="panel">
		<div class="panel__content">
			<h2>About the collaboration</h2>
			<p>
				TechLAB and Cambermast partnered to provide AI training, agentic AI automations, and
				hands-on practice for founders and operators. Every program is led by Bill Raymond with
				content tuned for TechLAB’s community, which is fast-moving, pragmatic, and ready to launch.
			</p>
			<div class="pill-row">
				<span class="techlab-pill">AI training</span>
				<span class="techlab-pill">Agentic automations</span>
				<span class="techlab-pill">Hands-on founder labs</span>
			</div>
		</div>
			<div class="panel__content panel__content--alt">
				<h3>Why it works</h3>
				<ul class="bullet">
					{#each whyTechlab as reason}
						<li>{reason}</li>
					{/each}
				</ul>
			</div>
		</section>

		<section class="panel panel--grid">
			<div class="panel__content">
				<h2>Value for founders and operators</h2>
				<ul class="bullet">
					{#each valueProps as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
			<div class="panel__content">
				<h3>Who this supports</h3>
				<div class="support-grid">
					{#each supportGroups as group}
						<div class="support-card">
							<p class="support-title">{group.title}</p>
							<p class="support-copy">{group.copy}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section class="panel panel--founder">
			<div class="panel__content">
				<p class="eyebrow eyebrow--small">Founder-ready workflows</p>
				<h2>Work on real startup deliverables in each session</h2>
				<p>
					Every TechLAB program bakes in lab time for the material founders need to fundraise,
					validate markets, and keep investors confident.
				</p>
			</div>
			<div class="panel__content">
				<div class="founder-grid">
					{#each founderDeliverables as deliverable}
						<div class="founder-card">
							<h3>{deliverable.title}</h3>
							<p>{deliverable.copy}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section class="catalog">
			<div class="catalog__header">
				<div>
					<p class="eyebrow">AI Training Catalog</p>
					<h2>TechLAB programs with Bill Raymond</h2>
					<p class="catalog__lede">
						Explore AI training and automation programs designed for TechLAB members and partner
						teams.
					</p>
				</div>
				<a class="btn btn--ghost" href="/contact">Ask about private delivery</a>
			</div>
			<div class="catalog__grid">
				{#each programs as program (program.slug)}
					<article class="catalog-card">
						{#if program.heroImage}
							<img
								src={program.heroImage}
								alt={program.heroImageAlt ?? program.title}
								class="catalog-card__image"
								loading="lazy"
							/>
						{/if}
						<div class="catalog-card__body">
							<p class="eyebrow eyebrow--small">TechLAB training</p>
							<h3>{program.title}</h3>
							<p class="catalog-card__tagline">{program.tagline}</p>
							<div class="catalog-card__meta">
								{#if durationStat(program)}
									<span>{durationStat(program)}</span>
								{/if}
								{#if formatStat(program)}
									<span>{formatStat(program)}</span>
								{/if}
							</div>
							<ul class="catalog-card__bullets">
								{#each (program.objectives?.slice(0, 3) ?? []) as objective}
									<li>{objective}</li>
								{/each}
							</ul>
							<div class="catalog-card__actions">
								<a class="btn btn--primary" href={program.route}>View program</a>
								<a class="btn btn--ghost" href={program.primaryCta.url}>Schedule</a>
							</div>
						</div>
					</article>
				{/each}
			</div>
		</section>

		<section class="cta-block">
			<div>
				<p class="eyebrow">Ready to move</p>
				<h2>Bring TechLAB + Cambermast into your next sprint</h2>
				<p>
					Set dates for your team, or ask about automation pilots built alongside the training.
				</p>
			</div>
			<div class="cta-block__actions">
				<a class="btn btn--primary" href={ctaPrimary.url}>Schedule your team</a>
				<a class="btn btn--ghost" href={ctaSecondary.url}>Talk with Bill</a>
			</div>
		</section>
	</main>

	<footer class="techlab-footer">
		<div class="footer__brand">
			<img src="/images/techlab-logo.png" alt="TechLAB logo" class="techlab-logo techlab-logo--small" />
			<div>
				<p class="footer__title">TechLAB</p>
				<p class="footer__subtitle">In collaboration with Cambermast</p>
			</div>
		</div>
		<div class="footer__links">
			<a href="/contact" class="techlab-link">Contact</a>
		</div>
	</footer>
</div>

<style>
	.techlab-shell {
		font-family: 'Lato', 'Open Sans', 'Helvetica Neue', Arial, sans-serif;
		color: #0d1a2b;
		background: radial-gradient(circle at 12% 18%, rgba(0, 136, 201, 0.09), transparent 32%),
			radial-gradient(circle at 88% 12%, rgba(0, 136, 201, 0.08), transparent 28%),
			linear-gradient(180deg, #f9fbff 0%, #eef3f9 100%);
		min-height: 100vh;
	}

	.techlab-main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2.5rem 1.25rem 4rem;
	}

	.techlab-header {
		max-width: 1100px;
		margin: 0 auto;
		padding: 1.25rem 1.25rem 0.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.techlab-logo {
		height: 52px;
		width: auto;
		object-fit: contain;
	}

	.techlab-logo--small {
		height: 36px;
	}

	.techlab-header__brand {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.techlab-header__actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.techlab-link {
		color: #0b6fbf;
		font-weight: 600;
		text-decoration: none;
		border-bottom: 1px solid transparent;
	}

	.techlab-link:hover {
		border-color: #0b6fbf;
	}

	.techlab-pair {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.techlab-pill {
		background: #0b6fbf;
		color: #ffffff;
		border-radius: 999px;
		padding: 0.35rem 0.9rem;
		font-weight: 700;
		font-size: 0.85rem;
		letter-spacing: 0.01em;
	}

	.techlab-pill--light {
		background: #0d1a2b;
	}

	.hero {
		display: grid;
		grid-template-columns: 1.4fr 0.9fr;
		gap: 1.5rem;
		padding: 2.5rem;
		background: linear-gradient(135deg, #0d1a2b 0%, #0b6fbf 60%, #0d9fd6 100%);
		color: #ffffff;
		border-radius: 24px;
		box-shadow: 0 24px 64px -24px rgba(13, 26, 43, 0.35);
	}

	.hero__content h1 {
		font-size: clamp(2.2rem, 3vw, 2.6rem);
		line-height: 1.1;
		margin: 0.35rem 0 0.65rem;
		letter-spacing: -0.01em;
	}

	.hero__content .lead {
		font-size: 1.05rem;
		max-width: 640px;
		line-height: 1.6;
		color: #e8f3fb;
	}

	.eyebrow {
		text-transform: uppercase;
		font-weight: 800;
		letter-spacing: 0.08em;
		font-size: 0.75rem;
		color: #b9dfff;
	}

	.eyebrow--small {
		font-size: 0.72rem;
		color: #0b6fbf;
	}

	.hero__cta {
		display: flex;
		gap: 0.75rem;
		margin: 1.25rem 0 0.75rem;
		flex-wrap: wrap;
	}

	.hero__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-items: center;
		color: #d8e9f6;
		font-weight: 600;
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 999px;
		background: #8bd3ff;
		display: inline-flex;
	}

	.hero__card {
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.22);
		border-radius: 18px;
		padding: 1.5rem;
		backdrop-filter: blur(4px);
	}

	.hero__card h3 {
		margin: 0 0 0.75rem;
		font-size: 1.1rem;
		color: #ffffff;
	}

	.hero__card ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.45rem;
		color: #e5f1fb;
		font-weight: 600;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.15rem;
		border-radius: 12px;
		font-weight: 700;
		text-decoration: none;
		font-size: 0.98rem;
	}

	.btn--primary {
		background: #00a5e3;
		color: #0d1a2b;
		border: 1px solid #00a5e3;
		box-shadow: 0 12px 28px -12px rgba(0, 165, 227, 0.6);
	}

	.btn--primary:hover {
		background: #00b5ff;
		border-color: #00b5ff;
	}

	.btn--ghost {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.4);
	}

	.hero .btn--ghost {
		color: #e8f3fb;
	}

	.btn--ghost:hover {
		background: rgba(255, 255, 255, 0.18);
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
		margin: 1.5rem 0 2.5rem;
	}

	.stat {
		background: #ffffff;
		border-radius: 18px;
		padding: 1.25rem;
		box-shadow: 0 10px 30px -18px rgba(13, 26, 43, 0.35);
		border: 1px solid #e4ecf5;
	}

	.stat__label {
		color: #0b6fbf;
		font-weight: 700;
		text-transform: uppercase;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		margin: 0 0 0.35rem;
	}

	.stat__value {
		margin: 0;
		font-weight: 700;
		font-size: 1rem;
		color: #0d1a2b;
	}

	.panel {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 1rem;
		margin: 0 0 2rem;
	}

	.panel__content {
		background: #ffffff;
		border-radius: 18px;
		padding: 1.5rem;
		border: 1px solid #e4ecf5;
		box-shadow: 0 12px 32px -22px rgba(13, 26, 43, 0.4);
	}

	.panel__content h2,
	.panel__content h3 {
		margin-top: 0;
		margin-bottom: 0.75rem;
		letter-spacing: -0.01em;
	}

	.panel__content p {
		margin: 0 0 0.75rem;
		color: #1e2c3d;
		line-height: 1.55;
		font-size: 1rem;
	}

	.panel__content--alt {
		background: linear-gradient(135deg, #0d1a2b 0%, #0b6fbf 100%);
		color: #e7f1fb;
		border: none;
	}

	.panel__content--alt h3 {
		color: #ffffff;
	}

	.panel__content--alt .bullet li::marker {
		color: #8bd3ff;
	}

	.panel--grid {
		grid-template-columns: 1fr 1fr;
	}

	.panel--founder {
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		gap: 1.5rem;
	}

	.bullet {
		list-style: disc;
		margin: 0.5rem 0 0;
		padding-left: 1.25rem;
		display: grid;
		gap: 0.5rem;
	}

	.pill-row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}

	.support-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	.support-card {
		background: rgba(11, 111, 191, 0.08);
		border: 1px solid rgba(11, 111, 191, 0.2);
		border-radius: 12px;
		padding: 0.9rem;
	}

	.support-title {
		font-weight: 800;
		color: #0d1a2b;
		margin: 0 0 0.25rem;
	}

	.support-copy {
		margin: 0;
		color: #23364a;
		font-size: 0.95rem;
	}

	.founder-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: 1rem;
	}

	.founder-card {
		background: rgba(255, 255, 255, 0.86);
		border: 1px solid #e4ecf5;
		border-radius: 16px;
		padding: 1rem;
		box-shadow: 0 12px 32px -28px rgba(13, 26, 43, 0.55);
	}

	.founder-card h3 {
		margin: 0 0 0.4rem;
		font-size: 1.1rem;
		color: #0b6fbf;
	}

	.founder-card p {
		margin: 0;
		color: #1e2c3d;
		line-height: 1.5;
		font-size: 0.95rem;
	}

	.catalog {
		background: #ffffff;
		border-radius: 22px;
		padding: 1.5rem;
		border: 1px solid #e4ecf5;
		box-shadow: 0 12px 32px -22px rgba(13, 26, 43, 0.4);
		margin-bottom: 2rem;
	}

	.catalog__header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-end;
		flex-wrap: wrap;
	}

	.catalog__lede {
		margin: 0.35rem 0 0.5rem;
		color: #2c3e52;
		max-width: 720px;
		font-size: 1rem;
	}

	.catalog__grid {
		margin-top: 1.4rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1rem;
	}

	.catalog-card {
		background: #f6f9fd;
		border: 1px solid #e1ebf4;
		border-radius: 16px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 12px 32px -24px rgba(13, 26, 43, 0.3);
	}

	.catalog-card__image {
		width: 100%;
		height: 160px;
		object-fit: cover;
	}

	.catalog-card__body {
		padding: 1rem 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.catalog-card__tagline {
		margin: 0;
		color: #1e2c3d;
		font-weight: 600;
	}

	.catalog-card__meta {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.catalog-card__meta span {
		background: #ffffff;
		border-radius: 999px;
		padding: 0.25rem 0.75rem;
		font-weight: 700;
		font-size: 0.82rem;
		border: 1px solid #d6e4f2;
		color: #0d1a2b;
	}

	.catalog-card__bullets {
		list-style: disc;
		margin: 0.25rem 0;
		padding-left: 1.1rem;
		display: grid;
		gap: 0.35rem;
		color: #2b3c50;
	}

	.catalog-card__actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}

	.catalog-card .btn {
		width: auto;
		flex: 1 1 auto;
		justify-content: center;
	}

	.catalog-card .btn--ghost {
		color: #0d1a2b;
		border-color: #c7daee;
		background: #ffffff;
	}

	.schedule {
		background: #ffffff;
		border-radius: 22px;
		padding: 1.5rem;
		border: 1px solid #e4ecf5;
		box-shadow: 0 12px 32px -22px rgba(13, 26, 43, 0.4);
		margin: 2rem 0;
	}

	.schedule__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.schedule__lede {
		margin: 0.35rem 0 0.5rem;
		color: #2c3e52;
		max-width: 640px;
		font-size: 1rem;
	}

	.schedule-marquee {
		margin-top: 1.1rem;
		overflow: hidden;
		position: relative;
		border-radius: 16px;
	}

	.schedule-track {
		display: flex;
		gap: 1rem;
		min-width: max-content;
		padding-right: 1rem;
		animation: scheduleScroll 80s linear infinite;
	}

	.schedule-marquee:hover .schedule-track,
	.schedule-marquee:focus-within .schedule-track {
		animation-play-state: paused;
	}

	.schedule-card {
		border-radius: 16px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background: linear-gradient(145deg, #f6f9fd 0%, #eef4fb 100%);
		border: 1px solid #dde7f4;
		box-shadow: 0 14px 36px -24px rgba(13, 26, 43, 0.45);
		position: relative;
		min-width: 260px;
		width: 260px;
		text-decoration: none;
		color: inherit;
	}

	.schedule-card::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 18% 20%, rgba(0, 165, 227, 0.12), transparent 35%),
			radial-gradient(circle at 82% 12%, rgba(13, 26, 43, 0.08), transparent 28%);
		pointer-events: none;
	}

	.schedule-card__top {
		padding: 1rem 1rem 0.5rem;
	}

	.schedule-card__date {
		margin: 0.25rem 0 0;
		font-weight: 800;
		color: #0d1a2b;
	}

	.schedule-card__time {
		margin: 0.15rem 0 0;
		color: #34506c;
		font-weight: 600;
	}

	.schedule-card__body {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		padding: 0 1rem 0.75rem;
		align-items: center;
	}

	.schedule-card__meta h3 {
		margin: 0 0 0.35rem;
		font-size: 1.05rem;
	}

	.schedule-card__session {
		margin: 0 0 0.2rem;
		color: #0b6fbf;
		font-weight: 700;
	}

	.schedule-card__location {
		margin: 0;
		color: #2d4055;
		font-weight: 600;
	}

	.schedule-card__image-wrap {
		width: 100%;
		height: 100%;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid #d8e4f2;
		box-shadow: 0 10px 24px -18px rgba(13, 26, 43, 0.35);
	}

	.schedule-card__image-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.schedule-card__actions {
		display: flex;
		justify-content: flex-start;
		align-items: flex-end;
		gap: 0.5rem;
		padding: 0 1rem 1rem;
		flex: 1 1 auto;
	}

	.schedule-card__actions .btn {
		margin-top: auto;
	}

	.arrow {
		display: inline-block;
		margin-left: 0.35rem;
		transition: transform 0.2s ease;
	}

	.btn:hover .arrow {
		transform: translateX(3px);
	}

	.arrow--animate {
		animation: arrowPulse 1.4s ease-in-out infinite;
	}

	@keyframes arrowPulse {
		0% {
			transform: translateX(0);
			opacity: 1;
		}
		60% {
			transform: translateX(4px);
			opacity: 0.85;
		}
		100% {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes scheduleScroll {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	@media (max-width: 640px) {
		.schedule-card {
			min-width: 240px;
			width: 240px;
		}
	}

	.cta-block {
		background: linear-gradient(120deg, #0d1a2b 0%, #0b6fbf 60%, #0d9fd6 100%);
		color: #ffffff;
		border-radius: 20px;
		padding: 1.6rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		box-shadow: 0 20px 48px -24px rgba(0, 79, 143, 0.55);
	}

	.cta-block h2 {
		margin: 0.25rem 0 0.35rem;
	}

	.cta-block p {
		margin: 0;
		color: #e4f1fb;
		font-weight: 600;
	}

	.cta-block__actions {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.techlab-footer {
		max-width: 1100px;
		margin: 1.5rem auto 0;
		padding: 1.5rem 1.25rem 2.25rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		color: #1e2c3d;
	}

	.footer__brand {
		display: flex;
		gap: 0.85rem;
		align-items: center;
	}

	.footer__title {
		margin: 0;
		font-weight: 800;
	}

	.footer__subtitle {
		margin: 0.15rem 0 0;
		color: #4d627b;
		font-size: 0.95rem;
	}

	.footer__links {
		display: flex;
		gap: 0.85rem;
	}

	@media (max-width: 960px) {
		.hero {
			grid-template-columns: 1fr;
		}

		.panel {
			grid-template-columns: 1fr;
		}

		.catalog-card .btn {
			flex: 1 1 100%;
		}
	}

	@media (max-width: 640px) {
		.techlab-header,
		.techlab-main,
		.techlab-footer {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.hero {
			padding: 1.6rem;
		}
	}
</style>
