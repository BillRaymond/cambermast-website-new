<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getEventTypeLabel } from '$lib/data/events';
	import type { PageData } from './$types';

	export let data: PageData;

	const events = data.events ?? [];
	const today = new Date();

	const toTimestamp = (value: string): number => {
		const parsed = new Date(value);
		const timestamp = parsed.valueOf();
		return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
	};

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const todayTimestamp = todayStart.getTime();

	const upcomingEvents = [...events]
		.filter((event) => toTimestamp(event.startAt) >= todayTimestamp)
		.sort((a, b) => toTimestamp(a.startAt) - toTimestamp(b.startAt));

	const pastEvents = [...events]
		.filter((event) => toTimestamp(event.startAt) < todayTimestamp)
		.sort((a, b) => toTimestamp(b.startAt) - toTimestamp(a.startAt));

	const formatTime = (value?: string | string[]): string | null => {
		if (!value) return null;
		return Array.isArray(value) ? value.join(' · ') : value;
	};

	const getEventBadge = (eventType: string, isDraft?: boolean): string =>
		isDraft ? `${eventType} · Draft` : eventType;

	const pageMeta = {
		title: 'Events & Webinars | Cambermast',
		description:
			'Browse upcoming Cambermast events, webinars, talks, and workshops. Register for live sessions and related training.'
	};

	const eventFields = [
		{
			field: 'id',
			required: true,
			description: 'Unique event identifier (not displayed here).',
			example: 'evt-spring-summit'
		},
		{
			field: 'slug',
			required: true,
			description: 'Stable key for lookup (not displayed here).',
			example: 'spring-summit-2026'
		},
		{
			field: 'title',
			required: true,
			description: 'Main event title shown in the card heading.',
			example: 'Spring AI Summit'
		},
		{
			field: 'type',
			required: true,
			description: 'Base type used for the badge label (default: event).',
			example: 'event'
		},
		{
			field: 'typeLabel',
			required: false,
			description: 'Optional display override for the badge label.',
			example: 'Webinar'
		},
		{
			field: 'tagline',
			required: false,
			description: 'Short supporting line beneath the title.',
			example: 'Hands-on tactics for AI adoption'
		},
		{
			field: 'summary',
			required: true,
			description: 'One-paragraph summary in the card body.',
			example: 'A live session on scaling AI workflows across teams.'
		},
		{
			field: 'date',
			required: true,
			description: 'Human-readable date shown on the card.',
			example: 'March 12, 2026'
		},
		{
			field: 'time',
			required: false,
			description: 'Optional time or list of times shown under the date.',
			example: '2:00 PM – 3:00 PM PT'
		},
		{
			field: 'startAt',
			required: true,
			description: 'ISO date used to sort upcoming vs past events.',
			example: '2026-03-12T22:00:00.000Z'
		},
		{
			field: 'endAt',
			required: false,
			description: 'Optional ISO date for multi-day events.',
			example: '2026-03-12T23:00:00.000Z'
		},
		{
			field: 'registerUrl',
			required: true,
			description: 'CTA link for the “Register” button.',
			example: 'https://example.com/register'
		},
		{
			field: 'registerLabel',
			required: false,
			description: 'Optional button label override (defaults to “Register”).',
			example: 'Request to Join'
		},
		{
			field: 'draft',
			required: false,
			description: 'If true, adds “Draft” to the badge (dev-only listing).',
			example: 'true'
		}
	];

	const markdownTable = `| Field | Required | Description | Example |
| --- | --- | --- | --- |
${eventFields
	.map(
		(item) =>
			`| \`${item.field}\` | ${item.required ? 'Yes' : 'No'} | ${item.description} | \`${item.example}\` |`
	)
	.join('\n')}`;

	const jsonSample = JSON.stringify(
		{
			id: 'evt-spring-summit',
			slug: 'spring-summit-2026',
			title: 'Spring AI Summit',
			type: 'event',
			typeLabel: 'Webinar',
			tagline: 'Hands-on tactics for AI adoption',
			summary: 'A live session on scaling AI workflows across teams.',
			date: 'March 12, 2026',
			time: '2:00 PM – 3:00 PM PT',
			startAt: '2026-03-12T22:00:00.000Z',
			endAt: '2026-03-12T23:00:00.000Z',
			registerUrl: 'https://example.com/register',
			registerLabel: 'Request to Join',
			draft: false
		},
		null,
		2
	);

	const jsonSchema = JSON.stringify(
		{
			$schema: 'https://json-schema.org/draft/2020-12/schema',
			title: 'Event',
			type: 'object',
			required: ['id', 'slug', 'title', 'type', 'summary', 'date', 'startAt', 'registerUrl'],
			properties: {
				id: { type: 'string' },
				slug: { type: 'string' },
				title: { type: 'string' },
				type: { type: 'string' },
				typeLabel: { type: 'string' },
				tagline: { type: 'string' },
				summary: { type: 'string' },
				date: { type: 'string' },
				time: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
				timezone: { type: 'string' },
				startAt: { type: 'string' },
				endAt: { type: 'string' },
				location: { type: 'string' },
				registerUrl: { type: 'string' },
				registerLabel: { type: 'string' },
				image: { type: 'string' },
				imageAlt: { type: 'string' },
				speakers: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							title: { type: 'string' },
							photo: { type: 'string' },
							photoAlt: { type: 'string' }
						},
						required: ['name', 'title']
					}
				},
				relatedProgramSlugs: { type: 'array', items: { type: 'string' } },
				draft: { type: 'boolean' }
			},
			additionalProperties: false
		},
		null,
		2
	);

	let copiedTable = false;
	let copiedJson = false;
	let copiedSchema = false;

	const copyToClipboard = async (value: string, kind: 'table' | 'json' | 'schema') => {
		try {
			await navigator.clipboard.writeText(value);
			if (kind === 'table') copiedTable = true;
			if (kind === 'json') copiedJson = true;
			if (kind === 'schema') copiedSchema = true;
			setTimeout(() => {
				if (kind === 'table') copiedTable = false;
				if (kind === 'json') copiedJson = false;
				if (kind === 'schema') copiedSchema = false;
			}, 1200);
		} catch (error) {
			console.error('Failed to copy to clipboard', error);
		}
	};
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/events" />

<section class="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
	<div class="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14">
		<div class="rounded-3xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-xs text-cyan-100">
			<p class="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-cyan-200">
				Dev-only reference
			</p>
			<div class="mt-2 grid gap-2 text-[0.7rem] text-cyan-100/90 md:grid-cols-2">
				<div>
					<p class="font-semibold text-cyan-100">Training images</p>
					<p>Hero sizes in use: 1920×1080 and 3840×2160.</p>
					<p>Open graph sizes: 1920×1080.</p>
					<p>
						Features and hero images should be located here:
						<code>/workspaces/cambermast-website-new/web/static/images/</code>.
						<br />
						<span>Sample filenames:</span>
						<br />
						<code>sample-image-filename.jpg</code> and <code>sample-image-og.jpg</code>.
					</p>
				</div>
				<div>
					<p class="font-semibold text-cyan-100">Event images</p>
					<p>Current Lu.ma cover image: 800×800 (square).</p>
					<p>Event images should also be stored in <code>/workspaces/cambermast-website-new/web/static/images/</code>.</p>
				</div>
			</div>
			<div class="mt-4 rounded-2xl border border-cyan-300/20 bg-slate-950/60 p-4 text-[0.7rem] text-cyan-100/90">
				<p class="font-semibold text-cyan-100">Events data fields</p>
				<p>
					Source:
					<a class="underline" href="/src/lib/data/events/events.json" target="_blank" rel="noopener">
						<code>web/src/lib/data/events/events.json</code>
					</a>
					.
				</p>
				<div class="mt-3 flex flex-wrap gap-2 text-[0.65rem]">
					<button
						class={`rounded-full border border-cyan-200/40 px-3 py-1 font-semibold transition ${
							copiedTable ? 'bg-cyan-300/30 text-white' : 'bg-cyan-400/10 text-cyan-50'
						}`}
						type="button"
						on:click={() => copyToClipboard(markdownTable, 'table')}
					>
						{copiedTable ? 'Copied table ✓' : 'Copy table (Markdown)'}
					</button>
					<button
						class={`rounded-full border border-cyan-200/40 px-3 py-1 font-semibold transition ${
							copiedJson ? 'bg-cyan-300/30 text-white' : 'bg-cyan-400/10 text-cyan-50'
						}`}
						type="button"
						on:click={() => copyToClipboard(jsonSample, 'json')}
					>
						{copiedJson ? 'Copied JSON ✓' : 'Copy JSON'}
					</button>
					<button
						class={`rounded-full border border-cyan-200/40 px-3 py-1 font-semibold transition ${
							copiedSchema ? 'bg-cyan-300/30 text-white' : 'bg-cyan-400/10 text-cyan-50'
						}`}
						type="button"
						on:click={() => copyToClipboard(jsonSchema, 'schema')}
					>
						{copiedSchema ? 'Copied schema ✓' : 'Copy JSON schema'}
					</button>
				</div>
				<div class="mt-3 overflow-x-auto">
					<table class="w-full border-collapse text-left">
						<thead>
							<tr class="border-b border-cyan-300/20 text-[0.65rem] uppercase tracking-[0.2em] text-cyan-200">
								<th class="py-2 pr-3 font-semibold">Field</th>
								<th class="py-2 pr-3 font-semibold">Required</th>
								<th class="py-2 font-semibold">Description (used on this page)</th>
							</tr>
						</thead>
						<tbody class="text-cyan-100/90">
							{#each eventFields as item}
								<tr class="border-b border-cyan-300/10">
									<td class="py-2 pr-3"><code>{item.field}</code></td>
									<td class="py-2 pr-3">{item.required ? 'Yes' : 'No'}</td>
									<td class="py-2">
										{item.description}
										<br />
										<span class="text-cyan-100/70">Example: <code>{item.example}</code></span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Cambermast events</p>
			<h1 class="text-4xl font-semibold md:text-5xl">Events, webinars, and live sessions</h1>
			<p class="max-w-2xl text-base text-white/80">
				Join upcoming Cambermast-hosted events to learn from real-world AI delivery experiences,
				connect with practitioners, and explore related training.
			</p>
			<a
				href="/calendar"
				class="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/50"
			>
				View full training calendar →
			</a>
		</div>

		{#if upcomingEvents.length}
			<div class="grid gap-4">
				{#each upcomingEvents as event}
					<article class="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/40">
						<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
							<div class="flex flex-col gap-3">
								<p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
									{getEventBadge(getEventTypeLabel(event), event.draft)}
								</p>
								<h2 class="text-2xl font-semibold text-white">{event.title}</h2>
								{#if event.tagline}
									<p class="text-sm text-white/70">{event.tagline}</p>
								{/if}
								<p class="text-sm text-white/70">{event.date}</p>
								{#if event.time}
									<p class="text-xs text-white/60">{formatTime(event.time)}</p>
								{/if}
								<p class="text-sm text-white/80">{event.summary}</p>
							</div>
							<div class="flex flex-col gap-2 md:items-end">
								<a
									href={event.registerUrl}
									target="_blank"
									rel="noopener"
									class="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-400/40 transition hover:bg-cyan-300"
								>
									{event.registerLabel ?? 'Register'} ↗
								</a>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
				No upcoming events are listed right now. Check the training calendar for the latest schedule.
			</div>
		{/if}
	</div>
</section>

{#if pastEvents.length}
	<section class="bg-white">
		<div class="mx-auto max-w-6xl px-5 py-12">
			<h2 class="text-2xl font-semibold text-slate-900">Past events</h2>
			<div class="mt-6 grid gap-4 md:grid-cols-2">
				{#each pastEvents as event}
					<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
						<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
							{getEventBadge(getEventTypeLabel(event), event.draft)}
						</p>
						<p class="mt-2 text-sm font-semibold text-slate-900">{event.title}</p>
						<p class="text-xs text-slate-600">{event.date}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}
