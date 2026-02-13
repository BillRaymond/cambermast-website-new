<script lang="ts">
	import { browser } from '$app/environment';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import testimonialsApiResponseSchema from '$lib/data/api/schemas/testimonials-api.schema.json';
	import { buildTestimonialsApiExamples } from '$lib/data/api/testimonials';

	const pageMeta = {
		title: 'Testimonial SOPs | Admin | Cambermast',
		description:
			'Internal SOP for maintaining testimonial intake, approval, and publication with schema-first standards.'
	};

	type ApiTab = 'response' | 'example' | 'schema';

	type ApiSample = {
		id: string;
		title: string;
		response: string;
		example: string;
		schema: string;
	};

	const schemaDemoOrigin = SITE_ORIGIN.replace(/\/$/, '');
	const testimonialsApiExamples = buildTestimonialsApiExamples(schemaDemoOrigin);

	const apiSamples: ApiSample[] = [
		{
			id: 'testimonials',
			title: '/api/testimonials.json',
			response: JSON.stringify(testimonialsApiExamples.response, null, 2),
			example: JSON.stringify(testimonialsApiExamples.example, null, 2),
			schema: JSON.stringify(testimonialsApiResponseSchema, null, 2)
		}
	];

	let activeApiTab: Record<string, ApiTab> = {
		testimonials: 'response'
	};
	let copiedKey = '';

	const setApiTab = (apiId: string, tab: ApiTab) => {
		activeApiTab = { ...activeApiTab, [apiId]: tab };
	};

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
		} ${copiedKey === key ? 'scale-[1.02]' : 'scale-100'} motion-safe:transition-transform`;
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/admin/sop-testimonials"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Testimonial SOPs</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		This page documents how testimonials are collected, reviewed, validated, and published so
		operations and automation stay aligned.
	</p>
</header>

<section class="mt-10">
	<h2 class="text-2xl font-semibold">Purpose</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Testimonials can originate from forms or manual curation, but the canonical source of truth is a
		single schema-validated JSON registry.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Primary routes:
		<a href="/forms/testimonials" class="text-blue-700 hover:underline">/forms/testimonials</a>,
		<a href="/testimonials" class="text-blue-700 hover:underline">/testimonials</a>,
		<a href="/admin/forms" class="text-blue-700 hover:underline">/admin/forms</a>,
		<a href="/admin/sop" class="text-blue-700 hover:underline">/admin/sop</a>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Governance rule: every registry schema change must stay schema-first and include matching API
		contract updates plus SOP updates in a relevant <code
			class="rounded bg-gray-100 px-1 py-0.5 text-xs">/admin/sop*</code
		>
		page. See <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">SCHEMA-FIRST.md</code>.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Marketing Workflow (Human Friendly)</h2>
	<h3 class="mt-6 text-xl font-semibold">Form-submitted testimonial workflow</h3>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>Collect submission through the public testimonial form.</li>
		<li>Confirm program mapping (SKU, slug, and route) matches an active training program.</li>
		<li>
			Verify consent and set
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">allowPublicUse</code>.
		</li>
		<li>Add or update the approved record in the testimonials registry JSON.</li>
		<li>Run validation and QA before merge or publish.</li>
	</ol>
	<h3 class="mt-6 text-xl font-semibold">Manual testimonial curation workflow</h3>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>Draft the testimonial entry with required schema fields.</li>
		<li>
			Use a stable ID and accurate
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">createdAt</code> date/date-time.
		</li>
		<li>
			Set source metadata (<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">manual</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">import</code>, or other allowed value).
		</li>
		<li>
			Optionally add
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">photoUrl</code> for approved headshots.
		</li>
		<li>Validate, then check public rendering on testimonial and program pages.</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">AI/Developer Contract (Machine Readable Rules)</h2>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			Testimonials source of truth:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/testimonials.json</code>.
		</li>
		<li>
			Schema source:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/testimonials.schema.json</code
			>.
		</li>
		<li>
			API route:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/routes/api/testimonials.json/+server.ts</code
			>.
		</li>
		<li>
			API schema source:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/api/schemas/testimonials-api.schema.json</code
			>.
		</li>
		<li>
			API payload builder:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/api/testimonials.ts</code
			>.
		</li>
		<li>
			Validation command:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>npm --prefix web run validate:testimonials</code
			>.
		</li>
		<li>
			API contract gate:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>npm --prefix web run validate:api</code
			>.
		</li>
		<li>
			Type adapter:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/testimonials.ts</code>.
		</li>
		<li>
			Public route consumer:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/routes/testimonials/+page.svelte</code
			>.
		</li>
		<li>
			Form intake route:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/routes/forms/testimonials/+page.svelte</code
			>.
		</li>
		<li>
			Required schema fields:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">id</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">programSku</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">programSlug</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">programRoute</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">displayName</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">rating</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">quote</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">allowPublicUse</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">source</code>, and
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">createdAt</code>.
		</li>
		<li>
			Do not publish private feedback as public testimonials when
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">allowPublicUse</code> is false.
		</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Image and Asset Requirements</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Testimonial photos must live in
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/static/images/testimonials/</code> and
		should be square (approximately 300x300) for consistent card rendering.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		When present,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">photoUrl</code> must be a site-relative path
		in the source registry.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Validation and QA</h2>
	<p class="mt-2 max-w-3xl text-gray-700">Run validation before opening a PR or publishing.</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>npm --prefix web run validate:testimonials</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>npm --prefix web run validate:registries</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">npm --prefix web run validate:api</code>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">npm --prefix web run check</code>
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Publish Checklist</h2>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>Registry entry exists and passes testimonials schema validation.</li>
		<li>Program SKU/slug/route values map to the intended training page.</li>
		<li>Consent flag and attribution fields match approved usage.</li>
		<li>Public testimonials page renders expected grouping and order.</li>
		<li>Relevant training program page displays the testimonial correctly.</li>
		<li>
			Testimonials API payload validates against
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">testimonials-api.schema.json</code>.
		</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Read-only API (GET)</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Testimonials API:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /api/testimonials.json</code> returns
		public-approved testimonials only.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		prod:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>https://www.cambermast.com/api/testimonials.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		dev:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>http://localhost:5173/api/testimonials.json</code
		>
	</p>
	{#each apiSamples as api}
		{@const activeTab = activeApiTab[api.id] ?? 'response'}
		{@const activeCode =
			activeTab === 'response' ? api.response : activeTab === 'example' ? api.example : api.schema}
		<article class="mt-6 max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h3 class="text-xl font-semibold">Expected JSON: {api.title}</h3>
				<button
					type="button"
					class={iconClass(`copy:testimonials-api:${api.id}:${activeTab}`)}
					aria-label={`Copy ${activeTab} snippet for ${api.title}`}
					on:click={() =>
						copyToClipboard(activeCode, `copy:testimonials-api:${api.id}:${activeTab}`)}
				>
					{#if copiedKey === `copy:testimonials-api:${api.id}:${activeTab}`}
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							class="h-3.5 w-3.5"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					{:else}
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							class="h-3.5 w-3.5"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
						</svg>
					{/if}
				</button>
			</div>
			<div class="mt-3 flex flex-wrap gap-2">
				<button
					type="button"
					class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
						activeTab === 'response'
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					on:click={() => setApiTab(api.id, 'response')}
				>
					JSON Response
				</button>
				<button
					type="button"
					class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
						activeTab === 'example'
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					on:click={() => setApiTab(api.id, 'example')}
				>
					Example
				</button>
				<button
					type="button"
					class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
						activeTab === 'schema'
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					on:click={() => setApiTab(api.id, 'schema')}
				>
					Schema
				</button>
			</div>
			<pre class="mt-3 overflow-x-auto rounded bg-gray-100 p-3 text-xs text-gray-800"><code
					>{activeCode}</code
				></pre>
		</article>
	{/each}
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">API Maintenance Rule</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		When testimonial API contracts change, update this SOP in the same pull request.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		This includes updates to:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">testimonials-api.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/api/testimonials.ts</code>,
		and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>web/src/routes/api/testimonials.json/+server.ts</code
		>.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">SOP Maintenance Rule</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		When testimonial registry fields, schema constraints, form handling, or testimonial display
		logic changes, this SOP must be updated in the same pull request.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		This includes updates to:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">testimonials.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">testimonials.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">testimonials.ts</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/forms/testimonials</code>, and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/testimonials</code>.
	</p>
</section>
