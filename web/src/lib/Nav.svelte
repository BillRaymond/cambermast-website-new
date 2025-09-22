<script>
	import { page } from '$app/stores';
</script>

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
