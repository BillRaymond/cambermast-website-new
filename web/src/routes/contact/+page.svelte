<script lang="ts">
	import { onMount } from 'svelte';
	import { listTrainingPrograms } from '$lib/data/training';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import TurnstileField from '$lib/components/forms/TurnstileField.svelte';

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

	const trainingPrograms = listTrainingPrograms()
		.slice()
		.sort((a, b) => a.title.localeCompare(b.title))
		.map((program) => ({ slug: program.slug, title: program.title }));

	const serviceTopics = [
		{ slug: 'ai-agents', title: 'AI Agents' },
		{ slug: 'ai-advisory-services', title: 'AI Advisory Services' },
		{ slug: 'project-management', title: 'Project Management' },
		{ slug: 'project-server-migrations', title: 'Project Server migrations' }
	];

	const contactOptions = [
		...trainingPrograms,
		...serviceTopics,
		{ slug: 'other', title: 'Something else' }
	];

	const productionTurnstileSiteKey = '0x4AAAAAACJwz83T0R7vFAHk';
	const developmentTurnstileSiteKey = '1x00000000000000000000AA';
	const productionBaseDomains = ['cambermast.com'];

	let name = '';
	let email = '';
	let message = '';
	let selectedProgram = '';
	let status: FormStatus = 'idle';
	let errorMsg = '';
	let turnstileToken = '';
	let turnstileContainer: HTMLDivElement | null = null;
	let turnstileWidgetId: string | undefined;
	let turnstileSiteKeyInUse = productionTurnstileSiteKey;
	let turnstileIsDevelopmentSiteKey = false;
	let skipNextCalClick = false;

	const getTurnstileTarget = (): string | HTMLElement | undefined =>
		turnstileWidgetId ?? turnstileContainer ?? undefined;

	const resetTurnstile = () => {
		const turnstileWindow = getTurnstileWindow();
		turnstileWindow?.turnstile?.reset(getTurnstileTarget());
	};

	const getTurnstileWindow = (): TurnstileWindow | undefined => {
		if (typeof window === 'undefined') return undefined;
		return window as TurnstileWindow;
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

	const webhook = 'https://n8n.cambermast.com/webhook/0095b76c-c32c-49ce-a59d-de6435af2b3e';

	const getProgramTitle = (slug: string): string =>
		contactOptions.find((option) => option.slug === slug)?.title ??
		'General question / other topic';

	const pageMeta = getSeo('/contact');

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
			sitekey: turnstileSiteKeyInUse,
			theme: 'light',
			'refresh-expired': 'auto',
			callback: (token: string) => {
				turnstileToken = token;
				if (status === 'error' && errorMsg.includes('verification')) {
					status = 'idle';
					errorMsg = '';
				}
			},
			'expired-callback': () => {
				turnstileToken = '';
			}
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
		loadTurnstile();

		return () => {
			const turnstileWindow = getTurnstileWindow();
			if (!turnstileWindow) return;
			if (turnstileWidgetId) {
				turnstileWindow.turnstile?.remove?.(turnstileWidgetId);
				turnstileWidgetId = undefined;
			}
			turnstileWindow.onTurnstileLoad = undefined;
		};
	});

	async function submitForm(e: Event) {
		e.preventDefault();
		status = 'sending';
		errorMsg = '';

		try {
			if (!turnstileToken) {
				status = 'error';
				errorMsg = 'Please complete the verification challenge.';
				return;
			}

			const res = await fetch(webhook, {
				method: 'POST',
				mode: 'cors',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					email,
					message,
					programSlug: selectedProgram,
					programTitle: getProgramTitle(selectedProgram),
					source: 'cambermast.com',
					turnstileToken,
					turnstileSiteKey: turnstileSiteKeyInUse,
					turnstileIsDevelopmentSiteKey
				})
			});

			if (!res.ok) {
				let description = '';
				try {
					const data = await res.json();
					description =
						(data as { message?: string; error?: string })?.message ??
						(data as { message?: string; error?: string })?.error ??
						'';
				} catch (err) {
					// ignore JSON parse errors from error responses
				}
				throw new Error(description || `Webhook error: ${res.status}`);
			}
			status = 'sent';
			turnstileToken = '';
			resetTurnstile();
		} catch (err: any) {
			status = 'error';
			errorMsg = err?.message ?? 'Something went wrong.';
			resetTurnstile();
			turnstileToken = '';
		}
	}

	// Cal.com bookings now open in a new tab, so no additional JS needed.
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/contact" />

<section class="mb-8 max-w-3xl space-y-3">
	<h1 class="text-3xl font-bold">Contact us about anything</h1>
	<p class="text-gray-700">
		You can contact Bill and his team about any topic that interests you, including booking AI
		training, designing a private workshop, building AI agents, planning advisory services, managing
		projects, or starting a new collaboration.
	</p>
</section>

<section class="mb-8 max-w-3xl rounded-2xl border bg-blue-50 p-6 text-blue-900 shadow">
	<h2 class="text-xl font-semibold">What's happening now</h2>
	<p class="mt-1 text-sm">
		Review the calendar to see which trainings or events are actively happening right now.
	</p>
	<a
		class="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
		href="/calendar"
	>
		🗓️ View the calendar
	</a>
</section>

<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
	<form
		class="space-y-4 rounded-2xl border bg-white p-6 shadow"
		on:submit|preventDefault={submitForm}
		aria-busy={status === 'sending'}
	>
		<div>
			<label class="block text-sm font-medium text-gray-700" for="contact-name"
				>Your full name
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span></label
			>
			<input
				class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={name}
				id="contact-name"
				name="name"
				type="text"
				required
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700" for="contact-email"
				>Your email address
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span></label
			>
			<input
				class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={email}
				id="contact-email"
				name="email"
				type="email"
				required
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700" for="contact-program"
				>What would you like to talk about?
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span></label
			>
			<select
				class="mt-1 w-full rounded-md border bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={selectedProgram}
				id="contact-program"
				name="training"
				required
			>
				<option value="" disabled selected={!selectedProgram}>-- Pick a topic --</option>
				{#each contactOptions as option}
					<option value={option.slug}>{option.title}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700" for="contact-message"
				>Your message
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span></label
			>
			<textarea
				class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={message}
				id="contact-message"
				name="message"
				rows="5"
				required
			></textarea>
		</div>

		<TurnstileField bind:containerRef={turnstileContainer} />

		<div aria-live="polite">
			{#if status === 'sent'}
				<p class="text-sm text-green-600" role="status">Thanks! We’ll get back to you soon.</p>
			{:else if status === 'error'}
				<p class="text-sm text-red-600" role="alert">
					I am sorry. There was a problem with the form. Try contacting Bill directly at <a
						href="mailto:Bill.Raymond@Cambermast.com">Bill.Raymond@Cambermast.com</a
					>. Error message: {errorMsg}.
				</p>
			{:else if status === 'sending'}
				<p class="text-sm text-gray-600" role="status">Sending your message…</p>
			{/if}
		</div>

		<button
			class="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
			disabled={status === 'sending'}
			type="submit"
		>
			{status === 'sending' ? 'Sending…' : 'Send message'}
		</button>

		<p class="text-xs font-medium tracking-wide text-gray-500 uppercase">
			Fields marked <span class="text-red-500" aria-hidden="true">*</span> are required.
		</p>
		<p class="text-xs text-gray-500">
			We use your details only to respond to this inquiry and plan services you request. Learn more
			in our <a class="font-semibold text-blue-600 underline" href="/gdpr"
				>GDPR & privacy overview</a
			>.
		</p>
	</form>

	<div class="space-y-5">
		<section class="rounded-2xl border bg-blue-50 p-6 text-blue-900 shadow">
			<h2 class="text-xl font-semibold">Need a live consult?</h2>
			<p class="mt-2 text-sm text-blue-900">
				See paid consultation options with Bill and pick the time that matches your needs.
			</p>
			<a
				class="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
				href="/connect"
			>
				View consultation options
			</a>
		</section>

		<section class="rounded-2xl border bg-white p-5 text-sm text-gray-700 shadow">
			<p>
				Prefer email? Reach out at
				<a class="font-medium text-blue-600 underline" href="mailto:bill.raymond@cambermast.com"
					>bill.raymond@cambermast.com</a
				>.
			</p>
		</section>
	</div>
</div>
