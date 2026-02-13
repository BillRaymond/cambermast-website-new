<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';

	const pageMeta = {
		title: 'Forms SOPs | Admin | Cambermast',
		description: 'Internal SOP for form operations and submission workflows.'
	};
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/admin/sop-forms"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Forms SOPs</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		This page will define standard operating procedures for form setup, validation, webhook
		handling, and submission review.
	</p>
</header>

<section class="mt-10">
	<h2 class="text-2xl font-semibold">Scope</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Use this SOP for all internal form workflows, including pre/post training forms and testimonial
		collection processes.
	</p>
</section>
