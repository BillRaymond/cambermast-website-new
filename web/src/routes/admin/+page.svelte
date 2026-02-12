<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
</script>

<SeoHead title="Admin | Cambermast" description="Internal admin links." path="/admin" useDefaultImage={false} />

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="mx-auto max-w-4xl px-4 py-10 md:px-6">
	<header class="flex flex-col gap-3 text-center">
		<p class="text-xs font-semibold tracking-[0.25em] text-blue-700 uppercase">Internal</p>
		<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Admin</h1>
		<p class="mx-auto max-w-2xl text-sm text-gray-600">
			Quick links for internal registries and review pages. This route is intentionally excluded from
			sitemaps and navigation.
		</p>
	</header>

	<section class="mt-10 grid gap-4 sm:grid-cols-2">
		<a
			href="/admin/events"
			class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
		>
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Registry</p>
			<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Events</p>
			<p class="mt-1 text-sm text-gray-600">
				Review visibility, lifecycle, registration state, and campaign linkage.
			</p>
		</a>

		<a
			href="/admin/drafts"
			class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
		>
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Review</p>
			<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Drafts</p>
			<p class="mt-1 text-sm text-gray-600">Draft training programs, sessions, and external events.</p>
		</a>

		<a
			href="/admin/campaigns"
			class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
		>
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Registry</p>
			<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Campaigns</p>
			<p class="mt-1 text-sm text-gray-600">Production links, tracking links, and QR assets.</p>
		</a>

		<a
			href="/admin/campaigns/partners"
			class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
		>
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Partner</p>
			<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">
				Campaign assets
			</p>
			<p class="mt-1 text-sm text-gray-600">Partner-ready production links and QR downloads.</p>
		</a>
	</section>
</main>

