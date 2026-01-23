<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let data: {
		id: string;
		redirectPath: string;
	};

	const pageTitle = `Campaign redirect | ${data.id}`;

	onMount(() => {
		if (!browser) return;
		window.location.replace(data.redirectPath);
	});
</script>

<SeoHead title={pageTitle} description="Campaign redirect" useDefaultImage={false} />

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
	<meta http-equiv="refresh" content={`0;url=${data.redirectPath}`} />
</svelte:head>

<section class="mx-auto max-w-2xl py-16 text-center">
	<h1 class="text-2xl font-bold text-gray-900">Redirecting…</h1>
	<p class="mt-3 text-sm text-gray-600">
		If you are not redirected automatically, open
		<a class="font-semibold text-blue-600 underline" href={data.redirectPath}>
			{data.redirectPath}
		</a>
	</p>
</section>
