import trainingRegistryData from './training.json';
import { dev } from '$app/environment';
import type { TrainingProgram, TrainingRegistry } from './types';

const trainingRegistry = trainingRegistryData as TrainingRegistry;
const allPrograms: TrainingProgram[] = trainingRegistry.programs ?? [];
const publishedPrograms: TrainingProgram[] = allPrograms.filter((program) => !program.draft);

export const trainingPrograms: Record<string, TrainingProgram> = allPrograms.reduce(
	(acc, program) => {
		acc[program.slug] = program;
		return acc;
	},
	{} as Record<string, TrainingProgram>
);

export const trainingProgramsBySku: Record<string, TrainingProgram> = allPrograms.reduce(
	(acc, program) => {
		if (program.sku) {
			acc[program.sku] = program;
		}
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
	const { includeDrafts = dev } = options;
	return includeDrafts ? [...allPrograms] : [...publishedPrograms];
};

export const getTrainingProgram = (slug: string): TrainingProgram | undefined =>
	trainingPrograms[slug];

export const getTrainingProgramBySku = (sku: string): TrainingProgram | undefined =>
	trainingProgramsBySku[sku];
