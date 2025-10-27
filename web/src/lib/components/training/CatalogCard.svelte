<script lang="ts">
	import type { CatalogCardData } from './catalog-card-data';
	export let item: CatalogCardData;
	export let scheduleTeamLabel: string;

	const hasScheduleButton = (scheduleUrl?: string): boolean =>
		Boolean(scheduleUrl) && (!item.upcomingSessions || item.upcomingSessions.length === 0);
	const isScheduleTeamButton = (label?: string): boolean =>
		(label ?? '').toLowerCase().trim() === scheduleTeamLabel.toLowerCase();
</script>

<article class="flex h-full flex-col rounded-2xl border bg-white p-5 text-center shadow-sm">
	{#if item.image}
		<img
			src={item.image}
			alt={item.imageAlt ?? item.title}
			class="mb-3 w-full rounded-xl object-cover"
			loading="lazy"
		/>
	{/if}
	<h2 class="text-xl font-semibold">{item.title}</h2>
	{#if item.sku}
		<p class="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
			({item.sku})
		</p>
	{/if}
	{#if item.summary}<p class="mt-1.5 text-gray-600">{item.summary}</p>{/if}
	{#if item.bullets?.length}
		<ul class="bullet-list mt-3 space-y-1.5 text-left text-gray-700">
			{#each item.bullets as bullet}
				<li>{bullet}</li>
			{/each}
		</ul>
	{/if}
	{#if item.route}
		<div class="mt-auto flex w-full flex-col items-center gap-3 pt-5">
			{#if item.duration}
				<p class="text-sm font-semibold text-gray-700">
					Duration:
					{#if Array.isArray(item.duration)}
						{item.duration.join(', ')}
					{:else}
						{item.duration}
					{/if}
				</p>
			{/if}
			{#if item.upcomingSessions?.length}
				<div class="w-full rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
					<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
						Upcoming sessions
					</p>
					<ul class="mt-3 space-y-3">
						{#each item.upcomingSessions as session (session.registerUrl + session.date)}
							<li class="rounded-lg border border-white/60 bg-white/80 p-3">
								<p class="text-sm font-semibold text-gray-900">{session.name}</p>
								<p class="text-xs text-gray-600">{session.date}</p>
								{#if session.time}
									<p class="text-xs text-gray-600">{session.time}</p>
								{/if}
								<a
									href={session.registerUrl}
									class="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
								>
									Register
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{:else if hasScheduleButton(item.scheduleUrl)}
				<a
					href={item.scheduleUrl}
					class="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
					class:schedule-team-button={isScheduleTeamButton(item.scheduleLabel)}
				>
					{item.scheduleLabel ?? scheduleTeamLabel}
				</a>
			{/if}
			<a
				href={item.route}
				class="inline-flex w-full justify-center rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-700 transition hover:border-blue-500 hover:text-blue-900"
			>
				Learn more
			</a>
		</div>
	{/if}
</article>
