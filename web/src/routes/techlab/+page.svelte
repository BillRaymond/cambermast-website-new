<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import UpcomingSessionsStrip from '$lib/components/home/UpcomingSessionsStrip.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getImageAlt, getLandscapeImageUrl } from '$lib/data/image-contract';
	import { getSeo } from '$lib/seo';
	import { listTechlabPrograms } from '$lib/data/techlab';
	import type { TechlabProgram } from '$lib/data/techlab/types';
	import { isEventUpcomingUi, listEventUi } from '$lib/view-models/events';
	import { toEventCardModel, type EventCardModel } from '$lib/view-models/event-card';

	const programs: TechlabProgram[] = listTechlabPrograms();

	const pageMeta = getSeo('/techlab');
	const ctaPrimary = { label: 'Schedule with the team', url: '/contact' };
	const ctaSecondary = { label: 'Talk with us', url: '/contact' };

	type QrLandingContext = {
		isQr: boolean;
		trigger?: string;
		ad?: string;
		utmSource?: string;
		utmMedium?: string;
		utmCampaign?: string;
		utmContent?: string;
	};

	type Highlight = {
		title: string;
		copy: string;
	};

	type ProgramCardStat = {
		duration?: string;
		format?: string;
	};

	const normalizeToday = (reference: Date = new Date()): Date => {
		const normalized = new Date(reference);
		normalized.setHours(0, 0, 0, 0);
		return normalized;
	};

	const today = normalizeToday();

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

	const supportGroups: Highlight[] = [
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

	const founderDeliverables: Highlight[] = [
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
		'Agentic automation labs built on Cambermast delivery playbooks and TechLAB diligence.',
		'Hands-on sessions, clear templates, and real build examples rather than abstract theory.'
	];

	const formatProgramStats = (program: TechlabProgram): ProgramCardStat => {
		const format = program.stats?.find((item) => item.label.toLowerCase() === 'format')?.value;
		const duration = program.stats?.find((item) => item.label.toLowerCase() === 'duration')?.value;

		return {
			duration: Array.isArray(duration) ? duration.join(', ') : duration?.toString(),
			format: Array.isArray(format) ? format.join(', ') : format?.toString()
		};
	};

	const upcomingSlides: EventCardModel[] = listEventUi()
		.filter((event) => isEventUpcomingUi(event, today))
		.map((event) => toEventCardModel(event))
		.sort((a, b) => {
			if (a.tone !== b.tone) return a.tone === 'happening' ? 1 : -1;
			return (a.startTimestamp ?? Infinity) - (b.startTimestamp ?? Infinity);
		});

	let qrLandingContext: QrLandingContext;
	let lastTrackedSearch = '';

	$: qrLandingContext = browser
		? (() => {
				const params = $page.url.searchParams;
				const trigger = params.get('src') ?? undefined;
				const utmSource = params.get('utm_source') ?? undefined;
				const utmMedium = params.get('utm_medium') ?? undefined;
				const utmCampaign = params.get('utm_campaign') ?? undefined;
				const utmContent = params.get('utm_content') ?? undefined;
				const ad = params.get('ad') ?? undefined;
				const isQr = trigger === 'qr' || utmSource === 'qr';

				return {
					isQr,
					trigger,
					ad,
					utmSource,
					utmMedium,
					utmCampaign,
					utmContent
				} satisfies QrLandingContext;
			})()
		: { isQr: false };

	$: if (browser && qrLandingContext.isQr) {
		const currentSearch = $page.url.search;
		if (currentSearch !== lastTrackedSearch) {
			lastTrackedSearch = currentSearch;
			trackQrLanding(qrLandingContext);
		}
	}

	function trackQrLanding(context: QrLandingContext) {
		const gtag = (window as Window & { gtag?: (...args: any[]) => void }).gtag;
		if (typeof gtag !== 'function') return;

		gtag('event', 'qr_landing', {
			qr_partner: 'techlab',
			qr_trigger: context.trigger,
			qr_ad: context.ad,
			utm_source: context.utmSource,
			utm_medium: context.utmMedium,
			utm_campaign: context.utmCampaign,
			utm_content: context.utmContent,
			page_path: '/techlab'
		});
	}
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/techlab" />

<section class="mx-auto mt-6 w-full px-4">
	<div class="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-900 to-sky-700 px-6 py-8 text-white shadow-[0_24px_64px_-28px_rgba(15,23,42,0.65)] sm:px-8">
		<div class="max-w-4xl">
			<div class="flex flex-wrap items-center gap-3">
				<img
					src="/images/TechLAB-Innovation-Center.png"
					alt="TechLAB Innovation Center LLC logo"
					class="h-12 w-auto rounded-lg bg-white px-3 py-2"
				/>
				<span class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
					Official AI Education Partner
				</span>
			</div>
			<h1 class="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">TechLAB × Cambermast</h1>
			<p class="mt-4 max-w-4xl text-base leading-7 text-blue-50">
				TechLAB Innovation Center LLC and Cambermast partnered to provide AI training, agentic AI
				automations, and hands-on practice for founders and operators. Bill Raymond leads every
				session with TechLAB builders, operators, and technical teams.
			</p>
		</div>
	</div>
</section>

<UpcomingSessionsStrip
	slides={upcomingSlides}
	title="Upcoming sessions & events"
	tagline="See the same live Cambermast calendar preview featured on the homepage, then explore the founder-focused TechLAB partnership below."
/>

<section class="mx-auto mt-6 w-full px-4">
	<div class="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-blue-900 to-sky-700 p-6 text-white shadow-[0_18px_48px_-28px_rgba(15,23,42,0.65)]">
		<h2 class="text-lg font-semibold text-white">Built for fast-moving teams</h2>
		<ul class="mt-4 space-y-3 text-sm leading-6 text-blue-50">
			<li>Founders leave with investor-ready narratives, prompts, and proof points.</li>
			<li>Operators co-build agentic automations with Cambermast guardrails.</li>
			<li>Teams tap TechLAB mentorship plus Cambermast delivery experience to move faster.</li>
		</ul>
		<div class="mt-6 flex flex-wrap gap-3">
			<a
				class="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:ring-2 focus:ring-white/60 focus:outline-none"
				href={ctaPrimary.url}
			>
				{ctaPrimary.label}
			</a>
			<a
				class="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:ring-2 focus:ring-white/60 focus:outline-none"
				href={ctaSecondary.url}
			>
				{ctaSecondary.label}
			</a>
		</div>
		<div class="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-blue-100">
			<span>Bill Raymond • Founder, Cambermast</span>
			<span class="h-1.5 w-1.5 rounded-full bg-sky-200" aria-hidden="true"></span>
			<span>Delivered with TechLAB Innovation Center LLC</span>
		</div>
	</div>
</section>

<section class="mx-auto mt-6 w-full px-4">
	<div class="mx-auto grid max-w-5xl gap-4 md:grid-cols-4">
		{#each statBlocks as stat}
			<div class="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
				<p class="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">{stat.label}</p>
				<p class="mt-2 text-sm font-semibold leading-6 text-gray-900">{stat.value}</p>
			</div>
		{/each}
	</div>
</section>

<section class="mx-auto mt-8 w-full px-4">
	<div class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.15fr,0.85fr]">
		<div class="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
			<p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
				About the collaboration
			</p>
			<h2 class="mt-3 text-2xl font-bold text-gray-900">Practical AI work for founder-led teams</h2>
			<p class="mt-4 max-w-3xl text-gray-700">
				Every program is led by Bill Raymond with content tuned for TechLAB's community: fast-moving,
				pragmatic teams that want to learn AI by applying it to real startup work.
			</p>
			<div class="mt-5 flex flex-wrap gap-2">
				<span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">AI training</span>
				<span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Agentic automations</span>
				<span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Hands-on founder labs</span>
			</div>
		</div>
		<div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
			<h2 class="text-xl font-bold text-gray-900">Why it works</h2>
			<ul class="mt-4 space-y-3 text-sm leading-6 text-gray-700">
				{#each whyTechlab as reason}
					<li>{reason}</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<section class="mx-auto mt-8 w-full px-4">
	<div class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
		<div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="text-2xl font-bold text-gray-900">Value for founders and operators</h2>
			<ul class="mt-4 space-y-3 text-sm leading-6 text-gray-700">
				{#each valueProps as item}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
		<div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="text-2xl font-bold text-gray-900">Who this supports</h2>
			<div class="mt-4 grid gap-4">
				{#each supportGroups as group}
					<div class="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-4">
						<p class="text-sm font-semibold text-gray-900">{group.title}</p>
						<p class="mt-2 text-sm leading-6 text-gray-700">{group.copy}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<section class="mx-auto mt-8 w-full px-4">
	<div class="mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
		<p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
			Founder-ready workflows
		</p>
		<h2 class="mt-3 text-2xl font-bold text-gray-900">
			Work on real startup deliverables in each session
		</h2>
		<p class="mt-4 max-w-3xl text-gray-700">
			Every TechLAB program bakes in lab time for the material founders need to fundraise, validate
			markets, and keep investors confident.
		</p>
		<div class="mt-6 grid gap-4 md:grid-cols-2">
			{#each founderDeliverables as deliverable}
				<div class="rounded-2xl border border-white bg-white/90 px-5 py-5 shadow-sm">
					<h3 class="text-lg font-semibold text-gray-900">{deliverable.title}</h3>
					<p class="mt-3 text-sm leading-6 text-gray-700">{deliverable.copy}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="mx-auto mt-10 w-full px-4">
	<div class="mx-auto max-w-5xl">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
					AI training catalog
				</p>
				<h2 class="mt-2 text-2xl font-bold text-gray-900">TechLAB programs with Bill Raymond</h2>
				<p class="mt-3 max-w-3xl text-gray-700">
					Explore AI training and automation programs designed for TechLAB members and partner
					teams.
				</p>
			</div>
			<a
				class="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:outline-none"
				href="/contact"
			>
				Ask about private delivery
			</a>
		</div>

		<div class="mt-6 grid gap-5 lg:grid-cols-2">
			{#each programs as program (program.slug)}
				{@const meta = formatProgramStats(program)}
				<article class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
					{#if getLandscapeImageUrl(program.images)}
						<img
							src={getLandscapeImageUrl(program.images)}
							alt={getImageAlt(program.images) ?? program.title}
							class="h-52 w-full object-cover"
							loading="lazy"
						/>
					{/if}
					<div class="p-6">
						<p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
							TechLAB training
						</p>
						<h3 class="mt-2 text-xl font-bold text-gray-900">{program.title}</h3>
						<p class="mt-3 text-sm leading-6 text-gray-700">{program.tagline}</p>
						<div class="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
							{#if meta.duration}
								<span class="rounded-full bg-gray-100 px-3 py-1">{meta.duration}</span>
							{/if}
							{#if meta.format}
								<span class="rounded-full bg-gray-100 px-3 py-1">{meta.format}</span>
							{/if}
						</div>
						<ul class="mt-4 space-y-2 text-sm leading-6 text-gray-700">
							{#each program.objectives?.slice(0, 3) ?? [] as objective}
								<li>{objective}</li>
							{/each}
						</ul>
						<div class="mt-5 flex flex-wrap gap-3">
							<a
								class="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"
								href={program.route}
							>
								View program
							</a>
							<a
								class="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:outline-none"
								href={program.primaryCta.url}
							>
								Schedule
							</a>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<section class="mx-auto mt-10 w-full px-4">
	<div class="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-slate-900 px-6 py-8 text-white shadow-sm">
		<div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
			<div>
				<p class="text-xs font-semibold tracking-[0.18em] text-sky-300 uppercase">Ready to move</p>
				<h2 class="mt-2 text-2xl font-bold">Bring TechLAB + Cambermast into your next sprint</h2>
				<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
					Set dates for your team, or ask about automation pilots built alongside the training.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<a
					class="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus:ring-2 focus:ring-white/60 focus:outline-none"
					href={ctaPrimary.url}
				>
					Schedule your team
				</a>
				<a
					class="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:ring-2 focus:ring-white/60 focus:outline-none"
					href={ctaSecondary.url}
				>
					Talk with Bill
				</a>
			</div>
		</div>
	</div>
</section>
