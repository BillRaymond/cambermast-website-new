<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ResourceCard from '$lib/components/resources/ResourceCard.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/resources');
	const heroImage = '/images/cambermast-content-8-resources-og.jpeg';
	const heroImageAlt = 'Resources hero image with title text.';

	const resources = [
		{
			title: 'Attendee training tips for live sessions',
			description:
				'Quick preparation steps that help everyone stay focused and get more from our live workshops.',
			href: '/resources/attendee-training-tips',
			imageSrc: '/images/cambermast-content-7-attendee-training-tips-og.jpeg',
			imageAlt: 'Attendee training tips featured image.'
		},
		{
			title: 'AI personalization',
			description:
				'Practical guidance on when to personalize, how to do it, and the exact preferences I use.',
			href: '/resources/ai-personalization',
			imageSrc: '/images/cambermast-content-6-ai-personalization-og.jpeg',
			imageAlt: 'AI Personalization featured image.'
		}
	];
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/resources"
	image={heroImage}
	imageAlt={heroImageAlt}
/>

<section class="mx-auto mb-10 max-w-3xl space-y-4">
	<h1 class="text-3xl font-bold text-gray-900">Resources for AI training and delivery</h1>
	<p class="text-lg text-gray-700">
		Practical guides and checklists to help you prepare for Cambermast sessions, keep your
		team aligned, and apply what you learn.
	</p>
	<figure class="mx-auto w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm sm:w-1/2">
		<img
			class="h-auto w-full object-contain"
			src={heroImage}
			alt={heroImageAlt}
			loading="eager"
			decoding="async"
		/>
	</figure>
</section>

<section id="attendee-training-tips" class="mx-auto mb-16 max-w-4xl space-y-6">
	{#each resources as resource (resource.href)}
		<ResourceCard {...resource} />
	{/each}
</section>
