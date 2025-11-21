<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { resolveFeaturedImage } from '$lib/data/news';
	import type { PageData } from './$types';

	export let data: PageData;

	const { post } = data;

	const formatDate = (isoDate: string): string =>
		new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
			new Date(isoDate)
		);
</script>

<SeoHead
	title={`${post.title} | Cambermast News`}
	description={post.excerpt}
	path={`/news/${post.slug}`}
	image={post.featuredImage}
	imageAlt={post.featuredImageAlt}
	type="article"
/>

<article class="mx-auto max-w-4xl">
	<div class="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
		<span class="rounded-full bg-blue-50 px-2 py-1">Preview</span>
		<time datetime={post.date} class="text-gray-700">
			{formatDate(post.date)}
		</time>
		{#if post.readTimeMinutes}
			<span aria-hidden="true" class="text-gray-400">•</span>
			<span class="text-gray-700">{post.readTimeMinutes} min read</span>
		{/if}
	</div>

	<h1 class="mb-2 text-4xl font-bold leading-tight text-gray-900">{post.title}</h1>
	<div class="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-700">
		<span class="font-semibold text-gray-900">{post.author}</span>
		{#if post.tags?.length}
			<span aria-hidden="true" class="text-gray-300">•</span>
			<div class="flex flex-wrap items-center gap-2">
				{#each post.tags as tag}
					<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
						{tag}
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<div class="mb-8 overflow-hidden rounded-3xl border bg-gray-50 shadow-sm">
		<img
			src={resolveFeaturedImage(post.featuredImage)}
			alt={post.featuredImageAlt}
			class="h-full w-full object-cover"
		/>
	</div>

	<section class="flex flex-col gap-6 text-gray-800">
		{#each post.body as block}
			{#if block.type === 'heading'}
				<h2 class="text-2xl font-semibold text-gray-900">{block.text}</h2>
			{:else if block.type === 'list'}
				<ul class="list-disc space-y-2 pl-5 text-gray-800">
					{#each block.items as item}
						<li class="leading-relaxed">{item}</li>
					{/each}
				</ul>
			{:else}
				<p class="leading-relaxed text-gray-800">{block.text}</p>
			{/if}
		{/each}
	</section>

	<div class="mt-10 flex flex-wrap items-center gap-4 rounded-2xl border bg-gray-50 p-5">
		<div class="flex-1">
			<p class="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">
				Want to dig deeper?
			</p>
			<p class="text-gray-700">
				We share these notes during client working sessions. If you want a walkthrough tailored to
				your workflows, reach out.
			</p>
		</div>
		<a
			href="/contact"
			class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
		>
			Talk with Cambermast
		</a>
	</div>

	<div class="mt-6 text-sm">
		<a href="/news" class="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-800">
			<span aria-hidden="true">←</span> Back to news
		</a>
	</div>
</article>
