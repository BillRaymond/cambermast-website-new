<script lang="ts">
	import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT, SITE_ORIGIN } from '$lib/config/site';

	export let title: string;
	export let description: string | undefined = undefined;
	export let path: string | undefined = undefined;
	export let image: string | undefined = undefined;
	export let imageAlt: string | undefined = undefined;
	export let imageWidth: number | undefined = undefined;
	export let imageHeight: number | undefined = undefined;
	export let type: string = 'website';
	export let siteName: string | undefined = 'Cambermast';
	export let useDefaultImage: boolean = true;
	export let feedLinks:
		| Array<{ href: string; title: string }>
		| undefined = undefined;

	const origin = SITE_ORIGIN.replace(/\/$/, '');
	const canonicalUrl = path ? `${origin}${path}` : undefined;
	const resolvedImage = image ?? (useDefaultImage ? DEFAULT_OG_IMAGE : undefined);
	const absoluteImage = resolvedImage
		? resolvedImage.startsWith('http')
			? resolvedImage
			: `${origin}${resolvedImage}`
		: undefined;
	const resolvedImageAlt =
		resolvedImage === DEFAULT_OG_IMAGE ? (imageAlt ?? DEFAULT_OG_IMAGE_ALT) : imageAlt;
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
	{#each feedLinks ?? [] as feed}
		<link rel="alternate" type="application/rss+xml" href={feed.href} title={feed.title} />
	{/each}
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
		{#if imageWidth && imageHeight}
			<meta property="og:image:width" content={imageWidth.toString()} />
			<meta property="og:image:height" content={imageHeight.toString()} />
		{/if}
		{#if resolvedImageAlt}
			<meta property="og:image:alt" content={resolvedImageAlt} />
		{/if}
	{/if}
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:title" content={title} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	{#if absoluteImage}
		<meta name="twitter:image" content={absoluteImage} />
		{#if resolvedImageAlt}
			<meta name="twitter:image:alt" content={resolvedImageAlt} />
		{/if}
	{/if}
</svelte:head>
