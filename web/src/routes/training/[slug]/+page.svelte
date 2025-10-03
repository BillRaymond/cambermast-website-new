<script lang="ts">
	import ProgramPage from '$lib/components/training/ProgramPage.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import type { PageData } from './$types';

	export let data: PageData;

	type BackLink = {
		href: string;
		label: string;
	};

	const defaultBackLink: BackLink = { href: '/training', label: 'Back to AI Training' };
	let backLink: BackLink = defaultBackLink;

	$: backLink =
		browser && $page.url.searchParams.get('via') === 'agents'
			? { href: '/agents', label: 'Back to AI Agents & Automation' }
			: defaultBackLink;
</script>

<svelte:head>
	<title>{data.program.title} Training | Cambermast</title>
	<meta name="description" content={data.program.tagline} />
	<meta property="og:title" content={`${data.program.title} Training | Cambermast`} />
	<meta property="og:description" content={data.program.tagline} />
	<meta property="og:type" content="website" />
	{#if data.program.ogImage}
		<meta property="og:image" content={data.program.ogImage} />
	{/if}
	{#if data.program.ogImageAlt}
		<meta property="og:image:alt" content={data.program.ogImageAlt} />
	{/if}
	<meta name="twitter:card" content={data.program.ogImage ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={`${data.program.title} Training | Cambermast`} />
	<meta name="twitter:description" content={data.program.tagline} />
	{#if data.program.ogImage}
		<meta name="twitter:image" content={data.program.ogImage} />
	{/if}
	{#if data.program.ogImageAlt}
		<meta name="twitter:image:alt" content={data.program.ogImageAlt} />
	{/if}
</svelte:head>

<ProgramPage program={data.program} backLink={backLink} />
