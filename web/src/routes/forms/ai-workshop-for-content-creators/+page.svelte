<script lang="ts">
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getTrainingProgram } from '$lib/data/training';

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

	const programSlug = 'ai-workshop-for-content-creators';
	const program = getTrainingProgram(programSlug);

	const skillLevelOptions = [
		{
			value: 'just-starting',
			label: 'Just starting: I hardly use AI and am here to learn.'
		},
		{
			value: 'beginner',
			label: 'Beginner: I know some basic prompts and occasionally use AI.'
		},
		{
			value: 'intermediate',
			label: 'Intermediate: I use AI regularly for my job and have a good grasp on prompting.'
		},
		{
			value: 'advanced',
			label: 'Advanced: I use AI every day to streamline my work and consider myself to be great at prompting.'
		},
		{
			value: 'power-user',
			label: 'Power user: I use AI every day and have created custom workflows and pipelines to automate my work.'
		},
		{ value: 'other', label: 'Other' }
	];

	const llmOptions = [
		{ value: 'chatgpt', label: 'ChatGPT' },
		{ value: 'claude', label: 'Claude' },
		{ value: 'gemini', label: 'Gemini' },
		{ value: 'copilot', label: 'Copilot' },
		{ value: 'other', label: 'Other' }
	];

	const paidAccessOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'will-before', label: 'No, but I will before the workshop starts' },
		{ value: 'no', label: 'No' }
	];

	const roleOptions = [
		{ value: 'technical-writer', label: 'Technical writer or documentation specialist' },
		{ value: 'content-strategist', label: 'Content strategist or manager' },
		{ value: 'ux-writer', label: 'UX writer or designer' },
		{ value: 'marketing', label: 'Marketing or communications professional' },
		{ value: 'educator', label: 'Educator or trainer' },
		{ value: 'other', label: 'Other' }
	];

	const contentOptions = [
		{ value: 'technical-docs', label: 'Technical documentation' },
		{ value: 'knowledge-base', label: 'Knowledge base or help center content' },
		{ value: 'training-materials', label: 'Training or educational materials' },
		{ value: 'marketing-content', label: 'Marketing or web content' },
		{ value: 'release-notes', label: 'Product or release notes' },
		{ value: 'other', label: 'Other' }
	];

	const communityOptions = [
		{ value: 'slack', label: 'Slack' },
		{ value: 'discord', label: 'Discord' },
		{ value: 'google-meet', label: 'Google Meet' },
		{ value: 'teams', label: 'Teams' },
		{ value: 'email', label: 'Email' },
		{ value: 'none', label: 'I am not interested in these communications.' },
		{ value: 'other', label: 'Other' }
	];

	const productionTurnstileSiteKey = '0x4AAAAAACJwz83T0R7vFAHk';
	const developmentTurnstileSiteKey = '1x00000000000000000000AA';
	const productionBaseDomains = ['cambermast.com'];
	const productionWebhookUrl = 'https://n8n.cambermast.com/webhook/575c03a2-94cb-49f4-bf41-6def76e5c68a';
	const developmentWebhookUrl =
		'https://n8n.cambermast.com/webhook-test/575c03a2-94cb-49f4-bf41-6def76e5c68a';

	const devPrefill = dev
		? {
				email: 'alex.writer@example.com',
				name: 'Alex Kim (she/her)',
				skillLevel: 'intermediate',
				llmFamiliarity: ['chatgpt', 'claude'],
				paidAccess: 'yes',
				roles: ['technical-writer'],
				contentTypes: ['technical-docs', 'knowledge-base'],
				aiToolsExperience:
					'I use Copilot in Word for summaries and ChatGPT to draft release notes. I love the speed but need help keeping tone consistent.',
				communityInterests: ['slack'],
				syllabusSuggestions: 'I would like more examples of governance guardrails and content QA workflows.',
				workshopGoal:
					'When this workshop is complete, I will have a prompt toolkit that matches our style guide.',
				additionalNotes: 'Looking forward to collaborating with the group.',
				accessibilityNeeds: 'None at this time.'
			}
		: undefined;

	let email = devPrefill?.email ?? '';
	let name = devPrefill?.name ?? '';
	let skillLevel = devPrefill?.skillLevel ?? '';
	let skillLevelOther = '';
	let llmFamiliarity: string[] = devPrefill?.llmFamiliarity ?? [];
	let llmOther = '';
	let paidAccess = devPrefill?.paidAccess ?? '';
	let roles: string[] = devPrefill?.roles ?? [];
	let roleOther = '';
	let contentTypes: string[] = devPrefill?.contentTypes ?? [];
	let contentOther = '';
	let aiToolsExperience = devPrefill?.aiToolsExperience ?? '';
	let communityInterests: string[] = devPrefill?.communityInterests ?? [];
	let communityOther = '';
	let syllabusSuggestions = devPrefill?.syllabusSuggestions ?? '';
	let workshopGoal = devPrefill?.workshopGoal ?? '';
	let additionalNotes = devPrefill?.additionalNotes ?? '';
	let accessibilityNeeds = devPrefill?.accessibilityNeeds ?? '';
	let status: FormStatus = 'idle';
	let errorMsg = '';
	let turnstileToken = '';
	let turnstileContainer: HTMLDivElement | null = null;
	let turnstileWidgetId: string | undefined;
	let turnstileSiteKeyInUse = productionTurnstileSiteKey;
	let turnstileIsDevelopmentSiteKey = false;

	const pageMeta = {
		title: 'Pre-training Survey for the AI Workshop for Content Creators',
		description:
			'Help Bill fine-tune the AI Workshop for Tech Writers and Content Creators by sharing your goals, tools, and expectations.',
		image: program?.heroImage ?? '/images/ai-workshop-for-content-creators.jpeg',
		imageAlt:
			program?.heroImageAlt ?? 'AI Workshop for Tech Writers and Content Creators illustration.'
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

	const handleCommunityChange = (value: string) => {
		if (value === 'none') {
			if (communityInterests.includes('none')) {
				communityInterests = ['none'];
			}
			return;
		}
		if (communityInterests.includes('none')) {
			communityInterests = communityInterests.filter((option) => option !== 'none');
		}
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

	const normalizeOptions = (selected: string[], options: { value: string; label: string }[]) => {
		const labelMap = new Map(options.map((option) => [option.value, option.label]));
		return selected.map((value) => ({ value, label: labelMap.get(value) ?? value }));
	};

	const getSkillLevelLabel = () =>
		skillLevelOptions.find((option) => option.value === skillLevel)?.label ?? skillLevel;

	$: if (!llmFamiliarity.includes('other')) llmOther = '';
	$: if (!roles.includes('other')) roleOther = '';
	$: if (!contentTypes.includes('other')) contentOther = '';
	$: if (!communityInterests.includes('other')) communityOther = '';
	$: if (skillLevel !== 'other') skillLevelOther = '';

	onMount(() => {
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

		const sanitizedEmail = email.trim();
		if (!sanitizedEmail) {
			status = 'error';
			errorMsg = 'Please enter your email address.';
			return;
		}

		const sanitizedName = name.trim();
		if (!sanitizedName) {
			status = 'error';
			errorMsg = 'Please share your name.';
			return;
		}

		if (!skillLevel) {
			status = 'error';
			errorMsg = 'Select a skill level.';
			return;
		}

		if (skillLevel === 'other' && !skillLevelOther.trim()) {
			status = 'error';
			errorMsg = 'Tell us about your skill level.';
			return;
		}

		if (!llmFamiliarity.length) {
			status = 'error';
			errorMsg = 'Select at least one AI model you are familiar with.';
			return;
		}

		if (llmFamiliarity.includes('other') && !llmOther.trim()) {
			status = 'error';
			errorMsg = 'Share the other AI model you use.';
			return;
		}

		if (!paidAccess) {
			status = 'error';
			errorMsg = 'Let us know if you will have access to a paid AI tool.';
			return;
		}

		if (roles.includes('other') && !roleOther.trim()) {
			status = 'error';
			errorMsg = 'Please share your role when selecting "Other".';
			return;
		}

		if (contentTypes.includes('other') && !contentOther.trim()) {
			status = 'error';
			errorMsg = 'Please share the other content type you manage.';
			return;
		}

		if (communityInterests.includes('other') && !communityOther.trim()) {
			status = 'error';
			errorMsg = 'Let us know which other community option you prefer.';
			return;
		}

		try {
			const res = await fetch(getWebhookUrl(), {
				method: 'POST',
				mode: 'cors',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: sanitizedEmail,
					name: sanitizedName,
					programSlug,
					programTitle: program?.title,
					skillLevel,
					skillLevelLabel: getSkillLevelLabel(),
					skillLevelOther: skillLevel === 'other' ? skillLevelOther.trim() : undefined,
					llmFamiliarity,
					llmFamiliarityLabels: normalizeOptions(llmFamiliarity, llmOptions),
					llmOther: llmFamiliarity.includes('other') ? llmOther.trim() : undefined,
					paidAccess,
					paidAccessLabel:
						paidAccessOptions.find((option) => option.value === paidAccess)?.label ?? paidAccess,
					roles,
					roleLabels: normalizeOptions(roles, roleOptions),
					roleOther: roles.includes('other') ? roleOther.trim() : undefined,
					contentTypes,
					contentTypeLabels: normalizeOptions(contentTypes, contentOptions),
					contentOther: contentTypes.includes('other') ? contentOther.trim() : undefined,
					aiToolsExperience: aiToolsExperience.trim() || undefined,
					communityInterests,
					communityLabels: normalizeOptions(communityInterests, communityOptions),
					communityOther: communityInterests.includes('other') ? communityOther.trim() : undefined,
					syllabusSuggestions: syllabusSuggestions.trim() || undefined,
					workshopGoal: workshopGoal.trim() || undefined,
					additionalNotes: additionalNotes.trim() || undefined,
					accessibilityNeeds: accessibilityNeeds.trim() || undefined,
					source: 'ai-workshop-content-creators-pretraining',
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
			email = '';
			name = '';
			skillLevel = '';
			skillLevelOther = '';
			llmFamiliarity = [];
			llmOther = '';
			paidAccess = '';
			roles = [];
			roleOther = '';
			contentTypes = [];
			contentOther = '';
			aiToolsExperience = '';
			communityInterests = [];
			communityOther = '';
			syllabusSuggestions = '';
			workshopGoal = '';
			additionalNotes = '';
			accessibilityNeeds = '';
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
	path="/forms/ai-workshop-for-content-creators"
	image={pageMeta.image}
	imageAlt={pageMeta.imageAlt}
/>

<section class="mx-auto max-w-3xl space-y-6 py-10">
	<figure
		class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-amber-100 bg-white/80 p-2 shadow-lg shadow-amber-100/50"
	>
		<img
			class="h-auto w-full rounded-2xl object-cover"
			src={pageMeta.image}
			alt={pageMeta.imageAlt}
			loading="lazy"
		/>
	</figure>

	<p class="text-center text-sm font-semibold uppercase tracking-wide text-amber-700">
		AI Workshop for Tech Writers and Content Creators
	</p>

	<div class="space-y-4 text-center">
		<h1 class="text-4xl font-bold tracking-tight text-gray-900">
			Pre-training Survey for the AI Workshop for Content Creators
		</h1>
		<p class="text-gray-700">
			To make the most of this workshop, please thoughtfully respond to the prompts in this form.
			Your responses help Bill fine-tune the experience for you.
		</p>
		<p class="text-sm text-gray-600">
			After you submit the form, you will receive a copy of your response. Your responses remain
			confidential and inform Bill's preparation and refinement of this workshop.
		</p>
		<p class="text-sm text-gray-600">
			Have questions or need to reach me? Email: Bill.Raymond@BillTalksAI.com Phone: +1 (415)
			305-2595
		</p>
	</div>

	<form
		class="space-y-6 rounded-3xl border border-blue-100 bg-white px-4 py-6 shadow-lg shadow-blue-100/80 sm:p-8"
		on:submit|preventDefault={submitForm}
		aria-busy={status === 'sending'}
	>
		<div>
			<label class="block text-sm font-semibold uppercase tracking-wide text-gray-600" for="email">
				<span class="required-label">Email</span>
				<span class="sr-only"> required</span>
			</label>
			<input
				class="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={email}
				id="email"
				name="email"
				type="email"
				required
			/>
		</div>

		<div>
			<label class="block text-sm font-semibold uppercase tracking-wide text-gray-600" for="name">
				<span class="required-label">Please share your name</span>
				<span class="sr-only"> required</span>
			</label>
			<p class="mt-1 text-xs text-gray-500">
				Optionally, include what you prefer to be called and your pronouns.
			</p>
			<input
				class="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={name}
				id="name"
				name="name"
				type="text"
				placeholder='William Raymond. Call me "Bill, like the Dollar" (he/him)'
				required
			/>
		</div>

		<fieldset class="border-0 p-0">
			<legend class="block text-sm font-semibold uppercase tracking-wide text-gray-600">
				<span class="required-label">
					Consider your interactions with AI. How would you rate your skill level?
				</span>
				<span class="sr-only"> required</span>
			</legend>
			<p class="mt-1 text-xs text-gray-500">Select one.</p>
			<div class="mt-3 space-y-2">
				{#each skillLevelOptions as option}
					<label class="flex items-start gap-3" for={`skill-${option.value}`}>
						<input
							class="mt-1 h-4 w-4"
							id={`skill-${option.value}`}
							name="skillLevel"
							type="radio"
							value={option.value}
							bind:group={skillLevel}
							required={option.value === skillLevelOptions[0].value}
						/>
						<span class="text-sm text-gray-700">{option.label}</span>
					</label>
					{#if option.value === 'other' && skillLevel === 'other'}
						<input
							class="ml-7 mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
							bind:value={skillLevelOther}
							type="text"
							name="skillLevelOther"
							placeholder="Describe your AI skill level"
							required
						/>
					{/if}
				{/each}
			</div>
		</fieldset>

		<fieldset class="border-0 p-0">
			<legend class="block text-sm font-semibold uppercase tracking-wide text-gray-600">
				<span class="required-label">
					What foundational large language models are you familiar with?
				</span>
				<span class="sr-only"> required</span>
			</legend>
			<p class="mt-1 text-xs text-gray-500">Select all that apply.</p>
			<div class="mt-3 space-y-2">
				{#each llmOptions as option}
					<label class="flex items-start gap-3" for={`llm-${option.value}`}>
						<input
							class="mt-1 h-4 w-4"
							id={`llm-${option.value}`}
							name="llmFamiliarity"
							type="checkbox"
							value={option.value}
							bind:group={llmFamiliarity}
						/>
						<span class="text-sm text-gray-700">{option.label}</span>
					</label>
					{#if option.value === 'other' && llmFamiliarity.includes('other')}
						<input
							class="ml-7 mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
							bind:value={llmOther}
							type="text"
							name="llmOther"
							placeholder="Which other model?"
							required
						/>
					{/if}
				{/each}
			</div>
		</fieldset>

		<fieldset class="border-0 p-0">
			<legend class="block text-sm font-semibold uppercase tracking-wide text-gray-600">
				<span class="required-label">
					Will you attend the workshop with access to a paid version of an AI LLM?
				</span>
				<span class="sr-only"> required</span>
			</legend>
			<p class="mt-1 text-xs text-gray-500">
				To get the most value out of this workshop, you should have access to a paid version of an
				AI app. ChatGPT Plus is $20/month at the time of this survey.
				<a
					class="font-semibold text-blue-600 underline"
					href="https://openai.com/chatgpt/pricing/"
					target="_blank"
					rel="noreferrer"
				>
					View pricing
				</a>
			</p>
			<div class="mt-3 space-y-2">
				{#each paidAccessOptions as option}
					<label class="flex items-start gap-3" for={`paid-${option.value}`}>
						<input
							class="mt-1 h-4 w-4"
							id={`paid-${option.value}`}
							name="paidAccess"
							type="radio"
							value={option.value}
							bind:group={paidAccess}
							required={option.value === paidAccessOptions[0].value}
						/>
						<span class="text-sm text-gray-700">{option.label}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<fieldset class="border-0 p-0">
			<legend class="block text-sm font-semibold uppercase tracking-wide text-gray-600">
				What best describes your current role?
			</legend>
			<p class="mt-1 text-xs text-gray-500">Select all that apply.</p>
			<div class="mt-3 space-y-2">
				{#each roleOptions as option}
					<label class="flex items-start gap-3" for={`role-${option.value}`}>
						<input
							class="mt-1 h-4 w-4"
							id={`role-${option.value}`}
							name="roles"
							type="checkbox"
							value={option.value}
							bind:group={roles}
						/>
						<span class="text-sm text-gray-700">{option.label}</span>
					</label>
					{#if option.value === 'other' && roles.includes('other')}
						<input
							class="ml-7 mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
							bind:value={roleOther}
							type="text"
							name="roleOther"
							placeholder="Share your role"
							required
						/>
					{/if}
				{/each}
			</div>
		</fieldset>

		<fieldset class="border-0 p-0">
			<legend class="block text-sm font-semibold uppercase tracking-wide text-gray-600">
				What types of content do you create or manage?
			</legend>
			<p class="mt-1 text-xs text-gray-500">Select all that apply.</p>
			<div class="mt-3 space-y-2">
				{#each contentOptions as option}
					<label class="flex items-start gap-3" for={`content-${option.value}`}>
						<input
							class="mt-1 h-4 w-4"
							id={`content-${option.value}`}
							name="contentTypes"
							type="checkbox"
							value={option.value}
							bind:group={contentTypes}
						/>
						<span class="text-sm text-gray-700">{option.label}</span>
					</label>
					{#if option.value === 'other' && contentTypes.includes('other')}
						<input
							class="ml-7 mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
							bind:value={contentOther}
							type="text"
							name="contentOther"
							placeholder="Share the other content type"
							required
						/>
					{/if}
				{/each}
			</div>
		</fieldset>

		<div>
			<label
				class="block text-sm font-semibold uppercase tracking-wide text-gray-600"
				for="ai-tools"
			>
				Consider the apps you use every day to produce and deliver content.
			</label>
			<p class="mt-1 text-xs text-gray-500">
				If applicable, share a few sentences about the product(s), how you use them, what you like,
				and what you do not like about those AI features.
			</p>
			<p class="mt-1 text-xs text-gray-500 italic">
				Example: "I use Copilot in Microsoft Word to help me summarize my content for social media
				posts."
			</p>
			<textarea
				class="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={aiToolsExperience}
				id="ai-tools"
				name="aiToolsExperience"
				rows="4"
			></textarea>
		</div>

		<fieldset class="border-0 p-0">
			<legend class="block text-sm font-semibold uppercase tracking-wide text-gray-600">
				Bill is exploring a shared space for participants to connect and support one another.
			</legend>
			<p class="mt-1 text-xs text-gray-500">Select all that apply.</p>
			<div class="mt-3 space-y-2">
				{#each communityOptions as option}
					<label class="flex items-start gap-3" for={`community-${option.value}`}>
						<input
							class="mt-1 h-4 w-4"
							id={`community-${option.value}`}
							name="communityInterests"
							type="checkbox"
							value={option.value}
							bind:group={communityInterests}
							on:change={() => handleCommunityChange(option.value)}
						/>
						<span class="text-sm text-gray-700">{option.label}</span>
					</label>
					{#if option.value === 'other' && communityInterests.includes('other')}
						<input
							class="ml-7 mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
							bind:value={communityOther}
							type="text"
							name="communityOther"
							placeholder="Share another option"
							required
						/>
					{/if}
				{/each}
			</div>
		</fieldset>

		<div>
			<label
				class="block text-sm font-semibold uppercase tracking-wide text-gray-600"
				for="syllabus"
			>
				Please think about the workshop syllabus. Is there anything additional you would like to
				cover?
			</label>
			<p class="mt-1 text-xs text-gray-500">
				Workshop website and syllabus:
				<a
					class="font-semibold text-blue-600 underline"
					href="https://sites.google.com/cambermast.com/ai-workshop-for-content-creato/home"
					target="_blank"
					rel="noreferrer"
				>
					Open the syllabus
				</a>
			</p>
			<textarea
				class="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={syllabusSuggestions}
				id="syllabus"
				name="syllabusSuggestions"
				rows="4"
			></textarea>
		</div>

		<div>
			<label
				class="block text-sm font-semibold uppercase tracking-wide text-gray-600"
				for="workshop-goal"
			>
				Think about what you personally want to get out of this workshop and finish this sentence:
				When this workshop is complete, I...
			</label>
			<p class="mt-1 text-xs text-gray-500">
				Example: When this workshop is complete, I will have the prompting skills to make AI write
				content based on my style and writing guidelines.
			</p>
			<textarea
				class="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={workshopGoal}
				id="workshop-goal"
				name="workshopGoal"
				rows="4"
			></textarea>
		</div>

		<div>
			<label
				class="block text-sm font-semibold uppercase tracking-wide text-gray-600"
				for="additional"
			>
				Is there anything else you would like to share?
			</label>
			<textarea
				class="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={additionalNotes}
				id="additional"
				name="additionalNotes"
				rows="4"
			></textarea>
		</div>

		<div>
			<label
				class="block text-sm font-semibold uppercase tracking-wide text-gray-600"
				for="accessibility"
			>
				Do you have any accessibility or special accommodation needs?
			</label>
			<div class="mt-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-gray-700">
				<p>This workshop is live on Zoom and uses the following features:</p>
				<ul class="mt-2 list-disc space-y-1 pl-5">
					<li>Share presentations</li>
					<li>Chat in real time (text and voice)</li>
					<li>Run polls and surveys (live or offline)</li>
					<li>Screen sharing (by the host and optionally for those who wish to share their screen)</li>
				</ul>
				<p class="mt-3">
					After the workshop, we offer optional (but highly recommended) exercises. You will use
					shared Google Docs and AI tools like ChatGPT, Claude, Gemini, or Copilot.
				</p>
				<p class="mt-3">Let Bill know how he can do anything to support your full participation.</p>
			</div>
			<textarea
				class="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={accessibilityNeeds}
				id="accessibility"
				name="accessibilityNeeds"
				rows="4"
			></textarea>
		</div>

		<div>
			<span class="block text-sm font-medium text-gray-700">
				Verification
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span></span
			>
			<div
				class="mt-1 rounded-md border bg-white px-3 py-2"
				bind:this={turnstileContainer}
				aria-live="polite"
			>
				<noscript>Enable JavaScript to complete the verification step.</noscript>
			</div>
		</div>

		<div aria-live="polite">
			{#if status === 'sent'}
				<p class="text-sm text-green-600" role="status">
					Thank you for sharing! We'll review your responses and follow up as needed.
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
			We keep your responses so we can tailor the workshop experience. You can ask us to edit or
			delete your survey at any time. Full details live in our
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
