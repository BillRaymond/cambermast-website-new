<script lang="ts">
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { listTrainingPrograms } from '$lib/data/training';

	type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

	type TurnstileRenderOptions = {
		sitekey: string;
		callback?: (token: string) => void;
		'expired-callback'?: () => void;
		'error-callback'?: () => void;
		'timeout-callback'?: () => void;
		'refresh-expired'?: 'auto' | 'never';
		theme?: 'auto' | 'light' | 'dark';
		size?: 'auto' | 'compact' | 'normal';
	};

	type TurnstileApi = {
		render: (
			container: string | HTMLElement,
			options: TurnstileRenderOptions
		) => string | undefined;
		reset: (widget?: string | HTMLElement) => void;
		remove?: (widget?: string | HTMLElement) => void;
	};

	type TurnstileWindow = Window & {
		onTurnstileLoad?: () => void;
		turnstile?: TurnstileApi;
	};

	const scaleOptions = [1, 2, 3, 4, 5];

	const trainingProgramData = listTrainingPrograms();
	const trainingPrograms = trainingProgramData
		.slice()
		.sort((a, b) => a.title.localeCompare(b.title))
		.map((program) => ({
			slug: program.slug,
			title: program.title
		}));

	const programOptions = [...trainingPrograms, { slug: 'other', title: 'Other or not listed' }];


	const productionTurnstileSiteKey = '0x4AAAAAACJwz83T0R7vFAHk';
	const developmentTurnstileSiteKey = '1x00000000000000000000AA';
	const productionBaseDomains = ['cambermast.com'];
	const productionWebhookUrl = 'https://n8n.cambermast.com/webhook/847251a3-3ff6-4ad6-bfa5-80c85a9ecc56';
	const developmentWebhookUrl =
		'https://n8n.cambermast.com/webhook-test/847251a3-3ff6-4ad6-bfa5-80c85a9ecc56';

	const devPrefill = dev
		? {
				selectedProgram: trainingPrograms[0]?.slug ?? '',
				customProgramTitle: '',
				relevance: '4',
				confidence: '3',
				likelihood: '4',
				mostHelpful: 'The walkthrough on translating ideas into usable prompts was the highlight.',
				needsClarification: 'I would like a slower walkthrough of the evaluation checklist.',
				nextWeekValue: 'More examples and time to practice with feedback.',
				additionalFeedback: 'Really appreciated the supportive pace and the recap notes.'
			}
		: undefined;

	const defaultProgramSlug = devPrefill?.selectedProgram ?? trainingPrograms[0]?.slug ?? '';
	let selectedProgram = devPrefill?.selectedProgram ?? defaultProgramSlug;
	let customProgramTitle = devPrefill?.customProgramTitle ?? '';
	let relevance = devPrefill?.relevance ?? '';
	let confidence = devPrefill?.confidence ?? '';
	let likelihood = devPrefill?.likelihood ?? '';
	let mostHelpful = devPrefill?.mostHelpful ?? '';
	let needsClarification = devPrefill?.needsClarification ?? '';
	let nextWeekValue = devPrefill?.nextWeekValue ?? '';
	let additionalFeedback = devPrefill?.additionalFeedback ?? '';
	let status: FormStatus = 'idle';
	let errorMsg = '';
	let turnstileToken = '';
	let turnstileContainer: HTMLDivElement | null = null;
	let turnstileWidgetId: string | undefined;
	let turnstileSiteKeyInUse = productionTurnstileSiteKey;
	let turnstileIsDevelopmentSiteKey = false;

	const pageMeta = {
		title: 'Post-training Survey',
		description:
			'A quick post-training survey to help us improve future sessions and tailor upcoming workshops.',
		image: '/images/training-recognition.jpg',
		imageAlt: 'Cambermast training graduates smiling and holding red hearts.'
	};

	const getTurnstileWindow = (): TurnstileWindow | undefined => {
		if (typeof window === 'undefined') return undefined;
		return window as TurnstileWindow;
	};

	const getProgramSlugFromParam = (param: string | null): string | undefined => {
		if (!param) return undefined;
		const normalized = param.trim().toLowerCase();
		if (!normalized) return undefined;
		const matchedProgram = trainingProgramData.find((program) => {
			const slugMatch = program.slug.toLowerCase() === normalized;
			const skuMatch = program.sku?.toLowerCase() === normalized;
			return slugMatch || skuMatch;
		});
		return matchedProgram?.slug;
	};

	const applyProgramSelectionFromUrl = () => {
		const turnstileWindow = getTurnstileWindow();
		if (!turnstileWindow) return;
		const url = new URL(turnstileWindow.location.href);
		const slugFromParam = getProgramSlugFromParam(url.searchParams.get('program'));
		if (slugFromParam) {
			selectedProgram = slugFromParam;
		}
	};

	const isProductionHost = (host: string): boolean =>
		productionBaseDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));

	const getTurnstileEnvironment = () => {
		const turnstileWindow = getTurnstileWindow();
		const host = turnstileWindow?.location.hostname;
		const isProdHost = host ? isProductionHost(host) : true;
		return isProdHost
			? { siteKey: productionTurnstileSiteKey, isDevelopment: false }
			: { siteKey: developmentTurnstileSiteKey, isDevelopment: true };
	};

	const getTurnstileTarget = (): string | HTMLElement | undefined =>
		turnstileWidgetId ?? turnstileContainer ?? undefined;

	const getWebhookUrl = () => {
		const turnstileWindow = getTurnstileWindow();
		const host = turnstileWindow?.location.hostname;
		if (!host) return productionWebhookUrl;
		return isProductionHost(host) ? productionWebhookUrl : developmentWebhookUrl;
	};

	type TurnstileErrorEntry = {
		'error-codes'?: unknown;
		messages?: unknown;
		message?: unknown;
		error?: unknown;
	};

	const formatTurnstileError = (codes: string[], isDevEnvironment: boolean): string => {
		if (codes.includes('invalid-input-response')) {
			return isDevEnvironment
				? 'Cloudflare Turnstile is in development mode, so tokens from this host are not accepted. Use cambermast.com to submit real responses.'
				: 'Cloudflare could not verify your response. Please refresh the verification widget and try again.';
		}
		return `Cloudflare could not verify the challenge (${codes.join(', ')}). Please try again.`;
	};

	const extractWebhookErrorMessage = (payload: unknown, isDevEnvironment: boolean): string => {
		if (!payload) return '';
		if (typeof payload === 'string') return payload;
		if (Array.isArray(payload)) {
			for (const entry of payload) {
				if (!entry || typeof entry !== 'object') continue;
				const record = entry as TurnstileErrorEntry;
				const codes = Array.isArray(record['error-codes'])
					? record['error-codes'].filter((code): code is string => typeof code === 'string')
					: [];
				if (codes.length) return formatTurnstileError(codes, isDevEnvironment);
				const messages = Array.isArray(record.messages)
					? record.messages.filter((msg): msg is string => typeof msg === 'string')
					: [];
				if (messages.length) return messages.join(' ');
			}
			return '';
		}
		if (typeof payload === 'object') {
			const record = payload as TurnstileErrorEntry;
			if (typeof record.message === 'string') return record.message;
			if (typeof record.error === 'string') return record.error;
			const codes = Array.isArray(record['error-codes'])
				? record['error-codes'].filter((code): code is string => typeof code === 'string')
				: [];
			if (codes.length) return formatTurnstileError(codes, isDevEnvironment);
		}
		return '';
	};

	const resetTurnstile = () => {
		const turnstileWindow = getTurnstileWindow();
		turnstileWindow?.turnstile?.reset(getTurnstileTarget());
	};


	const initTurnstile = () => {
		const turnstileWindow = getTurnstileWindow();
		if (!turnstileWindow || !turnstileContainer) return;
		const { turnstile } = turnstileWindow;
		if (!turnstile) return;

		if (turnstileWidgetId) {
			turnstile.remove?.(turnstileWidgetId);
			turnstileWidgetId = undefined;
		}

		turnstileContainer.innerHTML = '';
		turnstileToken = '';
		const { siteKey, isDevelopment } = getTurnstileEnvironment();
		turnstileSiteKeyInUse = siteKey;
		turnstileIsDevelopmentSiteKey = isDevelopment;

		turnstileWidgetId = turnstile.render(turnstileContainer, {
			sitekey: siteKey,
			callback: (token) => {
				turnstileToken = token;
			},
			'expired-callback': () => {
				turnstileToken = '';
			},
			'error-callback': () => {
				turnstileToken = '';
			},
			'timeout-callback': () => {
				turnstileToken = '';
			},
			'refresh-expired': 'auto'
		});
	};

	const loadTurnstile = () => {
		const turnstileWindow = getTurnstileWindow();
		if (!turnstileWindow) return;

		if (turnstileWindow.turnstile) {
			initTurnstile();
			return;
		}

		const existing = document.getElementById('turnstile-script');
		if (existing) {
			existing.addEventListener('load', initTurnstile, { once: true });
			return;
		}

		turnstileWindow.onTurnstileLoad = () => initTurnstile();

		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
		script.async = true;
		script.defer = true;
		script.id = 'turnstile-script';
		document.head.appendChild(script);
	};

	onMount(() => {
		applyProgramSelectionFromUrl();
		loadTurnstile();

		return () => {
			const turnstileWindow = getTurnstileWindow();
			if (turnstileWidgetId) {
				turnstileWindow?.turnstile?.remove?.(turnstileWidgetId);
				turnstileWidgetId = undefined;
			}
			if (turnstileWindow) {
				turnstileWindow.onTurnstileLoad = undefined;
			}
		};
	});

	async function submitForm(event: Event) {
		event.preventDefault();
		if (status === 'sending') return;
		status = 'sending';
		errorMsg = '';

		if (!turnstileToken) {
			status = 'error';
			errorMsg = 'Please complete the verification challenge.';
			return;
		}

		if (!selectedProgram) {
			status = 'error';
			errorMsg = 'Please choose the training program.';
			return;
		}

		if (selectedProgram === 'other' && !customProgramTitle.trim()) {
			status = 'error';
			errorMsg = 'Please share the training program name.';
			return;
		}

		if (!relevance || !confidence || !likelihood) {
			status = 'error';
			errorMsg = 'Please complete the three rating questions.';
			return;
		}

		if (!mostHelpful.trim()) {
			status = 'error';
			errorMsg = 'Please share what was most helpful.';
			return;
		}

		if (!needsClarification.trim()) {
			status = 'error';
			errorMsg = 'Let us know what could use more explanation.';
			return;
		}

		if (!nextWeekValue.trim()) {
			status = 'error';
			errorMsg = 'Share what would make next week more valuable.';
			return;
		}

		try {
			const res = await fetch(getWebhookUrl(), {
				method: 'POST',
				mode: 'cors',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					programSlug: selectedProgram,
					programTitle:
						selectedProgram === 'other'
							? customProgramTitle.trim() || 'Other or not listed'
							: trainingPrograms.find((program) => program.slug === selectedProgram)?.title ??
								'Training program',
					relevance: Number(relevance),
					confidence: Number(confidence),
					likelihood: Number(likelihood),
					mostHelpful: mostHelpful.trim(),
					needsClarification: needsClarification.trim(),
					nextWeekValue: nextWeekValue.trim(),
					additionalFeedback: additionalFeedback.trim() || undefined,
					source: 'post-training-survey',
					createdAt: new Date().toISOString(),
					turnstileToken,
					turnstileSiteKey: turnstileSiteKeyInUse,
					turnstileIsDevelopmentSiteKey
				})
			});

			if (!res.ok) {
				let description = '';
				try {
					const data = await res.json();
					description = extractWebhookErrorMessage(data, turnstileIsDevelopmentSiteKey);
				} catch (err) {
					// ignore json parse failures here
				}
				throw new Error(description || `Webhook error: ${res.status}`);
			}

			status = 'sent';
			selectedProgram = defaultProgramSlug;
			customProgramTitle = '';
			relevance = '';
			confidence = '';
			likelihood = '';
			mostHelpful = '';
			needsClarification = '';
			nextWeekValue = '';
			additionalFeedback = '';
			turnstileToken = '';
			resetTurnstile();
		} catch (err: any) {
			status = 'error';
			errorMsg = err?.message ?? 'Something went wrong.';
			resetTurnstile();
			turnstileToken = '';
		}
	}
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/forms/post-training-survey"
	image={pageMeta.image}
	imageAlt={pageMeta.imageAlt}
/>

<section class="mx-auto max-w-3xl space-y-6 py-10">
	<div class="rounded-3xl border border-slate-200 bg-white p-6 shadow">
		<p class="text-xs font-semibold uppercase tracking-wide text-amber-600">Cambermast training</p>
		<h1 class="mt-2 text-4xl font-bold tracking-tight text-gray-900">Post-training Survey</h1>
		<p class="mt-3 text-gray-700">
			Help us make each session more valuable by sharing quick feedback. Your responses stay
			private unless you say otherwise.
		</p>
		<p class="mt-4 text-sm text-gray-600">
			Need to reach us?
			<a
				class="ml-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
				href="/contact"
			>
				Contact Bill
				<span class="ml-1" aria-hidden="true">-&gt;</span>
			</a>
		</p>
	</div>

	<form
		class="space-y-5"
		on:submit|preventDefault={submitForm}
		aria-busy={status === 'sending'}
	>
		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<label class="block text-base font-semibold text-gray-900" for="program">
				<span class="required-label">Which training program is this feedback for?</span>
				<span class="sr-only"> required</span>
			</label>
			<p class="mt-2 text-sm text-gray-600">Select the program or choose "Other".</p>
			<select
				class="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				id="program"
				name="program"
				bind:value={selectedProgram}
				required
			>
				<option value="" disabled>Select a program</option>
				{#each programOptions as option}
					<option value={option.slug}>{option.title}</option>
				{/each}
			</select>
			{#if selectedProgram === 'other'}
				<input
					class="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
					bind:value={customProgramTitle}
					type="text"
					name="programOther"
					placeholder="Share the program name"
					required
				/>
			{/if}
		</div>

		<fieldset class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<legend class="text-base font-semibold text-gray-900">
				<span class="required-label">
					Were this week's materials relevant to your work or current projects?
				</span>
				<span class="sr-only"> required</span>
			</legend>
			<div class="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
				<span class="text-sm text-gray-500">Not at all</span>
				<div class="flex items-center justify-between gap-3">
					{#each scaleOptions as option}
						<label class="flex flex-col items-center gap-2 text-sm font-semibold text-gray-600">
							<span>{option}</span>
							<input
								class="h-4 w-4"
								name="relevance"
								type="radio"
								value={String(option)}
								bind:group={relevance}
								required={option === scaleOptions[0]}
							/>
						</label>
					{/each}
				</div>
				<span class="text-sm text-gray-500">Very relevant</span>
			</div>
		</fieldset>

		<fieldset class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<legend class="text-base font-semibold text-gray-900">
				<span class="required-label">
					How confident do you feel about applying what you learned this week?
				</span>
				<span class="sr-only"> required</span>
			</legend>
			<div class="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
				<span class="text-sm text-gray-500">Not at all confident</span>
				<div class="flex items-center justify-between gap-3">
					{#each scaleOptions as option}
						<label class="flex flex-col items-center gap-2 text-sm font-semibold text-gray-600">
							<span>{option}</span>
							<input
								class="h-4 w-4"
								name="confidence"
								type="radio"
								value={String(option)}
								bind:group={confidence}
								required={option === scaleOptions[0]}
							/>
						</label>
					{/each}
				</div>
				<span class="text-sm text-gray-500">Very confident</span>
			</div>
		</fieldset>

		<fieldset class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<legend class="text-base font-semibold text-gray-900">
				<span class="required-label">
					How often would you put what you learned this week into your day-to-day work?
				</span>
				<span class="sr-only"> required</span>
			</legend>
			<div class="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
				<span class="text-sm text-gray-500">Not likely</span>
				<div class="flex items-center justify-between gap-3">
					{#each scaleOptions as option}
						<label class="flex flex-col items-center gap-2 text-sm font-semibold text-gray-600">
							<span>{option}</span>
							<input
								class="h-4 w-4"
								name="likelihood"
								type="radio"
								value={String(option)}
								bind:group={likelihood}
								required={option === scaleOptions[0]}
							/>
						</label>
					{/each}
				</div>
				<span class="text-sm text-gray-500">Very likely</span>
			</div>
		</fieldset>

		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<label class="block text-base font-semibold text-gray-900" for="most-helpful">
				<span class="required-label">
					What was the most helpful concept, tool, or technique you learned this week?
				</span>
				<span class="sr-only"> required</span>
			</label>
			<textarea
				class="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={mostHelpful}
				id="most-helpful"
				name="mostHelpful"
				rows="4"
				required
			></textarea>
		</div>

		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<label class="block text-base font-semibold text-gray-900" for="needs-clarification">
				<span class="required-label">
					Is there anything that confused you, or could you use more explanation?
				</span>
				<span class="sr-only"> required</span>
			</label>
			<textarea
				class="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={needsClarification}
				id="needs-clarification"
				name="needsClarification"
				rows="4"
				required
			></textarea>
		</div>

		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<label class="block text-base font-semibold text-gray-900" for="next-week">
				<span class="required-label">What would make next week more valuable for you?</span>
				<span class="sr-only"> required</span>
			</label>
			<textarea
				class="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={nextWeekValue}
				id="next-week"
				name="nextWeekValue"
				rows="4"
				required
			></textarea>
		</div>

		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<label class="block text-base font-semibold text-gray-900" for="additional-feedback">
				Optional: Any feedback or comments you'd like to share?
			</label>
			<textarea
				class="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={additionalFeedback}
				id="additional-feedback"
				name="additionalFeedback"
				rows="4"
			></textarea>
		</div>

		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<span class="block text-sm font-medium text-gray-700">
				Verification
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span>
			</span>
			<div
				class="mt-2 rounded-md border bg-white px-3 py-2"
				bind:this={turnstileContainer}
				aria-live="polite"
			>
				<noscript>Enable JavaScript to complete the verification step.</noscript>
			</div>
		</div>

		<div aria-live="polite">
			{#if status === 'sent'}
				<p class="text-sm text-green-600" role="status">
					Thanks for the feedback! We'll use it to shape upcoming sessions.
				</p>
			{:else if status === 'error'}
				<p class="text-sm text-red-600" role="alert">
					Something went wrong while submitting the form. Please try again or email
					<a class="font-semibold underline" href="mailto:bill.raymond@cambermast.com">
						bill.raymond@cambermast.com
					</a
					>.
					Error message: {errorMsg}
				</p>
			{:else if status === 'sending'}
				<p class="text-sm text-gray-600" role="status">Sending...</p>
			{/if}
		</div>

		<button
			class="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-blue-600 disabled:opacity-60"
			disabled={status === 'sending'}
			type="submit"
		>
			{status === 'sending' ? 'Sending...' : 'Submit survey'}
		</button>

		<p class="text-xs font-medium uppercase tracking-wide text-gray-500">
			Fields marked <span class="required-label required-label--inline" aria-hidden="true"></span>
			are required.
		</p>
		<p class="text-xs text-gray-500">
			We keep your responses so we can tailor future training. You can ask us to edit or delete
			your survey at any time. Full details live in our
			<a class="font-semibold text-blue-600 underline" href="/gdpr">GDPR & privacy overview</a>.
		</p>
	</form>
</section>

<style>
	:global(.required-label)::after {
		content: '\00a0*';
		color: #ef4444;
		font-weight: 600;
	}

	:global(.required-label--inline)::after {
		content: '*';
	}
</style>
