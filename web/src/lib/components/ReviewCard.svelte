<script lang="ts">
	export let quote: string;
	export let author: string;
	export let role: string = '';
	export let photoUrl: string | null | undefined = undefined;
</script>

<figure class="flex h-full flex-col justify-between rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
	<div>
		<div class="flex items-center gap-1 text-yellow-500" aria-label="Rated five out of five stars">
			{#each Array(5) as _, index}
				<svg
					class="h-4 w-4 fill-current"
					viewBox="0 0 20 20"
					role="img"
					aria-hidden="true"
				>
					<polygon points="10 1.5 12.9 7.26 19.2 7.97 14.3 12.28 15.6 18.48 10 15.4 4.4 18.48 5.7 12.28 0.8 7.97 7.1 7.26" />
				</svg>
			{/each}
		</div>
		<blockquote class="mt-3.5 text-left text-base text-gray-800">“{quote}”</blockquote>
	</div>
	<figcaption class="mt-4 flex items-center gap-3 text-left text-sm text-gray-700">
		{#if photoUrl}
			<img
				src={photoUrl}
				alt={`${author} headshot`}
				class="h-12 w-12 flex-shrink-0 rounded-full border border-blue-100 object-cover"
				loading="lazy"
				decoding="async"
			/>
		{/if}
		<div class="font-semibold">
			{author}
			{#if role}
				<span class="block font-normal text-gray-500">{role}</span>
			{/if}
		</div>
	</figcaption>
</figure>
