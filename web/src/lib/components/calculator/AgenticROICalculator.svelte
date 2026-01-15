<script lang="ts">
	import {
		calculateAgenticROI,
		formatCurrency,
		formatHours,
		formatPaybackDays,
		type AgenticROIInputs,
		type AgenticROIResults
	} from '$lib/utils/agentic-roi-calculator';

	// Default values
	let peopleImpacted = $state(5);
	let annualSalary = $state(80000);
	let repetitiveTasks = $state(10);
	let focusLoss = $state(10);
	let manualResearch = $state(5);
	let manualHandoffs = $state(5);
	let copied = $state(false);

	const salaryTiers = [35000, 45000, 55000, 65000, 75000, 80000, 90000, 100000, 115000, 130000, 150000, 175000, 200000];

	function stepSalary(direction: 'up' | 'down') {
		if (direction === 'up') {
			const next = salaryTiers.find(s => s > annualSalary);
			if (next) annualSalary = next;
		} else {
			const prev = [...salaryTiers].reverse().find(s => s < annualSalary);
			if (prev) annualSalary = prev;
		}
	}

	// Computed results using $derived
	const results = $derived<AgenticROIResults>(
		calculateAgenticROI({
			peopleImpacted,
			annualSalary,
			repetitiveTasks,
			focusLoss,
			manualResearch,
			manualHandoffs
		})
	);
	const showCurrentLegend = $derived(results.currentDistribution.overhead <= 15);
	const showFutureLegend = $derived(
		results.futureDistribution.remainingOverhead <= 8 || results.futureDistribution.reclaimed <= 8
	);

	const emailSubject = 'Approval to Enroll in AI Automation with Agents';

	// Generate manager pitch email
	const managerPitch = $derived(`Hi [Manager Name],

I ran a quick ROI estimate for reducing the "Manual Tax" (our operational overhead) in our weekly work.

This is time lost to repetitive tasks, context switching, and manual handoffs. If we reclaim even part of this time with AI agents and automation, it becomes capacity we can redirect into higher-value work, without changing headcount.

Based on our scenario:
• People impacted: ${peopleImpacted}
• Hours lost per person per week: ${results.hoursPerPersonPerWeek.toFixed(1)}h
• Estimated value of time recovered: ${formatCurrency(results.valueReclaimedMonthly)}/month or ${formatCurrency(results.valueReclaimedAnnual)}/year

I'd like your approval to enroll in AI Automation with Agents, so I can build these workflows safely and drive realistic adoption. The goal is to reduce process friction and improve delivery, not "do more work faster."

Can I move forward with the training?

Course details: https://cambermast.com/training/ai-automation-with-agents`);

	const managerPitchWithSubject = $derived(`Subject: ${emailSubject}

${managerPitch}`);

	const managerPitchMailto = $derived(
		`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(managerPitch)}`
	);

	// Copy email template to clipboard
	function copyEmailTemplate() {
		const handleCopied = () => {
			copied = true;
			setTimeout(() => (copied = false), 2000);

			if (typeof window !== 'undefined' && window.gtag) {
				window.gtag('event', 'copy_email', {
					event_category: 'agentic_roi_calculator',
					event_label: 'manager_pitch',
					value: Math.round(results.valueReclaimedAnnual)
				});
			}
		};

		const fallbackCopy = () => {
			const textarea = document.createElement('textarea');
			textarea.value = managerPitchWithSubject;
			textarea.setAttribute('readonly', 'true');
			textarea.style.position = 'absolute';
			textarea.style.left = '-9999px';
			document.body.appendChild(textarea);
			textarea.select();
			textarea.setSelectionRange(0, textarea.value.length);
			const success = document.execCommand('copy');
			document.body.removeChild(textarea);
			if (success) handleCopied();
		};

		if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(managerPitchWithSubject).then(handleCopied).catch(fallbackCopy);
			return;
		}

		fallbackCopy();
	}

	// Track CTA click
	function trackCTAClick() {
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'click_cta', {
				event_category: 'agentic_roi_calculator',
				event_label: 'workshop_enrollment',
				value: Math.round(results.valueReclaimedAnnual)
			});
		}
	}
</script>

<div class="calculator-container space-y-6">
	<!-- Blue Hero Banner -->
	<div class="overflow-hidden rounded-3xl border-none bg-blue-600 p-5 text-white shadow-lg md:px-8">
		<div class="flex items-center gap-4">
			<div class="shrink-0 rounded-2xl bg-blue-500 p-3 text-amber-400 shadow-inner">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<div class="flex-1 space-y-1">
				<p class="text-sm font-medium leading-relaxed text-blue-100 md:text-base">
					AI agents are becoming a core job skill for modern teams. Use this calculator to estimate your <span class="font-bold text-white">Manual Tax</span>, the value of time you can reclaim, and how fast training pays for itself.
				</p>
			</div>
		</div>
	</div>

	<!-- Two-column layout -->
	<div class="grid items-stretch gap-6 lg:grid-cols-12">
		<!-- LEFT COLUMN: Inputs -->
		<div class="space-y-6 lg:col-span-5">
			<!-- Step 1: Baseline -->
			<div class="overflow-hidden rounded-3xl border-none bg-white shadow-xl ring-1 ring-slate-200">
				<div class="space-y-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
					<h3 class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
						<svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Step 1. Your Manual Tax Baseline
					</h3>
					<p class="text-[11px] font-medium leading-relaxed text-slate-500">
						These inputs establish the baseline cost of manual work for you or your team. The next step breaks down where that time goes.
					</p>
				</div>
				<div class="space-y-8 p-6">
					<div class="rounded-2xl border border-dashed border-blue-100 bg-blue-50/50 p-5 text-center">
						<p class="text-[11px] font-bold leading-snug text-slate-700">
							Capacity you're paying for: <span class="font-black text-blue-700">~{formatHours(results.totalCapacityHours)} hours/year</span>
						</p>
						<p class="mt-1 text-[10px] font-medium italic text-slate-500">
							Your Manual Tax is the portion consumed by overhead.
						</p>
						<p class="mt-1 text-[9px] italic leading-relaxed text-slate-400">
							Default productive capacity: 1,850 hours per person/year. Benchmark: $80k.
						</p>
					</div>

					<div class="grid grid-cols-2 gap-8">
						<!-- People Impacted -->
						<div class="space-y-2">
							<label for="people-impacted" class="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-800">
								<svg class="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
								People Impacted
							</label>
							<p id="people-impacted-help" class="text-[9px] font-medium italic leading-tight text-slate-500">
								The number of colleagues (including you) who will adopt AI workflows.
							</p>
							<div class="flex items-center justify-between pt-1">
								<span class="text-3xl font-black text-blue-600">{peopleImpacted}</span>
							</div>
							<input
								type="range"
								id="people-impacted"
								bind:value={peopleImpacted}
								min="1"
								max="50"
								step="1"
								aria-describedby="people-impacted-help"
								class="w-full accent-blue-600"
							/>
						</div>

						<!-- Annual Salary -->
						<div class="space-y-2">
							<label for="annual-salary" class="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-800">
								<svg class="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Annual Salary
							</label>
							<p id="annual-salary-help" class="text-[9px] font-medium italic leading-tight text-slate-500">
								Average salary used to calculate the economic value of reclaimed work.
							</p>
							<div class="relative pt-1">
								<span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
								<input
									type="number"
									id="annual-salary"
									bind:value={annualSalary}
									min="30000"
									max="300000"
									step="5000"
									aria-describedby="annual-salary-help"
									class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-6 pr-8 font-mono text-sm font-black"
								/>
								<div class="absolute right-1 top-1/2 flex -translate-y-1/2 scale-75 flex-col">
									<button
										type="button"
										aria-label="Increase salary"
										onclick={() => stepSalary('up')}
										class="hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
									>
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
										</svg>
									</button>
									<button
										type="button"
										aria-label="Decrease salary"
										onclick={() => stepSalary('down')}
										class="hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
									>
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>

				</div>
			</div>

			<!-- Step 2: Time Leak Audit -->
			<div class="overflow-hidden rounded-3xl border-none bg-white shadow-xl ring-1 ring-slate-200">
				<div class="space-y-2 border-b border-red-50 bg-red-50/30 px-6 py-4">
					<h3 class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600">
						<svg class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Step 2. Identify Your Time Leaks
					</h3>
					<p class="text-[11px] font-medium leading-relaxed text-slate-500">
						Estimate where work slows down due to repetitive tasks, context switching, and manual handoffs. We'll roll it up into a total Manual Tax you can reclaim with AI agents and automation.
					</p>
				</div>
				<div class="space-y-6 p-6">
					<div class="space-y-2 rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
						<p class="text-[10px] font-black uppercase tracking-tight text-red-600">Total Manual Tax (rolled up)</p>
						<p class="text-[11px] font-bold leading-snug text-red-800">
							That's <span class="font-black text-slate-900">{formatHours(results.hoursPerPersonPerWeek)} hours per person per week</span>, or <span class="font-black text-slate-900">{formatHours(results.totalTeamHoursPerWeek)} total team hours</span>, which you can redirect into higher-value work once agents reduce this overhead.
						</p>
					</div>

					<div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
						<!-- Repetitive Tasks -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="repetitive-tasks" class="flex items-center gap-1 text-[9px] font-black uppercase text-slate-500">
									Repetitive Tasks
								</label>
								<span class="font-mono text-xs font-black text-red-600">{repetitiveTasks}%</span>
							</div>
							<input
								type="range"
								id="repetitive-tasks"
								bind:value={repetitiveTasks}
								min="0"
								max="40"
								step="1"
								class="w-full accent-red-600"
							/>
						</div>

						<!-- Focus Loss -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="focus-loss" class="flex items-center gap-1 text-[9px] font-black uppercase text-slate-500">
									Focus Loss
								</label>
								<span class="font-mono text-xs font-black text-red-600">{focusLoss}%</span>
							</div>
							<input
								type="range"
								id="focus-loss"
								bind:value={focusLoss}
								min="0"
								max="40"
								step="1"
								class="w-full accent-red-600"
							/>
						</div>

						<!-- Manual Research -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="manual-research" class="flex items-center gap-1 text-[9px] font-black uppercase text-slate-500">
									Manual Research
								</label>
								<span class="font-mono text-xs font-black text-red-600">{manualResearch}%</span>
							</div>
							<input
								type="range"
								id="manual-research"
								bind:value={manualResearch}
								min="0"
								max="40"
								step="1"
								class="w-full accent-red-600"
							/>
						</div>

						<!-- Manual Handoffs -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="manual-handoffs" class="flex items-center gap-1 text-[9px] font-black uppercase text-slate-500">
									Manual Handoffs
								</label>
								<span class="font-mono text-xs font-black text-red-600">{manualHandoffs}%</span>
							</div>
							<input
								type="range"
								id="manual-handoffs"
								bind:value={manualHandoffs}
								min="0"
								max="40"
								step="1"
								class="w-full accent-red-600"
							/>
						</div>
					</div>

				</div>
			</div>
		</div>

		<!-- RIGHT COLUMN: Results -->
		<div class="flex flex-col space-y-6 lg:col-span-7">
			<div class="flex flex-1 flex-col overflow-hidden rounded-3xl border-none bg-white shadow-xl ring-1 ring-slate-200">
				<div class="space-y-1 border-b border-slate-50 px-8 py-3">
					<div class="flex items-center justify-between">
						<h3 class="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-slate-800">
							<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
							</svg>
							Your Agentic Impact Scoreboard
						</h3>
					</div>
					<p class="max-w-2xl text-[11px] font-medium leading-snug text-slate-500">
						AI agents and automation are the lever that cut Manual Tax. Training is how you deploy them safely and fast.
					</p>
				</div>
				<div class="flex-1 space-y-6 px-8 pb-8 pt-2">
					<!-- Transformation Bars -->
					<div class="space-y-4">
						<!-- Current Bar -->
						<div class="space-y-1">
							<div class="flex items-end justify-between">
								<span class="text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">Today’s Manual Tax</span>
								<div class="rounded-full bg-red-50 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-red-600">
									{results.manualTaxPercentage.toFixed(0)}% Overhead
								</div>
							</div>
							<div class="flex h-8 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
								<div
									class="flex h-full items-center justify-center bg-red-500"
									style="width: {results.currentDistribution.overhead}%"
								></div>
								<div class="flex flex-1"></div>
							</div>
							<div class="mt-2 flex flex-wrap items-center gap-3 text-[9px] font-semibold uppercase tracking-widest text-slate-400">
								<div class="flex items-center gap-1.5">
									<span class="h-2 w-2 rounded-full bg-red-500"></span>
									Overhead
								</div>
								<div class="flex items-center gap-1.5">
									<span class="h-2 w-2 rounded-full bg-slate-300"></span>
									High-Value Work
								</div>
							</div>
							<p class="text-[9px] italic leading-tight text-slate-400">
								This is the friction AI agents are built to absorb.
							</p>
						</div>

						<div class="flex items-center justify-center gap-3 py-1">
							<div class="h-px w-full max-w-[80px] bg-slate-100"></div>
							<svg class="h-3.5 w-3.5 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							<div class="h-px w-full max-w-[80px] bg-slate-100"></div>
						</div>

						<!-- Future Bar -->
						<div class="space-y-2">
							<div class="flex items-end justify-between">
								<span class="text-[10px] font-black uppercase leading-none tracking-widest text-slate-900">With AI Agents in Place</span>
								<div class="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-blue-600">
									<span>{results.futureDistribution.highValue.toFixed(0)}% High-Value Work</span>
									<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
									</svg>
								</div>
							</div>
							<div class="flex h-10 w-full overflow-hidden rounded-xl border-2 border-blue-100 bg-slate-100 p-0.5 shadow-inner">
								<div
									class="flex h-full items-center justify-center rounded-l-lg border-r border-white/20 bg-red-200 transition-all duration-500"
									style="width: {results.futureDistribution.remainingOverhead}%"
								></div>
								<div
									class="flex h-full items-center justify-center border-r border-white/20 bg-blue-300 transition-all duration-500"
									style="width: {results.futureDistribution.reclaimed}%"
								></div>
								<div class="flex h-full flex-1 items-center justify-between rounded-r-lg bg-blue-600 px-4 text-white transition-all duration-500"></div>
							</div>
							<div class="mt-2 flex flex-wrap items-center gap-3 text-[9px] font-semibold uppercase tracking-widest text-slate-400">
								<div class="flex items-center gap-1.5">
									<span class="h-2 w-2 rounded-full bg-red-200"></span>
									Overhead
								</div>
								<div class="flex items-center gap-1.5">
									<span class="h-2 w-2 rounded-full bg-blue-300"></span>
									Reclaimed Work
								</div>
								<div class="flex items-center gap-1.5">
									<span class="h-2 w-2 rounded-full bg-blue-600"></span>
									<span class="flex items-center gap-1">
										High-Value Work
										<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
										</svg>
									</span>
								</div>
							</div>
							<p class="text-left text-[9px] italic leading-none text-slate-400">Overhead shrinks. Capacity returns to real work.</p>
						</div>
					</div>

					<!-- Metrics Grid -->
					<div class="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
						<div class="space-y-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
							<p class="text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">Capacity Unlocked</p>
							<p class="pt-2 font-mono text-[clamp(20px,4vw,30px)] font-black leading-none tracking-tight text-slate-900">
								{Math.round(results.timeReclaimedAnnual).toLocaleString()} <span class="font-sans text-sm font-bold lowercase">hours</span>
							</p>
							<p class="mt-1 text-[9px] font-bold uppercase leading-tight tracking-tighter text-slate-500">Hours of Reclaimed Work Per Year</p>
							<p class="pt-2 text-[9px] italic leading-tight text-slate-400">
								Time your team gets back when agents take the handoffs, retries, and repeat work.
							</p>
						</div>

						<div class="space-y-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
							<p class="text-[10px] font-black uppercase leading-none tracking-widest text-slate-400">Business Impact</p>
							<p class="pt-2 font-mono text-[clamp(20px,4vw,30px)] font-black leading-none tracking-tight text-slate-900">
								{formatCurrency(results.valueReclaimedAnnual)}
							</p>
							<p class="mt-1 text-[9px] font-bold uppercase leading-tight tracking-tighter text-slate-500">Conservative Annual Value</p>
							<p class="mt-1 text-[9px] font-black tracking-tight text-blue-600">
								≈ {formatCurrency(results.valueReclaimedMonthly)}/month
							</p>
							<p class="pt-2 text-[9px] italic leading-tight text-slate-400">
								Conservative value of reclaimed work hours at your salary benchmark.
							</p>
						</div>
					</div>

					<div class="relative overflow-hidden rounded-3xl border border-blue-100 bg-blue-50/60 p-6">
						<div class="absolute left-0 top-0 h-full w-1.5 bg-blue-500/20"></div>
						<div class="flex items-start gap-3">
							<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div class="space-y-1">
								<p class="text-xs font-black uppercase tracking-widest text-blue-700">First Agent Live in ~10 Business Days</p>
								<p class="text-xs leading-relaxed text-blue-900/80">
									After finishing the AI Automation with Agents training, participants have built a working AI agent in the course. Most people go on to design and launch more agents within about 10 business days, using the methods and tools they learned in the course.
								</p>
								<p class="text-[10px] font-semibold text-blue-700/80">This timeline reflects real-world application, not experimentation.</p>
							</div>
						</div>
					</div>

					<details class="text-center text-[8px] uppercase tracking-widest text-slate-400">
						<summary class="cursor-pointer text-slate-400 opacity-60">How this is calculated</summary>
						<p class="mt-2 text-[8px] uppercase tracking-widest text-slate-400 opacity-60">
							Assumes productive capacity of 1,850 hours per person per year, a 40% agentic efficiency rule, and your selected salary benchmark.
						</p>
					</details>
				</div>
			</div>

			<!-- Next Actions -->
			<div class="space-y-4">
				<div class="px-2">
					<h3 class="flex items-center gap-2 text-lg font-black text-slate-900">
						Next Actions
					</h3>
					<p class="mt-1 text-xs font-medium leading-relaxed text-slate-500">
						You've quantified the Manual Tax. Here are two quick ways to move this toward implementation and approval.
					</p>
				</div>

				<div class="grid gap-6 sm:grid-cols-2">
					<!-- CTA Card -->
					<div class="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
						<div class="absolute -mr-16 -mt-16 right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl"></div>
						<h3 class="mb-4 text-xl font-black leading-tight">Build workflows that reclaim this time</h3>
						<p class="mb-6 text-xs leading-relaxed text-slate-400">
							Learn how to create and deploy AI agents and automations that reduce overhead, protect focus, and deliver real business outcomes, with governance and adoption built in.
						</p>
						<div class="space-y-4">
							<a
								href="/training/ai-automation-with-agents"
								onclick={trackCTAClick}
								class="flex w-full items-center justify-center rounded-2xl border-b-4 border-blue-800 bg-blue-600 px-6 py-6 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-500 active:border-b-0"
							>
								Enroll in AI Automation with Agents
								<svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
								</svg>
							</a>
							<a
								href="/training/ai-automation-with-agents"
								class="flex w-full items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white"
							>
								View the curriculum
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
							</a>
						</div>
					</div>

					<!-- Copy Email Card -->
					<div class="overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 shadow-inner">
						<div class="flex flex-row items-center justify-between border-b border-slate-200/50 px-6 py-3">
							<h4 class="flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-slate-800">
								<svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Get Approval (Copy/Paste)
							</h4>
							<button
								type="button"
								onclick={copyEmailTemplate}
								class="flex h-8 items-center rounded-full border border-slate-200 bg-white px-4 text-[9px] font-black uppercase tracking-widest shadow-sm transition-all hover:bg-blue-600 hover:text-white"
							>
								{#if copied}
									<svg class="mr-2 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									Copied
								{:else}
									<svg class="mr-2 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
									Copy
								{/if}
							</button>
						</div>
						<div class="flex flex-wrap items-center justify-between gap-2 px-6 pt-2 text-[10px] font-medium text-slate-500">
							<a
								href={managerPitchMailto}
								class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
							>
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7m18-4V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3m18 0l-9 6-9-6" />
								</svg>
								Open Email Draft
							</a>
						</div>
						<p class="mt-1 px-6 text-[10px] font-medium text-slate-500">
							Use this message to move forward with training.
						</p>
						<div class="p-4">
							<div class="scrollbar-thin h-44 overflow-y-auto whitespace-pre-line rounded-2xl border border-slate-200 bg-white p-4 font-mono text-[10px] leading-relaxed text-slate-500 shadow-inner">
								{managerPitchWithSubject}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Smooth transitions */
	input[type='range'] {
		cursor: pointer;
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		opacity: 0;
	}
</style>
