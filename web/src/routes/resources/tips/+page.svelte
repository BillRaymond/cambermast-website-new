<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import TrainingTipsContent from '$lib/components/resources/TrainingTipsContent.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/resources/tips');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/resources/tips" />

<section class="mx-auto mb-8 max-w-3xl space-y-4">
	<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Training success</p>
	<h1 class="text-3xl font-bold text-gray-900">Get the most out of your live training</h1>
	<p class="text-lg text-gray-700">
		These quick prep steps help you get the most value from Cambermast live training sessions and keep
		the group moving together.
	</p>
</section>

<section class="mx-auto mb-16 max-w-3xl space-y-6">
	<TrainingTipsContent />
</section>
