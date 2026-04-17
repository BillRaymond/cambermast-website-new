<script lang="ts">
	import ResourceHeader from '$lib/components/resources/ResourceHeader.svelte';
	import { getResource } from '$lib/data/resources';
	import { getSeo } from '$lib/seo';
	import { getImageAlt, getLandscapeImageUrl } from '$lib/data/image-contract';

	const pageMeta = getSeo('/resources/ai-workshop-code-and-automate-with-ai-setup');
	const resource = getResource('ai-workshop-code-and-automate-with-ai-setup');
	const heroImage =
		getLandscapeImageUrl(resource?.images) ??
		'/images/resources/ai-workshop-code-and-automate-with-ai-setup/hero-landscape-v2.jpg';
	const heroImageAlt =
		getImageAlt(resource?.images) ?? 'AI Workshop: Code and Automate with AI setup guide hero image.';
	const homebrewInstallCommand =
		'/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
	const brewInstallGitCommand = 'brew install git';
	const gitConfigCommands = [
		{
			id: 'git-config-name',
			label: 'Set Git username',
			command: 'git config --global user.name "John Doe"'
		},
		{
			id: 'git-config-email',
			label: 'Set Git email',
			command: 'git config --global user.email johndoe@example.com'
		},
		{
			id: 'git-config-branch',
			label: 'Set default branch',
			command: 'git config --global init.defaultBranch main'
		}
	];
	let copiedCommandId = '';
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const setupSteps = [
		{
			id: 'vscode',
			name: 'Visual Studio Code (free)',
			why: 'We will use VS Code as the main editing environment during the workshop.',
			linkLabel: 'Download Visual Studio Code',
			linkHref: 'https://code.visualstudio.com/'
		},
		{
			id: 'ai-account',
			name: 'ChatGPT Plus or Claude Pro',
			why: 'We recommend ChatGPT Plus or Claude Pro so you have reliable access during the live sessions.',
			linkLabel: '',
			linkHref: ''
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
			id: 'vscode-extension',
			name: 'Codex or Claude VS Code extension (free)',
			why: 'Install one AI coding extension in VS Code so you can work inside the editor during the workshop.',
			linkLabel: 'Open VS Code Extensions Marketplace',
			linkHref: 'https://code.visualstudio.com/docs/configure/extensions/extension-marketplace'
		}
	];

	const handleCopyCommand = async (id: string, value: string) => {
		if (typeof navigator === 'undefined' || !navigator.clipboard) return;

		try {
			await navigator.clipboard.writeText(value);
			copiedCommandId = id;

			if (copyTimer) {
				clearTimeout(copyTimer);
			}

			copyTimer = setTimeout(() => {
				copiedCommandId = '';
			}, 1600);
		} catch (error) {
			console.warn('Unable to copy command', error);
		}
	};
</script>

<ResourceHeader
	title={pageMeta.title.replace(' | Cambermast', '')}
	description="Install Visual Studio Code, a Codex or Claude VS Code extension, Git, GitHub, Docker Desktop, and make sure your ChatGPT Plus or Claude Pro account is ready before AI Workshop: Code and Automate with AI."
	path="/resources/ai-workshop-code-and-automate-with-ai-setup"
	imageSrc={heroImage}
	imageAlt={heroImageAlt}
	label="Workshop setup"
/>

<section class="mx-auto mb-12 max-w-3xl space-y-6">
	<div class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">What you need</h2>
		<p class="text-gray-700">
			Install everything on the laptop you plan to use during the workshop. No custom scripts are
			required for setup.
		</p>
		<div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
			<p class="text-gray-700">
				You need six things: Visual Studio Code, a working ChatGPT Plus or Claude Pro account in
				your browser, Git, a GitHub account, a Docker account with Docker Desktop installed, and
				one Codex or Claude extension in VS Code.
			</p>
			<p class="mt-3 text-sm text-gray-600">
				Use the
				<a
					href="#vscode"
					class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
				>
					setup instructions below
				</a>
				for the full step-by-step guide.
			</p>
		</div>
	</div>

	<div class="rounded-2xl border border-blue-200 bg-blue-50 p-4">
		<p class="text-sm text-blue-950">
			Prefer to start with a walkthrough? Watch the setup video on YouTube, then use this page
			as your reference as you go. This page may include more detail and follow-up notes than the
			video.
		</p>
		<div class="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
			<div class="aspect-video">
				<iframe
					class="h-full w-full"
					src="https://www.youtube.com/embed/hRuR8nDUfdo"
					title="AI Workshop setup video"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowfullscreen
				></iframe>
			</div>
		</div>
		<p class="mt-3">
			<a
				href="https://youtu.be/hRuR8nDUfdo"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 hover:text-blue-900"
			>
				Open the setup video on YouTube
			</a>
		</p>
	</div>

	<div class="space-y-3">
		<h2 class="text-2xl font-semibold text-gray-900">What's in this article</h2>
		<p class="text-gray-700">
			Use these links to jump to the full setup instructions for each item. This is a table of
			contents, not the complete setup guide.
		</p>
		<div class="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
			<ol class="article-contents-list space-y-2 text-gray-700">
				{#each setupSteps.slice(0, 4) as step}
					<li>
						<a
							href={`#${step.id}`}
							class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
						>
							{step.name}
						</a>
					</li>
				{/each}
			</ol>
			<ol start="5" class="article-contents-list space-y-2 text-gray-700" style="--start: 5;">
				{#each setupSteps.slice(4) as step}
					<li>
						<a
							href={`#${step.id}`}
							class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
						>
							{step.name}
						</a>
					</li>
				{/each}
				<li>
					<a
						href="#checklist"
						class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
					>
						Checklist before Week 1
					</a>
				</li>
			</ol>
		</div>
	</div>
</section>

<section class="mx-auto mb-12 max-w-3xl space-y-6">
	{#each setupSteps as step, index}
		<div
			id={step.id}
			class="scroll-mt-24 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
		>
			<div class="mb-3 flex items-center gap-3">
				<span
					class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700"
				>
					{index + 1}
				</span>
				<h2 class="text-xl font-semibold text-gray-900">{step.name}</h2>
			</div>
			<p class="text-gray-700">{step.why}</p>
			{#if step.linkHref && step.linkLabel}
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
			{/if}
			{#if step.id === 'vscode'}
				<p class="mt-3 text-sm text-gray-600">
					Install the stable release and open it once so the app can finish first-run setup.
				</p>
			{:else if step.id === 'ai-account'}
				<div class="mt-3 space-y-2 text-sm text-gray-600">
					<p>
						You do not need to install a desktop app for ChatGPT or Claude. We recommend ChatGPT
						Plus or Claude Pro, and you should make sure your account works in the browser before
						the workshop starts.
					</p>
					<p>
						Set up your AI account before moving on to Git so you know your login is working and
						ready for the workshop.
					</p>
					<p>
						ChatGPT Plus:
						<a
							href="https://openai.com/chatgpt/pricing/"
							class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
							target="_blank"
							rel="noopener noreferrer"
						>
							openai.com/chatgpt/pricing
						</a>
					</p>
					<p>
						Claude Pro:
						<a
							href="https://www.anthropic.com/pricing"
							class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
							target="_blank"
							rel="noopener noreferrer"
						>
							anthropic.com/pricing
						</a>
					</p>
				</div>
			{:else if step.id === 'git'}
				<div class="mt-3 space-y-2 text-sm text-gray-600">
					<p>
						On Windows, go to
						<a
							href="https://git-scm.com/install/windows"
							class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
							target="_blank"
							rel="noopener noreferrer"
						>
							git-scm.com/install/windows
						</a>
						and run the installer executable.
					</p>
					<p>
						On macOS, open the Terminal app from Applications, Utilities, or press
						<code>Command</code> + <code>Space</code>, type <code>Terminal</code>, and press
						<code>Return</code>.
					</p>
					<p>On macOS, open Terminal first, then install Homebrew, then install Git, and then configure Git.</p>
					<p>Then install Homebrew by pasting this command into Terminal:</p>
					<div class="command-block rounded-lg border border-slate-200 bg-slate-50">
						<div class="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2">
							<p class="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
								Terminal command
							</p>
							<button
								class="copy-button inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
								class:copied={copiedCommandId === 'homebrew-install'}
								type="button"
								aria-label="Copy Homebrew install command"
								on:click={() => handleCopyCommand('homebrew-install', homebrewInstallCommand)}
							>
								{#if copiedCommandId === 'homebrew-install'}
									<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<path
											d="M3.5 8.5 6.5 11.5 12.5 4.5"
											stroke="currentColor"
											stroke-width="1.7"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									<span>Copied</span>
								{:else}
									<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<rect
											x="5"
											y="3"
											width="8"
											height="10"
											rx="1.5"
											stroke="currentColor"
											stroke-width="1.4"
										/>
										<path
											d="M3 10V5.5C3 4.672 3.672 4 4.5 4H10"
											stroke="currentColor"
											stroke-width="1.4"
											stroke-linecap="round"
										/>
									</svg>
									<span>Copy</span>
								{/if}
							</button>
						</div>
						<pre class="overflow-x-auto p-3 text-xs leading-5 text-slate-700"><code>{homebrewInstallCommand}</code></pre>
					</div>
					<p>
						After Homebrew is installed on macOS, run:
					</p>
					<div class="command-block rounded-lg border border-slate-200 bg-slate-50">
						<div class="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2">
							<p class="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
								Terminal command
							</p>
							<button
								class="copy-button inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
								class:copied={copiedCommandId === 'brew-install-git'}
								type="button"
								aria-label="Copy brew install git command"
								on:click={() => handleCopyCommand('brew-install-git', brewInstallGitCommand)}
							>
								{#if copiedCommandId === 'brew-install-git'}
									<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<path
											d="M3.5 8.5 6.5 11.5 12.5 4.5"
											stroke="currentColor"
											stroke-width="1.7"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									<span>Copied</span>
								{:else}
									<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<rect
											x="5"
											y="3"
											width="8"
											height="10"
											rx="1.5"
											stroke="currentColor"
											stroke-width="1.4"
										/>
										<path
											d="M3 10V5.5C3 4.672 3.672 4 4.5 4H10"
											stroke="currentColor"
											stroke-width="1.4"
											stroke-linecap="round"
										/>
									</svg>
									<span>Copy</span>
								{/if}
							</button>
						</div>
						<pre class="overflow-x-auto p-3 text-xs leading-5 text-slate-700"><code>{brewInstallGitCommand}</code></pre>
					</div>
					<p>After Git is installed, open Terminal, Windows Terminal, or PowerShell and run these commands one at a time:</p>
					<div class="space-y-3">
						{#each gitConfigCommands as gitCommand}
							<div class="command-block rounded-lg border border-slate-200 bg-slate-50">
								<div class="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2">
									<p class="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
										{gitCommand.label}
									</p>
									<button
										class="copy-button inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
										class:copied={copiedCommandId === gitCommand.id}
										type="button"
										aria-label={`Copy command: ${gitCommand.label}`}
										on:click={() => handleCopyCommand(gitCommand.id, gitCommand.command)}
									>
										{#if copiedCommandId === gitCommand.id}
											<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
												<path
													d="M3.5 8.5 6.5 11.5 12.5 4.5"
													stroke="currentColor"
													stroke-width="1.7"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</svg>
											<span>Copied</span>
										{:else}
											<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
												<rect
													x="5"
													y="3"
													width="8"
													height="10"
													rx="1.5"
													stroke="currentColor"
													stroke-width="1.4"
												/>
												<path
													d="M3 10V5.5C3 4.672 3.672 4 4.5 4H10"
													stroke="currentColor"
													stroke-width="1.4"
													stroke-linecap="round"
												/>
											</svg>
											<span>Copy</span>
										{/if}
									</button>
								</div>
								<pre class="overflow-x-auto p-3 text-xs leading-5 text-slate-700"><code>{gitCommand.command}</code></pre>
							</div>
						{/each}
					</div>
					<p>These commands set your Git username, email, and default branch to <code>main</code>.</p>
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
						After installation, launch Docker Desktop, complete the first-run setup, and wait
						until it reports that Docker is running.
					</p>
					<p>Install Docker first, then open Docker Desktop and complete the setup right away.</p>
				</div>
			{:else if step.id === 'vscode-extension'}
				<div class="mt-3 space-y-2 text-sm text-gray-600">
					<p>
						In VS Code, the Extensions tab is the area where you browse and install add-ons for the editor.
						Look for the square icon on the left sidebar, or open it from the View menu.
					</p>
					<p>Open the Extensions tab and install either the Codex extension or the Claude extension.</p>
					<p>
						If you use ChatGPT, install the Codex extension first, then complete its sign-in flow.
					</p>
					<p>
						If you use Claude, install the Claude Code extension next and authenticate it in VS
						Code.
					</p>
					<p>
						After installation, sign in to the extension and make sure it appears in VS Code as
						ready to use before the workshop starts.
					</p>
				</div>
			{/if}
		</div>
	{/each}
</section>

<section id="checklist" class="mx-auto mb-16 max-w-3xl scroll-mt-24 space-y-6">
	<div class="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
		<h2 class="text-xl font-semibold text-emerald-900">Checklist before Week 1</h2>
		<ul class="mt-3 list-none space-y-2 pl-0 text-emerald-900">
			<li>✓ VS Code opens normally.</li>
			<li>✓ Your Codex or Claude extension is installed in VS Code and signed in.</li>
			<li>✓ You know how to open Terminal on Mac or Terminal/PowerShell on Windows.</li>
			<li>✓ Git is installed, your username and email are configured, and your default branch is set to <code>main</code>.</li>
			<li>✓ You can sign in to GitHub with two-factor authentication enabled.</li>
			<li>✓ You can close your browser, reopen it, and sign back in to GitHub successfully.</li>
			<li>✓ Docker Desktop starts successfully and you can sign in to the app.</li>
			<li>✓ You can sign in to ChatGPT Plus or Claude Pro in your browser.</li>
		</ul>
	</div>

	<p class="text-gray-700">
		All setup should be completed before the workshop starts. If you get stuck, use the
		<a class="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900" href="/contact">contact page</a>
		so Bill or a Cambermast team member can set up a meeting with you ahead of time and help you get
		unblocked before Week 1.
	</p>
</section>

<style>
	.copy-button {
		transition:
			transform 150ms ease,
			box-shadow 150ms ease,
			border-color 150ms ease,
			background-color 150ms ease,
			color 150ms ease;
	}

	.article-contents-list {
		list-style: none;
		padding-left: 0;
		counter-reset: item calc(var(--start, 1) - 1);
	}

	.article-contents-list li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.article-contents-list li::before {
		content: counter(item);
		counter-increment: item;
		display: inline-flex;
		flex: 0 0 auto;
		height: 1.6rem;
		width: 1.6rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		background: #eff6ff;
		color: #1d4ed8;
		font-size: 0.8125rem;
		font-weight: 600;
		line-height: 1;
	}

	.command-block .copy-button:hover {
		animation: copyPulse 900ms ease-in-out infinite;
	}

	.copy-button.copied {
		animation: copyConfirm 480ms ease;
		box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
		border-color: #22c55e;
		color: #166534;
	}

	.copy-button:active {
		transform: scale(0.96);
	}

	@keyframes copyPulse {
		0% {
			box-shadow: 0 0 0 0 rgba(148, 163, 184, 0.25);
		}
		70% {
			box-shadow: 0 0 0 6px rgba(148, 163, 184, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(148, 163, 184, 0);
		}
	}

	@keyframes copyConfirm {
		0% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.2);
		}
		50% {
			transform: scale(1.03);
			box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
		}
		100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.copy-button,
		.command-block .copy-button:hover,
		.copy-button.copied {
			animation: none;
		}
	}
</style>
