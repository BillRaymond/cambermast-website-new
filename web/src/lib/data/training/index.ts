import type { TrainingProgram } from './types';

import { aiAutomationWithAgents } from './ai-automation-with-agents';
import { aiFundamentals } from './ai-fundamentals';
import { aiAdvancedWorkshop } from './ai-advanced-workshop';
import { aiAcceleratorWorkshop } from './ai-accelerator-workshop';

const allPrograms: TrainingProgram[] = [
	aiFundamentals,
	aiAcceleratorWorkshop,
	aiAdvancedWorkshop,
	aiAutomationWithAgents
];

export const trainingPrograms: Record<string, TrainingProgram> = allPrograms.reduce(
	(acc, program) => {
		acc[program.slug] = program;
		return acc;
	},
	{} as Record<string, TrainingProgram>
);

export const listTrainingPrograms = (): TrainingProgram[] => [...allPrograms];

export const getTrainingProgram = (slug: string): TrainingProgram | undefined =>
	trainingPrograms[slug];
