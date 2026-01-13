<script lang="ts">
	import { dev } from '$app/environment';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';

	const pageMeta = getSeo('/tools/ai-automation-skills');

	const ratingScale = [
		{ value: 1, label: 'New', hint: 'Seen the basics' },
		{ value: 2, label: 'Curious', hint: 'Can repeat with help' },
		{ value: 3, label: 'Capable', hint: 'Ship with guidance' },
		{ value: 4, label: 'Confident', hint: 'Design solo' },
		{ value: 5, label: 'Lead', hint: 'Coach others' }
	];

	const roles = [
		{
			id: 'ops-lead',
			label: 'Ops + automation lead',
			blurb: 'Owns delivery velocity and ROI.'
		},
		{
			id: 'pm-builder',
			label: 'Product or program manager',
			blurb: 'Turns requests into usable workflows.'
		},
		{
			id: 'builder',
			label: 'Automation builder',
			blurb: 'Ships workflows and integrations.'
		},
		{
			id: 'founder',
			label: 'Founder or executive',
			blurb: 'Sets the AI roadmap and guardrails.'
		}
	];

	const outcomes = [
		{
			id: 'lead-routing',
			label: 'Lead intake + routing',
			detail: 'Automate intake, enrichment, and assignment.'
		},
		{
			id: 'ops-reporting',
			label: 'Ops reporting',
			detail: 'Generate weekly and monthly insights.'
		},
		{
			id: 'cs-assist',
			label: 'Customer support assist',
			detail: 'Summarize tickets, suggest responses.'
		},
		{
			id: 'content-production',
			label: 'Content production',
			detail: 'Draft, QA, and publish content faster.'
		},
		{
			id: 'workflow-handoffs',
			label: 'Workflow handoffs',
			detail: 'Move data across systems with checks.'
		},
		{
			id: 'agent-prototype',
			label: 'Agent prototypes',
			detail: 'Build supervised agent workflows.'
		}
	];

	const toolStack = [
		{ id: 'n8n', label: 'n8n' },
		{ id: 'zapier', label: 'Zapier' },
		{ id: 'make', label: 'Make' },
		{ id: 'gpt', label: 'ChatGPT' },
		{ id: 'claude', label: 'Claude' },
		{ id: 'gmail', label: 'Gmail + Google' },
		{ id: 'notion', label: 'Notion' },
		{ id: 'slack', label: 'Slack' },
		{ id: 'jira', label: 'Jira' },
		{ id: 'hubspot', label: 'HubSpot' }
	];

	const categories = [
		{
			id: 'strategy',
			label: 'Outcome strategy',
			blurb: 'Define the automation target and how success is measured.',
			skills: [
				{
					id: 'strategy-goals',
					label: 'Outcome framing',
					detail: 'Translate a request into a measurable automation goal.'
				},
				{
					id: 'strategy-roi',
					label: 'ROI math',
					detail: 'Estimate time saved, cost avoided, or revenue lift.'
				},
				{
					id: 'strategy-stakeholders',
					label: 'Stakeholder alignment',
					detail: 'Clarify who approves, owns, and uses the automation.'
				}
			]
		},
		{
			id: 'prompting',
			label: 'Prompt + agent design',
			blurb: 'Build prompts and agent flows that stay on task.',
			skills: [
				{
					id: 'prompt-structure',
					label: 'Prompt scaffolds',
					detail: 'Use role, context, and constraints to guide outputs.'
				},
				{
					id: 'prompt-tools',
					label: 'Tool calling',
					detail: 'Design tools so the model asks for what it needs.'
				},
				{
					id: 'prompt-guardrails',
					label: 'Guardrails',
					detail: 'Reduce hallucinations with checks and templates.'
				}
			]
		},
		{
			id: 'data',
			label: 'Data + knowledge',
			blurb: 'Get data into the workflow safely and reliably.',
			skills: [
				{
					id: 'data-quality',
					label: 'Data quality',
					detail: 'Know what is clean, current, and trustworthy.'
				},
				{
					id: 'data-retrieval',
					label: 'Retrieval plans',
					detail: 'Pick the right data source and timing.'
				},
				{
					id: 'data-structure',
					label: 'Structured outputs',
					detail: 'Normalize outputs for downstream automations.'
				}
			]
		},
		{
			id: 'orchestration',
			label: 'Workflow orchestration',
			blurb: 'Connect systems, APIs, and humans in a reliable flow.',
			skills: [
				{
					id: 'orchestration-platform',
					label: 'Automation platforms',
					detail: 'Build multi-step workflows with triggers and branches.'
				},
				{
					id: 'orchestration-integrations',
					label: 'API integration',
					detail: 'Use webhooks, auth, and data mapping safely.'
				},
				{
					id: 'orchestration-hil',
					label: 'Human-in-loop',
					detail: 'Add approvals when the workflow needs judgment.'
				}
			]
		},
		{
			id: 'reliability',
			label: 'Reliability + governance',
			blurb: 'Test, monitor, and protect automation outcomes.',
			skills: [
				{
					id: 'reliability-qa',
					label: 'QA and testing',
					detail: 'Validate against real scenarios and edge cases.'
				},
				{
					id: 'reliability-monitor',
					label: 'Monitoring',
					detail: 'Track drift, failures, and reliability metrics.'
				},
				{
					id: 'reliability-risk',
					label: 'Risk and security',
					detail: 'Protect data, handle PII, and document approvals.'
				}
			]
		}
	];

	const readinessBands = [
		{
			min: 4.3,
			label: 'Execution ready',
			detail: 'Ship complex automations and coach others.'
		},
		{
			min: 3.5,
			label: 'Scaling',
			detail: 'Ready to scale workflows and own reliability.'
		},
		{
			min: 2.6,
			label: 'Piloting',
			detail: 'Shipping pilots with some guidance.'
		},
		{
			min: 1.6,
			label: 'Exploring',
			detail: 'Early experiments with helpful structure.'
		},
		{
			min: 0,
			label: 'Just starting',
			detail: 'Need foundational reps and coaching.'
		}
	];

	const skillIds = categories.flatMap((category) =>
		category.skills.map((skill) => skill.id)
	);

	let activeCategory = categories[0].id;
	let selectedRole = roles[0].id;
	let selectedOutcomes: string[] = [];
	let selectedTools: string[] = [];

	let name = '';
	let email = '';
	let company = '';
	let teamSize = '';
	let industry = '';
	let timeline = '';
	let successMetric = '';
	let constraints = '';
	let notes = '';

	let submitStatus: 'idle' | 'sending' | 'sent' | 'error' = 'idle';
	let submitError = '';

	let skillRatings = Object.fromEntries(skillIds.map((id) => [id, 2]));

	const reportEndpoint = dev
		? 'https://n8n.cambermast.com/webhook-test/ai-automation-skills-map'
		: 'https://n8n.cambermast.com/webhook/ai-automation-skills-map';

	const toggleSelection = (list: string[], id: string): string[] => {
		if (list.includes(id)) {
			return list.filter((item) => item !== id);
		}
		return [...list, id];
	};

	const setRating = (skillId: string, value: number) => {
		skillRatings = { ...skillRatings, [skillId]: value };
	};

	const resetRatings = () => {
		skillRatings = Object.fromEntries(skillIds.map((id) => [id, 2]));
	};

	const getRoleLabel = (id: string) => roles.find((role) => role.id === id)?.label ?? '';

	const getOutcomeLabels = (ids: string[]) =>
		ids
			.map((id) => outcomes.find((item) => item.id === id)?.label)
			.filter((item): item is string => Boolean(item));

	const getToolLabels = (ids: string[]) =>
		ids
			.map((id) => toolStack.find((item) => item.id === id)?.label)
			.filter((item): item is string => Boolean(item));

	$: categoryScores = categories.map((category) => {
		const values = category.skills.map((skill) => skillRatings[skill.id] ?? 0);
		const average = values.reduce((total, value) => total + value, 0) / values.length;
		return { id: category.id, label: category.label, score: average };
	});

	$: readinessScore =
		skillIds.reduce((total, id) => total + (skillRatings[id] ?? 0), 0) / skillIds.length;
	$: readinessPercent = Math.round((readinessScore / 5) * 100);
	$: readinessBand =
		readinessBands.find((band) => readinessScore >= band.min) ??
		readinessBands[readinessBands.length - 1];

	$: flattenedSkills = categories.flatMap((category) =>
		category.skills.map((skill) => ({
			...skill,
			categoryId: category.id,
			categoryLabel: category.label,
			rating: skillRatings[skill.id] ?? 0
		}))
	);

	$: gapSkills = [...flattenedSkills].sort((a, b) => a.rating - b.rating).slice(0, 3);
	$: strengthSkills = [...flattenedSkills].sort((a, b) => b.rating - a.rating).slice(0, 3);

	$: outcomeSummary =
		getOutcomeLabels(selectedOutcomes).join(', ') || 'a mix of automation outcomes';
	$: toolSummary = getToolLabels(selectedTools).join(', ') || 'no tools selected yet';

	$: reportSummary = `${getRoleLabel(selectedRole) || 'Automation team'} focused on ${outcomeSummary}. Top tools: ${toolSummary}.`;

	$: reportData = {
		timestamp: new Date().toISOString(),
		role: getRoleLabel(selectedRole),
		outcomes: getOutcomeLabels(selectedOutcomes),
		tools: getToolLabels(selectedTools),
		scores: {
			readinessScore,
			readinessPercent,
			readinessBand: readinessBand?.label
		},
		categoryScores,
		skills: flattenedSkills.map((skill) => ({
			id: skill.id,
			label: skill.label,
			category: skill.categoryLabel,
			rating: skill.rating
		})),
		contact: {
			name,
			email,
			company,
			teamSize,
			industry,
			timeline,
			successMetric,
			constraints,
			notes
		}
	};

	const copySummary = async () => {
		if (typeof navigator === 'undefined' || !navigator?.clipboard) return;
		await navigator.clipboard.writeText(reportSummary);
	};

	const downloadReport = () => {
		if (typeof document === 'undefined') return;
		const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `ai-automation-skills-map-${new Date().toISOString().slice(0, 10)}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const submitReport = async () => {
		submitError = '';
		if (!email) {
			submitStatus = 'error';
			submitError = 'Please add your email so we can send the formal report.';
			return;
		}

		submitStatus = 'sending';
		try {
			const res = await fetch(reportEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(reportData)
			});
			if (!res.ok) {
				throw new Error(`Webhook error: ${res.status}`);
			}
			submitStatus = 'sent';
		} catch (err: unknown) {
			submitStatus = 'error';
			submitError = err instanceof Error ? err.message : 'Submission failed.';
		}
	};
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/tools/ai-automation-skills"
/>

<main class="skills-map-page">
	<section class="skills-hero">
		<div class="hero-copy">
			<p class="hero-eyebrow">AI automation skills map</p>
			<h1>Map the skills that keep automations real, reliable, and shipped.</h1>
			<p class="hero-lede">
				Pick your role, mark outcomes, and rate your delivery muscle. Your readiness score and
				plan update instantly, so you can see the path to a formal report without waiting on a
				backend.
			</p>
			<div class="hero-actions">
				<button type="button" class="ghost" on:click={copySummary}>Copy summary</button>
				<button type="button" class="solid" on:click={downloadReport}>Download report data</button>
			</div>
		</div>
		<div class="hero-card">
			<div class="hero-metric">
				<span class="metric-label">Readiness</span>
				<strong class="metric-value">{readinessPercent}%</strong>
				<span class="metric-sub">{readinessBand?.label}</span>
			</div>
			<div class="hero-metric">
				<span class="metric-label">Active category</span>
				<strong class="metric-value">
					{categories.find((category) => category.id === activeCategory)?.label}
				</strong>
				<span class="metric-sub">{readinessBand?.detail}</span>
			</div>
			<p class="hero-summary">{reportSummary}</p>
		</div>
	</section>

	<section class="mission-grid">
		<article class="mission-panel">
			<h2>Choose your mission</h2>
			<p class="panel-lede">Start by picking the role you want this report to speak to.</p>
			<div class="card-grid">
				{#each roles as role}
					<button
						class={`role-card ${selectedRole === role.id ? 'active' : ''}`}
						type="button"
						on:click={() => (selectedRole = role.id)}
						aria-pressed={selectedRole === role.id}
					>
						<strong>{role.label}</strong>
						<span>{role.blurb}</span>
					</button>
				{/each}
			</div>
		</article>
		<article class="mission-panel">
			<h2>Outcomes you want to ship</h2>
			<p class="panel-lede">Pick the automation outcomes that matter most right now.</p>
			<div class="chip-grid">
				{#each outcomes as outcome}
					<button
						class={`chip ${selectedOutcomes.includes(outcome.id) ? 'active' : ''}`}
						type="button"
						on:click={() => (selectedOutcomes = toggleSelection(selectedOutcomes, outcome.id))}
						aria-pressed={selectedOutcomes.includes(outcome.id)}
					>
						<span>{outcome.label}</span>
						<small>{outcome.detail}</small>
					</button>
				{/each}
			</div>
		</article>
		<article class="mission-panel">
			<h2>Tool stack signals</h2>
			<p class="panel-lede">Highlight the platforms you already touch or plan to adopt.</p>
			<div class="chip-row">
				{#each toolStack as tool}
					<button
						class={`chip compact ${selectedTools.includes(tool.id) ? 'active' : ''}`}
						type="button"
						on:click={() => (selectedTools = toggleSelection(selectedTools, tool.id))}
						aria-pressed={selectedTools.includes(tool.id)}
					>
						{tool.label}
					</button>
				{/each}
			</div>
		</article>
	</section>

	<section class="map-grid">
		<div class="map-shell">
			<div class="map-constellation" role="presentation">
				<div class="map-core" style={`--progress:${readinessPercent}`}>
					<span class="core-label">{readinessPercent}%</span>
					<span class="core-sub">Automation readiness</span>
				</div>
				{#each categories as category}
					<button
						class={`map-node node-${category.id} ${activeCategory === category.id ? 'active' : ''}`}
						type="button"
						on:click={() => (activeCategory = category.id)}
						aria-pressed={activeCategory === category.id}
					>
						<span>{category.label}</span>
						<small>
							{categoryScores.find((entry) => entry.id === category.id)?.score.toFixed(1)}
						</small>
					</button>
				{/each}
			</div>
			<div class="map-legend">
				<h3>Category readout</h3>
				{#each categoryScores as entry}
					<div class="legend-row">
						<div>
							<strong>{entry.label}</strong>
							<span>{entry.score.toFixed(1)} / 5</span>
						</div>
						<div class="bar" style={`--progress:${(entry.score / 5) * 100}`}></div>
					</div>
				{/each}
			</div>
		</div>
		<div class="map-console">
			{#each categories as category}
				{#if category.id === activeCategory}
					<div class="console-header">
						<h2>{category.label}</h2>
						<p>{category.blurb}</p>
						<button type="button" class="ghost" on:click={resetRatings}>
							Reset ratings to baseline
						</button>
					</div>
					<div class="skill-grid">
						{#each category.skills as skill}
							<div class="skill-card">
								<div>
									<strong>{skill.label}</strong>
									<p>{skill.detail}</p>
								</div>
								<div class="rating-row">
									{#each ratingScale as option}
										<button
											class={`rating ${skillRatings[skill.id] === option.value ? 'active' : ''}`}
											type="button"
											on:click={() => setRating(skill.id, option.value)}
											aria-pressed={skillRatings[skill.id] === option.value}
											title={option.hint}
										>
											{option.label}
										</button>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	</section>

	<section class="score-grid">
		<article class="score-card">
			<h3>Your readiness snapshot</h3>
			<p class="score-big">{readinessPercent}%</p>
			<p class="score-sub">{readinessBand?.label} - {readinessBand?.detail}</p>
			<p class="score-note">{reportSummary}</p>
		</article>
		<article class="score-card">
			<h3>Top gaps to close</h3>
			<ul>
				{#each gapSkills as skill}
					<li>
						<strong>{skill.label}</strong>
						<span>{skill.categoryLabel} · {skill.rating}/5</span>
					</li>
				{/each}
			</ul>
		</article>
		<article class="score-card">
			<h3>Strengths to lean on</h3>
			<ul>
				{#each strengthSkills as skill}
					<li>
						<strong>{skill.label}</strong>
						<span>{skill.categoryLabel} · {skill.rating}/5</span>
					</li>
				{/each}
			</ul>
		</article>
	</section>

	<section class="report-grid">
		<article class="report-panel">
			<h2>Instant report highlights</h2>
			<p>
				Your automation map is updated in real time. When you are ready, submit your email and we
				will send a formal report with recommendations tied to your role and automation outcomes.
			</p>
			<div class="report-actions">
				<button type="button" class="ghost" on:click={copySummary}>Copy summary</button>
				<button type="button" class="solid" on:click={downloadReport}>Download JSON</button>
			</div>
			<div class="report-box">
				<p class="report-label">Live summary</p>
				<p class="report-text">{reportSummary}</p>
				<p class="report-label">Next best focus</p>
				<ul>
					{#each gapSkills as skill}
						<li>{skill.label} in {skill.categoryLabel}</li>
					{/each}
				</ul>
			</div>
		</article>
		<article class="report-panel form-panel">
			<h2>Send me the formal report</h2>
			<p>We only use this to deliver the report and follow up on your request.</p>
			<form on:submit|preventDefault={submitReport}>
				<div class="field-grid">
					<label>
						<span>Name</span>
						<input bind:value={name} type="text" placeholder="Your name" />
					</label>
					<label>
						<span>Email</span>
						<input bind:value={email} type="email" placeholder="you@company.com" required />
					</label>
				</div>
				<label>
					<span>Company</span>
					<input bind:value={company} type="text" placeholder="Company name" />
				</label>
				<div class="field-grid">
					<label>
						<span>Team size</span>
						<input bind:value={teamSize} type="text" placeholder="e.g. 8 builders" />
					</label>
					<label>
						<span>Industry</span>
						<input bind:value={industry} type="text" placeholder="e.g. SaaS, logistics" />
					</label>
				</div>
				<div class="field-grid">
					<label>
						<span>Timeline</span>
						<input bind:value={timeline} type="text" placeholder="e.g. 30-60 days" />
					</label>
					<label>
						<span>Success metric</span>
						<input bind:value={successMetric} type="text" placeholder="e.g. hours saved" />
					</label>
				</div>
				<label>
					<span>Constraints or risks</span>
					<textarea bind:value={constraints} rows="3" placeholder="Security, compliance, budget"></textarea>
				</label>
				<label>
					<span>Anything else you want in the report?</span>
					<textarea bind:value={notes} rows="3" placeholder="Add context or must-haves"></textarea>
				</label>
				<div aria-live="polite" class="form-status">
					{#if submitStatus === 'sent'}
						<p class="ok">Thanks! Your report request is on its way.</p>
					{:else if submitStatus === 'error'}
						<p class="error">{submitError}</p>
					{:else if submitStatus === 'sending'}
						<p class="loading">Submitting your request...</p>
					{/if}
				</div>
				<button type="submit" class="solid" disabled={submitStatus === 'sending'}>
					{submitStatus === 'sending' ? 'Sending...' : 'Request the report'}
				</button>
			</form>
		</article>
	</section>
</main>

<style>
	.skills-map-page {
		--ink: #0f172a;
		--muted: #475569;
		--cream: #f8f7f2;
		--sand: #fff3df;
		--mint: #c7f9d1;
		--teal: #0f766e;
		--berry: #f97316;
		--night: #0b1324;
		font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
		color: var(--ink);
		background: radial-gradient(circle at top, #fff4d6 0%, #f3f7ff 45%, #ffffff 100%);
		padding: 3rem clamp(1.5rem, 3vw, 4rem) 4rem;
	}

	.skills-map-page h1,
	.skills-map-page h2,
	.skills-map-page h3 {
		letter-spacing: -0.02em;
	}

	.skills-hero {
		display: grid;
		gap: 2rem;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.9fr);
		align-items: center;
		margin-bottom: 3rem;
	}

	.hero-copy h1 {
		font-size: clamp(2rem, 2.8vw, 3rem);
		font-weight: 700;
		margin: 0 0 1rem;
	}

	.hero-eyebrow {
		text-transform: uppercase;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		color: var(--teal);
		margin: 0 0 0.75rem;
	}

	.hero-lede {
		font-size: 1.05rem;
		color: var(--muted);
		margin-bottom: 1.5rem;
	}

	.hero-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.hero-card {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 1.5rem;
		padding: 1.5rem;
		box-shadow: 0 18px 50px rgba(15, 23, 42, 0.1);
	}

	.hero-metric {
		display: grid;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.metric-label {
		text-transform: uppercase;
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		color: var(--muted);
	}

	.metric-value {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.metric-sub {
		font-size: 0.85rem;
		color: var(--muted);
	}

	.hero-summary {
		font-size: 0.95rem;
		color: var(--night);
		border-top: 1px dashed #e2e8f0;
		padding-top: 1rem;
		margin-top: 1rem;
	}

	.mission-grid {
		display: grid;
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.mission-panel {
		background: #ffffff;
		border-radius: 1.5rem;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
	}

	.panel-lede {
		color: var(--muted);
		margin-top: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.card-grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}

	.role-card {
		border: 1px solid #e2e8f0;
		border-radius: 1.25rem;
		padding: 1rem;
		text-align: left;
		background: #f8fafc;
		transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.role-card strong {
		display: block;
		margin-bottom: 0.35rem;
	}

	.role-card span {
		font-size: 0.9rem;
		color: var(--muted);
	}

	.role-card.active {
		border-color: #0f766e;
		box-shadow: 0 12px 24px rgba(15, 118, 110, 0.2);
		transform: translateY(-2px);
		background: #f0fdfa;
	}

	.chip-grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		border-radius: 1rem;
		border: 1px solid #e2e8f0;
		background: #ffffff;
		padding: 0.75rem 0.9rem;
		text-align: left;
		display: grid;
		gap: 0.25rem;
		font-size: 0.95rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.chip.compact {
		padding: 0.45rem 0.85rem;
		font-size: 0.85rem;
	}

	.chip small {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.chip.active {
		border-color: var(--berry);
		box-shadow: 0 10px 20px rgba(249, 115, 22, 0.18);
		background: #fff7ed;
	}

	.map-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		margin-bottom: 3rem;
	}

	.map-shell {
		background: #0b1324;
		border-radius: 1.75rem;
		padding: 2rem;
		color: #f8fafc;
		position: relative;
		overflow: hidden;
	}

	.map-shell::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at top left, rgba(34, 211, 238, 0.25), transparent 55%),
			radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.2), transparent 60%);
		opacity: 0.9;
		pointer-events: none;
	}

	.map-constellation {
		position: relative;
		min-height: 360px;
	}

	.map-core {
		width: 160px;
		height: 160px;
		border-radius: 999px;
		background: conic-gradient(#22d3ee calc(var(--progress) * 1%), rgba(148, 163, 184, 0.2) 0);
		display: grid;
		place-items: center;
		text-align: center;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 20px 40px rgba(14, 116, 144, 0.35);
	}

	.map-core::after {
		content: '';
		position: absolute;
		inset: 12px;
		border-radius: 999px;
		background: #0f172a;
	}

	.map-core span {
		position: relative;
		z-index: 1;
	}

	.core-label {
		font-size: 1.6rem;
		font-weight: 700;
	}

	.core-sub {
		font-size: 0.75rem;
		color: #cbd5f5;
	}

	.map-node {
		position: absolute;
		border: 1px solid rgba(148, 163, 184, 0.4);
		background: rgba(15, 23, 42, 0.9);
		color: #f8fafc;
		border-radius: 1rem;
		padding: 0.6rem 0.85rem;
		display: grid;
		gap: 0.2rem;
		text-align: left;
		min-width: 150px;
		transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.map-node small {
		font-size: 0.75rem;
		color: #94a3b8;
	}

	.map-node.active {
		border-color: #38bdf8;
		box-shadow: 0 14px 30px rgba(56, 189, 248, 0.3);
		transform: translateY(-2px);
	}

	.node-strategy {
		left: 5%;
		top: 15%;
	}

	.node-prompting {
		right: 5%;
		top: 12%;
	}

	.node-data {
		left: 8%;
		bottom: 10%;
	}

	.node-orchestration {
		right: 10%;
		bottom: 12%;
	}

	.node-reliability {
		left: 50%;
		bottom: -5%;
		transform: translateX(-50%);
	}

	.map-legend {
		position: relative;
		margin-top: 2rem;
		z-index: 1;
	}

	.map-legend h3 {
		margin-bottom: 1rem;
		font-size: 1.1rem;
	}

	.legend-row {
		display: grid;
		gap: 0.4rem;
		margin-bottom: 0.85rem;
	}

	.legend-row strong {
		font-size: 0.9rem;
	}

	.legend-row span {
		font-size: 0.75rem;
		color: #94a3b8;
		margin-left: 0.4rem;
	}

	.bar {
		height: 6px;
		border-radius: 999px;
		background: rgba(148, 163, 184, 0.25);
		position: relative;
		overflow: hidden;
	}

	.bar::after {
		content: '';
		position: absolute;
		inset: 0;
		width: calc(var(--progress) * 1%);
		background: linear-gradient(90deg, #22d3ee, #38bdf8);
		border-radius: inherit;
	}

	.map-console {
		background: #ffffff;
		border-radius: 1.5rem;
		padding: 2rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
	}

	.console-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.skill-grid {
		display: grid;
		gap: 1rem;
	}

	.skill-card {
		border: 1px solid #e2e8f0;
		border-radius: 1.25rem;
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
		background: #f8fafc;
	}

	.skill-card p {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.rating-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.rating {
		font-size: 0.75rem;
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		border: 1px solid #cbd5f5;
		background: #ffffff;
		transition: background 0.2s ease, border-color 0.2s ease;
	}

	.rating.active {
		background: var(--mint);
		border-color: #22c55e;
	}

	.score-grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		margin-bottom: 3rem;
	}

	.score-card {
		background: #ffffff;
		border-radius: 1.5rem;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 16px 30px rgba(15, 23, 42, 0.06);
	}

	.score-big {
		font-size: 2rem;
		font-weight: 700;
		margin: 0.4rem 0;
	}

	.score-sub {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.score-note {
		margin-top: 0.75rem;
		font-size: 0.9rem;
		color: #0f172a;
	}

	.score-card ul {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0;
		display: grid;
		gap: 0.75rem;
	}

	.score-card li {
		display: grid;
		gap: 0.2rem;
		font-size: 0.9rem;
	}

	.score-card li span {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.report-grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}

	.report-panel {
		background: #ffffff;
		border-radius: 1.5rem;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 16px 30px rgba(15, 23, 42, 0.06);
	}

	.report-actions {
		display: flex;
		gap: 0.75rem;
		margin: 1rem 0;
		flex-wrap: wrap;
	}

	.report-box {
		background: #f1f5f9;
		border-radius: 1rem;
		padding: 1rem;
		display: grid;
		gap: 0.5rem;
	}

	.report-label {
		text-transform: uppercase;
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		color: var(--muted);
		margin: 0;
	}

	.report-text {
		margin: 0;
		font-size: 0.95rem;
	}

	.report-box ul {
		margin: 0;
		padding-left: 1.2rem;
		font-size: 0.9rem;
	}

	.form-panel form {
		display: grid;
		gap: 0.9rem;
	}

	.field-grid {
		display: grid;
		gap: 0.9rem;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	}

	label {
		display: grid;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	input,
	textarea {
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
		padding: 0.65rem 0.85rem;
		font-family: inherit;
		font-size: 0.9rem;
	}

	textarea {
		resize: vertical;
	}

	.form-status {
		min-height: 1.5rem;
		font-size: 0.85rem;
	}

	.form-status .ok {
		color: #15803d;
	}

	.form-status .error {
		color: #b91c1c;
	}

	.form-status .loading {
		color: #0f172a;
	}

	button {
		font-family: inherit;
		cursor: pointer;
	}

	button.solid {
		background: #0f172a;
		color: #ffffff;
		border-radius: 999px;
		padding: 0.65rem 1.4rem;
		border: none;
		font-weight: 600;
	}

	button.ghost {
		background: transparent;
		color: #0f172a;
		border: 1px solid #0f172a;
		border-radius: 999px;
		padding: 0.65rem 1.2rem;
		font-weight: 600;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 960px) {
		.skills-hero,
		.map-grid,
		.report-grid {
			grid-template-columns: 1fr;
		}

		.map-shell {
			order: 1;
		}

		.map-console {
			order: 2;
		}

		.node-reliability {
			bottom: 2%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none !important;
		}
	}
</style>
