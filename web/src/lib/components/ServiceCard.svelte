<script lang="ts">
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import SessionCard from '$lib/components/SessionCard.svelte';

	type UpcomingSession = {
		programTitle: string;
		sessionTitle?: string;
		date: string;
		timeLines?: string[];
		location?: string;
		registerUrl?: string;
	};

	type TestimonialCta = {
		href?: string;
		label?: string;
		ariaLabel?: string;
	};

	export let icon: string | undefined = undefined;
	export let label: string | undefined = undefined;
	export let headline: string | undefined = undefined;
	export let testimonial: string | undefined = undefined;
	export let author: string | undefined = undefined;
	export let testimonialRole: string | undefined = undefined;
	export let testimonialPhotoUrl: string | null | undefined = undefined;
	export let route: string | undefined = undefined;
	export let testimonialCta: TestimonialCta | undefined = undefined;
	export let hasUpcomingSessions = false;
	export let upcomingSessions: UpcomingSession[] = [];

	const DEFAULT_TESTIMONIAL_CTA_LABEL = 'Schedule for your team';
	const CONTACT_BADGE_LABEL = 'Contact us for availability';
	const fallbackContactHref = '/contact';
</script>

<article
	class="flex flex-col rounded-2xl border-2 border-blue-300 bg-white p-5 text-center shadow-sm transition hover:shadow-md"
>
	<div class="flex flex-1 flex-col items-center justify-between text-center">
		<div class="flex flex-col items-center text-center">
			{#if icon}
				{#if route}
					<a
						href={route}
						class="mb-1 cursor-pointer text-5xl"
						aria-label={`Learn more about ${label}`}
					>
						<span class="!select-text">{@html icon}</span>
					</a>
				{:else}
					<div class="mb-1 text-5xl">
						<span class="!select-text">{@html icon}</span>
					</div>
				{/if}
			{/if}
			{#if route}
				<h3 class="mb-0 text-xl leading-tight font-bold">
					<a
						href={route}
						class="transition hover:text-blue-700"
						aria-label={`Learn more about ${label}`}
					>
						{label}
					</a>
				</h3>
			{:else}
				<h3 class="mb-0 text-xl leading-tight font-bold">{label}</h3>
			{/if}
			<p class="mt-1 text-gray-600">{headline}</p>
		</div>
		{#if route}
			<div class="mt-2 flex w-full justify-center">
				<div class="flex min-h-[4.5rem] flex-col items-center justify-center gap-2 text-center">
					{#if hasUpcomingSessions}
						<div class="w-full rounded-xl bg-blue-50 p-3 text-left text-sm text-blue-900">
							<p class="text-xs font-semibold tracking-wide text-blue-600 uppercase">
								Upcoming sessions
							</p>
							<div class="mt-3 space-y-3">
								{#each upcomingSessions as session}
									<SessionCard
										title={session.programTitle}
										subtitle={session.sessionTitle}
										date={session.date}
										time={session.timeLines}
										location={session.location}
										ctaUrl={session.registerUrl}
										ctaLabel="Register now"
										tone="upcoming"
									/>
								{/each}
							</div>
						</div>
					{:else}
						<a
							href={testimonialCta?.href ?? fallbackContactHref}
							class="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700 uppercase underline-offset-2 hover:bg-blue-600/15 hover:underline"
							aria-label={`Contact Cambermast about ${label}`}
						>
							<span class="h-2 w-2 rounded-full bg-blue-500"></span>
							{CONTACT_BADGE_LABEL}
						</a>
					{/if}
					{#if testimonial}
						<div class="w-full">
							<ReviewCard
								quote={testimonial ?? ''}
								author={author ?? ''}
								role={testimonialRole ?? ''}
								photoUrl={testimonialPhotoUrl ?? undefined}
							/>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
	{#if testimonialCta?.href}
		<a
			href={testimonialCta.href}
			class="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
			aria-label={testimonialCta?.ariaLabel ?? `Schedule ${label} for your team`}
		>
			{testimonialCta?.label ?? DEFAULT_TESTIMONIAL_CTA_LABEL}
		</a>
	{/if}
	{#if route}
		<a
			href={route}
			class="mt-3 self-end text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
			aria-label={`Learn more about ${label}`}
		>
			Learn more →
		</a>
	{/if}
</article>
