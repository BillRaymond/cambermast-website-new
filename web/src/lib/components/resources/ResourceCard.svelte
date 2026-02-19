<script lang="ts">
	export let href: string;
	export let title: string;
	export let description: string;
	export let imageSrc: string | undefined = undefined;
	export let imageAlt: string | undefined = undefined;
	export let label: string = 'Resource';
</script>

<a
	{href}
	class="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/60 sm:flex-row sm:items-start"
>
	{#if imageSrc}
		<figure class="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white sm:w-48">
			<img
				class="h-auto w-full object-contain"
				src={imageSrc}
				alt={imageAlt ?? `${title} featured image.`}
				loading="lazy"
				decoding="async"
			/>
		</figure>
	{:else}
		<div
			class="flex min-h-[120px] w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase sm:w-48"
		>
			Image coming soon
		</div>
	{/if}
	<div class="space-y-2 text-left">
		<p class="text-xs font-semibold tracking-wide text-blue-600 uppercase">{label}</p>
		<h2 class="text-2xl font-semibold text-gray-900">{title}</h2>
		<p class="text-sm text-gray-700">
			{description}
			<span
				class="mt-2 block font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition group-hover:text-blue-900"
			>
				Read more →
			</span>
		</p>
	</div>
</a>
