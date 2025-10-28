<script lang="ts">
	export type UpcomingSessionSlide = {
		id: string;
		programTitle: string;
		sessionLabel?: string | null;
		date: string;
		timeLines: string[];
		location?: string;
		partner?: string;
		spots?: string;
		urgency?: string | null;
		registerUrl: string;
		image?: string;
		imageAlt?: string;
	};

	export let slides: UpcomingSessionSlide[] = [];

	let currentIndex = 0;

	$: totalSlides = slides.length;
	$: currentIndex = totalSlides === 0 ? 0 : Math.min(currentIndex, totalSlides - 1);

	const goToSlide = (index: number): void => {
		if (!totalSlides) return;
		const wrappedIndex = (index + totalSlides) % totalSlides;
		currentIndex = wrappedIndex;
	};

	const handleKeydown = (event: KeyboardEvent): void => {
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			goToSlide(currentIndex + 1);
		}
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			goToSlide(currentIndex - 1);
		}
	};
</script>

{#if totalSlides > 0}
	<div
		class="relative"
		tabindex="0"
		aria-roledescription="carousel"
		on:keydown={handleKeydown}
	>
		<span class="sr-only" aria-live="polite">
			Showing session {currentIndex + 1} of {totalSlides}
		</span>

		<div class="overflow-hidden rounded-3xl border border-blue-100 bg-white/90 shadow-md shadow-blue-100/60">
			<div
				class="flex transition-transform duration-500 ease-out"
				style={`transform: translateX(-${currentIndex * 100}%);`}
			>
				{#each slides as slide (slide.id)}
					<article class="flex w-full shrink-0 basis-full flex-col gap-4 p-4 md:flex-row md:items-stretch md:gap-6 md:p-6">
						<div class="flex h-36 w-full max-w-[20rem] items-center justify-center overflow-hidden rounded-2xl bg-blue-100/70 md:h-full md:w-[220px] md:max-w-[220px] md:self-stretch">
							{#if slide.image}
								<img
									src={slide.image}
									alt={slide.imageAlt ?? slide.programTitle}
									class="h-full w-full object-cover"
									loading="lazy"
								/>
							{:else}
								<span class="text-sm font-semibold text-blue-500">Upcoming session</span>
							{/if}
						</div>
						<div class="flex flex-1 flex-col justify-between gap-3 md:py-1">
						<header class="space-y-1">
							<p class="text-[0.65rem] font-semibold uppercase tracking-wide text-blue-600">
								Upcoming session preview
							</p>
							<h3 class="text-base font-semibold text-gray-900 md:text-lg">
								{slide.programTitle}
							</h3>
							{#if slide.sessionLabel}
								<p class="inline-flex items-center rounded-full bg-blue-100/70 px-2.5 py-1 text-[0.65rem] font-semibold text-blue-700">
									{slide.sessionLabel}
								</p>
							{/if}
						</header>
						<div class="grid gap-1 text-[0.75rem] text-gray-600 md:text-sm">
							<p class="font-medium text-gray-800">{slide.date}</p>
							{#each slide.timeLines.slice(0, 2) as timeLine}
								<p>{timeLine}</p>
							{/each}
							{#if slide.location}
								<p>{slide.location}</p>
							{/if}
							{#if slide.partner}
								<p class="text-[0.65rem] uppercase tracking-wide text-gray-500">
									In partnership with {slide.partner}
								</p>
							{/if}
						</div>
							<div class="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-[0.7rem] md:text-xs">
								<span class="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-700">
									{slide.urgency ?? slide.spots ?? 'Open for registration'}
								</span>
								<a
									href={slide.registerUrl}
									target="_blank"
									rel="noopener"
									class="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[0.7rem] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:text-xs"
								>
									Register ↗
								</a>
							</div>
						</div>
					</article>
				{/each}
			</div>
		</div>

		{#if totalSlides > 1}
			<button
				type="button"
				class="absolute left-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white/95 text-base font-semibold text-blue-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
				on:click={() => goToSlide(currentIndex - 1)}
				aria-label="Show previous session"
			>
				←
			</button>
			<button
				type="button"
				class="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white/95 text-base font-semibold text-blue-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
				on:click={() => goToSlide(currentIndex + 1)}
				aria-label="Show next session"
			>
				→
			</button>
			<div class="mt-2 flex items-center justify-center gap-2">
				{#each slides as _, index (index)}
					<button
						type="button"
						class="h-2 w-2 rounded-full border border-blue-400 transition"
						class:bg-blue-600={index === currentIndex}
						class:bg-blue-200={index !== currentIndex}
						on:click={() => goToSlide(index)}
						aria-label={`Show session ${index + 1}`}
						aria-current={index === currentIndex ? 'true' : undefined}
					/>
				{/each}
			</div>
		{/if}
	</div>
{/if}
