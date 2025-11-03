<script lang="ts">
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';

	const partners = [
		{
			name: 'Jennifer Hufnagel',
			role: 'AI Educator and Change Leadership',
			description:
				'Jennifer Hufnagel is an AI educator and consultant with over 20 years of experience helping organizations transform through training, digital innovation, and community-driven leadership.',
			link: 'https://www.linkedin.com/in/jennifer-hufnagel/',
			image: '/images/jennifer-hufnagel-headshot.jpg',
			imageAlt: 'Jennifer Hufnagel headshot',
			imageFit: 'cover'
		},
		{
			name: 'Scott Abel',
			role: 'The Content Wrangler',
			description:
				'Scott Abel, known as The Content Wrangler, is a content strategy evangelist and CEO who helps organizations improve customer experiences through modern content practices, education, and advocacy.',
			link: 'https://www.thecontentwrangler.com',
			image: '/images/the-content-wrangler.jpeg',
			imageAlt: 'The Content Wrangler logo',
			imageFit: 'contain'
		}
	];

	const clients = [
		'Duke Energy',
		'Microsoft',
		'Red Hat',
		'Moen',
		'Office Depot',
		'Blue Cross Blue Shield'
	];

	const pageMeta = getSeo('/about');
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/about" />

<h1 class="mb-6 text-3xl font-bold">About Cambermast</h1>
<p class="mb-6 max-w-3xl text-gray-700">
	Cambermast helps organizations adopt AI with confidence. We pair hands-on experimentation with
	practical governance so teams learn quickly, prove value, and scale responsibly.
</p>

<div class="mb-10 flex flex-wrap justify-center gap-3">
	<a
		href="/contact"
		class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
	>
		🎓 Book training for your team
	</a>
	<a
		href="https://cal.com/billraymond/15min"
		target="_blank"
		rel="noopener"
		class="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-gray-800"
	>
		📅 Schedule a call with Bill
	</a>
	<a
		href="https://cal.com/billraymond/30minconsult"
		target="_blank"
		rel="noopener"
		class="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-2.5 font-semibold text-blue-700 shadow transition hover:border-blue-300 hover:bg-blue-50"
	>
		🕒 US $100
	</a>
	<a
		href="https://cal.com/billraymond/60minconsult"
		target="_blank"
		rel="noopener"
		class="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-2.5 font-semibold text-blue-700 shadow transition hover:border-blue-300 hover:bg-blue-50"
	>
		🕘 US $200
	</a>
</div>

<section class="mb-12 grid gap-6 md:grid-cols-2">
	<article class="flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm">
		<div class="flex items-center gap-4">
			<img
				src="/images/bill.jpg"
				alt="Bill Raymond"
				class="h-20 w-20 rounded-2xl border border-gray-200 object-cover shadow"
			/>
			<div>
				<h2 class="text-xl font-semibold">Bill Raymond</h2>
				<p class="text-sm text-gray-500">CEO, AI Trainer, and AI Advisor</p>
			</div>
		</div>
		<p class="text-gray-700">
			Bill helps organizations understand and apply AI in practical ways, from accelerating training
			programs to streamlining operations and rethinking collaboration. He has led large-scale
			transformation projects with Microsoft, Duke Energy, Moen, Office Depot, and ExxonMobil,
			always focusing on clarity, collaboration, and measurable business results.
		</p>
		<ul class="list-disc space-y-2 pl-5 text-gray-700">
			<li>Certified FutureLab AI Mastermind Trainer</li>
			<li>Founding member of The GenAI Collective</li>
			<li>
				Author of the
				<a
					href="https://billtalksai.com/"
					target="_blank"
					rel="noopener"
					class="text-blue-600 underline"
				>
					Bill Talks AI
				</a>
				newsletter
			</li>
			<li>
				Host of the
				<a
					href="https://agileinaction.com/"
					target="_blank"
					rel="noopener"
					class="text-blue-600 underline"
				>
					Agile in Action
				</a>
				podcast
			</li>
			<li>Keynote speaker on current future advances in AI</li>
		</ul>
	</article>

	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<div class="flex items-center gap-4">
			<div
				class="flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow"
			>
				<img
					src="/images/cambermast-logo-small-square-white.png"
					alt="Cambermast logo"
					class="h-16 w-16 object-contain"
				/>
			</div>
			<h2 class="text-xl font-semibold">Cambermast at a Glance</h2>
		</div>
		<p class="mt-3 text-gray-700">
			We guide teams from pilot to production with lightweight governance, structured build labs,
			and lasting knowledge transfer.
		</p>
		<ul class="mt-4 list-disc space-y-2 pl-5 text-gray-700">
			<li>AI training programs tailored to your workflows</li>
			<li>Advisory sprints that surface quick wins and guardrails</li>
			<li>Automation engagements that blend human oversight with AI speed</li>
		</ul>
		<p class="mt-4 text-gray-700">
			Our clients tell us they value clear communication, honest assessments, and experiencing AI in
			action during every engagement.
		</p>
	</article>
</section>

<section class="mb-12 rounded-2xl border bg-gray-50 p-6">
	<h3 class="text-lg font-semibold">Trusted Partners</h3>
	<p class="mt-2 max-w-3xl text-gray-700">
		We assemble specialized teams so each project gets the right mix of strategy, change leadership,
		and implementation expertise.
	</p>
	<div class="mt-6 grid gap-5 md:grid-cols-2">
		{#each partners as partner}
			<article class="flex h-full flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm">
				<div class="flex items-center gap-4">
					{#if partner.image}
						<img
							src={partner.image}
							alt={partner.imageAlt}
							class="h-20 w-20 rounded-2xl border border-gray-200 bg-white shadow"
							class:object-cover={partner.imageFit !== 'contain'}
							class:object-contain={partner.imageFit === 'contain'}
						/>
					{/if}
					<div>
						<h4 class="text-lg font-semibold">{partner.name}</h4>
						<p class="text-sm text-gray-500">{partner.role}</p>
					</div>
				</div>
				<p class="text-gray-700">{partner.description}</p>
				{#if partner.link}
					<a
						href={partner.link}
						target="_blank"
						rel="noopener"
						class="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
					>
						Learn more&nbsp;&rarr;
					</a>
				{/if}
			</article>
		{/each}
	</div>
</section>

<section class="rounded-2xl border bg-white p-6 shadow-sm">
	<h3 class="text-lg font-semibold">Trusted by global teams delivering complex work</h3>
	<p class="mt-2 max-w-3xl text-gray-700">
		From midsize to enterprise, we help teams weave AI into daily operations while protecting
		quality and compliance.
	</p>
	<div class="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
		{#each clients as client}
			<div
				class="flex h-24 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-center text-base font-semibold text-blue-700 shadow-sm"
			>
				{client}
			</div>
		{/each}
	</div>
</section>
