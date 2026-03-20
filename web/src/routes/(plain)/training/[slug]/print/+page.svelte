<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import { buildTrainingBrochureModel } from '$lib/data/training/brochure';
	import { listTestimonialsForSlug, type Testimonial } from '$lib/data/testimonials';
	import type { TrainingBrochureModel } from '$lib/data/training/brochure';
	import type { PageData } from './$types';

	export let data: PageData;

	const brochure = buildTrainingBrochureModel(data.program);
	const ABOUT_CAMBERMAST = {
		title: 'Cambermast at a Glance',
		image: '/images/cambermast-logo-small-square-white.png',
		imageAlt: 'Cambermast logo',
		summary:
			'We guide teams from pilot to production with lightweight governance, structured build labs, and lasting knowledge transfer.',
		bullets: [
			'AI training programs tailored to your workflows',
			'Advisory sprints that surface quick wins and guardrails',
			'Automation engagements that blend human oversight with AI speed'
		],
		outro:
			'Our clients tell us they value clear communication, honest assessments, and experiencing AI in action during every engagement.'
	};
	const PARTNER_PROFILES = [
		{
			keywords: ['the content wrangler', 'scott abel'],
			name: 'Scott Abel',
			role: 'The Content Wrangler',
			description:
				'Scott Abel, known as The Content Wrangler, is a content strategy evangelist and CEO who helps organizations improve customer experiences through modern content practices, education, and advocacy.',
			link: 'https://www.thecontentwrangler.com',
			image: '/images/the-content-wrangler.jpeg',
			imageAlt: 'The Content Wrangler logo',
			imageFit: 'contain' as const
		},
		{
			keywords: ['techlab'],
			name: 'TechLAB Innovation Center LLC',
			role: 'Technology Entrepreneurship Growth Partner',
			description:
				'TechLAB Innovation Center mission is to help early and mid-stage technology entrepreneurs with a developed product/service, scale up business operations to achieve sustainable growth.',
			bullets: [
				'A technology-driven environment focused on achieving results',
				'A strong network of mentors',
				'Access to a leading ecosystem in the investment community',
				'Extensive industry expertise for partnerships, investment, and acquisitions'
			],
			descriptionOutro:
				'We welcome entrepreneurs, local, national and international, to base and cultivate their operations at TechLAB Innovation Center!',
			link: 'https://techlabcenter.com',
			image: '/images/TechLAB-Innovation-Center.png',
			imageAlt: 'TechLAB Innovation Center logo',
			imageFit: 'contain' as const
		},
		{
			keywords: ['jennifer hufnagel', 'hufnagel consulting'],
			name: 'Jennifer Hufnagel',
			role: 'AI Educator and Change Leadership',
			description:
				'Jennifer Hufnagel is an AI educator and consultant with over 20 years of experience helping organizations transform through training, digital innovation, and community-driven leadership.',
			link: 'https://www.linkedin.com/in/jennifer-hufnagel/',
			image: '/images/jennifer-hufnagel-headshot.jpg',
			imageAlt: 'Jennifer Hufnagel headshot',
			imageFit: 'cover' as const
		},
		{
			keywords: ['project hosts'],
			name: 'Project Hosts',
			role: 'Secure Cloud Hosting for Microsoft Project Server',
			description:
				'Project Hosts delivers FedRAMP, DoD IL, and HITRUST compliant environments so organizations can keep Microsoft Project Server online while Microsoft winds down native support. They partner with Cambermast to migrate, host, and support regulated PMO workloads.',
			link: 'https://projecthosts.com',
			image: '/images/project-hosts-logo.png',
			imageAlt: 'Project Hosts logo',
			imageFit: 'contain' as const
		}
	];
	const buildAgendaChunks = (
		agenda: TrainingBrochureModel['agenda']
	): TrainingBrochureModel['agenda'][] => {
		if (agenda.length <= 6) return [agenda];

		const maxCardsPerPage = 6;
		const pageCount = Math.ceil(agenda.length / maxCardsPerPage);
		const baseSize = Math.floor(agenda.length / pageCount);
		const remainder = agenda.length % pageCount;
		const chunks: TrainingBrochureModel['agenda'][] = [];
		let startIndex = 0;

		for (let index = 0; index < pageCount; index += 1) {
			const chunkSize = baseSize + (index < remainder ? 1 : 0);
			chunks.push(agenda.slice(startIndex, startIndex + chunkSize));
			startIndex += chunkSize;
		}

		return chunks;
	};
	const formatTestimonialRole = (testimonial: Testimonial): string =>
		testimonial.jobTitle && testimonial.company
			? `${testimonial.jobTitle}, ${testimonial.company}`
			: testimonial.jobTitle ?? testimonial.company ?? '';
	const sortTestimonialsForPrint = (left: Testimonial, right: Testimonial): number => {
		const photoDelta = Number(Boolean(right.photoUrl)) - Number(Boolean(left.photoUrl));
		if (photoDelta !== 0) return photoDelta;

		return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
	};
	const truncateQuote = (quote: string, maxLength = 120): string => {
		const normalized = quote.trim();
		if (normalized.length <= maxLength) return normalized;

		const shortened = normalized.slice(0, maxLength);
		const boundary = Math.max(shortened.lastIndexOf('. '), shortened.lastIndexOf(' '));
		const trimmed = boundary > maxLength * 0.6 ? shortened.slice(0, boundary) : shortened;
		return `${trimmed.trim()}...`;
	};
	const resolvePartnerProfile = (candidateText: string | undefined) => {
		if (!candidateText) return undefined;

		const normalized = candidateText.toLowerCase();
		return PARTNER_PROFILES.find((profile) =>
			profile.keywords.some((keyword) => normalized.includes(keyword))
		);
	};
	const seoTitle = `${brochure.title} Brochure | Cambermast`;
	const seoDescription = brochure.tagline;
	const pagePath = brochure.printUrl;
	const copyrightYear = new Date().getFullYear();
	const agendaChunks = buildAgendaChunks(brochure.agenda);
	const selectedTestimonials = listTestimonialsForSlug(brochure.slug)
		.filter((testimonial) => testimonial.allowPublicUse !== false)
		.sort(sortTestimonialsForPrint)
		.slice(0, 2)
		.map((testimonial) => ({
			...testimonial,
			formattedRole: formatTestimonialRole(testimonial),
			shortQuote: truncateQuote(testimonial.quote)
		}));
	const partnerProfile = resolvePartnerProfile(
		brochure.stats.partner ??
			data.program.presentation?.partnershipLabel ??
			data.program.sessions?.find((session) => session.partner)?.partner
	);
	const defaultOrigin = SITE_ORIGIN.replace(/\/$/, '');
	let brochureOrigin = defaultOrigin;
	let brochureAbsoluteUrl = `${defaultOrigin}${brochure.route}`;

	$: brochureOrigin = browser ? $page.url.origin.replace(/\/$/, '') : defaultOrigin;
	$: brochureAbsoluteUrl = `${brochureOrigin}${brochure.route}`;
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	path={pagePath}
	image={brochure.heroImage}
	imageAlt={brochure.heroImageAlt}
	type="article"
/>

<svelte:head>
	<meta name="robots" content="noindex,follow" />
	<style>
		.brochure-list {
			list-style: none;
			padding-left: 0;
		}

		.brochure-list li {
			position: relative;
			padding-left: 1.1rem;
		}

		.brochure-list li::before {
			content: '•';
			position: absolute;
			left: 0;
			top: 0;
			color: currentColor;
			font-weight: 700;
		}

		body {
			background:
				radial-gradient(circle at top, rgba(191, 219, 254, 0.3), transparent 40%),
				linear-gradient(180deg, #eff6ff 0%, #ffffff 26%);
			color: #111827;
		}

		@media print {
			.brochure-main {
				display: block !important;
			}

			.brochure-main > * + * {
				margin-top: 1rem;
			}

			.brochure-main {
				padding-top: 0 !important;
				padding-bottom: 0 !important;
			}

			body {
				background: #fff;
			}

			a {
				color: inherit;
				text-decoration: none;
			}

			.brochure-cover {
				break-inside: avoid;
			}

			.brochure-card {
				break-inside: avoid;
				box-shadow: none;
				padding: 1.25rem !important;
			}

			.brochure-hero-heading {
				gap: 1rem !important;
			}

			.brochure-cover-title {
				font-size: 2rem !important;
				line-height: 1.1 !important;
			}

			.brochure-cover-tagline {
				font-size: 1.125rem !important;
				line-height: 1.5 !important;
			}

			.brochure-grid-section {
				display: block !important;
			}

			.brochure-grid-section > * + * {
				margin-top: 1.25rem;
			}

			.brochure-agenda {
				break-inside: avoid;
			}

			.brochure-agenda-grid {
				display: grid !important;
				grid-template-columns: repeat(2, minmax(0, 1fr));
				align-items: start;
			}

			.brochure-agenda-card-title {
				font-size: 0.9rem !important;
				line-height: 1.2 !important;
			}

			.print-page-break-after {
				display: block;
				break-after: page;
				page-break-after: always;
			}

			.brochure-agenda-heading {
				break-after: avoid-page;
				page-break-after: avoid;
			}

			.brochure-sidebar > * + * {
				margin-top: 1.25rem;
			}

			.brochure-list {
				font-size: 0.88rem !important;
				line-height: 1.35 !important;
			}

			.brochure-list li {
				padding-left: 1rem;
			}

			.brochure-list li + li {
				margin-top: 0.45rem !important;
			}

			.brochure-copy {
				font-size: 0.88rem !important;
				line-height: 1.35 !important;
			}

			.brochure-inline-footer {
				display: none !important;
			}
		}
	</style>
</svelte:head>

<main class="brochure-main mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 text-gray-900 print:max-w-none print:px-0">
	<section class="brochure-cover px-2 print:px-0">
		<div class="grid gap-8 md:grid-cols-[1.5fr_0.9fr]">
			<div class="space-y-6">
				<div class="brochure-hero-heading grid gap-6 print:grid-cols-[10rem_1fr] print:items-start md:grid-cols-[11rem_1fr] md:items-start">
				{#if brochure.heroImage}
					<div class="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-blue-50 shadow-sm print:w-40">
						<img
							src={brochure.heroImage}
							alt={brochure.heroImageAlt}
							class="aspect-square h-full w-full object-cover"
						/>
					</div>
				{/if}

					<div>
						<p class="text-sm font-semibold tracking-[0.22em] text-blue-700 uppercase">
							Cambermast Training Brochure
						</p>
						<h1 class="brochure-cover-title mt-3 text-4xl font-bold tracking-tight text-gray-950">{brochure.title}</h1>
						{#if brochure.nickname}
							<p class="mt-2 text-base font-medium text-blue-700">{brochure.nickname}</p>
						{/if}
						{#if brochure.partnershipLabel}
							<p class="mt-2 text-xs font-semibold tracking-wide text-amber-700 uppercase">
								{brochure.partnershipLabel}
							</p>
						{/if}
					</div>
				</div>

				<div class="brochure-copy space-y-4 text-base leading-relaxed text-gray-700">
					<p class="brochure-cover-tagline max-w-3xl text-xl leading-relaxed text-gray-700">{brochure.tagline}</p>
					<p>{brochure.summary}</p>
					{#if brochure.secondarySummary}
						<p>{brochure.secondarySummary}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-4">
				<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
					{#if brochure.stats.duration}
						<div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
							<p class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Duration</p>
							<p class="mt-1 text-sm font-medium text-gray-900">{brochure.stats.duration}</p>
						</div>
					{/if}
					{#if brochure.stats.format.length}
						<div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
							<p class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Format</p>
							<p class="mt-2 text-sm font-medium text-gray-900">
								{brochure.stats.format.join(' • ')}
							</p>
						</div>
					{/if}
					{#if brochure.stats.cost}
						<div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
							<p class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Cost</p>
							<p class="mt-1 text-sm font-medium text-gray-900">{brochure.stats.cost}</p>
						</div>
					{/if}
					{#if brochure.stats.certificate}
						<div class="rounded-2xl border border-blue-100 bg-blue-50 p-4">
							<p class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Certificate</p>
							<p class="mt-1 text-sm font-medium text-gray-900">{brochure.stats.certificate}</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	{#if brochure.outcomes.length}
		<section class="px-2 print:px-0">
			<div class="brochure-card rounded-[1.75rem] border border-blue-100 bg-blue-50 p-6 shadow-sm break-inside-avoid">
				<h2 class="text-2xl font-semibold text-gray-950">Outcomes</h2>
				<ul class="brochure-list mt-4 space-y-3 text-gray-800">
					{#each brochure.outcomes as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	{#if brochure.audience.length}
		<section class="px-2 print:px-0">
			<div class="brochure-card rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm break-inside-avoid">
				<h2 class="text-2xl font-semibold text-gray-950">Who this is for</h2>
				<ul class="brochure-list mt-4 space-y-3 text-gray-700">
					{#each brochure.audience as item}
						<li>{item}</li>
					{/each}
				</ul>
				{#if brochure.audienceExamples.length}
					<h3 class="mt-6 text-lg font-semibold text-gray-950">Examples</h3>
					<ul class="brochure-list mt-3 space-y-3 text-gray-700">
						{#each brochure.audienceExamples as item}
							<li>{item}</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>
	{/if}

	{#if brochure.trainer}
		<section class={`px-2 print:px-0 ${brochure.agenda.length ? 'print-page-break-after' : ''}`}>
			<div class="brochure-card rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-sm break-inside-avoid">
				<p class="text-sm font-semibold tracking-wide text-blue-700 uppercase">
					{brochure.trainer.title}
				</p>
				<div class="mt-4 flex items-start gap-4">
					{#if brochure.trainer.photo}
						<img
							src={brochure.trainer.photo}
							alt={brochure.trainer.photoAlt}
							class="h-20 w-20 rounded-2xl object-cover"
						/>
					{/if}
					<div>
						<h2 class="text-2xl font-semibold text-gray-950">{brochure.trainer.name}</h2>
						<p class="text-sm font-medium text-blue-700">{brochure.trainer.role}</p>
					</div>
				</div>
				<p class="brochure-copy mt-5 text-sm leading-relaxed text-gray-700">{brochure.trainer.summary}</p>
				{#if brochure.trainer.highlights.length}
					<div class="mt-5">
						<ul class="brochure-list space-y-2 text-sm text-gray-700">
						{#each brochure.trainer.highlights as item}
							<li>{item}</li>
						{/each}
						</ul>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<section class="brochure-grid-section grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
		{#if brochure.agenda.length}
			{#each agendaChunks as agendaChunk, chunkIndex}
				<div class={`brochure-agenda px-2 print:px-0 ${chunkIndex < agendaChunks.length - 1 ? 'print-page-break-after' : ''}`}>
					<h2 class="brochure-agenda-heading text-2xl font-semibold text-gray-950">
						{chunkIndex === 0 ? 'Agenda highlights' : 'Agenda highlights continued'}
					</h2>
					<div class="brochure-agenda-grid mt-5 grid gap-4">
						{#each agendaChunk as block}
							<article class="brochure-card rounded-2xl border border-gray-100 bg-gray-50 p-4 break-inside-avoid">
								<h3 class="brochure-agenda-card-title text-base font-semibold leading-tight text-gray-950">{block.title}</h3>
								<ul class="brochure-list mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
									{#each block.details as detail}
										<li>{detail}</li>
									{/each}
								</ul>
							</article>
						{/each}
					</div>
				</div>
			{/each}
		{/if}

		<div class="brochure-sidebar space-y-6">
			{#if brochure.takeaways.length}
				<section class="brochure-card rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm break-inside-avoid">
					<h2 class="text-2xl font-semibold text-gray-950">What you'll leave with</h2>
					<ul class="brochure-list mt-4 space-y-3 text-gray-700">
						{#each brochure.takeaways as item}
							<li>{item}</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if brochure.stats.environment || brochure.stats.partner}
				<section class="brochure-card rounded-[1.75rem] border border-amber-100 bg-amber-50 p-6 shadow-sm break-inside-avoid">
					<h2 class="text-2xl font-semibold text-gray-950">Why teams choose this program</h2>
					<div class="brochure-copy mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
						{#if brochure.stats.environment}
							<p>{brochure.stats.environment}</p>
						{/if}
						{#if brochure.stats.partner}
							<p>{brochure.stats.partner}</p>
						{/if}
					</div>
					{#if selectedTestimonials.length}
						<div class="mt-5 grid gap-3 print:grid-cols-2">
							{#each selectedTestimonials as testimonial}
								<article class="rounded-2xl border border-amber-200/70 bg-white/85 p-3">
									<div class="flex items-start gap-3">
										{#if testimonial.photoUrl}
											<img
												src={testimonial.photoUrl}
												alt={testimonial.displayName}
												class="h-10 w-10 rounded-xl border border-gray-200 object-cover"
											/>
										{/if}
										<div class="min-w-0">
											<p class="text-sm font-semibold leading-tight text-gray-950">{testimonial.displayName}</p>
											{#if testimonial.formattedRole}
												<p class="text-[11px] leading-tight text-gray-500">{testimonial.formattedRole}</p>
											{/if}
										</div>
									</div>
									<blockquote class="mt-2 text-sm leading-relaxed text-gray-700">
										“{testimonial.shortQuote}”
									</blockquote>
								</article>
							{/each}
						</div>
					{/if}
				</section>
			{/if}

			<div class={`grid gap-4 ${partnerProfile ? 'print:grid-cols-2' : ''}`}>
				<section class="brochure-card rounded-[1.75rem] border bg-white p-5 shadow-sm break-inside-avoid">
					<div class="flex items-center gap-3">
						<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow">
							<img
								src={ABOUT_CAMBERMAST.image}
								alt={ABOUT_CAMBERMAST.imageAlt}
								class="h-10 w-10 object-contain"
							/>
						</div>
						<h2 class="text-xl font-semibold text-gray-950">{ABOUT_CAMBERMAST.title}</h2>
					</div>
					<p class="brochure-copy mt-3 text-sm leading-relaxed text-gray-700">
						{ABOUT_CAMBERMAST.summary}
					</p>
					<ul class="brochure-list mt-3 space-y-2 text-sm text-gray-700">
						{#each ABOUT_CAMBERMAST.bullets as bullet}
							<li>{bullet}</li>
						{/each}
					</ul>
					<p class="brochure-copy mt-3 text-sm leading-relaxed text-gray-700">
						{ABOUT_CAMBERMAST.outro}
					</p>
				</section>

				{#if partnerProfile}
					<section class="brochure-card rounded-[1.75rem] border bg-white p-5 shadow-sm break-inside-avoid">
						<div class="flex items-center gap-3">
							{#if partnerProfile.image}
								<img
									src={partnerProfile.image}
									alt={partnerProfile.imageAlt}
									class="h-14 w-14 rounded-2xl border border-gray-200 bg-white shadow"
									class:object-cover={partnerProfile.imageFit !== 'contain'}
									class:object-contain={partnerProfile.imageFit === 'contain'}
								/>
							{/if}
							<div>
								<h2 class="text-lg font-semibold leading-tight text-gray-950">{partnerProfile.name}</h2>
								<p class="text-sm text-gray-500">{partnerProfile.role}</p>
							</div>
						</div>
						<div class="brochure-copy mt-3 space-y-3 text-sm leading-relaxed text-gray-700">
							<p>{partnerProfile.description}</p>
							{#if partnerProfile.bullets?.length}
								<ul class="brochure-list space-y-2">
									{#each partnerProfile.bullets as bullet}
										<li>{bullet}</li>
									{/each}
								</ul>
							{/if}
							{#if partnerProfile.descriptionOutro}
								<p>{partnerProfile.descriptionOutro}</p>
							{/if}
						</div>
					</section>
				{/if}
			</div>
		</div>
	</section>

	<footer class="brochure-inline-footer flex flex-col gap-2 border-t border-gray-200 pt-4 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
		<p>Cambermast LLC · AI Agility in Action · {copyrightYear}</p>
		<p>
			<a href={brochureAbsoluteUrl} class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4">
				{brochureAbsoluteUrl}
			</a>
		</p>
	</footer>
</main>
