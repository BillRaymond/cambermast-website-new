<script lang="ts">
	import ResourceHeader from '$lib/components/resources/ResourceHeader.svelte';
	import TrainingTipsContent from '$lib/components/resources/TrainingTipsContent.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/resources/attendee-training-tips');
	const heroImage = '/images/cambermast-content-7-attendee-training-tips-og.jpeg';
	const heroImageAlt = 'Attendee training tips hero image with title text.';
</script>

<ResourceHeader
	title="Get the most out of your live training"
	description="These quick prep steps help you get the most value from Cambermast live training sessions and keep the group moving together."
	path="/resources/attendee-training-tips"
	imageSrc={heroImage}
	imageAlt={heroImageAlt}
	label="Training success"
/>

<section class="mx-auto mb-16 max-w-3xl space-y-6">
	<TrainingTipsContent />
</section>
