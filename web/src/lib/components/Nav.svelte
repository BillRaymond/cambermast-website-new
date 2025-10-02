<svelte:options runes={true} />

<script lang="ts">
	import { page } from '$app/state';
	import catalog from '$lib/data/catalog.json';

	const { vertical = false, onNavigate } = $props<{
		vertical?: boolean;
		onNavigate?: () => void;
	}>();

	// Build nav links from catalog, sorted by homeorder
	const catalogLinks = Object.entries(catalog)
		.sort(([, a], [, b]) => (a.homeorder ?? 999) - (b.homeorder ?? 999))
		.map(([slug, sec]) => ({
			href: sec.route,
			label: sec.navlabel
		}));

	const navLinks = [...catalogLinks, { href: '/about', label: 'About' }];

	const pathname = $derived(page.url.pathname);

	const handleNavClick = (event: MouseEvent) => {
		if (event.defaultPrevented) return;
		if (event.button !== 0) return;
		if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
		onNavigate?.();
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
		onclick={handleNavClick}
		class={pathname === '/' ? 'font-semibold text-blue-600' : 'hover:text-blue-600'}
	>
		Home
	</a>
	{#each navLinks as link}
		<a
			href={link.href}
			onclick={handleNavClick}
			class={pathname.startsWith(link.href) ? 'font-semibold text-blue-600' : 'hover:text-blue-600'}
		>
			{link.label}
		</a>
	{/each}
</nav>
