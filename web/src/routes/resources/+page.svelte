<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/resources');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/resources" />

<section class="mx-auto mb-10 max-w-3xl space-y-4">
	<h1 class="text-3xl font-bold text-gray-900">Resources for AI training and delivery</h1>
	<p class="text-lg text-gray-700">
		Practical guides and checklists to help you prepare for Cambermast sessions, keep your
		team aligned, and apply what you learn.
	</p>
</section>

<section id="attendee-training-tips" class="mx-auto mb-16 max-w-4xl space-y-6">
	<div class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
		<div class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Resource</p>
			<h2 class="text-2xl font-semibold text-gray-900">AI personalization</h2>
			<p class="text-sm text-gray-700">
				Practical guidance on when to personalize, how to do it, and the exact preferences I use.
			</p>
		</div>
		<a
			class="inline-flex items-center justify-center rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
			href="/resources/ai-personalization"
		>
			Read more →
		</a>
	</div>

	<div class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
		<div class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Resource</p>
			<h2 class="text-2xl font-semibold text-gray-900">Attendee training tips for live sessions</h2>
			<p class="text-sm text-gray-700">
				Quick preparation steps that help everyone stay focused and get more from our live
				workshops.
			</p>
		</div>
		<a
			class="inline-flex items-center justify-center rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
			href="/resources/attendee-training-tips"
		>
			Read more →
		</a>
	</div>
</section>
