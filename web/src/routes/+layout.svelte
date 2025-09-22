<script>
	import '../app.css';
	import { page } from '$app/stores'; // keep this (works with your setup)
	import Nav from '$lib/components/Nav.svelte';
</script>

<header class="flex flex-col items-center border-b bg-white px-6 py-4">
	<a href="/" class="mb-2 block" style="width:160px;min-width:160px;">
		<img
			src="/images/cambermast-logo-full.png"
			alt="Cambermast logo"
			style="width:100%;height:auto;"
		/>
	</a>
	<div class="flex w-full flex-wrap justify-center">
		<Nav />
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
