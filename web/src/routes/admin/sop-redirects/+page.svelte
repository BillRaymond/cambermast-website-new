<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
</script>

<SeoHead
	title="Redirect Registry SOP | Cambermast"
	description="Admin SOP for the legacy URL redirect registry, validation, and public API."
	path="/admin/sop-redirects"
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Redirect Registry SOP</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		Use this SOP when adding or maintaining legacy URL redirects for public routes and
		machine-readable endpoints.
	</p>
</header>

<section class="mt-10 space-y-6 text-gray-800">
	<div class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold">Source of truth</h2>
		<p class="mt-3">
			The redirect registry lives in <code>web/src/lib/data/redirects/redirects.json</code> and is
			validated against <code>web/src/lib/data/redirects/redirects.schema.json</code>.
		</p>
		<p class="mt-3">
			The public read-only API is <code>/api/redirects.json</code>. The API response contract is
			documented by <code>redirects-api.schema.json</code>.
		</p>
	</div>

	<div class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold">Admin workflow</h2>
		<p class="mt-3">
			In development, manage entries from <a class="text-blue-700 underline" href="/admin/redirects"
				>/admin/redirects</a
			>. The page supports create, update, enable/disable, and delete operations.
		</p>
		<p class="mt-3">
			Redirects must use internal paths only. Queries, fragments, duplicate sources, self-targets,
			and redirect loops are blocked before the registry file is written.
		</p>
	</div>

	<div class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold">Validation and release checks</h2>
		<p class="mt-3">
			Run <code>npm --prefix web run validate:redirects</code> after changes, then run
			<code>npm --prefix web run validate:api</code> and
			<code>npm --prefix web run validate:schema-governance</code>.
		</p>
		<p class="mt-3">
			Before publishing, confirm critical aliases still resolve, especially
			<code>/calendar</code>, <code>/training-programs</code>, and any feed compatibility paths.
		</p>
	</div>
</section>
