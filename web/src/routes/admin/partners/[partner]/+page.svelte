<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import type { PageData } from './$types';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/config/site';
	import { getPartnerByCode, listPartners } from '$lib/data/partners';
	import { getTrainingProgramBySku, listTrainingPrograms } from '$lib/data/training';
	import { getTrainingPdfUrl, hasTrainingPdf } from '$lib/data/training/brochure';
	import { listCampaignUi } from '$lib/view-models/campaigns';
	import { listEventUi } from '$lib/view-models/events';

	type QrAsset = {
		pngDataUrl?: string;
		svgDataUrl?: string;
		loading?: boolean;
		error?: string;
	};
	type AssetVariant = 'square' | 'landscape' | 'portrait';
	type EventGeneratedAsset = PageData['eventGeneratedAssets'][string][number];
	type TrainingGeneratedAsset = PageData['trainingGeneratedAssets'][string][number];
	type MediaAsset = EventGeneratedAsset | TrainingGeneratedAsset;

	export let data: PageData;

	const prodOrigin = SITE_ORIGIN.replace(/\/$/, '');
	const qrSize = 512;
	const assetVariants: AssetVariant[] = ['square', 'landscape', 'portrait'];
	const eventDateFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/Los_Angeles',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

	const campaigns = listCampaignUi(prodOrigin).map((campaign) => ({
		...campaign,
		shortUrlProd: campaign.shortUrl
	}));
	const partners = listPartners();
	const trainingPrograms = listTrainingPrograms({ includeDrafts: true });
	const shortPathByCampaignId = new Map(campaigns.map((campaign) => [campaign.id, campaign.shortPath]));
	const events = listEventUi({ includeDrafts: true, includeUnlisted: true });

	let activeFilter: 'all' | 'events' | 'training' | 'campaigns' = 'events';
	let searchQuery = '';
	let showPast = false;
	let copiedKey = '';
	let qrAssets: Record<string, QrAsset> = {};
	let previewAsset: MediaAsset | null = null;

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

	const copyImageToClipboard = async (imageUrl: string, key: string) => {
		if (!browser) return;
		try {
			const response = await fetch(imageUrl);
			const blob = await response.blob();
			const item = new ClipboardItem({ [blob.type]: blob });
			await navigator.clipboard.write([item]);
			setCopied(key);
		} catch (error) {
			console.warn('Unable to copy image to clipboard', error);
		}
	};

	const copySvgToClipboard = async (svgDataUrl: string, key: string) => {
		if (!browser) return;
		try {
			const response = await fetch(svgDataUrl);
			const svgText = await response.text();
			const item = new ClipboardItem({
				'image/svg+xml': new Blob([svgText], { type: 'image/svg+xml' }),
				'text/plain': new Blob([svgText], { type: 'text/plain' })
			});
			await navigator.clipboard.write([item]);
			setCopied(key);
		} catch (error) {
			console.warn('Unable to copy SVG to clipboard', error);
		}
	};

	const actionClass = (key: string): string =>
		`inline-flex items-center justify-center rounded border px-2 py-1 text-[11px] font-semibold transition ${
			copiedKey === key
				? 'border-emerald-200 bg-emerald-50 text-emerald-800'
				: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800'
		} ${copiedKey === key ? 'scale-[1.02]' : 'scale-100'}`;

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
	const makePdfFileName = (slug: string) => `${slug}.pdf`;

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

	const titleCase = (value: string) =>
		value
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');

	const formatEventDate = (startAtUtc?: string) => {
		if (!startAtUtc) return 'Date TBD';
		const parsed = new Date(startAtUtc);
		if (Number.isNaN(parsed.valueOf())) return startAtUtc;
		return eventDateFormatter.format(parsed);
	};

	const formatBytes = (bytes: number): string => {
		if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
		const units = ['B', 'KB', 'MB', 'GB'];
		let value = bytes;
		let unitIndex = 0;
		while (value >= 1024 && unitIndex < units.length - 1) {
			value /= 1024;
			unitIndex += 1;
		}
		return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
	};

	const versionOf = (name: string): number => {
		const match = name.match(/-v(\d+)(?=\.[^.]+$)/i);
		return match ? Number.parseInt(match[1] ?? '1', 10) : 1;
	};

	const sortAssetsNewestFirst = <
		T extends {
			name: string;
		}
	>(
		items: T[]
	): T[] =>
		[...items].sort((a, b) => {
			const versionDiff = versionOf(b.name) - versionOf(a.name);
			if (versionDiff !== 0) return versionDiff;
			return a.name.localeCompare(b.name);
		});

	const getEventAssets = (eventSlug: string) => data.eventGeneratedAssets?.[eventSlug] ?? [];
	const getTrainingAssets = (programSlug: string) => data.trainingGeneratedAssets?.[programSlug] ?? [];

	const getVariantAssets = (assets: MediaAsset[], variant: AssetVariant): MediaAsset[] =>
		sortAssetsNewestFirst(
			assets.filter((asset) =>
				new RegExp(`hero-${variant}(?:-[a-z0-9-]+|(?:-v\\d+)?)?\\.(png|jpe?g|webp|avif|svg)$`, 'i').test(
					asset.name
				)
			)
		);

	const getLatestVariantAssets = (assets: MediaAsset[], variant: AssetVariant): MediaAsset[] => {
		const filteredAssets = getVariantAssets(assets, variant);
		if (!filteredAssets.length) return [];
		const latestVersion = versionOf(filteredAssets[0].name);
		return filteredAssets.filter((asset) => versionOf(asset.name) === latestVersion);
	};

	const getLatestEventVariantAssets = (eventSlug: string, variant: AssetVariant) => {
		const assets = getEventAssets(eventSlug);
		const filteredAssets = getLatestVariantAssets(assets, variant);
		if (!filteredAssets.length) return [];
		return filteredAssets;
	};

	const getLatestTrainingVariantAssets = (programSlug: string, variant: AssetVariant) => {
		const assets = getTrainingAssets(programSlug);
		const filteredAssets = getLatestVariantAssets(assets, variant);
		if (!filteredAssets.length) return [];
		return filteredAssets;
	};

	const getVariantPreview = (assets: MediaAsset[]): MediaAsset | undefined =>
		assets.find((asset) => asset.kind === 'image');
	const getEventVariantPreview = (eventSlug: string, variant: AssetVariant) =>
		getVariantPreview(getLatestEventVariantAssets(eventSlug, variant));
	const getTrainingVariantPreview = (programSlug: string, variant: AssetVariant) =>
		getVariantPreview(getLatestTrainingVariantAssets(programSlug, variant));
	const getSquarePreview = (eventSlug: string) => getEventVariantPreview(eventSlug, 'square');
	const getTrainingSquarePreview = (programSlug: string) =>
		getTrainingVariantPreview(programSlug, 'square');
	const getVisibleMediaAssetCount = (assets: MediaAsset[], videoUrl?: string) =>
		assetVariants.reduce(
			(total, variant) => total + getLatestVariantAssets(assets, variant).length,
			videoUrl ? 1 : 0
		);

	const normalizeSearchValue = (value: string) => value.trim().toLowerCase();
	const hasDirectVideoPreview = (videoUrl?: string) =>
		Boolean(videoUrl && /\.(mp4|webm|ogg|ogv|mov)(?:\?|#|$)/i.test(videoUrl));
	const getYouTubeVideoId = (value?: string): string | undefined => {
		if (!value) return undefined;
		try {
			const parsed = new URL(value);
			const host = parsed.hostname.toLowerCase();
			if (host.includes('youtube') || host.includes('youtu.be')) {
				if (host === 'youtu.be') {
					return parsed.pathname.replace('/', '') || undefined;
				}
				if (parsed.pathname.startsWith('/embed/')) {
					return parsed.pathname.split('/')[2];
				}
				if (parsed.pathname === '/watch') {
					return parsed.searchParams.get('v') ?? undefined;
				}
			}
		} catch {
			return undefined;
		}
		return undefined;
	};
	const getVideoEmbedUrl = (value?: string): string | undefined => {
		const youtubeId = getYouTubeVideoId(value);
		return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : undefined;
	};
	const hasPreview = (asset: MediaAsset): boolean => asset.kind === 'image' || asset.kind === 'video';
	const openAssetPreview = (asset: MediaAsset) => {
		previewAsset = asset;
	};
	const closeAssetPreview = () => {
		previewAsset = null;
	};
	const isPastEvent = (event: { startAtUtc?: string; endAtUtc?: string; lifecycleStatus?: string }) => {
		const nowTimestamp = Date.now();
		const endTimestamp = getEventSortTimestamp(event.endAtUtc);
		const startTimestamp = getEventSortTimestamp(event.startAtUtc);
		const effectiveTimestamp =
			endTimestamp !== Number.POSITIVE_INFINITY ? endTimestamp : startTimestamp;
		if (effectiveTimestamp === Number.POSITIVE_INFINITY) return false;
		if (event.lifecycleStatus === 'completed' || event.lifecycleStatus === 'canceled') return true;
		return effectiveTimestamp < nowTimestamp;
	};

	const getEventSortTimestamp = (startAtUtc?: string): number => {
		if (!startAtUtc) return Number.POSITIVE_INFINITY;
		const parsed = new Date(startAtUtc).valueOf();
		return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
	};

	$: partnerSlug = $page.params.partner ?? '';
	$: partnerKey = partnerSlug.toLowerCase();
	$: partnerLabel =
		campaigns.find((campaign) => campaign.partner?.toLowerCase() === partnerKey)?.partnerLabel ??
		(partnerSlug ? titleCase(partnerSlug) : 'Partner');
	$: partnerRecord = partners.find((partner) => partner.slug?.toLowerCase() === partnerKey);
	$: partnerCode =
		events
			.flatMap((event) => event.partners ?? [])
			.map((partnerRef) => getPartnerByCode(partnerRef.code))
			.find((partner) => partner?.slug?.toLowerCase() === partnerKey)?.code ??
		campaigns.find((campaign) => campaign.partner?.toLowerCase() === partnerKey)?.partner?.toUpperCase() ??
		'';
	$: partnerCampaigns = campaigns.filter(
		(campaign) => campaign.partner?.toLowerCase() === partnerKey
	);
	$: partnerEvents = events
		.filter((event) =>
			(event.partners ?? []).some(
				(partnerRef) => getPartnerByCode(partnerRef.code)?.slug?.toLowerCase() === partnerKey
			)
		)
		.map((event) => {
			const campaignId = event.cta?.campaignId ?? event.campaignId;
			const shortPath = campaignId ? shortPathByCampaignId.get(campaignId) : undefined;
			const shortUrlProd = shortPath ? `${prodOrigin}${shortPath}` : undefined;
			const relatedProgram = event.programRef?.sku
				? getTrainingProgramBySku(event.programRef.sku)
				: undefined;
			const brochurePdfPath =
				relatedProgram && hasTrainingPdf(relatedProgram) ? getTrainingPdfUrl(relatedProgram) : undefined;
			const brochurePdfUrl = brochurePdfPath ? `${prodOrigin}${brochurePdfPath}` : undefined;

			return {
				...event,
				campaignId,
				shortPath,
				shortUrlProd,
				brochurePdfPath,
				brochurePdfUrl,
				brochurePdfFileName: relatedProgram ? makePdfFileName(relatedProgram.slug) : undefined
			};
		})
		.sort((a, b) => {
			const nowTimestamp = Date.now();
			const aTimestamp = getEventSortTimestamp(a.startAtUtc);
			const bTimestamp = getEventSortTimestamp(b.startAtUtc);
			const aIsUpcoming = aTimestamp >= nowTimestamp;
			const bIsUpcoming = bTimestamp >= nowTimestamp;

			if (aIsUpcoming !== bIsUpcoming) return aIsUpcoming ? -1 : 1;
			if (aIsUpcoming && bIsUpcoming) return aTimestamp - bTimestamp;
			return bTimestamp - aTimestamp;
		});
	$: normalizedSearchQuery = normalizeSearchValue(searchQuery);
	$: filteredPartnerEvents = partnerEvents.filter((event) => {
		if (!showPast && isPastEvent(event)) return false;
		if (!normalizedSearchQuery) return true;
		return [
			event.title,
			event.slug,
			event.campaignId,
			event.typeLabel,
			formatEventDate(event.startAtUtc)
		]
			.filter((value): value is string => Boolean(value))
			.some((value) => value.toLowerCase().includes(normalizedSearchQuery));
	});
	$: filteredPartnerCampaigns = partnerCampaigns.filter((campaign) => {
		const linkedEvent = events.find((event) => (event.cta?.campaignId ?? event.campaignId) === campaign.id);
		const isPastCampaign = Boolean(campaign.archived) || (linkedEvent ? isPastEvent(linkedEvent) : false);
		if (!showPast && isPastCampaign) return false;
		if (!normalizedSearchQuery) return true;
		return [
			campaign.id,
			campaign.partner,
			campaign.partnerLabel,
			campaign.description,
			campaign.landingPath
		]
			.filter((value): value is string => Boolean(value))
			.some((value) => value.toLowerCase().includes(normalizedSearchQuery));
	});
	$: partnerTrainingPrograms = trainingPrograms
		.filter((program) => program.eventDefaults?.partnerCodes?.includes(partnerCode))
			.map((program) => ({
				...program,
				fullUrl: `${prodOrigin}${program.route}`,
				brochurePdfPath: hasTrainingPdf(program) ? getTrainingPdfUrl(program) : undefined,
				brochurePdfUrl: hasTrainingPdf(program) ? `${prodOrigin}${getTrainingPdfUrl(program)}` : undefined,
				brochurePdfFileName: hasTrainingPdf(program) ? makePdfFileName(program.slug) : undefined
			}))
		.sort((a, b) => a.title.localeCompare(b.title));
	$: filteredPartnerTrainingPrograms = partnerTrainingPrograms.filter((program) => {
		if (!normalizedSearchQuery) return true;
		return [
			program.title,
			program.slug,
			program.sku,
			program.nickname,
			program.presentation?.partnershipLabel,
			program.catalog?.summary
		]
			.filter((value): value is string => Boolean(value))
			.some((value) => value.toLowerCase().includes(normalizedSearchQuery));
	});

	onMount(() => {
		if (!browser) return;
		const qrTargets = new Map<string, string>();
		partnerCampaigns.forEach((campaign) => {
			qrTargets.set(campaign.id, campaign.shortUrlProd);
		});
		partnerEvents.forEach((event) => {
			if (event.campaignId && event.shortUrlProd) {
				qrTargets.set(event.campaignId, event.shortUrlProd);
			}
		});
		qrTargets.forEach((shortUrlProd, campaignId) => {
			void generateQr(campaignId, shortUrlProd);
		});
	});

	$: pageTitle = `${partnerLabel} Campaigns | Cambermast`;
	$: pageDescription = `Partner-ready production links and QR assets for ${partnerLabel}.`;
</script>

<SeoHead
	title={pageTitle}
	description={pageDescription}
	path={`/admin/partners/${partnerSlug}`}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<section class="mb-10">
	<div>
		<h1 class="mb-6 text-3xl font-bold">{partnerLabel} assets</h1>
		<AdminRouteChips />
		<p class="max-w-3xl text-gray-700">Share-ready production links and printable QR files.</p>
	</div>
</section>

<style>
	details .media-assets-chevron {
		transform: rotate(0deg);
		transition: transform 160ms ease;
	}

	details[open] .media-assets-chevron {
		transform: rotate(180deg);
	}

	@media (prefers-reduced-motion: reduce) {
		details .media-assets-chevron {
			transition: none;
		}
	}
</style>

<section class="mb-12">
	<div class="mx-auto mb-8 max-w-5xl rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-sm font-semibold text-gray-800">Search</span>
				<button
					type="button"
					class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
						activeFilter === 'all'
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					on:click={() => (activeFilter = 'all')}
				>
					All
				</button>
				<button
					type="button"
					class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
						activeFilter === 'events'
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					on:click={() => (activeFilter = 'events')}
				>
					Events
				</button>
				<button
					type="button"
					class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
						activeFilter === 'training'
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					on:click={() => (activeFilter = 'training')}
				>
					Training
				</button>
				<button
					type="button"
					class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
						activeFilter === 'campaigns'
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					on:click={() => (activeFilter = 'campaigns')}
				>
					Campaigns
				</button>
				<span aria-hidden="true" class="h-5 w-px bg-gray-200"></span>
				<button
					type="button"
					aria-pressed={showPast}
					class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
						showPast
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					on:click={() => (showPast = !showPast)}
				>
					Show past
				</button>
			</div>

			<div class="text-xs text-gray-600">
				<span class="font-semibold">{partnerEvents.length}</span> events •
				<span class="font-semibold">{partnerTrainingPrograms.length}</span> training programs •
				<span class="font-semibold">{partnerCampaigns.length}</span> campaigns
			</div>
		</div>

		<div class="mt-3 flex flex-wrap items-center gap-3">
			<input
				id="partner-assets-search"
				type="search"
				bind:value={searchQuery}
				placeholder="Find events, training, or campaigns by title, slug, campaign ID, or date"
				class="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
			/>
			{#if searchQuery}
				<button
					type="button"
					class="inline-flex items-center rounded border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
					on:click={() => (searchQuery = '')}
				>
					Clear
				</button>
			{/if}
		</div>
	</div>

	{#if activeFilter === 'all' || activeFilter === 'events'}
	<div class="mx-auto mb-8 max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="flex items-start gap-3">
				{#if partnerRecord?.logo}
					<img
						src={partnerRecord.logo}
						alt={`${partnerLabel} logo`}
						class="h-12 w-12 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1"
						loading="lazy"
					/>
				{/if}
				<div>
					<h2 class="text-xl font-semibold text-gray-900">Events</h2>
					<p class="mt-1 max-w-3xl text-sm text-gray-600">
						Events associated with {partnerLabel}{#if partnerCode} ({partnerCode}){/if}, with copyable short links.
					</p>
				</div>
			</div>
			<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
				{filteredPartnerEvents.length} {filteredPartnerEvents.length === 1 ? 'event' : 'events'}
			</span>
		</div>

		{#if filteredPartnerEvents.length}
			<div class="mt-5 space-y-3">
				{#each filteredPartnerEvents as event}
					<article class="rounded-xl border border-gray-200 bg-gray-50 p-4">
						<div class="flex flex-wrap items-start justify-between gap-4">
							<div class="flex min-w-0 items-start gap-4">
								{#if getSquarePreview(event.slug)}
									<img
										src={getSquarePreview(event.slug)?.url}
										alt={`${event.title} square preview`}
										class="h-20 w-20 shrink-0 rounded-lg border border-gray-200 bg-white object-cover"
										loading="lazy"
									/>
								{:else}
									<div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-[11px] font-semibold text-gray-400">
										No image
									</div>
								{/if}
								<div class="min-w-0">
									<p class="text-sm font-semibold text-gray-900">{event.title}</p>
									<p class="mt-1 text-xs text-gray-600">
										{formatEventDate(event.startAtUtc)} · {event.typeLabel}
									</p>
									<p class="mt-1 text-xs text-gray-500">
										<code class="rounded bg-white px-1.5 py-0.5">{event.slug}</code>
										{#if event.campaignId}
											· <code class="rounded bg-white px-1.5 py-0.5">{event.campaignId}</code>
										{/if}
									</p>
								</div>
							</div>
							<a
								href={`/events/${event.slug}`}
								class="inline-flex shrink-0 items-center rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
							>
								Open event
							</a>
						</div>

						{#if event.shortUrlProd || event.brochurePdfUrl}
							<div class="mt-3 rounded-lg border border-gray-200 bg-white p-4">
								<p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
									PDF + QR
								</p>
								<div class="mt-3 grid gap-4 lg:grid-cols-2">
									<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
										<p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
											Brochure PDF
										</p>
										{#if event.brochurePdfUrl}
											<code class="mt-3 block break-all rounded bg-white px-3 py-2 text-sm text-gray-800">
												{event.brochurePdfUrl}
											</code>
											<div class="mt-3 flex flex-wrap gap-2">
												<button
													type="button"
													class={actionClass(`event-pdf-copy:${event.slug}`)}
													aria-label={`Copy brochure PDF link for ${event.title}`}
													on:click={() =>
														copyToClipboard(event.brochurePdfUrl ?? '', `event-pdf-copy:${event.slug}`)}
												>
													{#if copiedKey === `event-pdf-copy:${event.slug}`}
														Copied PDF link
													{:else}
														Copy PDF link
													{/if}
												</button>
												<a
													href={event.brochurePdfPath}
													target="_blank"
													rel="noopener noreferrer"
													class={actionClass(`event-pdf-open:${event.slug}`)}
												>
													Open PDF
												</a>
												<a
													href={event.brochurePdfPath}
													download={event.brochurePdfFileName}
													class={actionClass(`event-pdf-download:${event.slug}`)}
													on:click={() => setCopied(`event-pdf-download:${event.slug}`)}
												>
													{#if copiedKey === `event-pdf-download:${event.slug}`}
														Downloaded PDF
													{:else}
														Download PDF
													{/if}
												</a>
											</div>
										{:else}
											<p class="mt-3 text-xs text-gray-500">No training brochure PDF is linked to this event.</p>
										{/if}
									</div>

									<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
										<p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
											Short link + QR
										</p>
										{#if event.shortUrlProd}
											<code class="mt-3 block break-all rounded bg-white px-3 py-2 text-sm text-gray-800">
												{event.shortUrlProd}
											</code>
										{/if}
										<div class="mt-3 flex items-start justify-center sm:justify-start">
											{#if event.campaignId && qrAssets[event.campaignId]?.pngDataUrl}
												<img
													src={qrAssets[event.campaignId].pngDataUrl}
													alt={`QR code for ${event.title}`}
													class="aspect-square w-32 rounded-lg border border-gray-100 bg-white p-1.5 shadow-sm"
													loading="lazy"
												/>
											{:else if event.campaignId && qrAssets[event.campaignId]?.loading}
												<p class="text-xs text-gray-500">Generating…</p>
											{:else}
												<p class="text-xs text-gray-500">QR unavailable.</p>
											{/if}
										</div>
										<div class="mt-3 flex flex-wrap gap-2">
											{#if event.shortUrlProd}
												<button
													type="button"
													class={actionClass(`event:${event.slug}`)}
													aria-label={`Copy short link for ${event.title}`}
													on:click={() => copyToClipboard(event.shortUrlProd ?? '', `event:${event.slug}`)}
												>
													{#if copiedKey === `event:${event.slug}`}
														Copied link
													{:else}
														Copy link
													{/if}
												</button>
											{/if}
											{#if event.campaignId && qrAssets[event.campaignId]?.pngDataUrl}
												<button
													type="button"
													class={actionClass(`copy:png:prod:${event.campaignId}`)}
													aria-label={`Copy QR PNG for ${event.title}`}
													on:click={() =>
														copyImageToClipboard(
															qrAssets[event.campaignId]?.pngDataUrl ?? '',
															`copy:png:prod:${event.campaignId}`
														)}
												>
													{#if copiedKey === `copy:png:prod:${event.campaignId}`}
														Copied QR PNG
													{:else}
														Copy QR PNG
													{/if}
												</button>
											{/if}
											{#if event.campaignId && qrAssets[event.campaignId]?.svgDataUrl}
												<button
													type="button"
													class={actionClass(`copy:svg:prod:${event.campaignId}`)}
													aria-label={`Copy QR SVG for ${event.title}`}
													on:click={() =>
														copySvgToClipboard(
															qrAssets[event.campaignId]?.svgDataUrl ?? '',
															`copy:svg:prod:${event.campaignId}`
														)}
												>
													{#if copiedKey === `copy:svg:prod:${event.campaignId}`}
														Copied QR SVG
													{:else}
														Copy QR SVG
													{/if}
												</button>
											{/if}
											{#if event.campaignId && qrAssets[event.campaignId]?.pngDataUrl}
												<a
													class={actionClass(`download:png:prod:${event.campaignId}`)}
													download={makeFileName(event.campaignId, 'png')}
													href={qrAssets[event.campaignId].pngDataUrl}
													on:click={() => setCopied(`download:png:prod:${event.campaignId}`)}
												>
													{#if copiedKey === `download:png:prod:${event.campaignId}`}
														Downloaded PNG
													{:else}
														Download PNG
													{/if}
												</a>
											{/if}
											{#if event.campaignId && qrAssets[event.campaignId]?.svgDataUrl}
												<a
													class={actionClass(`download:svg:prod:${event.campaignId}`)}
													download={makeFileName(event.campaignId, 'svg')}
													href={qrAssets[event.campaignId].svgDataUrl}
													on:click={() => setCopied(`download:svg:prod:${event.campaignId}`)}
												>
													{#if copiedKey === `download:svg:prod:${event.campaignId}`}
														Downloaded SVG
													{:else}
														Download SVG
													{/if}
												</a>
											{/if}
										</div>
									</div>
								</div>
							</div>
						{:else}
							<p class="mt-3 text-xs text-gray-500">No campaign short link or brochure PDF assigned yet.</p>
						{/if}

						<details class="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-3">
							<summary class="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
								<span class="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
									Event media assets ({getVisibleMediaAssetCount(getEventAssets(event.slug), event.videoUrl)})
									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										class="media-assets-chevron h-4 w-4 text-gray-500"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</span>
							</summary>

							<div class="mt-3 grid gap-3 md:grid-cols-3">
								{#each assetVariants as variant}
									<div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
										<p class="text-sm font-semibold text-gray-900">
											{variant.charAt(0).toUpperCase() + variant.slice(1)} ({getLatestEventVariantAssets(event.slug, variant).length})
										</p>

										{#if getEventVariantPreview(event.slug, variant)}
											<img
												src={getEventVariantPreview(event.slug, variant)?.url}
												alt={`${variant} asset preview for ${event.title}`}
												class="mt-3 aspect-square w-full rounded border border-gray-100 bg-white object-contain"
												loading="lazy"
											/>
										{:else}
											<div
												class="mt-3 flex aspect-square w-full items-center justify-center rounded border border-dashed border-gray-300 bg-white text-xs font-semibold text-gray-400"
											>
												No preview
											</div>
										{/if}

										{#if getLatestEventVariantAssets(event.slug, variant).length}
											<div class="mt-3 space-y-2">
												{#each getLatestEventVariantAssets(event.slug, variant) as asset}
													<div class="rounded-lg border border-gray-200 bg-white px-3 py-2">
														<div>
															<div class="min-w-0">
																<p class="truncate text-xs font-semibold text-gray-800">
																	{asset.name} ({asset.extension.replace('.', '').toLowerCase()} • {formatBytes(asset.sizeBytes)})
																</p>
															</div>
															<div class="mt-3 grid grid-cols-2 gap-1">
																{#if hasPreview(asset)}
																	<button
																		type="button"
																		class={actionClass(`asset-preview:${asset.url}`)}
																		aria-label={`Preview ${asset.name}`}
																		on:click={() => openAssetPreview(asset)}
																	>
																		Preview
																	</button>
																{/if}
																<a
																	href={asset.url}
																	download={asset.name}
																	class={actionClass(`asset-download:${asset.url}`)}
																	on:click={() => setCopied(`asset-download:${asset.url}`)}
																>
																	{#if copiedKey === `asset-download:${asset.url}`}
																		Downloaded
																	{:else}
																		Download
																	{/if}
																</a>
																{#if asset.kind === 'image'}
																	<button
																		type="button"
																		class={actionClass(`asset-image:${asset.url}`)}
																		aria-label={`Copy image for ${asset.name}`}
																		on:click={() => copyImageToClipboard(asset.url, `asset-image:${asset.url}`)}
																	>
																		{#if copiedKey === `asset-image:${asset.url}`}
																			Copied image
																		{:else}
																			Copy image
																		{/if}
																	</button>
																{/if}
																<button
																	type="button"
																	class={actionClass(`asset-link:${asset.url}`)}
																	aria-label={`Copy asset link for ${asset.name}`}
																	on:click={() => copyToClipboard(`${prodOrigin}${asset.url}`, `asset-link:${asset.url}`)}
																>
																	{#if copiedKey === `asset-link:${asset.url}`}
																		Copied link
																	{:else}
																		Copy link
																	{/if}
																</button>
															</div>
														</div>
													</div>
												{/each}
											</div>
										{:else}
											<p class="mt-3 text-xs text-gray-500">No {variant} assets found.</p>
										{/if}
									</div>
								{/each}
								{#if event.videoUrl}
									<div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
										<p class="text-sm font-semibold text-gray-900">Video (1)</p>

										{#if hasDirectVideoPreview(event.videoUrl)}
											<video
												src={event.videoUrl}
												class="mt-3 aspect-square w-full rounded border border-gray-100 bg-black object-contain"
												controls
												preload="metadata"
											>
												<track kind="captions" />
											</video>
										{:else if getVideoEmbedUrl(event.videoUrl)}
											<div class="mt-3 overflow-hidden rounded border border-gray-100 bg-black" style="aspect-ratio: 1 / 1;">
												<iframe
													src={getVideoEmbedUrl(event.videoUrl)}
													title={`Watch ${event.title}`}
													class="h-full w-full"
													loading="lazy"
													referrerpolicy="strict-origin-when-cross-origin"
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
													allowfullscreen
												></iframe>
											</div>
										{:else}
											<div class="mt-3 flex aspect-square w-full items-center justify-center rounded border border-dashed border-gray-300 bg-white px-3 text-center text-xs font-semibold text-gray-400">
												Video link available
											</div>
										{/if}

										<div class="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
											<div>
												<div class="min-w-0">
													<p class="truncate text-xs font-semibold text-gray-800">
														videoUrl ({event.videoUrl})
													</p>
												</div>
												<div class="mt-3 grid grid-cols-2 gap-1">
													<a
														href={event.videoUrl}
														target="_blank"
														rel="noopener noreferrer"
														class={actionClass(`video-open:${event.slug}`)}
													>
														Open
													</a>
													<button
														type="button"
														class={actionClass(`video-link:${event.slug}`)}
														aria-label={`Copy video link for ${event.title}`}
														on:click={() => copyToClipboard(event.videoUrl ?? '', `video-link:${event.slug}`)}
													>
														{#if copiedKey === `video-link:${event.slug}`}
															Copied link
														{:else}
															Copy link
														{/if}
													</button>
												</div>
											</div>
										</div>
									</div>
								{/if}
							</div>
						</details>
					</article>
				{/each}
			</div>
		{:else}
			<p class="mt-4 text-sm text-gray-600">
				No events found for {partnerLabel}{#if searchQuery} matching "{searchQuery}"{/if}.
			</p>
		{/if}
	</div>
	{/if}

	{#if activeFilter === 'all' || activeFilter === 'training'}
	<div class="mx-auto mb-8 max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="flex items-start gap-3">
				{#if partnerRecord?.logo}
					<img
						src={partnerRecord.logo}
						alt={`${partnerLabel} logo`}
						class="h-12 w-12 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1"
						loading="lazy"
					/>
				{/if}
				<div>
					<h2 class="text-xl font-semibold text-gray-900">Training</h2>
					<p class="mt-1 max-w-3xl text-sm text-gray-600">
						Training programs associated with {partnerLabel}{#if partnerCode} ({partnerCode}){/if}.
					</p>
				</div>
			</div>
			<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
				{filteredPartnerTrainingPrograms.length}
				{filteredPartnerTrainingPrograms.length === 1 ? ' program' : ' programs'}
			</span>
		</div>

		{#if filteredPartnerTrainingPrograms.length}
			<div class="mt-5 grid gap-3">
				{#each filteredPartnerTrainingPrograms as program}
						<article class="rounded-xl border border-gray-200 bg-gray-50 p-4">
							<div class="flex flex-wrap items-start justify-between gap-4">
								<div class="flex min-w-0 items-start gap-4">
									{#if getTrainingSquarePreview(program.slug)}
										<img
											src={getTrainingSquarePreview(program.slug)?.url}
											alt={`${program.title} square preview`}
											class="h-20 w-20 shrink-0 rounded-lg border border-gray-200 bg-white object-cover"
											loading="lazy"
										/>
									{:else if program.heroImage}
										<img
											src={program.heroImage}
											alt={program.heroImageAlt ?? `${program.title} preview`}
										class="h-20 w-20 shrink-0 rounded-lg border border-gray-200 bg-white object-cover"
										loading="lazy"
									/>
								{:else}
									<div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-[11px] font-semibold text-gray-400">
										No image
									</div>
								{/if}
								<div class="min-w-0">
									<p class="text-sm font-semibold text-gray-900">{program.title}</p>
									<p class="mt-1 text-xs text-gray-600">
										{program.eventTypeLabel}
										{#if program.presentation?.partnershipLabel}
											· {program.presentation.partnershipLabel}
										{/if}
									</p>
									<p class="mt-1 text-xs text-gray-500">
										<code class="rounded bg-white px-1.5 py-0.5">{program.slug}</code>
										{#if program.sku}
											· <code class="rounded bg-white px-1.5 py-0.5">{program.sku}</code>
										{/if}
									</p>
									{#if program.catalog?.summary}
										<p class="mt-2 text-sm text-gray-600">{program.catalog.summary}</p>
									{/if}
								</div>
							</div>
							<a
								href={program.route}
								class="inline-flex shrink-0 items-center rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
							>
								Open program
							</a>
						</div>

						<div class="mt-3 rounded-lg border border-gray-200 bg-white p-4">
							<div class="grid gap-4 lg:grid-cols-2">
								<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
									<p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Program URL</p>
									<code class="mt-3 block break-all rounded bg-white px-3 py-2 text-sm text-gray-800">
										{program.fullUrl}
									</code>
									<div class="mt-3 flex flex-wrap gap-2">
										<button
											type="button"
											class={actionClass(`training-link:${program.slug}`)}
											aria-label={`Copy program URL for ${program.title}`}
											on:click={() => copyToClipboard(program.fullUrl, `training-link:${program.slug}`)}
										>
											{#if copiedKey === `training-link:${program.slug}`}
												Copied link
											{:else}
												Copy link
											{/if}
										</button>
										<a
											href={program.route}
											class={actionClass(`training-open:${program.slug}`)}
										>
											Open
										</a>
									</div>
								</div>

								<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
									<p class="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Brochure PDF</p>
									{#if program.brochurePdfUrl && program.brochurePdfPath && program.brochurePdfFileName}
										<code class="mt-3 block break-all rounded bg-white px-3 py-2 text-sm text-gray-800">
											{program.brochurePdfUrl}
										</code>
										<div class="mt-3 flex flex-wrap gap-2">
											<button
												type="button"
												class={actionClass(`training-pdf-link:${program.slug}`)}
												aria-label={`Copy brochure PDF link for ${program.title}`}
												on:click={() =>
													copyToClipboard(program.brochurePdfUrl ?? '', `training-pdf-link:${program.slug}`)}
											>
												{#if copiedKey === `training-pdf-link:${program.slug}`}
													Copied PDF link
												{:else}
													Copy PDF link
												{/if}
											</button>
											<a
												href={program.brochurePdfPath}
												target="_blank"
												rel="noopener noreferrer"
												class={actionClass(`training-pdf-open:${program.slug}`)}
											>
												Open PDF
											</a>
											<a
												href={program.brochurePdfPath}
												download={program.brochurePdfFileName}
												class={actionClass(`training-pdf-download:${program.slug}`)}
												on:click={() => setCopied(`training-pdf-download:${program.slug}`)}
											>
												{#if copiedKey === `training-pdf-download:${program.slug}`}
													Downloaded PDF
												{:else}
													Download PDF
												{/if}
											</a>
										</div>
									{:else}
										<p class="mt-3 text-xs text-gray-500">
											No brochure PDF is available for this program yet.
										</p>
									{/if}
								</div>
							</div>
						</div>

						<details class="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-3">
							<summary class="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
								<span class="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
									Training media assets ({getVisibleMediaAssetCount(getTrainingAssets(program.slug), program.videoUrl)})
									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										class="media-assets-chevron h-4 w-4 text-gray-500"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</span>
							</summary>

							<div class="mt-3 grid gap-3 md:grid-cols-3">
								{#each assetVariants as variant}
									<div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
										<p class="text-sm font-semibold text-gray-900">
											{variant.charAt(0).toUpperCase() + variant.slice(1)} ({getLatestTrainingVariantAssets(program.slug, variant).length})
										</p>

										{#if getTrainingVariantPreview(program.slug, variant)}
											<img
												src={getTrainingVariantPreview(program.slug, variant)?.url}
												alt={`${variant} asset preview for ${program.title}`}
												class="mt-3 aspect-square w-full rounded border border-gray-100 bg-white object-contain"
												loading="lazy"
											/>
										{:else}
											<div
												class="mt-3 flex aspect-square w-full items-center justify-center rounded border border-dashed border-gray-300 bg-white text-xs font-semibold text-gray-400"
											>
												No preview
											</div>
										{/if}

										{#if getLatestTrainingVariantAssets(program.slug, variant).length}
											<div class="mt-3 space-y-2">
												{#each getLatestTrainingVariantAssets(program.slug, variant) as asset}
													<div class="rounded-lg border border-gray-200 bg-white px-3 py-2">
														<div>
															<div class="min-w-0">
																<p class="truncate text-xs font-semibold text-gray-800">
																	{asset.name} ({asset.extension.replace('.', '').toLowerCase()} • {formatBytes(asset.sizeBytes)})
																</p>
															</div>
															<div class="mt-3 grid grid-cols-2 gap-1">
																{#if hasPreview(asset)}
																	<button
																		type="button"
																		class={actionClass(`asset-preview:${asset.url}`)}
																		aria-label={`Preview ${asset.name}`}
																		on:click={() => openAssetPreview(asset)}
																	>
																		Preview
																	</button>
																{/if}
																<a
																	href={asset.url}
																	download={asset.name}
																	class={actionClass(`asset-download:${asset.url}`)}
																	on:click={() => setCopied(`asset-download:${asset.url}`)}
																>
																	{#if copiedKey === `asset-download:${asset.url}`}
																		Downloaded
																	{:else}
																		Download
																	{/if}
																</a>
																{#if asset.kind === 'image'}
																	<button
																		type="button"
																		class={actionClass(`asset-image:${asset.url}`)}
																		aria-label={`Copy image for ${asset.name}`}
																		on:click={() => copyImageToClipboard(asset.url, `asset-image:${asset.url}`)}
																	>
																		{#if copiedKey === `asset-image:${asset.url}`}
																			Copied image
																		{:else}
																			Copy image
																		{/if}
																	</button>
																{/if}
																<button
																	type="button"
																	class={actionClass(`asset-link:${asset.url}`)}
																	aria-label={`Copy asset link for ${asset.name}`}
																	on:click={() => copyToClipboard(`${prodOrigin}${asset.url}`, `asset-link:${asset.url}`)}
																>
																	{#if copiedKey === `asset-link:${asset.url}`}
																		Copied link
																	{:else}
																		Copy link
																	{/if}
																</button>
															</div>
														</div>
													</div>
												{/each}
											</div>
										{:else}
											<p class="mt-3 text-xs text-gray-500">No {variant} assets found.</p>
										{/if}
									</div>
								{/each}
								{#if program.videoUrl}
									<div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
										<p class="text-sm font-semibold text-gray-900">Video (1)</p>

										{#if hasDirectVideoPreview(program.videoUrl)}
											<video
												src={program.videoUrl}
												class="mt-3 aspect-square w-full rounded border border-gray-100 bg-black object-contain"
												controls
												preload="metadata"
											>
												<track kind="captions" />
											</video>
										{:else if getVideoEmbedUrl(program.videoUrl)}
											<div class="mt-3 overflow-hidden rounded border border-gray-100 bg-black" style="aspect-ratio: 1 / 1;">
												<iframe
													src={getVideoEmbedUrl(program.videoUrl)}
													title={`Watch ${program.title}`}
													class="h-full w-full"
													loading="lazy"
													referrerpolicy="strict-origin-when-cross-origin"
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
													allowfullscreen
												></iframe>
											</div>
										{:else}
											<div class="mt-3 flex aspect-square w-full items-center justify-center rounded border border-dashed border-gray-300 bg-white px-3 text-center text-xs font-semibold text-gray-400">
												Video link available
											</div>
										{/if}

										<div class="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
											<div>
												<div class="min-w-0">
													<p class="truncate text-xs font-semibold text-gray-800">
														videoUrl ({program.videoUrl})
													</p>
												</div>
												<div class="mt-3 grid grid-cols-2 gap-1">
													<a
														href={program.videoUrl}
														target="_blank"
														rel="noopener noreferrer"
														class={actionClass(`video-open:${program.slug}`)}
													>
														Open
													</a>
													<button
														type="button"
														class={actionClass(`video-link:${program.slug}`)}
														aria-label={`Copy video link for ${program.title}`}
														on:click={() => copyToClipboard(program.videoUrl ?? '', `video-link:${program.slug}`)}
													>
														{#if copiedKey === `video-link:${program.slug}`}
															Copied link
														{:else}
															Copy link
														{/if}
													</button>
												</div>
											</div>
										</div>
									</div>
								{/if}
							</div>
						</details>
					</article>
				{/each}
			</div>
		{:else}
			<p class="mt-4 text-sm text-gray-600">
				No training programs found for {partnerLabel}{#if searchQuery} matching "{searchQuery}"{/if}.
			</p>
		{/if}
	</div>
	{/if}

	{#if activeFilter === 'all' || activeFilter === 'campaigns'}
	<div class="mx-auto max-w-5xl">
		{#if filteredPartnerCampaigns.length}
			<div class="space-y-6">
				{#each filteredPartnerCampaigns as campaign}
					<article class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<div class="flex flex-wrap items-start justify-between gap-4">
							<div>
								<p class="text-xs tracking-wide text-gray-500 uppercase">Campaign</p>
								<p class="text-lg font-semibold text-gray-900">{campaign.id}</p>
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
				No campaigns found for {partnerLabel}{#if searchQuery} matching "{searchQuery}"{/if}.
			</div>
		{/if}
	</div>
	{/if}
</section>

{#if previewAsset}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
		role="dialog"
		aria-modal="true"
		aria-label={`Preview ${previewAsset.name}`}
		tabindex="0"
		on:click|self={closeAssetPreview}
		on:keydown={(event) => {
			if (event.key === 'Escape') closeAssetPreview();
		}}
	>
		<div class="w-full max-w-5xl rounded-xl bg-white p-4 shadow-xl" role="document" tabindex="-1">
			<div class="mb-3 flex items-center justify-between gap-4">
				<div class="min-w-0">
					<p class="truncate text-sm font-semibold text-gray-900">{previewAsset.name}</p>
					<p class="text-xs text-gray-600">
						{previewAsset.relativePath} • {formatBytes(previewAsset.sizeBytes)}
					</p>
				</div>
				<div class="flex items-center gap-2">
					<a
						href={previewAsset.url}
						download={previewAsset.name}
						class="inline-flex items-center rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
					>
						Download
					</a>
					<button
						type="button"
						class="inline-flex items-center rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
						on:click={closeAssetPreview}
					>
						Close
					</button>
				</div>
			</div>
			{#if previewAsset.kind === 'image'}
				<img
					src={previewAsset.url}
					alt={previewAsset.name}
					class="max-h-[75vh] w-full rounded border border-gray-100 object-contain"
				/>
			{:else if previewAsset.kind === 'video'}
				<video
					src={previewAsset.url}
					class="max-h-[75vh] w-full rounded border border-gray-100 bg-black"
					controls
					autoplay
					preload="metadata"
				>
					<track kind="captions" />
				</video>
			{/if}
		</div>
	</div>
{/if}
