<script lang="ts">
	import catalog from '$lib/data/catalog.json';
	import Card from '$lib/components/ServiceCard.svelte';
	import { listTrainingPrograms } from '$lib/data/training';
	import type {
		TrainingProgram,
		TrainingSession
	} from '$lib/data/training/types';

	const year = new Date().getFullYear();

	type CatalogSection = {
		label: string;
		headline: string;
		route?: string;
		icon?: string;
		testimonial?: string;
		testimonialCta?: { href: string; label: string };
		author?: string;
	};

	const catalogSections = catalog as Record<string, Partial<CatalogSection>>;

	const sections = Object.entries(catalogSections)
		.filter(
			([slug, sec]) =>
				slug !== 'home' && Boolean(sec?.label) && Boolean(sec?.headline)
		)
		.map(([slug, sec]) => ({ slug, ...sec })) as Array<
		{ slug: string } & CatalogSection
	>;

	const isExternalUrl = (url: string | undefined): boolean =>
		/^https?:\/\//i.test(url ?? '');

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const upcomingSessions = listTrainingPrograms()
		.flatMap((program: TrainingProgram) =>
			(program.sessions ?? []).map((session) => ({ program, session }))
		)
		.filter(({ session }) => isExternalUrl(session.registerUrl))
		.filter(({ session }) => {
			const startValue = session.startDate;
			if (!startValue) return false;
			const parsedStart = new Date(startValue);
			if (Number.isNaN(parsedStart.valueOf())) return false;

			const parsedEnd = session.endDate ? new Date(session.endDate) : parsedStart;
			if (Number.isNaN(parsedEnd.valueOf())) return parsedStart >= today;

			return parsedEnd >= today;
		})
		.sort((a, b) => {
			const startA = a.session.startDate
				? new Date(a.session.startDate).getTime()
				: Number.POSITIVE_INFINITY;
			const startB = b.session.startDate
				? new Date(b.session.startDate).getTime()
				: Number.POSITIVE_INFINITY;
			return startA - startB;
		}) satisfies Array<{
		program: TrainingProgram;
		session: TrainingSession;
	}>;
</script>

<svelte:head>
	<!-- Favicon -->
	<link rel="icon" href="/images/cambermast-favicon.ico" />

	<!-- Apple Touch Icons -->
	<link rel="apple-touch-icon" href="/images/cambermast-apple-touch-icon.png" />
	<link rel="apple-touch-icon" sizes="57x57" href="/images/cambermast-apple-touch-icon-57x57.png" />
	<link rel="apple-touch-icon" sizes="60x60" href="/images/cambermast-apple-touch-icon-60x60.png" />
	<link rel="apple-touch-icon" sizes="72x72" href="/images/cambermast-apple-touch-icon-72x72.png" />
	<link rel="apple-touch-icon" sizes="76x76" href="/images/cambermast-apple-touch-icon-76x76.png" />
	<link
		rel="apple-touch-icon"
		sizes="114x114"
		href="/images/cambermast-apple-touch-icon-114x114.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="120x120"
		href="/images/cambermast-apple-touch-icon-120x120.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="144x144"
		href="/images/cambermast-apple-touch-icon-144x144.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="152x152"
		href="/images/cambermast-apple-touch-icon-152x152.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="167x167"
		href="/images/cambermast-apple-touch-icon-167x167.png"
	/>
	<link
		rel="apple-touch-icon"
		sizes="180x180"
		href="/images/cambermast-apple-touch-icon-180x180.png"
	/>

	<!-- Android / Chrome Icons -->
	<link
		rel="icon"
		type="image/png"
		sizes="192x192"
		href="/images/cambermast-android-chrome-192x192.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="256x256"
		href="/images/cambermast-android-chrome-256x256.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="384x384"
		href="/images/cambermast-android-chrome-384x384.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="512x512"
		href="/images/cambermast-android-chrome-512x512.png"
	/>

	<!-- Manifest -->
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<!-- Full-bleed hero -->
<section class="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-blue-50">
	<!-- Removed gradient background, replaced with a subtle blue tint using bg-blue-50 -->

	<div
		class="relative mx-auto flex max-w-5xl items-center justify-between px-5"
		style="height:100px"
	>
		<!-- Left: headline only -->
		<h1 class="text-1xl font-extrabold tracking-tight text-gray-900">
			Applying AI leadership skills.<br />
		</h1>

		<!-- Right: portrait with name below -->
		<div class="flex flex-shrink-0 flex-col items-center">
			<img
				src="/images/bill.jpg"
				alt="Bill Raymond"
				class="h-16 w-16 rounded-2xl border border-gray-200 object-cover shadow-xl"
			/>
			<span class="mt-2 text-xs font-medium text-gray-500">
				Bill Raymond, Founder, Cambermast LLC
			</span>
		</div>
	</div>
</section>

<!-- Add podcast and newsletter buttons -->
<div class="mt-6 flex flex-wrap justify-center gap-3.5">
	<a
		href="https://billtalksai.com/"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
	>
		<span class="md:hidden">📰 Newsletter</span>
		<span class="hidden md:inline">📰 The Bill Talks AI Newsletter</span>
	</a>
	<a
		href="https://agileinaction.com/"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-gray-800"
	>
		<span class="md:hidden">🎙️ Podcast</span>
		<span class="hidden md:inline">🎙️ The Agile in Action Podcast</span>
	</a>
	<a
		href="https://youtube.com/@bill-raymond"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-red-700"
	>
		<span class="md:hidden">▶️ YouTube</span>
		<span class="hidden md:inline">▶️ Bill on YouTube</span>
	</a>
	<a
		href="/contact"
		class="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-emerald-700"
	>
		<span class="md:hidden">✉️ Contact</span>
		<span class="hidden md:inline">✉️ Contact Bill</span>
	</a>
	<a
		href="https://www.linkedin.com/in/williamraymond/"
		target="_blank"
		rel="noopener"
		class="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-sky-700"
	>
		<span class="md:hidden">💼 LinkedIn</span>
		<span class="hidden md:inline">💼 Bill on LinkedIn</span>
	</a>
</div>

{#if upcomingSessions.length}
	<section class="mx-auto mt-6 w-full px-4">
		<div
			class="mx-auto max-w-5xl rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 shadow-sm"
		>
			<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
				Upcoming sessions and events
			</p>
			<div class="mt-3 overflow-x-auto">
				<div class="flex gap-3 pb-2 pr-1">
					{#each upcomingSessions as upcoming (upcoming.program.slug + (upcoming.session.startDate ?? ''))}
						<a
							href={upcoming.session.registerUrl}
							target="_blank"
							rel="noopener"
							class="group min-w-[16rem] rounded-lg border border-blue-100 bg-white px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-100/60"
						>
							<p
								class="text-xs font-semibold uppercase tracking-wide text-blue-500 group-hover:text-blue-700"
							>
								{upcoming.program.title}
							</p>
							<p class="mt-1 text-sm font-semibold text-gray-900 group-hover:text-blue-900">
								{upcoming.session.name}
							</p>
							<p class="text-xs text-gray-600">{upcoming.session.date}</p>
							{#if upcoming.session.time}
								<p class="text-xs text-gray-500">{upcoming.session.time}</p>
							{/if}
							{#if upcoming.session.partner}
								<p class="mt-1 text-xs text-gray-500">
									<em>{upcoming.session.partner}</em>
								</p>
							{/if}
							<p class="mt-2 text-xs font-semibold text-blue-600 group-hover:text-blue-800">
								Register →
							</p>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Cards rendered from JSON (label + headline only) -->
<section class="mt-9 grid gap-5 md:grid-cols-3">
	{#each sections as s}
		<Card
			icon={s.icon}
			label={s.label}
			headline={s.headline}
			testimonial={s.testimonial}
			author={s.author}
			route={s.route}
			testimonialCta={s.testimonialCta}
		/>
	{/each}
</section>
<!-- Add a section break line -->
<hr class="my-10 border-gray-300" />
<!-- Upcoming events embed -->
<section class="mt-10 flex flex-col items-center px-3.5">
	<h2 class="mb-3 text-center text-2xl font-bold text-gray-900">
		Bill's Upcoming Training and Speaking Events
	</h2>
	<div class="mb-5 flex justify-center">
		<a
			href="https://luma.com/BillTalksAI?k=c"
			target="_blank"
			rel="noopener"
			class="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
		>
			View Events on Lu.ma
		</a>
	</div>
	<div class="w-full max-w-5xl overflow-hidden rounded-lg shadow-sm">
		<iframe
			title="Bill Talks AI upcoming events calendar"
			src="https://luma.com/embed/calendar/cal-WiCb89B8ouz3ZFH/events"
			class="h-[560px] w-full"
			loading="lazy"
			frameborder="0"
			style="border: 1px solid #bfcbda88; border-radius: 4px;"
			allowfullscreen
		></iframe>
	</div>
</section>
<!-- Add a section break line -->
<hr class="my-10 border-gray-300" />
<!-- Microsoft Project Server Service-->
<section>
	<div class="mt-10 flex flex-col items-center">
		<h2 class="text-1xl mb-3 font-bold text-gray-900">
			Are you a Microsoft Project Server customer?
		</h2>
		<p class="mb-5 max-w-xl text-center text-gray-700">
			Did you know that Bill Raymond wrote the book on Microsoft Project Server? Microsoft stopped
			supporting it, but you may still be using this beloved product. Cambermast partners with
			<a class="inline-link" href="https://projecthosts.com">ProjectHosts</a> to provide hosting and
			support for Microsoft Project Server.
		</p>

		<!-- svelte-ignore a11y_consider_explicit_label -->
		<p>
			<a
				href="https://cambermast.com/services/microsoft-project-server/"
				target="_blank"
				rel="noopener"
				class="text-1xl rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-green-700"
				>Learn More ></a
			>
		</p>
	</div>
</section>

<style>
	.inline-link {
		color: #2563eb;
		font-weight: 600;
		text-decoration: underline;
		text-decoration-thickness: 0.08em;
		text-underline-offset: 0.2em;
		transition: color 0.2s ease-in-out;
	}

	.inline-link:hover {
		color: #1d4ed8;
	}

	.inline-link:focus-visible {
		outline: 2px solid #1d4ed8;
		outline-offset: 2px;
	}
</style>
