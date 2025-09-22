<script>
	import { page } from '$app/stores';
	import catalog from '$lib/data/catalog.json';

	// Build nav links from catalog, sorted by homeorder
	const navLinks = Object.entries(catalog)
		.sort(([, a], [, b]) => (a.homeorder ?? 999) - (b.homeorder ?? 999))
		.map(([slug, sec]) => ({
			href: sec.route,
			label: sec.navlabel
		}));
</script>

<nav class="flex flex-wrap gap-5 text-gray-700">
	<a
		href="/"
		class={$page.url.pathname === '/' ? 'font-semibold text-blue-600' : 'hover:text-blue-600'}
	>
		Home
	</a>
	{#each navLinks as link}
		<a
			href={link.href}
			class={$page.url.pathname.startsWith(link.href)
				? 'font-semibold text-blue-600'
				: 'hover:text-blue-600'}
		>
			{link.label}
		</a>
	{/each}
	<a
		href="/contact"
		class={$page.url.pathname.startsWith('/contact')
			? 'font-semibold text-blue-600'
			: 'hover:text-blue-600'}
	>
		Contact
	</a>
</nav>
