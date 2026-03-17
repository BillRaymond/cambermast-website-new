<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const pageMeta = {
		title: 'Redirect Registry (Dev) | Cambermast',
		description: 'Dev-only legacy URL registry editor for aliases and machine-readable compatibility paths.'
	};

	const statusCodeHelp: Record<number, string> = {
		301: 'Permanent, may change POST to GET',
		302: 'Temporary, may change POST to GET',
		307: 'Temporary, preserve method',
		308: 'Permanent, preserve method'
	};

	const impactTagHelp: Record<string, string> = {
		api: 'Touches a public JSON endpoint.',
		calendar: 'Touches the calendar alias or canonical events route.',
		feed: 'Touches an RSS or XML feed path.',
		nav: 'Touches a link used in the visible primary navigation.',
		'public-route': 'Touches a public-facing page route.',
		training: 'Touches the training catalog or training aliases.'
	};

	const emptyValues = {
		sourcePath: '',
		targetPath: '',
		statusCode: '308',
		enabled: true,
		notes: '',
		category: 'history',
		allowRestrictedTarget: false
	};

	const formValues =
		(form as { values?: Partial<typeof emptyValues> } | undefined)?.values ?? {};

	const createValues = {
		...emptyValues,
		...formValues
	};
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/admin/redirects"
	useDefaultImage={false}
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Redirect Registry (Dev)</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		Manage legacy URLs and machine-readable compatibility aliases from the schema-backed redirect
		registry. This page writes <code>web/src/lib/data/redirects/redirects.json</code> and is
		intended for development use.
	</p>
</header>

{#if form?.message}
	<div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
		{form.message}
	</div>
{/if}

{#if !data.isDev}
	<div class="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
		Editing is disabled outside development mode. This page remains available as a registry audit
		view.
	</div>
{/if}

<section class="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
	<div class="rounded-2xl border bg-white p-4 shadow-sm">
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Total</p>
		<p class="mt-2 text-2xl font-bold text-gray-900">{data.counts.total}</p>
	</div>
	<div class="rounded-2xl border bg-white p-4 shadow-sm">
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Enabled</p>
		<p class="mt-2 text-2xl font-bold text-gray-900">{data.counts.enabled}</p>
	</div>
	<div class="rounded-2xl border bg-white p-4 shadow-sm">
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Disabled</p>
		<p class="mt-2 text-2xl font-bold text-gray-900">{data.counts.disabled}</p>
	</div>
	<div class="rounded-2xl border bg-white p-4 shadow-sm">
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Feed Impact</p>
		<p class="mt-2 text-2xl font-bold text-gray-900">{data.counts.feed}</p>
	</div>
	<div class="rounded-2xl border bg-white p-4 shadow-sm">
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">API Impact</p>
		<p class="mt-2 text-2xl font-bold text-gray-900">{data.counts.api}</p>
	</div>
	<div class="rounded-2xl border bg-white p-4 shadow-sm">
		<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Nav Aliases</p>
		<p class="mt-2 text-2xl font-bold text-gray-900">{data.counts.nav}</p>
	</div>
</section>

<section class="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold">Add redirect</h2>
	<p class="mt-2 max-w-3xl text-sm text-gray-700">
		Use internal paths only. Queries, fragments, self-redirects, duplicate sources, and redirect
		loops are blocked.
	</p>

	<form method="POST" action="?/create" class="mt-5 grid gap-4 md:grid-cols-2">
		<label class="text-sm font-medium text-gray-800">
			Source path
			<input
				class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
				name="sourcePath"
				required
				placeholder="/old-path"
				value={String(createValues.sourcePath ?? '')}
				disabled={!data.isDev}
			/>
		</label>
		<label class="text-sm font-medium text-gray-800">
			Target path
			<input
				class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
				name="targetPath"
				required
				placeholder="/new-path"
				value={String(createValues.targetPath ?? '')}
				disabled={!data.isDev}
			/>
		</label>
		<label class="text-sm font-medium text-gray-800">
			Status code
			<select
				class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
				name="statusCode"
				disabled={!data.isDev}
			>
				{#each data.statusCodeOptions as statusCode}
					<option value={statusCode} selected={String(statusCode) === String(createValues.statusCode)}>
						{statusCode} - {statusCodeHelp[statusCode]}
					</option>
				{/each}
			</select>
			<span class="mt-1 block text-xs font-normal text-gray-500">
				Use `308` for most permanent internal aliases. Use `307` when a temporary redirect must
				preserve the original request method.
			</span>
		</label>
		<label class="text-sm font-medium text-gray-800">
			Category
			<select
				class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
				name="category"
				disabled={!data.isDev}
			>
				<option value="">Unspecified</option>
				{#each data.categoryOptions as category}
					<option value={category} selected={category === createValues.category}>{category}</option>
				{/each}
			</select>
		</label>
		<label class="md:col-span-2 text-sm font-medium text-gray-800">
			Notes
			<textarea
				class="mt-1 min-h-24 w-full rounded-xl border border-gray-300 px-3 py-2"
				name="notes"
				placeholder="Why this alias exists and what it protects."
				disabled={!data.isDev}
			>{String(createValues.notes ?? '')}</textarea>
		</label>
		<div class="flex flex-wrap items-center gap-4 md:col-span-2">
			<label class="inline-flex items-center gap-2 text-sm text-gray-700">
				<input
					type="checkbox"
					name="enabled"
					checked={Boolean(createValues.enabled)}
					disabled={!data.isDev}
				/>
				Enabled
			</label>
			<label class="inline-flex items-center gap-2 text-sm text-gray-700">
				<input
					type="checkbox"
					name="allowRestrictedTarget"
					checked={Boolean(createValues.allowRestrictedTarget)}
					disabled={!data.isDev}
				/>
				Allow redirect into restricted internal routes
				<span
					class="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold text-gray-500"
					title="Required only when the target intentionally points into /admin, /internal, or /forms."
					aria-label="Required only when the target intentionally points into /admin, /internal, or /forms."
				>
					i
				</span>
			</label>
			<button
				class="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
				type="submit"
				disabled={!data.isDev}
			>
				Create redirect
			</button>
		</div>
	</form>
</section>

<section class="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
	<div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
		<div>
			<h2 class="text-xl font-semibold">Current redirects</h2>
			<p class="mt-2 max-w-3xl text-sm text-gray-700">
				Each row edits the live registry entry. Impact tags flag redirects touching feeds, APIs,
				calendar navigation, or other public routes.
			</p>
			<p class="mt-2 max-w-3xl text-sm text-gray-600">
				Disabled redirects are kept for audit history and displayed after enabled entries. Hard
				delete is intentionally not available in this UI.
			</p>
			<div class="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
				{#each Object.entries(impactTagHelp) as [tag, description]}
					<span class="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1">
						<span class="font-semibold text-amber-900">{tag}</span>: {description}
					</span>
				{/each}
			</div>
		</div>
		<a class="text-sm font-semibold text-blue-700 underline" href="/api/redirects.json" rel="external">
			View read-only API
		</a>
	</div>

	<div class="mt-6 space-y-4">
		{#each data.redirects as entry}
			<article class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
				<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
					<div>
						<p class="text-sm font-semibold text-gray-900">{entry.sourcePath}</p>
						<p class="mt-1 text-sm text-gray-600">{entry.targetPath}</p>
					</div>
					<div class="flex flex-wrap gap-2">
						<span
							class={`rounded-full px-2.5 py-1 text-xs font-semibold ${
								entry.enabled
									? 'bg-emerald-100 text-emerald-800'
									: 'bg-gray-200 text-gray-700'
							}`}
						>
							{entry.enabled ? 'Enabled' : 'Disabled'}
						</span>
						<span class="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
							{entry.statusCode}
						</span>
						{#if entry.category}
							<span class="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">
								{entry.category}
							</span>
						{/if}
						{#each entry.impactTags as tag}
							<span
								class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900"
								title={impactTagHelp[tag]}
							>
								{tag}
							</span>
						{/each}
					</div>
				</div>

				<form method="POST" action="?/update" class="mt-4 grid gap-4 md:grid-cols-2">
					<input type="hidden" name="originalSourcePath" value={entry.sourcePath} />
					<label class="text-sm font-medium text-gray-800">
						Source path
						<input
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
							name="sourcePath"
							value={entry.sourcePath}
							required
							disabled={!data.isDev}
						/>
					</label>
					<label class="text-sm font-medium text-gray-800">
						Target path
						<input
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
							name="targetPath"
							value={entry.targetPath}
							required
							disabled={!data.isDev}
						/>
					</label>
					<label class="text-sm font-medium text-gray-800">
						Status code
						<select
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
							name="statusCode"
							disabled={!data.isDev}
						>
							{#each data.statusCodeOptions as statusCode}
								<option value={statusCode} selected={statusCode === entry.statusCode}>
									{statusCode} - {statusCodeHelp[statusCode]}
								</option>
							{/each}
						</select>
						<span class="mt-1 block text-xs font-normal text-gray-500">
							Current behavior: {statusCodeHelp[entry.statusCode]}
						</span>
					</label>
					<label class="text-sm font-medium text-gray-800">
						Category
						<select
							class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
							name="category"
							disabled={!data.isDev}
						>
							<option value="" selected={!entry.category}>Unspecified</option>
							{#each data.categoryOptions as category}
								<option value={category} selected={category === entry.category}>{category}</option>
							{/each}
						</select>
					</label>
					<label class="md:col-span-2 text-sm font-medium text-gray-800">
						Notes
						<textarea
							class="mt-1 min-h-20 w-full rounded-xl border border-gray-300 px-3 py-2"
							name="notes"
							disabled={!data.isDev}
						>{entry.notes ?? ''}</textarea>
					</label>
					<div class="flex flex-wrap items-center gap-4 md:col-span-2">
						<label class="inline-flex items-center gap-2 text-sm text-gray-700">
							<input type="checkbox" name="enabled" checked={entry.enabled} disabled={!data.isDev} />
							Enabled
						</label>
						<label class="inline-flex items-center gap-2 text-sm text-gray-700">
							<input
								type="checkbox"
								name="allowRestrictedTarget"
								checked={Boolean(entry.allowRestrictedTarget)}
								disabled={!data.isDev}
							/>
							Allow restricted target
							<span
								class="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold text-gray-500"
								title="Use only if this redirect must land in /admin, /internal, or /forms."
								aria-label="Use only if this redirect must land in /admin, /internal, or /forms."
							>
								i
							</span>
						</label>
						<button
							class="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
							type="submit"
							disabled={!data.isDev}
						>
							Save changes
						</button>
					</div>
				</form>
			</article>
		{/each}
	</div>
</section>
