<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	type UpcomingSessionSlide = {
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

	const AUTOPLAY_INTERVAL = 10000;

	let currentIndex = 0;

	$: totalSlides = slides.length;
	$: currentIndex = totalSlides === 0 ? 0 : Math.min(currentIndex, totalSlides - 1);

	let carouselEl: HTMLDivElement | null = null;
	let autoTimer: ReturnType<typeof setInterval> | null = null;
	let isPointerOver = false;
	let hasFocus = false;

	const goToSlide = (index: number): void => {
		if (!totalSlides) return;
		const wrappedIndex = (index + totalSlides) % totalSlides;
		currentIndex = wrappedIndex;
	};

	const goNext = (manual = false): void => {
		goToSlide(currentIndex + 1);
		if (manual) restartAutoplay();
	};

	const goPrevious = (manual = false): void => {
		goToSlide(currentIndex - 1);
		if (manual) restartAutoplay();
	};

	const pauseAutoplay = (): void => {
		if (autoTimer) {
			clearInterval(autoTimer);
			autoTimer = null;
		}
	};

	const shouldAutoplay = (): boolean =>
		typeof window !== 'undefined' && totalSlides > 1 && !isPointerOver && !hasFocus;

	const restartAutoplay = (): void => {
		pauseAutoplay();
		if (!shouldAutoplay()) return;
		autoTimer = setInterval(() => {
			goNext();
		}, AUTOPLAY_INTERVAL);
	};

	$: if (shouldAutoplay() && !autoTimer) {
		restartAutoplay();
	}

	$: if (!shouldAutoplay() && autoTimer) {
		pauseAutoplay();
	}

	const handlePointerEnter = (): void => {
		isPointerOver = true;
		pauseAutoplay();
	};

	const handlePointerLeave = (): void => {
		isPointerOver = false;
		restartAutoplay();
	};

	const handleFocusIn = (): void => {
		hasFocus = true;
		pauseAutoplay();
	};

	const handleFocusOut = (event: FocusEvent): void => {
		const nextTarget = event.relatedTarget as Node | null;
		if (carouselEl && nextTarget && carouselEl.contains(nextTarget)) {
			return;
		}
		hasFocus = false;
		restartAutoplay();
	};

	const handleKeyboardNavigation = (event: KeyboardEvent): void => {
		if (!carouselEl) return;
		const activeElement =
			typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
		const isFocusInside = activeElement ? carouselEl.contains(activeElement) : false;
		if (!isFocusInside && !isPointerOver) return;

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			goNext(true);
		}
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			goPrevious(true);
		}
	};

	onMount(() => {
		restartAutoplay();
		return () => {
			pauseAutoplay();
		};
	});

	onDestroy(() => {
		pauseAutoplay();
	});
</script>

<svelte:window on:keydown={handleKeyboardNavigation} />

{#if totalSlides > 0}
	<div
		class="relative"
		aria-roledescription="carousel"
		role="group"
		aria-label="Upcoming sessions carousel"
		on:pointerenter={handlePointerEnter}
		on:pointerleave={handlePointerLeave}
		on:focusin={handleFocusIn}
		on:focusout={handleFocusOut}
		bind:this={carouselEl}
	>
		<span class="sr-only" aria-live="polite">
			Showing session {currentIndex + 1} of {totalSlides}
		</span>

		<div
			class="mx-4 overflow-hidden rounded-3xl border border-blue-100 bg-white/90 shadow-md shadow-blue-100/60 sm:mx-5 md:mx-10"
		>
			<div
				class="flex transition-transform duration-500 ease-out"
				style={`transform: translateX(-${currentIndex * 100}%);`}
			>
				{#each slides as slide (slide.id)}
					<article
						class="flex w-full shrink-0 basis-full flex-col gap-4 p-3 md:flex-row md:items-stretch md:gap-4 md:p-5"
					>
						<div
							class="flex w-full items-center justify-center rounded-2xl bg-white p-3 md:basis-[40%] md:max-w-[340px] md:flex-shrink-0 md:p-4"
						>
							{#if slide.image}
								<img
									src={slide.image}
									alt={slide.imageAlt ?? slide.programTitle}
									class="max-h-56 w-full max-w-full rounded-xl object-contain"
									loading="lazy"
								/>
							{:else}
								<span class="text-sm font-semibold text-blue-500">Upcoming session</span>
							{/if}
						</div>
						<div
							class="flex w-full min-w-0 flex-1 flex-col justify-between gap-3 rounded-2xl bg-white/70 p-3 md:basis-[60%] md:p-4"
						>
							<header class="space-y-1">
								<p class="text-[0.65rem] font-semibold uppercase tracking-wide text-blue-600">
									Upcoming session preview
								</p>
								<h3 class="text-base font-semibold text-gray-900 md:text-lg">
									{slide.programTitle}
								</h3>
								{#if slide.sessionLabel}
									<p
										class="inline-flex items-center rounded-full bg-blue-100/70 px-2.5 py-1 text-[0.65rem] font-semibold text-blue-700"
									>
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
							<div
								class="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-[0.7rem] md:text-xs"
							>
								<span
									class="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-700"
								>
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
				class="absolute left-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white/95 text-base font-semibold text-blue-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:left-1.5 md:left-2"
				on:click={() => goPrevious(true)}
				aria-label="Show previous session"
			>
				←
			</button>
			<button
				type="button"
				class="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white/95 text-base font-semibold text-blue-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:right-1.5 md:right-2"
				on:click={() => goNext(true)}
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
						on:click={() => {
							goToSlide(index);
							restartAutoplay();
						}}
						aria-label={`Show session ${index + 1}`}
						aria-current={index === currentIndex ? 'true' : undefined}
					></button>
				{/each}
			</div>
		{/if}
	</div>
{/if}
