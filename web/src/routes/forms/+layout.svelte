<svelte:options runes={true} />

<script lang="ts">
    let { children } = $props<{ children?: () => any }>();
</script>

<svelte:head>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

{@render children?.()}
