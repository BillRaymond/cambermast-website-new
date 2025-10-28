<script lang="ts">
	import { SITE_ORIGIN } from '$lib/config/site';

	export let title: string;
	export let description: string | undefined = undefined;
	export let path: string | undefined = undefined;
	export let image: string | undefined = undefined;
	export let imageAlt: string | undefined = undefined;
	export let type: string = 'website';
	export let siteName: string | undefined = 'Cambermast';

	const origin = SITE_ORIGIN.replace(/\/$/, '');
	const canonicalUrl = path ? `${origin}${path}` : undefined;
	const absoluteImage = image
		? image.startsWith('http')
			? image
			: `${origin}${image}`
		: undefined;
	const twitterCard = absoluteImage ? 'summary_large_image' : 'summary';
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	{#if canonicalUrl}
		<link rel="canonical" href={canonicalUrl} />
		<meta property="og:url" content={canonicalUrl} />
	{/if}
	<meta property="og:title" content={title} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:type" content={type} />
	{#if siteName}
		<meta property="og:site_name" content={siteName} />
	{/if}
	{#if absoluteImage}
		<meta property="og:image" content={absoluteImage} />
		{#if imageAlt}
			<meta property="og:image:alt" content={imageAlt} />
		{/if}
	{/if}
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:title" content={title} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	{#if absoluteImage}
		<meta name="twitter:image" content={absoluteImage} />
		{#if imageAlt}
			<meta name="twitter:image:alt" content={imageAlt} />
		{/if}
	{/if}
</svelte:head>
