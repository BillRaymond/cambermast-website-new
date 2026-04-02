<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AdminRouteChips from '$lib/components/admin/AdminRouteChips.svelte';
</script>

<SeoHead
	title="Image Gen SOP (Dev) | Admin | Cambermast"
	description="Internal SOP for the dev-only image generation mini app."
	path="/admin/sop-image-gen"
/>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex flex-col">
	<h1 class="mb-6 text-3xl font-bold">Image Gen SOP (Dev)</h1>
	<AdminRouteChips />
	<p class="max-w-3xl text-gray-700">
		Operating procedure for the dev-only admin mini app that generates image candidates with OpenAI
		and uploads all generated results to MinIO via C3.
	</p>
</header>

<section class="mt-10 space-y-8">
	<div>
		<h2 class="text-2xl font-semibold">Scope and Route</h2>
		<p class="mt-2 max-w-3xl text-gray-700">
			Primary route: <code class="rounded bg-gray-100 px-1 py-0.5 text-xs">/admin/image-gen</code>.
			The UI and API routes are development-only. In non-dev environments, endpoints return 404 and
			the page shows an unavailable message.
		</p>
	</div>

	<div>
		<h2 class="text-2xl font-semibold">Environment Variables</h2>
		<ul class="mt-3 list-disc space-y-2 pl-5 text-gray-700">
			<li><code>OPENAI_API_KEY</code> (required)</li>
			<li><code>C3_API_KEY</code> (required)</li>
			<li>
				<code>C3_API_BASE</code> (optional, defaults to
				<code>https://django-on-hstgr-11.tail8a5127.ts.net/api/c3</code>)
			</li>
		</ul>
		<p class="mt-2 max-w-3xl text-sm text-gray-600">
			Secrets are read only on the server and are never exposed to browser JavaScript.
		</p>
	</div>

	<div>
		<h2 class="text-2xl font-semibold">Template Sources</h2>
		<ul class="mt-3 list-disc space-y-2 pl-5 text-gray-700">
			<li>
				Default template path:
				<code>web/static/images/admin/image-gen/templates/01-template-1x1-square.jpg</code>
			</li>
			<li>Folder-based template previews from the same template directory</li>
			<li>
				Training program references from
				<code>heroImage</code>
				and
				<code>ogImage</code>
				via
				<code>GET /admin/image-gen/api/training-references</code>
			</li>
			<li>Ad hoc local template upload from the browser</li>
		</ul>
	</div>

	<div>
		<h2 class="text-2xl font-semibold">OpenAI Contract</h2>
		<p class="mt-2 max-w-3xl text-gray-700">
			Model is fixed to <code>gpt-image-1.5</code>. Batch generation uses <code>n</code> with range
			1 to 10 (default 4).
		</p>
		<p class="mt-2 max-w-3xl text-gray-700">
			The outbound OpenAI JSON payload is intentionally minimal and only includes:
			<code>model</code>, <code>prompt</code>, <code>size</code>, <code>n</code>, and
			<code>images</code>.
		</p>
	</div>

	<div>
		<h2 class="text-2xl font-semibold">Stage Defaults</h2>
		<ul class="mt-3 list-disc space-y-2 pl-5 text-gray-700">
			<li>Square: <code>1024x1024</code></li>
			<li>Landscape: <code>1536x1024</code></li>
			<li>Portrait: <code>1024x1536</code></li>
		</ul>
	</div>

	<div>
		<h2 class="text-2xl font-semibold">MinIO Backup Contract</h2>
		<p class="mt-2 max-w-3xl text-gray-700">
			Every generated image candidate is uploaded immediately using
			<code>POST {`{C3_API_BASE}`}/upload</code> multipart form-data and
			<code>X-C3-API-Key</code> authentication.
		</p>
		<p class="mt-2 max-w-3xl text-gray-700">
			Key pattern:
			<code>cambermastweb/generated/{"<destination-path-or-unspecified>"}/{"<stage>"}/{"<run-id>"}/candidate-{"<index>"}.png</code>
		</p>
		<p class="mt-2 max-w-3xl text-gray-700">
			Prompt artifact key pattern:
			<code>cambermastweb/generated/{"<destination-path-or-unspecified>"}/{"<stage>"}/{"<run-id>"}/prompt.json</code>
		</p>
		<p class="mt-2 max-w-3xl text-gray-700">
			Each <code>prompt.json</code> stores <code>runId</code>, <code>stage</code>,
			<code>destinationType</code>, <code>destinationSlug</code>,
			<code>customBasePath</code>, <code>destinationPath</code>, <code>size</code>,
			<code>n</code>, <code>prompt</code>, and <code>createdAt</code>.
		</p>
		<p class="mt-2 max-w-3xl text-gray-700">
			The UI requires a destination type up front: <code>events</code>, <code>training</code>,
			<code>resources</code>, <code>featured-images</code>, or <code>custom</code>. Embedded
			event creation preselects <code>training</code> or <code>events</code> automatically.
		</p>
		<p class="mt-2 max-w-3xl text-gray-700">
			Each candidate card shows the full MinIO browser URL as visible, copyable text and links it
			in a new tab:
			<code>https://minio-on-hstgr.tail8a5127.ts.net/browser/blobs/{"<key>"}</code>.
		</p>
	</div>

	<div>
		<h2 class="text-2xl font-semibold">Final Save Contract</h2>
		<p class="mt-2 max-w-3xl text-gray-700">
			After selecting one square, one landscape, and one portrait candidate, the mini app saves
			files into <code>web/static/images/{"<type>"}/{"<slug>"}/</code> or the explicit
			custom path under <code>web/static/images/</code>.
		</p>
		<ul class="mt-3 list-disc space-y-2 pl-5 text-gray-700">
			<li><code>hero-square.jpg</code></li>
			<li><code>hero-square.png</code></li>
			<li><code>hero-landscape.jpg</code></li>
			<li><code>hero-landscape.png</code></li>
			<li><code>hero-portrait.jpg</code></li>
			<li><code>hero-portrait.png</code></li>
			<li><code>selected-minio-locations.txt</code></li>
			<li><code>stage-prompts.txt</code></li>
		</ul>
		<p class="mt-2 max-w-3xl text-gray-700">
			JPG files remain the live site assets for faster loading. Matching PNG files are
			saved alongside them with the same version number for future prompt/template reuse. If a filename already exists, the tool
			versions with <code>-v2</code>, <code>-v3</code>, etc. for both image files and metadata artifacts.
		</p>
		<p class="mt-2 max-w-3xl text-gray-700">
			In standalone mode, saves for <code>events</code>, <code>resources</code>, and
			<code>training</code> also update the matching registry record to use the saved landscape JPG
			as the featured/live image. Embedded event creation does not auto-write registries.
		</p>
		<p class="mt-2 max-w-3xl text-gray-700">
			Never delete prior square, landscape, portrait, or metadata files unless explicitly requested.
		</p>
	</div>

	<div>
		<h2 class="text-2xl font-semibold">Prompt Standards Registry Contract</h2>
		<p class="mt-2 max-w-3xl text-gray-700">
			Prompt standards are site-owned and stored in
			<code>web/src/lib/data/image-gen-standards.json</code> with schema
			<code>web/src/lib/data/image-gen-standards.schema.json</code>.
		</p>
		<p class="mt-2 max-w-3xl text-gray-700">
			Public read-only API endpoint:
			<code>/api/image-gen-standards.json</code>. API response schema:
			<code>web/src/lib/data/api/schemas/image-gen-standards-api.schema.json</code>.
		</p>
	</div>

	<div>
		<h2 class="text-2xl font-semibold">Server Endpoints</h2>
		<ul class="mt-3 list-disc space-y-2 pl-5 text-gray-700">
			<li>
				<code>GET /admin/image-gen/api/templates</code> lists template images from the template
				folder.
			</li>
			<li>
				<code>POST /admin/image-gen/api/generate</code> runs OpenAI image generation and uploads all
				candidates to MinIO, plus one <code>prompt.json</code> artifact per stage run.
			</li>
			<li>
				<code>GET /admin/image-gen/api/training-references</code> lists deduplicated training
				<code>heroImage</code> and <code>ogImage</code> URLs for template reference selection.
			</li>
			<li>
				<code>POST /admin/image-gen/api/save-selected</code> saves chosen variants into static site
				image folders and appends prompt standards into the image-gen standards registry.
			</li>
			<li>
				<code>GET /api/image-gen-standards.json</code> publishes read-only prompt standards for
				automation and admin tooling.
			</li>
		</ul>
	</div>
</section>
