<script lang="ts">
	import { page } from '$app/state';
	import { dev } from '$app/environment';

	const baseChips = [
		{ href: '/admin', label: '🧭 Admin' },
		{ href: '/admin/sop', label: '📚 Event SOPs' },
		{ href: '/admin/sop-training', label: '🎓 Training SOPs' },
		{ href: '/admin/sop-testimonials', label: '💬 Testimonial SOPs' },
		{ href: '/admin/events', label: '🟢 Live Events' },
		{ href: '/admin/drafts', label: '📝 Draft Events' },
		{ href: '/admin/campaigns', label: '📣 Campaigns' },
		{ href: '/admin/forms', label: '🧾 Forms' }
	] as const;
	const devChips = [
		{ href: '/admin/image-gen', label: '🖼️ Image Gen (Dev)' },
		{ href: '/admin/sop-image-gen', label: '🧩 Image Gen SOP (Dev)' }
	] as const;
	const chips = [...baseChips, ...(dev ? devChips : [])] as const;

	const pathname = $derived(page.url.pathname);
</script>

<nav aria-label="Admin page navigation" class="mb-2 flex flex-wrap gap-2">
	{#each chips as chip}
		{@const active =
			chip.href === '/admin'
				? pathname === '/admin'
				: pathname === chip.href || pathname.startsWith(`${chip.href}/`)}
		<a
			href={chip.href}
			aria-current={active ? 'page' : undefined}
			class={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
				active
					? 'border-blue-200 bg-blue-600/10 text-blue-700'
					: 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white hover:text-gray-900'
			}`}
		>
			{chip.label}
		</a>
	{/each}
</nav>
