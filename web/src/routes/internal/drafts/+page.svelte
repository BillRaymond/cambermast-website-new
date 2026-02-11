<script lang="ts">
	import type { PageData } from './$types';
	import { isSessionDraft, isExternalUrl } from '$lib/data/training/session-utils';

	export let data: PageData;

	const programs = data.trainingPrograms;
	const externalEvents = data.externalEvents;

	const draftPrograms = programs.filter((program) => program.draft);

	const draftSessions = programs
		.flatMap((program) => (program.sessions ?? []).map((session) => ({ program, session })))
		.filter(({ session }) => isSessionDraft(session))
		.sort((a, b) => {
			const aValue = toSortValue(a.session.startDate);
			const bValue = toSortValue(b.session.startDate);
			return aValue - bValue;
		});

	const draftExternalEvents = externalEvents
		.filter((event) => event.draft)
		.sort((a, b) => toSortValue(a.startAt) - toSortValue(b.startAt));

	function toSortValue(value?: string | null): number {
		if (!value) return Number.MAX_SAFE_INTEGER;
		const parsed = new Date(value);
		const timestamp = parsed.getTime();
		return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
	}

	const formatTime = (value?: string | string[]): string[] => {
		if (!value) return [];
		return Array.isArray(value) ? value : [value];
	};
</script>

<main class="mx-auto max-w-5xl px-4 py-10 md:px-6">
	<header class="flex flex-col gap-3">
		<h1 class="text-3xl font-semibold tracking-tight text-gray-900">Internal draft overview</h1>
		<p class="max-w-2xl text-sm text-gray-600">
			This route (<code class="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-700"
				>/internal/drafts</code
			>) is intentionally hidden from navigation, marketing pages, and the sitemap. Use it to review
			draft training programs, sessions, and events before they launch.
		</p>
	</header>

	<section class="mt-12 flex flex-col gap-4">
		<div class="flex items-center gap-3">
			<h2 class="text-xl font-semibold text-gray-900">Draft training programs</h2>
			{#if draftPrograms.length > 0}
				<span
					class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-amber-700 uppercase"
				>
					{draftPrograms.length} draft{draftPrograms.length === 1 ? '' : 's'}
				</span>
			{/if}
		</div>
		{#if draftPrograms.length > 0}
			<ul class="grid gap-4">
				{#each draftPrograms as program}
					<li
						class="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm shadow-amber-100/40"
					>
						<div class="flex flex-col gap-2">
							<div class="flex flex-wrap items-center gap-2">
								<a
									class="text-base font-semibold text-blue-700 hover:text-blue-900 hover:underline"
									href={program.route}
								>
									{program.title}
								</a>
								<span
									class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold tracking-wide text-amber-700 uppercase"
								>
									Program draft
								</span>
							</div>
							{#if program.tagline}
								<p class="text-sm text-gray-600">{program.tagline}</p>
							{/if}
						</div>

						{#if program.sessions?.length}
							<div class="mt-4 space-y-3">
								<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Sessions</p>
								<ul class="space-y-2 text-sm text-gray-700">
									{#each program.sessions as session}
										<li class="rounded-xl bg-gray-50/70 p-3">
											<div class="flex flex-wrap items-center gap-2">
												<span class="font-medium text-gray-900">
													{session.name ?? 'Untitled session'}
												</span>
												{#if session.draft}
													<span
														class="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-amber-700 uppercase"
													>
														Draft
													</span>
												{/if}
											</div>
											<div class="mt-2 space-y-1 text-xs text-gray-600">
												{#if session.date}
													<p>{session.date}</p>
												{/if}
												{#each formatTime(session.time) as timeLine}
													<p>{timeLine}</p>
												{/each}
												{#if session.location}
													<p>{session.location}</p>
												{/if}
												{#if session.spots}
													<p>{session.spots}</p>
												{/if}
											</div>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-600">
				All training programs are currently published.
			</p>
		{/if}
	</section>

	<section class="mt-12 flex flex-col gap-4">
		<div class="flex flex-wrap items-center gap-3">
			<h2 class="text-xl font-semibold text-gray-900">Draft sessions</h2>
			{#if draftSessions.length > 0}
				<span
					class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-amber-700 uppercase"
				>
					{draftSessions.length} pending
				</span>
			{/if}
		</div>
		{#if draftSessions.length > 0}
			<div class="grid gap-3">
				{#each draftSessions as { program, session }}
					<article class="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
						<header class="flex flex-wrap items-center gap-2 text-sm font-semibold text-amber-900">
							<a class="hover:underline" href={program.route}>{program.title}</a>
							{#if session.name && session.name.trim() && session.name.trim() !== program.title}
								<span>· {session.name}</span>
							{/if}
						</header>
						<div class="mt-2 space-y-1 text-xs text-amber-900/90">
							{#if session.date}
								<p>{session.date}</p>
							{/if}
							{#each formatTime(session.time) as timeLine}
								<p>{timeLine}</p>
							{/each}
							{#if session.location}
								<p>{session.location}</p>
							{/if}
							{#if session.spots}
								<p>{session.spots}</p>
							{/if}
						</div>
						{#if session.registerUrl}
							<div class="mt-3">
								<a
									class="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
									href={session.registerUrl}
									rel={isExternalUrl(session.registerUrl) ? 'noopener noreferrer' : undefined}
									target={isExternalUrl(session.registerUrl) ? '_blank' : undefined}
								>
									{isExternalUrl(session.registerUrl)
										? 'External registration link'
										: 'Internal registration link'}
								</a>
							</div>
						{/if}
					</article>
				{/each}
			</div>
		{:else}
			<p class="rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-600">
				No draft sessions are currently defined.
			</p>
		{/if}
	</section>

	{#if draftExternalEvents.length > 0}
		<section class="mt-12 flex flex-col gap-4">
			<div class="flex flex-wrap items-center gap-3">
				<h2 class="text-xl font-semibold text-gray-900">Draft external events</h2>
				<span
					class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-amber-700 uppercase"
				>
					{draftExternalEvents.length} pending
				</span>
			</div>
			<div class="grid gap-3">
				{#each draftExternalEvents as event}
					<article class="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
						<h3 class="text-sm font-semibold text-amber-900">{event.title}</h3>
						{#if event.sessionLabel}
							<p class="text-xs text-amber-800/90">{event.sessionLabel}</p>
						{/if}
						<div class="mt-2 space-y-1 text-xs text-amber-800/90">
							{#if event.date}
								<p>{event.date}</p>
							{/if}
							{#each event.timeLines ?? [] as timeLine}
								<p>{timeLine}</p>
							{/each}
							{#if event.location}
								<p>{event.location}</p>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</section>
	{:else}
		<section
			class="mt-12 rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-600"
		>
			No draft external events are currently defined.
		</section>
	{/if}

	<footer class="mt-16 border-t border-gray-200 pt-6 text-xs text-gray-500">
		<p>
			Keep this link unlisted. If you ever need it removed from a production build, delete the
			<code class="rounded bg-gray-100 px-1 py-0.5 text-[0.7rem] text-gray-700"
				>/internal/drafts</code
			>
			route before exporting the site.
		</p>
	</footer>
</main>
