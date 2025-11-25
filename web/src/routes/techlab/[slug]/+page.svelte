<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ProgramPage from '$lib/components/techlab/ProgramPage.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import type { PageData } from './$types';

	export let data: PageData;

	const canonicalPath = data.program.route ?? `/techlab/${data.program.slug}`;
	const seoTitle = `${data.program.title} | TechLAB × Cambermast`;
	const seoDescription = data.program.tagline ?? data.program.description;
	const seoImage = data.program.ogImage ?? data.program.heroImage;
	const seoImageAlt = data.program.ogImageAlt ?? data.program.heroImageAlt ?? data.program.title;
	const courseJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Course',
		name: data.program.title,
		description: data.program.description ?? data.program.tagline,
		url: `${SITE_ORIGIN.replace(/\/$/, '')}${canonicalPath}`,
		provider: {
			'@type': 'Organization',
			name: 'TechLAB × Cambermast',
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
	siteName="TechLAB × Cambermast"
/>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700;900&display=swap"
	/>
	<script type="application/ld+json">
		{@html courseJsonLd}
	</script>
</svelte:head>

<ProgramPage program={data.program} backLink={{ href: '/techlab', label: 'Back to TechLAB programs' }} />
