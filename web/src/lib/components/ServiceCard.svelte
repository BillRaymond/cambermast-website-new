<script>
	export let icon;
	export let label;
	export let headline;
	export let testimonial;
	export let author;
	export let route;
	export let testimonialCta;

	const DEFAULT_TESTIMONIAL_CTA_LABEL = 'Book for your team';
</script>

<article
	class="flex h-full flex-col rounded-2xl border-2 border-blue-300 bg-white p-5 text-center shadow-sm transition hover:shadow-md"
>
	<div class="flex flex-1 flex-col items-center">
		{#if icon}
			<div class="mb-3 text-5xl">{@html icon}</div>
		{/if}
		<h3 class="text-xl font-bold">{label}</h3>
		<p class="mt-2 text-gray-600">{headline}</p>
	</div>
	{#if route}
		<a
			href={route}
			class="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
			aria-label={`Learn more about ${label}`}
		>
			Learn more
		</a>
	{/if}
	{#if testimonial}
		<div class="mt-4 w-full rounded-lg bg-gray-50 p-2.5 text-sm text-gray-700">
			“{testimonial}”
			<div class="mt-1.5 text-right font-medium text-gray-500">{author}</div>
		</div>
		{#if testimonialCta?.href}
				<a
					href={testimonialCta.href}
					class="mt-3 inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-900"
					aria-label={testimonialCta?.ariaLabel ?? `Book ${label} for your team`}
				>
					{testimonialCta?.label ?? DEFAULT_TESTIMONIAL_CTA_LABEL}
				</a>
		{/if}
	{/if}
</article>
