<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/connect');

	type BookingOption = {
		title: string;
		priceLabel: string;
		description: string;
		href: string;
		highlight?: boolean;
	};

	const bookingOptions: BookingOption[] = [
		{
			title: '30-minute Consultation',
			priceLabel: '$100',
			description:
				'Bring a specific question: training fit, workflow design, governance, or a decision you need to make this week.',
			href: 'https://cal.com/billraymond/30minconsult',
			highlight: true
		},
		{
			title: '60-minute Consultation',
			priceLabel: '$200',
			description:
				'Best for deeper work: problem framing, solution mapping, rollout planning, or live working session with notes.',
			href: 'https://cal.com/billraymond/60minconsult'
		}
	];
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/connect" />

<section class="mb-10">
	<div>
		<h1 class="mb-6 text-3xl font-bold">Book time with Bill</h1>
		<p class="mb-6 max-w-3xl text-gray-700">
			Paid consults are the fastest path to a clear answer on training fit, workflow design, and
			implementation decisions.
		</p>
		<div class="mt-4">
			<div
				class="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
			>
				<img
					src="/images/bill.jpg"
					alt="Bill Raymond"
					class="h-12 w-12 rounded-2xl border border-gray-200 object-cover"
				/>
				<div class="flex min-w-0 flex-1 items-center justify-between gap-3">
					<div class="text-left leading-tight">
						<p class="text-xs font-semibold tracking-wide text-blue-600 uppercase">
							AI leadership in action
						</p>
						<p class="text-sm font-semibold text-gray-900">Bill Raymond</p>
					</div>
					<a
						href="/contact"
						class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
					>
						Contact Bill
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="mb-14">
	<div>
		<div class="grid gap-5 md:grid-cols-2">
			{#each bookingOptions as option (option.href)}
				<a
					href={option.href}
					target="_blank"
					rel="noopener noreferrer"
					class="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
					class:ring-2={option.highlight}
					class:ring-blue-200={option.highlight}
				>
					<div class="flex items-start justify-between gap-3">
						<h2 class="text-lg font-bold text-gray-900 group-hover:text-blue-600">
							{option.title}
						</h2>
						<span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
							{option.priceLabel}
						</span>
					</div>
					<p class="mt-3 text-sm text-gray-700">{option.description}</p>
					<div class="mt-5 inline-flex items-center text-sm font-semibold text-blue-600">
						Schedule now <span class="ml-1 transition-transform group-hover:translate-x-1">→</span>
					</div>
					{#if option.highlight}
						<p class="mt-3 text-xs font-semibold text-blue-700">Recommended starting point</p>
					{/if}
				</a>
			{/each}
		</div>
		<div class="mt-6 text-center">
			<a href="/about" class="font-semibold text-blue-700 underline underline-offset-4">
				Learn more about Cambermast →
			</a>
		</div>
	</div>
</section>

<section class="mb-16">
	<div>
		<div class="rounded-2xl border border-gray-200 bg-gray-50 p-6">
			<h2 class="text-xl font-bold text-gray-900">Other ways to connect</h2>
			<ul class="mt-3 space-y-2 text-sm text-gray-700">
				<li>
					<span aria-hidden="true">📬 </span>
					<a href="/contact" class="font-semibold text-blue-700 underline underline-offset-4">
						Contact form
					</a>
					<span class="text-gray-600"> is the best place for training, advisory, or general questions.</span>
				</li>
				<li>
					<span aria-hidden="true">📰 </span>
					<a
						href="https://billtalksai.com/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-semibold text-blue-700 underline underline-offset-4"
					>
						Bill Talks AI newsletter
					</a>
					<span class="text-gray-600"> shares weekly insights and announcements.</span>
				</li>
				<li>
					<span aria-hidden="true">🎙️ </span>
					<a
						href="https://agileinaction.com/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-semibold text-blue-700 underline underline-offset-4"
					>
						Agile in Action podcast
					</a>
					<span class="text-gray-600"> features leadership conversations about modern work.</span>
				</li>
				<li>
					<span aria-hidden="true">💼 </span>
					<a
						href="https://www.linkedin.com/in/williamraymond/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-semibold text-blue-700 underline underline-offset-4"
					>
						Bill on LinkedIn
					</a>
					<span class="text-gray-600"> has updates, posts, and announcements.</span>
				</li>
			</ul>
		</div>
	</div>
</section>
