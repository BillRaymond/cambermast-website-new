<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';

	const section = catalog.strategy;

	const items = (section.items ?? [])
		.filter((i) => i.published ?? true)
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

	type ApproachStep = {
		id: string;
		label: string;
		title: string;
		blurb: string;
		detail: string;
		questions: string[];
		outputs: string[];
	};

	const approachSteps: ApproachStep[] = [
		{
			id: 'value',
			label: 'Value lens',
			title: 'Anchor the engagement to outcomes, not hours',
			blurb: 'Frame the conversation around time saved, quality improved, and revenue generated.',
				detail:
					'Before we talk tooling or price, we align on the transformation you expect. That narrative drives every downstream decision, from ROI math to how we communicate the investment internally.',
			questions: [
				'Which metric or customer moment is under the most pressure right now?',
				'Who needs to be convinced this is an investment rather than an expense?'
			],
			outputs: ['Value hypothesis + constraints', 'Stakeholder and decision map']
		},
		{
			id: 'discovery',
			label: 'Discovery sprint',
			title: 'Map the manual workflow from trigger to completion',
			blurb: 'We document the existing process live with your team so nothing gets lost.',
			detail:
				'Discovery covers frequency, triggers, tools already in use, human touchpoints, current data policies, and hidden exceptions. We pair interviews with screen shares so we can see the process exactly how it happens today—including how new tools or datasets get approved.',
			questions: [
				'How often does the workflow run and what starts it?',
				'What does it cost each time in people, software, and attention?',
				'Which systems and datasets are approved today, and who signs off on adding new ones?'
			],
			outputs: ['Process storyboard & RACI', 'Tooling/data inventory + approval path']
		},
		{
			id: 'roi',
			label: 'Value modeling',
			title: 'Quantify the return using plain math everyone can follow',
			blurb: 'We translate manual effort into dollars and hours so approvals are easy.',
			detail:
				'Using the discovery data, we model scenarios that show reclaimed time, reduced error rates, and additional capacity. The assumptions are documented so finance leaders can challenge or approve them quickly.',
			questions: [
				'What is the annualized value of the time we are giving back?',
				'Where could that capacity be redeployed for higher leverage work?'
			],
			outputs: ['ROI ranges with sensitivity notes', 'Shortlist of pilot candidates']
		},
		{
			id: 'build',
			label: 'Design & QA',
			title: 'Co-design the engagement plan, guardrails, and QA loops',
			blurb: 'Milestone-based delivery keeps us accountable while stakeholders stay involved.',
				detail:
					'We translate the prioritized workflow into a delivery plan that highlights human-in-the-loop checkpoints, testing responsibilities, and data access requirements. When something changes, we adjust scope, not just the price.',
			questions: [
				'Which milestones prove value the fastest?',
				'What does “done” look like for each stakeholder involved?'
			],
			outputs: ['Milestone roadmap + QA script', 'Success metrics dashboard draft']
		},
		{
			id: 'expand',
			label: 'Enable & expand',
			title: 'Shift into ongoing stewardship once the first wins land',
			blurb: 'Maintenance, optimization, and version-two ideas roll into a simple retainer.',
			detail:
				'When the pilot is live, we monitor real usage, tighten prompts, and queue the next set of enhancements. Clients get predictable costs and priority access while we focus on long-term lift instead of one-off builds.',
			questions: [
				'What needs to be monitored weekly vs. monthly?',
				'Which follow-on workflows unlock compounding value?'
			],
			outputs: ['Optimization backlog', 'Right-sized retainer or success plan']
		}
	];

	let activeStepId = approachSteps[0].id;
	$: activeStep = approachSteps.find((step) => step.id === activeStepId) ?? approachSteps[0];

	const engagementHighlights = [
		{
			title: 'Alignment sprint (1–4 weeks)',
			description:
				'Fast-paced advisory sprint that reviews existing processes (manual or automated) and narrows the backlog to the most valuable bet.',
			bullets: [
				'Process and tooling audit with stakeholders',
				'Executive-ready findings deck + ROI scenarios',
				'Enablement session for internal teams'
			]
		},
		{
			title: 'Milestone delivery',
			description:
				'We build and manage AI workflows with human-in-the-loop guardrails and weekly demos.',
			bullets: ['Prototyping + testing environments', 'Documented QA + handover playbooks', 'Go-live and monitoring support']
		},
		{
			title: 'Ongoing stewardship',
			description:
				'A flexible retainer that covers maintenance, optimization, and version-two improvements.',
			bullets: ['Model + API updates handled for you', 'Lightweight backlog grooming', 'Performance reviews with leadership']
		}
	];

	const caseSnapshot = {
		title: 'Recent automation win',
		summary:
			'Automated weekly website updates so marketing stays compliant with evolving AI optimization, search, and content rules without slowing launches.',
		stats: [
			{ label: 'Manual time removed', value: '10 hrs/week' },
			{ label: 'Blended hourly cost', value: '$75 per hour' },
			{ label: 'Annual savings unlocked', value: '$39K+ projected' }
		],
		narrative:
			'The team was burning 10 hours per week chasing policy updates at $75/hour. Once we mapped the workflow, we automated content checks, approvals, and deployments while keeping a human sign-off. That freed 520 hours annually that now go toward new campaigns.'
	};

	const intakeSample = [
		{
			label: 'Workflow or process',
			value:
				'Marketing site updates to stay compliant with AI optimization, search, and content guidelines.'
		},
		{ label: 'Frequency or volume', value: '2–3 update pushes per week; spikes during model rollouts.' },
		{
			label: 'Stakeholders involved',
			value: 'Marketing ops lead, web developer, and compliance reviewer.'
		},
		{
			label: 'Manual effort today',
			value: '10 hours of coordination and QA per week at a $75/hour blended rate.'
		},
		{
			label: 'Tooling + data guardrails',
			value: 'Approved systems, datasets, and anything off-limits so we know the boundaries from day one.'
		},
		{
			label: 'Desired outcome',
			value: 'Automate compliant copy blocks, approvals, and publishing alerts while keeping a final human review.'
		},
		{
			label: 'Primary success metric',
			value: 'Faster publishing cycle with zero compliance regressions.'
		},
		{
			label: 'Ideal timeline',
			value: 'Need the first automation live within 30 days to support an upcoming launch.'
		}
	];

	const pageMeta = getSeo('/strategy');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/strategy" />

<section class="mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 text-white shadow-xl">
	<div class="grid gap-8 p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:p-12">
		<div class="space-y-5">
			<p class="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
				Outcome-focused advisory
			</p>
			<h1 class="text-3xl font-bold lg:text-4xl">{section.label}</h1>
			<p class="text-lg text-blue-50 lg:text-xl">
				{section.headline} When repetitive tasks and overbuilt processes eat into revenue, bring them to us and we’ll turn them into clear next steps, prototypes, and proof you can rally around.
			</p>
			<ul class="space-y-2 text-sm text-blue-100 lg:text-base">
				<li class="flex items-start gap-3">
					<span aria-hidden="true">✅</span>
					<span>Show leadership exactly how much time, cost, and risk fall away with each workflow we tackle together.</span>
				</li>
				<li class="flex items-start gap-3">
					<span aria-hidden="true">✅</span>
					<span>Co-build with our team through live demos, QA scripts, and human-in-the-loop guardrails so nothing feels like a black box.</span>
				</li>
				<li class="flex items-start gap-3">
					<span aria-hidden="true">✅</span>
					<span>Ease into retainers or optimization plans once the first win lands, keeping the same crew who knows your business.</span>
				</li>
			</ul>
		</div>
		<dl class="grid gap-4 rounded-2xl border border-white/20 bg-white/5 p-6 text-sm uppercase tracking-wide text-blue-100">
			<div>
				<dt class="text-xs text-blue-200">What we focus on</dt>
				<dd class="text-2xl font-semibold text-white">Time, cost, and error reduction</dd>
			</div>
			<div>
				<dt class="text-xs text-blue-200">Engagement style</dt>
				<dd class="text-2xl font-semibold text-white">Milestone-based + retainers</dd>
			</div>
			<div>
				<dt class="text-xs text-blue-200">Trusted by</dt>
				<dd class="text-2xl font-semibold text-white">Operations, RevOps, Enablement</dd>
			</div>
		</dl>
	</div>
</section>

<section class="mb-12 space-y-6">
	<div class="space-y-2">
		<p class="text-sm font-semibold uppercase tracking-wide text-blue-700">Our approach</p>
		<h2 class="text-2xl font-bold">A visual map of how we engage</h2>
		<p class="text-gray-700">
			Each step builds on the last. Select a stage to see how the work evolves and what your team
			can expect.
		</p>
	</div>

	<div class="rounded-3xl border bg-white/70 p-5 shadow-sm backdrop-blur">
		<div class="grid gap-3 md:grid-cols-5">
			{#each approachSteps as step, index}
				<button
					type="button"
					class="group relative flex flex-col rounded-2xl border px-4 py-5 text-left transition hover:border-blue-400 hover:bg-blue-50/80 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 {activeStepId ===
					step.id
						? 'border-blue-600 bg-blue-50/90 shadow'
						: 'border-gray-200 bg-white'}"
					on:click={() => (activeStepId = step.id)}
					aria-current={activeStepId === step.id ? 'step' : undefined}
				>
					<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Step {index + 1}</p>
					<p class="mt-1 text-lg font-semibold text-gray-900">{step.label}</p>
					<p class="mt-2 text-sm text-gray-600">{step.blurb}</p>
					{#if index < approachSteps.length - 1}
						<span
							aria-hidden="true"
							class="pointer-events-none absolute right-[-18px] top-1/2 hidden h-px w-9 bg-gradient-to-r from-blue-100 via-blue-400 to-blue-600 md:block"
						></span>
					{/if}
				</button>
			{/each}
		</div>

		<div class="mt-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-inner">
			<p class="text-sm font-semibold uppercase tracking-wide text-blue-700">
				Now focused on
			</p>
			<h3 class="text-2xl font-bold text-gray-900">{activeStep.title}</h3>
			<p class="mt-2 text-gray-700">{activeStep.detail}</p>
			<div class="mt-4 grid gap-4 md:grid-cols-2">
				<div>
					<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
						Questions we answer
					</p>
					<ul class="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-700">
						{#each activeStep.questions as question}
							<li>{question}</li>
						{/each}
					</ul>
				</div>
				<div>
					<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Key outputs</p>
					<ul class="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-700">
						{#each activeStep.outputs as output}
							<li>{output}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="mb-12 space-y-6">
	<div class="space-y-2">
		<p class="text-sm font-semibold uppercase tracking-wide text-blue-700">Engagement formats</p>
		<h2 class="text-2xl font-bold">Pick the level of support you need</h2>
		<p class="text-gray-700">
			We mix and match sprints, builds, and retainers so you only pay for the help that drives the
			next result.
		</p>
	</div>
	<div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
		<div class="space-y-5">
			{#each engagementHighlights as highlight}
				<article class="rounded-2xl border bg-white p-5 shadow-sm">
					<h3 class="text-xl font-semibold">{highlight.title}</h3>
					<p class="mt-1.5 text-gray-700">{highlight.description}</p>
					<ul class="mt-3 list-disc space-y-1.5 pl-5 text-sm text-gray-700">
						{#each highlight.bullets as bullet}
							<li>{bullet}</li>
						{/each}
					</ul>
				</article>
			{/each}
		</div>
		<div class="rounded-2xl border bg-gradient-to-b from-slate-900 to-blue-900 p-6 text-white shadow-md">
			<h3 class="text-xl font-semibold">Advisory sprint deliverables</h3>
			<p class="mt-2 text-blue-100">
				These are the core elements clients request most often from our catalog.
			</p>
			<div class="mt-4 space-y-4">
				{#each items as i}
					<div class="rounded-xl border border-white/20 bg-white/5 p-4">
						<p class="text-sm font-semibold uppercase tracking-wide text-blue-200">{i.title}</p>
						{#if i.summary}<p class="mt-1 text-sm text-blue-100">{i.summary}</p>{/if}
						{#if i.bullets?.length}
								<ul class="mt-2 list-disc space-y-1 pl-6 text-sm text-blue-50">
								{#each i.bullets as b}<li>{b}</li>{/each}
							</ul>
						{/if}
					</div>
				{/each}
			</div>
			<a
				class="mt-4 inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
				href="/contact"
				>Talk through options</a
			>
		</div>
	</div>
</section>

<section class="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<p class="text-sm font-semibold uppercase tracking-wide text-blue-700">Proof in practice</p>
		<h3 class="text-2xl font-bold text-gray-900">{caseSnapshot.title}</h3>
		<p class="mt-3 text-gray-700">{caseSnapshot.summary}</p>
		<dl class="mt-4 grid gap-4 sm:grid-cols-3">
			{#each caseSnapshot.stats as stat}
				<div class="rounded-xl border bg-gray-50 p-4">
					<dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">
						{stat.label}
					</dt>
					<dd class="text-lg font-semibold text-gray-900">{stat.value}</dd>
				</div>
			{/each}
		</dl>
		<p class="mt-4 text-sm text-gray-600">{caseSnapshot.narrative}</p>
	</article>
	<article class="rounded-2xl border bg-blue-50 p-6 text-blue-900">
		<p class="text-sm font-semibold uppercase tracking-wide text-blue-800">How pricing works</p>
		<h3 class="text-2xl font-bold text-blue-950">Transparent, customer-focused pricing</h3>
		<p class="mt-3 text-blue-900">
			Instead of forcing you into a rigid framework, we price engagements based on the tangible
			value uncovered during discovery.
		</p>
		<ul class="mt-4 space-y-2 text-sm">
			<li class="flex items-start gap-2">
				<span aria-hidden="true">•</span>
				<span>
					We calculate reclaimed time, reduced spend, or new revenue potential with your data.
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span aria-hidden="true">•</span>
				<span>
					Proposals show the math so you can defend the investment internally without guessing.
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span aria-hidden="true">•</span>
				<span>
					If budget becomes the constraint, we trim scope or phase the work instead of discounting
					the value.
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span aria-hidden="true">•</span>
				<span>
					Retainers include monitoring, optimization, and backlog planning so you always know what
					you are getting each month.
				</span>
			</li>
		</ul>
	</article>
</section>

<section class="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
	<article class="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
		<p class="text-sm font-semibold uppercase tracking-wide text-blue-700">Discovery intake</p>
		<h3 class="text-2xl font-bold text-gray-900">Here’s the info we gather up front</h3>
		<p class="text-gray-700">
			While we automate the intake workflow, use this sample to draft your notes and send them via the
			<a class="text-blue-700 underline" href="/contact">contact page</a> or directly to our team.
		</p>
		<dl class="space-y-4">
			{#each intakeSample as item}
				<div class="rounded-2xl border bg-gray-50 p-4">
					<dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</dt>
					<dd class="mt-1 text-sm text-gray-900">{item.value}</dd>
				</div>
			{/each}
		</dl>
	</article>

	<div class="rounded-3xl border bg-gray-50 p-6">
		<p class="text-sm font-semibold uppercase tracking-wide text-gray-600">What happens next</p>
		<h3 class="text-2xl font-bold text-gray-900">How we use that sample</h3>
			<ul class="mt-4 space-y-3 text-gray-700">
				<li class="flex gap-3">
					<span class="text-blue-600">1.</span>
					<span>We translate your notes into a quick value canvas for internal review.</span>
				</li>
				<li class="flex gap-3">
					<span class="text-blue-600">2.</span>
					<span>During our first call we validate assumptions, surface blockers, and pick a pilot.</span>
				</li>
				<li class="flex gap-3">
					<span class="text-blue-600">3.</span>
					<span>Within a few days you receive a scoped proposal with the ROI math spelled out.</span>
				</li>
			</ul>
		<p class="mt-4 text-sm text-gray-600">
			Ready to share your version? Send it through the <a class="text-blue-700 underline" href="/contact"
				>contact page</a
			> or mention it when you book time.
		</p>
	</div>
</section>
