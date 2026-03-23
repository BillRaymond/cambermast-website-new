<script lang="ts">
	import UpcomingSessionsCarousel from '$lib/components/home/UpcomingSessionsCarousel.svelte';
	import type { EventCardModel } from '$lib/view-models/event-card';

	export let slides: EventCardModel[] = [];
	export let title = 'Upcoming sessions & events';
	export let tagline = 'Register for public cohorts, workshops, and upcoming partner events.';
	export let eyebrow: string | undefined = undefined;
</script>

<section class="mx-auto mt-4 w-full px-4">
	<div class="sessions-strip mx-auto max-w-5xl px-4 py-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div class="min-w-0 flex-1">
				<div class="flex flex-col gap-1">
					{#if eyebrow}
						<p class="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
							{eyebrow}
						</p>
					{/if}
					<h1 class="sessions-strip-title text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
						{title}
					</h1>
					<p class="sessions-strip-tagline text-sm text-gray-700">
						{tagline}
					</p>
				</div>
			</div>
			<a
				href="/calendar"
				class="sessions-strip-link inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:outline-none"
			>
				View calendar →
			</a>
		</div>

		{#if slides.length}
			<div class="mt-4">
				<UpcomingSessionsCarousel slides={slides} />
			</div>
		{:else}
			<div class="mt-4 rounded-2xl border border-blue-100 bg-white/70 px-4 py-3 text-sm text-gray-700">
				No upcoming sessions are listed right now. Check the calendar for the latest updates.
			</div>
		{/if}
	</div>
</section>

<style>
	.sessions-strip {
		position: relative;
		overflow: visible;
		border-radius: 30px;
		padding: 1.5rem 1.25rem;
		border: 1px solid rgba(148, 197, 253, 0.45);
		background: rgba(226, 237, 255, 0.55);
		box-shadow: 0 22px 44px -40px rgba(30, 64, 175, 0.45);
	}

	@media (max-width: 640px) {
		.sessions-strip {
			padding: 1rem;
			border-radius: 22px;
		}

		.sessions-strip-title {
			font-size: 1.05rem;
		}

		.sessions-strip-tagline {
			font-size: 0.85rem;
		}

		.sessions-strip-link {
			align-self: flex-start;
		}
	}
</style>
