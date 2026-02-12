<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import { browser } from '$app/environment';
	import campaignsData from '$lib/data/campaigns.json';
	import QRCode from 'qrcode';

	type Campaign = {
		id: string;
		partner?: string;
		partnerLabel?: string;
		landingPath: string;
		description?: string;
		createdAt: string;
		params?: Record<string, string | undefined>;
	};

	const pageTitle = 'Campaigns | Cambermast';
	const pageDescription = 'Internal campaign registry for Cambermast marketing initiatives.';
	const prodOrigin = SITE_ORIGIN.replace(/\/$/, '');
	const devOrigin = browser ? window.location.origin : 'http://localhost:5173';

	const keyOrder = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'src', 'ad'];

	const titleCaseKebab = (value: string) =>
		value
			.split('-')
			.filter(Boolean)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');

	const toQueryString = (params: Record<string, string | undefined> | undefined): string => {
		if (!params) return '';
		const search = new URLSearchParams();

		for (const key of keyOrder) {
			const value = params[key];
			if (typeof value === 'string' && value.length > 0) {
				search.set(key, value);
			}
		}

		for (const [key, value] of Object.entries(params)) {
			if (keyOrder.includes(key)) continue;
			if (typeof value === 'string' && value.length > 0) {
				search.set(key, value);
			}
		}

		return search.toString();
	};

	const campaigns = (campaignsData.campaigns as Campaign[]).map((campaign) => {
		const query = toQueryString(campaign.params);
		const qrPath = query ? `${campaign.landingPath}?${query}` : campaign.landingPath;
		const shortPath = `/c/${campaign.id}`;
		return {
			...campaign,
			shortPath,
			qrPath,
			qrUrlProd: `${prodOrigin}${qrPath}`,
			qrUrlDev: `${devOrigin}${qrPath}`,
			shortUrlProd: `${prodOrigin}${shortPath}`,
			shortUrlDev: `${devOrigin}${shortPath}`
		};
	});

	const campaignEntries = campaigns;

	let copiedKey = '';

	const setCopied = (key: string) => {
		copiedKey = key;
		setTimeout(() => {
			if (copiedKey === key) copiedKey = '';
		}, 1200);
	};

	const copyToClipboard = async (value: string) => {
		if (!browser) return;
		try {
			await navigator.clipboard.writeText(value);
			setCopied('text');
		} catch (error) {
			console.warn('Unable to copy value', error);
		}
	};

	const copyPngToClipboard = async (dataUrl: string | undefined, key: string) => {
		if (!browser || !dataUrl) return;
		try {
			const response = await fetch(dataUrl);
			const blob = await response.blob();
			const item = new ClipboardItem({ [blob.type]: blob });
			await navigator.clipboard.write([item]);
			setCopied(key);
		} catch (error) {
			console.warn('Unable to copy PNG to clipboard', error);
		}
	};

	type QrAsset = {
		pngDataUrl?: string;
		svgDataUrl?: string;
		loading?: boolean;
		error?: string;
	};

	let qrAssets: Record<string, { prod: QrAsset; dev: QrAsset }> = {};
	const qrSize = 512;

	const touchQrAssets = () => {
		qrAssets = { ...qrAssets };
	};

	const ensureQrAssets = (campaignId: string) => {
		if (!qrAssets[campaignId]) {
			qrAssets[campaignId] = { prod: {}, dev: {} };
			touchQrAssets();
		}
		return qrAssets[campaignId];
	};

	const makeFileName = (campaignId: string, env: 'prod' | 'dev', ext: 'png' | 'svg') =>
		`${campaignId}-${env}.${ext}`;

	const generateQr = async (campaignId: string, value: string, env: 'prod' | 'dev') => {
		if (!browser) return;

		const assets = ensureQrAssets(campaignId);
		const target = assets[env];
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
			const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

			target.pngDataUrl = pngDataUrl;
			target.svgDataUrl = svgDataUrl;
		} catch (error) {
			target.error = 'Unable to generate QR code';
			console.warn('Unable to generate QR code', error);
		} finally {
			target.loading = false;
			touchQrAssets();
		}
	};
</script>

<SeoHead
	title={pageTitle}
	description={pageDescription}
	path="/campaigns"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<section class="mb-10">
	<div class="mx-auto max-w-4xl text-center">
		<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Campaigns</h1>
		<p class="mt-4 text-lg text-gray-600">
			Internal registry for campaign links and QR assets. Data source:
			<code class="rounded bg-blue-100/70 px-2 py-0.5 text-sm text-blue-900">
				web/src/lib/data/campaigns.json
			</code>
		</p>
	</div>
</section>

<section class="mb-12">
	<div
		class="mx-auto max-w-5xl rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-sm text-blue-900"
	>
		<p class="font-semibold">Testing base URLs</p>
		<p class="mt-2">
			Dev:
			<code class="rounded bg-blue-100/70 px-2 py-0.5 text-xs text-blue-900">
				{devOrigin}
			</code>
			<button
				type="button"
				class="ml-2 inline-flex items-center rounded border border-blue-200 bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 transition hover:border-blue-300 hover:text-blue-900"
				aria-label="Copy dev base URL"
				on:click={() => copyToClipboard(devOrigin)}
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					class="h-3.5 w-3.5"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
			</button>
		</p>
		<p class="mt-1">
			Prod:
			<code class="rounded bg-blue-100/70 px-2 py-0.5 text-xs text-blue-900">
				{prodOrigin}
			</code>
			<button
				type="button"
				class="ml-2 inline-flex items-center rounded border border-blue-200 bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 transition hover:border-blue-300 hover:text-blue-900"
				aria-label="Copy production base URL"
				on:click={() => copyToClipboard(prodOrigin)}
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					class="h-3.5 w-3.5"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
			</button>
		</p>
	</div>
</section>

<section class="mb-12">
	<div class="mx-auto max-w-5xl">
		<h2 class="mb-4 text-2xl font-bold text-gray-900">Campaigns</h2>
		{#if campaignEntries.length}
			<div class="space-y-6">
				{#each campaignEntries as campaign}
					<article class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<div class="flex flex-wrap items-start justify-between gap-4">
							<div>
								<p class="text-xs tracking-wide text-gray-500 uppercase">ID</p>
								<p class="text-lg font-semibold text-gray-900">{campaign.id}</p>
								{#if campaign.partner}
									<p class="mt-1 text-sm text-gray-700">
										<span class="font-semibold">Partner</span>:
										{campaign.partnerLabel ?? campaign.partner}
										{#if campaign.partnerLabel && campaign.partnerLabel !== campaign.partner}
											<span class="text-gray-500">({campaign.partner})</span>
										{/if}
									</p>
								{/if}
								{#if campaign.description}
									<p class="mt-1 text-sm text-gray-600">{campaign.description}</p>
								{/if}
								<div class="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
									{#if campaign.partner}
										<a
											href={`/campaigns/partners/${campaign.partner}`}
											class="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700 transition hover:bg-blue-100"
										>
											Partner: {campaign.partner}
										</a>
									{:else}
										<span class="rounded-full bg-gray-100 px-2 py-1">Partner: —</span>
									{/if}
									<span class="rounded-full bg-gray-100 px-2 py-1">
										Landing: {campaign.landingPath}
									</span>
									<span class="rounded-full bg-gray-100 px-2 py-1"
										>Created: {campaign.createdAt}</span
									>
								</div>
							</div>
							<span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
								QR
							</span>
						</div>

						<div class="mt-5 grid gap-5">
							<div class="space-y-3">
								<div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
									<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
										Primary URLs
									</p>
									<div class="mt-3 grid gap-2 text-sm text-gray-700">
										<div class="grid items-center gap-3 sm:grid-cols-[200px_minmax(0,1fr)_auto]">
											<span class="text-xs font-semibold text-gray-500">Short URL (prod)</span>
											<code class="truncate rounded bg-white px-2 py-0.5 text-xs text-gray-800">
												{campaign.shortUrlProd}
											</code>
											<button
												type="button"
												class="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
												aria-label={`Copy short URL for ${campaign.id}`}
												on:click={() => copyToClipboard(campaign.shortUrlProd)}
											>
												<svg
													aria-hidden="true"
													viewBox="0 0 24 24"
													class="h-3.5 w-3.5"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
												</svg>
											</button>
										</div>
										<div class="grid items-center gap-3 sm:grid-cols-[200px_minmax(0,1fr)_auto]">
											<span class="text-xs font-semibold text-gray-500">Encoded URL (QR)</span>
											<code class="truncate rounded bg-white px-2 py-0.5 text-xs text-gray-800">
												{campaign.shortUrlProd}
											</code>
											<button
												type="button"
												class="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
												aria-label={`Copy encoded URL for ${campaign.id}`}
												on:click={() => copyToClipboard(campaign.shortUrlProd)}
											>
												<svg
													aria-hidden="true"
													viewBox="0 0 24 24"
													class="h-3.5 w-3.5"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
												</svg>
											</button>
										</div>
										<div class="grid items-center gap-3 sm:grid-cols-[200px_minmax(0,1fr)_auto]">
											<span class="text-xs font-semibold text-gray-500">Encoded URL (QR) – Dev</span
											>
											<code class="truncate rounded bg-white px-2 py-0.5 text-xs text-gray-800">
												{campaign.shortUrlDev}
											</code>
											<button
												type="button"
												class="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
												aria-label={`Copy encoded dev URL for ${campaign.id}`}
												on:click={() => copyToClipboard(campaign.shortUrlDev)}
											>
												<svg
													aria-hidden="true"
													viewBox="0 0 24 24"
													class="h-3.5 w-3.5"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
												</svg>
											</button>
										</div>
									</div>
								</div>

								<details class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
									<summary
										class="cursor-pointer text-xs font-semibold tracking-wide text-gray-500 uppercase"
									>
										Advanced details
									</summary>
									<div class="mt-3 grid gap-3 text-xs text-gray-700 md:grid-cols-2">
										<div>
											<p class="font-semibold text-gray-900">QR + tracking URLs</p>
											<div class="mt-2 space-y-2">
												<div class="space-y-1">
													<span class="text-[11px] text-gray-500">QR path</span>
													<div class="flex items-center gap-2">
														<code
															class="rounded bg-white px-2 py-1 text-[11px] break-all text-gray-800"
														>
															{campaign.qrPath}
														</code>
														<button
															type="button"
															class="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
															aria-label={`Copy QR path for ${campaign.id}`}
															on:click={() => copyToClipboard(campaign.qrPath)}
														>
															<svg
																aria-hidden="true"
																viewBox="0 0 24 24"
																class="h-3.5 w-3.5"
																fill="none"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															>
																<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
																<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
															</svg>
														</button>
													</div>
												</div>
												<div class="space-y-1">
													<span class="text-[11px] text-gray-500">Dev URL</span>
													<div class="flex items-center gap-2">
														<code
															class="rounded bg-white px-2 py-1 text-[11px] break-all text-gray-800"
														>
															{campaign.qrUrlDev}
														</code>
														<button
															type="button"
															class="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
															aria-label={`Copy dev URL for ${campaign.id}`}
															on:click={() => copyToClipboard(campaign.qrUrlDev)}
														>
															<svg
																aria-hidden="true"
																viewBox="0 0 24 24"
																class="h-3.5 w-3.5"
																fill="none"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															>
																<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
																<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
															</svg>
														</button>
													</div>
												</div>
												<div class="space-y-1">
													<span class="text-[11px] text-gray-500">Prod URL</span>
													<div class="flex items-center gap-2">
														<code
															class="rounded bg-white px-2 py-1 text-[11px] break-all text-gray-800"
														>
															{campaign.qrUrlProd}
														</code>
														<button
															type="button"
															class="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
															aria-label={`Copy prod URL for ${campaign.id}`}
															on:click={() => copyToClipboard(campaign.qrUrlProd)}
														>
															<svg
																aria-hidden="true"
																viewBox="0 0 24 24"
																class="h-3.5 w-3.5"
																fill="none"
																stroke="currentColor"
																stroke-width="2"
																stroke-linecap="round"
																stroke-linejoin="round"
															>
																<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
																<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
															</svg>
														</button>
													</div>
												</div>
											</div>
										</div>
										<div>
											<p class="font-semibold text-gray-900">Query params</p>
											{#if campaign.params}
												<ul
													class="mt-2 grid grid-cols-1 gap-1 font-mono text-[11px] text-gray-700 sm:grid-cols-2"
												>
													{#each Object.entries(campaign.params) as [key, value]}
														<li class="break-all">{key}={value}</li>
													{/each}
												</ul>
											{:else}
												<p class="mt-2 text-gray-500">None</p>
											{/if}
										</div>
									</div>
								</details>
							</div>

							<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
								<div class="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
											QR generator
										</p>
										<p class="mt-1 text-xs text-gray-600">
											Generate printable codes for prod and dev.
										</p>
									</div>
									<div class="flex flex-wrap gap-2">
										<button
											type="button"
											class="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
											on:click={() => generateQr(campaign.id, campaign.shortUrlProd, 'prod')}
										>
											Generate prod
										</button>
										<button
											type="button"
											class="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
											on:click={() => generateQr(campaign.id, campaign.shortUrlDev, 'dev')}
										>
											Generate dev
										</button>
									</div>
								</div>

								<div class="mt-4 grid gap-4 md:grid-cols-2">
									<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
										<p class="text-xs font-semibold text-gray-700">Prod QR</p>
										{#if qrAssets[campaign.id]?.prod?.pngDataUrl}
											<div class="mt-3 flex flex-wrap items-start gap-4">
												<img
													src={qrAssets[campaign.id].prod.pngDataUrl}
													alt={`QR code (prod) for ${campaign.id}`}
													class="h-24 w-24 rounded bg-white p-1"
													loading="lazy"
												/>
												<div class="space-y-3 text-xs text-gray-600">
													<div>
														<p class="font-semibold text-gray-800">PNG ({qrSize}×{qrSize})</p>
														<p>
															Raster image for quick printing, slide decks, and email. Best for
															fixed-size outputs.
														</p>
														<div class="mt-2 grid grid-cols-2 gap-2">
															<a
																class="inline-flex min-w-[140px] items-center justify-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
																download={makeFileName(campaign.id, 'prod', 'png')}
																href={qrAssets[campaign.id].prod.pngDataUrl}
															>
																Download PNG
															</a>
															<button
																type="button"
																class="inline-flex min-w-[140px] items-center justify-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
																aria-label={`Copy PNG data URL for ${campaign.id}`}
																on:click={() =>
																	copyPngToClipboard(
																		qrAssets[campaign.id].prod.pngDataUrl,
																		`png:prod:${campaign.id}`
																	)}
															>
																{#if copiedKey === `png:prod:${campaign.id}`}
																	<span class="inline-flex items-center gap-1">
																		<svg
																			aria-hidden="true"
																			viewBox="0 0 24 24"
																			class="h-4 w-4"
																			fill="none"
																			stroke="currentColor"
																			stroke-width="2"
																			stroke-linecap="round"
																			stroke-linejoin="round"
																		>
																			<polyline points="20 6 9 17 4 12" />
																		</svg>
																		Copied
																	</span>
																{:else}
																	<span class="inline-flex items-center gap-1">
																		<svg
																			aria-hidden="true"
																			viewBox="0 0 24 24"
																			class="h-4 w-4"
																			fill="none"
																			stroke="currentColor"
																			stroke-width="2"
																			stroke-linecap="round"
																			stroke-linejoin="round"
																		>
																			<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
																			<path
																				d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
																			/>
																		</svg>
																		Copy PNG
																	</span>
																{/if}
															</button>
														</div>
													</div>
													{#if qrAssets[campaign.id]?.prod?.svgDataUrl}
														<div>
															<p class="font-semibold text-gray-800">SVG (scalable)</p>
															<p>
																Vector file for large-format print or design tools. Scales cleanly
																without blurring.
															</p>
															<div class="mt-2 grid grid-cols-2 gap-2">
																<a
																	class="inline-flex min-w-[140px] items-center justify-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
																	download={makeFileName(campaign.id, 'prod', 'svg')}
																	href={qrAssets[campaign.id].prod.svgDataUrl}
																>
																	Download SVG
																</a>
																<span class="hidden min-w-[140px] sm:inline-flex" aria-hidden="true"
																></span>
															</div>
														</div>
													{/if}
												</div>
											</div>
										{:else if qrAssets[campaign.id]?.prod?.loading}
											<p class="mt-2 text-xs text-gray-500">Generating…</p>
										{:else}
											<p class="mt-2 text-xs text-gray-500">
												Click “Generate prod” to create files.
											</p>
										{/if}
									</div>

									<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
										<p class="text-xs font-semibold text-gray-700">Dev QR</p>
										{#if qrAssets[campaign.id]?.dev?.pngDataUrl}
											<div class="mt-3 flex flex-wrap items-start gap-4">
												<img
													src={qrAssets[campaign.id].dev.pngDataUrl}
													alt={`QR code (dev) for ${campaign.id}`}
													class="h-24 w-24 rounded bg-white p-1"
													loading="lazy"
												/>
												<div class="space-y-3 text-xs text-gray-600">
													<div>
														<p class="font-semibold text-gray-800">PNG ({qrSize}×{qrSize})</p>
														<p>Raster image for local testing or drafts. Matches the prod size.</p>
														<div class="mt-2 grid grid-cols-2 gap-2">
															<a
																class="inline-flex min-w-[140px] items-center justify-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
																download={makeFileName(campaign.id, 'dev', 'png')}
																href={qrAssets[campaign.id].dev.pngDataUrl}
															>
																Download PNG
															</a>
															<button
																type="button"
																class="inline-flex min-w-[140px] items-center justify-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
																aria-label={`Copy PNG data URL for ${campaign.id} (dev)`}
																on:click={() =>
																	copyPngToClipboard(
																		qrAssets[campaign.id].dev.pngDataUrl,
																		`png:dev:${campaign.id}`
																	)}
															>
																{#if copiedKey === `png:dev:${campaign.id}`}
																	<span class="inline-flex items-center gap-1">
																		<svg
																			aria-hidden="true"
																			viewBox="0 0 24 24"
																			class="h-4 w-4"
																			fill="none"
																			stroke="currentColor"
																			stroke-width="2"
																			stroke-linecap="round"
																			stroke-linejoin="round"
																		>
																			<polyline points="20 6 9 17 4 12" />
																		</svg>
																		Copied
																	</span>
																{:else}
																	<span class="inline-flex items-center gap-1">
																		<svg
																			aria-hidden="true"
																			viewBox="0 0 24 24"
																			class="h-4 w-4"
																			fill="none"
																			stroke="currentColor"
																			stroke-width="2"
																			stroke-linecap="round"
																			stroke-linejoin="round"
																		>
																			<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
																			<path
																				d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
																			/>
																		</svg>
																		Copy PNG
																	</span>
																{/if}
															</button>
														</div>
													</div>
													{#if qrAssets[campaign.id]?.dev?.svgDataUrl}
														<div>
															<p class="font-semibold text-gray-800">SVG (scalable)</p>
															<p>
																Vector file for previews and layout checks. Scales without
																pixelation.
															</p>
															<div class="mt-2 grid grid-cols-2 gap-2">
																<a
																	class="inline-flex min-w-[140px] items-center justify-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
																	download={makeFileName(campaign.id, 'dev', 'svg')}
																	href={qrAssets[campaign.id].dev.svgDataUrl}
																>
																	Download SVG
																</a>
																<span class="hidden min-w-[140px] sm:inline-flex" aria-hidden="true"
																></span>
															</div>
														</div>
													{/if}
												</div>
											</div>
										{:else if qrAssets[campaign.id]?.dev?.loading}
											<p class="mt-2 text-xs text-gray-500">Generating…</p>
										{:else}
											<p class="mt-2 text-xs text-gray-500">
												Click “Generate dev” to create files.
											</p>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
				No campaigns yet.
			</div>
		{/if}
	</div>
</section>
