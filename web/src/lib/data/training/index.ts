import trainingRegistryData from './training.json';
import { runtimeDev } from '$lib/utils/runtime-env';
import type { TrainingProgram, TrainingRegistry } from './types';
import { getFaqPreset } from '$lib/data/faq-presets';

const trainingRegistry = trainingRegistryData as TrainingRegistry;
const cloneFaqs = (faqs: TrainingProgram['faqs']): TrainingProgram['faqs'] =>
	faqs ? JSON.parse(JSON.stringify(faqs)) : [];

const normalizeQuestion = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();

const mergeFaqs = (programFaqs: TrainingProgram['faqs']): TrainingProgram['faqs'] => {
	const presetFaqs = cloneFaqs(getFaqPreset('training-signup-core-v1')?.items);
	const merged = new Map<string, NonNullable<TrainingProgram['faqs']>[number]>();
	const presetQuestions = new Set<string>();
	for (const faq of presetFaqs ?? []) {
		merged.set(faq.key, faq);
		presetQuestions.add(normalizeQuestion(faq.question));
	}
	for (const faq of cloneFaqs(programFaqs) ?? []) {
		if (presetQuestions.has(normalizeQuestion(faq.question))) continue;
		merged.set(faq.key, faq);
	}
	return Array.from(merged.values());
};

const allPrograms: TrainingProgram[] = (trainingRegistry.programs ?? []).map((program) => ({
	...program,
	faqs: mergeFaqs(program.faqs)
}));
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
	const { includeDrafts = runtimeDev } = options;
	return includeDrafts ? [...allPrograms] : [...publishedPrograms];
};

export const getTrainingProgram = (slug: string): TrainingProgram | undefined =>
	trainingPrograms[slug];

export const getTrainingProgramBySku = (sku: string): TrainingProgram | undefined =>
	trainingProgramsBySku[sku];
