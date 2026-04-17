export type PrintableResource = {
	slug: string;
	route: string;
	title: string;
	description: string;
	summary: string;
	label: string;
	publishedAt: string;
	draft?: boolean;
	heroImage: string;
	heroImageAlt: string;
	quickStart: {
		eyebrow: string;
		title: string;
		intro: string;
		audience: string[];
		steps: string[];
	};
	workModes: {
		title: string;
		intro: string;
		modes: Array<{
			name: string;
			badge: string;
			summary: string;
			reasonsToUse: string[];
			memoryTip: string;
			askFor: string[];
			expect: string;
			whyItWorks: string;
			notFor: string;
		}>;
	};
	cheatSheet: {
		title: string;
		intro: string;
		rows: Array<{
			situation: string;
			developer: string;
			aiDeveloper: string;
		}>;
	};
	smallChangeGuidance: {
		title: string;
		intro: string;
		steps: string[];
		commitTip: string;
		reminders: string[];
	};
	planningGuidance: {
		title: string;
		intro: string;
		steps: string[];
		reminders: string[];
	};
	promptFormula: {
		title: string;
		intro: string;
		modeCallout: string;
		pattern: string;
		examples: { label: string; prompt: string }[];
		fields: string[];
	};
	copyReadyPrompts: {
		title: string;
		groups: Array<{
			title: string;
			description: string;
			prompt: string;
		}>;
	};
	finalChecklist: {
		title: string;
		items: string[];
	};
};

const slug = 'ai-coding-prompt-guide';
const route = `/resources/${slug}`;

export const aiCodingPromptGuide: PrintableResource = {
	slug,
	route,
	title: 'AI Coding Prompt Guide',
	description:
		'Learn how to chat with an AI coder successfully, when to start in plan mode versus a focused chat, and how to use Git and GitHub prompts to finish the work cleanly.',
	summary:
		'A visual quick-reference guide for choosing plan mode or a focused chat, writing clearer AI prompts, and handling Git and GitHub follow-through with less friction.',
	label: 'AI coding',
	publishedAt: '2026-04-17',
	heroImage: '/images/cambermast-content-8-resources-og.jpeg',
	heroImageAlt: 'Cambermast resources hero image for the AI Coding Prompt Guide.',
	quickStart: {
		eyebrow: 'Start here',
		title: 'Use the right mode before you write the prompt',
		intro:
			'You do not need to talk like a developer to get useful results from an AI coder. Start by picking the right kind of conversation, then say what outcome you want and whether you also want help with Git or GitHub.',
		audience: [
			'Explain the result you want in plain language instead of trying to guess the perfect technical command.',
			'Choose the right chat mode first so the AI knows whether to plan the work or just make the change.',
			'Ask for Git or GitHub follow-through like commits, syncs, and build checks when you want the workflow finished.'
		],
		steps: [
			'Choose plan mode when the work is new, unclear, or likely to affect several moving parts.',
			'Use a focused chat for quick edits, bug fixes, wording changes, and normal commit-and-verify work.',
			'Ask the AI to commit, sync, or verify the result when you want the workflow finished, not just the code changed.'
		]
	},
	workModes: {
		title: 'Two ways to work with an AI coder',
		intro:
			'The most important choice is not perfect wording. It is whether you need the AI to create a Product Requirements Document (PRD) first or jump into a focused chat scoped to one area that gets the work done.',
		modes: [
			{
				name: 'Plan mode',
				badge: 'Use first for projects and larger changes',
				summary:
					'Ask the AI to create a Product Requirements Document (PRD) before it edits so you can review scope, tradeoffs, and implementation steps.',
				reasonsToUse: [
					'New projects or major changes',
					'Redesigns or unclear requirements',
					'Multi-file work with dependencies'
				],
				memoryTip:
					'Use for new projects or big changes.',
				askFor: [
					'A PRD or implementation plan',
					'Tradeoffs and missing decisions',
					'Acceptance criteria, testing, and rollout steps'
				],
				expect:
					'You should get a PRD, open questions, and a clearer implementation path before code changes begin.',
				whyItWorks:
					'Planning mode reduces rework, surfaces hidden decisions early, and keeps bigger efforts from turning into messy chats.',
				notFor:
					'Do not use plan mode for a one-line copy tweak, a small app fix, or normal day-to-day commit and sync work.'
			},
			{
				name: 'Focused chat',
				badge: 'Use for day-to-day work and focused changes',
				summary:
					'Keep the chat scoped to one page, feature, or product area. Related tweaks can share a session — just avoid mixing unrelated areas.',
				reasonsToUse: [
					'Website or app updates in one area',
					'Bug fixes or wording changes',
					'Commit, sync, or verify tasks'
				],
				memoryTip:
					'Use for focused changes in one area.',
				askFor: [
					'The exact change you want',
					'Any constraints that matter',
					'A commit, GitHub sync, or build verification if needed'
				],
				expect:
					'You should get a focused implementation, a short summary of what changed, and any requested verification at the end.',
				whyItWorks:
					'Focused chats reduce context drift, speed up execution, and make it easier to review whether the change is correct.',
				notFor:
					'Do not use a focused chat for new projects, redesigns, or work with many moving parts.'
			}
		]
	},
	cheatSheet: {
		title: 'Role differences',
		intro:
			'These examples show how a developer and an AI developer approach the same situation differently. The developer frames the engineering task, and the AI developer helps scope, execute, document, and verify the work.',
		rows: [
				{
					situation: 'Start a new project or major feature',
					developer: 'Collaborate with the product manager to create a Product Requirements Document (PRD)',
					aiDeveloper:
						'Use plan mode to collaborate on scope, draft the Product Requirements Document (PRD), surface open decisions, and outline implementation, testing, and rollout before coding starts.'
				},
				{
					situation: 'Make a small page or app change',
					developer: 'Make one targeted change in place',
					aiDeveloper:
						'Implement the requested change, stay within the existing design or code patterns, and summarize what changed when the task is complete.'
			},
				{
					situation: 'Commit the work',
					developer: 'Create a clean Git checkpoint',
					aiDeveloper: 'Prepare the completed work as a clean commit with an appropriate message.'
			},
				{
					situation: 'Sync with GitHub',
					developer: 'Update the remote branch safely',
					aiDeveloper: 'Push the work to the remote branch and handle any branch reconciliation safely.'
			},
				{
					situation: 'Commit, sync, and verify',
					developer: 'Ship the change and verify CI',
					aiDeveloper:
						'Complete the delivery workflow by committing the work, syncing it to GitHub, monitoring CI, and reporting the final result.'
			},
				{
					situation: 'Ask for a stronger prompt',
					developer: 'Clarify the spec before implementation',
					aiDeveloper:
						'Translate a rough request into a clearer implementation brief with better scope, constraints, and completion criteria.'
			}
		]
	},
	smallChangeGuidance: {
		title: 'For focused changes: keep the chat scoped',
		intro:
			'Keep the chat scoped to one page, feature, or product area. You can make many related tweaks in one session — just avoid mixing unrelated areas in the same chat.',
		steps: [
			'Describe the change in plain language and name the page, file, or workflow.',
			'Add important constraints such as tone, design, or “do not break the current layout.”',
			'Let the AI make the change and explain what it updated.',
			'For a batch of related tweaks, commit when the area feels done.',
			'For a standalone change, commit immediately before moving to something new.',
			'When you are happy with the result, sync to GitHub to save and share your work.'
		],
		commitTip: 'Once you commit or sync, start a new chat for your next change.',
		reminders: [
			'Scope the chat to one area, not one change — related tweaks can share a session.',
			'Fresh chats reduce confusion and make mistakes easier to spot.',
			'Ask for verification only when the change affects builds, deploys, or public pages.'
		]
	},
	planningGuidance: {
		title: 'For bigger work: start with planning mode',
		intro:
			'When you are starting a project, redesigning a system, or dealing with open questions, planning mode helps you decide before code starts moving.',
		steps: [
			'Turn on planning mode before you send your first prompt.',
			'State the business or product goal first.',
			'Ask the AI to think through design, content, data, technical changes, dependencies, testing, and rollout.',
			'Ask the AI to call out missing decisions and tradeoffs.',
			'Review the plan, approve the approach, and then move into implementation.',
			'Once complete, follow-up changes work best in a new focused chat.'
		],
		reminders: [
			'Start a project in plan mode before asking for code.',
			'Use planning mode when requirements are unclear or several systems are involved.',
			'Good planning creates cleaner implementation chats later.'
		]
	},
	promptFormula: {
		title: 'A simple prompt formula',
		intro:
			'Before you write your prompt, choose the right mode. Then use this formula to give the AI what it needs. You do not need perfect wording, just enough context for the AI to understand the outcome and the finish line.',
		modeCallout: 'Choose your mode first. Use plan mode for bigger work with open questions. Use a focused chat for scoped changes in one area.',
		pattern: 'Context + outcome + restrictions + done criteria',
		examples: [
			{
				label: 'Plan mode',
				prompt: `We are launching a new project management tool for small teams and need a marketing landing page to drive free trial signups. The page will live on our existing website. Keep the design modern and clean, consistent with our current brand, and do not change any other pages. Start in plan mode and create a PRD before making any changes. Before you begin, ask me any questions that would improve the plan. When done, give me a plan I can review and list any decisions you need me to make before work begins.`
			},
			{
				label: 'Focused chat',
				prompt: `Update the contact page so the form sends an email confirmation on submit. The form is in the contact section of our marketing website. Keep the existing layout and button style, and do not change any other pages. Make the change now. When done, act as a user and validate the change works as expected. Keep updating until you are confident it will function correctly, then let me know what you did.`
			}
		],
		fields: [
			'Context: the page, file, workflow, or product area involved',
			'Outcome: what you want changed or built',
			'Restrictions: tone, layout, guardrails, or things not to break',
			'Done criteria: how you will know the work is complete (e.g., tests pass, page looks right, summarize what changed)'
		]
	},
	copyReadyPrompts: {
		title: 'Copy-ready prompts',
		groups: [
			{
				title: 'New project or bigger change',
				description: 'Enable plan mode first, then use this prompt to kick off planning before any implementation begins.',
				prompt: `We are starting a new project. Review the current design and create a Product Requirements Document (PRD) before making changes.

Include goals, audience, key screens or user flows, design considerations, technical changes, dependencies, testing, rollout steps, and any missing decisions I should approve first.`
			},
			{
				title: 'Small app or website change',
				description: 'Use this for focused changes scoped to one page or product area.',
				prompt: `Update this page so it does X. Keep the existing design approach, make only the necessary changes, and when you finish summarize what changed and flag anything that might affect other parts of the site.

If anything is unclear, ask only the questions needed to complete this one task.`
			},
			{
				title: 'Commit locally',
				description: 'Use this when you want to save your work but are not ready to push to production.',
				prompt: `Commit all changes locally with a clear commit message describing what was done. Do not sync or push to GitHub. This work is not ready for production yet.`
			},
			{
				title: 'Commit and confirm',
				description: 'Use this after a change is ready to save your work and verify nothing broke.',
				prompt: `Commit your changes, sync them to GitHub, and track GitHub Actions building my website to ensure there are no errors. When complete, provide me with the URL.

If anything fails, explain the error clearly and fix it before reporting back.`
			}
		]
	},
	finalChecklist: {
		title: 'Before you hit send',
		items: [
			'Did I choose the right mode: plan mode or focused chat?',
			'Did I include the context: the page, file, or workflow involved?',
			'Did I describe the outcome: what I want changed or built?',
			'Did I include any restrictions: tone, layout, or things not to break?',
			'For small work, did I keep this to one focused task?',
			'Do I want a commit, GitHub sync, or build verification at the end?'
		]
	}
};

export const aiCodingPromptGuidePrintUrl = `${route}/print`;
export const aiCodingPromptGuidePdfUrl = `/downloads/resources/${slug}.pdf`;
