<script>
	import { page } from '$app/stores';
</script>

<header class="bg-white shadow">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
		<a href="/" class="text-xl font-bold text-gray-900">Cambermast</a>
		<nav class="flex gap-6 text-gray-700">
			<a
				href="/"
				class={$page.url.pathname === '/' ? 'font-semibold text-blue-600' : 'hover:text-blue-600'}
				>Home</a
			>
			<a
				href="/programs"
				class={$page.url.pathname.startsWith('/programs')
					? 'font-semibold text-blue-600'
					: 'hover:text-blue-600'}>Programs</a
			>
			<a
				href="/workshops"
				class={$page.url.pathname.startsWith('/workshops')
					? 'font-semibold text-blue-600'
					: 'hover:text-blue-600'}>Workshops</a
			>
			<a
				href="/contact"
				class={$page.url.pathname.startsWith('/contact')
					? 'font-semibold text-blue-600'
					: 'hover:text-blue-600'}>Contact</a
			>
		</nav>
	</div>
</header>

<main class="min-h-screen">
	<slot />
</main>
