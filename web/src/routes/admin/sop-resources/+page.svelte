<script lang="ts">
	import { browser } from '$app/environment';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import resourcesApiResponseSchema from '$lib/data/api/schemas/resources-api.schema.json';
	import { buildResourcesApiExamples } from '$lib/data/api/resources';

	const pageMeta = {
		title: 'Resources SOPs | Admin | Cambermast',
		description:
			'Internal SOP for maintaining the public resources registry and resources API contract.'
	};

	type ApiTab = 'response' | 'example' | 'schema';

	const schemaDemoOrigin = SITE_ORIGIN.replace(/\/$/, '');
	const resourcesApiExamples = buildResourcesApiExamples(schemaDemoOrigin);

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
	path="/admin/sop-resources"
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Resources SOPs</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		This page documents how Cambermast maintains the public resources registry, the
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/resources.json</code>
		contract, and resource discovery metadata.
	</p>
</header>

<section class="mt-10">
	<h2 class="text-2xl font-semibold">Purpose</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		The resources registry is the canonical source for the public resources listing page and the RSS
		feed. Keep titles, summaries, publish dates, and routes aligned with the corresponding public
		resource pages.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Marketing Workflow (Human Friendly)</h2>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			Add or update the registry entry in
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/resources/resources.json</code
			>.
		</li>
		<li>
			Validate against
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/resources/resources.schema.json</code
			>.
		</li>
		<li>
			Confirm the listing on <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/resources</code>
			and API output at <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>/api/resources.json</code
			>.
		</li>
		<li>Run validation gates before merge.</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">AI/Developer Contract (Machine Readable Rules)</h2>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			Registry data:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/resources/resources.json</code
			>.
		</li>
		<li>
			Schema source:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/resources/resources.schema.json</code
			>.
		</li>
		<li>
			API route:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/routes/api/resources.json/+server.ts</code
			>.
		</li>
		<li>
			API schema source:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/api/schemas/resources-api.schema.json</code
			>.
		</li>
		<li>
			API payload builder:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/api/resources.ts</code
			>.
		</li>
		<li>
			Validation commands:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>npm --prefix web run validate:resources</code
			>
			and
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>npm --prefix web run validate:api</code
			>.
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
		{@const value = JSON.stringify(resourcesApiExamples.response, null, 2)}
		<div class="mb-3 flex justify-end">
			<button class={iconClass('resources-response')} on:click={() => copyToClipboard(value, 'resources-response')}>Copy</button>
		</div>
		<pre class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"><code>{value}</code></pre>
	{:else if activeApiTab === 'example'}
		{@const value = JSON.stringify(resourcesApiExamples.example, null, 2)}
		<div class="mb-3 flex justify-end">
			<button class={iconClass('resources-example')} on:click={() => copyToClipboard(value, 'resources-example')}>Copy</button>
		</div>
		<pre class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"><code>{value}</code></pre>
	{:else}
		{@const value = JSON.stringify(resourcesApiResponseSchema, null, 2)}
		<div class="mb-3 flex justify-end">
			<button class={iconClass('resources-schema')} on:click={() => copyToClipboard(value, 'resources-schema')}>Copy</button>
		</div>
		<pre class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"><code>{value}</code></pre>
	{/if}
</section>
