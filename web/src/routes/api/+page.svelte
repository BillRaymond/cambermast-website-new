<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/api');

	const primaryApis = [
		{
			href: '/api/events.json',
			label: 'Events API',
			description:
				'Upcoming and past public event records with schedule, registration, pricing, and status details.'
		},
		{
			href: '/api/training.json',
			label: 'Training API',
			description:
				'Training program registry with program metadata, routes, CTAs, pricing, and delivery details.'
		},
		{
			href: '/api/catalog.json',
			label: 'Offerings API',
			description:
				'Top-level catalog rollup that maps public offerings, navigation sections, and route groupings.'
		},
		{
			href: '/api/resources.json',
			label: 'Resources API',
			description:
				'Resource library metadata for setup guides, attendee prep, pricing explainers, and related assets.'
		}
	];

	const supportingApis = [
		{ href: '/api/faq-presets.json', label: 'FAQ Presets API' },
		{ href: '/api/testimonials.json', label: 'Testimonials API' },
		{ href: '/api/tools.json', label: 'Tools API' },
		{ href: '/api/image-gen-standards.json', label: 'Image Standards API' },
		{ href: '/api/enums.json', label: 'Enums API' },
		{ href: '/api/campaigns.json', label: 'Campaigns API' }
	];

	const feeds = [
		{ href: '/feed/events.xml', label: 'Events RSS' },
		{ href: '/feed/calendar.xml', label: 'Calendar RSS' },
		{ href: '/feed/resources.xml', label: 'Resources RSS' },
		{ href: '/feed/articles.xml', label: 'Articles RSS' },
		{ href: '/feed/training-programs.xml', label: 'Programs RSS' }
	];

	const guidanceFiles = [
		{ href: '/llms.txt', label: 'LLMs guide' },
		{ href: '/ai.txt', label: 'AI usage policy' }
	];
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/api"
	feedLinks={[
		{ href: '/feed/events.xml', title: 'Cambermast Events RSS' },
		{ href: '/feed/training-programs.xml', title: 'Cambermast Training Programs RSS' },
		{ href: '/feed/resources.xml', title: 'Cambermast Resources RSS' }
	]}
	alternateLinks={[
		{ href: '/api/events.json', title: 'Cambermast Events API', type: 'application/json' },
		{ href: '/api/training.json', title: 'Cambermast Training API', type: 'application/json' },
		{ href: '/api/catalog.json', title: 'Cambermast Offerings API', type: 'application/json' },
		{ href: '/api/resources.json', title: 'Cambermast Resources API', type: 'application/json' }
	]}
/>

<h1 class="mb-6 text-3xl font-bold">Public APIs and feeds</h1>
<p class="max-w-3xl text-gray-700">
	Use these public machine-readable endpoints to access Cambermast events, training programs,
	resources, and related metadata. For most AI and automation use cases, start with the JSON APIs
	below, then use RSS feeds for freshness checks and <a class="underline" href="/llms.txt"
		>/llms.txt</a
	> for grounding guidance.
</p>

<section class="mt-10 grid gap-5 md:grid-cols-2">
	{#each primaryApis as endpoint}
		<article class="rounded-2xl border bg-white p-5 shadow-sm">
			<h2 class="text-lg font-semibold">{endpoint.label}</h2>
			<p class="mt-2 text-sm text-gray-700">{endpoint.description}</p>
			<a
				href={endpoint.href}
				class="mt-4 inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
			>
				{endpoint.href}
			</a>
		</article>
	{/each}
</section>

<section class="mt-10 rounded-2xl border bg-gray-50 p-6">
	<h2 class="text-xl font-semibold">More machine-readable sources</h2>
	<p class="mt-2 max-w-3xl text-gray-700">
		These endpoints support broader retrieval, reuse, and indexing across the site.
	</p>
	<div class="mt-4 flex flex-wrap gap-3">
		{#each supportingApis as endpoint}
			<a
				href={endpoint.href}
				class="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:border-gray-400 hover:bg-gray-100"
			>
				{endpoint.label}
			</a>
		{/each}
	</div>
</section>

<section class="mt-10 grid gap-6 md:grid-cols-2">
	<div class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold">RSS feeds</h2>
		<p class="mt-2 text-gray-700">
			Use feeds for update monitoring, freshness checks, and simple subscriptions.
		</p>
		<ul class="mt-4 space-y-2 text-sm text-gray-700">
			{#each feeds as feed}
				<li>
					<a class="underline" href={feed.href}>{feed.label}</a>
				</li>
			{/each}
		</ul>
	</div>
	<div class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold">AI guidance</h2>
		<p class="mt-2 text-gray-700">
			Use these files to understand citation expectations, usage rules, and priority sources.
		</p>
		<ul class="mt-4 space-y-2 text-sm text-gray-700">
			{#each guidanceFiles as file}
				<li>
					<a class="underline" href={file.href}>{file.label}</a>
				</li>
			{/each}
		</ul>
	</div>
</section>
