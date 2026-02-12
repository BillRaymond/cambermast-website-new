<script lang="ts">
	import { page } from '$app/state';

	const routeModules = import.meta.glob('/src/routes/admin/**/+page.svelte');
	const labelOverrides: Record<string, string> = {
		'/admin': '🧭 Admin',
		'/admin/events': '🟢 Live Events',
		'/admin/drafts': '📝 Draft Events',
		'/admin/campaigns': '📣 Campaigns',
		'/admin/forms': '🧾 Forms'
	};
	const routePriority = ['/admin', '/admin/events', '/admin/drafts', '/admin/campaigns', '/admin/forms'];
	const toTitleCase = (value: string): string =>
		value
			.split('-')
			.filter(Boolean)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');

	const routePaths = Object.keys(routeModules)
		.map((filePath) => filePath.replace('/src/routes', '').replace('/+page.svelte', ''))
		.filter((routePath) => routePath.startsWith('/admin'))
		.filter((routePath) => !routePath.includes('['))
		.sort((a, b) => {
			const aIndex = routePriority.indexOf(a);
			const bIndex = routePriority.indexOf(b);
			if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
			if (aIndex !== -1) return -1;
			if (bIndex !== -1) return 1;
			return a.localeCompare(b);
		});

	const chips = routePaths.map((href) => {
		const fallbackLabel = `🧩 ${toTitleCase(href.split('/').filter(Boolean).at(-1) ?? 'Admin')}`;
		return { href, label: labelOverrides[href] ?? fallbackLabel };
	});

	const pathname = $derived(page.url.pathname);
</script>

<nav aria-label="Admin page navigation" class="mb-2 flex flex-wrap gap-2">
	{#each chips as chip}
		{@const active = chip.href === '/admin' ? pathname === '/admin' : pathname === chip.href || pathname.startsWith(`${chip.href}/`)}
		<a
			href={chip.href}
			aria-current={active ? 'page' : undefined}
			class={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
				active
					? 'border-blue-200 bg-blue-600/10 text-blue-700'
					: 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white hover:text-gray-900'
			}`}
		>
			{chip.label}
		</a>
	{/each}
</nav>
