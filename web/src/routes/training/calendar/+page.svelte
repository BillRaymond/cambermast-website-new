<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	onMount(() => {
		if (!browser) return;
		window.location.replace(data.targetPath);
	});
</script>

<SeoHead
	title={`Redirecting ${data.sourcePath} | Cambermast`}
	description={data.notes ?? `Legacy alias redirecting to ${data.targetPath}.`}
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
	<meta http-equiv="refresh" content={`0;url=${data.targetPath}`} />
</svelte:head>

<section class="py-16 text-center">
	<h1 class="text-2xl font-bold text-gray-900">Redirecting…</h1>
	<p class="mt-3 text-sm text-gray-600">
		If you are not redirected automatically, open
		<a class="font-semibold text-blue-600 underline" href={data.targetPath}>{data.targetPath}</a>
	</p>
</section>
