import type { EventSource } from './types';
import type { TrainingProgram } from '$lib/data/training/types';

export const toTrainingEventAgenda = (
	agenda: TrainingProgram['agenda']
): EventSource['agenda'] | undefined => {
	if (!(agenda && agenda.length > 0)) return undefined;

	return agenda.map((block) => ({
		title: block.title,
		...(block.details?.length ? { details: block.details } : {})
	}));
};
