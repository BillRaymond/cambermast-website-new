<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ResourceCard from '$lib/components/resources/ResourceCard.svelte';
	import { listResources } from '$lib/data/resources';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/resources');
	const heroImage = '/images/cambermast-content-8-resources-og.jpeg';
	const heroImageAlt = 'Resources hero image with title text.';

	const resources = listResources();
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/resources"
	image={heroImage}
	imageAlt={heroImageAlt}
	feedLinks={[{ href: '/feed/resources.xml', title: 'Cambermast Resources' }]}
/>

<section class="text-left">
	<h1 class="mb-6 text-3xl font-bold">Resources for AI training and delivery</h1>
	<p class="mb-8 text-gray-700">
		Practical guides and checklists to help you prepare for Cambermast sessions, keep your team
		aligned, and apply what you learn.
	</p>
</section>

<section id="attendee-training-tips" class="mb-16 space-y-6">
	{#each resources as resource (resource.route)}
		<ResourceCard
			href={resource.route}
			title={resource.title}
			description={resource.summary}
			imageSrc={resource.imageSrc}
			imageAlt={resource.imageAlt}
			label={resource.label ?? 'Resource'}
		/>
	{/each}
</section>
