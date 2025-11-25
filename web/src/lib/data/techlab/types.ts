import type { TrainingProgram } from '../training/types';

// TechLAB uses the same shape as the main Cambermast training programs,
// but data lives in a separate namespace so updates don't leak between sites.
export type TechlabProgram = TrainingProgram;
