<script lang="ts">
	import type { PageData } from './$types';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';

	export let data: PageData;

	const events = data.events ?? [];
	const campaignIdSet = new Set(data.campaignIds ?? []);
	const partners = data.partners ?? [];

	const visibilityCounts = {
		public: events.filter((event) => event.visibility === 'public').length,
		unlisted: events.filter((event) => event.visibility === 'unlisted').length,
		draft: events.filter((event) => event.visibility === 'draft').length
	};

	const lifecycleCounts = {
		scheduled: events.filter((event) => event.lifecycleStatus === 'scheduled').length,
		postponed: events.filter((event) => event.lifecycleStatus === 'postponed').length,
		canceled: events.filter((event) => event.lifecycleStatus === 'canceled').length,
		completed: events.filter((event) => event.lifecycleStatus === 'completed').length
	};

	const registrationCounts = {
		open: events.filter((event) => event.registrationStatus === 'open').length,
		external: events.filter((event) => event.registrationStatus === 'external').length,
		closed: events.filter((event) => event.registrationStatus === 'closed').length,
		none: events.filter((event) => event.registrationStatus === 'none').length,
		waitlist: events.filter((event) => event.registrationStatus === 'waitlist').length,
		soldOut: events.filter((event) => event.registrationStatus === 'sold_out').length
	};

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/Los_Angeles',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});

	const formatStart = (startAtUtc: string): string => {
		const parsed = new Date(startAtUtc);
		if (Number.isNaN(parsed.valueOf())) return startAtUtc;
		return dateFormatter.format(parsed);
	};
</script>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Internal events registry</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		Use this route to manage event visibility, lifecycle state, registration state, and campaign
		linkage. This page is internal-only and intentionally excluded from sitemap/navigation.
	</p>
	<p class="text-xs text-gray-500">
		Data source:
		<code class="rounded bg-gray-100 px-1 py-0.5 text-[0.7rem] text-gray-700">
			web/src/lib/data/events/events.json
		</code>
	</p>
</header>

<section class="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
		<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Visibility</p>
			<p class="mt-2 text-sm text-gray-700">
				Public: <span class="font-semibold text-gray-900">{visibilityCounts.public}</span> ·
				Unlisted:
				<span class="font-semibold text-gray-900">{visibilityCounts.unlisted}</span> · Draft:
				<span class="font-semibold text-gray-900">{visibilityCounts.draft}</span>
			</p>
		</div>
		<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Lifecycle</p>
			<p class="mt-2 text-sm text-gray-700">
				Scheduled: <span class="font-semibold text-gray-900">{lifecycleCounts.scheduled}</span> ·
				Postponed:
				<span class="font-semibold text-gray-900">{lifecycleCounts.postponed}</span>
			</p>
			<p class="mt-1 text-sm text-gray-700">
				Canceled: <span class="font-semibold text-gray-900">{lifecycleCounts.canceled}</span> ·
				Completed:
				<span class="font-semibold text-gray-900">{lifecycleCounts.completed}</span>
			</p>
		</div>
		<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Registration</p>
			<p class="mt-2 text-sm text-gray-700">
				Open: <span class="font-semibold text-gray-900">{registrationCounts.open}</span> · External:
				<span class="font-semibold text-gray-900">{registrationCounts.external}</span> · Closed:
				<span class="font-semibold text-gray-900">{registrationCounts.closed}</span>
			</p>
			<p class="mt-1 text-sm text-gray-700">
				None: <span class="font-semibold text-gray-900">{registrationCounts.none}</span> · Waitlist:
				<span class="font-semibold text-gray-900">{registrationCounts.waitlist}</span> · Sold out:
				<span class="font-semibold text-gray-900">{registrationCounts.soldOut}</span>
			</p>
		</div>
	</section>

	<section class="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Partner catalog</p>
		<div class="mt-3 flex flex-wrap gap-3">
			{#each partners as partner}
				<div
					class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5"
				>
					{#if partner.logo}
						<img
							src={partner.logo}
							alt={`${partner.name} logo`}
							class="h-5 w-5 rounded object-contain"
							loading="lazy"
						/>
					{/if}
					<span class="text-xs font-semibold text-gray-800">{partner.code}</span>
					<span class="text-xs text-gray-600">{partner.name}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="mt-8">
		<div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 text-sm">
					<thead class="bg-gray-50">
						<tr class="text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
							<th class="px-4 py-3">Partners</th>
							<th class="px-4 py-3">Event</th>
							<th class="px-4 py-3">Start (PT)</th>
							<th class="px-4 py-3">State</th>
							<th class="px-4 py-3">Campaign</th>
							<th class="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each events as event}
							<tr class="align-top">
								<td class="px-4 py-3">
									{#if event.partners?.length}
										<ul class="space-y-2">
											{#each event.partners as partner}
												<li class="flex items-center gap-2">
													{#if partner.logo}
														<img
															src={partner.logo}
															alt={`${partner.name} logo`}
															class="h-7 w-7 rounded object-contain"
															loading="lazy"
														/>
													{/if}
													<div>
														<p class="text-xs font-semibold text-gray-800">{partner.name}</p>
														<p class="text-[0.65rem] text-gray-500">
															{partner.code}
															{#if partner.role}
																· {partner.role}
															{/if}
														</p>
													</div>
												</li>
											{/each}
										</ul>
									{:else}
										<p class="text-xs text-gray-500">None</p>
									{/if}
								</td>
								<td class="px-4 py-3">
									<p class="font-semibold text-gray-900">{event.title}</p>
									<p class="mt-1 text-xs text-gray-600">
										<code class="rounded bg-gray-100 px-1 py-0.5">{event.id}</code>
										· <code class="rounded bg-gray-100 px-1 py-0.5">{event.slug}</code>
									</p>
									<p class="mt-1 text-xs text-gray-500">{event.typeLabel}</p>
								</td>
								<td class="px-4 py-3 text-xs text-gray-700">
									<p>{formatStart(event.startAtUtc)}</p>
									<p class="mt-1 text-gray-500">{event.location}</p>
								</td>
								<td class="px-4 py-3 text-xs">
									<p>
										<span class="font-semibold text-gray-700">Visibility:</span>
										<span class="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
											{event.visibility}
										</span>
									</p>
									<p class="mt-1">
										<span class="font-semibold text-gray-700">Lifecycle:</span>
										<span class="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
											{event.lifecycleStatus}
										</span>
									</p>
									<p class="mt-1">
										<span class="font-semibold text-gray-700">Registration:</span>
										<span class="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
											{event.registrationStatus}
										</span>
									</p>
								</td>
								<td class="px-4 py-3 text-xs">
									{#if event.campaignId}
										<p>
											<code class="rounded bg-gray-100 px-1 py-0.5">{event.campaignId}</code>
										</p>
										{#if campaignIdSet.has(event.campaignId)}
											<p class="mt-1 font-semibold text-emerald-700">Linked</p>
										{:else}
											<p class="mt-1 font-semibold text-rose-700">Missing campaign entry</p>
										{/if}
									{:else}
										<p class="text-gray-500">No campaign</p>
									{/if}
								</td>
								<td class="px-4 py-3 text-xs">
									<div class="flex flex-col gap-1">
										<a
											class="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
											href={`/events/${event.slug}`}
										>
											Event page
										</a>
										{#if event.cta?.url}
											<a
												class="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
												href={event.cta.url}
												target={event.cta.url.startsWith('http') ? '_blank' : undefined}
												rel={event.cta.url.startsWith('http') ? 'noopener noreferrer' : undefined}
											>
												CTA target
											</a>
										{/if}
										{#if event.campaignId}
											<a
												class="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
												href={`/c/${event.campaignId}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												Short link
											</a>
											{#if campaignIdSet.has(event.campaignId)}
												<a
													class="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
													href={`/admin/campaigns#campaign-${event.campaignId}`}
												>
													Campaign page
												</a>
											{/if}
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
