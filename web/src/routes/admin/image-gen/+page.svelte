<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import AdminImageGenPanel from '$lib/components/admin/AdminImageGenPanel.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const pageMeta = {
		title: 'Admin Image Generator | Cambermast',
		description: 'Dev-only image generation mini app with OpenAI + MinIO backup.'
	};

	let slug = '';
	let destinationType:
		| 'events'
		| 'training'
		| 'resources'
		| 'featured-images'
		| 'static-templates'
		| 'custom' = 'featured-images';
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/admin/image-gen" />

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Image Generator (Dev)</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		Generate square, landscape, and portrait image variants with OpenAI. Every generated image is
		backed up to MinIO via C3.
	</p>
</header>

<section class="mt-8">
	<AdminImageGenPanel
		isDev={data.isDev}
		mode="standalone"
		bind:slug
		bind:destinationType
		destinationOptions={data.destinationOptions}
		destinationReferences={data.destinationReferences}
		autoUpdateDestinationRecord={
			destinationType !== 'custom' &&
			destinationType !== 'featured-images' &&
			destinationType !== 'static-templates'
		}
		defaultTemplateUrl={data.defaultTemplateUrl}
		defaultPrompts={data.defaultPrompts}
		defaultN={data.defaultN}
		minN={data.minN}
		maxN={data.maxN}
	/>
</section>
