<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import { listTestimonials, type Testimonial } from '$lib/data/testimonials';
	import { listTrainingPrograms } from '$lib/data/training';
	import { getSeo } from '$lib/seo';

	type TestimonialsGroup = {
		slug: string;
		title: string;
		description?: string;
		href?: string;
		testimonials: Testimonial[];
	};

	const pageMeta = getSeo('/testimonials');
	const testimonials = listTestimonials().filter(
		(testimonial) => testimonial.allowPublicUse !== false
	);
	const trainingPrograms = listTrainingPrograms({ includeDrafts: true });
	const testimonialsBySlug = testimonials.reduce<Map<string, Testimonial[]>>((acc, testimonial) => {
		const slug = testimonial.programSlug ?? testimonial.programRoute ?? testimonial.programSku;
		if (!slug) return acc;
		const list = acc.get(slug) ?? [];
		list.push(testimonial);
		acc.set(slug, list);
		return acc;
	}, new Map());

	const sortByNewest = (a: Testimonial, b: Testimonial) =>
		new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

	const formatFallbackProgramTitle = (testimonial?: Testimonial): string => {
		const slug = testimonial?.programSlug ?? testimonial?.programSku;
		if (!slug) {
			return 'Training Program';
		}
		return slug
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	};

	const formatRole = (testimonial: Testimonial): string => {
		if (testimonial.jobTitle && testimonial.company) {
			return `${testimonial.jobTitle}, ${testimonial.company}`;
		}
		return testimonial.jobTitle ?? testimonial.company ?? '';
	};

	const groupedTestimonials: TestimonialsGroup[] = [];

	for (const program of trainingPrograms) {
		const programTestimonials = testimonialsBySlug.get(program.slug);
		if (!(programTestimonials && programTestimonials.length)) continue;
		groupedTestimonials.push({
			slug: program.slug,
			title: program.title,
			description: program.tagline,
			href: program.route ?? `/training/${program.slug}`,
			testimonials: [...programTestimonials].sort(sortByNewest)
		});
	}

	const matchedSlugs = new Set(groupedTestimonials.map((group) => group.slug));

	for (const [slug, programTestimonials] of testimonialsBySlug.entries()) {
		if (matchedSlugs.has(slug)) continue;
		const sample = programTestimonials[0];
		groupedTestimonials.push({
			slug,
			title: formatFallbackProgramTitle(sample),
			description: undefined,
			href: sample?.programRoute ?? `/training/${slug}`,
			testimonials: [...programTestimonials].sort(sortByNewest)
		});
	}

	const testimonialCount = testimonials.length;
	const programCount = groupedTestimonials.length;
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/testimonials" />

<section class="py-8">
	<p class="text-sm font-semibold tracking-wide text-blue-600 uppercase">Testimonials</p>
	<h1 class="mt-2 text-3xl font-bold text-gray-900">AI training wins from real teams</h1>
	<p class="mt-4 max-w-3xl text-lg text-gray-700">
		Read {testimonialCount} testimonials from {programCount} Cambermast training programs. Each story
		comes straight from a cohort or workshop where teams practiced AI workflows together.
	</p>
	<div class="mt-6 mb-8 flex flex-wrap gap-3">
		<a
			href="/contact"
			class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
		>
			Schedule AI training
		</a>
	</div>
</section>

{#if groupedTestimonials.length}
	<section class="flex flex-col gap-8 pb-8">
		{#each groupedTestimonials as group (group.slug)}
			<article class="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
				<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
					<div>
						<h2 class="text-2xl font-semibold text-gray-900">{group.title}</h2>
						{#if group.description}
							<p class="mt-1.5 text-gray-600">{group.description}</p>
						{/if}
					</div>
					{#if group.href}
						<a
							href={group.href}
							class="inline-flex items-center justify-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:text-blue-900"
						>
							View program ↗
						</a>
					{/if}
				</div>
				<div class="mt-6 grid gap-4 md:grid-cols-2">
					{#each group.testimonials as testimonial (testimonial.id)}
						<ReviewCard
							quote={testimonial.quote}
							author={testimonial.displayName}
							role={formatRole(testimonial)}
							photoUrl={testimonial.photoUrl}
						/>
					{/each}
				</div>
			</article>
		{/each}
	</section>
{:else}
	<section class="rounded-2xl border border-blue-100 bg-white p-6 text-gray-700">
		<p>
			We're collecting the latest cohort feedback now. Check back soon, or
			<a class="font-semibold text-blue-600" href="/forms/testimonials">share yours today</a>.
		</p>
	</section>
{/if}
