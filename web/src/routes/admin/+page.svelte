<script lang="ts">
	import { dev } from '$app/environment';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
</script>

<SeoHead
	title="Admin | Cambermast"
	description="Internal admin links."
	path="/admin"
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

<div class="mt-10 space-y-10">
	<section>
		<div class="mb-4">
			<h2 class="text-sm font-semibold tracking-[0.18em] text-gray-900 uppercase">Core workflows</h2>
			<p class="mt-1 text-sm text-gray-600">Start here for the pages used most often to review, manage, and publish work.</p>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
			<a
				href="/admin/events"
				class="group rounded-2xl border border-gray-300 bg-white p-5 shadow-sm transition hover:border-gray-400"
			>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Registry</p>
				<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Events</p>
				<p class="mt-1 text-sm text-gray-600">
					Review visibility, lifecycle, registration state, and campaign linkage.
				</p>
			</a>

			<a
				href="/admin/drafts"
				class="group rounded-2xl border border-gray-300 bg-white p-5 shadow-sm transition hover:border-gray-400"
			>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Review</p>
				<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Drafts</p>
				<p class="mt-1 text-sm text-gray-600">
					Draft training programs, sessions, and external events.
				</p>
			</a>

			<a
				href="/admin/campaigns"
				class="group rounded-2xl border border-gray-300 bg-white p-5 shadow-sm transition hover:border-gray-400"
			>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Registry</p>
				<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Campaigns</p>
				<p class="mt-1 text-sm text-gray-600">Production links, tracking links, and QR assets.</p>
			</a>

			<a
				href="/admin/partners"
				class="group rounded-2xl border border-gray-300 bg-white p-5 shadow-sm transition hover:border-gray-400"
			>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Partner</p>
				<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">
					Campaign assets
				</p>
				<p class="mt-1 text-sm text-gray-600">Partner-ready production links and QR downloads.</p>
			</a>

			<a
				href="/admin/forms"
				class="group rounded-2xl border border-gray-300 bg-white p-5 shadow-sm transition hover:border-gray-400"
			>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Forms</p>
				<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">Forms hub</p>
				<p class="mt-1 text-sm text-gray-600">
					Pre-training, post-training, and testimonial form links.
				</p>
			</a>
		</div>
	</section>

	<section>
		<div class="mb-4">
			<h2 class="text-sm font-semibold tracking-[0.18em] text-gray-700 uppercase">Supporting tools</h2>
			<p class="mt-1 text-sm text-gray-600">Fast helpers for reuse, copy prep, and route handoff tasks.</p>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
			<a
				href="/admin/events/luma"
				class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
			>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Copy helper</p>
				<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">
					Luma event copy
				</p>
				<p class="mt-1 text-sm text-gray-600">
					Find internal events, then copy image, name, and description blocks formatted for Luma.
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
		</div>
	</section>

	<section>
		<div class="mb-4">
			<h2 class="text-sm font-semibold tracking-[0.18em] text-gray-700 uppercase">Feeds and outputs</h2>
			<p class="mt-1 text-sm text-gray-600">Reference the public output contracts and downloadable machine-readable feeds here.</p>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
			<article class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Commerce feed</p>
				<a href="/admin/sop-commerce" class="mt-2 inline-block text-lg font-semibold text-gray-900 hover:text-blue-900">
					Commerce feed SOP
				</a>
				<p class="mt-1 text-sm text-gray-600">
					Eligibility rules, preview/schema examples, and direct links to the production OpenAI commerce
					endpoints.
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<a
						href="/api/commerce-products.json"
						rel="external"
						class="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
					>
						Commerce API
					</a>
					<a
						href="/feed/openai-products.jsonl.gz"
						rel="external"
						class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
					>
						OpenAI Product Feed
					</a>
				</div>
			</article>
		</div>
	</section>

	<section>
		<div class="mb-4">
			<h2 class="text-sm font-semibold tracking-[0.18em] text-gray-700 uppercase">SOPs and guidance</h2>
			<p class="mt-1 text-sm text-gray-600">Use these playbooks when you need process, policy, or maintenance instructions.</p>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
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

			<a
				href="/admin/sop-redirects"
				class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
			>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Playbook</p>
				<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">
					Redirect SOPs
				</p>
				<p class="mt-1 text-sm text-gray-600">
					Registry, validation, and legacy URL maintenance procedures.
				</p>
			</a>
		</div>
	</section>

	{#if dev}
		<section>
			<div class="mb-4">
				<h2 class="text-sm font-semibold tracking-[0.18em] text-gray-700 uppercase">Dev tools</h2>
				<p class="mt-1 text-sm text-gray-600">Development-only helpers for admin workflows, previews, and internal tooling.</p>
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
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
					href="/admin/redirects"
					class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
				>
					<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Dev tool</p>
					<p class="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-900">
						Redirect registry
					</p>
					<p class="mt-1 text-sm text-gray-600">
						CRUD legacy URLs, feed aliases, and machine-readable compatibility paths.
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
			</div>
		</section>
	{/if}
</div>
