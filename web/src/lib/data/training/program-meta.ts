import type { TrainingProgram, TrainingStat } from './types';

const normalizeLabel = (label?: string): string | undefined => label?.toLowerCase().trim();

export const findProgramStat = (
	program: TrainingProgram | undefined,
	match: string
): TrainingStat | undefined =>
	program?.stats?.find((stat) => normalizeLabel(stat.label) === normalizeLabel(match));

export const statValueToText = (value?: string | string[]): string | undefined =>
	Array.isArray(value) ? value.join(', ') : value;

export const getProgramCertificateText = (program?: TrainingProgram): string | undefined =>
	statValueToText(findProgramStat(program, 'certificate')?.value);
