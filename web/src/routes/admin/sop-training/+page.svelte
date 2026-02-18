<script lang="ts">
	import { browser } from '$app/environment';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import eventsApiResponseSchema from '$lib/data/api/schemas/events-api.schema.json';
	import catalogApiResponseSchema from '$lib/data/api/schemas/catalog-api.schema.json';
	import trainingApiResponseSchema from '$lib/data/api/schemas/training-api.schema.json';
	import { buildCatalogApiExamples } from '$lib/data/api/catalog';
	import { buildEventsApiPayload } from '$lib/data/api/events';
	import { buildTrainingApiExamples } from '$lib/data/api/training';

	const pageMeta = {
		title: 'Training SOPs | Admin | Cambermast',
		description: 'Internal SOP for training program and schedule operations.'
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
	const catalogApiExamples = buildCatalogApiExamples(schemaDemoOrigin);
	const trainingApiExamples = buildTrainingApiExamples(schemaDemoOrigin);
	const eventsApiPayload = buildEventsApiPayload({
		origin: schemaDemoOrigin,
		generatedAt: '2026-02-12T18:15:00.000Z'
	});
	const trainingEventsOnly = {
		generatedAt: eventsApiPayload.generatedAt,
		events: eventsApiPayload.events.filter((event) => event.type === 'training_session')
	};
	const trainingEventExample = {
		generatedAt: trainingEventsOnly.generatedAt,
		events: trainingEventsOnly.events.slice(0, 1)
	};

	const apiSamples: ApiSample[] = [
		{
			id: 'catalog',
			title: '/catalog.json (trainingPrograms)',
			response: JSON.stringify(catalogApiExamples.response, null, 2),
			example: JSON.stringify(catalogApiExamples.example, null, 2),
			schema: JSON.stringify(catalogApiResponseSchema, null, 2)
		},
		{
			id: 'training',
			title: '/api/training.json (program registry)',
			response: JSON.stringify(trainingApiExamples.response, null, 2),
			example: JSON.stringify(trainingApiExamples.example, null, 2),
			schema: JSON.stringify(trainingApiResponseSchema, null, 2)
		},
		{
			id: 'training-events',
			title: '/api/events.json (filtered to training_session)',
			response: JSON.stringify(trainingEventsOnly, null, 2),
			example: JSON.stringify(trainingEventExample, null, 2),
			schema: JSON.stringify(eventsApiResponseSchema, null, 2)
		}
	];

	let activeApiTab: Record<string, ApiTab> = {
		catalog: 'response',
		training: 'response',
		'training-events': 'response'
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
	path="/admin/sop-training"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Training SOPs</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		This page documents how to maintain training programs and training-derived schedules so
		marketing, operations, and automation stay aligned.
	</p>
</header>

<section class="mt-10">
	<h2 class="text-2xl font-semibold">Purpose</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Training programs define canonical curriculum metadata. Training events represent dated delivery
		sessions and must map back to program SKUs.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Primary admin views:
		<a href="/admin/drafts" class="text-blue-700 hover:underline">/admin/drafts</a>,
		<a href="/admin/events" class="text-blue-700 hover:underline">/admin/events</a>,
		<a href="/admin/forms" class="text-blue-700 hover:underline">/admin/forms</a>.
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
	<h3 class="mt-6 text-xl font-semibold">New training program workflow</h3>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			Update the training registry in <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/training/training.json</code
			>.
		</li>
		<li>
			Validate against <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/training/training.schema.json</code
			>.
		</li>
		<li>
			Keep list metadata in each program's <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>catalog</code
			>
			object (summary, image, bullets, order, published).
		</li>
		<li>
			Review API output at <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>/api/training.json</code
			>.
		</li>
		<li>
			Review the training route and card visibility on <code
				class="rounded bg-gray-100 px-1 py-0.5 text-xs">/training</code
			>.
		</li>
		<li>Run validation gates before merge.</li>
	</ol>
	<h3 class="mt-6 text-xl font-semibold">New training cohort event workflow</h3>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>Generate a draft session event from a training SKU.</li>
		<li>Add or update linked campaign record for the event.</li>
		<li>
			Confirm <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>event.type = training_session</code
			>.
		</li>
		<li>
			Confirm <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">event.programRef.sku</code> matches
			an existing program SKU.
		</li>
		<li>Validate JSON/schema and QA public/admin views.</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">AI/Developer Contract (Machine Readable Rules)</h2>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			Training program registry data is <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/training/training.json</code
			>
			with schema
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/training/training.schema.json</code
			>.
		</li>
		<li>
			Program index/source registry is <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/training/index.ts</code
			>.
		</li>
		<li>
			Program type contract is <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/training/types.ts</code
			>.
		</li>
		<li>
			Public training listing pages (<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>/training</code
			>, <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/training/table</code>, and
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/training/print</code>) use
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">program.catalog</code> metadata from
			each registry program as their canonical card/row source.
		</li>
		<li>
			Training-specific API contract is <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/api/schemas/training-api.schema.json</code
			>
			with payload builder
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/api/training.ts</code>.
		</li>
		<li>
			Training session events live in <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/events/events.json</code
			>
			with schema
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/events/events.schema.json</code
			>.
		</li>
		<li>
			Draft generator command: <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>npm --prefix web run events:draft -- --program-sku CM-TR-005 --start-date 2026-03-17 --slug
				your-event-slug</code
			>.
		</li>
		<li>
			Published program SKUs should match <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>^CM-TR-[0-9]{3}$</code
			>.
		</li>
		<li>
			Every training session event must use <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>type = training_session</code
			>
			and include <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">programRef.sku</code> plus
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">schedule</code>.
		</li>
		<li>
			Program route values should stay under <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>/training/&lt;slug&gt;</code
			>.
		</li>
		<li>
			Do not change stable program slugs/SKUs after they are used in live links or forms without
			full refactor + validation.
		</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Field and Date Requirements</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Training programs require a valid <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>scheduleTemplate</code
		>
		with:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">durationDays</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">hoursPerDayCommitment</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">defaultStartTimeLocal</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">defaultTimeZone</code>, and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">defaultTimeZoneLabel</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Published training programs should include <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>catalog</code
		>
		metadata fields: <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">id</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">summary</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">order</code>, and optional display fields
		like image and bullets.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Do not store testimonials in the training registry. Program pages read testimonials from
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/testimonials.json</code> and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/testimonials.json</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Training events use canonical session entries: <code
			class="rounded bg-gray-100 px-1 py-0.5 text-xs">sessions[]</code
		>
		with required UTC <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">startAtUtc</code> and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">endAtUtc</code> values for each session.
		Real event start/end shown in UI/API are derived from this list.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Status values must stay within schema enums for lifecycle and registration.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Validation and QA</h2>
	<p class="mt-2 max-w-3xl text-gray-700">Run validation before opening a PR or publishing.</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">npm --prefix web run validate:events</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>npm --prefix web run validate:catalog</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>npm --prefix web run validate:training</code
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
		<li>
			Training registry updates are committed in <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>training/training.json</code
			>.
		</li>
		<li>Program catalog metadata (`program.catalog`) is present and schema-valid.</li>
		<li>
			Training event record maps to valid <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>programRef.sku</code
			>.
		</li>
		<li>Event and campaign linkage is valid and short link resolves.</li>
		<li>Program page and event page render expected content.</li>
		<li>API responses match expected JSON/schema shapes below.</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Read-only APIs (GET)</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Training registry API:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /api/training.json</code> returns
		training programs for automation.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		prod:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>https://www.cambermast.com/api/training.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		dev:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>http://localhost:5173/api/training.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Events API:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /api/events.json</code> can be
		filtered by consumers to
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">type = training_session</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		prod:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>https://www.cambermast.com/api/events.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		dev:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>http://localhost:5173/api/events.json</code
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
					class={iconClass(`copy:training-api:${api.id}:${activeTab}`)}
					aria-label={`Copy ${activeTab} snippet for ${api.title}`}
					on:click={() => copyToClipboard(activeCode, `copy:training-api:${api.id}:${activeTab}`)}
				>
					{#if copiedKey === `copy:training-api:${api.id}:${activeTab}`}
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
	<h2 class="text-2xl font-semibold">SOP Maintenance Rule</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		When training registry files, event schemas, or training API contracts change, this page must be
		updated in the same pull request.
	</p>
</section>
