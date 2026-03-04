<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	type ImageGenStage = 'square' | 'landscape' | 'portrait';
	type BlobScope = 'events' | 'training';
	type Mode = 'embedded' | 'standalone';
	const NO_TEMPLATE_OPTION = '__no-template__';
	const NO_TEMPLATE_SQUARE_PROMPT =
		'Abstract geometric background inspired by a modern sail or forward motion shape, using deep navy #012072 as the dominant base with layered bold blue #0037BE, bright blue #0063F2, mint green #8BD8BD, and a subtle orange #F49F1C accent. Clean, overlapping angular panels with smooth blended transitions and very soft, fine grain texture. Composition should frame the edges and corners, leaving a calm, open negative space in the center for text placement. Professional, training-focused, confident corporate style. No white, no glow, no light beams, no dark vignette, no clutter. Balanced contrast to support overlay text.';
	type StageAPromptPreset = {
		label: string;
		prompt: string;
	};
	const STAGE_A_PROMPT_PRESETS: StageAPromptPreset[] = [
		{
			label: 'With Template',
			prompt: `Use the provided template image as a visual style and composition reference. Create a new image of the same type.

Generate the text "TITLE, TAGLINE, MONTH, ETC" and a modern, sophisticated, clean image that represents the title. Avoid: dark backgrounds, visual cliches, and imagery that anthropomorphizes AI.

Avoid the top and bottom 25%.`
		},
		{
			label: 'BG + Text + Symbol',
			prompt: `Abstract geometric background inspired by a modern sail or forward motion shape, using deep navy #012072 as the dominant base with layered bold blue #0037BE, bright blue #0063F2, mint green #8BD8BD, and a subtle orange #F49F1C accent. Clean, overlapping angular panels with smooth, blended transitions and a very soft, fine-grained texture. Composition should frame the edges and corners, leaving a calm, open negative space in the center for text placement. Professional, training-focused, confident corporate style. No white, no glow, no light beams, no dark vignette, no clutter. Balanced contrast to support overlay text.

Create a webinar hero treatment for "AI POWER PROMPTING" and "MARCH 2026". Generate two separate elements: (1) the headline text and (2) a simple icon/symbol. The composition should feel open and integrated into the existing background, not like a title card. Keep overall styling bright and clean, with minimal effects and strong thumbnail legibility.

Focus on placing text and elements in the center of the image.

STRICT AVOIDANCE RULES
* Visual cliches like AI brains and circuits.
* Imagery that anthropomorphizes AI.`
		},
		{
			label: 'BG + Text + People',
			prompt: `Abstract geometric background inspired by a modern sail or forward motion shape, using deep navy #012072 as the dominant base with layered bold blue #0037BE, bright blue #0063F2, mint green #8BD8BD, and a subtle orange #F49F1C accent. Clean, overlapping angular panels with smooth, blended transitions and a very soft, fine-grained texture. Composition should frame the edges and corners, leaving a calm, open negative space in the center for text placement. Professional, training-focused, confident corporate style. No white, no glow, no light beams, no dark vignette, no clutter. Balanced contrast to support overlay text.

Create a webinar hero treatment for "AI POWER PROMPTING" and "MARCH 2026". Generate two separate elements: (1) the headline text and (2) a photorealistic image of a diverse group of happy people learning how to prompt together that is integrated into the overall design. The composition should feel open and integrated into the existing background, not like a title card. Keep overall styling bright and clean, with minimal effects with a strong focus on legibility.

Focus on placing text and elements in the center of the image.

STRICT AVOIDANCE RULES
* Visual cliches like AI brains and circuits.
* Imagery that anthropomorphizes AI.`
		},
		{
			label: 'BG + Text + People + Symbols',
			prompt: `GENERATE A BACKGROUND
Abstract geometric background inspired by a modern sail or forward motion shape, using deep navy #012072 as the dominant base with layered bold blue #0037BE, bright blue #0063F2, mint green #8BD8BD, and a subtle orange #F49F1C accent. Clean, overlapping angular panels with smooth, blended transitions and a very soft, fine-grained texture. Composition should frame the edges and corners, leaving a calm, open negative space in the center for text placement. Professional, training-focused, confident corporate style. No white, no glow, no light beams, no dark vignette, no clutter. Balanced contrast to support overlay text.

OVERLAY TEXT
Add the text "AI POWER PROMPTING" and "MARCH 2026".

OVERLAY ELEMENTS
Incorporate a photorealistic image of a diverse group of happy people learning to prompt together, integrated into the overall design. The composition should feel open and integrated into the existing background, not like a title card. Keep overall styling bright and clean, with minimal effects, with a strong focus on legibility. Add hints about what good prompts are like in a unique way.

STRICT OVERLAY RULES
Focus on placing text and elements in the center of the image.

STRICT AVOIDANCE RULES
* Visual cliches like AI brains and circuits.
* Imagery that anthropomorphizes AI.`
		}
	];

	const STAGE_SIZE_MAP: Record<ImageGenStage, '1024x1024' | '1536x1024' | '1024x1536'> = {
		square: '1024x1024',
		landscape: '1536x1024',
		portrait: '1024x1536'
	};

	type Candidate = {
		id: string;
		dataUrl: string;
		width: string;
		height: string;
		minioKey: string;
		minioUrl?: string;
		minioBackupError?: string;
	};

	type TrainingReference = {
		programSku?: string;
		programTitle: string;
		field: 'generatedSquare' | 'generatedLandscape' | 'heroImage' | 'ogImage';
		url: string;
		label: string;
	};

	type WriteResult = {
		variant: ImageGenStage;
		absolutePath: string;
		publicUrl: string;
		version: number;
		fileName?: string;
	};

	type PromptHistoryEntry = {
		id: string;
		createdAt: string;
		blobScope: BlobScope;
		slug: string;
		assetKeys: Record<ImageGenStage, string>;
		prompts: {
			square: string;
			landscape: string;
			portrait: string;
		};
	};

	type PromptStandardsApiResponse = {
		standards?: Array<{
			id?: unknown;
			createdAt?: unknown;
			blobScope?: unknown;
			slug?: unknown;
			assetKeys?: Partial<Record<ImageGenStage, unknown>>;
			prompts?: Partial<Record<ImageGenStage, unknown>>;
		}>;
	};

	export let isDev = false;
	export let mode: Mode = 'standalone';
	export let slug = '';
	export let defaultTemplateUrl = '';
	export let defaultPrompts: { square: string; landscape: string; portrait: string } = {
		square: '',
		landscape: '',
		portrait: ''
	};
	export let defaultN = 4;
	export let minN = 1;
	export let maxN = 10;
	export let blobScope: BlobScope = 'events';

	const dispatch = createEventDispatcher<{
		imagessaved: {
			slug: string;
			writes: WriteResult[];
			urls: {
				square?: string;
				landscape?: string;
				portrait?: string;
			};
		};
	}>();

	let squarePrompt = defaultPrompts.square;
	let landscapePrompt = defaultPrompts.landscape;
	let portraitPrompt = defaultPrompts.portrait;
	let squareN = defaultN;
	let landscapeN = defaultN;
	let portraitN = defaultN;

	let templates: string[] = [];
	let trainingReferences: TrainingReference[] = [];
	let selectedTemplateUrl = defaultTemplateUrl;
	let templateImageDataUrl = '';
	let uploadedTemplateName = '';
	let templatesLoading = false;
	let trainingReferencesLoading = false;
	let noTemplateSelected = false;
	let trainingReferenceError = '';

	let squareCandidates: Candidate[] = [];
	let landscapeCandidates: Candidate[] = [];
	let portraitCandidates: Candidate[] = [];
	let selectedSquareCandidateId = '';
	let selectedLandscapeCandidateId = '';
	let selectedPortraitCandidateId = '';

	let squarePayloadPreview = '';
	let landscapePayloadPreview = '';
	let portraitPayloadPreview = '';

	let generatingStage: ImageGenStage | null = null;
	let stageGenerationToken: Record<ImageGenStage, number> = {
		square: 0,
		landscape: 0,
		portrait: 0
	};
	let stageNotices: Record<ImageGenStage, string> = {
		square: '',
		landscape: '',
		portrait: ''
	};
	let saving = false;
	let errorMessage = '';
	let saveMessage = '';
	let saveWrites: WriteResult[] = [];
	let previewCandidate: Candidate | null = null;
	let promptHistory: PromptHistoryEntry[] = [];
	let promptHistorySearch = '';
	let filteredPromptHistory: PromptHistoryEntry[] = [];

	const MINIO_BROWSER_BASE = 'https://minio-on-hstgr.tail8a5127.ts.net/browser/blobs/';
	const PROMPT_HISTORY_MAX_ITEMS = 150;

	const readFileAsDataUrl = (file: Blob): Promise<string> =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result !== 'string') {
					reject(new Error('Unable to read file'));
					return;
				}
				resolve(reader.result);
			};
			reader.onerror = () => reject(new Error('Unable to read file'));
			reader.readAsDataURL(file);
		});

	const setTemplateFromUrl = async (url: string) => {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Unable to load template (${response.status.toString()})`);
		const blob = await response.blob();
		templateImageDataUrl = await readFileAsDataUrl(blob);
		selectedTemplateUrl = url;
		uploadedTemplateName = '';
		noTemplateSelected = false;
	};

	const setNoTemplateMode = () => {
		noTemplateSelected = true;
		selectedTemplateUrl = NO_TEMPLATE_OPTION;
		templateImageDataUrl = '';
		uploadedTemplateName = '';
		squarePrompt = NO_TEMPLATE_SQUARE_PROMPT;
	};

	const loadTemplates = async () => {
		templatesLoading = true;
		try {
			const response = await fetch('/admin/image-gen/api/templates');
			const json = await response.json();
			if (!response.ok) throw new Error(json?.error ?? 'Unable to load templates');
			templates = Array.isArray(json.templates) ? json.templates : [];
			if (noTemplateSelected) return;
			if (templates.length > 0 && !templates.includes(selectedTemplateUrl)) {
				selectedTemplateUrl = templates[0];
			}
			if (selectedTemplateUrl) {
				await setTemplateFromUrl(selectedTemplateUrl);
			}
		} finally {
			templatesLoading = false;
		}
	};

	const loadTrainingReferences = async () => {
		trainingReferencesLoading = true;
		trainingReferenceError = '';
		try {
			const response = await fetch('/admin/image-gen/api/training-references');
			const json = await response.json();
			if (!response.ok) throw new Error(json?.error ?? 'Unable to load training references');
			trainingReferences = Array.isArray(json.references)
				? (json.references as TrainingReference[])
				: [];
		} catch (error) {
			trainingReferenceError =
				error instanceof Error ? error.message : 'Unable to load training references';
		} finally {
			trainingReferencesLoading = false;
		}
	};

	const getBlobBrowserUrl = (minioKey: string): string =>
		`${MINIO_BROWSER_BASE}${minioKey.replace(/^\/+/, '')}`;

	const openPreview = (candidate: Candidate) => {
		previewCandidate = candidate;
	};

	const openSelectedTemplatePreview = () => {
		if (!templateImageDataUrl) return;
		const sourceLabel =
			uploadedTemplateName ||
			(selectedTemplateUrl && selectedTemplateUrl !== NO_TEMPLATE_OPTION
				? selectedTemplateUrl
				: 'Selected template');
		openPreview({
			id: 'selected-template',
			dataUrl: templateImageDataUrl,
			width: '',
			height: '',
			minioKey: sourceLabel
		});
	};

	const closePreview = () => {
		previewCandidate = null;
	};

	const getFileNameFromPublicUrl = (publicUrl: string): string => {
		const parts = publicUrl.split('/');
		return parts[parts.length - 1] || '';
	};

	const formatHistoryDate = (value: string): string => {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleString();
	};

	const getHistoryChipLabel = (entry: PromptHistoryEntry, stage: ImageGenStage): string => {
		return entry.assetKeys[stage];
	};

	const applyHistoryPrompts = (entry: PromptHistoryEntry) => {
		squarePrompt = entry.prompts.square;
		landscapePrompt = entry.prompts.landscape;
		portraitPrompt = entry.prompts.portrait;
		saveMessage = `Loaded prompts from ${entry.slug}.`;
	};

	const applyHistoryPromptForStage = (entry: PromptHistoryEntry, stage: ImageGenStage) => {
		const prompt = entry.prompts[stage];
		if (stage === 'square') squarePrompt = prompt;
		if (stage === 'landscape') landscapePrompt = prompt;
		if (stage === 'portrait') portraitPrompt = prompt;
		saveMessage = `Loaded ${toStageLabel(stage)} prompt from ${entry.slug}.`;
	};

	const parseWriteResults = (value: unknown): WriteResult[] => {
		if (!Array.isArray(value)) return [];
		const mapped: Array<WriteResult | null> = value.map((item) => {
				if (!item || typeof item !== 'object') return null;
				const row = item as Record<string, unknown>;
				const variant = row.variant;
				if (variant !== 'square' && variant !== 'landscape' && variant !== 'portrait') return null;
				const absolutePath = typeof row.absolutePath === 'string' ? row.absolutePath : '';
				const publicUrl = typeof row.publicUrl === 'string' ? row.publicUrl : '';
				const version =
					typeof row.version === 'number' && Number.isFinite(row.version) ? row.version : 1;
				const fileName =
					typeof row.fileName === 'string' && row.fileName.length > 0
						? row.fileName
						: getFileNameFromPublicUrl(publicUrl);
				return {
					variant,
					absolutePath,
					publicUrl,
					version,
					fileName
				};
			});
		return mapped.filter((value): value is WriteResult => value !== null);
	};

	const parsePromptHistoryResponse = (value: unknown): PromptHistoryEntry[] => {
		const body = value as PromptStandardsApiResponse | null;
		const rows = Array.isArray(body?.standards) ? body.standards : [];
		return rows
			.map((entry): PromptHistoryEntry | null => {
				if (!entry || typeof entry !== 'object') return null;
				const id = typeof entry.id === 'string' ? entry.id : '';
				const createdAt = typeof entry.createdAt === 'string' ? entry.createdAt : '';
				const slugValue = typeof entry.slug === 'string' ? entry.slug : '';
				const scope = entry.blobScope === 'training' ? 'training' : entry.blobScope === 'events' ? 'events' : null;
				const prompts = entry.prompts;
				const assetKeys = entry.assetKeys;
				if (
					!id ||
					!createdAt ||
					!slugValue ||
					!scope ||
					!prompts ||
					typeof prompts.square !== 'string' ||
					typeof prompts.landscape !== 'string' ||
					typeof prompts.portrait !== 'string' ||
					!assetKeys ||
					typeof assetKeys.square !== 'string' ||
					typeof assetKeys.landscape !== 'string' ||
					typeof assetKeys.portrait !== 'string'
				) {
					return null;
				}
				return {
					id,
					createdAt,
					blobScope: scope,
					slug: slugValue,
					assetKeys: {
						square: assetKeys.square,
						landscape: assetKeys.landscape,
						portrait: assetKeys.portrait
					},
					prompts: {
						square: prompts.square,
						landscape: prompts.landscape,
						portrait: prompts.portrait
					}
				};
			})
			.filter((entry): entry is PromptHistoryEntry => entry !== null)
			.filter((entry) => entry.blobScope === blobScope)
			.slice(0, PROMPT_HISTORY_MAX_ITEMS);
	};

	const loadPromptHistory = async () => {
		try {
			const response = await fetch('/api/image-gen-standards.json');
			const json = (await response.json()) as unknown;
			if (!response.ok) throw new Error('Unable to load prompt standards.');
			promptHistory = parsePromptHistoryResponse(json);
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unable to load prompt standards.';
			promptHistory = [];
		}
	};

	const handleWindowKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && previewCandidate) {
			closePreview();
		}
	};

	const toStageLabel = (stage: ImageGenStage): string =>
		stage === 'square' ? 'Square' : stage === 'landscape' ? 'Landscape' : 'Portrait';
	const applyStageAPromptPreset = (prompt: string) => {
		squarePrompt = prompt;
	};

	const getSelectedSquareCandidate = (): Candidate | undefined =>
		squareCandidates.find((candidate) => candidate.id === selectedSquareCandidateId);

	const clearDownstreamFromSquare = () => {
		landscapeCandidates = [];
		portraitCandidates = [];
		selectedLandscapeCandidateId = '';
		selectedPortraitCandidateId = '';
		landscapePayloadPreview = '';
		portraitPayloadPreview = '';
	};

	const validateCount = (n: number): number => Math.min(maxN, Math.max(minN, Math.round(n)));
	const getPendingCount = (stage: ImageGenStage): number =>
		validateCount(stage === 'square' ? squareN : stage === 'landscape' ? landscapeN : portraitN);
	const buildPlaceholderKeys = (stage: ImageGenStage, count: number): string[] =>
		Array.from({ length: count }, (_, index) => `${stage}-${stageGenerationToken[stage].toString()}-${index.toString()}`);
	const MIN_GENERATE_SPINNER_MS = 900;

	const generateForStage = async (stage: ImageGenStage) => {
		errorMessage = '';
		saveMessage = '';
		stageNotices = { ...stageNotices, [stage]: '' };
		const templateForStage =
			stage === 'square'
				? (noTemplateSelected ? '' : templateImageDataUrl)
				: (getSelectedSquareCandidate()?.dataUrl ?? '');
		if (!templateForStage && !(stage === 'square' && noTemplateSelected)) {
			errorMessage =
				stage === 'square'
					? 'Select or upload a template image first.'
					: 'Select a square candidate before generating landscape or portrait variants.';
			return;
		}

		const prompt =
			stage === 'square' ? squarePrompt : stage === 'landscape' ? landscapePrompt : portraitPrompt;
		const n = validateCount(stage === 'square' ? squareN : stage === 'landscape' ? landscapeN : portraitN);
		if (stage === 'square') squareN = n;
		if (stage === 'landscape') landscapeN = n;
		if (stage === 'portrait') portraitN = n;

		const startedAt = Date.now();
		stageGenerationToken = {
			...stageGenerationToken,
			[stage]: stageGenerationToken[stage] + 1
		};
		generatingStage = stage;
		stageNotices = { ...stageNotices, [stage]: 'Sending request...' };
		try {
			const response = await fetch('/admin/image-gen/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					stage,
					prompt,
					n,
					size: STAGE_SIZE_MAP[stage],
					templateImageDataUrl: templateForStage,
					slug: slug || undefined,
					blobScope
				})
			});
			const json = await response.json();
			if (!response.ok) {
				throw new Error(json?.error ?? 'Generation failed');
			}

			const nextCandidates = Array.isArray(json.candidates) ? (json.candidates as Candidate[]) : [];
			const promptBackupError =
				typeof json.promptBackupError === 'string' ? json.promptBackupError : '';
			if (stage === 'square') {
				squareCandidates = [...nextCandidates, ...squareCandidates];
				squarePayloadPreview = JSON.stringify(json.payloadPreview, null, 2);
			}
			if (stage === 'landscape') {
				landscapeCandidates = [...nextCandidates, ...landscapeCandidates];
				landscapePayloadPreview = JSON.stringify(json.payloadPreview, null, 2);
			}
			if (stage === 'portrait') {
				portraitCandidates = [...nextCandidates, ...portraitCandidates];
				portraitPayloadPreview = JSON.stringify(json.payloadPreview, null, 2);
			}
			stageNotices = {
				...stageNotices,
				[stage]: promptBackupError
					? `Generated ${nextCandidates.length.toString()} candidate${nextCandidates.length === 1 ? '' : 's'} (prompt backup failed: ${promptBackupError}).`
					: `Generated ${nextCandidates.length.toString()} candidate${nextCandidates.length === 1 ? '' : 's'}.`
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Generation failed';
			errorMessage = message;
			stageNotices = { ...stageNotices, [stage]: `Failed: ${message}` };
		} finally {
			const elapsedMs = Date.now() - startedAt;
			if (elapsedMs < MIN_GENERATE_SPINNER_MS) {
				await new Promise((resolve) => setTimeout(resolve, MIN_GENERATE_SPINNER_MS - elapsedMs));
			}
			generatingStage = null;
		}
	};

	const allCandidates = (): Candidate[] => [
		...squareCandidates,
		...landscapeCandidates,
		...portraitCandidates
	];

	const copyPayload = async (value: string) => {
		if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return;
		await navigator.clipboard.writeText(value);
	};

	const saveSelected = async () => {
		errorMessage = '';
		saveMessage = '';
		saveWrites = [];
		if (!slug.trim()) {
			errorMessage = 'Slug is required before saving.';
			return;
		}
		if (!selectedSquareCandidateId || !selectedLandscapeCandidateId || !selectedPortraitCandidateId) {
			errorMessage = 'Select one square, one landscape, and one portrait image before saving.';
			return;
		}

		const candidateMap = Object.fromEntries(
			allCandidates().map((candidate) => [
				candidate.id,
				{ dataUrl: candidate.dataUrl, minioKey: candidate.minioKey }
			])
		);

		saving = true;
		try {
			const response = await fetch('/admin/image-gen/api/save-selected', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slug: slug.trim().toLowerCase(),
					blobScope,
					prompts: {
						square: squarePrompt,
						landscape: landscapePrompt,
						portrait: portraitPrompt
					},
					selected: {
						squareCandidateId: selectedSquareCandidateId,
						landscapeCandidateId: selectedLandscapeCandidateId,
						portraitCandidateId: selectedPortraitCandidateId
					},
					candidateMap
				})
			});
			const json = await response.json();
			if (!response.ok) throw new Error(json?.error ?? 'Save failed');

			saveWrites = parseWriteResults(json.writes);
			saveMessage = `Saved selected images for slug "${json.slug}".`;
			await loadPromptHistory();

			const urls = {
				square: saveWrites.find((write) => write.variant === 'square')?.publicUrl,
				landscape: saveWrites.find((write) => write.variant === 'landscape')?.publicUrl,
				portrait: saveWrites.find((write) => write.variant === 'portrait')?.publicUrl
			};
			dispatch('imagessaved', {
				slug: json.slug,
				writes: saveWrites,
				urls
			});
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Save failed';
		} finally {
			saving = false;
		}
	};

	onMount(async () => {
		if (!isDev) return;
		try {
			await Promise.all([loadTemplates(), loadTrainingReferences(), loadPromptHistory()]);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to load templates';
		}
	});

	$: {
		const search = promptHistorySearch.trim().toLowerCase();
		filteredPromptHistory = promptHistory.filter((entry) => {
			if (!search) return true;
			const searchTargets = [
				entry.slug,
				entry.assetKeys.square,
				entry.assetKeys.landscape,
				entry.assetKeys.portrait
			]
				.join(' ')
				.toLowerCase();
			return searchTargets.includes(search);
		});
	}
</script>

<svelte:window on:keydown={handleWindowKeydown} />

{#if !isDev}
	<section class="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
		<p class="text-sm font-semibold text-amber-900">Unavailable outside development.</p>
	</section>
{:else}
	<section class="space-y-6">
		{#if errorMessage}
			<div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
				{errorMessage}
			</div>
		{/if}

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Template Selection</h2>
			<p class="mt-2 text-sm text-gray-600">
				Use a template file from the template folder or upload a local image.
			</p>
			{#if templatesLoading}
				<p class="mt-3 text-sm text-gray-500">Loading templates...</p>
			{:else}
				<div class="mt-4 flex flex-wrap gap-2">
					<button
						class={`w-24 rounded-lg border p-1.5 text-left ${noTemplateSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
						type="button"
						on:click={() => setNoTemplateMode()}
					>
						<div class="flex h-16 w-full items-center justify-center rounded bg-gray-100 text-[10px] font-semibold text-gray-700">
							No template
						</div>
						<p class="mt-1 text-[10px] leading-tight text-gray-700">Prompt only</p>
					</button>
					{#each templates as template}
						<button
							class={`w-24 rounded-lg border p-1.5 text-left ${selectedTemplateUrl === template ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
							type="button"
							on:click={async () => {
								try {
									await setTemplateFromUrl(template);
								} catch (error) {
									errorMessage = error instanceof Error ? error.message : 'Unable to load template';
								}
							}}
						>
							<img class="h-16 w-full rounded object-cover" src={template} alt={template} />
							<p class="mt-1 truncate text-[10px] text-gray-700">{template.split('/').pop()}</p>
						</button>
					{/each}
				</div>
			{/if}

			<div class="mt-5">
				<h3 class="text-sm font-semibold text-gray-800">Training Program References</h3>
				<p class="mt-1 text-xs text-gray-600">
					Each program defaults to generated square, then generated landscape when square is unavailable.
				</p>
				{#if trainingReferencesLoading}
					<p class="mt-3 text-sm text-gray-500">Loading training references...</p>
				{:else if trainingReferenceError}
					<p class="mt-3 text-sm font-semibold text-rose-700">{trainingReferenceError}</p>
				{:else if trainingReferences.length === 0}
					<p class="mt-3 text-sm text-gray-500">No training references found.</p>
				{:else}
					<div class="mt-3 flex flex-wrap gap-2">
						{#each trainingReferences as reference}
							<button
								type="button"
								class={`w-24 rounded-lg border p-1.5 text-left ${
									selectedTemplateUrl === reference.url && !noTemplateSelected
										? 'border-blue-400 bg-blue-50'
										: 'border-gray-200 bg-white hover:border-gray-300'
								}`}
								on:click={async () => {
									try {
										await setTemplateFromUrl(reference.url);
									} catch (error) {
										errorMessage =
											error instanceof Error
												? error.message
												: 'Unable to load training reference image';
									}
								}}
							>
								<img
									src={reference.url}
									alt={reference.programTitle}
									class="h-16 w-full rounded object-cover"
									loading="lazy"
								/>
								<p class="mt-1 truncate text-[10px] text-gray-700">{reference.programTitle}</p>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="mt-5">
				<label class="mb-2 block text-sm font-semibold text-gray-800" for={`template-upload-${mode}`}>
					Upload a local template
				</label>
				<input
					id={`template-upload-${mode}`}
					type="file"
					accept="image/png,image/jpeg,image/webp"
					on:change={async (event) => {
						const input = event.currentTarget as HTMLInputElement;
						const file = input.files?.[0];
						if (!file) return;
						if (!file.type.startsWith('image/')) {
							errorMessage = 'Only image files are allowed for template upload.';
							return;
						}
						const uploadedTemplateDataUrl = await readFileAsDataUrl(file);
						uploadedTemplateName = file.name;
						templateImageDataUrl = uploadedTemplateDataUrl;
						selectedTemplateUrl = '';
						noTemplateSelected = false;
					}}
					class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
				/>
				{#if uploadedTemplateName}
					<p class="mt-2 text-xs text-gray-600">Using uploaded template: {uploadedTemplateName}</p>
				{/if}
				{#if noTemplateSelected}
					<p class="mt-2 text-xs text-gray-600">No template mode selected for Stage A.</p>
				{/if}
				{#if !noTemplateSelected && templateImageDataUrl}
					<div class="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
						<div class="flex items-center justify-between gap-2">
							<p class="text-sm font-semibold text-gray-800">Selected template preview</p>
							<button
								type="button"
								class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
								on:click={openSelectedTemplatePreview}
								aria-label="Preview selected template"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path d="M10 4c-3.9 0-7.2 2.3-8.7 5.6a1 1 0 0 0 0 .8C2.8 13.7 6.1 16 10 16s7.2-2.3 8.7-5.6a1 1 0 0 0 0-.8C17.2 6.3 13.9 4 10 4Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z" />
								</svg>
								Preview
							</button>
						</div>
						<img
							class="mt-3 max-h-80 w-full rounded bg-white object-contain"
							src={templateImageDataUrl}
							alt="Selected template"
						/>
						<p class="mt-2 truncate text-xs text-gray-600">
							{uploadedTemplateName ||
								(selectedTemplateUrl && selectedTemplateUrl !== NO_TEMPLATE_OPTION
									? selectedTemplateUrl
									: 'Template selected')}
						</p>
					</div>
				{/if}
			</div>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Run Settings</h2>
			<label class="mt-3 block text-sm font-semibold text-gray-800" for={`slug-${mode}`}>Program/Event slug path</label>
			<input
				id={`slug-${mode}`}
				type="text"
				placeholder="example: resources/ama or ai-workshop-spring-2026"
				bind:value={slug}
				class="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
			/>
			<p class="mt-1 text-xs text-gray-500">
				Use lowercase letters, numbers, hyphens, and optional <code>/</code> subfolders. If
				empty, generation backups use <code>unspecified</code>.
			</p>
		</div>

			<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
				<h2 class="text-xl font-semibold">Stage A: Square (1024x1024)</h2>
				<div class="mt-3 flex flex-wrap gap-2">
					{#each STAGE_A_PROMPT_PRESETS as preset}
						<button
							type="button"
							class={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
								squarePrompt.trim() === preset.prompt.trim()
									? 'border-blue-300 bg-blue-50 text-blue-700'
									: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
							}`}
							on:click={() => applyStageAPromptPreset(preset.prompt)}
						>
							{preset.label}
						</button>
					{/each}
				</div>
				<textarea bind:value={squarePrompt} rows={8} class="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm"></textarea>
				<div class="mt-3">
					<div class="flex items-center justify-between gap-3">
						<label class="text-sm font-semibold text-gray-800" for={`square-count-${mode}`}>Number of images to batch</label>
						<span class="text-sm font-semibold text-gray-800">{squareN}</span>
					</div>
					<input
						id={`square-count-${mode}`}
						type="range"
						min={minN}
						max={maxN}
						step="1"
						bind:value={squareN}
						class="mt-2 w-full"
					/>
					<p class="mt-1 text-xs text-gray-500">Range: {minN}-{maxN}. Default: {defaultN}.</p>
				</div>
				<div class="mt-3 flex flex-wrap items-center gap-3">
					<button
						class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
						type="button"
					disabled={generatingStage !== null || templatesLoading || (!noTemplateSelected && !templateImageDataUrl)}
					on:click={() => generateForStage('square')}
				>
					{generatingStage === 'square' ? 'Generating...' : squareCandidates.length ? 'Generate More' : 'Generate'}
				</button>
			</div>
			{#if stageNotices.square}
				<p class={`mt-2 text-sm ${stageNotices.square.startsWith('Failed:') ? 'font-semibold text-rose-700' : 'text-gray-700'}`}>
					{stageNotices.square}
				</p>
			{/if}
			<details class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<summary class="cursor-pointer text-sm font-semibold text-gray-700">OpenAI JSON payload (optional)</summary>
				{#if squarePayloadPreview}
					<button class="mt-2 rounded border border-gray-300 px-2 py-1 text-xs" type="button" on:click={() => copyPayload(squarePayloadPreview)}>Copy JSON</button>
					<pre class="mt-2 overflow-auto rounded bg-white p-3 text-xs">{squarePayloadPreview}</pre>
				{:else}
					<p class="mt-2 text-xs text-gray-500">No payload yet. Generate images first.</p>
				{/if}
			</details>

			{#if generatingStage === 'square'}
				<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each buildPlaceholderKeys('square', getPendingCount('square')) as placeholderKey (placeholderKey)}
						<div class="animate-pulse rounded-xl border border-blue-100 bg-blue-50 p-2">
							<div class="aspect-square w-full rounded bg-blue-100"></div>
							<div class="mt-2 h-3 w-2/3 rounded bg-blue-100"></div>
						</div>
					{/each}
				</div>
			{/if}
			{#if squareCandidates.length > 0}
				<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each squareCandidates as candidate}
						<div class={`rounded-xl border p-2 ${selectedSquareCandidateId === candidate.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
							<label>
								<input
									type="radio"
									name={`square-selection-${mode}`}
									value={candidate.id}
									checked={selectedSquareCandidateId === candidate.id}
									on:change={() => {
										selectedSquareCandidateId = candidate.id;
										clearDownstreamFromSquare();
									}}
								/>
								<img class="mt-2 aspect-square w-full rounded object-cover" src={candidate.dataUrl} alt={candidate.id} />
							</label>
							<div class="mt-2 flex flex-wrap items-center gap-2">
								<button
									type="button"
									class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
									on:click={() => openPreview(candidate)}
									aria-label="Preview image"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path d="M10 4c-3.9 0-7.2 2.3-8.7 5.6a1 1 0 0 0 0 .8C2.8 13.7 6.1 16 10 16s7.2-2.3 8.7-5.6a1 1 0 0 0 0-.8C17.2 6.3 13.9 4 10 4Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z" />
									</svg>
									Preview
								</button>
								{#if candidate.minioKey && !candidate.minioBackupError}
									<a
										class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
										href={getBlobBrowserUrl(candidate.minioKey)}
										target="_blank"
										rel="noopener noreferrer"
									>
										Original in blob
									</a>
								{/if}
							</div>
							<p class="mt-2 break-all text-[11px] text-gray-600">{candidate.minioKey}</p>
							{#if candidate.minioBackupError}
								<p class="text-[11px] font-semibold text-rose-700">
									Backup failed: {candidate.minioBackupError}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

			<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
				<h2 class="text-xl font-semibold">Stage B: Landscape (1536x1024)</h2>
				<textarea bind:value={landscapePrompt} rows={3} class="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm"></textarea>
				<div class="mt-3">
					<div class="flex items-center justify-between gap-3">
						<label class="text-sm font-semibold text-gray-800" for={`landscape-count-${mode}`}>Number of images to batch</label>
						<span class="text-sm font-semibold text-gray-800">{landscapeN}</span>
					</div>
					<input
						id={`landscape-count-${mode}`}
						type="range"
						min={minN}
						max={maxN}
						step="1"
						bind:value={landscapeN}
						class="mt-2 w-full"
					/>
					<p class="mt-1 text-xs text-gray-500">Range: {minN}-{maxN}. Default: {defaultN}.</p>
				</div>
				<div class="mt-3 flex flex-wrap items-center gap-3">
					<button
						class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
						type="button"
					disabled={generatingStage !== null || !selectedSquareCandidateId}
					on:click={() => generateForStage('landscape')}
				>
					{generatingStage === 'landscape' ? 'Generating...' : landscapeCandidates.length ? 'Generate More' : 'Generate'}
				</button>
			</div>
			{#if stageNotices.landscape}
				<p class={`mt-2 text-sm ${stageNotices.landscape.startsWith('Failed:') ? 'font-semibold text-rose-700' : 'text-gray-700'}`}>
					{stageNotices.landscape}
				</p>
			{/if}
			<details class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<summary class="cursor-pointer text-sm font-semibold text-gray-700">OpenAI JSON payload (optional)</summary>
				{#if landscapePayloadPreview}
					<button class="mt-2 rounded border border-gray-300 px-2 py-1 text-xs" type="button" on:click={() => copyPayload(landscapePayloadPreview)}>Copy JSON</button>
					<pre class="mt-2 overflow-auto rounded bg-white p-3 text-xs">{landscapePayloadPreview}</pre>
				{:else}
					<p class="mt-2 text-xs text-gray-500">No payload yet. Generate images first.</p>
				{/if}
			</details>

			{#if generatingStage === 'landscape'}
				<div class="mt-5 grid gap-4 sm:grid-cols-2">
					{#each buildPlaceholderKeys('landscape', getPendingCount('landscape')) as placeholderKey (placeholderKey)}
						<div class="animate-pulse rounded-xl border border-blue-100 bg-blue-50 p-2">
							<div class="aspect-[3/2] w-full rounded bg-blue-100"></div>
							<div class="mt-2 h-3 w-2/3 rounded bg-blue-100"></div>
						</div>
					{/each}
				</div>
			{/if}
			{#if landscapeCandidates.length > 0}
				<div class="mt-5 grid gap-4 sm:grid-cols-2">
					{#each landscapeCandidates as candidate}
						<div class={`rounded-xl border p-2 ${selectedLandscapeCandidateId === candidate.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
							<label>
								<input
									type="radio"
									name={`landscape-selection-${mode}`}
									value={candidate.id}
									checked={selectedLandscapeCandidateId === candidate.id}
									on:change={() => (selectedLandscapeCandidateId = candidate.id)}
								/>
								<img class="mt-2 aspect-[3/2] w-full rounded object-cover" src={candidate.dataUrl} alt={candidate.id} />
							</label>
							<div class="mt-2 flex flex-wrap items-center gap-2">
								<button
									type="button"
									class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
									on:click={() => openPreview(candidate)}
									aria-label="Preview image"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path d="M10 4c-3.9 0-7.2 2.3-8.7 5.6a1 1 0 0 0 0 .8C2.8 13.7 6.1 16 10 16s7.2-2.3 8.7-5.6a1 1 0 0 0 0-.8C17.2 6.3 13.9 4 10 4Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z" />
									</svg>
									Preview
								</button>
								{#if candidate.minioKey && !candidate.minioBackupError}
									<a
										class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
										href={getBlobBrowserUrl(candidate.minioKey)}
										target="_blank"
										rel="noopener noreferrer"
									>
										Original in blob
									</a>
								{/if}
							</div>
							<p class="mt-2 break-all text-[11px] text-gray-600">{candidate.minioKey}</p>
							{#if candidate.minioBackupError}
								<p class="text-[11px] font-semibold text-rose-700">
									Backup failed: {candidate.minioBackupError}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

			<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
				<h2 class="text-xl font-semibold">Stage C: Portrait (1024x1536)</h2>
				<textarea bind:value={portraitPrompt} rows={3} class="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm"></textarea>
				<div class="mt-3">
					<div class="flex items-center justify-between gap-3">
						<label class="text-sm font-semibold text-gray-800" for={`portrait-count-${mode}`}>Number of images to batch</label>
						<span class="text-sm font-semibold text-gray-800">{portraitN}</span>
					</div>
					<input
						id={`portrait-count-${mode}`}
						type="range"
						min={minN}
						max={maxN}
						step="1"
						bind:value={portraitN}
						class="mt-2 w-full"
					/>
					<p class="mt-1 text-xs text-gray-500">Range: {minN}-{maxN}. Default: {defaultN}.</p>
				</div>
				<div class="mt-3 flex flex-wrap items-center gap-3">
					<button
						class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
						type="button"
					disabled={generatingStage !== null || !selectedSquareCandidateId}
					on:click={() => generateForStage('portrait')}
				>
					{generatingStage === 'portrait' ? 'Generating...' : portraitCandidates.length ? 'Generate More' : 'Generate'}
				</button>
			</div>
			{#if stageNotices.portrait}
				<p class={`mt-2 text-sm ${stageNotices.portrait.startsWith('Failed:') ? 'font-semibold text-rose-700' : 'text-gray-700'}`}>
					{stageNotices.portrait}
				</p>
			{/if}
			<details class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<summary class="cursor-pointer text-sm font-semibold text-gray-700">OpenAI JSON payload (optional)</summary>
				{#if portraitPayloadPreview}
					<button class="mt-2 rounded border border-gray-300 px-2 py-1 text-xs" type="button" on:click={() => copyPayload(portraitPayloadPreview)}>Copy JSON</button>
					<pre class="mt-2 overflow-auto rounded bg-white p-3 text-xs">{portraitPayloadPreview}</pre>
				{:else}
					<p class="mt-2 text-xs text-gray-500">No payload yet. Generate images first.</p>
				{/if}
			</details>

			{#if generatingStage === 'portrait'}
				<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each buildPlaceholderKeys('portrait', getPendingCount('portrait')) as placeholderKey (placeholderKey)}
						<div class="animate-pulse rounded-xl border border-blue-100 bg-blue-50 p-2">
							<div class="aspect-[2/3] w-full rounded bg-blue-100"></div>
							<div class="mt-2 h-3 w-2/3 rounded bg-blue-100"></div>
						</div>
					{/each}
				</div>
			{/if}
			{#if portraitCandidates.length > 0}
				<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each portraitCandidates as candidate}
						<div class={`rounded-xl border p-2 ${selectedPortraitCandidateId === candidate.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
							<label>
								<input
									type="radio"
									name={`portrait-selection-${mode}`}
									value={candidate.id}
									checked={selectedPortraitCandidateId === candidate.id}
									on:change={() => (selectedPortraitCandidateId = candidate.id)}
								/>
								<img class="mt-2 aspect-[2/3] w-full rounded object-cover" src={candidate.dataUrl} alt={candidate.id} />
							</label>
							<div class="mt-2 flex flex-wrap items-center gap-2">
								<button
									type="button"
									class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
									on:click={() => openPreview(candidate)}
									aria-label="Preview image"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path d="M10 4c-3.9 0-7.2 2.3-8.7 5.6a1 1 0 0 0 0 .8C2.8 13.7 6.1 16 10 16s7.2-2.3 8.7-5.6a1 1 0 0 0 0-.8C17.2 6.3 13.9 4 10 4Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z" />
									</svg>
									Preview
								</button>
								{#if candidate.minioKey && !candidate.minioBackupError}
									<a
										class="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
										href={getBlobBrowserUrl(candidate.minioKey)}
										target="_blank"
										rel="noopener noreferrer"
									>
										Original in blob
									</a>
								{/if}
							</div>
							<p class="mt-2 break-all text-[11px] text-gray-600">{candidate.minioKey}</p>
							{#if candidate.minioBackupError}
								<p class="text-[11px] font-semibold text-rose-700">
									Backup failed: {candidate.minioBackupError}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Final Save</h2>
			<p class="mt-2 text-sm text-gray-600">
				Save selected square, landscape, and portrait files to
				<code>/web/static/images/generated/&lt;slug-or-path&gt;/</code>.
			</p>
			<button
				class="mt-4 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
				type="button"
				disabled={saving || !selectedSquareCandidateId || !selectedLandscapeCandidateId || !selectedPortraitCandidateId}
				on:click={saveSelected}
			>
				{saving ? 'Saving...' : 'Save Selected Images'}
			</button>
			{#if saveMessage}
				<p class="mt-3 text-sm font-semibold text-emerald-700">{saveMessage}</p>
			{/if}
			{#if saveWrites.length > 0}
				<ul class="mt-3 space-y-2 text-sm text-gray-700">
					{#each saveWrites as write}
						<li class="rounded-lg border border-gray-200 bg-gray-50 p-2">
							<p><strong>{toStageLabel(write.variant)}</strong> → {write.publicUrl}</p>
							<p class="text-xs text-gray-500">{write.absolutePath}</p>
							{#if write.version > 1}
								<p class="text-xs font-semibold text-amber-700">Versioned as v{write.version}</p>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			<div class="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-3">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<h3 class="text-sm font-semibold text-gray-800">Prompt History Chips</h3>
					<button
						type="button"
						class="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
						on:click={loadPromptHistory}
					>
						Refresh
					</button>
				</div>
				<p class="mt-1 text-xs text-gray-600">
					Each saved run stores prompts for square, landscape, and portrait, keyed by final <code>slug/filename</code>.
				</p>
				<input
					type="text"
					class="mt-3 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs"
					placeholder="Filter by slug or filename..."
					bind:value={promptHistorySearch}
				/>
				{#if filteredPromptHistory.length === 0}
					<p class="mt-3 text-xs text-gray-500">No saved prompt chips yet.</p>
				{:else}
					<div class="mt-3 max-h-72 space-y-2 overflow-auto">
						{#each filteredPromptHistory as entry (entry.id)}
							<div class="rounded-lg border border-gray-200 bg-white p-2">
								<div class="flex flex-wrap items-center justify-between gap-2">
									<p class="text-xs font-semibold text-gray-800">{entry.slug}</p>
									<div class="flex items-center gap-2">
										<p class="text-[11px] text-gray-500">{formatHistoryDate(entry.createdAt)}</p>
										<button
											type="button"
											class="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
											on:click={() => applyHistoryPrompts(entry)}
										>
											Use all prompts
										</button>
									</div>
								</div>
								<div class="mt-2 flex flex-wrap gap-2">
									<button
										type="button"
										class="rounded-full border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
										on:click={() => applyHistoryPromptForStage(entry, 'square')}
										title="Use square prompt"
									>
										Square: {getHistoryChipLabel(entry, 'square')}
									</button>
									<button
										type="button"
										class="rounded-full border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
										on:click={() => applyHistoryPromptForStage(entry, 'landscape')}
										title="Use landscape prompt"
									>
										Landscape: {getHistoryChipLabel(entry, 'landscape')}
									</button>
									<button
										type="button"
										class="rounded-full border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
										on:click={() => applyHistoryPromptForStage(entry, 'portrait')}
										title="Use portrait prompt"
									>
										Portrait: {getHistoryChipLabel(entry, 'portrait')}
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</section>

	{#if previewCandidate}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			role="presentation"
			on:click={(event) => {
				if (event.target === event.currentTarget) closePreview();
			}}
		>
			<div
				class="w-full max-w-6xl rounded-xl bg-white p-3 shadow-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Image preview"
				tabindex="-1"
			>
				<div class="mb-3 flex items-center justify-between gap-2">
					<p class="truncate text-sm font-semibold text-gray-800">{previewCandidate.minioKey}</p>
					<button
						type="button"
						class="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400"
						on:click={closePreview}
					>
						Close
					</button>
				</div>
				<img
					class="max-h-[80vh] w-full rounded object-contain"
					src={previewCandidate.dataUrl}
					alt={previewCandidate.id}
				/>
			</div>
		</div>
	{/if}
{/if}
