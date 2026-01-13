<script lang="ts">
	import { tools } from '$lib/data/tools';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ToolPage from '$lib/components/tools/ToolPage.svelte';

	const tool = tools.find((entry) => entry.slug === 'ai-readiness-assessment');
	const pageMeta = getSeo('/tools/ai-readiness-assessment');
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/tools/ai-readiness-assessment"
/>

{#if tool && !tool.hidden}
	<ToolPage {tool} />
{:else}
	<p class="text-gray-700">Tool details are being prepared.</p>
{/if}
