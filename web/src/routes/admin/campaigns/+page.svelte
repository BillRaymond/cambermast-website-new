<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';
	import QRCode from 'qrcode';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import { listCampaignUi } from '$lib/view-models/campaigns';
	import { listEventUi } from '$lib/view-models/events';

	type CampaignCategory = 'event' | 'landing';

	type QrAsset = {
		pngDataUrl?: string;
		svgDataUrl?: string;
		loading?: boolean;
		error?: string;
	};

	const pageTitle = 'Campaigns | Cambermast';
	const pageDescription = 'Internal campaign registry for Cambermast marketing initiatives.';
	const prodOrigin = SITE_ORIGIN.replace(/\/$/, '');
	let devOrigin = 'http://localhost:5173';

	const titleCaseKebab = (value: string) =>
		value
			.split('-')
			.filter(Boolean)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');

	const now = new Date();
	const events = listEventUi({ includeDrafts: true, includeUnlisted: true });
	const eventsByCampaignId = new Map(events.map((event) => [event.campaignId, event]));

	type EventView = (typeof events)[number];

	type CampaignView = ReturnType<typeof listCampaignUi>[number] & {
		category: CampaignCategory;
		displayTitle: string;
		event?: EventView;
		isArchived: boolean;
		shortUrlProd: string;
		trackingUrlProd: string;
	};

	const isEventArchived = (event: EventView): boolean => {
		if (event.lifecycleStatus === 'canceled' || event.lifecycleStatus === 'completed') return true;
		if (event.registrationStatus === 'closed') return true;
		const endAt = event.endAtUtc ? new Date(event.endAtUtc).valueOf() : Number.NaN;
		if (!Number.isNaN(endAt) && endAt < now.valueOf()) return true;
		return false;
	};

	const toCampaignView = (campaign: ReturnType<typeof listCampaignUi>[number]): CampaignView => {
		const category: CampaignCategory = campaign.landingPath.startsWith('/events/')
			? 'event'
			: 'landing';
		const event = eventsByCampaignId.get(campaign.id);
		const isArchived = Boolean(campaign.archived) || (event ? isEventArchived(event) : false);
		const displayTitle = event?.title ?? titleCaseKebab(campaign.id);

		return {
			...campaign,
			category,
			displayTitle,
			event,
			isArchived,
			shortUrlProd: campaign.shortUrl,
			trackingUrlProd: campaign.trackingUrl
		};
	};

	const baseCampaigns = listCampaignUi(prodOrigin);

	let filter: 'all' | 'events' | 'landing' = 'all';
	let copiedKey = '';
	let qrAssets: Record<string, { prod: QrAsset; dev: QrAsset }> = {};

	const qrSize = 512;

	$: campaigns = baseCampaigns.map(toCampaignView);

	$: filteredCampaigns = campaigns.filter((campaign) => {
		if (filter === 'events') return campaign.category === 'event';
		if (filter === 'landing') return campaign.category === 'landing';
		return true;
	});
	$: activeCampaigns = filteredCampaigns.filter((campaign) => !campaign.isArchived);
	$: archivedCampaigns = filteredCampaigns.filter((campaign) => campaign.isArchived);

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

	const generateQrIfMissing = async (campaignId: string, value: string, env: 'prod' | 'dev') => {
		const assets = ensureQrAssets(campaignId);
		const target = assets[env];
		if (target.loading) return;
		if (typeof target.pngDataUrl === 'string' && target.pngDataUrl.length > 0) return;
		await generateQr(campaignId, value, env);
	};

	const preGenerateActiveQrs = async () => {
		for (const campaign of campaigns) {
			if (campaign.isArchived) continue;
			void generateQrIfMissing(campaign.id, campaign.shortUrlProd, 'prod');
			void generateQrIfMissing(campaign.id, `${devOrigin}${campaign.shortPath}`, 'dev');
		}
	};

	onMount(() => {
		if (!browser) return;
		devOrigin = window.location.origin;
		void tick().then(() => preGenerateActiveQrs());
	});

	const iconClass = (key: string): string =>
		`inline-flex items-center rounded border px-2 py-1 text-[11px] font-semibold transition ${
			copiedKey === key
				? 'border-emerald-200 bg-emerald-50 text-emerald-800'
				: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800'
		} ${copiedKey === key ? 'scale-[1.02]' : 'scale-100'} motion-safe:transition-transform`;

	let qrActionWidths: Record<string, number> = {};

	const trackQrActionWidth = (node: HTMLElement, key: string) => {
		const update = () => {
			qrActionWidths = { ...qrActionWidths, [key]: node.offsetWidth };
		};

		update();
		if (!browser || typeof ResizeObserver === 'undefined') return {};

		const observer = new ResizeObserver(update);
		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	};
</script>

<SeoHead
	title={pageTitle}
	description={pageDescription}
	path="/admin/campaigns"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<section class="mb-10">
	<div>
		<h1 class="mb-6 text-3xl font-bold">Campaigns</h1>
		<AdminRouteChips />
		<p class="max-w-3xl text-gray-700">
			Internal campaign registry. Data source:
			<code class="rounded bg-blue-100/70 px-2 py-0.5 text-sm text-blue-900"
				>/api/campaigns.json</code
			>
		</p>
	</div>
</section>

<section class="mb-10">
	<div
		class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
	>
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
					filter === 'all'
						? 'bg-blue-600 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
				}`}
				on:click={() => (filter = 'all')}
			>
				All
			</button>
			<button
				type="button"
				class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
					filter === 'events'
						? 'bg-blue-600 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
				}`}
				on:click={() => (filter = 'events')}
			>
				Events
			</button>
			<button
				type="button"
				class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
					filter === 'landing'
						? 'bg-blue-600 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
				}`}
				on:click={() => (filter = 'landing')}
			>
				Landing pages
			</button>
		</div>

		<div class="text-xs text-gray-600">
			<span class="font-semibold">{activeCampaigns.length}</span> active •
			<span class="font-semibold">{archivedCampaigns.length}</span> archived
		</div>
	</div>
</section>

<section class="mb-12">
	<div
		class="mx-auto max-w-5xl rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-sm text-blue-900"
	>
		<p class="font-semibold">Testing base URLs</p>
		<div class="mt-2 space-y-1">
			<p>
				Dev:
				<code class="rounded bg-blue-100/70 px-2 py-0.5 text-xs text-blue-900">{devOrigin}</code>
				<button
					type="button"
					class={iconClass('copy:base:dev')}
					aria-label="Copy dev base URL"
					on:click={() => copyToClipboard(devOrigin, 'copy:base:dev')}
				>
					{#if copiedKey === 'copy:base:dev'}
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
					{:else}
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
					{/if}
				</button>
			</p>
			<p>
				Prod:
				<code class="rounded bg-blue-100/70 px-2 py-0.5 text-xs text-blue-900">{prodOrigin}</code>
				<button
					type="button"
					class={iconClass('copy:base:prod')}
					aria-label="Copy production base URL"
					on:click={() => copyToClipboard(prodOrigin, 'copy:base:prod')}
				>
					{#if copiedKey === 'copy:base:prod'}
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
					{:else}
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
					{/if}
				</button>
			</p>
		</div>
	</div>
</section>

<section class="mb-12">
	<div class="mx-auto max-w-5xl">
		<h2 class="mb-4 text-2xl font-bold text-gray-900">Campaigns</h2>
		{#if activeCampaigns.length}
			<div class="space-y-3">
				{#each activeCampaigns as campaign}
					<details
						id={`campaign-${campaign.id}`}
						class="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
					>
						<summary class="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="text-[11px] tracking-wide text-gray-500 uppercase">Campaign</p>
									<p class="mt-1 text-base font-semibold text-gray-900 md:text-lg">
										{campaign.displayTitle}
									</p>
									<p class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-700">
										<span class="font-semibold">ID</span>
										<span
											class="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-800"
										>
											{campaign.id}
										</span>
										{#if campaign.partner}
											<span class="text-gray-400">•</span>
											<span class="font-semibold">Partner</span>
											<span>{campaign.partnerLabel ?? campaign.partner}</span>
										{/if}
										<span class="text-gray-400">•</span>
										<span class="font-semibold">Type</span>
										<span>{campaign.category === 'event' ? 'Event' : 'Landing'}</span>
									</p>
									<p class="mt-2 truncate text-xs text-gray-600">
										<span class="font-semibold">Short:</span>
										<code class="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-800">
											{campaign.shortUrlProd}
										</code>
									</p>
								</div>
								<span
									class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700"
								>
									Expand
								</span>
							</div>
						</summary>

						<div class="mt-4 grid gap-5 border-t border-gray-100 pt-4">
							{#if campaign.description}
								<p class="text-sm text-gray-600">{campaign.description}</p>
							{/if}
							<div class="flex flex-wrap gap-2 text-xs text-gray-600">
								{#if campaign.partner}
									<a
										href={`/admin/campaigns/partners/${campaign.partner}`}
										class="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700 transition hover:bg-blue-100"
									>
										Partner page: {campaign.partner}
									</a>
								{/if}
								{#if campaign.event}
									<a
										href={campaign.landingPath}
										class="rounded-full bg-indigo-50 px-2 py-1 font-semibold text-indigo-700 transition hover:bg-indigo-100"
									>
										Event page
									</a>
								{/if}
								<span class="rounded-full bg-gray-100 px-2 py-1">
									Type: {campaign.category === 'event' ? 'Event' : 'Landing page'}
								</span>
								<span class="rounded-full bg-gray-100 px-2 py-1">Landing: {campaign.landingPath}</span>
								<span class="rounded-full bg-gray-100 px-2 py-1">Created: {campaign.createdAt}</span>
							</div>
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
											class={iconClass(`copy:short:prod:${campaign.id}`)}
											aria-label={`Copy short URL for ${campaign.id}`}
											on:click={() =>
												copyToClipboard(campaign.shortUrlProd, `copy:short:prod:${campaign.id}`)}
										>
											{#if copiedKey === `copy:short:prod:${campaign.id}`}
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
											{:else}
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
											{/if}
										</button>
									</div>
									<div class="grid items-center gap-3 sm:grid-cols-[200px_minmax(0,1fr)_auto]">
										<span class="text-xs font-semibold text-gray-500">Encoded URL (dev)</span>
										<code class="truncate rounded bg-white px-2 py-0.5 text-xs text-gray-800">
											{`${devOrigin}${campaign.shortPath}`}
										</code>
										<button
											type="button"
											class={iconClass(`copy:short:dev:${campaign.id}`)}
											aria-label={`Copy encoded dev URL for ${campaign.id}`}
											on:click={() =>
												copyToClipboard(
													`${devOrigin}${campaign.shortPath}`,
													`copy:short:dev:${campaign.id}`
												)}
										>
											{#if copiedKey === `copy:short:dev:${campaign.id}`}
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
											{:else}
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
											{/if}
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
										<p class="font-semibold text-gray-900">Landing + tracking</p>
										<div class="mt-2 space-y-2">
											<div class="space-y-1">
												<span class="text-[11px] text-gray-500">Tracking URL (prod)</span>
												<div class="flex items-center gap-2">
													<code
														class="rounded bg-white px-2 py-1 text-[11px] break-all text-gray-800"
													>
														{campaign.trackingUrlProd}
													</code>
													<button
														type="button"
														class={iconClass(`copy:tracking:prod:${campaign.id}`)}
														aria-label={`Copy tracking URL (prod) for ${campaign.id}`}
														on:click={() =>
															copyToClipboard(
																campaign.trackingUrlProd,
																`copy:tracking:prod:${campaign.id}`
															)}
													>
														{#if copiedKey === `copy:tracking:prod:${campaign.id}`}
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
														{:else}
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
														{/if}
													</button>
												</div>
											</div>
											<div class="space-y-1">
												<span class="text-[11px] text-gray-500">Tracking URL (dev)</span>
												<div class="flex items-center gap-2">
													<code
														class="rounded bg-white px-2 py-1 text-[11px] break-all text-gray-800"
													>
														{`${devOrigin}${campaign.trackingPath}`}
													</code>
													<button
														type="button"
														class={iconClass(`copy:tracking:dev:${campaign.id}`)}
														aria-label={`Copy tracking URL (dev) for ${campaign.id}`}
														on:click={() =>
															copyToClipboard(
																`${devOrigin}${campaign.trackingPath}`,
																`copy:tracking:dev:${campaign.id}`
															)}
													>
														{#if copiedKey === `copy:tracking:dev:${campaign.id}`}
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
														{:else}
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
														{/if}
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

							<div class="rounded-2xl border border-gray-200/80 bg-gray-50/40 p-5">
								<div class="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
											QR codes
										</p>
										<p class="mt-1 text-xs text-gray-600">
											Pre-generated for active campaigns. Refresh any asset when needed.
										</p>
									</div>
									<div class="flex flex-wrap gap-2">
										<button
											type="button"
											class="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
											on:click={() => generateQr(campaign.id, campaign.shortUrlProd, 'prod')}
										>
											Refresh prod
										</button>
										<button
											type="button"
											class="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
											on:click={() =>
												generateQr(campaign.id, `${devOrigin}${campaign.shortPath}`, 'dev')}
										>
											Refresh dev
										</button>
									</div>
								</div>

								<div class="mt-4 grid gap-4 md:grid-cols-2">
									<div class="rounded-xl border border-gray-100 bg-white/90 p-4">
										<div class="mb-3">
											<p class="text-sm font-semibold text-gray-900">Production QR</p>
											<p class="mt-0.5 text-[11px] text-gray-500">PNG {qrSize}x{qrSize} and SVG</p>
										</div>
										{#if qrAssets[campaign.id]?.prod?.pngDataUrl}
											<div class="max-w-full space-y-3">
												<div
													class="inline-flex flex-nowrap items-center gap-2"
													use:trackQrActionWidth={`prod:${campaign.id}`}
												>
													<button
														type="button"
														class={iconClass(`copy:png:prod:${campaign.id}`)}
														aria-label={`Copy PNG to clipboard for ${campaign.id}`}
														on:click={() =>
															copyPngToClipboard(
																qrAssets[campaign.id].prod.pngDataUrl,
																`copy:png:prod:${campaign.id}`
															)}
													>
														{#if copiedKey === `copy:png:prod:${campaign.id}`}
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
														{:else}
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
														{/if}
													</button>
													<a
														class={iconClass(`download:png:prod:${campaign.id}`)}
														download={makeFileName(campaign.id, 'prod', 'png')}
														href={qrAssets[campaign.id].prod.pngDataUrl}
													>
														⬇️ PNG
													</a>
													<a
														class={iconClass(`download:svg:prod:${campaign.id}`)}
														download={makeFileName(campaign.id, 'prod', 'svg')}
														href={qrAssets[campaign.id].prod.svgDataUrl}
														class:hidden={!qrAssets[campaign.id]?.prod?.svgDataUrl}
													>
														⬇️ SVG
													</a>
												</div>
												<img
													src={qrAssets[campaign.id].prod.pngDataUrl}
													alt={`QR code (prod) for ${campaign.id}`}
													class="aspect-square rounded-lg border border-gray-100 bg-white p-1.5 shadow-sm"
													style={`width: ${qrActionWidths[`prod:${campaign.id}`] ? `${qrActionWidths[`prod:${campaign.id}`]}px` : '13rem'}`}
													loading="lazy"
												/>
											</div>
										{:else if qrAssets[campaign.id]?.prod?.loading}
											<p class="text-xs text-gray-500">Generating…</p>
										{:else}
											<p class="text-xs text-gray-500">Generating…</p>
										{/if}
									</div>

									<div class="rounded-xl border border-gray-100 bg-white/90 p-4">
										<div class="mb-3">
											<p class="text-sm font-semibold text-gray-900">Dev QR</p>
											<p class="mt-0.5 text-[11px] text-gray-500">PNG {qrSize}x{qrSize} and SVG</p>
										</div>
										{#if qrAssets[campaign.id]?.dev?.pngDataUrl}
											<div class="max-w-full space-y-3">
												<div
													class="inline-flex flex-nowrap items-center gap-2"
													use:trackQrActionWidth={`dev:${campaign.id}`}
												>
													<button
														type="button"
														class={iconClass(`copy:png:dev:${campaign.id}`)}
														aria-label={`Copy PNG to clipboard for ${campaign.id} (dev)`}
														on:click={() =>
															copyPngToClipboard(
																qrAssets[campaign.id].dev.pngDataUrl,
																`copy:png:dev:${campaign.id}`
															)}
													>
														{#if copiedKey === `copy:png:dev:${campaign.id}`}
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
														{:else}
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
														{/if}
													</button>
													<a
														class={iconClass(`download:png:dev:${campaign.id}`)}
														download={makeFileName(campaign.id, 'dev', 'png')}
														href={qrAssets[campaign.id].dev.pngDataUrl}
													>
														⬇️ PNG
													</a>
													<a
														class={iconClass(`download:svg:dev:${campaign.id}`)}
														download={makeFileName(campaign.id, 'dev', 'svg')}
														href={qrAssets[campaign.id].dev.svgDataUrl}
														class:hidden={!qrAssets[campaign.id]?.dev?.svgDataUrl}
													>
														⬇️ SVG
													</a>
												</div>
												<img
													src={qrAssets[campaign.id].dev.pngDataUrl}
													alt={`QR code (dev) for ${campaign.id}`}
													class="aspect-square rounded-lg border border-gray-100 bg-white p-1.5 shadow-sm"
													style={`width: ${qrActionWidths[`dev:${campaign.id}`] ? `${qrActionWidths[`dev:${campaign.id}`]}px` : '13rem'}`}
													loading="lazy"
												/>
											</div>
										{:else if qrAssets[campaign.id]?.dev?.loading}
											<p class="text-xs text-gray-500">Generating…</p>
										{:else}
											<p class="text-xs text-gray-500">Generating…</p>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</details>
				{/each}
			</div>
		{:else}
			<div class="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
				No campaigns found.
			</div>
		{/if}
	</div>
</section>

<section class="mb-12">
	<div class="mx-auto max-w-5xl">
		<details class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" open={false}>
			<summary class="cursor-pointer text-lg font-semibold text-gray-900">
				Archived campaigns ({archivedCampaigns.length})
			</summary>
			<div class="mt-5 space-y-6">
				{#if archivedCampaigns.length === 0}
					<p class="text-sm text-gray-600">No archived campaigns.</p>
				{:else}
					{#each archivedCampaigns as campaign}
						<article
							id={`campaign-${campaign.id}`}
							class="scroll-mt-24 rounded-2xl border border-gray-200 bg-gray-50 p-6"
						>
							<div class="flex flex-wrap items-start justify-between gap-4">
								<div class="min-w-0">
									<p class="text-xs tracking-wide text-gray-500 uppercase">Campaign</p>
									<p class="mt-1 text-lg font-semibold text-gray-900">{campaign.displayTitle}</p>
									<p class="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700">
										<span class="font-semibold">ID</span>
										<span class="rounded-full bg-white px-2 py-0.5 font-mono text-xs text-gray-800">
											{campaign.id}
										</span>
									</p>
									<div class="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
										{#if campaign.event}
											<a
												href={campaign.landingPath}
												class="rounded-full bg-indigo-50 px-2 py-1 font-semibold text-indigo-700 transition hover:bg-indigo-100"
											>
												Event page
											</a>
										{/if}
										<span class="rounded-full bg-white px-2 py-1">
											Type: {campaign.category === 'event' ? 'Event' : 'Landing page'}
										</span>
										<span class="rounded-full bg-white px-2 py-1"
											>Landing: {campaign.landingPath}</span
										>
										<span class="rounded-full bg-white px-2 py-1"
											>Created: {campaign.createdAt}</span
										>
									</div>
								</div>
								<span
									class="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
								>
									Archived
								</span>
							</div>

							<div class="mt-5 space-y-4">
								<div class="rounded-xl border border-gray-200 bg-white px-4 py-3">
									<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
										Primary URLs
									</p>
									<div class="mt-3 grid gap-2 text-sm text-gray-700">
										<div class="grid items-center gap-3 sm:grid-cols-[200px_minmax(0,1fr)_auto]">
											<span class="text-xs font-semibold text-gray-500">Short URL (prod)</span>
											<code class="truncate rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-800">
												{campaign.shortUrlProd}
											</code>
											<button
												type="button"
												class={iconClass(`copy:short:prod:${campaign.id}`)}
												aria-label={`Copy short URL for ${campaign.id}`}
												on:click={() =>
													copyToClipboard(campaign.shortUrlProd, `copy:short:prod:${campaign.id}`)}
											>
												{#if copiedKey === `copy:short:prod:${campaign.id}`}
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
												{:else}
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
												{/if}
											</button>
										</div>
										<div class="grid items-center gap-3 sm:grid-cols-[200px_minmax(0,1fr)_auto]">
											<span class="text-xs font-semibold text-gray-500">Encoded URL (dev)</span>
											<code class="truncate rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-800">
												{`${devOrigin}${campaign.shortPath}`}
											</code>
											<button
												type="button"
												class={iconClass(`copy:short:dev:${campaign.id}`)}
												aria-label={`Copy encoded dev URL for ${campaign.id}`}
												on:click={() =>
													copyToClipboard(
														`${devOrigin}${campaign.shortPath}`,
														`copy:short:dev:${campaign.id}`
													)}
											>
												{#if copiedKey === `copy:short:dev:${campaign.id}`}
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
												{:else}
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
												{/if}
											</button>
										</div>
									</div>
								</div>

								<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
									<div class="flex flex-wrap items-center justify-between gap-3">
										<div>
											<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
												QR codes
											</p>
											<p class="mt-1 text-xs text-gray-600">
												Generated on demand for archived campaigns.
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
												on:click={() =>
													generateQr(campaign.id, `${devOrigin}${campaign.shortPath}`, 'dev')}
											>
												Generate dev
											</button>
										</div>
									</div>

									<div class="mt-4 grid gap-4 md:grid-cols-2">
										<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
											<p class="text-xs font-semibold text-gray-700">Prod QR</p>
											{#if qrAssets[campaign.id]?.prod?.pngDataUrl}
												<img
													src={qrAssets[campaign.id].prod.pngDataUrl}
													alt={`QR code (prod) for ${campaign.id}`}
													class="mt-3 h-24 w-24 rounded bg-white p-1"
													loading="lazy"
												/>
											{:else if qrAssets[campaign.id]?.prod?.loading}
												<p class="mt-2 text-xs text-gray-500">Generating…</p>
											{:else}
												<p class="mt-2 text-xs text-gray-500">Not generated.</p>
											{/if}
										</div>
										<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
											<p class="text-xs font-semibold text-gray-700">Dev QR</p>
											{#if qrAssets[campaign.id]?.dev?.pngDataUrl}
												<img
													src={qrAssets[campaign.id].dev.pngDataUrl}
													alt={`QR code (dev) for ${campaign.id}`}
													class="mt-3 h-24 w-24 rounded bg-white p-1"
													loading="lazy"
												/>
											{:else if qrAssets[campaign.id]?.dev?.loading}
												<p class="mt-2 text-xs text-gray-500">Generating…</p>
											{:else}
												<p class="mt-2 text-xs text-gray-500">Not generated.</p>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</article>
					{/each}
				{/if}
			</div>
		</details>
	</div>
</section>
