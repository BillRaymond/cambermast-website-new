<script lang="ts">
	import ProgramPage from '$lib/components/training/ProgramPage.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.program.title} Training | Cambermast</title>
	<meta name="description" content={data.program.tagline} />
</svelte:head>

<ProgramPage program={data.program} />
