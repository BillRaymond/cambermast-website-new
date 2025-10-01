<script lang="ts">
	import ProgramPage from '$lib/components/training/ProgramPage.svelte';
	import { aiAutomationWithAgents } from '$lib/data/training/ai-automation-with-agents';
</script>

<ProgramPage
	program={aiAutomationWithAgents}
	backLink={{ href: '/agents', label: 'Back to AI Agents & Automation' }}
/>
