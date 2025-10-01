<script lang="ts">
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import type { TrainingFaq, TrainingProgram } from '$lib/data/training/types';

	export let program: TrainingProgram;

	const getFaqAnswers = (faq: TrainingFaq): string[] =>
		faq.answers ?? (faq.answer ? [faq.answer] : []);
</script>

<main class="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-12 md:px-6">
	<section class="rounded-3xl bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm md:p-12">
		<div class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
			<div class="md:max-w-2xl">
				<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Training Program</p>
				{#if program.heroImage}
					<img
						src={program.heroImage}
						alt={program.heroImageAlt ?? program.title}
						class="mt-6 w-full rounded-2xl border border-blue-100 object-cover"
						loading="lazy"
					/>
				{/if}
				<h1 class="mt-2 text-4xl font-bold text-gray-900">{program.title}</h1>
				{#if program.nickname}
					<p class="mt-1 text-sm font-medium text-blue-600">{program.nickname}</p>
				{/if}
				<p class="mt-6 text-lg text-gray-700">{program.tagline}</p>
				<p class="mt-4 text-base text-gray-600">{program.description}</p>
				{#if program.secondaryDescription}
					<p class="mt-3 text-base text-gray-600">{program.secondaryDescription}</p>
				{/if}
				<div class="mt-8 flex flex-wrap gap-3">
					<a
						href={program.primaryCta.url}
						class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow transition hover:bg-blue-700"
					>
						{program.primaryCta.label}
					</a>
					<a
						href={program.secondaryCta.url}
						class="inline-flex items-center justify-center rounded-xl border border-blue-200 px-5 py-3 text-base font-semibold text-blue-700 transition hover:border-blue-500 hover:text-blue-900"
					>
						{program.secondaryCta.label}
					</a>
				</div>
			</div>
			{#if program.stats?.length}
				<ul class="grid gap-4 rounded-2xl bg-white p-6 shadow md:w-72">
					{#each program.stats as stat}
						<li class="rounded-xl border border-blue-100 bg-blue-50 p-4">
							<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">{stat.label}</p>
							{#if Array.isArray(stat.value)}
								<ul class="mt-2 list-none space-y-2 text-sm font-medium text-gray-900">
									{#each stat.value as option}
										<li class="leading-snug">{option}</li>
									{/each}
								</ul>
							{:else}
								<p class="mt-2 text-sm font-medium text-gray-900">{stat.value}</p>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</section>

	{#if program.reviews?.length}
		<section class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each program.reviews as review}
				<ReviewCard quote={review.quote} author={review.author} role={review.role} />
			{/each}
		</section>
	{/if}

	{#if program.audience?.length || program.audienceExamples?.length}
		<section class="grid gap-8 md:grid-cols-2">
			{#if program.audience?.length}
				<div class="rounded-2xl bg-white p-6 shadow">
					<h2 class="text-2xl font-semibold text-gray-900">Who it's for</h2>
					<ul class="mt-4 space-y-3 text-gray-700">
						{#each program.audience as group}
							<li class="flex items-start gap-3">
								<span class="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
								<span>{group}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if program.audienceExamples?.length}
				<div class="rounded-2xl border border-blue-100 bg-white p-6 shadow">
					<h2 class="text-2xl font-semibold text-gray-900">Designed for people like you</h2>
					<ul class="mt-4 space-y-3 text-gray-700">
						{#each program.audienceExamples as example}
							<li class="flex items-start gap-3">
								<span class="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
								<span>{example}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}

	{#if program.objectives?.length || program.prerequisites?.length}
		<section class="grid gap-8 md:grid-cols-2">
			{#if program.objectives?.length}
				<div class="rounded-2xl border border-blue-100 bg-blue-50 p-6">
					<h2 class="text-2xl font-semibold text-gray-900">Learning objectives</h2>
					<ul class="mt-4 space-y-3 text-gray-800">
						{#each program.objectives as objective}
							<li class="flex items-start gap-3">
								<span class="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
								<span>{objective}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if program.prerequisites?.length}
				<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow">
					<h2 class="text-2xl font-semibold text-gray-900">Prerequisites</h2>
					<ul class="mt-4 space-y-3 text-gray-700">
						{#each program.prerequisites as prerequisite}
							<li class="flex items-start gap-3">
								<span class="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
								<span>{prerequisite}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}

	{#if program.takeaways?.length || program.sessions?.length}
		<section class="grid gap-8 md:grid-cols-2">
			{#if program.takeaways?.length}
				<div class="rounded-2xl border border-blue-100 bg-white p-6 shadow">
					<h2 class="text-2xl font-semibold text-gray-900">Results you can use</h2>
					<ul class="mt-4 space-y-3 text-gray-700">
						{#each program.takeaways as takeaway}
							<li class="flex items-start gap-3">
								<span class="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
								<span>{takeaway}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if program.sessions?.length}
				<div class="rounded-2xl bg-white p-6 shadow">
					<h3 class="text-lg font-semibold text-gray-900">Upcoming & private sessions</h3>
					<ul class="mt-4 space-y-5">
						{#each program.sessions as session}
							<li class="rounded-xl border border-blue-100 p-4">
								<p class="text-sm font-semibold text-gray-900">{session.name}</p>
								<p class="mt-1 text-sm text-gray-600">{session.date}</p>
								<p class="text-sm text-gray-600">{session.time}</p>
								<p class="mt-1 text-sm text-gray-600">{session.location}</p>
								<p class="mt-1 text-xs uppercase tracking-wide text-blue-600">{session.spots}</p>
								<a
									href={session.registerUrl}
									class="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
								>
									Book your spot
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}

	{#if program.agenda?.length}
		<section class="rounded-3xl bg-white p-8 shadow md:p-10">
			<h2 class="text-2xl font-semibold text-gray-900">Agenda</h2>
			<div class="mt-6 grid gap-6 md:grid-cols-3">
				{#each program.agenda as block}
					<div class="rounded-2xl border border-blue-100 p-5">
						<h3 class="text-lg font-semibold text-blue-700">{block.title}</h3>
						<ul class="mt-3 space-y-2 text-sm text-gray-700">
							{#each block.details as item}
								<li>• {item}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if program.resources?.length || program.testimonial}
		<section class="grid gap-8 md:grid-cols-2">
			{#if program.resources?.length}
				<div class="rounded-2xl border border-blue-100 bg-blue-50 p-6">
					<h2 class="text-2xl font-semibold text-gray-900">Included in the workshop</h2>
					<ul class="mt-4 space-y-3 text-gray-700">
						{#each program.resources as resource}
							<li class="flex items-start gap-3">
								<span class="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
								<span>{resource}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if program.testimonial}
				<blockquote class="flex h-full flex-col justify-between rounded-2xl bg-white p-6 shadow">
					<p class="text-lg font-medium text-gray-800">“{program.testimonial.quote}”</p>
					<cite class="mt-4 text-sm font-semibold text-gray-600">— {program.testimonial.author}</cite>
				</blockquote>
			{/if}
		</section>
	{/if}

	{#if program.aboutTrainer}
		<section class="rounded-3xl bg-white p-8 shadow md:p-10">
			<h2 class="text-2xl font-semibold text-gray-900">{program.aboutTrainer.title}</h2>
			<div class="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
				{#if program.aboutTrainer.photo || program.aboutTrainer.highlights?.length}
					<div class="flex flex-col items-center gap-6 lg:w-72 lg:shrink-0 lg:items-start">
						{#if program.aboutTrainer.photo}
							<img
								src={program.aboutTrainer.photo}
								alt={program.aboutTrainer.photoAlt ?? program.aboutTrainer.name}
								class="h-40 w-40 rounded-3xl border border-blue-100 object-cover shadow-lg"
							/>
						{/if}
						<div class="lg:max-w-xl">
							<p class="text-lg font-semibold text-gray-900">{program.aboutTrainer.name}</p>
							<p class="mt-1 text-sm uppercase tracking-wide text-blue-600">
								{program.aboutTrainer.role}
							</p>
							<p class="mt-4 text-base text-gray-700">{program.aboutTrainer.summary}</p>
						</div>
						{#if program.aboutTrainer.highlights?.length}
							<ul class="w-full space-y-3 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-gray-800">
								{#each program.aboutTrainer.highlights as highlight}
									<li class="flex items-start gap-3">
									<span class="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
										<span>{highlight}</span>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			</div>
		</section>
	{/if}

	{#if program.faqs?.length}
		<section>
			<h2 class="text-2xl font-semibold text-gray-900">Frequently asked questions</h2>
			<div class="mt-6 space-y-5">
				{#each program.faqs as faq}
					<details class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
						<summary class="cursor-pointer text-lg font-semibold text-gray-900">
							{faq.question}
						</summary>
						{#each getFaqAnswers(faq) as answer, index}
							<div
								class="flex items-start gap-3 text-gray-700"
								class:mt-3={index === 0}
								class:mt-2={index > 0}
							>
								<span class="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
								<p class="whitespace-pre-line text-gray-700">{answer}</p>
							</div>
						{/each}
					</details>
				{/each}
			</div>
		</section>
	{/if}

	<section class="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white md:flex md:items-center md:justify-between md:gap-8 md:p-12">
		<div class="md:max-w-xl">
			<h2 class="text-3xl font-bold">Ready to bring AI clarity to your team?</h2>
			<p class="mt-4 text-lg text-blue-100">
				Book your spot or schedule a call with Bill to customize the training for your organization.
			</p>
		</div>
		<div class="mt-6 flex flex-col gap-4 md:mt-0">
			<a
				href={program.primaryCta.url}
				class="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-blue-700 shadow transition hover:bg-blue-50"
			>
				{program.primaryCta.label}
			</a>
			<a
				href={program.secondaryCta.url}
				class="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
			>
				{program.secondaryCta.label}
			</a>
		</div>
	</section>
</main>
