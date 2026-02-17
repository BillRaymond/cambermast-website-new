<script lang="ts">
	import { browser } from '$app/environment';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import eventsApiResponseSchema from '$lib/data/api/schemas/events-api.schema.json';
	import campaignsApiResponseSchema from '$lib/data/api/schemas/campaigns-api.schema.json';
	import enumsApiResponseSchema from '$lib/data/api/schemas/enums-api.schema.json';
	import catalogApiResponseSchema from '$lib/data/api/schemas/catalog-api.schema.json';
	import toolsApiResponseSchema from '$lib/data/api/schemas/tools-api.schema.json';
	import testimonialsApiResponseSchema from '$lib/data/api/schemas/testimonials-api.schema.json';
	import { buildEventsApiExamples } from '$lib/data/api/events';
	import { buildCampaignsApiExamples } from '$lib/data/api/campaigns';
	import { buildEnumsApiExamples } from '$lib/data/api/enums';
	import { buildCatalogApiExamples } from '$lib/data/api/catalog';
	import { buildToolsApiExamples } from '$lib/data/api/tools';
	import { buildTestimonialsApiExamples } from '$lib/data/api/testimonials';

	const pageMeta = {
		title: 'Event SOPs | Admin | Cambermast',
		description: 'Internal SOP for maintaining events and campaigns with schema-first standards.'
	};

	type ApiTab = 'response' | 'example' | 'partner' | 'schema';

	type ApiSample = {
		id: string;
		title: string;
		response: string;
		example: string;
		partner?: string;
		schema: string;
	};

	const partnerTabFallback = `{
  "note": "Partner Example is not applicable for this API.",
  "use": "Review the standard Example tab for this endpoint."
}`;

	const schemaDemoOrigin = SITE_ORIGIN.replace(/\/$/, '');
	const eventsApiExamples = buildEventsApiExamples(schemaDemoOrigin);
	const campaignsApiExamples = buildCampaignsApiExamples(schemaDemoOrigin);
	const enumsApiExamples = buildEnumsApiExamples();
	const catalogApiExamples = buildCatalogApiExamples(schemaDemoOrigin);
	const toolsApiExamples = buildToolsApiExamples(schemaDemoOrigin);
	const testimonialsApiExamples = buildTestimonialsApiExamples(schemaDemoOrigin);

	const apiSamples: ApiSample[] = [
		{
			id: 'events',
			title: '/api/events.json',
			response: JSON.stringify(eventsApiExamples.response, null, 2),
			example: JSON.stringify(eventsApiExamples.example, null, 2),
			partner:
				eventsApiExamples.partnerExample === null
					? undefined
					: JSON.stringify(eventsApiExamples.partnerExample, null, 2),
			schema: JSON.stringify(eventsApiResponseSchema, null, 2)
		},
		{
			id: 'campaigns',
			title: '/api/campaigns.json',
			response: JSON.stringify(campaignsApiExamples.response, null, 2),
			example: JSON.stringify(campaignsApiExamples.example, null, 2),
			partner:
				campaignsApiExamples.partnerExample === null
					? undefined
					: JSON.stringify(campaignsApiExamples.partnerExample, null, 2),
			schema: JSON.stringify(campaignsApiResponseSchema, null, 2)
		},
		{
			id: 'enums',
			title: '/api/enums.json',
			response: JSON.stringify(enumsApiExamples.response, null, 2),
			example: JSON.stringify(enumsApiExamples.example, null, 2),
			schema: JSON.stringify(enumsApiResponseSchema, null, 2)
		},
		{
			id: 'catalog',
			title: '/catalog.json',
			response: JSON.stringify(catalogApiExamples.response, null, 2),
			example: JSON.stringify(catalogApiExamples.example, null, 2),
			schema: JSON.stringify(catalogApiResponseSchema, null, 2)
		},
		{
			id: 'tools',
			title: '/api/tools.json',
			response: JSON.stringify(toolsApiExamples.response, null, 2),
			example: JSON.stringify(toolsApiExamples.example, null, 2),
			schema: JSON.stringify(toolsApiResponseSchema, null, 2)
		},
		{
			id: 'testimonials',
			title: '/api/testimonials.json',
			response: JSON.stringify(testimonialsApiExamples.response, null, 2),
			example: JSON.stringify(testimonialsApiExamples.example, null, 2),
			schema: JSON.stringify(testimonialsApiResponseSchema, null, 2)
		}
	];

	let activeApiTab: Record<string, ApiTab> = {
		events: 'response',
		campaigns: 'response',
		enums: 'response',
		catalog: 'response',
		tools: 'response',
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
	path="/admin/sop"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Event SOPs (Events and Campaigns)</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		This page documents how to create and maintain events and campaigns in a way that is clear for
		marketing operations and precise enough for AI/developer automation.
	</p>
</header>

<section class="mt-10">
	<h2 class="text-2xl font-semibold">Purpose</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Every event must have a matching campaign record. The event drives the public event page and
		registration behavior. The campaign drives short links and tracking parameters for promotion.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Primary admin views:
		<a href="/admin/events" class="text-blue-700 hover:underline">/admin/events</a>,
		<a href="/admin/drafts" class="text-blue-700 hover:underline">/admin/drafts</a>,
		<a href="/admin/campaigns" class="text-blue-700 hover:underline">/admin/campaigns</a>,
		<a href="/admin/forms" class="text-blue-700 hover:underline">/admin/forms</a>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Governance rule: every registry schema in <code
			class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/**</code
		>
		must have a corresponding public read-only API contract and SOP coverage in a relevant
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/admin/sop*</code> page.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Campaign Naming and Governance</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Use one canonical campaign registry as the source of truth:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/campaigns.json</code>.
		Schema source:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>web/src/lib/data/campaigns.schema.json</code
		>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Keep campaign IDs stable over time. Keep
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">params.utm_content</code> aligned with
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">id</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Good examples:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">techlab-go</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">standing-signage-sc</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">partner-demo-01</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Avoid spaces/underscores, long verbose IDs, and changing IDs after links or printed assets are
		published.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Marketing Workflow (Human Friendly)</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Use the matching workflow for the event type you are creating.
	</p>
	<h3 class="mt-6 text-xl font-semibold">Training-derived event workflow</h3>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>Choose the training program SKU and start date.</li>
		<li>Generate a draft event and draft campaign object.</li>
		<li>Add the draft event to the events registry JSON.</li>
		<li>Add the draft campaign to the campaigns registry JSON.</li>
		<li>Validate both JSON files against schema rules.</li>
		<li>Review in admin pages and confirm links resolve.</li>
		<li>
			When ready to publish, switch event visibility/registration fields from draft to live values.
		</li>
	</ol>
	<h3 class="mt-6 text-xl font-semibold">External event workflow (webinar, talk, partner event)</h3>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			Create the event directly in the events registry JSON (do not use program SKU generator).
		</li>
		<li>Set event type (for example: webinar, conference_talk, talk, panel, community).</li>
		<li>Add a campaign record with landingPath pointing to the event slug route.</li>
		<li>
			Link the event and campaign IDs:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">event.campaignId</code> and
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">event.cta.campaignId</code>.
		</li>
		<li>Validate JSON, then verify event page, tracking URL, and short URL behavior.</li>
	</ol>
	<h3 class="mt-6 text-xl font-semibold">Partner association workflow (applies to both types)</h3>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			Choose one or more valid partner entries in
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">event.partners[]</code>.
		</li>
		<li>
			Set campaign partner slug and tracking:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaign.partner</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaign.partnerLabel</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaign.params.ad</code>.
		</li>
		<li>
			If no partner is associated, leave
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">event.partners</code> empty/omitted and
			set
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaign.partner = cambermast</code>.
		</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">AI/Developer Contract (Machine Readable Rules)</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		An AI agent or script may perform this workflow by editing JSON directly or by inspecting APIs.
		Follow these rules exactly.
	</p>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>
			Event source of truth:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/events/events.json</code
			>.
		</li>
		<li>
			Campaign source of truth:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/campaigns.json</code>.
		</li>
		<li>
			Event schema:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/events/events.schema.json</code
			>.
		</li>
		<li>
			Campaign schema:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/campaigns.schema.json</code
			>.
		</li>
		<li>
			Catalog source of truth:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/catalog.json</code>
			with schema
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/catalog.schema.json</code
			>.
		</li>
		<li>
			Tools source of truth:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/tools.json</code>
			with schema
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/tools.schema.json</code
			>.
		</li>
		<li>
			Testimonials source of truth:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">web/src/lib/data/testimonials.json</code
			>
			with schema
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>web/src/lib/data/testimonials.schema.json</code
			>.
		</li>
		<li>
			Use the generator command for training events:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>npm --prefix web run events:draft -- --program-sku CM-TR-005 --start-date 2026-03-17 --slug
				your-event-slug</code
			>.
		</li>
		<li>
			Default ID rule: event ID is 6-char base36 (<code
				class="rounded bg-gray-100 px-1 py-0.5 text-xs">^[a-z0-9]{6}$</code
			>), and campaign ID should match unless intentionally overridden.
		</li>
		<li>
			Do not create ID or slug collisions. The generator blocks collisions unless
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">--overwrite</code> is used.
		</li>
		<li>
			Event/campaign linkage rule: <code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>event.campaignId</code
			>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">event.cta.campaignId</code>, and
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaign.id</code> should refer to the same
			value.
		</li>
		<li>
			Landing path rule:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
				>campaign.landingPath = /events/&lt;event.slug&gt;</code
			>.
		</li>
		<li>
			UTM convention for event campaigns:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">utm_campaign=events</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">utm_content=&lt;campaignId&gt;</code>,
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">src=qr</code>.
		</li>
		<li>
			Training-derived events use
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">type = training_session</code> and must
			include <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">programRef.sku</code> and
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">schedule</code>.
		</li>
		<li>
			External events (webinar/talk/panel/etc.) may omit
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">programRef</code> but still require the standard
			event fields and a linked campaign.
		</li>
		<li>
			Partner alignment rule:
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">event.partners[].code</code> should align
			with
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaign.partner</code> and
			<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaign.params.ad</code>.
		</li>
	</ol>
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
			>npm --prefix web run validate:campaigns</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>npm --prefix web run validate:registries</code
		>
		(runs catalog/tools/testimonials schema checks).
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">npm --prefix web run validate:api</code>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Then verify these read endpoints:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/events.json</code> and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/campaigns.json</code> and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/enums.json</code> and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/tools.json</code> and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/testimonials.json</code>.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Status Values and Date Requirements</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Use only schema-supported status values when creating or updating events.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Event type guidance:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">training_session</code> is for events
		built from Cambermast training programs. External events generally use values like
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">webinar</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">conference_talk</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">talk</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">panel</code>, or
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">community</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Event visibility:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">public</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">unlisted</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">draft</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Event lifecycle status:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">scheduled</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">postponed</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">canceled</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">completed</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Event registration status:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">open</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">closed</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">external</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">none</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">waitlist</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">sold_out</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Event location mode:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">online</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">in_person</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">hybrid</code>. Location details
		visibility:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">public</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">post_signup</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">tbd</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Date/time requirements: <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">startAtUtc</code>
		is required and must be ISO date-time ending in
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">Z</code>
		(UTC). <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">endAtUtc</code> is optional but, when
		provided, must use the same format.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Past-event recap fields: optional
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">links.recordingUrl</code> and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">links.slidesUrl</code> can be set when assets
		are available. Recording publication is optional and should only be added when explicitly approved
		for the event.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Campaign date/time requirement:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">createdAt</code> must be an ISO
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">date-time</code> string.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Training-session rule: if <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">type</code> is
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">training_session</code>, then
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">programRef.sku</code> and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">schedule.durationDays</code> +
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">schedule.estimatedHoursCommitment</code> are
		required.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Pattern constraints:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">event.id</code> must match
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">^[a-z0-9]{6}$</code> (exactly 6 lowercase
		alphanumeric characters),
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">slug</code>/<code
			class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaign.id</code
		>/<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">utm_content</code> must be kebab-case,
		and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">partners[].code</code> must be 3-4 uppercase
		alphanumeric characters (for example:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">CMB</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">TLB</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">HFC</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">TCW</code>).
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		API behavior note: <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/events.json</code
		>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/campaigns.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/enums.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/tools.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/testimonials.json</code>, and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/catalog.json</code> are read-only GET
		endpoints and return HTTP 200 on success. Campaign short-link route
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/c/&lt;id&gt;</code> returns 404 when the campaign
		ID does not exist.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">SOP Maintenance Rule</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Whenever we create or modify registry JSON files, schemas, or enum values, this page must be
		updated in the same change so humans and automation stay aligned.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		This includes updates to:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">events.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaigns.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">catalog.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">tools.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">testimonials.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">events.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaigns.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">catalog.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">tools.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">testimonials.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">events-api.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">campaigns-api.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">enums-api.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">catalog-api.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">tools-api.schema.json</code>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">testimonials-api.schema.json</code>, and enum
		output from
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/enums.json</code>.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Required validation gates:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>npm --prefix web run validate:registries</code
		>,
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">npm --prefix web run validate:api</code>.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Publish Checklist</h2>
	<ol class="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-gray-700">
		<li>Event exists in events registry and passes schema validation.</li>
		<li>Campaign exists in campaigns registry and passes schema validation.</li>
		<li>Catalog, tools, and testimonials registries pass schema validation.</li>
		<li>
			Campaign short link <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/c/&lt;id&gt;</code>
			redirects correctly.
		</li>
		<li>Tracking URL resolves to the correct event page.</li>
		<li>Admin pages show linked records with no missing campaign warnings.</li>
		<li>API payloads match the expected response shapes listed below.</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-2xl font-semibold">Read-only APIs (GET)</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		Events API:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /api/events.json</code> returns public/unlisted-ready
		event data for operational checks and automation reads.
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
	<p class="mt-2 max-w-3xl text-gray-700">
		Campaigns API:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /api/campaigns.json</code> returns campaign
		records with computed tracking and short-link URLs.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		prod:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>https://www.cambermast.com/api/campaigns.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		dev:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>http://localhost:5173/api/campaigns.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Enums API:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /api/enums.json</code> returns canonical
		status enums and ID/slug pattern constraints from schema.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		prod:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>https://www.cambermast.com/api/enums.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		dev:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">http://localhost:5173/api/enums.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Training programs catalog API:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /catalog.json</code> returns
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">trainingPrograms</code> plus catalog data.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		prod:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>https://www.cambermast.com/catalog.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		dev:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">http://localhost:5173/catalog.json</code>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Tools API:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /api/tools.json</code> returns tool
		registry entries with absolute public URLs.
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		prod:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>https://www.cambermast.com/api/tools.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		dev:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>http://localhost:5173/api/tools.json</code
		>
	</p>
	<p class="mt-2 max-w-3xl text-gray-700">
		Testimonials API:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /api/testimonials.json</code> returns
		public-approved testimonials with canonical program mapping.
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
	<p class="mt-2 max-w-3xl text-gray-700">
		Implementation files:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>web/src/routes/api/events.json/+server.ts</code
		>
		and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>web/src/routes/api/campaigns.json/+server.ts</code
		>, and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>web/src/routes/api/enums.json/+server.ts</code
		>, and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>web/src/routes/api/tools.json/+server.ts</code
		>, and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>web/src/routes/api/testimonials.json/+server.ts</code
		>, and
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs"
			>web/src/routes/catalog.json/+server.ts</code
		>.
	</p>

	{#each apiSamples as api}
		{@const activeTab = activeApiTab[api.id] ?? 'response'}
		{@const activeCode =
			activeTab === 'response'
				? api.response
				: activeTab === 'example'
					? api.example
					: activeTab === 'partner'
						? (api.partner ?? partnerTabFallback)
						: api.schema}
		<article class="mt-6 max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h3 class="text-xl font-semibold">Expected JSON: {api.title}</h3>
				<button
					type="button"
					class={iconClass(`copy:api:${api.id}:${activeTab}`)}
					aria-label={`Copy ${activeTab} snippet for ${api.title}`}
					on:click={() => copyToClipboard(activeCode, `copy:api:${api.id}:${activeTab}`)}
				>
					{#if copiedKey === `copy:api:${api.id}:${activeTab}`}
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
						activeTab === 'partner'
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					on:click={() => setApiTab(api.id, 'partner')}
				>
					Partner Example
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
