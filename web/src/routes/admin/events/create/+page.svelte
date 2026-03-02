<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import AdminImageGenPanel from '$lib/components/admin/AdminImageGenPanel.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	type DraftMode = 'training' | 'external';
	type CampaignMode = 'auto' | 'existing' | 'none';
	type CopySourceType = 'event' | 'training_program';
	type AiDraft = {
		title?: string;
		slug?: string;
		subtitle?: string;
		tagline?: string;
		summary?: string;
		ctaLabel?: string;
		descriptionBodyMd?: string;
		highlights?: string[];
		audienceBullets?: string[];
		outcomes?: string[];
		agenda?: Array<{ title: string; outcome?: string; details?: string }>;
		faq?: Array<{ question: string; answer: string }>;
	};

	const pageMeta = {
		title: 'Create Event (Dev) | Admin | Cambermast',
		description: 'Dev-only event builder with training/external modes and embedded image generation.'
	};
	const eventTypeOptions = [
		'training_session',
		'webinar',
		'conference_talk',
		'community',
		'workshop',
		'talk',
		'panel',
		'roundtable',
		'fireside',
		'event',
		'other'
	] as const;
	const eventTypeLabelOptions = [
		'Training',
		'Webinar',
		'Conference talk',
		'Community',
		'Workshop',
		'Talk',
		'Panel',
		'Roundtable',
		'Fireside',
		'Event',
		'Other'
	] as const;
	const ctaLabelOptions = [
		'Register now',
		'Join waitlist',
		'Learn more',
		'Get tickets',
		'Reserve your spot',
		'Enrollment closed'
	] as const;
	const locationLabelOptions = ['Online', 'In-person', 'Hybrid', 'TBD'] as const;
	const toneOptions = [
		'practical and concise',
		'friendly and practical',
		'executive and concise',
		'clear and instructional',
		'professional and approachable'
	] as const;
	const utmSourceOptions = ['qr', 'newsletter', 'linkedin', 'partner-site', 'email'] as const;
	const utmMediumOptions = ['offline', 'email', 'social', 'referral'] as const;

	const trainingPrograms = data.trainingPrograms ?? [];
	const partners = data.partners ?? [];
	const existingEvents = data.existingEvents ?? [];
	const existingCampaignIds = data.existingCampaignIds ?? [];
	const campaignPartnerOptions = [
		'cambermast',
		...partners.map((partner) => partner.code.toLowerCase())
	].filter((value, index, array) => array.indexOf(value) === index);

	let mode: DraftMode = 'training';
	let campaignMode: CampaignMode = 'auto';
	let copySourceType: CopySourceType = 'event';
	let copyEventId = '';
	let copyProgramSku = trainingPrograms[0]?.sku ?? '';

	let eventId = data.defaults.eventId;
	let campaignId = data.defaults.campaignId;
	let slug = '';
	let title = '';
	let subtitle = '';
	let tagline = '';
	let summary = '';
	let descriptionBodyMd = '';
	let highlightsText = '';
	let audienceBulletsText = '';
	let outcomesText = '';
	let agendaText = '';
	let faqText = '';
	let type = 'event';
	let typeLabel = '';
	let visibility: 'public' | 'unlisted' | 'draft' = 'draft';
	let lifecycleStatus: 'scheduled' | 'postponed' | 'canceled' | 'completed' = 'scheduled';
	let registrationStatus: 'open' | 'closed' | 'external' | 'none' | 'waitlist' | 'sold_out' = 'closed';
	let ctaLabel = 'Register now';
	let ctaUrl = '';
	let locationMode: 'online' | 'in_person' | 'hybrid' = 'online';
	let locationPublicLabel = 'Online';
	let locationDetailsVisibility: 'public' | 'post_signup' | 'tbd' = 'public';
	let selectedPartnerCodes: string[] = [];

	let programSku = trainingPrograms[0]?.sku ?? '';
	let startDate = '';
	let startTimeLocal = '';
	let durationDays = '';
	let estimatedHoursCommitment = '';
	let sessionsText = '';

	let heroImage = '';
	let image = '';
	let heroImageAlt = '';
	let imageAlt = '';

	let campaignPartner = 'cambermast';
	let campaignPartnerLabel = 'Cambermast';
	let utmSource = 'qr';
	let utmMedium = 'offline';
	let utmCampaign = 'events';
	let campaignSrc = 'qr';
	let campaignAd = 'cambermast';
	let campaignDescription = '';
	let existingCampaignId = existingCampaignIds[0] ?? '';

	let saving = false;
	let loadingPreview = false;
	let aiLoading = false;
	let errorMessage = '';
	let successMessage = '';
	let previewResult = '';
	let aiResult = '';

	let aiAudience = '';
	let aiPrimaryOutcome = '';
	let aiFormatAndDelivery = '';
	let aiPartnerContext = '';
	let aiCtaGoal = '';
	let aiTone = 'practical and concise';
	let aiConstraints = 'Do not invent pricing, credentials, partners, or dates.';
	let aiKeyTopics = '';
	let aiFaqFocus = '';

	$: selectedTrainingProgram = trainingPrograms.find((program) => program.sku === programSku);

	const slugify = (value: string): string =>
		value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.replace(/-{2,}/g, '-');

	const parseLines = (value: string): string[] =>
		value
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);

	const parseSessions = (): Array<{ startAtUtc: string; endAtUtc: string }> =>
		sessionsText
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => {
				const [startAtUtc, endAtUtc] = line.split('|').map((value) => value?.trim() ?? '');
				return { startAtUtc, endAtUtc };
			});

	const parseAgenda = (): Array<{ title: string; outcome?: string; details?: string }> =>
		agendaText
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => {
				const splitByDouble = line.includes('||') ? line.split('||') : line.split('|');
				const [title, outcome, details] = splitByDouble.map((value) => value?.trim() ?? '');
				return { title, outcome: outcome || undefined, details: details || undefined };
			})
			.filter((item) => Boolean(item.title));

	const parseFaq = (): Array<{ question: string; answer: string }> =>
		faqText
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => {
				const splitByDouble = line.includes('||') ? line.split('||') : line.split('|');
				const [question, answer] = splitByDouble.map((value) => value?.trim() ?? '');
				return { question, answer };
			})
			.filter((item) => Boolean(item.question && item.answer));

	const extractDescriptionBodyMd = (value: unknown): string => {
		if (typeof value === 'string') return value;
		if (value && typeof value === 'object' && typeof (value as { bodyMd?: unknown }).bodyMd === 'string') {
			return (value as { bodyMd: string }).bodyMd;
		}
		return '';
	};

	const faqToText = (faqItems: unknown): string => {
		if (!Array.isArray(faqItems)) return '';
		return faqItems
			.map((item) => {
				const entry = item as { question?: string; blocks?: Array<{ type?: string; text?: string }> };
				const question = entry.question?.trim() ?? '';
				const answer =
					entry.blocks
						?.filter((block) => block.type === 'paragraph')
						.map((block) => block.text?.trim() ?? '')
						.filter(Boolean)
						.join(' ') ?? '';
				if (!question || !answer) return '';
				return `${question}||${answer}`;
			})
			.filter(Boolean)
			.join('\n');
	};

	const toAgendaText = (items: NonNullable<AiDraft['agenda']>): string =>
		items.map((item) => [item.title, item.outcome ?? '', item.details ?? ''].join('||')).join('\n');

	const toFaqText = (items: NonNullable<AiDraft['faq']>): string =>
		items.map((item) => `${item.question}||${item.answer}`).join('\n');

	const applyAiDraft = (draft: AiDraft) => {
		if (draft.title) title = draft.title;
		if (draft.slug) slug = slugify(draft.slug);
		if (draft.subtitle) subtitle = draft.subtitle;
		if (draft.tagline) tagline = draft.tagline;
		if (draft.summary) summary = draft.summary;
		if (draft.ctaLabel) ctaLabel = draft.ctaLabel;
		if (draft.descriptionBodyMd) descriptionBodyMd = draft.descriptionBodyMd;
		if (draft.highlights?.length) highlightsText = draft.highlights.join('\n');
		if (draft.audienceBullets?.length) audienceBulletsText = draft.audienceBullets.join('\n');
		if (draft.outcomes?.length) outcomesText = draft.outcomes.join('\n');
		if (draft.agenda?.length) agendaText = toAgendaText(draft.agenda);
		if (draft.faq?.length) faqText = toFaqText(draft.faq);
	};

	const applyCopyFromEvent = () => {
		const source = existingEvents.find((event) => event.id === copyEventId);
		if (!source) {
			errorMessage = 'Select an event to copy from.';
			return;
		}
		errorMessage = '';
		successMessage = '';

		const sourceIsTraining = source.type === 'training_session' && source.programRef?.sku;
		mode = sourceIsTraining ? 'training' : 'external';

		title = source.title ?? '';
		slug = source.slug ?? '';
		subtitle = source.subtitle ?? '';
		tagline = source.tagline ?? '';
		summary = source.summary ?? '';
		descriptionBodyMd = extractDescriptionBodyMd(source.description);
		highlightsText = (source.highlights ?? []).join('\n');
		audienceBulletsText = (source.audienceBullets ?? []).join('\n');
		outcomesText = (source.outcomes ?? []).join('\n');
		agendaText = toAgendaText(source.agenda ?? []);
		faqText = faqToText(source.faq);

		type = source.type ?? type;
		typeLabel = source.typeLabel ?? '';
		visibility = source.visibility ?? visibility;
		lifecycleStatus = source.lifecycleStatus ?? lifecycleStatus;
		registrationStatus = source.registrationStatus ?? registrationStatus;
		ctaLabel = source.cta?.label ?? ctaLabel;
		ctaUrl = source.cta?.url ?? '';
		locationMode = source.locationMeta?.mode ?? locationMode;
		locationPublicLabel = source.locationMeta?.publicLabel ?? locationPublicLabel;
		locationDetailsVisibility =
			source.locationMeta?.detailsVisibility ?? locationDetailsVisibility;
		selectedPartnerCodes = (source.partners ?? []).map((partner: { code?: string }) => partner.code ?? '').filter(Boolean);

		if (sourceIsTraining) {
			programSku = source.programRef?.sku ?? programSku;
			startDate = source.sessions?.[0]?.startAtUtc?.slice(0, 10) ?? '';
			durationDays =
				typeof source.schedule?.durationDays === 'number'
					? source.schedule.durationDays.toString()
					: '';
			estimatedHoursCommitment =
				typeof source.schedule?.estimatedHoursCommitment === 'number'
					? source.schedule.estimatedHoursCommitment.toString()
					: '';
		} else {
			sessionsText = (source.sessions ?? [])
				.map(
					(session: { startAtUtc?: string; endAtUtc?: string }) =>
						`${session.startAtUtc ?? ''}|${session.endAtUtc ?? ''}`
				)
				.join('\n');
		}

		if (source.campaignId && existingCampaignIds.includes(source.campaignId)) {
			campaignMode = 'existing';
			existingCampaignId = source.campaignId;
		} else if (source.campaignId) {
			campaignMode = 'auto';
			campaignId = source.campaignId;
		}

		heroImage = source.heroImage ?? '';
		heroImageAlt = source.heroImageAlt ?? '';
		image = source.image ?? '';
		imageAlt = source.imageAlt ?? '';

		successMessage = `Copied fields from event \"${source.title}\". Review ID/slug/campaign before saving.`;
	};

	const applyCopyFromProgram = () => {
		const source = trainingPrograms.find((program) => program.sku === copyProgramSku);
		if (!source) {
			errorMessage = 'Select a training program to copy from.';
			return;
		}
		errorMessage = '';
		successMessage = '';

		mode = 'training';
		programSku = source.sku ?? programSku;
		title = source.title ?? title;
		slug = slug || slugify(source.slug ?? source.title ?? '');
		tagline = source.tagline ?? '';
		summary = source.description ?? '';
		descriptionBodyMd = source.description ?? '';
		audienceBulletsText = (source.audience ?? []).join('\n');
		outcomesText = (source.objectives ?? []).join('\n');
		highlightsText = (source.takeaways ?? []).join('\n');
		agendaText = toAgendaText(source.agenda ?? []);
		locationMode = 'online';
		locationPublicLabel = source.scheduleTemplate?.defaultLocationLabel ?? 'Online';
		type = 'training_session';
		typeLabel = 'Training';
		ctaLabel = 'Register now';
		ctaUrl = source.route ?? ctaUrl;
		durationDays =
			typeof source.scheduleTemplate?.durationDays === 'number'
				? source.scheduleTemplate.durationDays.toString()
				: durationDays;
		estimatedHoursCommitment =
			typeof source.scheduleTemplate?.hoursPerDayCommitment === 'number'
				? source.scheduleTemplate.hoursPerDayCommitment.toString()
				: estimatedHoursCommitment;
		startTimeLocal = source.scheduleTemplate?.defaultStartTimeLocal ?? startTimeLocal;
		selectedPartnerCodes = source.eventDefaults?.partnerCodes ?? selectedPartnerCodes;
		heroImage = source.heroImage ?? source.ogImage ?? heroImage;
		image = source.ogImage ?? source.heroImage ?? image;
		heroImageAlt = source.heroImageAlt ?? source.ogImageAlt ?? heroImageAlt;
		imageAlt = source.ogImageAlt ?? source.heroImageAlt ?? imageAlt;

		successMessage = `Copied baseline fields from training program \"${source.title}\". Add start date and review before saving.`;
	};

	const runAiDraft = async () => {
		errorMessage = '';
		successMessage = '';
		aiLoading = true;
		try {
			const response = await fetch('/admin/events/create/api/ai-draft', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mode,
					eventContext: {
						title,
						subtitle,
						type,
						ctaUrl,
						partnerCodes: selectedPartnerCodes,
						programSku: mode === 'training' ? programSku : undefined
					},
					questionnaire: {
						audience: aiAudience,
						primaryOutcome: aiPrimaryOutcome,
						formatAndDelivery: aiFormatAndDelivery,
						partnerContext: aiPartnerContext,
						ctaGoal: aiCtaGoal,
						tone: aiTone,
						constraints: aiConstraints,
						keyTopics: aiKeyTopics,
						faqFocus: aiFaqFocus
					}
				})
			});
			const json = await response.json();
			if (!response.ok) throw new Error(json?.error ?? 'AI draft failed');
			const draft = (json?.draft ?? {}) as AiDraft;
			applyAiDraft(draft);
			aiResult = JSON.stringify(draft, null, 2);
			successMessage = 'AI draft applied (including title/slug when returned). Review before saving.';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'AI draft failed';
		} finally {
			aiLoading = false;
		}
	};

	const togglePartner = (code: string) => {
		selectedPartnerCodes = selectedPartnerCodes.includes(code)
			? selectedPartnerCodes.filter((value) => value !== code)
			: [...selectedPartnerCodes, code];
	};

	const buildPayload = (action: 'preview' | 'save') => {
		const durationDaysNumber = durationDays.trim() ? Number(durationDays) : undefined;
		const estimatedHoursNumber = estimatedHoursCommitment.trim()
			? Number(estimatedHoursCommitment)
			: undefined;

		return {
			action,
			confirmWrite: action === 'save',
			mode,
			eventInput: {
				id: eventId,
				slug,
				title,
				subtitle,
				tagline,
				summary,
				descriptionBodyMd,
				highlights: parseLines(highlightsText),
				audienceBullets: parseLines(audienceBulletsText),
				outcomes: parseLines(outcomesText),
				agenda: parseAgenda(),
				faq: parseFaq(),
				type,
				typeLabel,
				visibility,
				lifecycleStatus,
				registrationStatus,
				ctaLabel,
				ctaUrl,
				locationMode,
				locationPublicLabel,
				locationDetailsVisibility,
				partnerCodes: selectedPartnerCodes,
				programSku: mode === 'training' ? programSku : undefined,
				startDate: mode === 'training' ? startDate : undefined,
				startTimeLocal: mode === 'training' ? startTimeLocal : undefined,
				durationDays: mode === 'training' ? durationDaysNumber : undefined,
				estimatedHoursCommitment: mode === 'training' ? estimatedHoursNumber : undefined,
				sessions: mode === 'external' ? parseSessions() : undefined,
				heroImage,
				heroImageAlt,
				image,
				imageAlt
			},
			campaignInput:
				campaignMode === 'none'
					? { mode: 'none' }
					: campaignMode === 'existing'
						? { mode: 'existing', campaignId: existingCampaignId }
						: {
								mode: 'auto',
								campaignId,
								partner: campaignPartner,
								partnerLabel: campaignPartnerLabel,
								utmSource,
								utmMedium,
								utmCampaign,
								src: campaignSrc,
								ad: campaignAd,
								description: campaignDescription
							},
			imageSelection: {
				heroImage,
				heroImageAlt,
				image,
				imageAlt
			}
		};
	};

	const runDraftAction = async (action: 'preview' | 'save') => {
		errorMessage = '';
		successMessage = '';
		if (action === 'preview') loadingPreview = true;
		if (action === 'save') saving = true;

		try {
			const response = await fetch('/admin/events/create/api/draft', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(buildPayload(action))
			});
			const json = await response.json();
			if (!response.ok) throw new Error(json?.error ?? 'Request failed');
			previewResult = JSON.stringify(json, null, 2);
			if (action === 'save') {
				successMessage = 'Event draft saved to registries.';
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Request failed';
		} finally {
			loadingPreview = false;
			saving = false;
		}
	};

	const handleImagesSaved = (event: CustomEvent<{ urls: { landscape?: string; square?: string } }>) => {
		const landscape = event.detail.urls.landscape;
		const square = event.detail.urls.square;
		if (landscape) {
			heroImage = landscape;
			image = landscape;
		}
		if (square && !image) image = square;
		if (title.trim()) {
			heroImageAlt = title.trim();
			imageAlt = title.trim();
		}
		successMessage =
			'Images saved. Landscape image was auto-applied to Hero Image URL and OG Image URL.';
	};
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/admin/events/create"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Create Event (Dev)</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		Create draft events from training programs or from scratch, preview generated JSON, then write
		directly to the registry files in development.
	</p>
</header>

{#if !data.isDev}
	<section class="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
		<p class="text-sm font-semibold text-amber-900">Unavailable outside development.</p>
	</section>
{:else}
	<section class="mt-8 space-y-6">
		{#if errorMessage}
			<div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
				{errorMessage}
			</div>
		{/if}
		{#if successMessage}
			<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
				{successMessage}
			</div>
		{/if}

		<div class="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
			<h2 class="text-xl font-semibold">AI Draft Assistant (Dev)</h2>
			<p class="mt-2 text-sm text-gray-700">
				Answer these prompts, then click <strong>Generate and Apply AI Draft</strong>.
			</p>
			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<label class="text-sm font-semibold text-gray-800">
					Audience *
					<textarea rows={2} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={aiAudience}></textarea>
					<p class="mt-1 text-xs text-gray-500">Required. Example: "Technical writers and content strategists with mixed AI experience."</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Primary Outcome *
					<textarea rows={2} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={aiPrimaryOutcome}></textarea>
					<p class="mt-1 text-xs text-gray-500">Required. Example: "Attendees leave with a repeatable prompt workflow they can use next day."</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Format and Delivery *
					<textarea rows={2} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={aiFormatAndDelivery}></textarea>
					<p class="mt-1 text-xs text-gray-500">Required. Example: "Live online workshop with demos, exercises, and Q&A."</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Partner Context
					<textarea rows={2} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={aiPartnerContext}></textarea>
					<p class="mt-1 text-xs text-gray-500">Optional. Example: "Co-hosted with TCW community; avoid implying endorsement beyond co-promotion."</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					CTA Goal *
					<textarea rows={2} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={aiCtaGoal}></textarea>
					<p class="mt-1 text-xs text-gray-500">Required. Example: "Drive direct registration clicks for the spring cohort."</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Tone
					<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={aiTone}>
						{#each toneOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
					<p class="mt-1 text-xs text-gray-500">Optional. Example: "Practical, confident, and concise."</p>
				</label>
				<label class="sm:col-span-2 text-sm font-semibold text-gray-800">
					Constraints
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={aiConstraints} />
					<p class="mt-1 text-xs text-gray-500">Recommended. Example: "Do not invent pricing, credentials, partners, or dates."</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Key Topics
					<textarea rows={2} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={aiKeyTopics}></textarea>
					<p class="mt-1 text-xs text-gray-500">Optional. Example: "Atlas browser features, Ask ChatGPT tab, agents, prompt iteration."</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					FAQ Focus
					<textarea rows={2} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={aiFaqFocus}></textarea>
					<p class="mt-1 text-xs text-gray-500">Optional. Example: "Prerequisites, recording policy, who should attend, support after session."</p>
				</label>
			</div>
			<div class="mt-4">
				<button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50" disabled={aiLoading} on:click={runAiDraft}>
					{aiLoading ? 'Generating Draft...' : 'Generate and Apply AI Draft'}
				</button>
			</div>
			{#if aiResult}
				<details class="mt-4 rounded border border-blue-200 bg-white p-3">
					<summary class="cursor-pointer text-sm font-semibold text-gray-700">View AI JSON draft</summary>
					<pre class="mt-2 max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs">{aiResult}</pre>
				</details>
			{/if}
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Source Mode *</h2>
			<div class="mt-3 flex flex-wrap gap-4 text-sm">
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={mode} value="training" /> Training-derived
				</label>
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={mode} value="external" /> External event
				</label>
			</div>
			<p class="mt-2 text-xs text-gray-500">Required. Pick one. Example: use Training-derived for cohort events tied to a program SKU.</p>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Copy Template</h2>
			<p class="mt-2 text-sm text-gray-600">Use either an existing event or a training program as a starting point.</p>
			<div class="mt-3 flex flex-wrap gap-4 text-sm">
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={copySourceType} value="event" />
					Existing event
				</label>
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={copySourceType} value="training_program" />
					Training program
				</label>
			</div>

			{#if copySourceType === 'event'}
				<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
					<label class="text-sm font-semibold text-gray-800 sm:flex-1">
						Event Template
						<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={copyEventId}>
							<option value="">Select an event…</option>
							{#each existingEvents as event}
								<option value={event.id}>{event.title} · {event.slug}</option>
							{/each}
						</select>
						<p class="mt-1 text-xs text-gray-500">Optional. Example: copy your last workshop to reuse structure and messaging.</p>
					</label>
					<button class="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="button" on:click={applyCopyFromEvent}>
						Copy Selected Event
					</button>
				</div>
			{:else}
				<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
					<label class="text-sm font-semibold text-gray-800 sm:flex-1">
						Training Program
						<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={copyProgramSku}>
							{#each trainingPrograms as program}
								<option value={program.sku}>{program.sku} · {program.title}</option>
							{/each}
						</select>
						<p class="mt-1 text-xs text-gray-500">Shows all available training programs, including drafts.</p>
					</label>
					<button class="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="button" on:click={applyCopyFromProgram}>
						Copy Selected Program
					</button>
				</div>
			{/if}
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Core Event Fields</h2>
			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<label class="text-sm font-semibold text-gray-800">
					Event ID *
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={eventId} />
					<p class="mt-1 text-xs text-gray-500">Required. 6-char base36. Example: <code>7iu8p4</code>.</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Slug *
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={slug} />
					<p class="mt-1 text-xs text-gray-500">Required. Lowercase URL-safe. Example: <code>chatgpt-atlas-browser-workshop-spring-2026</code>.</p>
				</label>
				<label class="sm:col-span-2 text-sm font-semibold text-gray-800">
					Title (External Required)
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={title} />
					<p class="mt-1 text-xs text-gray-500">Required for external events. Example: "ChatGPT Atlas Browser: What’s New".</p>
				</label>
				<label class="sm:col-span-2 text-sm font-semibold text-gray-800">
					Subtitle
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={subtitle} />
					<p class="mt-1 text-xs text-gray-500">Optional. Example: "Live Demo + Practical Q&A".</p>
				</label>
				<label class="sm:col-span-2 text-sm font-semibold text-gray-800">
					Tagline
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={tagline} />
					<p class="mt-1 text-xs text-gray-500">Optional short hook. Example: "Learn the updates and apply them immediately."</p>
				</label>
				<label class="sm:col-span-2 text-sm font-semibold text-gray-800">
					Summary (External Required)
					<textarea rows={3} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={summary}></textarea>
					<p class="mt-1 text-xs text-gray-500">Required for external events. 1-3 sentences. Example: who it’s for + what they’ll learn.</p>
				</label>
				<label class="sm:col-span-2 text-sm font-semibold text-gray-800">
					Description Body (Markdown)
					<textarea rows={6} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={descriptionBodyMd}></textarea>
					<p class="mt-1 text-xs text-gray-500">Optional long-form details. Example: add sections like <code>## Outcomes</code> and bullet lists.</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Highlights (one per line)
					<textarea rows={4} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={highlightsText}></textarea>
					<p class="mt-1 text-xs text-gray-500">Optional. Example lines: "Hands-on demos" and "Reusable templates".</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Audience Bullets (one per line)
					<textarea rows={4} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={audienceBulletsText}></textarea>
					<p class="mt-1 text-xs text-gray-500">Optional. Example: "Team leads evaluating AI workflows".</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Outcomes (one per line)
					<textarea rows={4} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={outcomesText}></textarea>
					<p class="mt-1 text-xs text-gray-500">Optional. Example: "Draft a production-ready prompt checklist".</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Agenda (one per line)
					<textarea rows={4} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs" bind:value={agendaText}></textarea>
					<p class="mt-1 text-xs text-gray-500">Format: <code>title||outcome||details</code> or <code>title||details</code>. Example: <code>Introduction to Atlas||Overview of features and capabilities.</code></p>
				</label>
				<label class="sm:col-span-2 text-sm font-semibold text-gray-800">
					FAQ (one per line)
					<textarea rows={4} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs" bind:value={faqText}></textarea>
					<p class="mt-1 text-xs text-gray-500">Format: <code>question||answer</code>. Example: <code>Is recording provided?||Yes, attendees get access for 7 days.</code></p>
				</label>
			</div>
		</div>

		{#if mode === 'training'}
			<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
				<h2 class="text-xl font-semibold">Training Draft Inputs</h2>
				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<label class="text-sm font-semibold text-gray-800">
						Program SKU *
						<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={programSku}>
							{#each trainingPrograms as program}
								<option value={program.sku}>{program.sku} - {program.title}</option>
							{/each}
						</select>
						<p class="mt-1 text-xs text-gray-500">Required for training mode. Example: <code>CM-TR-005</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">
						Start Date (YYYY-MM-DD) *
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="2026-06-10" bind:value={startDate} />
						<p class="mt-1 text-xs text-gray-500">Required. Example: <code>2026-06-10</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">
						Start Time Local
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="10:00" bind:value={startTimeLocal} />
						<p class="mt-1 text-xs text-gray-500">Optional override. Example: <code>13:30</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">
						Duration Days
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="49" bind:value={durationDays} />
						<p class="mt-1 text-xs text-gray-500">Optional override. Example: <code>49</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">
						Hours Commitment
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="2" bind:value={estimatedHoursCommitment} />
						<p class="mt-1 text-xs text-gray-500">Optional override per session. Example: <code>1.5</code>.</p>
					</label>
				</div>
			</div>
			{#if selectedTrainingProgram}
				<div class="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
					<h2 class="text-xl font-semibold">Selected Program Preview</h2>
					<p class="mt-1 text-xs font-semibold tracking-wide text-blue-700 uppercase">
						{selectedTrainingProgram.sku} · {selectedTrainingProgram.title}
					</p>
					{#if selectedTrainingProgram.tagline}
						<p class="mt-2 text-sm text-gray-700">{selectedTrainingProgram.tagline}</p>
					{/if}
					<p class="mt-2 text-sm text-gray-700">{selectedTrainingProgram.description}</p>
					<div class="mt-3 grid gap-3 sm:grid-cols-2">
						<p class="text-xs text-gray-600">
							<strong>Default schedule:</strong>
							{selectedTrainingProgram.scheduleTemplate.durationDays} days ·
							{selectedTrainingProgram.scheduleTemplate.hoursPerDayCommitment} hrs/session ·
							{selectedTrainingProgram.scheduleTemplate.defaultStartTimeLocal}
							{selectedTrainingProgram.scheduleTemplate.defaultTimeZoneLabel}
						</p>
						<p class="text-xs text-gray-600">
							<strong>Route:</strong> {selectedTrainingProgram.route}
						</p>
					</div>
					{#if selectedTrainingProgram.audience?.length}
						<p class="mt-3 text-xs font-semibold text-gray-700">Audience examples:</p>
						<ul class="mt-1 list-disc space-y-1 pl-4 text-xs text-gray-600">
							{#each selectedTrainingProgram.audience.slice(0, 3) as item}
								<li>{item}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		{:else}
			<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
				<h2 class="text-xl font-semibold">External Event Inputs</h2>
				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<label class="text-sm font-semibold text-gray-800">
						Type *
						<input list="event-type-options" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={type} />
						<p class="mt-1 text-xs text-gray-500">Required. Example: <code>webinar</code>, <code>talk</code>, or <code>event</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">
						Type Label
						<input list="event-type-label-options" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={typeLabel} />
						<p class="mt-1 text-xs text-gray-500">Optional display label. Example: "Live Webinar".</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">
						Location Mode *
						<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={locationMode}>
							<option value="online">online</option>
							<option value="in_person">in_person</option>
							<option value="hybrid">hybrid</option>
						</select>
						<p class="mt-1 text-xs text-gray-500">Required. Example: choose <code>online</code> for Zoom-based events.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">
						Location Label *
						<input list="location-label-options" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={locationPublicLabel} />
						<p class="mt-1 text-xs text-gray-500">Required. Example: "Online" or "San Francisco, CA".</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">
						Location Details Visibility *
						<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={locationDetailsVisibility}>
							<option value="public">public</option>
							<option value="post_signup">post_signup</option>
							<option value="tbd">tbd</option>
						</select>
						<p class="mt-1 text-xs text-gray-500">Required. Example: use <code>post_signup</code> when join/location details are private.</p>
					</label>
					<label class="sm:col-span-2 text-sm font-semibold text-gray-800">
						Sessions (one per line) *
						<textarea rows={5} class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs" bind:value={sessionsText} placeholder="2026-07-01T17:00:00.000Z|2026-07-01T18:00:00.000Z"></textarea>
						<p class="mt-1 text-xs text-gray-500">Required for external mode. Format: <code>startAtUtc|endAtUtc</code>. Example shown in placeholder.</p>
					</label>
				</div>
			</div>
		{/if}

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Status, CTA, and Partners</h2>
			<p class="mt-2 text-sm text-gray-600">
				Event partners write to <code>event.partners[]</code> in <code>events.json</code>.
			</p>
			<div class="mt-4 grid gap-4 sm:grid-cols-3">
				<label class="text-sm font-semibold text-gray-800">
					Visibility *
					<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={visibility}>
						<option value="draft">draft</option>
						<option value="unlisted">unlisted</option>
						<option value="public">public</option>
					</select>
					<p class="mt-1 text-xs text-gray-500">Required. Example: start with <code>draft</code> before publishing.</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Lifecycle *
					<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={lifecycleStatus}>
						<option value="scheduled">scheduled</option>
						<option value="postponed">postponed</option>
						<option value="canceled">canceled</option>
						<option value="completed">completed</option>
					</select>
					<p class="mt-1 text-xs text-gray-500">Required. Example: use <code>scheduled</code> for upcoming sessions.</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Registration *
					<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={registrationStatus}>
						<option value="open">open</option>
						<option value="closed">closed</option>
						<option value="external">external</option>
						<option value="none">none</option>
						<option value="waitlist">waitlist</option>
						<option value="sold_out">sold_out</option>
					</select>
					<p class="mt-1 text-xs text-gray-500">Required. Example: <code>external</code> for Lu.ma or third-party signups.</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					CTA Label *
					<input list="cta-label-options" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={ctaLabel} />
					<p class="mt-1 text-xs text-gray-500">Required. Example: "Register now" or "Join waitlist".</p>
				</label>
				<label class="sm:col-span-2 text-sm font-semibold text-gray-800">
					CTA URL
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={ctaUrl} />
					<p class="mt-1 text-xs text-gray-500">Optional but recommended. Example: <code>https://luma.com/example</code> or <code>/training/ai-workshop-for-content-creators</code>.</p>
				</label>
			</div>
			<div class="mt-4">
				<p class="text-sm font-semibold text-gray-800">Partner Codes</p>
				<p class="mt-1 text-xs text-gray-500">Optional event associations. Example: select <code>TCW</code> for a community co-promotion.</p>
				<div class="mt-2 flex flex-wrap gap-2">
					{#each partners as partner}
						<label class="inline-flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs">
							<input type="checkbox" checked={selectedPartnerCodes.includes(partner.code)} on:change={() => togglePartner(partner.code)} />
							{partner.code} · {partner.name}
						</label>
					{/each}
				</div>
			</div>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Campaign Linkage *</h2>
			<p class="mt-2 text-sm text-gray-600">
				Campaign fields write to <code>campaigns.json</code> and control short-link attribution.
			</p>
			<div class="mt-3 flex flex-wrap gap-3 text-sm">
				<label class="inline-flex items-center gap-2"><input type="radio" bind:group={campaignMode} value="auto" /> Auto-create</label>
				<label class="inline-flex items-center gap-2"><input type="radio" bind:group={campaignMode} value="existing" /> Existing campaign</label>
				<label class="inline-flex items-center gap-2"><input type="radio" bind:group={campaignMode} value="none" /> None</label>
			</div>
			<p class="mt-1 text-xs text-gray-500">Required. Choose one mode. Example: use Auto-create for new event launches.</p>
			{#if campaignMode === 'auto'}
				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<label class="text-sm font-semibold text-gray-800">Campaign ID *
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={campaignId} />
						<p class="mt-1 text-xs text-gray-500">Required in auto mode. Example: <code>7iu8p4</code> or <code>atlas-browser-spring</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">Partner *
						<input list="campaign-partner-options" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={campaignPartner} />
						<p class="mt-1 text-xs text-gray-500">Required in auto mode. Example: <code>cambermast</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">Partner Label
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={campaignPartnerLabel} />
						<p class="mt-1 text-xs text-gray-500">Optional display name. Example: "Cambermast".</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">UTM Campaign *
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={utmCampaign} />
						<p class="mt-1 text-xs text-gray-500">Required in auto mode. Example: <code>events</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">UTM Source *
						<input list="utm-source-options" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={utmSource} />
						<p class="mt-1 text-xs text-gray-500">Required in auto mode. Example: <code>qr</code> or <code>newsletter</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">UTM Medium *
						<input list="utm-medium-options" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={utmMedium} />
						<p class="mt-1 text-xs text-gray-500">Required in auto mode. Example: <code>offline</code> or <code>email</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">src *
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={campaignSrc} />
						<p class="mt-1 text-xs text-gray-500">Required in auto mode. Example: <code>qr</code>.</p>
					</label>
					<label class="text-sm font-semibold text-gray-800">ad *
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={campaignAd} />
						<p class="mt-1 text-xs text-gray-500">Required in auto mode. Example: <code>cambermast</code>.</p>
					</label>
					<label class="sm:col-span-2 text-sm font-semibold text-gray-800">Description
						<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={campaignDescription} />
						<p class="mt-1 text-xs text-gray-500">Optional. Example: "Campaign short link for Atlas Browser workshop event page."</p>
					</label>
				</div>
			{:else if campaignMode === 'existing'}
				<label class="mt-4 block text-sm font-semibold text-gray-800">Campaign ID
					<select class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={existingCampaignId}>
						{#each existingCampaignIds as id}
							<option value={id}>{id}</option>
						{/each}
					</select>
					<p class="mt-1 text-xs text-gray-500">Required in existing mode. Example: select <code>s6twc1</code>.</p>
				</label>
			{/if}
		</div>

		<div class="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Step 1: Generate Images</h2>
			<p class="mt-2 text-sm text-gray-600">Same workflow as <code>/admin/image-gen</code>. Save selected images first. On save, landscape is auto-applied to both Hero Image URL and OG Image URL.</p>
			<div class="mt-4">
				<AdminImageGenPanel
					isDev={data.isDev}
					mode="embedded"
					bind:slug
					defaultTemplateUrl={data.defaultTemplateUrl}
					defaultPrompts={data.defaultPrompts}
					defaultN={data.defaultN}
					minN={data.minN}
					maxN={data.maxN}
					on:imagessaved={handleImagesSaved}
				/>
			</div>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Step 2: Review Image URLs</h2>
			<p class="mt-2 text-sm text-gray-600">These are auto-populated after image save, but still editable if you want to override.</p>
			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<label class="text-sm font-semibold text-gray-800">
					Hero Image URL *
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={heroImage} />
					<p class="mt-1 text-xs text-gray-500">Required before save. Auto-filled from landscape image. Example: <code>/images/generated/atlas-browser/hero-landscape.jpg</code>.</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					OG Image URL *
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={image} />
					<p class="mt-1 text-xs text-gray-500">Required before save. Auto-filled from landscape image. Example: <code>/images/generated/atlas-browser/hero-landscape.jpg</code>.</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Hero Image Alt *
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={heroImageAlt} />
					<p class="mt-1 text-xs text-gray-500">Required for accessibility. Example: "ChatGPT Atlas Browser workshop hero image".</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					OG Image Alt *
					<input class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" bind:value={imageAlt} />
					<p class="mt-1 text-xs text-gray-500">Required for accessibility. Example: "Atlas Browser event social image".</p>
				</label>
			</div>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Preview and Save</h2>
			<p class="mt-2 text-xs text-gray-500">Preview is recommended before save. Save writes directly to <code>events.json</code> and optionally <code>campaigns.json</code>.</p>
			<div class="mt-4 flex flex-wrap gap-3">
				<button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50" disabled={loadingPreview} on:click={() => runDraftAction('preview')}>
					{loadingPreview ? 'Previewing...' : 'Preview Draft JSON'}
				</button>
				<button class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50" disabled={saving} on:click={() => runDraftAction('save')}>
					{saving ? 'Saving...' : 'Save to Registry Files'}
				</button>
			</div>
			{#if previewResult}
				<pre class="mt-4 max-h-[32rem] overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs">{previewResult}</pre>
			{/if}
		</div>

		<datalist id="event-type-options">
			{#each eventTypeOptions as option}
				<option value={option}></option>
			{/each}
		</datalist>
		<datalist id="event-type-label-options">
			{#each eventTypeLabelOptions as option}
				<option value={option}></option>
			{/each}
		</datalist>
		<datalist id="cta-label-options">
			{#each ctaLabelOptions as option}
				<option value={option}></option>
			{/each}
		</datalist>
		<datalist id="location-label-options">
			{#each locationLabelOptions as option}
				<option value={option}></option>
			{/each}
		</datalist>
		<datalist id="campaign-partner-options">
			{#each campaignPartnerOptions as option}
				<option value={option}></option>
			{/each}
		</datalist>
		<datalist id="utm-source-options">
			{#each utmSourceOptions as option}
				<option value={option}></option>
			{/each}
		</datalist>
		<datalist id="utm-medium-options">
			{#each utmMediumOptions as option}
				<option value={option}></option>
			{/each}
		</datalist>
	</section>
{/if}
