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
		},
		{
			title: 'Free 15-minute Chat',
			priceLabel: 'Free',
			description:
				'Quick intro call to see if we’re a fit. If you already know what you want, choose a paid consult above.',
			href: 'https://cal.com/billraymond/15min'
		}
	];
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/connect" />

<section class="mb-10">
	<div class="mx-auto max-w-4xl text-center">
		<div class="mx-auto mb-4 flex w-max items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
			<img
				src="/images/bill.jpg"
				alt="Bill Raymond"
				class="h-12 w-12 rounded-2xl border border-gray-200 object-cover"
			/>
			<div class="text-left leading-tight">
				<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">AI leadership in action</p>
				<p class="text-sm font-semibold text-gray-900">Bill Raymond</p>
			</div>
		</div>

		<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
			Book time with Bill
		</h1>
		<p class="mt-4 text-lg text-gray-600">
			Paid consults are the fastest path to a clear answer. If you just want to say hello, a free chat is
			available too.
		</p>
	</div>
</section>

<section class="mb-14">
	<div class="mx-auto max-w-4xl">
		<div class="grid gap-5 md:grid-cols-3">
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
						<p class="mt-3 text-xs font-semibold text-blue-700">
							Recommended starting point
						</p>
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
	<div class="mx-auto max-w-4xl">
		<div class="rounded-2xl border border-gray-200 bg-gray-50 p-6">
			<h2 class="text-xl font-bold text-gray-900">Other ways to connect</h2>
			<ul class="mt-3 space-y-2 text-sm text-gray-700">
				<li>
					<a href="/contact" class="font-semibold text-blue-700 underline underline-offset-4">
						Contact form
					</a>
					<span class="text-gray-600"> — training, advisory work, or general questions</span>
				</li>
				<li>
					<a
						href="https://billtalksai.com/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-semibold text-blue-700 underline underline-offset-4"
					>
						Bill Talks AI newsletter
					</a>
					<span class="text-gray-600"> — weekly insights and announcements</span>
				</li>
				<li>
					<a
						href="https://agileinaction.com/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-semibold text-blue-700 underline underline-offset-4"
					>
						Agile in Action podcast
					</a>
					<span class="text-gray-600"> — leadership conversations and modern work</span>
				</li>
				<li>
					<a
						href="https://www.linkedin.com/in/williamraymond/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-semibold text-blue-700 underline underline-offset-4"
					>
						Bill on LinkedIn
					</a>
					<span class="text-gray-600"> — updates and announcements</span>
				</li>
			</ul>
		</div>
	</div>
</section>
