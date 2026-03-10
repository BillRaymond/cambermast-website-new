<script lang="ts">
	import ResourceHeader from '$lib/components/resources/ResourceHeader.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/resources/ai-assisted-coding-workshop-setup');
	const heroImage = '/images/generated/resources/ai-assisted-coding-workshop-setup/hero-landscape.jpg';
	const heroImageAlt = 'AI-assisted coding workshop setup guide hero image.';

	const setupSteps = [
		{
			id: 'vscode',
			name: 'Visual Studio Code (free)',
			why: 'We will use VS Code as the main editing environment during the workshop.',
			linkLabel: 'Download Visual Studio Code',
			linkHref: 'https://code.visualstudio.com/'
		},
		{
			id: 'vscode-extension',
			name: 'Codex or Claude VS Code extension (free)',
			why: 'Install one AI coding extension in VS Code so you can work inside the editor during the workshop.',
			linkLabel: 'Open VS Code Extensions Marketplace',
			linkHref: 'https://code.visualstudio.com/docs/configure/extensions/extension-marketplace'
		},
		{
			id: 'git',
			name: 'Git (free)',
			why: 'Git is required for local version control before we connect your work to GitHub.',
			linkLabel: 'Download Git',
			linkHref: 'https://git-scm.com/downloads'
		},
		{
			id: 'github',
			name: 'GitHub (free account)',
			why: 'You need a GitHub account so you can push code, collaborate, and keep your app backed up.',
			linkLabel: 'Create a GitHub account',
			linkHref: 'https://docs.github.com/get-started/start-your-journey/creating-an-account-on-github'
		},
		{
			id: 'docker',
			name: 'Docker Desktop (free account required)',
			why: 'We will use Docker to create a consistent development environment for your web app.',
			linkLabel: 'Install Docker Desktop',
			linkHref: 'https://docs.docker.com/desktop/setup/install/'
		},
		{
			id: 'ai-account',
			name: 'Claude or ChatGPT (paid)',
			why: 'You need a paid Claude or OpenAI account available during the live sessions.',
			linkLabel: 'Open Claude',
			linkHref: 'https://claude.ai/'
		}
	];
</script>

<ResourceHeader
	title={pageMeta.title.replace(' | Cambermast', '')}
	description="Install Visual Studio Code, a Codex or Claude VS Code extension, Git, GitHub, Docker Desktop, and make sure your paid Claude or ChatGPT account is ready before the AI-Assisted Coding Workshop."
	path="/resources/ai-assisted-coding-workshop-setup"
	imageSrc={heroImage}
	imageAlt={heroImageAlt}
	label="Workshop setup"
/>

<section class="mx-auto mb-12 max-w-3xl space-y-6">
	<div class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">What you need</h2>
		<p class="text-gray-700">
			Install everything on the laptop you plan to use during the workshop. No custom scripts are
			required for setup. You only need the standard product installs and active accounts listed
			here.
		</p>
		<ul class="list-disc space-y-2 pl-5 text-gray-700">
			<li>Visual Studio Code (free)</li>
			<li>Codex or Claude VS Code extension (free)</li>
			<li>Git (free)</li>
			<li>GitHub account (free)</li>
			<li>Docker account and Docker Desktop app (free account required)</li>
			<li>Claude or ChatGPT account ready in your browser (paid)</li>
		</ul>
	</div>

	<div class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">Recommended order</h2>
		<ol class="list-decimal space-y-2 pl-5 text-gray-700">
			<li>Install Visual Studio Code.</li>
			<li>Install a Codex or Claude extension in VS Code.</li>
			<li>Install Git.</li>
			<li>Create or confirm your GitHub account.</li>
			<li>Create your Docker account and install Docker Desktop.</li>
			<li>Confirm your paid Claude or ChatGPT login works in the browser.</li>
		</ol>
	</div>
</section>

<section class="mx-auto mb-12 max-w-3xl space-y-6">
	{#each setupSteps as step, index}
		<div id={step.id} class="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
			<div class="mb-3 flex items-center gap-3">
				<span
					class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700"
				>
					{index + 1}
				</span>
				<h2 class="text-xl font-semibold text-gray-900">{step.name}</h2>
			</div>
			<p class="text-gray-700">{step.why}</p>
			<p class="mt-3">
				<a
					href={step.linkHref}
					class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
					target="_blank"
					rel="noopener noreferrer"
				>
					{step.linkLabel}
				</a>
			</p>
			{#if step.id === 'vscode'}
				<p class="mt-3 text-sm text-gray-600">
					Install the stable release and open it once so the app can finish first-run setup.
				</p>
			{:else if step.id === 'vscode-extension'}
				<div class="mt-3 space-y-2 text-sm text-gray-600">
					<p>
						In VS Code, the Extensions tab is the area where you browse and install add-ons for the editor.
						Look for the square icon on the left sidebar, or open it from the View menu.
					</p>
					<p>Open the Extensions tab and install either the Codex extension or the Claude extension.</p>
					<p>
						After installation, sign in to the extension and make sure it appears in VS Code as
						ready to use before the workshop starts.
					</p>
				</div>
			{:else if step.id === 'git'}
				<div class="mt-3 space-y-2 text-sm text-gray-600">
					<p>
						On Mac, open the Terminal app from Applications, Utilities, or use Spotlight search
						and type <code>Terminal</code>.
					</p>
					<p>
						On Windows, open Windows Terminal or PowerShell from the Start menu.
					</p>
					<p>Then run this command:</p>
					<pre
						class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"
					><code>git --version</code></pre>
					<p>
						You should see a result that starts with something like <code>git version</code>,
						followed by a version number.
					</p>
				</div>
			{:else if step.id === 'github'}
				<div class="mt-3 space-y-2 text-sm text-gray-600">
					<p>
						Use an account you can access during the workshop without company approval delays or
						multi-device login issues.
					</p>
					<p>
						Enable two-factor authentication and make sure you can sign back in after fully
						closing your browser. Please test that before the workshop starts.
					</p>
				</div>
			{:else if step.id === 'docker'}
				<div class="mt-3 space-y-2 text-sm text-gray-600">
					<p>
						Create your Docker account first, then download Docker Desktop, install it, and sign
						in to the app with that account.
					</p>
					<p>
						After installation, launch Docker Desktop and wait until it reports that Docker is
						running.
					</p>
				</div>
			{:else if step.id === 'ai-account'}
				<div class="mt-3 space-y-2 text-sm text-gray-600">
					<p>
						You do not need to install a desktop app for Claude or OpenAI. Just make sure your paid account works in the browser before the workshop starts.
					</p>
					<p>
						Claude:
						<a
							href="https://claude.ai/"
							class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
							target="_blank"
							rel="noopener noreferrer"
						>
							claude.ai
						</a>
					</p>
					<p>
						OpenAI:
						<a
							href="https://chatgpt.com/"
							class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
							target="_blank"
							rel="noopener noreferrer"
						>
							chatgpt.com
						</a>
					</p>
				</div>
			{/if}
		</div>
	{/each}
</section>

<section class="mx-auto mb-16 max-w-3xl space-y-6">
	<div class="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
		<h2 class="text-xl font-semibold text-emerald-900">Checklist before Week 1</h2>
		<ul class="mt-3 list-none space-y-2 pl-0 text-emerald-900">
			<li>✓ VS Code opens normally.</li>
			<li>✓ Your Codex or Claude extension is installed in VS Code and signed in.</li>
			<li>✓ You know how to open Terminal on Mac or Terminal/PowerShell on Windows.</li>
			<li>✓ <code>git --version</code> works in your terminal.</li>
			<li>✓ You can sign in to GitHub with two-factor authentication enabled.</li>
			<li>✓ You can close your browser, reopen it, and sign back in to GitHub successfully.</li>
			<li>✓ Docker Desktop starts successfully and you can sign in to the app.</li>
			<li>✓ You can sign in to Claude or OpenAI with your paid account.</li>
		</ul>
	</div>

	<p class="text-gray-700">
		All setup should be completed before the workshop starts. If you get stuck, use the
		<a class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900" href="/contact">contact page</a>
		so Bill or a Cambermast team member can set up a meeting with you ahead of time and help you get
		unblocked before Week 1.
	</p>
</section>
