<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let icon;
	export let label;
	export let headline;
	export let testimonial;
	export let author;
	export let route;

	const navigateToRoute = () => {
		if (!route || !browser) return;
		goto(route);
	};

	const handleCardClick = (event) => {
		if (!route) return;
		if (event.target instanceof HTMLElement && event.target.closest('a')) {
			return;
		}
		navigateToRoute();
	};

	const handleCardKeydown = (event) => {
		if (!route) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			navigateToRoute();
		}
	};
</script>

<article
	class="flex h-full flex-col rounded-2xl border-2 border-blue-300 bg-white p-6 text-center shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
	class:cursor-pointer={!!route}
	role={route ? 'link' : undefined}
	tabindex={route ? 0 : undefined}
	on:click={handleCardClick}
	on:keydown={handleCardKeydown}
>
	<div class="flex flex-1 flex-col items-center">
		{#if icon}
			<div class="mb-4 text-5xl">{@html icon}</div>
		{/if}
		<h3 class="text-xl font-bold">{label}</h3>
		<p class="mt-2 text-gray-600">{headline}</p>
	</div>
	{#if route}
		<a
			href={route}
			class="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
			aria-label={`Learn more about ${label}`}
		>
			Learn more
		</a>
	{/if}
	{#if testimonial}
		<div class="mt-6 w-full rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
			“{testimonial}”
			<div class="mt-2 text-right font-medium text-gray-500">{author}</div>
		</div>
	{/if}
</article>
