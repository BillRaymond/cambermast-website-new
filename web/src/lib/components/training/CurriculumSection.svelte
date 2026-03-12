<script lang="ts">
	import type { CurriculumItem, CurriculumVariant } from './curriculum';

	export let items: CurriculumItem[] = [];
	export let variant: CurriculumVariant = 'standard';
</script>

{#if variant === 'standard'}
	<div class="mt-5 grid gap-5 md:grid-cols-3">
		{#each items as item}
			<div class="rounded-2xl border border-blue-100 p-4">
				<h3 class="text-lg font-semibold text-blue-700">{item.title}</h3>
				{#if item.details.length}
					<ul class="bullet-list mt-2.5 space-y-1.5 text-sm text-gray-700">
						{#each item.details as detail}
							<li>{detail}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<ul class="mt-4 space-y-3">
		{#each items as item}
			<li class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
				<div class="flex flex-wrap items-center gap-2">
					{#if item.badgeLabel}
						<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
							{item.badgeLabel}
						</span>
					{/if}
					<p class="text-sm font-semibold text-slate-900">{item.title}</p>
				</div>
				{#if item.details.length}
					<ul class="mt-2 divide-y divide-slate-200/70 text-sm leading-5 text-slate-700">
						{#each item.details as detail}
							<li class="py-1.5 first:pt-0 last:pb-0">{detail}</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
