<script>
	export let icon;
	export let label;
	export let headline;
	export let testimonial;
	export let author;
</script>

<article
	class="flex flex-col items-center rounded-2xl border-2 border-blue-300 bg-white p-6 shadow-sm"
>
	{#if icon}
		<div class="mb-4 text-5xl">{@html icon}</div>
	{/if}
	<h3 class="text-center text-xl font-bold">{label}</h3>
	<p class="mt-2 text-center text-gray-600">{headline}</p>
	{#if testimonial}
		<div class="mt-4 w-full rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
			“{testimonial}”
			<div class="mt-2 text-right font-medium text-gray-500">{author}</div>
		</div>
	{/if}
</article>
