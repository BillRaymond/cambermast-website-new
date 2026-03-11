<script lang="ts">
	import { dev } from '$app/environment';
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
		href="/admin/qr"
		class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
	>
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">QR codes</p>
		<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Major routes</p>
		<p class="mt-1 text-sm text-gray-600">
			Copyable dev and production links with downloadable QR assets for major public pages.
		</p>
	</a>

	{#if dev}
		<a
			href="/admin/events/create"
			class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
		>
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Dev tool</p>
			<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Create Event</p>
			<p class="mt-1 text-sm text-gray-600">
				Build training-derived or external events with draft preview, write flow, and embedded image
				generation.
			</p>
		</a>

		<a
			href="/admin/image-gen"
			class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
		>
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Dev tool</p>
			<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">
				Image Gen mini app
			</p>
			<p class="mt-1 text-sm text-gray-600">
				Generate square/landscape/portrait assets with OpenAI and back up all outputs to MinIO.
			</p>
		</a>
	{/if}

	<a
		href="/admin/sop"
		class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
	>
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Playbook</p>
		<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Event SOPs</p>
		<p class="mt-1 text-sm text-gray-600">Working procedures for event and campaign maintenance.</p>
	</a>

	<a
		href="/admin/sop-training"
		class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
	>
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Playbook</p>
		<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Training SOPs</p>
		<p class="mt-1 text-sm text-gray-600">Training catalog and schedule SOP coverage.</p>
	</a>

	<a
		href="/admin/sop-testimonials"
		class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
	>
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Playbook</p>
		<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">
			Testimonial SOPs
		</p>
		<p class="mt-1 text-sm text-gray-600">
			Testimonial intake, validation, and publishing procedures.
		</p>
	</a>
</section>
