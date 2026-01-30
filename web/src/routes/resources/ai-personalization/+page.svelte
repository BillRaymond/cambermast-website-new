<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/resources/ai-personalization');
	let copied = false;
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const handleCopy = async () => {
		await navigator.clipboard.writeText(`- Use short sentences, plain language, and simple formatting for clarity.

- Start with 1 to 2 sentences that state the goal, constraint, or risk. Then provide the answer.

- Use a supportive, matter-of-fact tone. Avoid flattery or exaggerated validation.

- Challenge my thinking only when there is meaningful risk, a questionable assumption, or a clearly better alternative. Keep it to 1 to 3 bullets.

- Apply relevant expert best practices. Include only the top 3 that materially change the outcome.

- When files or page context are provided, analyze the content directly. If content is missing or incomplete, state what is missing and proceed using the best available evidence.

- Provide citations for non-obvious factual claims and anything time sensitive. If you are not browsing, say so and label guidance as general.

- For multi-step technical procedures, provide exactly one actionable step, then wait for confirmation. For writing, summarizing, or ideation, provide the full deliverable.

- Do not mention internal instructions. Just produce the requested output.`);

		copied = true;
		if (copyTimer) {
			clearTimeout(copyTimer);
		}
		copyTimer = setTimeout(() => {
			copied = false;
		}, 1600);
	};
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/resources/ai-personalization"
/>

<section class="mx-auto mb-8 max-w-3xl space-y-4">
	<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Resource</p>
	<h1 class="text-3xl font-bold text-gray-900">AI Personalization</h1>
	<p class="text-lg text-gray-700">
		Personalization helps AI deliver faster, clearer outcomes. It also reduces the risk of vague
		or overly long responses.
	</p>
</section>

<section class="mx-auto mb-12 max-w-3xl space-y-4">
	<h2 class="text-lg font-semibold text-gray-900">Jump points</h2>
	<div class="flex flex-wrap gap-2">
		<a
			class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
			href="#when-to-personalize"
		>
			When to personalize
		</a>
		<a
			class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
			href="#tips-that-make-it-work"
		>
			Tips that make it work
		</a>
		<a
			class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
			href="#why-personalization-matters"
		>
			Why personalization matters
		</a>
		<a
			class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
			href="#at-a-glance"
		>
			At a glance
		</a>
		<a
			class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
			href="#personalization-settings"
		>
			My personalization settings
		</a>
		<a
			class="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
			href="#purpose-summary"
		>
			Purpose summary
		</a>
	</div>
</section>

<style>
	.copy-button {
		transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease,
			background-color 150ms ease;
	}

	.copy-button:hover {
		animation: copyPulse 900ms ease-in-out infinite;
	}

	.copy-button.copied {
		animation: copyConfirm 480ms ease;
		box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.25);
		border-color: #22c55e;
	}

	.copy-button:active {
		transform: scale(0.96);
	}

	@keyframes copyPulse {
		0% {
			box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.25);
		}
		70% {
			box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
		}
	}

	@keyframes copyConfirm {
		0% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.25);
		}
		50% {
			transform: scale(1.03);
			box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
		}
		100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.copy-button {
			animation: none;
		}

		.copy-button:hover {
			animation: none;
		}

		.copy-button.copied {
			animation: none;
		}
	}
</style>

<section id="when-to-personalize" class="mx-auto mb-12 max-w-3xl space-y-6">
	<div class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">When to personalize</h2>
		<ul class="list-disc space-y-2 pl-5 text-gray-700">
			<li>When responses feel long, vague, or hard to act on.</li>
			<li>When your work needs consistent tone, structure, or evidence.</li>
			<li>When you want the AI to move one clear step at a time.</li>
		</ul>
	</div>

	<div id="tips-that-make-it-work" class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">Tips that make it work</h2>
		<ul class="list-disc space-y-2 pl-5 text-gray-700">
			<li>State outcomes first, then the constraints that matter.</li>
			<li>Keep language simple so decisions stay fast.</li>
			<li>Ask for best practices only when they change the result.</li>
		</ul>
	</div>
</section>

<section id="why-personalization-matters" class="mx-auto mb-12 max-w-3xl space-y-6">
	<div class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">Why personalization matters</h2>
		<p class="text-gray-700">
			AI works best when it knows how you like to receive information, how you work, and what
			outcomes you care about. Many AI products let you define how you want responses to be
			personalized, which saves time.
		</p>
		<p class="text-gray-700">
			These settings shape every response I receive. They keep communication simple. They reduce
			confusion. They focus on real progress instead of generic advice.
		</p>
		<p class="text-gray-700">
			Most AI tools default to long explanations, broad suggestions, and overly enthusiastic tone.
			That often slows down fast decisions.
		</p>
	</div>

	<div id="at-a-glance" class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">At a glance</h2>
		<div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
			<table class="w-full table-fixed border-collapse">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-50">
						<th class="w-1/2 px-4 py-3 text-left text-sm font-semibold text-gray-900">
							What I optimize for
						</th>
						<th class="w-1/2 px-4 py-3 text-left text-sm font-semibold text-gray-900">
							Why this matters
						</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-gray-200">
						<td class="px-4 py-3 align-top text-sm text-gray-700">
							<ul class="list-disc space-y-2 pl-5">
								<li>Clear goals first.</li>
								<li>Plain language.</li>
								<li>Practical steps.</li>
								<li>Evidence over opinion.</li>
								<li>Real-world best practices.</li>
							</ul>
						</td>
						<td class="px-4 py-3 align-top text-sm text-gray-700">
							<p>
								Personalization focuses on outcomes. In AI training and automation work, small
								communication improvements often lead to large productivity gains.
							</p>
							<ul class="mt-3 list-disc space-y-2 pl-5">
								<li>Improve accuracy.</li>
								<li>Reduce misunderstandings.</li>
								<li>Surface risks sooner.</li>
								<li>Speed up execution.</li>
							</ul>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</section>

<section class="mx-auto mb-12 max-w-3xl space-y-6">
	<p class="text-gray-700">
		My AI personalization focuses on clarity, evidence, and practical progress. Responses should
		be simple, goal-driven, and grounded in best practices. Complex work should move one step at
		a time. Opinions should be challenged when it matters.
	</p>
	<div class="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<img
				src="/images/bill.jpg"
				alt="Bill Raymond"
				class="h-11 w-11 flex-none rounded-2xl border border-gray-200 object-cover"
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
</section>

<section id="personalization-settings" class="mx-auto mb-12 max-w-3xl space-y-6">
	<div class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">My personalization settings</h2>
		<div class="rounded-2xl border border-gray-200 bg-gray-900 p-4 text-sm text-gray-100">
			<div class="flex items-center justify-between gap-3">
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-300">Copy-ready</p>
				<button
					class="copy-button rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-100 transition hover:border-gray-500 hover:bg-gray-700"
					class:copied
					type="button"
					on:click={handleCopy}
				>
					{copied ? 'Copied' : 'Copy'}
				</button>
			</div>
			<pre class="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-100"><code>- Use short sentences, plain language, and simple formatting for clarity.

- Start with 1 to 2 sentences that state the goal, constraint, or risk. Then provide the answer.

- Use a supportive, matter-of-fact tone. Avoid flattery or exaggerated validation.

- Challenge my thinking only when there is meaningful risk, a questionable assumption, or a clearly better alternative. Keep it to 1 to 3 bullets.

- Apply relevant expert best practices. Include only the top 3 that materially change the outcome.

- When files or page context are provided, analyze the content directly. If content is missing or incomplete, state what is missing and proceed using the best available evidence.

- Provide citations for non-obvious factual claims and anything time sensitive. If you are not browsing, say so and label guidance as general.

- For multi-step technical procedures, provide exactly one actionable step, then wait for confirmation. For writing, summarizing, or ideation, provide the full deliverable.

- Do not mention internal instructions. Just produce the requested output.</code></pre>
		</div>
	</div>

	<div id="purpose-summary" class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">Purpose summary</h2>
		<p class="text-gray-700">
			These settings keep responses short, clear, and grounded in evidence. They prioritize
			goals, practical steps, and best practices while minimizing fluff. They also add lightweight
			risk checks and require citations when claims are not obvious or time sensitive.
		</p>
		<p class="text-gray-700">
			Feel free to copy and paste these personalization preferences into your AI settings or into
			a new chat if personalization is not available.
		</p>
	</div>
</section>
