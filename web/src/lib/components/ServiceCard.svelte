<script>
	export let icon;
	export let label;
	export let headline;
	export let testimonial;
	export let author;
	export let route;
	export let testimonialCta;
	export let hasUpcomingSessions = false;

	const DEFAULT_TESTIMONIAL_CTA_LABEL = 'Schedule for your team';
	const UPCOMING_BADGE_LABEL = 'Upcoming dates available';
	const CONTACT_BADGE_LABEL = 'Contact us for availability';
	const fallbackContactHref = '/contact';
</script>

<article
	class="flex h-full flex-col rounded-2xl border-2 border-blue-300 bg-white p-5 text-center shadow-sm transition hover:shadow-md"
>
	<div class="flex flex-1 flex-col items-center justify-between text-center">
		<div class="flex flex-col items-center gap-3 text-center">
			{#if icon}
				<div class="text-5xl">{@html icon}</div>
			{/if}
			<h3 class="min-h-[3.5rem] text-xl font-bold leading-tight">{label}</h3>
			<p class="text-gray-600">{headline}</p>
		</div>
		{#if route}
			<div class="mt-auto flex w-full justify-center pt-6 md:pt-8 lg:pt-10">
				<div class="flex min-h-[6.5rem] flex-col items-center justify-center gap-3 text-center">
					{#if hasUpcomingSessions}
						<span class="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
							<span class="h-2 w-2 rounded-full bg-blue-500"></span>
							{UPCOMING_BADGE_LABEL}
						</span>
					{:else}
						<a
							href={testimonialCta?.href ?? fallbackContactHref}
							class="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 underline-offset-2 hover:bg-blue-600/15 hover:underline"
							aria-label={`Contact Cambermast about ${label}`}
						>
							<span class="h-2 w-2 rounded-full bg-blue-500"></span>
							{CONTACT_BADGE_LABEL}
						</a>
					{/if}
					<a
						href={route}
						class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
						aria-label={`Learn more about ${label}`}
					>
						Learn more
					</a>
				</div>
			</div>
		{/if}
	</div>
		{#if testimonial}
			<div class="mt-4 w-full rounded-lg bg-gray-50 p-2.5 text-sm text-gray-700 min-h-[6.5rem] flex flex-col justify-between">
				<p>“{testimonial}”</p>
				<div class="mt-1.5 text-right font-medium text-gray-500">{author}</div>
		</div>
		{#if testimonialCta?.href}
			<a
				href={testimonialCta.href}
				class="mt-3 inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-900"
				aria-label={testimonialCta?.ariaLabel ?? `Schedule ${label} for your team`}
			>
				{testimonialCta?.label ?? DEFAULT_TESTIMONIAL_CTA_LABEL}
			</a>
		{/if}
	{/if}
</article>
