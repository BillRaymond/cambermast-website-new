<script lang="ts">
	import AgenticROICalculator from '$lib/components/calculator/AgenticROICalculator.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	const customTitle = 'Agentic ROI Calculator: Quantify Your Manual Tax & Reclaim Capacity';
	const customDescription =
		'Calculate operational overhead and capacity reclaimed by AI agents. Research-backed calculator showing exactly how much time your team loses to repetitive tasks, focus loss, and manual handoffs.';
</script>

<SeoHead title={customTitle} description={customDescription} path="/tools/agentic-roi-calculator" />

<svelte:head>
	<!-- Schema.org markup for calculator tool -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebApplication",
			"name": "Agentic ROI Calculator",
			"description": "Calculate the operational overhead (Manual Tax) and capacity reclaimed by implementing AI agents",
			"url": "https://cambermast.com/tools/agentic-roi-calculator",
			"applicationCategory": "BusinessApplication",
			"operatingSystem": "Any",
			"offers": {
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "USD"
			}
		}
	</script>
</svelte:head>

<!-- Hero Section -->
<section class="mb-6">
	<div class="mx-auto max-w-7xl space-y-1">
		<div class="inline-block rounded-full bg-blue-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-700">
			Cambermast ROI Engine
		</div>
		<h1 class="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
			Stop Paying the <span class="italic text-blue-600">Manual Tax</span>
		</h1>
	</div>
</section>

<!-- Calculator Component -->
<section class="mb-12">
	<AgenticROICalculator />
</section>

<!-- Supporting Content: Understanding Manual Tax -->
<section class="mb-12">
	<div class="mx-auto max-w-4xl">
		<h2 class="mb-6 text-3xl font-bold text-gray-900">Understanding the "Manual Tax"</h2>

		<div class="prose prose-blue max-w-none">
			<p class="text-lg text-gray-700">
				Every organization pays an invisible tax: the <strong>operational overhead</strong> that consumes
				productive capacity without delivering strategic value. We call this the "Manual Tax."
			</p>

			<h3 class="mt-8 text-xl font-bold text-gray-900">What is Manual Tax?</h3>
			<p class="text-gray-700">
				Manual Tax is the percentage of your team's time consumed by:
			</p>
			<ul class="list-disc space-y-2 pl-6 text-gray-700">
				<li>
					<strong>Repetitive Tasks:</strong> Copy-paste operations, data entry, status updates, routine
					emails
				</li>
				<li>
					<strong>Focus Loss:</strong> Context switching, meeting prep, calendar coordination, Slack
					interruptions
				</li>
				<li>
					<strong>Manual Research:</strong> Digging through documentation, searching multiple systems,
					compiling reports
				</li>
				<li>
					<strong>Manual Handoffs:</strong> Briefing colleagues, re-explaining context, duplicating
					work across teams
				</li>
			</ul>

			<h3 class="mt-8 text-xl font-bold text-gray-900">The 40% Agentic Efficiency Rule</h3>
			<p class="text-gray-700">
				Research shows that well-designed AI agents can successfully automate approximately <strong
					>40% of identified manual friction</strong
				>. This conservative estimate accounts for:
			</p>
			<ul class="list-disc space-y-2 pl-6 text-gray-700">
				<li>Tasks that require human judgment or creativity (remain manual)</li>
				<li>The "human-in-the-loop" review time needed for resilient systems</li>
				<li>Edge cases and exceptions that agents can't handle yet</li>
				<li>Organizational change management and adoption curves</li>
			</ul>
			<p class="text-gray-700">
				Unlike speculative "100% automation" promises, the 40% rule provides <strong
					>CFO-defensible projections</strong
				> based on real-world implementations.
			</p>

			<h3 class="mt-8 text-xl font-bold text-gray-900">Why Capacity, Not Cost Reduction?</h3>
			<p class="text-gray-700">
				This calculator frames results as <strong>capacity expansion</strong>, not headcount reduction.
				The goal isn't to cut jobs—it's to redirect 40% of your team's "busy work" into high-value activities
				like strategic thinking, customer relationships, and innovation.
			</p>
			<p class="text-gray-700">
				Organizations that approach AI automation as a <strong>capacity multiplier</strong> see 3-5x
				higher adoption rates and employee satisfaction compared to those focused solely on cost cutting.
			</p>
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section class="mb-12">
	<div class="mx-auto max-w-4xl">
		<h2 class="mb-6 text-3xl font-bold text-gray-900">
			Frequently Asked Questions
		</h2>

		<div class="space-y-6">
			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<h3 class="text-lg font-bold text-gray-900">How is this different from the other ROI calculator?</h3>
				<p class="mt-2 text-gray-700">
					The standard ROI calculator focuses on <strong>team size and hours saved</strong>, using
					fully loaded costs (1.35x multiplier). This Agentic ROI Calculator focuses on <strong
						>operational friction percentages</strong
					>
					and uses the 40% agentic efficiency rule. Use the standard calculator for team-wide automation
					initiatives, and this one for diagnosing specific overhead categories.
				</p>
			</div>

			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<h3 class="text-lg font-bold text-gray-900">Why 40% efficiency instead of 80% or 100%?</h3>
				<p class="mt-2 text-gray-700">
					Conservative assumptions are critical for securing executive buy-in. The 40% efficiency
					accounts for human review time, edge cases, change management friction, and tasks that
					genuinely require human judgment. Organizations that overpromise (80-100% automation) lose
					credibility when reality doesn't match projections. With 40%, you'll likely <strong
						>exceed expectations</strong
					>, not fall short.
				</p>
			</div>

			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<h3 class="text-lg font-bold text-gray-900">What if my team's Manual Tax is over 50%?</h3>
				<p class="mt-2 text-gray-700">
					High Manual Tax (50-70%) is common in operations, customer support, and compliance-heavy
					roles. This represents a <strong>massive opportunity</strong>, but also means your team is
					running on autopilot rather than strategic thinking. Start with one friction category
					(e.g., repetitive tasks) and build a proof-of-concept agent before tackling all four
					simultaneously.
				</p>
			</div>

			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<h3 class="text-lg font-bold text-gray-900">How long does it take to see these results?</h3>
				<p class="mt-2 text-gray-700">
					With structured training, most teams deploy their first production-ready agent in <strong
						>4-6 weeks</strong
					>. Full organizational adoption typically takes 3-6 months. The payback period in this
					calculator assumes you reach steady-state efficiency within 90 days, which is realistic for
					teams completing professional training like our "AI Automation with Agents" workshop.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Final CTA -->
<section class="mb-12">
	<div class="mx-auto max-w-4xl rounded-2xl bg-gray-900 p-8 text-center text-white">
		<h2 class="mb-4 text-3xl font-bold">Stop Paying the Manual Tax</h2>
		<p class="mb-6 text-lg text-gray-300">
			Your team is already spending the hours—on busy work, context switching, and manual
			handoffs. Learn how to reclaim 40% of that capacity and redirect it toward high-impact work.
		</p>
		<a
			href="/training/ai-automation-with-agents"
			class="inline-block rounded-lg bg-blue-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-600"
		>
			View Workshop Curriculum & Enroll
		</a>
		<p class="mt-4 text-sm text-gray-400">
			Six weeks to production-ready agents. Zero technical debt. Complete team alignment.
		</p>
	</div>
</section>

<style>
	/* Additional custom prose styling if needed */
	.prose h3 {
		margin-top: 2rem;
	}
</style>
