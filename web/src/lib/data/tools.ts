export type ToolInfo = {
	slug: string;
	title: string;
	summary: string;
	valueProps: string[];
	outputs: string[];
	audience: string[];
	howItWorks: string[];
	methodology: string[];
	assumptions: string[];
	privacyNote: string;
	faqs: { question: string; answer: string }[];
	relatedTraining: { title: string; description: string; href: string }[];
	lastUpdated: string;
	secondaryCta?: { label: string; url: string };
};

export const tools: ToolInfo[] = [
	{
		slug: 'ai-roi-calculator',
		title: 'AI Role ROI Calculator',
		summary:
			'An interactive calculator that estimates role-level AI impact, payback, and training value from real workflows.',
		valueProps: [
			'Translate workflow improvements into time, cost, and quality impact.',
			'Create a manager-ready ROI snapshot to support training investment.',
			'Prioritize the roles and teams where AI training moves the needle fastest.'
		],
		outputs: [
			'Role ROI snapshot with time, cost, and quality lift ranges',
			'Payback timeline and break-even estimate',
			'Training recommendation summary for stakeholders'
		],
		audience: [
			'Operations leaders sizing the ROI of AI training for a team.',
			'Enablement or L&D leads prioritizing roles for upskilling.',
			'Team leads who need a quick, defensible training justification.'
		],
		howItWorks: [
			'Pick the role, core workflows, and the tasks AI will support.',
			'Estimate time saved, quality lift, and adoption speed with guided prompts.',
			'Review an ROI snapshot and payback range you can share with stakeholders.'
		],
		methodology: [
			'Uses a task-level impact model with time savings and quality uplift factors.',
			'Applies conservative adoption curves based on training and coaching velocity.',
			'Converts improvements into financial impact using loaded labor rates.'
		],
		assumptions: [
			'Inputs are directional and based on self-reported task frequency.',
			'ROI ranges assume steady adoption after training completion.',
			'Quality gains are translated into rework reduction and cycle-time improvements.'
		],
		privacyNote:
			'Inputs stay in your browser and are not stored. Use high-level data if you are working with sensitive metrics.',
		faqs: [
			{
				question: 'Is this a finance-grade ROI model?',
				answer:
					'No. It provides directional ranges so you can prioritize training investments before running a full finance review.'
			},
			{
				question: 'What if we do not know exact time savings yet?',
				answer:
					'The calculator provides guided ranges and benchmark prompts so you can start with defensible estimates.'
			},
			{
				question: 'Can I use this for multiple roles?',
				answer:
					'Yes. Run it once per role to compare impact and prioritize training rollout sequencing.'
			},
			{
				question: 'Does this replace a business case?',
				answer:
					'It is designed to accelerate the early-stage business case and prepare you for deeper analysis.'
			}
		],
		relatedTraining: [
			{
				title: 'AI Power Prompting',
				description: 'Build confident prompting habits that lead to measurable time savings.',
				href: '/training/ai-fundamentals'
			},
			{
				title: 'AI Accelerator Workshop',
				description: 'Apply AI to core workflows and quantify operational impact.',
				href: '/training/ai-accelerator-workshop'
			},
			{
				title: 'AI Automation with Agents',
				description: 'Scale ROI with automations, guardrails, and workflow orchestration.',
				href: '/training/ai-automation-with-agents'
			}
		],
		lastUpdated: 'March 8, 2025',
		secondaryCta: {
			label: 'See advisory',
			url: '/strategy'
		}
	},
	{
		slug: 'ai-readiness-assessment',
		title: 'AI Readiness Assessment',
		summary:
			'An assessment that baselines team AI readiness across skills, workflows, and governance before you invest.',
		valueProps: [
			'Identify where adoption will stall before it becomes a costly surprise.',
			'Align stakeholders on the training, tooling, and policy moves that matter.',
			'Create a shared readiness scorecard for leadership updates.'
		],
		outputs: [
			'Readiness scorecard across people, process, and tooling',
			'Skill gap and risk map with priority actions',
			'90-day readiness plan tied to training and enablement'
		],
		audience: [
			'Operations leaders planning AI enablement for cross-functional teams.',
			'L&D and enablement leads mapping training readiness.',
			'Team leads who need a clear baseline before selecting tools.'
		],
		howItWorks: [
			'Answer guided questions about workflows, skills, and current AI usage.',
			'Review a readiness scorecard with risk and opportunity indicators.',
			'Walk away with a prioritized action plan you can assign internally.'
		],
		methodology: [
			'Uses a maturity model across people, process, data, and tooling pillars.',
			'Flags governance and change-management gaps that slow adoption.',
			'Weights responses to highlight the blockers that matter most.'
		],
		assumptions: [
			'Assessment inputs are self-reported and directional.',
			'Readiness scores reflect current-state adoption, not future potential.',
			'Recommendations assume a blended training + coaching rollout.'
		],
		privacyNote:
			'Responses are not stored. Avoid entering confidential metrics or names.',
		faqs: [
			{
				question: 'How long does the assessment take?',
				answer:
					'Most teams finish in under 10 minutes, depending on how much detail you add.'
			},
			{
				question: 'Can we use this for a single department?',
				answer:
					'Yes. It works for individual teams or entire business units.'
			},
			{
				question: 'Does it cover governance and policy?',
				answer:
					'Yes. The readiness model includes governance, risk, and change-management prompts.'
			},
			{
				question: 'What is the next step after the scorecard?',
				answer:
					'Use the 90-day plan to align training, tooling, and workflow experiments.'
			}
		],
		relatedTraining: [
			{
				title: 'AI Power Prompting',
				description: 'Establish AI fundamentals before scaling adoption.',
				href: '/training/ai-fundamentals'
			},
			{
				title: 'AI Advanced Workshop',
				description: 'Move beyond basics with multi-tool workflows and systems thinking.',
				href: '/training/ai-advanced-workshop'
			},
			{
				title: 'AI Accelerator Workshop',
				description: 'Apply AI to operational workflows with structured coaching.',
				href: '/training/ai-accelerator-workshop'
			}
		],
		lastUpdated: 'March 8, 2025',
		secondaryCta: {
			label: 'Contact us',
			url: '/contact'
		}
	},
	{
		slug: 'ai-automation-skills',
		title: 'AI Automation Skills Map',
		summary: 'Map the skills and tool fluency required to build reliable AI automations.',
		valueProps: [
			'Break down automation work into core skills, from prompts to orchestration.',
			'Pinpoint which integrations, APIs, and workflow tools you must master.',
			'Turn skill gaps into a role-specific learning plan.'
		],
		outputs: ['Automation skills checklist', 'Tool fluency map', '90-day learning plan'],
		audience: [
			'Ops and automation leads defining a skills roadmap.',
			'Enablement teams supporting automation builders.',
			'Team leads assigning automation work to new contributors.'
		],
		howItWorks: [
			'Choose the automation outcomes you need to deliver.',
			'Rate current capability across prompts, APIs, and orchestration.',
			'Get a prioritized skills roadmap with training matches.'
		],
		methodology: [
			'Maps automation delivery into prompt, data, and orchestration competencies.',
			'Aligns skills with n8n-style workflow patterns and tooling basics.',
			'Highlights gaps that block reliable automation shipping.'
		],
		assumptions: [
			'Skills are evaluated through self-assessment prompts.',
			'Recommendations assume a mix of practice and coaching.',
			'Roadmaps prioritize reliability and maintainability over speed alone.'
		],
		privacyNote:
			'No inputs are stored and no automation details are shared externally.',
		faqs: [
			{
				question: 'Is this only for automation engineers?',
				answer:
					'No. It helps ops, enablement, and technical teams align on shared automation skills.'
			},
			{
				question: 'Does it include tool recommendations?',
				answer:
					'It focuses on skill readiness first, with optional tool guidance based on your workflows.'
			},
			{
				question: 'Can we use this for hiring?',
				answer:
					'Yes. Use the skills map to align role expectations and onboarding plans.'
			}
		],
		relatedTraining: [
			{
				title: 'AI Automation with Agents',
				description: 'Design automations with guardrails and real-world workflows.',
				href: '/training/ai-automation-with-agents'
			},
			{
				title: 'AI Accelerator Workshop',
				description: 'Ship automations faster with structured guidance.',
				href: '/training/ai-accelerator-workshop'
			},
			{
				title: 'AI Advanced Workshop',
				description: 'Level up multi-step workflows and automation design.',
				href: '/training/ai-advanced-workshop'
			}
		],
		lastUpdated: 'March 8, 2025',
		secondaryCta: {
			label: 'See advisory',
			url: '/strategy'
		}
	},
	{
		slug: 'ai-tool-comparison',
		title: 'AI Tool Fit Comparison',
		summary:
			'A comparison wizard to rank AI tools by workflow fit, learning curve, and adoption readiness before you commit.',
		valueProps: [
			'Compare tools against the workflows your teams actually deliver.',
			'Balance capability, usability, and training lift in one view.',
			'Build a defendable shortlist aligned to readiness and budget.'
		],
		outputs: ['Role-fit tool shortlist', 'Learning curve comparison', 'Adoption risk notes'],
		audience: [
			'Ops leaders evaluating AI tools for functional teams.',
			'Enablement leaders aligning tool choice with training.',
			'Team leads comparing tools for a specific workflow.'
		],
		howItWorks: [
			'Select the workflow category and the roles involved.',
			'Score tools across capability, effort, and adoption criteria.',
			'Review a ranked shortlist with adoption notes and next steps.'
		],
		methodology: [
			'Uses a weighted decision model tuned for workflow fit.',
			'Balances capability depth with onboarding and support requirements.',
			'Highlights adoption risks based on change-management load.'
		],
		assumptions: [
			'Tool scores rely on user-provided criteria and priorities.',
			'Shortlists are directional and should be validated with pilots.',
			'Recommendations assume you are pairing tools with training.'
		],
		privacyNote:
			'Tool comparisons are not stored. Keep vendor pricing and contract data high level.',
		faqs: [
			{
				question: 'Does this include every AI tool on the market?',
				answer:
					'No. It is designed for the tools you are already evaluating so you can compare them consistently.'
			},
			{
				question: 'Can we compare different tool categories?',
				answer:
					'Yes. You can run separate comparisons for chatbots, copilots, or automation platforms.'
			},
			{
				question: 'Should we replace a formal procurement review?',
				answer:
					'It complements procurement by clarifying fit and adoption readiness before deeper diligence.'
			}
		],
		relatedTraining: [
			{
				title: 'AI Power Prompting',
				description: 'Give teams the baseline skills to evaluate tool fit quickly.',
				href: '/training/ai-fundamentals'
			},
			{
				title: 'AI Advanced Workshop',
				description: 'Deepen tool fluency so teams can make informed selections.',
				href: '/training/ai-advanced-workshop'
			},
			{
				title: 'AI Accelerator Workshop',
				description: 'Pair tool selection with hands-on workflow experiments.',
				href: '/training/ai-accelerator-workshop'
			}
		],
		lastUpdated: 'March 8, 2025',
		secondaryCta: {
			label: 'Contact us',
			url: '/contact'
		}
	}
];
