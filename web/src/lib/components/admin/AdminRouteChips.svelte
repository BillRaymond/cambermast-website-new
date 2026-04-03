<script lang="ts">
	import { page } from '$app/state';
	import { dev } from '$app/environment';

	type Chip = {
		href: string;
		label: string;
	};

	type ChipGroup = {
		id: string;
		label: string;
		chips: readonly Chip[];
	};

	const chipGroups = [
		{
			id: 'core',
			label: 'Core',
			chips: [
				{ href: '/admin', label: '🧭 Admin' },
				{ href: '/admin/events', label: '🟢 Live Events' },
				{ href: '/admin/drafts', label: '📝 Draft Events' },
				{ href: '/admin/campaigns', label: '📣 Campaigns' },
				{ href: '/admin/partners', label: '🤝 Partner Pages' },
				{ href: '/admin/forms', label: '🧾 Forms' }
			]
		},
		{
			id: 'tools',
			label: 'Tools',
			chips: [
				{ href: '/admin/events/luma', label: '📋 Luma Copy' },
				{ href: '/admin/qr', label: '🔳 Route QR' }
			]
		},
		{
			id: 'feeds',
			label: 'Feeds',
			chips: [
				{ href: '/admin/sop-commerce', label: '🛒 Commerce SOP' },
				{ href: '/feed/openai-products.jsonl.gz', label: '📦 OpenAI Feed' }
			]
		},
		{
			id: 'sops',
			label: 'SOPs',
			chips: [
				{ href: '/admin/sop', label: '📚 Event SOPs' },
				{ href: '/admin/sop-training', label: '🎓 Training SOPs' },
				{ href: '/admin/sop-testimonials', label: '💬 Testimonial SOPs' },
				{ href: '/admin/sop-redirects', label: '🧭 Redirect SOP' },
				{ href: '/admin/sop-image-gen', label: '🧩 Image Gen SOP (Dev)' }
			]
		},
		{
			id: 'dev',
			label: 'Dev',
			chips: [
				{ href: '/admin/events/create', label: '🧪 Create Event (Dev)' },
				{ href: '/admin/redirects', label: '↪️ Redirects (Dev)' },
				{ href: '/admin/image-gen', label: '🖼️ Image Gen (Dev)' }
			]
		}
	] as const satisfies readonly ChipGroup[];

	const visibleChipGroups = $derived.by(
		(): ChipGroup[] => (dev ? [...chipGroups] : chipGroups.filter((group) => group.id !== 'dev'))
	);

	const pathname = $derived(page.url.pathname);

	function isChipActive(href: string, currentPathname: string): boolean {
		return href === '/admin'
			? currentPathname === '/admin'
			: currentPathname === href || currentPathname.startsWith(`${href}/`);
	}

	function getActiveGroupId(currentPathname: string, groups: readonly ChipGroup[]): string {
		return (
			groups.find((group) => group.chips.some((chip) => isChipActive(chip.href, currentPathname)))?.id ??
			groups[0]?.id ??
			'core'
		);
	}

	let selectedGroupId = $state('core');

	$effect(() => {
		selectedGroupId = getActiveGroupId(pathname, visibleChipGroups);
	});

	const selectedGroup = $derived(
		visibleChipGroups.find((group) => group.id === selectedGroupId) ?? visibleChipGroups[0]
	);
</script>

<nav aria-label="Admin page navigation" class="mb-2">
	<div class="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
		<div class="space-y-2">
			<div class="flex flex-wrap items-center gap-1 rounded-xl bg-gray-100 p-1">
				{#each visibleChipGroups as group}
					<button
						type="button"
						aria-pressed={group.id === selectedGroupId}
						onclick={() => {
							selectedGroupId = group.id;
						}}
						class={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
							group.id === selectedGroupId
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
						}`}
					>
						{group.label}
					</button>
				{/each}
			</div>

			{#if selectedGroup}
				<div class="flex flex-wrap items-center gap-1 border-t border-gray-100 pt-2">
					{#each selectedGroup.chips as chip}
						{@const active = isChipActive(chip.href, pathname)}
						<a
							href={chip.href}
							aria-current={active ? 'page' : undefined}
							class={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition ${
								active
									? 'bg-blue-50 text-blue-700'
									: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
							}`}
						>
							{chip.label}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</nav>
