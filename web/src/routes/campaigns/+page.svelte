<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import { browser } from '$app/environment';
	import campaignsData from '$lib/data/qr-campaigns.json';
	import QRCode from 'qrcode';

	type Campaign = {
		id: string;
		type?: string;
		partner?: string;
		landingPath: string;
		createdAt: string;
		params?: Record<string, string | undefined>;
	};

	const pageTitle = 'Campaigns | Cambermast';
	const pageDescription = 'Internal campaign registry for Cambermast marketing initiatives.';
	const prodOrigin = SITE_ORIGIN.replace(/\/$/, '');
	const devOrigin = browser ? window.location.origin : 'http://localhost:5173';

	const keyOrder = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'src', 'ad'];

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
		return {
			...campaign,
			qrPath,
			qrUrlProd: `${prodOrigin}${qrPath}`,
			qrUrlDev: `${devOrigin}${qrPath}`
		};
	});

	const qrCampaigns = campaigns.filter((campaign) => campaign.type === 'qr');
	const otherCampaigns = campaigns.filter((campaign) => campaign.type !== 'qr');

	const copyToClipboard = async (value: string) => {
		if (!browser) return;
		try {
			await navigator.clipboard.writeText(value);
		} catch (error) {
			console.warn('Unable to copy value', error);
		}
	};

	type QrAsset = {
		pngDataUrl?: string;
		svgDataUrl?: string;
		loading?: boolean;
		error?: string;
	};

	const qrAssets: Record<string, { prod: QrAsset; dev: QrAsset }> = {};
	const qrSize = 512;

	const ensureQrAssets = (campaignId: string) => {
		qrAssets[campaignId] ??= { prod: {}, dev: {} };
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

		try {
			const pngDataUrl = await QRCode.toDataURL(value, {
				width: qrSize,
				margin: 2,
				errorCorrectionLevel: 'M'
			});
			const svg = await QRCode.toString(value, {
				type: 'svg',
				margin: 2,
				errorCorrectionLevel: 'M'
			});
			const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

			target.pngDataUrl = pngDataUrl;
			target.svgDataUrl = svgDataUrl;
		} catch (error) {
			target.error = 'Unable to generate QR code';
			console.warn('Unable to generate QR code', error);
		} finally {
			target.loading = false;
		}
	};
</script>

<SeoHead title={pageTitle} description={pageDescription} path="/campaigns" useDefaultImage={false} />

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<section class="mb-10">
	<div class="mx-auto max-w-4xl text-center">
		<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Campaigns</h1>
		<p class="mt-4 text-lg text-gray-600">
			Internal registry for QR and offline campaigns. Data source:
			<code class="rounded bg-blue-100/70 px-2 py-0.5 text-sm text-blue-900">
				/api/qr-campaigns.json
			</code>
		</p>
	</div>
</section>

<section class="mb-12">
		<div class="mx-auto max-w-5xl rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-sm text-blue-900">
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
		<h2 class="mb-4 text-2xl font-bold text-gray-900">QR campaigns</h2>
		{#if qrCampaigns.length}
			<div class="space-y-6">
				{#each qrCampaigns as campaign}
					<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p class="text-sm uppercase tracking-wide text-gray-500">ID</p>
								<p class="text-lg font-semibold text-gray-900">{campaign.id}</p>
							</div>
							<span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
								QR
							</span>
						</div>
						<div class="mt-4 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
							<div>
								<p class="font-semibold text-gray-900">Details</p>
								<ul class="mt-2 space-y-1">
									<li>Partner: {campaign.partner ?? '—'}</li>
									<li>Landing path: {campaign.landingPath}</li>
									<li>Created: {campaign.createdAt}</li>
								</ul>
							</div>
							<div>
								<p class="font-semibold text-gray-900">Query params</p>
								{#if campaign.params}
									<ul class="mt-2 space-y-1 font-mono text-xs">
										{#each Object.entries(campaign.params) as [key, value]}
											<li>{key}={value}</li>
										{/each}
									</ul>
								{:else}
									<p class="mt-2 text-gray-500">None</p>
								{/if}
							</div>
						</div>
						<div class="mt-4 space-y-2 text-sm text-gray-700">
							<p>
								QR path:
								<code class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
									{campaign.qrPath}
								</code>
								<button
									type="button"
									class="ml-2 inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
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
							</p>
							<p>
								Dev URL:
								<code class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
									{campaign.qrUrlDev}
								</code>
								<button
									type="button"
									class="ml-2 inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
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
							</p>
							<p>
								Prod URL:
								<code class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
									{campaign.qrUrlProd}
								</code>
								<button
									type="button"
									class="ml-2 inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
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
							</p>
						</div>

						<div class="mt-6 border-t pt-5">
							<p class="text-sm font-semibold text-gray-900">Download QR code</p>
							<p class="mt-1 text-xs text-gray-600">
								Generates locally in your browser. Use prod for printing; dev is for quick local tests.
							</p>

							<div class="mt-4 grid gap-5 md:grid-cols-2">
								<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
									<div class="flex items-center justify-between gap-3">
										<p class="text-sm font-semibold text-gray-900">Prod</p>
										<button
											type="button"
											class="inline-flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
											on:click={() => generateQr(campaign.id, campaign.qrUrlProd, 'prod')}
										>
											Generate
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
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
												<polyline points="7 10 12 15 17 10" />
												<line x1="12" y1="15" x2="12" y2="3" />
											</svg>
										</button>
									</div>

									{#if qrAssets[campaign.id]?.prod?.error}
										<p class="mt-2 text-xs text-red-600">{qrAssets[campaign.id].prod.error}</p>
									{/if}

									{#if qrAssets[campaign.id]?.prod?.pngDataUrl}
										<div class="mt-4 flex flex-col gap-3">
											<img
												src={qrAssets[campaign.id].prod.pngDataUrl}
												alt={`QR code (prod) for ${campaign.id}`}
												class="w-40 rounded bg-white p-2"
												loading="lazy"
											/>
											<div class="flex flex-wrap gap-2">
												<a
													class="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
													download={makeFileName(campaign.id, 'prod', 'png')}
													href={qrAssets[campaign.id].prod.pngDataUrl}
												>
													PNG
												</a>
												{#if qrAssets[campaign.id]?.prod?.svgDataUrl}
													<a
														class="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
														download={makeFileName(campaign.id, 'prod', 'svg')}
														href={qrAssets[campaign.id].prod.svgDataUrl}
													>
														SVG
													</a>
												{/if}
											</div>
										</div>
									{:else if qrAssets[campaign.id]?.prod?.loading}
										<p class="mt-3 text-xs text-gray-600">Generating…</p>
									{/if}
								</div>

								<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
									<div class="flex items-center justify-between gap-3">
										<p class="text-sm font-semibold text-gray-900">Dev</p>
										<button
											type="button"
											class="inline-flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
											on:click={() => generateQr(campaign.id, campaign.qrUrlDev, 'dev')}
										>
											Generate
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
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
												<polyline points="7 10 12 15 17 10" />
												<line x1="12" y1="15" x2="12" y2="3" />
											</svg>
										</button>
									</div>

									{#if qrAssets[campaign.id]?.dev?.error}
										<p class="mt-2 text-xs text-red-600">{qrAssets[campaign.id].dev.error}</p>
									{/if}

									{#if qrAssets[campaign.id]?.dev?.pngDataUrl}
										<div class="mt-4 flex flex-col gap-3">
											<img
												src={qrAssets[campaign.id].dev.pngDataUrl}
												alt={`QR code (dev) for ${campaign.id}`}
												class="w-40 rounded bg-white p-2"
												loading="lazy"
											/>
											<div class="flex flex-wrap gap-2">
												<a
													class="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
													download={makeFileName(campaign.id, 'dev', 'png')}
													href={qrAssets[campaign.id].dev.pngDataUrl}
												>
													PNG
												</a>
												{#if qrAssets[campaign.id]?.dev?.svgDataUrl}
													<a
														class="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
														download={makeFileName(campaign.id, 'dev', 'svg')}
														href={qrAssets[campaign.id].dev.svgDataUrl}
													>
														SVG
													</a>
												{/if}
											</div>
										</div>
									{:else if qrAssets[campaign.id]?.dev?.loading}
										<p class="mt-3 text-xs text-gray-600">Generating…</p>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
				No QR campaigns yet.
			</div>
		{/if}
	</div>
</section>

<section class="mb-12">
	<div class="mx-auto max-w-5xl">
		<h2 class="mb-4 text-2xl font-bold text-gray-900">Other campaigns</h2>
		{#if otherCampaigns.length}
			<div class="space-y-6">
				{#each otherCampaigns as campaign}
					<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<p class="text-sm uppercase tracking-wide text-gray-500">ID</p>
						<p class="text-lg font-semibold text-gray-900">{campaign.id}</p>
						<div class="mt-3 text-sm text-gray-700">
							<p>Type: {campaign.type ?? 'general'}</p>
							<p>Landing path: {campaign.landingPath}</p>
							<p>Created: {campaign.createdAt}</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
				No other campaigns yet.
			</div>
		{/if}
	</div>
</section>
