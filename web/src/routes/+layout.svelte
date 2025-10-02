<script>
	import '../app.css';
	import { page } from '$app/stores';
	import Nav from '$lib/components/Nav.svelte';

	let navOpen = false;
</script>

<header class="flex flex-col items-center border-b bg-white px-5 py-3">
	<a href="/" class="mb-2 block" style="width:160px;min-width:160px;">
		<img
			src="/images/cambermast-logo-full.png"
			alt="Cambermast logo"
			style="width:100%;height:auto;"
		/>
	</a>
	<div class="relative flex w-full flex-wrap justify-center">
		<!-- Hamburger for small screens -->
		<button
			class="mr-2 flex items-center rounded border border-gray-400 px-3 py-2 text-gray-700 sm:hidden"
			aria-label="Toggle navigation"
			on:click={() => (navOpen = !navOpen)}
		>
			<span class="mr-2 text-xl">☰</span> Navigation
		</button>
		<!-- Nav: horizontal on sm+, vertical dropdown on mobile when open -->
		<div class={`w-full sm:w-auto ${navOpen ? '' : 'hidden'} sm:flex`}>
			<Nav vertical={navOpen} on:navigate={() => (navOpen = false)} />
		</div>
	</div>
</header>

<!-- Default container for every page -->
<main class="text-fluid mx-auto max-w-6xl px-4 pb-16">
	<slot />
</main>

<footer class="border-t">
	<div class="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-500">
		© {new Date().getFullYear()} Cambermast LLC ·
		<a class="underline" href="mailto:hello@cambermast.com">hello@cambermast.com</a>
	</div>
</footer>
