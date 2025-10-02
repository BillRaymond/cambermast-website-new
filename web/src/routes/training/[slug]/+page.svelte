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
</svelte:head>

<ProgramPage program={data.program} backLink={backLink} />
