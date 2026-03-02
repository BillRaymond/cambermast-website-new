<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	type ImageGenStage = 'square' | 'landscape' | 'portrait';
	type Mode = 'embedded' | 'standalone';

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

	type WriteResult = {
		variant: string;
		absolutePath: string;
		publicUrl: string;
		version: number;
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
	let selectedTemplateUrl = defaultTemplateUrl;
	let templateImageDataUrl = '';
	let uploadedTemplateName = '';
	let templatesLoading = false;

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
	let stageNotices: Record<ImageGenStage, string> = {
		square: '',
		landscape: '',
		portrait: ''
	};
	let saving = false;
	let errorMessage = '';
	let saveMessage = '';
	let saveWrites: WriteResult[] = [];

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
	};

	const loadTemplates = async () => {
		templatesLoading = true;
		try {
			const response = await fetch('/admin/image-gen/api/templates');
			const json = await response.json();
			if (!response.ok) throw new Error(json?.error ?? 'Unable to load templates');
			templates = Array.isArray(json.templates) ? json.templates : [];
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

	const toStageLabel = (stage: ImageGenStage): string =>
		stage === 'square' ? 'Square' : stage === 'landscape' ? 'Landscape' : 'Portrait';

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
	const MIN_GENERATE_SPINNER_MS = 900;

	const generateForStage = async (stage: ImageGenStage) => {
		errorMessage = '';
		saveMessage = '';
		stageNotices = { ...stageNotices, [stage]: '' };
		const templateForStage =
			stage === 'square' ? templateImageDataUrl : (getSelectedSquareCandidate()?.dataUrl ?? '');
		if (!templateForStage) {
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
					slug: slug || undefined
				})
			});
			const json = await response.json();
			if (!response.ok) {
				throw new Error(json?.error ?? 'Generation failed');
			}

			const nextCandidates = Array.isArray(json.candidates) ? (json.candidates as Candidate[]) : [];
			if (stage === 'square') {
				squareCandidates = [...squareCandidates, ...nextCandidates];
				squarePayloadPreview = JSON.stringify(json.payloadPreview, null, 2);
			}
			if (stage === 'landscape') {
				landscapeCandidates = [...landscapeCandidates, ...nextCandidates];
				landscapePayloadPreview = JSON.stringify(json.payloadPreview, null, 2);
			}
			if (stage === 'portrait') {
				portraitCandidates = [...portraitCandidates, ...nextCandidates];
				portraitPayloadPreview = JSON.stringify(json.payloadPreview, null, 2);
			}
			stageNotices = {
				...stageNotices,
				[stage]: `Generated ${nextCandidates.length.toString()} candidate${nextCandidates.length === 1 ? '' : 's'}.`
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

			saveWrites = Array.isArray(json.writes) ? json.writes : [];
			saveMessage = `Saved selected images for slug "${json.slug}".`;

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
			await loadTemplates();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to load templates';
		}
	});
</script>

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
				<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each templates as template}
						<button
							class={`rounded-xl border p-2 text-left ${selectedTemplateUrl === template ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
							type="button"
							on:click={async () => {
								try {
									await setTemplateFromUrl(template);
								} catch (error) {
									errorMessage = error instanceof Error ? error.message : 'Unable to load template';
								}
							}}
						>
							<img class="aspect-square w-full rounded object-cover" src={template} alt={template} />
							<p class="mt-2 text-xs text-gray-700">{template.split('/').pop()}</p>
						</button>
					{/each}
				</div>
			{/if}

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
					}}
					class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
				/>
				{#if uploadedTemplateName}
					<p class="mt-2 text-xs text-gray-600">Using uploaded template: {uploadedTemplateName}</p>
				{/if}
			</div>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Run Settings</h2>
			<label class="mt-3 block text-sm font-semibold text-gray-800" for={`slug-${mode}`}>Program/Event slug</label>
			<input
				id={`slug-${mode}`}
				type="text"
				placeholder="example: ai-workshop-spring-2026"
				bind:value={slug}
				class="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
			/>
			<p class="mt-1 text-xs text-gray-500">
				Used for final save path and MinIO prefix. If empty, generation backups use <code>unspecified</code>.
			</p>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Stage A: Square (1024x1024)</h2>
			<textarea bind:value={squarePrompt} rows={4} class="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm"></textarea>
			<div class="mt-3 flex flex-wrap items-center gap-3">
				<label class="text-sm" for={`square-count-${mode}`}>n</label>
				<input id={`square-count-${mode}`} type="number" min={minN} max={maxN} bind:value={squareN} class="w-24 rounded border border-gray-300 px-2 py-1 text-sm" />
				<button
					class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
					type="button"
					disabled={generatingStage !== null || templatesLoading || !templateImageDataUrl}
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

			{#if squareCandidates.length > 0}
				<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each squareCandidates as candidate}
						<label class={`rounded-xl border p-2 ${selectedSquareCandidateId === candidate.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
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
							<p class="mt-2 text-[11px] text-gray-600">{candidate.minioKey}</p>
							{#if candidate.minioBackupError}
								<p class="text-[11px] font-semibold text-rose-700">
									Backup failed: {candidate.minioBackupError}
								</p>
							{/if}
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Stage B: Landscape (1536x1024)</h2>
			<textarea bind:value={landscapePrompt} rows={3} class="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm"></textarea>
			<div class="mt-3 flex flex-wrap items-center gap-3">
				<label class="text-sm" for={`landscape-count-${mode}`}>n</label>
				<input id={`landscape-count-${mode}`} type="number" min={minN} max={maxN} bind:value={landscapeN} class="w-24 rounded border border-gray-300 px-2 py-1 text-sm" />
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

			{#if landscapeCandidates.length > 0}
				<div class="mt-5 grid gap-4 sm:grid-cols-2">
					{#each landscapeCandidates as candidate}
						<label class={`rounded-xl border p-2 ${selectedLandscapeCandidateId === candidate.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
							<input
								type="radio"
								name={`landscape-selection-${mode}`}
								value={candidate.id}
								checked={selectedLandscapeCandidateId === candidate.id}
								on:change={() => (selectedLandscapeCandidateId = candidate.id)}
							/>
							<img class="mt-2 aspect-[3/2] w-full rounded object-cover" src={candidate.dataUrl} alt={candidate.id} />
							<p class="mt-2 text-[11px] text-gray-600">{candidate.minioKey}</p>
							{#if candidate.minioBackupError}
								<p class="text-[11px] font-semibold text-rose-700">
									Backup failed: {candidate.minioBackupError}
								</p>
							{/if}
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Stage C: Portrait (1024x1536)</h2>
			<textarea bind:value={portraitPrompt} rows={3} class="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm"></textarea>
			<div class="mt-3 flex flex-wrap items-center gap-3">
				<label class="text-sm" for={`portrait-count-${mode}`}>n</label>
				<input id={`portrait-count-${mode}`} type="number" min={minN} max={maxN} bind:value={portraitN} class="w-24 rounded border border-gray-300 px-2 py-1 text-sm" />
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

			{#if portraitCandidates.length > 0}
				<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each portraitCandidates as candidate}
						<label class={`rounded-xl border p-2 ${selectedPortraitCandidateId === candidate.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
							<input
								type="radio"
								name={`portrait-selection-${mode}`}
								value={candidate.id}
								checked={selectedPortraitCandidateId === candidate.id}
								on:change={() => (selectedPortraitCandidateId = candidate.id)}
							/>
							<img class="mt-2 aspect-[2/3] w-full rounded object-cover" src={candidate.dataUrl} alt={candidate.id} />
							<p class="mt-2 text-[11px] text-gray-600">{candidate.minioKey}</p>
							{#if candidate.minioBackupError}
								<p class="text-[11px] font-semibold text-rose-700">
									Backup failed: {candidate.minioBackupError}
								</p>
							{/if}
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold">Final Save</h2>
			<p class="mt-2 text-sm text-gray-600">
				Save selected square, landscape, and portrait files to
				<code>/web/static/images/generated/&lt;slug&gt;/</code>.
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
							<p><strong>{toStageLabel(write.variant as ImageGenStage)}</strong> → {write.publicUrl}</p>
							<p class="text-xs text-gray-500">{write.absolutePath}</p>
							{#if write.version > 1}
								<p class="text-xs font-semibold text-amber-700">Versioned as v{write.version}</p>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</section>
{/if}
