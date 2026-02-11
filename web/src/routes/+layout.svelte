<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';
	import { GA_MEASUREMENT_ID, SITE_ORIGIN } from '$lib/config/site';
	import {
		consentState,
		initConsent,
		persistAnalyticsConsent,
		type ConsentChoice
	} from '$lib/stores/consent';

	let navOpen = false;
	const navId = 'site-primary-navigation';
	let analyticsPreference: ConsentChoice = 'unknown';
	let showConsentPanel = false;
	let manageConsentOpen = false;
	let hasLoadedAnalytics = false;
	let consentResolved = false;

	const organizationJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Cambermast',
		url: SITE_ORIGIN,
		logo: `${SITE_ORIGIN.replace(/\/$/, '')}/images/cambermast-logo-full.png`
	});

	$: hideChrome =
		$page.url.pathname.startsWith('/training/print') || $page.url.pathname.startsWith('/techlab');

	const showAnalyticsDebug = import.meta.env.DEV;
	$: analyticsDebugLabel =
		analyticsPreference === 'granted'
			? 'Granted (cookies)'
			: analyticsPreference === 'denied'
				? 'Declined (cookieless)'
				: 'Pending';

	onMount(async () => {
		initConsent();
		await tick();
		consentResolved = true;
	});

	$: analyticsPreference = $consentState.analytics;
	$: showConsentPanel = manageConsentOpen || (consentResolved && analyticsPreference === 'unknown');
	$: if (browser) {
		const mode = analyticsPreference === 'granted' ? 'granted' : 'denied';
		loadAnalytics(mode);
	}

	function handleAnalyticsConsent(choice: Exclude<ConsentChoice, 'unknown'>) {
		persistAnalyticsConsent(choice);
		manageConsentOpen = false;
		const mode = choice === 'granted' ? 'granted' : 'denied';
		loadAnalytics(mode);
	}

	function openConsentPreferences() {
		manageConsentOpen = true;
	}

	function closeConsentPreferences() {
		manageConsentOpen = false;
	}

	function ensureGtag() {
		if (!browser) return;
		window.dataLayer = window.dataLayer || [];
		if (typeof window.gtag === 'function') {
			return;
		}

		window.gtag = function gtag() {
			window.dataLayer?.push(arguments);
		};
		window.gtag('consent', 'default', {
			ad_storage: 'denied',
			analytics_storage: 'denied'
		});
	}

	function loadAnalytics(mode: 'granted' | 'denied') {
		if (!browser) return;
		ensureGtag();

		if (!hasLoadedAnalytics) {
			const script = document.createElement('script');
			script.async = true;
			script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
			document.head?.appendChild(script);
			hasLoadedAnalytics = true;
		}

		window.gtag?.('js', new Date());
		window.gtag?.('config', GA_MEASUREMENT_ID, {
			anonymize_ip: true,
			allow_google_signals: false,
			allow_ad_personalization_signals: false,
			client_storage: mode === 'granted' ? 'auto' : 'none'
		});
		updateAnalyticsConsent(mode);
	}

	function updateAnalyticsConsent(mode: 'granted' | 'denied') {
		if (!browser) return;
		ensureGtag();
		window.gtag?.('consent', 'update', {
			ad_storage: 'denied',
			analytics_storage: mode
		});
	}
</script>

<svelte:head>
	<script type="application/ld+json">
		{@html organizationJsonLd}
	</script>
</svelte:head>

{#if hideChrome}
	<slot />
{:else}
	{#if showAnalyticsDebug}
		<div
			class="fixed right-4 bottom-4 z-50 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg"
		>
			Analytics: {analyticsDebugLabel}
		</div>
	{/if}
	<a class="skip-link" href="#main-content">Skip to main content</a>
	<header class="flex flex-col items-center bg-white px-5 py-3">
		<a
			href="/about"
			class="mb-2 inline-flex items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			<img
				src="/images/bill.jpg"
				alt="Bill Raymond"
				class="h-11 w-11 rounded-2xl border border-gray-200 object-cover"
			/>
			<img
				src="/images/cambermast-logo-full.png"
				alt="Cambermast logo"
				style="width:160px;min-width:160px;height:auto;"
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
			<a class="underline" href="/gdpr">Privacy & GDPR notice</a> ·
			<a class="underline" href="/training/terms">Training T&amp;Cs</a> ·
			<button
				class="underline transition hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
				type="button"
				on:click={openConsentPreferences}
			>
				Cookie preferences
			</button>
		</div>
	</footer>
{/if}

{#if showConsentPanel}
	<div
		class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 shadow-xl shadow-black/5 backdrop-blur"
		role="dialog"
		aria-live="polite"
	>
		<div
			class="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-5 text-sm text-gray-800 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="space-y-2">
				<p class="text-base font-semibold text-gray-900">
					{manageConsentOpen ? 'Update your analytics settings' : 'Help us improve cambermast.com'}
				</p>
				<p class="text-gray-700">
					We use Google Analytics to understand which pages help visitors most. Analytics cookies
					only load if you allow them. Review the details any time on our
					<a class="font-semibold text-blue-600 underline" href="/gdpr">GDPR & privacy overview</a>.
				</p>
				{#if manageConsentOpen && analyticsPreference !== 'unknown'}
					<p class="text-xs tracking-wide text-gray-500 uppercase">
						Current setting:
						<span class="font-semibold text-gray-900">
							{analyticsPreference === 'granted'
								? 'Analytics allowed'
								: 'Analytics disabled (cookieless)'}
						</span>
					</p>
				{/if}
			</div>
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
				<button
					class="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
					type="button"
					on:click={() => handleAnalyticsConsent('denied')}
				>
					Decline analytics
				</button>
				<button
					class="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
					type="button"
					on:click={() => handleAnalyticsConsent('granted')}
				>
					Allow analytics
				</button>
				{#if manageConsentOpen && analyticsPreference !== 'unknown'}
					<button
						class="text-sm font-semibold text-gray-600 underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
						type="button"
						on:click={closeConsentPreferences}
					>
						Done
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
