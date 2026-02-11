<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { listNewsPosts, resolveFeaturedImage } from '$lib/data/news';

	const posts = listNewsPosts();

	const formatDate = (isoDate: string): string =>
		new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
			new Date(isoDate)
		);
</script>

<SeoHead
	title="News & Updates | Cambermast"
	description="Preview of Cambermast news, posts, and announcements."
	path="/news"
/>

<section class="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
	<p class="mb-2 text-xs font-semibold tracking-[0.14em] text-blue-700 uppercase">Preview</p>
	<h1 class="mb-3 text-3xl font-bold">News &amp; Updates</h1>
	<p class="max-w-3xl text-gray-700">
		A lightweight home for announcements, workshop recaps, and practical AI adoption notes. This
		section is not linked from navigation yet, so you can review it privately.
	</p>
</section>

<section class="grid gap-6 md:grid-cols-2">
	{#each posts as post}
		<article
			class="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
		>
			<a class="flex h-full flex-col" href={`/news/${post.slug}`}>
				<div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
					<img
						src={resolveFeaturedImage(post.featuredImage)}
						alt={post.featuredImageAlt}
						loading="lazy"
						class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-black/35 to-black/0"></div>
				</div>
				<div class="flex flex-1 flex-col gap-3 p-5">
					<div
						class="flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-700 uppercase"
					>
						<span class="rounded-full bg-blue-50 px-2 py-1">Preview</span>
						<time datetime={post.date} class="text-gray-700">
							{formatDate(post.date)}
						</time>
						{#if post.readTimeMinutes}
							<span aria-hidden="true" class="text-gray-400">•</span>
							<span class="text-gray-700">{post.readTimeMinutes} min read</span>
						{/if}
					</div>
					<h2 class="text-xl leading-tight font-semibold text-gray-900 group-hover:text-blue-700">
						{post.title}
					</h2>
					<p class="text-gray-700">{post.excerpt}</p>
					{#if post.tags?.length}
						<div class="mt-auto flex flex-wrap gap-2">
							{#each post.tags as tag}
								<span
									class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
								>
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</a>
		</article>
	{/each}
</section>
