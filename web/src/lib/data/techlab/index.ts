import type { TechlabProgram } from './types';

import { techlabAiFundamentals } from './ai-fundamentals';
import { techlabAiAcceleratorWorkshop } from './ai-accelerator-workshop';
import { techlabAiAdvancedWorkshop } from './ai-advanced-workshop';
import { techlabAiAutomationWithAgents } from './ai-automation-with-agents';
import { techlabAiWorkshopForContentCreators } from './ai-workshop-for-content-creators';
import { techlabAiPowerPromptingDraft } from './ai-power-prompting-draft';

const techlabAllPrograms: TechlabProgram[] = [
	techlabAiFundamentals,
	techlabAiAcceleratorWorkshop,
	techlabAiAdvancedWorkshop,
	techlabAiAutomationWithAgents,
	techlabAiWorkshopForContentCreators,
	techlabAiPowerPromptingDraft
];

const techlabPublishedPrograms: TechlabProgram[] = techlabAllPrograms.filter((program) => !program.draft);

export const techlabPrograms: Record<string, TechlabProgram> = techlabAllPrograms.reduce(
	(acc, program) => {
		acc[program.slug] = program;
		return acc;
	},
	{} as Record<string, TechlabProgram>
);

type ListTechlabProgramsOptions = {
	includeDrafts?: boolean;
};

export const listTechlabPrograms = (
	options: ListTechlabProgramsOptions = {}
): TechlabProgram[] => {
	const { includeDrafts = false } = options;
	return includeDrafts ? [...techlabAllPrograms] : [...techlabPublishedPrograms];
};

export const getTechlabProgram = (slug: string): TechlabProgram | undefined => techlabPrograms[slug];
