<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import AdminImageGenPanel from '$lib/components/admin/AdminImageGenPanel.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	type DraftMode = 'training' | 'external';
	type CampaignMode = 'auto' | 'existing';
	type CopySourceType = 'event' | 'training_program';
	type ValidationState = {
		eventIdExists: boolean;
		eventSlugExists: boolean;
		campaignIdExists: boolean;
		campaignLandingPathExists: boolean;
	};
	type SessionRow = { startLocal: string; endLocal: string };
	type AgendaRow = { title: string; detailsText: string };
	type FaqRow = { question: string; answer: string };

	const pageMeta = {
		title: 'Create Event (Dev) | Admin | Cambermast',
		description:
			'Essential-first event builder with structured sections and optional advanced controls.'
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
	const ctaLabelOptions = [
		'Open soon',
		'Register now',
		'Join waitlist',
		'Learn more',
		'Get tickets',
		'Reserve your spot',
		'Enrollment closed',
		'Draft'
	] as const;

	const trainingPrograms = data.trainingPrograms ?? [];
	const eventFaqDefaults = data.eventFaqDefaults ?? [];
	const partners = data.partners ?? [];
	const existingEvents = data.existingEvents ?? [];
	const existingCampaignOptions = data.existingCampaignOptions ?? [];
	const campaignPartnerOptions = [
		'cambermast',
		...partners.map((partner) => partner.code.toLowerCase())
	].filter((value, index, array) => array.indexOf(value) === index);

	let mode: DraftMode = 'training';
	let copySourceType: CopySourceType = 'event';
	let copyEventId = '';
	let copyProgramSku = trainingPrograms[0]?.sku ?? '';

	let eventId = data.defaults.eventId;
	let slug = '';
	let title = '';
	let summary = '';
	let tagline = '';
	let descriptionBodyMd = '';
	let highlightsText = '';
	let audienceBulletsText = '';
	let outcomesText = '';

	let type = 'event';
	let typeLabel = '';
	let visibility: 'public' | 'unlisted' | 'draft' = 'draft';
	let lifecycleStatus: 'scheduled' | 'postponed' | 'canceled' | 'completed' = 'scheduled';
	let registrationStatus: 'open' | 'closed' | 'external' | 'none' | 'waitlist' | 'sold_out' =
		'none';

	let ctaLabel = 'Open soon';
	let ctaUrl = '';

	let locationMode: 'online' | 'in_person' | 'hybrid' = 'online';
	let locationPublicLabel = 'Online';
	let locationDetailsVisibility: 'public' | 'post_signup' | 'tbd' = 'public';

	let programSku = trainingPrograms[0]?.sku ?? '';
	let startDate = '';
	let startTimeLocal = '';
	let numberOfSessions = '';
	let estimatedHoursCommitment = '';
	let trainingSessionsCustomized = false;

	let sessions: SessionRow[] = [{ startLocal: '', endLocal: '' }];
	let agendaRows: AgendaRow[] = [{ title: '', detailsText: '' }];
	let faqRows: FaqRow[] = [{ question: '', answer: '' }];
	let selectedPartnerCodes: string[] = [];

	let campaignMode: CampaignMode = 'auto';
	let campaignId = data.defaults.campaignId;
	let existingCampaignId = existingCampaignOptions[0]?.id ?? '';
	let campaignPartner = 'cambermast';
	let campaignPartnerLabel = 'Cambermast';
	let utmSource = 'qr';
	let utmMedium = 'offline';
	let utmCampaign = 'events';
	let campaignSrc = 'qr';
	let campaignAd = 'cambermast';
	let campaignDescription = '';
	let campaignIdTouched = false;
	let campaignAdTouched = false;
	let showAdvancedTrackingFields = false;

	let heroImage = '';
	let image = '';
	let heroImageAlt = '';
	let imageAlt = '';

	let loadingPreview = false;
	let saving = false;
	let errorMessage = '';
	let successMessage = '';
	let previewResult = '';
	let clientValidationIssues: string[] = [];
	let preflight: ValidationState | null = null;

	$: selectedTrainingProgram = trainingPrograms.find((program) => program.sku === programSku);
	$: if (campaignMode === 'auto' && !campaignIdTouched) {
		campaignId = eventId;
	}
	$: if (!campaignAdTouched) {
		campaignAd = campaignPartner || 'cambermast';
	}

	const parseTimeToTwentyFourHour = (value: string): string | null => {
		const trimmed = value.trim().toLowerCase();
		if (!trimmed) return null;
		const twentyFourHour = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
		if (twentyFourHour) return `${twentyFourHour[1]}:${twentyFourHour[2]}`;
		const twelveHour = /^(\d{1,2})(?::([0-5]\d))?\s*(am|pm)$/.exec(trimmed);
		if (!twelveHour) return null;
		let hour = Number.parseInt(twelveHour[1], 10);
		const minute = Number.parseInt(twelveHour[2] ?? '0', 10);
		if (hour < 1 || hour > 12) return null;
		if (twelveHour[3] === 'pm' && hour !== 12) hour += 12;
		if (twelveHour[3] === 'am' && hour === 12) hour = 0;
		return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	};

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

	const toInputText = (value: string | number | null | undefined): string => {
		if (typeof value === 'number') {
			return Number.isFinite(value) ? value.toString() : '';
		}
		return typeof value === 'string' ? value.trim() : '';
	};

	const extractDescriptionBodyMd = (value: unknown): string => {
		if (typeof value === 'string') return value;
		if (
			value &&
			typeof value === 'object' &&
			typeof (value as { bodyMd?: unknown }).bodyMd === 'string'
		) {
			return (value as { bodyMd: string }).bodyMd;
		}
		return '';
	};

	const faqToRows = (faqItems: unknown): FaqRow[] => {
		if (!Array.isArray(faqItems)) return [{ question: '', answer: '' }];
		const rows = faqItems
			.map((item) => {
				const entry = item as {
					question?: string;
					blocks?: Array<{ type?: string; text?: string }>;
				};
				const question = entry.question?.trim() ?? '';
				const answer =
					entry.blocks
						?.filter((block) => block.type === 'paragraph')
						.map((block) => block.text?.trim() ?? '')
						.filter(Boolean)
						.join(' ') ?? '';
				if (!question && !answer) return null;
				return { question, answer };
			})
			.filter((row): row is FaqRow => Boolean(row));
		return rows.length ? rows : [{ question: '', answer: '' }];
	};

	const agendaToRows = (items: unknown): AgendaRow[] => {
		if (!Array.isArray(items)) return [{ title: '', detailsText: '' }];
		const rows = items
			.map((item) => {
				const row = item as { title?: string; details?: string[] | string };
				const detailsText = Array.isArray(row.details)
					? row.details
							.map((detail) => detail.trim())
							.filter(Boolean)
							.join('\n')
					: (row.details?.trim() ?? '');
				return {
					title: row.title?.trim() ?? '',
					detailsText
				};
			})
			.filter((row) => row.title || row.detailsText);
		return rows.length ? rows : [{ title: '', detailsText: '' }];
	};

	const addSession = () => {
		sessions = [...sessions, { startLocal: '', endLocal: '' }];
		trainingSessionsCustomized = true;
	};

	const clearSessions = () => {
		sessions = [{ startLocal: '', endLocal: '' }];
		trainingSessionsCustomized = false;
		errorMessage = '';
		successMessage = 'Sessions cleared. Start again from a blank session row.';
	};

	const removeSession = (index: number) => {
		sessions = sessions.filter((_, idx) => idx !== index);
		if (sessions.length === 0) sessions = [{ startLocal: '', endLocal: '' }];
		trainingSessionsCustomized = true;
	};

	const markSessionsCustomized = () => {
		if (mode === 'training') trainingSessionsCustomized = true;
	};

	const addAgendaRow = () => {
		agendaRows = [...agendaRows, { title: '', detailsText: '' }];
	};

	const removeAgendaRow = (index: number) => {
		agendaRows = agendaRows.filter((_, idx) => idx !== index);
		if (agendaRows.length === 0) agendaRows = [{ title: '', detailsText: '' }];
	};

	const addFaqRow = () => {
		faqRows = [...faqRows, { question: '', answer: '' }];
	};

	const removeFaqRow = (index: number) => {
		faqRows = faqRows.filter((_, idx) => idx !== index);
		if (faqRows.length === 0) faqRows = [{ question: '', answer: '' }];
	};

	const toLocalDateTimeInput = (utcValue: string): string => {
		const parsed = new Date(utcValue);
		if (Number.isNaN(parsed.valueOf())) return '';
		const year = parsed.getFullYear().toString().padStart(4, '0');
		const month = (parsed.getMonth() + 1).toString().padStart(2, '0');
		const day = parsed.getDate().toString().padStart(2, '0');
		const hours = parsed.getHours().toString().padStart(2, '0');
		const minutes = parsed.getMinutes().toString().padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	const toUtcIsoFromLocalInput = (value: string): string => {
		const trimmed = value.trim();
		if (!trimmed) return '';
		const parsed = new Date(trimmed);
		if (Number.isNaN(parsed.valueOf())) return '';
		return parsed.toISOString();
	};
	const toUtcPreview = (value: string): string =>
		toUtcIsoFromLocalInput(value) || 'Invalid date/time';

	const toTrainingSessionCount = (): number => {
		const numberOfSessionsValue = toInputText(numberOfSessions);
		const fromInput = numberOfSessionsValue ? Number(numberOfSessionsValue) : Number.NaN;
		if (Number.isFinite(fromInput) && fromInput > 0) return Math.max(1, Math.round(fromInput));
		const durationFromTemplate = selectedTrainingProgram?.scheduleTemplate?.durationDays;
		const durationDaysValue = durationFromTemplate;
		if (!durationDaysValue || durationDaysValue < 1) return 1;
		return Math.max(1, Math.round(durationDaysValue / 7));
	};

	const toTrainingSessionHours = (): number => {
		const estimatedHoursValue = toInputText(estimatedHoursCommitment);
		const fromInput = estimatedHoursValue ? Number(estimatedHoursValue) : Number.NaN;
		const fromTemplate = selectedTrainingProgram?.scheduleTemplate?.hoursPerDayCommitment;
		const hours = Number.isFinite(fromInput) && fromInput > 0 ? fromInput : fromTemplate;
		return typeof hours === 'number' && hours > 0 ? hours : 1.5;
	};

	const toLocalDateTimeFromDate = (date: Date): string => {
		const year = date.getFullYear().toString().padStart(4, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	const generateTrainingSessions = (options?: { announce?: boolean }) => {
		const announce = options?.announce ?? true;
		const resolvedTime =
			parseTimeToTwentyFourHour(startTimeLocal) ??
			parseTimeToTwentyFourHour(
				selectedTrainingProgram?.scheduleTemplate?.defaultStartTimeLocal ?? ''
			) ??
			'09:00';
		if (!startDate.trim()) {
			errorMessage = 'Pick a training start date before generating sessions.';
			return;
		}
		const firstLocal = `${startDate.trim()}T${resolvedTime}`;
		const firstStart = new Date(firstLocal);
		if (Number.isNaN(firstStart.valueOf())) {
			errorMessage = 'Training start date/time is invalid.';
			return;
		}
		const sessionCount = toTrainingSessionCount();
		const durationMs = toTrainingSessionHours() * 60 * 60 * 1000;
		const generated: SessionRow[] = [];
		for (let index = 0; index < sessionCount; index += 1) {
			const start = new Date(firstStart);
			start.setDate(start.getDate() + index * 7);
			const end = new Date(start.valueOf() + durationMs);
			generated.push({
				startLocal: toLocalDateTimeFromDate(start),
				endLocal: toLocalDateTimeFromDate(end)
			});
		}
		sessions = generated;
		trainingSessionsCustomized = false;
		errorMessage = '';
		if (announce) {
			successMessage = `Generated ${sessionCount.toString()} weekly session${sessionCount === 1 ? '' : 's'} from the selected training start date/time.`;
		}
	};

	const applyProgramTemplateToSessionGenerator = () => {
		const template = selectedTrainingProgram?.scheduleTemplate;
		if (!template) {
			errorMessage = 'Selected program SKU is missing a schedule template.';
			return;
		}
		startTimeLocal = parseTimeToTwentyFourHour(template.defaultStartTimeLocal) ?? startTimeLocal;
		estimatedHoursCommitment = template.hoursPerDayCommitment.toString();
		numberOfSessions = Math.max(1, Math.round(template.durationDays / 7)).toString();
		errorMessage = '';

		if (startDate.trim()) {
			generateTrainingSessions({ announce: false });
			successMessage =
				'Template fields were auto-filled from the selected program SKU and sessions were regenerated.';
			return;
		}

		successMessage =
			'Template fields were auto-filled from the selected program SKU. Set a start date, then generate sessions.';
	};

	$: if (
		mode === 'training' &&
		!trainingSessionsCustomized &&
		startDate.trim() &&
		(parseTimeToTwentyFourHour(startTimeLocal) !== null ||
			parseTimeToTwentyFourHour(
				selectedTrainingProgram?.scheduleTemplate?.defaultStartTimeLocal ?? ''
			) !== null)
	) {
		generateTrainingSessions({ announce: false });
	}

	const toLocalDateTimeValid = (value: string): boolean => {
		if (!value.trim()) return false;
		const parsed = new Date(value);
		return !Number.isNaN(parsed.valueOf());
	};

	const validateBeforeSubmit = (): string[] => {
		const issues: string[] = [];
		if (!/^[a-z0-9]{6}$/.test(eventId.trim())) {
			issues.push('Event ID must be exactly 6 lowercase base36 characters (example: 7iu8p4).');
		}
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
			issues.push('Slug must be lowercase URL-safe text (example: spring-2026-webinar).');
		}
		if (!title.trim()) {
			issues.push('Title is required. Used for calendar cards and event detail page headings.');
		}
		if (!summary.trim()) {
			issues.push('Summary is required. Used on the /events card and API payload.');
		}
		if (!tagline.trim()) {
			issues.push('Tagline is required. Events now use title + tagline only.');
		}
		if (!ctaLabel.trim()) {
			issues.push('CTA label is required. Used for registration button text.');
		}
		if (!heroImage.trim() || !image.trim()) {
			issues.push('Hero Image URL and OG Image URL are required before preview/save.');
		}
		if (mode === 'training') {
			if (!programSku.trim()) issues.push('Program SKU is required for training mode.');
			if (!startDate.trim()) issues.push('Start date is required for training mode.');
		}
		if (mode === 'external' && !type.trim()) {
			issues.push('Event type is required for external mode.');
		}
		if (mode === 'external' && !locationPublicLabel.trim()) {
			issues.push('Location label is required for external mode.');
		}
		const filledSessions = sessions.filter(
			(session) => session.startLocal.trim() || session.endLocal.trim()
		);
		if (mode === 'external' && !filledSessions.length) {
			issues.push('At least one session is required for external mode.');
		}
		filledSessions.forEach((session, index) => {
			const startLocal = session.startLocal.trim();
			const endLocal = session.endLocal.trim();
			if (!toLocalDateTimeValid(startLocal)) {
				issues.push(
					`Session ${index + 1}: start date/time is required and must be a valid local date/time.`
				);
			}
			if (!toLocalDateTimeValid(endLocal)) {
				issues.push(
					`Session ${index + 1}: end date/time is required and must be a valid local date/time.`
				);
			}
			if (toLocalDateTimeValid(startLocal) && toLocalDateTimeValid(endLocal)) {
				const startMs = new Date(startLocal).valueOf();
				const endMs = new Date(endLocal).valueOf();
				if (endMs <= startMs) {
					issues.push(`Session ${index + 1}: end date/time must be after start date/time.`);
				}
			}
		});
		return issues;
	};

	const applyCopyFromEvent = () => {
		const source = existingEvents.find((event) => event.id === copyEventId);
		if (!source) {
			errorMessage = 'Select an event to copy from.';
			return;
		}
		errorMessage = '';
		successMessage = '';

		const sourceIsTraining = Boolean(source.type === 'training_session' && source.programRef?.sku);
		mode = sourceIsTraining ? 'training' : 'external';

		title = source.title ?? '';
		slug = source.slug ?? '';
		tagline = source.tagline ?? '';
		summary = source.summary ?? '';
		descriptionBodyMd = extractDescriptionBodyMd(source.description);
		highlightsText = (source.highlights ?? []).join('\n');
		audienceBulletsText = (source.audienceBullets ?? []).join('\n');
		outcomesText = (source.outcomes ?? []).join('\n');
		agendaRows = agendaToRows(source.agenda ?? []);
		faqRows = faqToRows(source.faq);

		type = source.type ?? type;
		typeLabel = source.typeLabel ?? '';
		visibility = source.visibility ?? visibility;
		lifecycleStatus = source.lifecycleStatus ?? lifecycleStatus;
		registrationStatus = source.registrationStatus ?? registrationStatus;
		ctaLabel = source.cta?.label ?? ctaLabel;
		ctaUrl = source.cta?.url ?? '';
		locationMode = source.locationMeta?.mode ?? locationMode;
		locationPublicLabel = source.locationMeta?.publicLabel ?? locationPublicLabel;
		locationDetailsVisibility = source.locationMeta?.detailsVisibility ?? locationDetailsVisibility;
		selectedPartnerCodes = (source.partners ?? [])
			.map((partner: { code?: string }) => partner.code ?? '')
			.filter(Boolean);

		sessions = (source.sessions ?? []).map(
			(session: { startAtUtc?: string; endAtUtc?: string }) => ({
				startLocal: toLocalDateTimeInput(session.startAtUtc ?? ''),
				endLocal: toLocalDateTimeInput(session.endAtUtc ?? '')
			})
		);
		if (!sessions.length) sessions = [{ startLocal: '', endLocal: '' }];
		trainingSessionsCustomized = sourceIsTraining;

		if (sourceIsTraining) {
			programSku = source.programRef?.sku ?? programSku;
			startDate = source.sessions?.[0]?.startAtUtc?.slice(0, 10) ?? '';
			numberOfSessions = source.sessions?.length ? source.sessions.length.toString() : '';
			estimatedHoursCommitment =
				typeof source.schedule?.estimatedHoursCommitment === 'number'
					? source.schedule.estimatedHoursCommitment.toString()
					: '';
		}

		if (
			source.campaignId &&
			existingCampaignOptions.some((option) => option.id === source.campaignId)
		) {
			campaignMode = 'existing';
			existingCampaignId = source.campaignId;
		} else if (source.campaignId) {
			campaignMode = 'auto';
			campaignId = source.campaignId;
			campaignIdTouched = true;
		}

		heroImage = source.heroImage ?? '';
		heroImageAlt = source.heroImageAlt ?? '';
		image = source.image ?? '';
		imageAlt = source.imageAlt ?? '';

		successMessage = `Copied fields from event "${source.title}".`;
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
		agendaRows = agendaToRows(source.agenda ?? []);
		faqRows = faqToRows(source.faqs ?? []);

		locationMode = 'online';
		locationPublicLabel = source.scheduleTemplate?.defaultLocationLabel ?? 'Online';
		type = 'training_session';
		typeLabel = 'Training';
		registrationStatus = 'none';
		ctaLabel = 'Open soon';
		ctaUrl = '';
		estimatedHoursCommitment =
			typeof source.scheduleTemplate?.hoursPerDayCommitment === 'number'
				? source.scheduleTemplate.hoursPerDayCommitment.toString()
				: estimatedHoursCommitment;
		numberOfSessions = toTrainingSessionCount().toString();
		startTimeLocal = source.scheduleTemplate?.defaultStartTimeLocal ?? startTimeLocal;
		selectedPartnerCodes = source.eventDefaults?.partnerCodes ?? selectedPartnerCodes;
		heroImage = source.heroImage ?? source.ogImage ?? heroImage;
		image = source.ogImage ?? source.heroImage ?? image;
		heroImageAlt = source.heroImageAlt ?? source.ogImageAlt ?? heroImageAlt;
		imageAlt = source.ogImageAlt ?? source.heroImageAlt ?? imageAlt;
		if (startDate.trim()) {
			generateTrainingSessions();
		}

		successMessage = `Copied baseline fields from training program "${source.title}".`;
	};

	const togglePartner = (code: string) => {
		selectedPartnerCodes = selectedPartnerCodes.includes(code)
			? selectedPartnerCodes.filter((value) => value !== code)
			: [...selectedPartnerCodes, code];
	};

	const buildPayload = (action: 'preview' | 'save') => {
		const estimatedHoursValue = toInputText(estimatedHoursCommitment);
		const estimatedHoursNumber = estimatedHoursValue ? Number(estimatedHoursValue) : undefined;

		const normalizedSessions = sessions
			.map((session) => ({
				startAtUtc: toUtcIsoFromLocalInput(session.startLocal),
				endAtUtc: toUtcIsoFromLocalInput(session.endLocal)
			}))
			.filter((session) => session.startAtUtc && session.endAtUtc);
		const normalizedAgenda = agendaRows
			.map((row) => ({
				title: row.title.trim(),
				details: parseLines(row.detailsText)
			}))
			.filter((row) => row.title)
			.map((row) => ({
				title: row.title,
				details: row.details.length ? row.details : undefined
			}));
		const normalizedFaq = faqRows
			.map((row) => ({ question: row.question.trim(), answer: row.answer.trim() }))
			.filter((row) => row.question && row.answer);

		return {
			action,
			confirmWrite: action === 'save',
			mode,
			eventInput: {
				id: eventId,
				slug,
				title,
				tagline,
				summary,
				descriptionBodyMd,
				highlights: parseLines(highlightsText),
				audienceBullets: parseLines(audienceBulletsText),
				outcomes: parseLines(outcomesText),
				agenda: normalizedAgenda,
				faq: normalizedFaq,
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
				durationDays: undefined,
				estimatedHoursCommitment: mode === 'training' ? estimatedHoursNumber : undefined,
				sessions: normalizedSessions.length ? normalizedSessions : undefined,
				heroImage,
				heroImageAlt,
				image,
				imageAlt
			},
			campaignInput:
				campaignMode === 'existing'
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
		clientValidationIssues = validateBeforeSubmit();
		if (clientValidationIssues.length > 0) {
			errorMessage = 'Resolve the validation issues before continuing.';
			return;
		}

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
			preflight = json?.validation ?? null;
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

	const handleImagesSaved = (
		event: CustomEvent<{ urls: { landscape?: string; square?: string } }>
	) => {
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
		Essential-first workflow: fill core fields, run preview, then save. Open advanced sections only
		when you need deeper content or tracking controls.
	</p>
</header>

{#if !data.isDev}
	<section class="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
		<p class="text-sm font-semibold text-amber-900">Unavailable outside development.</p>
	</section>
{:else}
	<section class="mt-8 space-y-6">
		{#if errorMessage}
			<div
				class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800"
			>
				{errorMessage}
			</div>
		{/if}
		{#if successMessage}
			<div
				class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
			>
				{successMessage}
			</div>
		{/if}
		{#if clientValidationIssues.length > 0}
			<div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
				<p class="font-semibold">Fix these before preview/save:</p>
				<ul class="mt-2 list-disc space-y-1 pl-5">
					{#each clientValidationIssues as issue}
						<li>{issue}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Quick Start</h2>
			<p class="mt-2 text-sm text-gray-600">
				Copy from an existing event or training program to seed fields.
			</p>
			<div class="mt-3 flex flex-wrap gap-4 text-sm">
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={copySourceType} value="event" /> Existing event
				</label>
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={copySourceType} value="training_program" /> Training program
				</label>
			</div>
			{#if copySourceType === 'event'}
				<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
					<label class="text-sm font-semibold text-gray-800 sm:flex-1">
						Event template
						<select
							class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
							bind:value={copyEventId}
						>
							<option value="">Select an event...</option>
							{#each existingEvents as event}
								<option value={event.id}>{event.title} ({event.id})</option>
							{/each}
						</select>
					</label>
					<button
						type="button"
						class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
						on:click={applyCopyFromEvent}
					>
						Copy event fields
					</button>
				</div>
			{:else}
				<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
					<label class="text-sm font-semibold text-gray-800 sm:flex-1">
						Training template
						<select
							class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
							bind:value={copyProgramSku}
						>
							{#each trainingPrograms as program}
								<option value={program.sku}>{program.title} ({program.sku})</option>
							{/each}
						</select>
					</label>
					<button
						type="button"
						class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
						on:click={applyCopyFromProgram}
					>
						Copy program fields
					</button>
				</div>
			{/if}
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Essential</h2>
			<p class="mt-2 text-sm text-gray-600">
				Start here. These fields drive the calendar card and event page.
			</p>

			<div class="mt-4 flex flex-wrap gap-4 text-sm">
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={mode} value="training" /> Training-derived
				</label>
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={mode} value="external" /> External event
				</label>
			</div>

			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<label class="text-sm font-semibold text-gray-800">
					Event ID *
					<input
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={eventId}
						on:input={() => {
							campaignIdTouched = false;
						}}
					/>
					<p class="mt-1 text-xs text-gray-500">Used for event identity + default campaign ID.</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Slug *
					<input
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={slug}
					/>
					<p class="mt-1 text-xs text-gray-500">
						Used for `/events/[slug]` and campaign landing path.
					</p>
				</label>
				<label class="text-sm font-semibold text-gray-800 sm:col-span-2">
					Title *
					<input
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={title}
					/>
				</label>
				<label class="text-sm font-semibold text-gray-800 sm:col-span-2">
					Summary *
					<textarea
						rows={2}
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={summary}
					></textarea>
					<p class="mt-1 text-xs text-gray-500">
						Used for `/events` cards and `/api/events.json` summary.
					</p>
				</label>
			</div>

			<div class="mt-4 grid gap-4 sm:grid-cols-3">
				<label class="text-sm font-semibold text-gray-800">
					Visibility *
					<select
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={visibility}
					>
						<option value="draft">draft</option>
						<option value="unlisted">unlisted</option>
						<option value="public">public</option>
					</select>
					<p class="mt-1 text-xs text-gray-500">Controls public listing behavior.</p>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Lifecycle *
					<select
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={lifecycleStatus}
					>
						<option value="scheduled">scheduled</option>
						<option value="postponed">postponed</option>
						<option value="canceled">canceled</option>
						<option value="completed">completed</option>
					</select>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Registration *
					<select
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={registrationStatus}
					>
						<option value="open">open</option>
						<option value="external">external</option>
						<option value="closed">closed</option>
						<option value="none">none</option>
						<option value="waitlist">waitlist</option>
						<option value="sold_out">sold_out</option>
					</select>
					<p class="mt-1 text-xs text-gray-500">Drives CTA state and event status messaging.</p>
				</label>
			</div>

			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<label class="text-sm font-semibold text-gray-800">
					CTA label *
					<select
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={ctaLabel}
					>
						{#each ctaLabelOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					CTA URL
					<input
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={ctaUrl}
					/>
					<p class="mt-1 text-xs text-gray-500">
						Used by event detail button and campaign short-link redirect.
					</p>
				</label>
			</div>

			{#if mode === 'training'}
				<div class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
					<h3 class="text-base font-semibold text-gray-900">Training schedule inputs</h3>
					<div class="mt-3 grid gap-4 sm:grid-cols-2">
						<label class="text-sm font-semibold text-gray-800">
							Program SKU *
							<select
								class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
								bind:value={programSku}
							>
								{#each trainingPrograms as program}
									<option value={program.sku}>{program.title} ({program.sku})</option>
								{/each}
							</select>
						</label>
					</div>
					<div class="mt-4 rounded border border-gray-200 bg-white p-3">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="text-sm font-semibold text-gray-800">Training sessions</p>
							<div class="flex items-center gap-2">
								<button
									type="button"
									class="rounded border border-gray-300 px-2 py-1 text-xs"
									on:click={addSession}
								>
									Add session
								</button>
								<button
									type="button"
									class="rounded border border-gray-300 px-2 py-1 text-xs"
									on:click={applyProgramTemplateToSessionGenerator}
								>
									Use program defaults
								</button>
								<button
									type="button"
									class="rounded border border-gray-300 px-2 py-1 text-xs"
									on:click={() => generateTrainingSessions()}
								>
									Generate weekly sessions
								</button>
								<button
									type="button"
									class="rounded border border-gray-300 px-2 py-1 text-xs"
									on:click={clearSessions}
								>
									Clear sessions
								</button>
							</div>
						</div>
						<p class="mt-1 text-xs text-gray-500">
							Set up a template, then generate weekly sessions. You can edit any generated session.
						</p>
						<div
							class="mt-3 grid gap-3 rounded border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2"
						>
							<label class="text-xs font-semibold text-gray-700">
								Start date *
								<input
									type="date"
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={startDate}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700">
								Start time local
								<input
									type="time"
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={startTimeLocal}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700">
								Session length (hours)
								<input
									type="number"
									step="0.25"
									min="0.25"
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={estimatedHoursCommitment}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700">
								Number of sessions
								<input
									type="number"
									step="1"
									min="1"
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={numberOfSessions}
								/>
							</label>
						</div>
						<p class="mt-2 text-xs text-gray-500">
							Current template target: {toTrainingSessionCount()} session{toTrainingSessionCount() ===
							1
								? ''
								: 's'}.
						</p>
						{#if trainingSessionsCustomized}
							<p class="mt-1 text-xs font-semibold text-amber-700">
								You edited sessions manually. Click “Generate weekly sessions” to reset.
							</p>
						{/if}
						<div class="mt-3 space-y-3">
							{#each sessions as session, index}
								<div class="grid gap-3 rounded border border-gray-200 p-3 sm:grid-cols-2">
									<p class="text-xs font-semibold text-gray-800 sm:col-span-2">
										Session {index + 1}
									</p>
									<label class="text-xs font-semibold text-gray-700">
										Start (local)
										<input
											type="datetime-local"
											class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
											bind:value={session.startLocal}
											on:input={markSessionsCustomized}
										/>
										<p class="mt-1 text-[11px] font-normal text-gray-500">
											UTC: {toUtcPreview(session.startLocal)}
										</p>
									</label>
									<label class="text-xs font-semibold text-gray-700">
										End (local)
										<input
											type="datetime-local"
											class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
											bind:value={session.endLocal}
											on:input={markSessionsCustomized}
										/>
										<p class="mt-1 text-[11px] font-normal text-gray-500">
											UTC: {toUtcPreview(session.endLocal)}
										</p>
									</label>
									<div class="sm:col-span-2">
										<button
											type="button"
											class="rounded border border-gray-300 px-2 py-1 text-xs"
											on:click={() => removeSession(index)}
										>
											Remove
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else}
				<div class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
					<h3 class="text-base font-semibold text-gray-900">External event schedule inputs</h3>
					<div class="mt-3 grid gap-4 sm:grid-cols-2">
						<label class="text-sm font-semibold text-gray-800">
							Type *
							<select
								class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
								bind:value={type}
							>
								{#each eventTypeOptions as option}
									<option value={option}>{option}</option>
								{/each}
							</select>
						</label>
						<label class="text-sm font-semibold text-gray-800">
							Type label
							<input
								class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
								bind:value={typeLabel}
							/>
						</label>
						<label class="text-sm font-semibold text-gray-800">
							Location mode *
							<select
								class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
								bind:value={locationMode}
							>
								<option value="online">online</option>
								<option value="in_person">in_person</option>
								<option value="hybrid">hybrid</option>
							</select>
						</label>
						<label class="text-sm font-semibold text-gray-800">
							Location label *
							<input
								class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
								bind:value={locationPublicLabel}
							/>
						</label>
						<label class="text-sm font-semibold text-gray-800 sm:col-span-2">
							Location details visibility
							<select
								class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
								bind:value={locationDetailsVisibility}
							>
								<option value="public">public</option>
								<option value="post_signup">post_signup</option>
								<option value="tbd">tbd</option>
							</select>
						</label>
					</div>
					<div class="mt-4 rounded border border-gray-200 bg-white p-3">
						<div class="flex items-center justify-between">
							<p class="text-sm font-semibold text-gray-800">Sessions *</p>
							<div class="flex items-center gap-2">
								<button
									type="button"
									class="rounded border border-gray-300 px-2 py-1 text-xs"
									on:click={addSession}
								>
									Add session
								</button>
								<button
									type="button"
									class="rounded border border-gray-300 px-2 py-1 text-xs"
									on:click={clearSessions}
								>
									Clear sessions
								</button>
							</div>
						</div>
						<p class="mt-1 text-xs text-gray-500">
							Pick local date/time in your browser timezone. UTC is generated automatically.
						</p>
						<div class="mt-3 space-y-3">
							{#each sessions as session, index}
								<div class="grid gap-3 rounded border border-gray-200 p-3 sm:grid-cols-2">
									<p class="text-xs font-semibold text-gray-800 sm:col-span-2">
										Session {index + 1}
									</p>
									<label class="text-xs font-semibold text-gray-700">
										Start (local)
										<input
											type="datetime-local"
											class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
											bind:value={session.startLocal}
										/>
										<p class="mt-1 text-[11px] font-normal text-gray-500">
											UTC: {toUtcPreview(session.startLocal)}
										</p>
									</label>
									<label class="text-xs font-semibold text-gray-700">
										End (local)
										<input
											type="datetime-local"
											class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
											bind:value={session.endLocal}
										/>
										<p class="mt-1 text-[11px] font-normal text-gray-500">
											UTC: {toUtcPreview(session.endLocal)}
										</p>
									</label>
									<div class="sm:col-span-2">
										<button
											type="button"
											class="rounded border border-gray-300 px-2 py-1 text-xs"
											on:click={() => removeSession(index)}
										>
											Remove
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>

		<details class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<summary class="cursor-pointer text-xl font-semibold">Advanced Content</summary>
			<p class="mt-2 text-sm text-gray-600">
				Optional content enrichment for event detail pages and richer API payloads.
			</p>
			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<label class="text-sm font-semibold text-gray-800">
					Tagline
					<input
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={tagline}
					/>
				</label>
				<label class="text-sm font-semibold text-gray-800 sm:col-span-2">
					Description body markdown
					<textarea
						rows={5}
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={descriptionBodyMd}
					></textarea>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Highlights (one per line)
					<textarea
						rows={4}
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={highlightsText}
					></textarea>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Audience bullets (one per line)
					<textarea
						rows={4}
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={audienceBulletsText}
					></textarea>
				</label>
				<label class="text-sm font-semibold text-gray-800 sm:col-span-2">
					Outcomes (one per line)
					<textarea
						rows={4}
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={outcomesText}
					></textarea>
				</label>
			</div>

			<div class="mt-5 rounded border border-gray-200 bg-gray-50 p-3">
				<div class="flex items-center justify-between">
					<p class="text-sm font-semibold text-gray-800">Agenda rows</p>
					<button
						type="button"
						class="rounded border border-gray-300 px-2 py-1 text-xs"
						on:click={addAgendaRow}>Add agenda row</button
					>
				</div>
				<div class="mt-3 space-y-3">
					{#each agendaRows as row, index}
						<div class="rounded border border-gray-200 bg-white p-3">
							<div class="grid gap-3 sm:grid-cols-2">
								<label class="text-xs font-semibold text-gray-700 sm:col-span-2">
									Title
									<input
										class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
										bind:value={row.title}
									/>
								</label>
								<label class="text-xs font-semibold text-gray-700 sm:col-span-2">
									Bullets (one per line)
									<textarea
										rows={4}
										class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
										bind:value={row.detailsText}
									></textarea>
								</label>
							</div>
							<button
								type="button"
								class="mt-2 rounded border border-gray-300 px-2 py-1 text-xs"
								on:click={() => removeAgendaRow(index)}>Remove</button
							>
						</div>
					{/each}
				</div>
			</div>

			<div class="mt-5 rounded border border-gray-200 bg-gray-50 p-3">
				<div class="flex items-center justify-between">
					<p class="text-sm font-semibold text-gray-800">FAQ rows</p>
					<button
						type="button"
						class="rounded border border-gray-300 px-2 py-1 text-xs"
						on:click={addFaqRow}>Add FAQ row</button
					>
				</div>
				{#if mode === 'training' && selectedTrainingProgram?.faqs?.length}
					<p class="mt-2 text-xs text-gray-500">
						Program FAQ defaults available from training data.
					</p>
				{/if}
				{#if mode === 'external' && eventFaqDefaults.length}
					<p class="mt-2 text-xs text-gray-500">
						Event FAQ preset starter available if you keep rows empty.
					</p>
				{/if}
				<div class="mt-3 space-y-3">
					{#each faqRows as row, index}
						<div class="rounded border border-gray-200 bg-white p-3">
							<label class="text-xs font-semibold text-gray-700">
								Question
								<input
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={row.question}
								/>
							</label>
							<label class="mt-2 block text-xs font-semibold text-gray-700">
								Answer
								<textarea
									rows={3}
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={row.answer}
								></textarea>
							</label>
							<button
								type="button"
								class="mt-2 rounded border border-gray-300 px-2 py-1 text-xs"
								on:click={() => removeFaqRow(index)}>Remove</button
							>
						</div>
					{/each}
				</div>
			</div>

			<div class="mt-5 rounded border border-gray-200 bg-gray-50 p-3">
				<p class="text-sm font-semibold text-gray-800">Partner codes</p>
				<div class="mt-2 flex flex-wrap gap-3">
					{#each partners as partner}
						<label
							class="inline-flex items-center gap-2 rounded border border-gray-200 bg-white px-2 py-1 text-xs"
						>
							<input
								type="checkbox"
								checked={selectedPartnerCodes.includes(partner.code)}
								on:change={() => togglePartner(partner.code)}
							/>
							{partner.code} - {partner.name}
						</label>
					{/each}
				</div>
			</div>
		</details>

		<details class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<summary class="cursor-pointer text-xl font-semibold">Advanced Tracking</summary>
			<p class="mt-2 text-sm text-gray-600">
				Default auto-tracking keeps campaign setup simple. Open fields below only if you need
				overrides.
			</p>
			<div class="mt-4 flex flex-wrap gap-4 text-sm">
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={campaignMode} value="auto" /> Auto-create
				</label>
				<label class="inline-flex items-center gap-2">
					<input type="radio" bind:group={campaignMode} value="existing" /> Existing campaign
				</label>
			</div>

			{#if campaignMode === 'auto'}
				<div class="mt-4 rounded border border-gray-200 bg-gray-50 p-3">
					<label class="text-sm font-semibold text-gray-800">
						Campaign ID
						<input
							class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
							bind:value={campaignId}
							on:input={() => (campaignIdTouched = true)}
						/>
					</label>
					<p class="mt-1 text-xs text-gray-500">
						Used for short links and `utm_content`. Defaults to event ID.
					</p>

					<label class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
						<input type="checkbox" bind:checked={showAdvancedTrackingFields} />
						Edit UTM and attribution fields
					</label>

					{#if showAdvancedTrackingFields}
						<div class="mt-3 grid gap-3 sm:grid-cols-2">
							<label class="text-xs font-semibold text-gray-700">
								Partner
								<input
									list="campaign-partner-options"
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={campaignPartner}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700">
								Partner label
								<input
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={campaignPartnerLabel}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700">
								utm_source
								<input
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={utmSource}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700">
								utm_medium
								<input
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={utmMedium}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700">
								utm_campaign
								<input
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={utmCampaign}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700">
								src
								<input
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={campaignSrc}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700">
								ad
								<input
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={campaignAd}
									on:input={() => (campaignAdTouched = true)}
								/>
							</label>
							<label class="text-xs font-semibold text-gray-700 sm:col-span-2">
								Description
								<input
									class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
									bind:value={campaignDescription}
								/>
							</label>
						</div>
					{:else}
						<p class="mt-3 text-xs text-gray-600">
							Using defaults: utm_source=qr, utm_medium=offline, utm_campaign=events, src=qr, ad={campaignPartner ||
								'cambermast'}.
						</p>
					{/if}
				</div>
			{:else if campaignMode === 'existing'}
				<label class="mt-4 block text-sm font-semibold text-gray-800">
					Existing campaign
					<select
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={existingCampaignId}
					>
						{#each existingCampaignOptions as campaign}
							<option value={campaign.id}>{campaign.id} - {campaign.label}</option>
						{/each}
					</select>
				</label>
			{/if}
		</details>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Images</h2>
			<p class="mt-2 text-sm text-gray-600">
				Generate and save image candidates first, then review URLs and alt text below.
			</p>
			<div class="mt-5">
				<AdminImageGenPanel
					isDev={data.isDev}
					mode="embedded"
					{slug}
					destinationType={mode === 'training' ? 'training' : 'events'}
					defaultTemplateUrl={data.defaultTemplateUrl}
					defaultPrompts={data.defaultPrompts}
					defaultN={data.defaultN}
					minN={data.minN}
					maxN={data.maxN}
					on:imagessaved={handleImagesSaved}
				/>
			</div>

			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<label class="text-sm font-semibold text-gray-800">
					Hero Image URL *
					<input
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={heroImage}
					/>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					OG Image URL *
					<input
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={image}
					/>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					Hero Image Alt
					<input
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={heroImageAlt}
					/>
				</label>
				<label class="text-sm font-semibold text-gray-800">
					OG Image Alt
					<input
						class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
						bind:value={imageAlt}
					/>
				</label>
			</div>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Preview and Save</h2>
			<p class="mt-2 text-sm text-gray-600">
				Preview is recommended before save. Save writes to `events.json` and optionally
				`campaigns.json`.
			</p>
			<div class="mt-4 flex flex-wrap gap-3">
				<button
					type="button"
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
					disabled={loadingPreview || saving}
					on:click={() => runDraftAction('preview')}
				>
					{loadingPreview ? 'Previewing...' : 'Preview Draft JSON'}
				</button>
				<button
					type="button"
					class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
					disabled={saving || loadingPreview}
					on:click={() => runDraftAction('save')}
				>
					{saving ? 'Saving...' : 'Save Draft to Registries'}
				</button>
			</div>

			{#if preflight}
				<div class="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
					<p class="font-semibold text-gray-800">Collision preflight</p>
					<ul class="mt-2 list-disc space-y-1 pl-5 text-gray-700">
						<li>eventIdExists: {preflight.eventIdExists ? 'yes' : 'no'}</li>
						<li>eventSlugExists: {preflight.eventSlugExists ? 'yes' : 'no'}</li>
						<li>campaignIdExists: {preflight.campaignIdExists ? 'yes' : 'no'}</li>
						<li>
							campaignLandingPathExists:
							{preflight.campaignLandingPathExists ? 'yes' : 'no'}
						</li>
					</ul>
				</div>
			{/if}

			{#if previewResult}
				<details class="mt-4 rounded border border-gray-200 bg-gray-50 p-3">
					<summary class="cursor-pointer text-sm font-semibold text-gray-700"
						>View preview JSON</summary
					>
					<pre
						class="mt-2 max-h-[32rem] overflow-auto rounded bg-white p-3 text-xs">{previewResult}</pre>
				</details>
			{/if}
		</div>

		<datalist id="campaign-partner-options">
			{#each campaignPartnerOptions as option}
				<option value={option}></option>
			{/each}
		</datalist>
	</section>
{/if}
