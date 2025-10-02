<script>
	export let icon;
	export let label;
	export let headline;
	export let testimonial;
	export let author;
	export let route;
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
	{/if}
</article>
