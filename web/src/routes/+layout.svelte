<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { page } from '$app/stores';
	import { defaultSeo } from '$lib/seo';
	import { SITE_ORIGIN } from '$lib/config/site';

	let navOpen = false;
	const navId = 'site-primary-navigation';

	const organizationJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Cambermast',
		url: SITE_ORIGIN,
		logo: `${SITE_ORIGIN.replace(/\/$/, '')}/images/cambermast-logo-full.png`
	});

	$: hideChrome =
		$page.url.pathname.startsWith('/training/print') || $page.url.pathname.startsWith('/techlab');
</script>

<SeoHead
	title={defaultSeo.title}
	description={defaultSeo.description}
	path={$page.url.pathname}
/>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
	<script type="application/ld+json">
		{@html organizationJsonLd}
	</script>
</svelte:head>

{#if hideChrome}
	<slot />
{:else}
	<a class="skip-link" href="#main-content">Skip to main content</a>
	<header class="flex flex-col items-center bg-white px-5 py-3">
		<a href="/" class="mb-2 block" style="width:160px;min-width:160px;">
			<img
				src="/images/cambermast-logo-full.png"
				alt="Cambermast logo"
				style="width:100%;height:auto;"
			/>
		</a>
		<div class="relative flex w-full flex-wrap justify-center">
			<!-- Hamburger for small screens -->
			<button
				class="mr-2 flex items-center rounded border border-gray-400 px-3 py-2 text-gray-700 sm:hidden"
				aria-label="Toggle navigation"
				aria-expanded={navOpen}
				aria-controls={navId}
				on:click={() => (navOpen = !navOpen)}
			>
				<span class="mr-2 text-xl">☰</span> Navigation
			</button>
			<!-- Nav: horizontal on sm+, vertical dropdown on mobile when open -->
			<div class={`w-full sm:w-auto ${navOpen ? '' : 'hidden'} sm:flex`}>
				<Nav
					id={navId}
					ariaLabel="Primary navigation"
					vertical={navOpen}
					onNavigate={() => (navOpen = false)}
				/>
			</div>
		</div>
	</header>

	<!-- Default container for every page -->
	<main id="main-content" tabindex="-1" class="text-fluid mx-auto max-w-6xl px-4 pb-16">
		<slot />
	</main>

	<footer class="border-t">
		<div class="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-500">
			© {new Date().getFullYear()} Cambermast LLC · AI Agility in Action™️ ·
			<a class="underline" href="/contact">Contact</a> ·
			<a class="underline" href="/gdpr">GDPR & privacy</a>
		</div>
	</footer>
{/if}
