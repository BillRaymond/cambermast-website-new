<script lang="ts">
	import { browser } from '$app/environment';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import commerceProductsApiSchema from '$lib/data/api/schemas/commerce-products-api.schema.json';
	import { buildCommerceProductsApiExamples } from '$lib/data/api/commerce-products';

	type ApiTab = 'response' | 'example' | 'schema';

	const pageMeta = {
		title: 'Commerce Feed SOP | Admin | Cambermast',
		description:
			'Internal SOP for the OpenAI commerce training feed, preview API contract, and QA rules.'
	};

	const schemaDemoOrigin = SITE_ORIGIN.replace(/\/$/, '');
	const commerceApiExamples = buildCommerceProductsApiExamples(schemaDemoOrigin);

	let activeApiTab: ApiTab = 'response';
	let copiedKey = '';

	const setCopied = (key: string) => {
		copiedKey = key;
		setTimeout(() => {
			if (copiedKey === key) copiedKey = '';
		}, 1200);
	};

	const copyToClipboard = async (value: string, key: string) => {
		if (!browser) return;
		try {
			await navigator.clipboard.writeText(value);
			setCopied(key);
		} catch (error) {
			console.warn('Unable to copy value', error);
		}
	};

	const iconClass = (key: string): string =>
		`inline-flex items-center rounded border px-2 py-1 text-[11px] font-semibold transition ${
			copiedKey === key
				? 'border-emerald-200 bg-emerald-50 text-emerald-800'
				: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800'
		}`;
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/admin/sop-commerce"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Commerce Feed SOP</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		This page documents the Cambermast OpenAI commerce feed for training offers, including the
		preview API, gzip export, eligibility rules, and QA checks.
	</p>
</header>

<section class="mt-10">
	<h2 class="text-2xl font-semibold">Purpose</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		The commerce feed is derived from the published training registry and future public
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">training_session</code> events. It is not a
		standalone editable registry.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Use <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/commerce-products.json</code> for
		human-readable QA and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/feed/openai-products.jsonl.gz</code>
		for the production export consumed by OpenAI commerce tooling. The gzip feed strips internal-only
		QA metadata such as source ids before serialization.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Eligibility Rules</h2>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>Published training programs always emit search-eligible product rows.</li>
		<li>
			Program rows remain checkout-ineligible and use the public program page as the canonical URL.
		</li>
		<li>
			Future public cohorts only emit checkout-eligible rows when they already have a public
			absolute registration URL, explicit USD ticketing amount, and the standard policy URLs.
		</li>
		<li>
			Cohorts with registration state <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>closed</code
			>
			or <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">none</code> are excluded from the v1 export.
		</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Source of Truth</h2>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			Training source registry:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/training/training.json</code
			>
		</li>
		<li>
			Event source registry:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/events/events.json</code
			>
		</li>
		<li>
			Preview API builder:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/api/commerce-products.ts</code
			>
		</li>
		<li>
			Preview API schema:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/api/schemas/commerce-products-api.schema.json</code
			>
		</li>
		<li>
			Public preview endpoint:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/commerce-products.json</code>
		</li>
		<li>
			Production feed endpoint:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/feed/openai-products.jsonl.gz</code>
		</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Operational Checks</h2>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			When updating training or event records, confirm hero image, pricing, FAQ content, and CTA
			URLs still look correct in <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>/api/commerce-products.json</code
			>.
		</li>
		<li>
			Keep policy URLs fixed to <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/gdpr</code>
			and <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/training/terms</code>, and do not
			claim unconditional returns or exchanges in the feed when the published terms are conditional.
		</li>
		<li>
			Run <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>npm --prefix web run validate:api</code
			>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>npm --prefix web run validate:public-endpoints</code
			>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>npm --prefix web run validate:schema-governance</code
			>, and <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">npm --prefix web run check</code>
			before merge.
		</li>
		<li>
			For release QA, confirm the gzip export downloads and expands into newline-delimited JSON rows
			with the same item count shown in the preview API and the same normalized field set expected
			by the OpenAI feed serializer.
		</li>
	</ol>
</section>

<section class="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
	<div class="mb-4 flex flex-wrap gap-2">
		<button
			type="button"
			class="rounded-full border px-3 py-1 text-sm font-semibold"
			class:border-blue-200={activeApiTab === 'response'}
			class:bg-blue-50={activeApiTab === 'response'}
			on:click={() => (activeApiTab = 'response')}
		>
			Response
		</button>
		<button
			type="button"
			class="rounded-full border px-3 py-1 text-sm font-semibold"
			class:border-blue-200={activeApiTab === 'example'}
			class:bg-blue-50={activeApiTab === 'example'}
			on:click={() => (activeApiTab = 'example')}
		>
			Example
		</button>
		<button
			type="button"
			class="rounded-full border px-3 py-1 text-sm font-semibold"
			class:border-blue-200={activeApiTab === 'schema'}
			class:bg-blue-50={activeApiTab === 'schema'}
			on:click={() => (activeApiTab = 'schema')}
		>
			Schema
		</button>
	</div>

	{#if activeApiTab === 'response'}
		{@const value = JSON.stringify(commerceApiExamples.response, null, 2)}
		<div class="mb-3 flex justify-end">
			<button
				class={iconClass('commerce-response')}
				on:click={() => copyToClipboard(value, 'commerce-response')}>Copy</button
			>
		</div>
		<pre
			class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"><code
				>{value}</code
			></pre>
	{:else if activeApiTab === 'example'}
		{@const value = JSON.stringify(commerceApiExamples.example, null, 2)}
		<div class="mb-3 flex justify-end">
			<button
				class={iconClass('commerce-example')}
				on:click={() => copyToClipboard(value, 'commerce-example')}>Copy</button
			>
		</div>
		<pre
			class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"><code
				>{value}</code
			></pre>
	{:else}
		{@const value = JSON.stringify(commerceProductsApiSchema, null, 2)}
		<div class="mb-3 flex justify-end">
			<button
				class={iconClass('commerce-schema')}
				on:click={() => copyToClipboard(value, 'commerce-schema')}>Copy</button
			>
		</div>
		<pre
			class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"><code
				>{value}</code
			></pre>
	{/if}
</section>
