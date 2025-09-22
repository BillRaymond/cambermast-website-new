<script>
	import '../app.css';
	import Nav from '$lib/Nav.svelte';
</script>

<header class="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
	<div
		class="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
	>
		<a href="/" class="text-xl font-bold text-gray-900">Cambermast</a>
		<Nav />
	</div>
</header>

<main class="min-h-screen">
	<slot />
</main>

<footer class="border-t">
	<div class="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-gray-500">
		© {new Date().getFullYear()} Cambermast LLC ·
		<a class="underline" href="mailto:hello@cambermast.com">hello@cambermast.com</a>
	</div>
</footer>
