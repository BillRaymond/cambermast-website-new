<script>
	import '../app.css';
	import { page } from '$app/stores'; // <- use this
</script>

<header class="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
	<div
		class="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
	>
		<a href="/" class="text-xl font-bold text-gray-900">Cambermast</a>
		<nav class="flex flex-wrap gap-5 text-gray-700">
			<a
				href="/"
				class={$page.url.pathname === '/' ? 'font-semibold text-blue-600' : 'hover:text-blue-600'}
			>
				Home
			</a>
			<a
				href="/training"
				class={$page.url.pathname.startsWith('/training')
					? 'font-semibold text-blue-600'
					: 'hover:text-blue-600'}
			>
				AI Training
			</a>
			<a
				href="/contact"
				class={$page.url.pathname.startsWith('/contact')
					? 'font-semibold text-blue-600'
					: 'hover:text-blue-600'}
			>
				Contact
			</a>
		</nav>
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
