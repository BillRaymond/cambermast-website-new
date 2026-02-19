<script lang="ts">
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';

	type Fact = {
		title: string;
		detail: string;
		source: { label: string; href: string };
		secondarySource?: { label: string; href: string };
	};

	type CredibilitySignal = {
		name: string;
		logo: string;
		alt: string;
		headline: string;
		detail: string;
		source?: { label: string; href: string };
	};

	const pageMeta = getSeo('/services/microsoft-project-server');

	const facts: Fact[] = [
		{
			title: 'Project Server 2019 support stops on July 14, 2026',
			detail:
				"Microsoft released Project Server 2019 on October 22, 2018 and already ended mainstream support on January 9, 2024. Extended support ends July 14, 2026, which is the last day you'll receive security updates or fixes.",
			source: {
				label: 'Microsoft Lifecycle: Project Server 2019',
				href: 'https://learn.microsoft.com/en-us/lifecycle/products/project-server-2019'
			}
		},
		{
			title: 'Older installs are already out of runway',
			detail:
				'Project Server 2016 left mainstream support on July 13, 2021 and also reaches end-of-support on July 14, 2026. Project Server 2013 fell out of extended support back on April 11, 2023, so remaining environments are running completely unsupported today.',
			source: {
				label: 'Microsoft Lifecycle: Project Server 2016',
				href: 'https://learn.microsoft.com/en-us/lifecycle/products/project-server-2016'
			},
			secondarySource: {
				label: 'Microsoft Lifecycle: Project Server 2013',
				href: 'https://learn.microsoft.com/en-us/lifecycle/products/project-server-2013'
			}
		},
		{
			title: 'Microsoft is pointing customers to migration guidance',
			detail:
				"The official lifecycle pages now link directly to Microsoft's migration guidance for Project Server and Project Online, underscoring that the on-prem product is being retired in favor of modern cloud services.",
			source: {
				label: 'Microsoft Migration Guidance',
				href: 'https://learn.microsoft.com/en-us/project/planning-project-server-and-project-online-for-business-decision-makers?source=recommendations'
			}
		}
	];

	const readinessChecklist = [
		'Document customizations, integrations, and data retention requirements so nothing critical is lost during migration.',
		'Plan the transition into Project Hosts’ secure environment, including networking, identity, and compliance requirements.',
		"Design an interim support plan so key projects keep running while Microsoft winds down Project Server's security patches.",
		'Brief executives and PMO leads on timelines, licensing changes, and the business risks of waiting beyond July 2026.'
	];

	const projectHostsHighlights = [
		'Secure, compliant cloud environments with FedRAMP, DoD IL, and HITRUST expertise, per the Project Hosts team.',
		'Mature runbooks for hosting Microsoft Project Server, SharePoint, and adjacent workloads when customers cannot move everything to Microsoft 365 overnight.',
		'Short onboarding cycles so migrations have a safe landing zone before extended support ends.'
	];

	const processSteps = [
		{
			title: 'Assess & stabilize',
			detail:
				'Bill Raymond literally wrote the book on Microsoft Project Server. We audit your farms, custom code, SSRS reports, and governance model so nothing critical is overlooked.'
		},
		{
			title: 'Migrate & modernize',
			detail:
				'We partner with Project Hosts to stand up their hosted environment, migrate Project Server safely, and create API bridges to Microsoft 365, Power Platform, or other systems you rely on.'
		},
		{
			title: 'Support & train',
			detail:
				"You'll get updated documentation, admin training, and optional AI workshops so PMO teams thrive inside the new hosted environment while planning long-term modernization on your schedule."
		}
	];

	const partnerLogos = [
		{
			name: 'Cambermast',
			src: '/images/cambermast-logo-full.png',
			alt: 'Cambermast logo'
		},
		{
			name: 'Project Hosts',
			src: '/images/project-hosts-logo.png',
			alt: 'Project Hosts logo'
		},
		{
			name: 'Microsoft Project Server',
			src: '/images/microsoft-project-server-logo.svg',
			alt: 'Microsoft Project Server logo'
		}
	];

	const credibilitySignals: CredibilitySignal[] = [
		{
			name: 'Project Hosts',
			logo: '/images/project-hosts-logo.png',
			alt: 'Project Hosts logo',
			headline: 'Microsoft Cloud Solution Provider',
			detail:
				'Project Hosts is a long-standing Microsoft Cloud Solution Provider (CSP) delivering secure Microsoft Azure environments that meet FedRAMP, DoD IL, GovRAMP, and HITRUST requirements for teams that cannot move overnight.',
			source: {
				label: 'Project Hosts + Microsoft Azure',
				href: 'https://projecthosts.com/partners/microsoft-azure/'
			}
		},
		{
			name: 'Microsoft + Project Hosts',
			logo: '/images/microsoft-project-server-logo.svg',
			alt: 'Microsoft Project Server logo',
			headline: 'Joint Early Start program',
			detail:
				'Microsoft and Project Hosts teamed up on the Early Start program to give ISVs and PMOs a streamlined FedRAMP and DoD IL4/IL5 path—a motion we reuse when migrating Project Server workloads.',
			source: {
				label: 'Microsoft & Project Hosts Early Start',
				href: 'https://projecthosts.com/partners/microsoft-azure/'
			}
		},
		{
			name: 'Cambermast',
			logo: '/images/microsoft-mvp-logo.svg',
			alt: 'Microsoft MVP Program logo',
			headline: 'Microsoft Project MVP leadership',
			detail:
				'Bill Raymond spent more than 14 years as a Microsoft Project MVP and authored Implementing and Administering Microsoft Project Server, so every migration is guided by the person who literally wrote the book.',
			source: {
				label: 'Implementing and Administering Microsoft Project Server',
				href: 'https://www.amazon.com/Implementing-Administering-Microsoft-Project-Server-ebook/dp/B00D39FYVA/'
			}
		}
	];
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/services/microsoft-project-server"
/>

<article class="mx-auto max-w-5xl px-4 py-10">
	<section class="rounded-3xl border border-green-200 bg-white p-8 shadow-sm">
		<div class="flex flex-col gap-6 lg:flex-row lg:items-center">
			<div class="lg:w-7/12">
				<p class="text-sm font-semibold tracking-wide text-green-700 uppercase">
					Microsoft Project Server Migration Support
				</p>
				<h1 class="mt-2 text-4xl font-bold text-gray-900">
					Keep Microsoft Project Server running with hosted support
				</h1>
				<p class="mt-4 text-lg text-gray-700">
					Microsoft has set a July 14, 2026 end-of-support date for Project Server 2019 and older
					releases. Cambermast and <a
						href="https://projecthosts.com/"
						target="_blank"
						rel="noopener"
						class="font-semibold text-green-700 underline decoration-green-200 underline-offset-4"
					>
						Project Hosts
					</a>
					provide a path from Microsoft-operated infrastructure to a secure hosted platform so your teams
					can keep using Project Server with confidence.
				</p>
				<div class="mt-6 flex flex-wrap gap-3">
					<a
						href="/contact"
						class="inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-green-700"
					>
						Contact us with your migration goals
					</a>
				</div>
			</div>
			<div class="lg:w-5/12">
				<div class="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-900">
					<h2 class="text-base font-semibold tracking-wide uppercase">Timeline snapshot</h2>
					<ul class="mt-3 list-disc space-y-2 pl-5">
						<li>Project Server 2019: security updates end July 14, 2026.</li>
						<li>
							Project Server 2016: same July 14, 2026 cutoff, no mainstream support since 2021.
						</li>
						<li>Project Server 2013: unsupported since April 11, 2023.</li>
					</ul>
					<p class="mt-4 text-xs text-green-800">
						After those dates, Microsoft no longer issues patches, compliance fixes, or security
						responses.
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="mt-12 space-y-6">
		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<div class="flex flex-wrap items-center justify-center gap-6 md:gap-10">
				{#each partnerLogos as logo}
					<div
						class="flex w-full max-w-[220px] items-center justify-center rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 shadow-sm sm:w-auto"
					>
						<img src={logo.src} alt={logo.alt} loading="lazy" class="h-12 w-auto object-contain" />
					</div>
				{/each}
			</div>
		</div>
		<section class="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
			<p class="text-sm font-semibold tracking-wide text-green-700 uppercase">Execution signals</p>
			<h2 class="mt-2 text-2xl font-bold text-gray-900">
				How we lead Microsoft Project Server migrations
			</h2>
			<p class="mt-3 text-gray-700">
				Cambermast brings veteran Microsoft Project leadership, and Project Hosts brings
				Microsoft-backed hosting capabilities. Together we give PMOs auditable proof that their
				migration is anchored in the Microsoft ecosystem.
			</p>
			<div class="mt-6 grid gap-5 md:grid-cols-2">
				{#each credibilitySignals as signal}
					<article class="rounded-2xl border border-gray-200 bg-gray-50 p-5">
						<div class="flex items-center gap-4">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white"
							>
								<img
									src={signal.logo}
									alt={signal.alt}
									class="h-12 w-auto object-contain"
									loading="lazy"
								/>
							</div>
							<div>
								<p class="text-xs font-semibold tracking-wide text-green-700 uppercase">
									{signal.name}
								</p>
								<h3 class="text-lg font-semibold text-gray-900">{signal.headline}</h3>
							</div>
						</div>
						<p class="mt-3 text-gray-700">{signal.detail}</p>
						{#if signal.source}
							<a
								href={signal.source.href}
								target="_blank"
								rel="noopener"
								class="mt-4 inline-flex items-center text-sm font-semibold text-green-700 underline decoration-green-200 underline-offset-4"
							>
								{signal.source.label}
							</a>
						{/if}
					</article>
				{/each}
			</div>
		</section>
		<div>
			<h2 class="text-2xl font-bold text-gray-900">
				Facts about Microsoft's Project Server wind-down
			</h2>
			<p class="mt-3 text-gray-700">
				Microsoft's lifecycle data shows exactly when support ends. These are the dates your PMO and
				IT teams need to plan around.
			</p>
		</div>
		<div class="grid gap-5 md:grid-cols-2">
			{#each facts as fact}
				<article
					class="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
				>
					<h3 class="text-lg font-semibold text-gray-900">{fact.title}</h3>
					<p class="mt-3 flex-1 text-gray-700">{fact.detail}</p>
					<div class="mt-4 text-sm">
						<a
							href={fact.source.href}
							target="_blank"
							rel="noopener"
							class="font-semibold text-green-700 underline decoration-green-200 underline-offset-4"
						>
							{fact.source.label}
						</a>
						{#if fact.secondarySource}
							<span class="text-gray-500"> · </span>
							<a
								href={fact.secondarySource.href}
								target="_blank"
								rel="noopener"
								class="font-semibold text-green-700 underline decoration-green-200 underline-offset-4"
							>
								{fact.secondarySource.label}
							</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<section class="mt-12 rounded-3xl border border-gray-200 bg-gray-50 p-6">
		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<h2 class="text-2xl font-bold text-gray-900">Your migration checklist</h2>
				<p class="mt-3 text-gray-700">
					We turn a stressful deadline into a structured program plan. Use this checklist to gauge
					your readiness, and we'll help you fill the gaps.
				</p>
			</div>
			<ul class="list-disc space-y-3 pl-5 text-gray-700">
				{#each readinessChecklist as item}
					<li>{item}</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="mt-12 grid gap-6 lg:grid-cols-2">
		<article class="rounded-3xl border border-green-200 bg-white p-6 shadow-sm">
			<h2 class="text-2xl font-bold text-gray-900">Why Project Hosts?</h2>
			<p class="mt-3 text-gray-700">
				Project Hosts describes itself as delivering secure, compliant cloud environments with
				FedRAMP, DoD IL, and HITRUST expertise (<a
					href="https://projecthosts.com/"
					target="_blank"
					rel="noopener"
					class="font-semibold text-green-700 underline decoration-green-200 underline-offset-4"
				>
					projecthosts.com
				</a>). That makes them an ideal landing zone for regulated teams who still depend on Project
				Server.
			</p>
			<ul class="mt-4 list-disc space-y-2 pl-5 text-gray-700">
				{#each projectHostsHighlights as highlight}
					<li>{highlight}</li>
				{/each}
			</ul>
		</article>
		<article class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="text-2xl font-bold text-gray-900">What Cambermast delivers</h2>
			<ul class="mt-4 space-y-4 text-gray-700">
				{#each processSteps as step}
					<li class="rounded-2xl border border-gray-200 p-4">
						<h3 class="text-lg font-semibold text-gray-900">{step.title}</h3>
						<p class="mt-1">{step.detail}</p>
					</li>
				{/each}
			</ul>
		</article>
	</section>

	<section class="mt-12 rounded-3xl bg-green-600 p-8 text-white">
		<div class="grid gap-6 lg:grid-cols-2 lg:items-center">
			<div>
				<h2 class="text-3xl font-bold">Ready to secure Project Server on a hosted platform?</h2>
				<p class="mt-3 text-green-50">
					We'll review your current farm, recommend a migration path onto Project Hosts' secure
					infrastructure, and keep Project Server running with the integrations and governance you
					need.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<a
					href="/contact"
					class="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-5 py-2.5 font-semibold text-green-700 shadow transition hover:bg-green-50"
				>
					Schedule a migration call
				</a>
				<a
					href="https://projecthosts.com/contact-us/"
					target="_blank"
					rel="noopener"
					class="inline-flex flex-1 items-center justify-center rounded-xl border border-white px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
				>
					Visit Project Hosts
				</a>
			</div>
		</div>
	</section>
</article>
