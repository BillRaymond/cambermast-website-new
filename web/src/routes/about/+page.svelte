<script>
	const partners = [
		{
			name: 'Jennifer Hufnagel',
			role: 'AI and Change Leadership',
			description:
				'Leads enterprise adoption programs and change management initiatives that ensure AI investments stick.',
			link: 'https://www.linkedin.com/in/jhufnagel/'
		},
		{
			name: 'Scott Abel',
			role: 'The Content Wrangler',
			description:
				'Advises on intelligent content strategies and enterprise documentation workflows built for AI.',
			link: 'https://thecontentwrangler.com/'
		}
	];

	const clients = [
		'Adobe',
		'Microsoft',
		'State Street',
		'PMO Strategies',
		'Community Brands',
		'ProjectHosts'
	];
</script>

<h1 class="mb-6 text-3xl font-bold">About Cambermast</h1>
<p class="mb-10 max-w-3xl text-gray-700">
	Cambermast helps organizations adopt AI with confidence. We pair hands-on experimentation with practical
	governance so teams learn quickly, prove value, and scale responsibly.
</p>

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
				<p class="text-sm text-gray-500">Founder &amp; Principal Consultant</p>
			</div>
		</div>
		<p class="text-gray-700">
			Bill has led digital transformation initiatives for enterprise PMOs, product teams, and content
			organizations for over two decades. He blends pragmatic AI experimentation with executive coaching so
			teams adopt new capabilities without losing momentum.
		</p>
		<ul class="list-disc space-y-2 pl-5 text-gray-700">
			<li>Host of the Bill Talks AI newsletter and Agile in Action podcast</li>
			<li>Author and speaker on AI leadership, automation, and project delivery</li>
			<li>Regular collaborator with content and operations leaders building AI roadmaps</li>
		</ul>
	</article>

	<article class="rounded-2xl border bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold">Cambermast at a Glance</h2>
		<p class="mt-3 text-gray-700">
			We guide teams from pilot to production with lightweight governance, structured build labs, and
			lasting knowledge transfer.
		</p>
		<ul class="mt-4 list-disc space-y-2 pl-5 text-gray-700">
			<li>AI training programs tailored to your workflows</li>
			<li>Advisory sprints that surface quick wins and guardrails</li>
			<li>Automation engagements that blend human oversight with AI speed</li>
		</ul>
		<p class="mt-4 text-gray-700">
			Our clients tell us they value clear communication, honest assessments, and experiencing AI in action
			during every engagement.
		</p>
	</article>
</section>

<section class="mb-12 rounded-2xl border bg-gray-50 p-6">
	<h3 class="text-lg font-semibold">Trusted Partners</h3>
	<p class="mt-2 max-w-3xl text-gray-700">
		We assemble specialized teams so each project gets the right mix of strategy, change leadership, and
		implementation expertise.
	</p>
	<div class="mt-6 grid gap-5 md:grid-cols-2">
		{#each partners as partner}
			<article class="flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm">
				<div>
					<h4 class="text-lg font-semibold">{partner.name}</h4>
					<p class="text-sm text-gray-500">{partner.role}</p>
					<p class="mt-2 text-gray-700">{partner.description}</p>
				</div>
				{#if partner.link}
					<a
						href={partner.link}
						target="_blank"
						rel="noopener"
						class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
					>
						Learn more&nbsp;&rarr;
					</a>
				{/if}
			</article>
		{/each}
	</div>
</section>

<section class="rounded-2xl border bg-white p-6 shadow-sm">
	<h3 class="text-lg font-semibold">Trusted by Teams Delivering Complex Work</h3>
	<p class="mt-2 max-w-3xl text-gray-700">
		From global enterprises to specialized agencies, we help teams weave AI into daily operations while
		protecting quality and compliance.
	</p>
	<div class="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
		{#each clients as client}
			<div class="flex h-24 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-center text-base font-semibold text-blue-700 shadow-sm">
				{client}
			</div>
		{/each}
	</div>
</section>
