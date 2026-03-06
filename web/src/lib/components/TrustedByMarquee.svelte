<script lang="ts">
	import type { TrustedByOrganization } from '$lib/data/trusted-by';

	export let organizations: TrustedByOrganization[] = [];
	export let heading = 'Trusted by';
</script>

<div>
	<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">{heading}</p>
	<div class="trusted-by-marquee mt-4" aria-label="Trusted by organizations" role="list">
		<div class="trusted-by-track">
			<div class="trusted-by-group">
				{#each organizations as org (org.name)}
					<div class="trusted-by-item" role="listitem">
						<a href={org.url} target="_blank" rel="noopener noreferrer" class="trusted-by-link">
							{#if org.logoSrc}
								<img
									src={org.logoSrc}
									alt={org.logoAlt ?? `${org.name} logo`}
									class="trusted-by-logo"
									loading="lazy"
									decoding="async"
								/>
							{:else}
								<span
									class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700"
								>
									{org.name}
								</span>
							{/if}
						</a>
					</div>
				{/each}
			</div>

			<div class="trusted-by-spacer" aria-hidden="true"></div>

			<div class="trusted-by-group" aria-hidden="true">
				{#each organizations as org (org.name + '-duplicate')}
					<div class="trusted-by-item" role="listitem">
						<a
							href={org.url}
							target="_blank"
							rel="noopener noreferrer"
							tabindex="-1"
							class="trusted-by-link"
						>
							{#if org.logoSrc}
								<img
									src={org.logoSrc}
									alt=""
									class="trusted-by-logo"
									loading="lazy"
									decoding="async"
								/>
							{:else}
								<span
									class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700"
								>
									{org.name}
								</span>
							{/if}
						</a>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.trusted-by-marquee {
		overflow: hidden;
		padding: 0.35rem 0;
	}

	.trusted-by-track {
		display: flex;
		align-items: center;
		width: max-content;
		animation: trusted-by-scroll 110s linear infinite;
		will-change: transform;
		transform: translate3d(0, 0, 0);
	}

	.trusted-by-group {
		display: flex;
		align-items: center;
		gap: 2.5rem;
	}

	.trusted-by-spacer {
		flex: 0 0 2.5rem;
	}

	.trusted-by-item {
		display: flex;
		align-items: center;
		flex: 0 0 auto;
	}

	.trusted-by-link {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.trusted-by-link:focus-visible {
		outline: 2px solid rgba(191, 219, 254, 0.9);
		outline-offset: 6px;
		border-radius: 9999px;
	}

	.trusted-by-logo {
		height: 2rem;
		width: auto;
		max-width: 180px;
		object-fit: contain;
		opacity: 0.8;
		filter: grayscale(1);
		transition:
			opacity 200ms ease,
			filter 200ms ease;
	}

	.trusted-by-logo:hover {
		opacity: 1;
		filter: grayscale(0);
	}

	@keyframes trusted-by-scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.trusted-by-track {
			animation: none;
			transform: none;
		}
	}
</style>
