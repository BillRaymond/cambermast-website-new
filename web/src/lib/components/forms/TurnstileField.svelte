<script lang="ts">
	export let containerRef: HTMLDivElement | null = null;
	export let label = 'Verification';
	export let required = true;
	export let wrapperClass = '';
</script>

<div class={wrapperClass}>
	<span class="block text-sm font-medium text-gray-700">
		{label}
		{#if required}
			<span class="text-red-500" aria-hidden="true">*</span>
			<span class="sr-only"> required</span>
		{/if}
	</span>
	<div
		class="mt-1 rounded-md border bg-white px-3 py-2"
		bind:this={containerRef}
		role="group"
		aria-label={required ? `${label} (required)` : label}
	>
		<noscript>Enable JavaScript to complete the verification step.</noscript>
	</div>
</div>
