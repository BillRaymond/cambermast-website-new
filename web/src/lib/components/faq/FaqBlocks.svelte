<script lang="ts">
	import { browser } from '$app/environment';
	import type { FaqBlock } from '$lib/data/faq/types';

	export let blocks: FaqBlock[] = [];

	let copiedIndex: number | null = null;

	const toMailtoHref = (block: Extract<FaqBlock, { type: 'email_template' }>): string => {
		const params = new URLSearchParams();
		params.set('subject', block.subject);
		params.set('body', block.body);
		const toValue = block.to?.trim() ?? '';
		return `mailto:${encodeURIComponent(toValue)}?${params.toString()}`;
	};

	const copyTemplate = async (index: number, block: Extract<FaqBlock, { type: 'email_template' }>) => {
		if (!browser) return;
		try {
			await navigator.clipboard.writeText(block.body);
			copiedIndex = index;
			setTimeout(() => {
				if (copiedIndex === index) copiedIndex = null;
			}, block.copiedStateMs ?? 1600);
		} catch (error) {
			console.warn('Unable to copy email template', error);
		}
	};
</script>

<div class="space-y-3">
	{#each blocks as block, index}
		{#if block.type === 'paragraph'}
			<p class="whitespace-pre-line text-sm text-slate-700">{block.text}</p>
		{:else if block.type === 'link'}
			<p>
				<a
					href={block.href}
					class="text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
					target={block.openInNewTab ? '_blank' : undefined}
					rel={block.openInNewTab ? 'noopener noreferrer' : undefined}
				>
					{block.label}
				</a>
			</p>
		{:else if block.type === 'email_template'}
			<div class="space-y-2">
				<div class="flex flex-wrap items-center gap-2">
					<a
						href={toMailtoHref(block)}
						class="inline-flex items-center rounded border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
					>
						{block.ctaLabel ?? 'Open in email client'}
					</a>
					<button
						type="button"
						class={`inline-flex items-center rounded border px-2.5 py-1.5 text-xs font-semibold transition ${
							copiedIndex === index
								? 'scale-[1.02] border-emerald-200 bg-emerald-50 text-emerald-800'
								: 'scale-100 border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900'
						} motion-safe:transition-transform`}
						on:click={() => copyTemplate(index, block)}
					>
						{copiedIndex === index
							? block.copiedButtonLabel ?? 'Copied'
							: block.copyButtonLabel ?? 'Copy email'}
					</button>
				</div>
				<pre
					class="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"
				><code>{block.body}</code></pre>
			</div>
		{/if}
	{/each}
</div>
