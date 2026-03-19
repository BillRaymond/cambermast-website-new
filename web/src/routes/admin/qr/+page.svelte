<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import { getSeo } from '$lib/seo';

	type RouteSpec = {
		path: string;
		label: string;
		description?: string;
	};

	type RouteGroup = {
		title: string;
		description: string;
		routes: RouteSpec[];
	};

	type QrAsset = {
		pngDataUrl?: string;
		svgDataUrl?: string;
		loading?: boolean;
		error?: string;
	};

	const pageMeta = {
		title: 'Admin Route QR Codes | Cambermast',
		description: 'Internal QR code hub for Cambermast major public routes.'
	};

	const baseRouteGroups: Array<{
		title: string;
		description: string;
		routes: Array<Pick<RouteSpec, 'path' | 'label'>>;
	}> = [
		{
			title: 'Core pages',
			description: 'Primary public pages used in navigation, outreach, and printed materials.',
			routes: [
				{ path: '/', label: 'Home' },
				{ path: '/about', label: 'About' },
				{ path: '/contact', label: 'Contact' },
				{ path: '/connect', label: 'Book a consultation' }
			]
		},
		{
			title: 'Services',
			description: 'Top-level service and advisory pages for external sharing.',
			routes: [
				{ path: '/agents', label: 'Agents & automation' },
				{ path: '/strategy', label: 'Strategy & advisory' },
				{ path: '/services/microsoft-project-server', label: 'Microsoft Project Server' }
			]
		},
		{
			title: 'Programs and content',
			description: 'Main training, event, and proof pages people are most likely to scan into.',
			routes: [
				{ path: '/training', label: 'Training' },
				{ path: '/events', label: 'Events' },
				{ path: '/news', label: 'News' },
				{ path: '/resources', label: 'Resources' },
				{ path: '/testimonials', label: 'Testimonials' }
			]
		},
		{
			title: 'Support and tools',
			description:
				'Supporting pages that are still useful for handouts, decks, and follow-up links.',
			routes: [
				{ path: '/faq', label: 'FAQ' },
				{ path: '/gdpr', label: 'GDPR & privacy' },
				{ path: '/tools', label: 'Tools' }
			]
		}
	];

	const routeGroups: RouteGroup[] = baseRouteGroups.map((group) => ({
		...group,
		routes: group.routes.map((route) => ({
			...route,
			description: getSeo(route.path).description
		}))
	}));

	const prodOrigin = SITE_ORIGIN.replace(/\/$/, '');
	let devOrigin = browser ? window.location.origin.replace(/\/$/, '') : 'http://localhost:5173';

	let copiedKey: string | null = null;
	let copyError = '';
	let searchQuery = '';
	let qrAssets: Record<string, { prod: QrAsset; dev: QrAsset }> = {};

	const qrSize = 160;

	const matchesSearch = (route: RouteSpec, query: string): boolean => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return true;

		return [route.label, route.path, route.description ?? ''].some((value) =>
			value.toLowerCase().includes(normalizedQuery)
		);
	};

	$: filteredRouteGroups = routeGroups
		.map((group) => ({
			...group,
			routes: group.routes.filter((route) => matchesSearch(route, searchQuery))
		}))
		.filter((group) => group.routes.length > 0);

	const touchQrAssets = () => {
		qrAssets = { ...qrAssets };
	};

	const routeId = (path: string): string =>
		path === '/'
			? 'home'
			: path
					.replace(/^\/|\/$/g, '')
					.replace(/[^a-z0-9]+/gi, '-')
					.toLowerCase();

	const prodUrl = (path: string): string => `${prodOrigin}${path}`;
	const devUrl = (path: string): string => `${devOrigin}${path}`;

	const ensureQrAssets = (path: string) => {
		const key = routeId(path);
		if (!qrAssets[key]) {
			qrAssets[key] = { prod: {}, dev: {} };
			touchQrAssets();
		}
		return qrAssets[key];
	};

	const generateQr = async (path: string, value: string, env: 'prod' | 'dev') => {
		if (!browser) return;

		const target = ensureQrAssets(path)[env];
		target.loading = true;
		target.error = undefined;
		touchQrAssets();

		try {
			const pngDataUrl = await QRCode.toDataURL(value, {
				width: qrSize,
				margin: 1,
				errorCorrectionLevel: 'L'
			});
			const svg = await QRCode.toString(value, {
				type: 'svg',
				margin: 1,
				errorCorrectionLevel: 'L'
			});

			target.pngDataUrl = pngDataUrl;
			target.svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
		} catch (error) {
			target.error = 'Unable to generate QR code.';
			console.warn('Unable to generate QR code', { path, env, error });
		} finally {
			target.loading = false;
			touchQrAssets();
		}
	};

	const generateAllQrs = () => {
		for (const group of routeGroups) {
			for (const route of group.routes) {
				generateQr(route.path, prodUrl(route.path), 'prod');
				generateQr(route.path, devUrl(route.path), 'dev');
			}
		}
	};

	const copyText = async (value: string, key: string) => {
		copyError = '';
		if (typeof navigator === 'undefined' || !navigator.clipboard) {
			copyError = 'Clipboard access is unavailable in this browser.';
			return;
		}

		try {
			await navigator.clipboard.writeText(value);
			copiedKey = key;
			setTimeout(() => {
				if (copiedKey === key) copiedKey = null;
			}, 2500);
		} catch (error: unknown) {
			copiedKey = null;
			copyError = error instanceof Error ? error.message : 'Unable to copy.';
		}
	};

	const copyPngToClipboard = async (dataUrl: string | undefined, key: string) => {
		copyError = '';
		if (!dataUrl) {
			copyError = 'QR image is not available yet.';
			return;
		}
		if (
			typeof navigator === 'undefined' ||
			!navigator.clipboard ||
			typeof ClipboardItem === 'undefined'
		) {
			copyError = 'Image clipboard copy is unavailable in this browser.';
			return;
		}

		try {
			const response = await fetch(dataUrl);
			const blob = await response.blob();
			await navigator.clipboard.write([
				new ClipboardItem({
					'image/png': blob
				})
			]);
			copiedKey = key;
			setTimeout(() => {
				if (copiedKey === key) copiedKey = null;
			}, 2500);
		} catch (error: unknown) {
			copiedKey = null;
			copyError =
				error instanceof Error ? error.message : 'Unable to copy the QR image to the clipboard.';
		}
	};

	const makeFileName = (path: string, env: 'prod' | 'dev', extension: 'png' | 'svg'): string =>
		`route-qr-${routeId(path)}-${env}.${extension}`;

	onMount(() => {
		if (typeof window !== 'undefined' && window.location?.origin) {
			devOrigin = window.location.origin.replace(/\/$/, '');
		}
		generateAllQrs();
	});
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/admin/qr"
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<section class="space-y-6">
	<div class="space-y-4">
		<h1 class="mb-6 text-3xl font-bold">Route QR codes</h1>
		<AdminRouteChips />
		<p class="max-w-3xl text-gray-700">
			QR codes for Cambermast’s major public routes. Each card includes the route path, a
			current-host URL for dev or preview use, the production URL, and downloadable PNG/SVG assets.
		</p>
		<div class="max-w-md">
			<label class="mb-2 block text-sm font-medium text-gray-700" for="route-qr-search">
				Filter routes
			</label>
			<input
				id="route-qr-search"
				bind:value={searchQuery}
				type="search"
				placeholder="Search by page name, path, or description"
				class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
			/>
		</div>
		{#if copyError}
			<p class="text-sm text-red-700">{copyError}</p>
		{/if}
	</div>

	{#if filteredRouteGroups.length === 0}
		<section class="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
			<p class="text-sm text-gray-700">No routes match “{searchQuery}”.</p>
		</section>
	{/if}

	{#each filteredRouteGroups as group}
		<section class="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
			<div>
				<h2 class="text-xl font-semibold text-gray-900">{group.title}</h2>
				<p class="mt-1 max-w-3xl text-sm text-gray-600">{group.description}</p>
			</div>

			<div class="mt-5 grid gap-5 xl:grid-cols-2">
				{#each group.routes as route}
					<article class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div class="min-w-0 flex-1">
								<h3 class="text-lg font-semibold text-gray-900">{route.label}</h3>
								<p class="mt-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
									{route.path}
								</p>
								{#if route.description}
									<p class="mt-2 text-sm text-gray-600">{route.description}</p>
								{/if}
							</div>
							<a
								href={prodUrl(route.path)}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
							>
								Open prod
								<span aria-hidden="true">↗</span>
							</a>
						</div>

						<div class="mt-4 space-y-2">
							<div
								class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
							>
								<div class="min-w-0">
									<p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
										Path
									</p>
									<p class="truncate text-sm text-gray-700">{route.path}</p>
								</div>
								<button
									type="button"
									class="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
									on:click={() => copyText(route.path, `path:${route.path}`)}
								>
									{copiedKey === `path:${route.path}` ? 'Copied!' : 'Copy'}
								</button>
							</div>

							<div
								class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
							>
								<div class="min-w-0">
									<p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
										Prod URL
									</p>
									<p class="truncate text-sm text-gray-700">{prodUrl(route.path)}</p>
								</div>
								<button
									type="button"
									class="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
									on:click={() => copyText(prodUrl(route.path), `prod:${route.path}`)}
								>
									{copiedKey === `prod:${route.path}` ? 'Copied!' : 'Copy'}
								</button>
							</div>

							<div
								class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
							>
								<div class="min-w-0">
									<p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
										Dev URL
									</p>
									<p class="truncate text-sm text-gray-700">{devUrl(route.path)}</p>
								</div>
								<button
									type="button"
									class="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
									on:click={() => copyText(devUrl(route.path), `dev:${route.path}`)}
								>
									{copiedKey === `dev:${route.path}` ? 'Copied!' : 'Copy'}
								</button>
							</div>
						</div>

						<div class="mt-5 grid gap-4 md:grid-cols-2">
							<div class="rounded-xl border border-gray-100 bg-white p-4">
								<div class="mb-3 flex items-start justify-between gap-3">
									<div>
										<p class="text-sm font-semibold text-gray-900">Production QR</p>
										<p class="mt-0.5 text-[11px] text-gray-500">PNG {qrSize}x{qrSize} and SVG</p>
									</div>
									<div class="flex flex-wrap gap-2">
										{#if qrAssets[routeId(route.path)]?.prod?.pngDataUrl}
											<button
												type="button"
												class="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
												on:click={() =>
													copyPngToClipboard(
														qrAssets[routeId(route.path)].prod.pngDataUrl,
														`copy:png:prod:${route.path}`
													)}
											>
												{copiedKey === `copy:png:prod:${route.path}` ? 'Copied PNG!' : 'Copy PNG'}
											</button>
										{/if}
										{#if qrAssets[routeId(route.path)]?.prod?.pngDataUrl}
											<a
												class="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
												download={makeFileName(route.path, 'prod', 'png')}
												href={qrAssets[routeId(route.path)].prod.pngDataUrl}
											>
												Save PNG
											</a>
										{/if}
										{#if qrAssets[routeId(route.path)]?.prod?.svgDataUrl}
											<a
												class="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
												download={makeFileName(route.path, 'prod', 'svg')}
												href={qrAssets[routeId(route.path)].prod.svgDataUrl}
											>
												Save SVG
											</a>
										{/if}
									</div>
								</div>

								{#if qrAssets[routeId(route.path)]?.prod?.pngDataUrl}
									<img
										src={qrAssets[routeId(route.path)].prod.pngDataUrl}
										alt={`QR code for production ${route.label}`}
										class="aspect-square w-32 rounded-lg border border-gray-100 bg-white p-1.5 shadow-sm"
										loading="lazy"
									/>
								{:else if qrAssets[routeId(route.path)]?.prod?.error}
									<p class="text-xs text-red-700">{qrAssets[routeId(route.path)].prod.error}</p>
								{:else}
									<p class="text-xs text-gray-500">Generating…</p>
								{/if}
							</div>

							<div class="rounded-xl border border-gray-100 bg-white p-4">
								<div class="mb-3 flex items-start justify-between gap-3">
									<div>
										<p class="text-sm font-semibold text-gray-900">Dev QR</p>
										<p class="mt-0.5 text-[11px] text-gray-500">PNG {qrSize}x{qrSize} and SVG</p>
									</div>
									<div class="flex flex-wrap gap-2">
										{#if qrAssets[routeId(route.path)]?.dev?.pngDataUrl}
											<button
												type="button"
												class="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
												on:click={() =>
													copyPngToClipboard(
														qrAssets[routeId(route.path)].dev.pngDataUrl,
														`copy:png:dev:${route.path}`
													)}
											>
												{copiedKey === `copy:png:dev:${route.path}` ? 'Copied PNG!' : 'Copy PNG'}
											</button>
										{/if}
										{#if qrAssets[routeId(route.path)]?.dev?.pngDataUrl}
											<a
												class="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
												download={makeFileName(route.path, 'dev', 'png')}
												href={qrAssets[routeId(route.path)].dev.pngDataUrl}
											>
												Save PNG
											</a>
										{/if}
										{#if qrAssets[routeId(route.path)]?.dev?.svgDataUrl}
											<a
												class="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
												download={makeFileName(route.path, 'dev', 'svg')}
												href={qrAssets[routeId(route.path)].dev.svgDataUrl}
											>
												Save SVG
											</a>
										{/if}
									</div>
								</div>

								{#if qrAssets[routeId(route.path)]?.dev?.pngDataUrl}
									<img
										src={qrAssets[routeId(route.path)].dev.pngDataUrl}
										alt={`QR code for dev ${route.label}`}
										class="aspect-square w-32 rounded-lg border border-gray-100 bg-white p-1.5 shadow-sm"
										loading="lazy"
									/>
								{:else if qrAssets[routeId(route.path)]?.dev?.error}
									<p class="text-xs text-red-700">{qrAssets[routeId(route.path)].dev.error}</p>
								{:else}
									<p class="text-xs text-gray-500">Generating…</p>
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/each}
</section>
