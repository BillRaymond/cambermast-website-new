<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
</script>

<SeoHead
	title="Admin | Cambermast"
	description="Internal admin links."
	path="/admin"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Admin</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
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
		<p class="mt-1 text-sm text-gray-600">
			Draft training programs, sessions, and external events.
		</p>
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

	<a
		href="/admin/forms"
		class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
	>
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Forms</p>
		<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Forms hub</p>
		<p class="mt-1 text-sm text-gray-600">
			Pre-training, post-training, and testimonial form links.
		</p>
	</a>

	<a
		href="/admin/sop"
		class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
	>
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Playbook</p>
		<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">SOP</p>
		<p class="mt-1 text-sm text-gray-600">
			Working procedures for events, drafts, campaigns, and forms maintenance.
		</p>
	</a>
</section>
