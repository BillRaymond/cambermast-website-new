<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { onMount } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { listTrainingPrograms } from '$lib/data/training';
	import { SITE_ORIGIN } from '$lib/config/site';
	import QRCode from 'qrcode';

	const pageMeta = {
		title: 'Cambermast Forms | Share Your Story',
		description:
			'Friendly, lightweight forms where students and partners can send testimonials, training requests, and follow-ups.'
	};

	const trainingProgramData = listTrainingPrograms();
	const testimonialPrograms = trainingProgramData
		.slice()
		.sort((a, b) => a.title.localeCompare(b.title))
		.map((program) => ({ title: program.title, slug: program.slug }));

	const defaultOrigin = dev ? 'http://localhost:5173' : 'https://cambermast.com';
	let shareOrigin = defaultOrigin;
	$: testimonialsBaseUrl = `${shareOrigin}/forms/testimonials`;
	$: aiSurveyBaseUrl = `${shareOrigin}/forms/ai-workshop-for-content-creators`;
	$: postTrainingSurveyBaseUrl = `${shareOrigin}/forms/post-training-survey`;
	const prodOrigin = SITE_ORIGIN.replace(/\/$/, '');
	const devOrigin = browser ? window.location.origin : defaultOrigin;
	const postTrainingProgramUrls = trainingProgramData
		.slice()
		.sort((a, b) => a.title.localeCompare(b.title))
		.map((program) => ({
			title: program.title,
			slug: program.slug,
			prod: `${prodOrigin}/forms/post-training-survey?program=${program.slug}`,
			dev: `${devOrigin}/forms/post-training-survey?program=${program.slug}`
		}));
	const getProgramShareUrl = (slug: string): string => `${testimonialsBaseUrl}?program=${slug}`;

	let copiedSlug: string | null = null;
	let copiedForm: string | null = null;
	let copyError = '';

	type QrAsset = {
		pngDataUrl?: string;
		svgDataUrl?: string;
		loading?: boolean;
		error?: string;
	};

	let qrAssets: Record<string, { prod: QrAsset; dev: QrAsset }> = {};
	const qrSize = 360;

	const touchQrAssets = () => {
		qrAssets = { ...qrAssets };
	};

	const ensureQrAssets = (key: string) => {
		if (!qrAssets[key]) {
			qrAssets[key] = { prod: {}, dev: {} };
			touchQrAssets();
		}
		return qrAssets[key];
	};

	const generateQr = async (key: string, value: string, env: 'prod' | 'dev') => {
		if (!browser) return;

		const assets = ensureQrAssets(key);
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

	const generatePostTrainingQrs = () => {
		generateQr('post-training-main', `${prodOrigin}/forms/post-training-survey`, 'prod');
		generateQr('post-training-main', `${devOrigin}/forms/post-training-survey`, 'dev');
		postTrainingProgramUrls.forEach((program) => {
			generateQr(`post-training-${program.slug}`, program.prod, 'prod');
			generateQr(`post-training-${program.slug}`, program.dev, 'dev');
		});
	};

	const copyShareUrl = async (slug: string) => {
		copyError = '';
		if (typeof navigator === 'undefined' || !navigator?.clipboard) {
			copyError = 'Clipboard access is unavailable in this browser.';
			return;
		}

		try {
			await navigator.clipboard.writeText(getProgramShareUrl(slug));
			copiedSlug = slug;
			setTimeout(() => {
				if (copiedSlug === slug) copiedSlug = null;
			}, 2500);
		} catch (err: unknown) {
			copiedSlug = null;
			copyError = err instanceof Error ? err.message : 'Unable to copy link.';
		}
	};

	const copyFormUrl = async (url: string) => {
		copyError = '';
		if (typeof navigator === 'undefined' || !navigator?.clipboard) {
			copyError = 'Clipboard access is unavailable in this browser.';
			return;
		}

		try {
			await navigator.clipboard.writeText(url);
			copiedForm = url;
			setTimeout(() => {
				if (copiedForm === url) copiedForm = null;
			}, 2500);
		} catch (err: unknown) {
			copiedForm = null;
			copyError = err instanceof Error ? err.message : 'Unable to copy link.';
		}
	};

	onMount(() => {
		if (typeof window !== 'undefined' && window.location?.origin) {
			shareOrigin = window.location.origin;
		}
		generatePostTrainingQrs();
	});
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/forms" />

<section class="mx-auto max-w-3xl space-y-6 py-10">
	<div class="space-y-4 text-center">
		<p class="text-xs font-semibold uppercase tracking-wide text-amber-600">Cambermast forms</p>
		<h1 class="text-3xl font-bold text-gray-900">Share feedback in a couple of minutes</h1>
		<p class="text-gray-700">
			These links make it easy to send testimonials, request training follow-ups, or share ideas
			with Bill. They aren’t linked in the main navigation, so feel free to pass them directly to
			teammates or partners.
		</p>
	</div>

	<div class="rounded-2xl border border-amber-100 bg-white p-6 shadow">
		<h2 class="text-xl font-semibold text-gray-900">Available forms</h2>
		<p class="mt-1 text-sm text-gray-600">
			We’re gradually adding more workflows here. For now, you can complete pre-training surveys,
			collect post-training feedback, or publish an AI training testimonial.
		</p>
		<div class="mt-5 space-y-6">
			<section
				class="rounded-2xl border border-blue-100/80 bg-blue-50/30 p-4"
				aria-labelledby="forms-pretraining-label"
			>
				<h3
					class="text-sm font-semibold uppercase tracking-wide text-blue-700"
					id="forms-pretraining-label"
				>
					Pre-training surveys
				</h3>
				<div class="mt-4 space-y-3">
					<div class="flex flex-wrap items-center gap-3">
						<button
							class="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
							type="button"
							on:click={() => copyFormUrl(aiSurveyBaseUrl)}
						>
							<svg
								class="h-4 w-4 text-blue-600"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
							</svg>
							{copiedForm === aiSurveyBaseUrl ? 'Copied!' : 'Copy link'}
						</button>
						<a
							class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
							href="/forms/ai-workshop-for-content-creators"
						>
							Visit the pre-training survey for AI for Content Creators
							<span aria-hidden="true">→</span>
						</a>
					</div>
				</div>
			</section>

			<section
				class="rounded-2xl border border-indigo-100/80 bg-indigo-50/30 p-4"
				aria-labelledby="forms-posttraining-label"
			>
				<h3
					class="text-sm font-semibold uppercase tracking-wide text-indigo-700"
					id="forms-posttraining-label"
				>
					Post-training surveys
				</h3>
				<div class="mt-4 space-y-3">
					<div class="flex flex-wrap items-center gap-3">
						<button
							class="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
							type="button"
							on:click={() => copyFormUrl(postTrainingSurveyBaseUrl)}
						>
							<svg
								class="h-4 w-4 text-blue-600"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
							</svg>
							{copiedForm === postTrainingSurveyBaseUrl ? 'Copied!' : 'Copy link'}
						</button>
						<a
							class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
							href="/forms/post-training-survey"
						>
							Visit the post-training survey
							<span aria-hidden="true">→</span>
						</a>
					</div>
					<details class="space-y-4 rounded-2xl border border-gray-100 bg-white/80 p-4">
						<summary class="cursor-pointer text-sm font-semibold text-gray-700">
							Show post-training survey links and QR codes
						</summary>
						<div class="space-y-4 pt-2">
							<div class="space-y-2">
								<div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2">
									<p class="text-xs text-gray-500">
										Prod:
										<span class="font-medium text-gray-700">
											{prodOrigin}/forms/post-training-survey
										</span>
									</p>
									<button
										class="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
										type="button"
										on:click={() => copyFormUrl(`${prodOrigin}/forms/post-training-survey`)}
									>
										<svg
											class="h-3.5 w-3.5 text-blue-600"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
										</svg>
										{copiedForm === `${prodOrigin}/forms/post-training-survey` ? 'Copied!' : 'Copy'}
									</button>
								</div>
								<div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2">
									<p class="text-xs text-gray-500">
										Dev:
										<span class="font-medium text-gray-700">
											{devOrigin}/forms/post-training-survey
										</span>
									</p>
									<button
										class="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
										type="button"
										on:click={() => copyFormUrl(`${devOrigin}/forms/post-training-survey`)}
									>
										<svg
											class="h-3.5 w-3.5 text-blue-600"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
										</svg>
										{copiedForm === `${devOrigin}/forms/post-training-survey` ? 'Copied!' : 'Copy'}
									</button>
								</div>
							</div>
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="rounded-xl border bg-white p-3 text-center">
									<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Prod</p>
									{#if qrAssets['post-training-main']?.prod?.pngDataUrl}
										<img
											class="mx-auto mt-2 h-40 w-40"
											src={qrAssets['post-training-main'].prod.pngDataUrl}
											alt="Post-training survey QR code (prod)"
										/>
									{:else}
										<p class="mt-3 text-xs text-gray-500">
											{qrAssets['post-training-main']?.prod?.loading
												? 'Generating QR code...'
												: 'Preparing QR code...'}
										</p>
									{/if}
								</div>
								<div class="rounded-xl border bg-white p-3 text-center">
									<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Dev</p>
									{#if qrAssets['post-training-main']?.dev?.pngDataUrl}
										<img
											class="mx-auto mt-2 h-40 w-40"
											src={qrAssets['post-training-main'].dev.pngDataUrl}
											alt="Post-training survey QR code (dev)"
										/>
									{:else}
										<p class="mt-3 text-xs text-gray-500">
											{qrAssets['post-training-main']?.dev?.loading
												? 'Generating QR code...'
												: 'Preparing QR code...'}
										</p>
									{/if}
								</div>
							</div>

							<div class="space-y-3">
								<p class="text-xs font-semibold uppercase tracking-wide text-gray-600">
									Program-specific links
								</p>
								{#each postTrainingProgramUrls as program}
									<div class="rounded-2xl border border-gray-100 bg-white px-4 py-3">
										<div class="space-y-2">
											<p class="text-sm font-semibold text-gray-900">{program.title}</p>
											<div class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2">
												<p class="text-xs text-gray-500">Prod: {program.prod}</p>
												<button
													class="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
													type="button"
													on:click={() => copyFormUrl(program.prod)}
												>
													<svg
														class="h-3.5 w-3.5 text-blue-600"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
													>
														<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
														<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
													</svg>
													{copiedForm === program.prod ? 'Copied!' : 'Copy'}
												</button>
											</div>
											<div class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2">
												<p class="text-xs text-gray-500">Dev: {program.dev}</p>
												<button
													class="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
													type="button"
													on:click={() => copyFormUrl(program.dev)}
												>
													<svg
														class="h-3.5 w-3.5 text-blue-600"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
													>
														<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
														<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
													</svg>
													{copiedForm === program.dev ? 'Copied!' : 'Copy'}
												</button>
											</div>
										</div>
										<div class="mt-3 grid gap-4 sm:grid-cols-2">
											<div class="rounded-xl border bg-white p-3 text-center">
												<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
													Prod
												</p>
												{#if qrAssets[`post-training-${program.slug}`]?.prod?.pngDataUrl}
													<img
														class="mx-auto mt-2 h-32 w-32"
														src={qrAssets[`post-training-${program.slug}`].prod.pngDataUrl}
														alt={`Post-training QR code for ${program.title} (prod)`}
													/>
												{:else}
													<p class="mt-2 text-xs text-gray-500">
														{qrAssets[`post-training-${program.slug}`]?.prod?.loading
															? 'Generating QR code...'
															: 'Preparing QR code...'}
													</p>
												{/if}
											</div>
											<div class="rounded-xl border bg-white p-3 text-center">
												<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
													Dev
												</p>
												{#if qrAssets[`post-training-${program.slug}`]?.dev?.pngDataUrl}
													<img
														class="mx-auto mt-2 h-32 w-32"
														src={qrAssets[`post-training-${program.slug}`].dev.pngDataUrl}
														alt={`Post-training QR code for ${program.title} (dev)`}
													/>
												{:else}
													<p class="mt-2 text-xs text-gray-500">
														{qrAssets[`post-training-${program.slug}`]?.dev?.loading
															? 'Generating QR code...'
															: 'Preparing QR code...'}
													</p>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</details>
				</div>
			</section>

			<section
				class="rounded-2xl border border-amber-100/80 bg-amber-50/40 p-4"
				aria-labelledby="forms-testimonials-label"
			>
				<h3
					class="text-sm font-semibold uppercase tracking-wide text-amber-700"
					id="forms-testimonials-label"
				>
					Testimonials
				</h3>
				<div class="mt-4 space-y-4">
					<div class="flex flex-wrap items-center gap-3">
						<button
							class="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
							type="button"
							on:click={() => copyFormUrl(testimonialsBaseUrl)}
						>
							<svg
								class="h-4 w-4 text-blue-600"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
							</svg>
							{copiedForm === testimonialsBaseUrl ? 'Copied!' : 'Copy link'}
						</button>
						<a
							class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
							href="/forms/testimonials"
						>
							Visit the testimonials form
							<span aria-hidden="true">→</span>
						</a>
					</div>

					<details class="space-y-4 rounded-2xl border border-gray-100 bg-white/80 p-4">
						<summary class="cursor-pointer text-sm font-semibold text-gray-700">
							Show testimonial share links
						</summary>
						<div class="space-y-4 pt-2">
							<p class="text-xs text-gray-500">
								Links use the current host: <span class="font-medium text-gray-700"
									>{testimonialsBaseUrl}</span
								>
							</p>
							<ul class="space-y-3">
								{#each testimonialPrograms as program}
									<li
										class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3"
									>
										<div class="space-y-1">
											<p class="text-sm font-semibold text-gray-900">{program.title}</p>
											<a
												class="text-xs text-blue-600 underline"
												href={getProgramShareUrl(program.slug)}
												rel="noreferrer"
											>
												{getProgramShareUrl(program.slug)}
											</a>
										</div>
										<button
											class="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
											type="button"
											on:click={() => copyShareUrl(program.slug)}
										>
											<svg
												class="h-4 w-4 text-blue-600"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
											>
												<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
												<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
											</svg>
											{copiedSlug === program.slug ? 'Copied!' : 'Copy URL'}
										</button>
									</li>
								{/each}
							</ul>
						</div>
					</details>
				</div>
			</section>

			{#if copyError}
				<p class="text-sm text-red-600" role="alert">{copyError}</p>
			{/if}
		</div>
	</div>
</section>
