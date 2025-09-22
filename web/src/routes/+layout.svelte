<script>
	import '../app.css';
	import { page } from '$app/stores';
	import Nav from '$lib/components/Nav.svelte';

	let navOpen = false;
</script>

<header class="flex flex-col items-center border-b bg-white px-6 py-4">
	<a href="/" class="mb-2 block" style="width:160px;min-width:160px;">
		<img
			src="/images/cambermast-logo-full.png"
			alt="Cambermast logo"
			style="width:100%;height:auto;"
		/>
	</a>
	<div class="flex w-full flex-wrap justify-center relative">
		<!-- Hamburger for small screens -->
		<button
			class="sm:hidden flex items-center px-3 py-2 border rounded text-gray-700 border-gray-400 mr-2"
			aria-label="Toggle navigation"
			on:click={() => navOpen = !navOpen}
		>
			<span class="text-xl mr-2">☰</span> Navigation
		</button>
		<!-- Nav: horizontal on sm+, vertical dropdown on mobile when open -->
		<div class={`w-full sm:w-auto ${navOpen ? '' : 'hidden'} sm:flex`}>
			<Nav vertical={navOpen} />
		</div>
	</div>
</header>

<!-- Default container for every page -->
<main class="mx-auto max-w-7xl px-6 pb-20">
	<slot />
</main>

<footer class="border-t">
	<div class="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-gray-500">
		© {new Date().getFullYear()} Cambermast LLC ·
		<a class="underline" href="mailto:hello@cambermast.com">hello@cambermast.com</a>
	</div>
</footer>
