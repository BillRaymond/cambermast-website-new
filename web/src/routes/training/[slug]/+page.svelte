<script lang="ts">
	import ProgramPage from '$lib/components/training/ProgramPage.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
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
	let canonicalPath: string;
	let seoTitle: string;
	let seoDescription: string | undefined;
	let seoImage: string | undefined;
	let seoImageAlt: string | undefined;
	let courseJsonLd = '';

	const origin = SITE_ORIGIN.replace(/\/$/, '');

	$: backLink =
		browser && $page.url.searchParams.get('via') === 'agents'
			? { href: '/agents', label: 'Back to AI Agents & Automation' }
			: defaultBackLink;

	$: canonicalPath = data.program.route ?? `/training/${data.program.slug}`;
	$: seoTitle = `${data.program.title} Training | Cambermast`;
	$: seoDescription = data.program.tagline ?? data.program.description;
	$: seoImage = data.program.ogImage;
	$: seoImageAlt = data.program.ogImageAlt ?? data.program.title;
	$: courseJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Course',
		name: data.program.title,
		description: data.program.description ?? data.program.tagline,
		url: `${origin}${canonicalPath}`,
		provider: {
			'@type': 'Organization',
			name: 'Cambermast',
			url: SITE_ORIGIN
		},
		...(data.program.sku ? { courseCode: data.program.sku } : {}),
		...(data.program.audience?.length
			? { keywords: data.program.audience.join(', ') }
			: {})
	});
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	path={canonicalPath}
	image={seoImage}
	imageAlt={seoImageAlt}
	type="article"
/>

<svelte:head>
	<script type="application/ld+json">
		{@html courseJsonLd}
	</script>
</svelte:head>

<ProgramPage program={data.program} backLink={backLink} relatedEvents={data.relatedEvents} />
