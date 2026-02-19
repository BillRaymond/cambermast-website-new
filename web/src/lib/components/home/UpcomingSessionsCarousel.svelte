<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import EventCard from '$lib/components/events/EventCard.svelte';
	import type { EventCardModel } from '$lib/view-models/event-card';

	export let slides: EventCardModel[] = [];

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
			class="mx-3 overflow-hidden rounded-3xl border border-blue-100 bg-white/90 shadow-md shadow-blue-100/60 sm:mx-5 md:mx-10"
		>
			<div
				class="flex transition-transform duration-500 ease-out"
				style={`transform: translateX(-${currentIndex * 100}%);`}
			>
				{#each slides as slide (slide.id)}
					<article
						class={`w-full shrink-0 basis-full p-2 md:p-5 ${slide.tone === 'happening' ? 'bg-amber-50/70' : 'bg-white/0'}`}
					>
						<EventCard
							title={slide.title}
							subtitle={slide.subtitle}
							date={slide.date}
							time={slide.time}
							location={slide.location}
							image={slide.image}
							imageAlt={slide.imageAlt}
							certificateText={slide.certificateText}
							videoUrl={slide.videoUrl}
							typeLabel={slide.typeLabel}
							statusLabel={slide.statusLabel}
							registerUrl={slide.registerUrl}
							registerLabel={slide.registerLabel ?? 'Register now'}
							learnMoreUrl={slide.learnMoreUrl}
							hostText={slide.hostText}
							partnerText={slide.partnerText}
							speakerText={slide.speakerText}
							tone={slide.tone}
							variant="carousel"
						/>
					</article>
				{/each}
			</div>
		</div>

		{#if totalSlides > 1}
			<button
				type="button"
				class="absolute top-1/2 left-1 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white/95 text-base font-semibold text-blue-700 shadow-sm transition hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none sm:inline-flex sm:left-1.5 md:left-2"
				on:click={() => goPrevious(true)}
				aria-label="Show previous session"
			>
				←
			</button>
			<button
				type="button"
				class="absolute top-1/2 right-1 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white/95 text-base font-semibold text-blue-700 shadow-sm transition hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none sm:inline-flex sm:right-1.5 md:right-2"
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
