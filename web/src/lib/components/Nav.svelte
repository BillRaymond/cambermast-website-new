<script>
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import catalog from '$lib/data/catalog.json';

	export let vertical = false;

	// Build nav links from catalog, sorted by homeorder
	const navLinks = Object.entries(catalog)
		.sort(([, a], [, b]) => (a.homeorder ?? 999) - (b.homeorder ?? 999))
		.map(([slug, sec]) => ({
			href: sec.route,
			label: sec.navlabel
		}));

	const dispatch = createEventDispatcher();

	const handleNavClick = (event) => {
		if (event.defaultPrevented) return;
		if (event.button !== 0) return;
		if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
		dispatch('navigate');
	};
</script>

<nav
	class={`flex gap-6 ${
		vertical
			? 'flex-col items-start py-1.5 sm:flex-row sm:items-center sm:py-0'
			: 'flex-row items-center'
	}`}
>
	<a
		href="/"
		on:click={handleNavClick}
		class={$page.url.pathname === '/' ? 'font-semibold text-blue-600' : 'hover:text-blue-600'}
	>
		Home
	</a>
	{#each navLinks as link}
		<a
			href={link.href}
			on:click={handleNavClick}
			class={$page.url.pathname.startsWith(link.href)
				? 'font-semibold text-blue-600'
				: 'hover:text-blue-600'}
		>
			{link.label}
		</a>
	{/each}
</nav>
