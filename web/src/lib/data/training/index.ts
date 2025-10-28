import type { TrainingProgram } from './types';

import { aiFundamentals } from './ai-fundamentals';
import { aiAcceleratorWorkshop } from './ai-accelerator-workshop';
import { aiAdvancedWorkshop } from './ai-advanced-workshop';
import { aiAutomationWithAgents } from './ai-automation-with-agents';
import { aiWorkshopForContentCreators } from './ai-workshop-for-content-creators';

const allPrograms: TrainingProgram[] = [
	aiFundamentals,
	aiAcceleratorWorkshop,
	aiAdvancedWorkshop,
	aiAutomationWithAgents,
	aiWorkshopForContentCreators
];

const publishedPrograms: TrainingProgram[] = allPrograms.filter((program) => !program.draft);

export const trainingPrograms: Record<string, TrainingProgram> = allPrograms.reduce(
	(acc, program) => {
		acc[program.slug] = program;
		return acc;
	},
	{} as Record<string, TrainingProgram>
);

type ListTrainingProgramsOptions = {
	includeDrafts?: boolean;
};

export const listTrainingPrograms = (
	options: ListTrainingProgramsOptions = {}
): TrainingProgram[] => {
	const { includeDrafts = false } = options;
	return includeDrafts ? [...allPrograms] : [...publishedPrograms];
};

export const getTrainingProgram = (slug: string): TrainingProgram | undefined =>
	trainingPrograms[slug];
