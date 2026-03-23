<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import { listCampaignUi } from '$lib/view-models/campaigns';

	type QrAsset = {
		pngDataUrl?: string;
		svgDataUrl?: string;
		loading?: boolean;
		error?: string;
	};

	const pageTitle = 'Partner Campaigns | Cambermast';
	const pageDescription = 'Partner-ready production links and QR assets.';
	const prodOrigin = SITE_ORIGIN.replace(/\/$/, '');
	const qrSize = 512;

	const campaigns = listCampaignUi(prodOrigin).map((campaign) => ({
		...campaign,
		shortUrlProd: campaign.shortUrl
	}));

	let copiedKey = '';
	let qrAssets: Record<string, QrAsset> = {};

	const setCopied = (key: string) => {
		copiedKey = key;
		setTimeout(() => {
			if (copiedKey === key) copiedKey = '';
		}, 1200);
	};

	const copyToClipboard = async (value: string, key: string) => {
		if (!browser) return;
		try {
			await navigator.clipboard.writeText(value);
			setCopied(key);
		} catch (error) {
			console.warn('Unable to copy value', error);
		}
	};

	const touchQrAssets = () => {
		qrAssets = { ...qrAssets };
	};

	const ensureQrAssets = (campaignId: string) => {
		if (!qrAssets[campaignId]) {
			qrAssets[campaignId] = {};
			touchQrAssets();
		}
		return qrAssets[campaignId];
	};

	const makeFileName = (campaignId: string, ext: 'png' | 'svg') => `${campaignId}-prod.${ext}`;

	const generateQr = async (campaignId: string, value: string) => {
		if (!browser) return;

		const target = ensureQrAssets(campaignId);
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

	onMount(() => {
		if (!browser) return;
		campaigns.forEach((campaign) => {
			void generateQr(campaign.id, campaign.shortUrlProd);
		});
	});
</script>

<SeoHead
	title={pageTitle}
	description={pageDescription}
	path="/admin/campaigns/partners"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<section class="mb-10">
	<div>
		<h1 class="mb-6 text-3xl font-bold">Campaign assets</h1>
		<AdminRouteChips />
		<p class="max-w-3xl text-gray-700">Share-ready production links and printable QR files.</p>
	</div>
</section>

<section class="mb-12">
	<div class="mx-auto max-w-5xl">
		{#if campaigns.length}
			<div class="space-y-6">
				{#each campaigns as campaign}
					<article class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<div class="flex flex-wrap items-start justify-between gap-4">
							<div>
								<p class="text-xs tracking-wide text-gray-500 uppercase">Campaign</p>
								<p class="text-lg font-semibold text-gray-900">
									{campaign.partnerLabel ?? campaign.partner ?? 'Partner'} — {campaign.id}
								</p>
								{#if campaign.description}
									<p class="mt-1 text-sm text-gray-600">{campaign.description}</p>
								{/if}
								<p class="mt-2 text-xs text-gray-500">Landing: {campaign.landingPath}</p>
							</div>
							<span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
								Production
							</span>
						</div>

						<div class="mt-5 grid gap-5">
							<div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
								<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
									Production link
								</p>
								<div class="mt-3 grid items-center gap-3 sm:grid-cols-[140px_minmax(0,1fr)_auto]">
									<span class="text-xs font-semibold text-gray-500">URL</span>
									<code class="truncate rounded bg-white px-2 py-0.5 text-xs text-gray-800">
										{campaign.shortUrlProd}
									</code>
									<button
										type="button"
										class="inline-flex items-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
										aria-label={`Copy production URL for ${campaign.id}`}
										on:click={() => copyToClipboard(campaign.shortUrlProd, `link:${campaign.id}`)}
									>
										{#if copiedKey === `link:${campaign.id}`}
											<span class="inline-flex items-center gap-1">
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
													<polyline points="20 6 9 17 4 12" />
												</svg>
												Copied
											</span>
										{:else}
											<span class="inline-flex items-center gap-1">
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
												Copy link
											</span>
										{/if}
									</button>
								</div>
							</div>

							<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
								<div class="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
											QR code
										</p>
										<p class="mt-1 text-xs text-gray-600">Printable QR files for this campaign.</p>
									</div>
								</div>

								<div class="mt-4">
									{#if qrAssets[campaign.id]?.pngDataUrl}
										<div class="flex flex-wrap items-start gap-5">
											<img
												src={qrAssets[campaign.id].pngDataUrl}
												alt={`QR code for ${campaign.id}`}
												class="h-28 w-28 rounded bg-white p-1"
												loading="lazy"
											/>
											<div class="space-y-3 text-xs text-gray-600">
												<div>
													<p class="font-semibold text-gray-800">PNG ({qrSize}×{qrSize})</p>
													<div class="mt-2">
														<a
															class="inline-flex min-w-[140px] items-center justify-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
															download={makeFileName(campaign.id, 'png')}
															href={qrAssets[campaign.id].pngDataUrl}
														>
															Download PNG
														</a>
													</div>
												</div>
												{#if qrAssets[campaign.id]?.svgDataUrl}
													<div>
														<p class="font-semibold text-gray-800">SVG (scalable)</p>
														<div class="mt-2">
															<a
																class="inline-flex min-w-[140px] items-center justify-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
																download={makeFileName(campaign.id, 'svg')}
																href={qrAssets[campaign.id].svgDataUrl}
															>
																Download SVG
															</a>
														</div>
													</div>
												{/if}
											</div>
										</div>
									{:else if qrAssets[campaign.id]?.loading}
										<p class="mt-2 text-xs text-gray-500">Generating…</p>
									{:else}
										<p class="mt-2 text-xs text-gray-500">Generating…</p>
									{/if}
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
