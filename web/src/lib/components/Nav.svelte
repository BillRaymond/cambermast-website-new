<svelte:options runes={true} />

<script lang="ts">
	import { page } from '$app/state';
	import catalog from '$lib/data/catalog.json';
	import { listTrainingPrograms } from '$lib/data/training';
	import { normalizeToday, isSessionUpcoming, hasExternalRegistration } from '$lib/data/training/session-utils';

	const today = normalizeToday();
	const upcomingExists = listTrainingPrograms().some((program) =>
		(program.sessions ?? []).some(
			(session) => hasExternalRegistration(session) && isSessionUpcoming(session, today)
		)
	);

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

	const navLinks = [
		...catalogLinks,
		{ href: '/training/calendar', label: 'Calendar' },
		{ href: '/about', label: 'About' }
	];

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
			class={`flex items-center gap-2 ${
				pathname.startsWith(link.href) ? 'font-semibold text-blue-600' : 'hover:text-blue-600'
			}`}
		>
			{#if link.href === '/training/calendar' && upcomingExists}
				<span class="relative flex h-2.5 w-2.5">
					<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/80 opacity-75"></span>
					<span class="relative inline-flex h-full w-full rounded-full bg-blue-600"></span>
				</span>
			{/if}
			<span>{link.label}</span>
		</a>
	{/each}
</nav>
