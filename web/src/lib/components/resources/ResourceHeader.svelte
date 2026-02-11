<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';

	export let title: string;
	export let description: string | undefined = undefined;
	export let path: string | undefined = undefined;
	export let imageSrc: string | undefined = undefined;
	export let imageAlt: string | undefined = undefined;
	export let label: string = 'Resource';
</script>

<SeoHead {title} {description} {path} image={imageSrc} {imageAlt} />

<section class="mx-auto mb-8 max-w-4xl">
	<div class="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
		<div class="flex flex-col gap-6 md:flex-row md:items-center">
			<div class="order-2 space-y-4 md:order-1 md:w-1/2">
				<p class="text-sm font-semibold tracking-wide text-blue-600 uppercase">{label}</p>
				<h1 class="text-3xl font-bold text-gray-900">{title}</h1>
				{#if description}
					<p class="text-lg text-gray-700">{description}</p>
				{/if}
			</div>
			{#if imageSrc}
				<figure
					class="order-1 w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm md:order-2 md:w-1/2"
				>
					<img
						class="h-auto w-full object-contain"
						src={imageSrc}
						alt={imageAlt ?? `${title} featured image.`}
						loading="eager"
						decoding="async"
					/>
				</figure>
			{/if}
		</div>
	</div>
</section>
