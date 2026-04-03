import type { TrainingProgram, TrainingStat } from './types';
import { getImageAlt, getLandscapeImageUrl, getSquareImageUrl } from '$lib/data/image-contract';

const normalizeLabel = (label?: string): string | undefined => label?.toLowerCase().trim();

const getStat = (stats: TrainingStat[] | undefined, label: string): TrainingStat | undefined =>
	stats?.find((stat) => normalizeLabel(stat.label) === normalizeLabel(label));

const statValueToArray = (value?: string | string[]): string[] =>
	!value ? [] : Array.isArray(value) ? value : [value];

const statValueToText = (value?: string | string[]): string =>
	statValueToArray(value).join(', ');

const cleanStatText = (value: string): string =>
	value.replace(/^[^\p{L}\p{N}$]+/u, '').trim();

const trimList = (items: string[] | undefined, maxItems: number): string[] =>
	(items ?? [])
		.map((item) => item.trim())
		.filter(Boolean)
		.slice(0, maxItems);

const trimAgenda = (
	agenda: TrainingProgram['agenda'],
	maxDetailsPerSection: number
) =>
	(agenda ?? []).map((block) => ({
		title: block.title,
		details: trimList(block.details, maxDetailsPerSection)
	}));

export const getTrainingPrintUrl = (program: TrainingProgram): string =>
	`${program.route ?? `/training/${program.slug}`}/print`;

export const getTrainingPdfUrl = (program: TrainingProgram): string =>
	`/downloads/training/${program.slug}.pdf`;

export const hasTrainingPdf = (program: TrainingProgram): boolean =>
	!program.draft && (program.catalog?.published ?? true);

const getTrainingBrochureImage = (program: TrainingProgram): string | undefined =>
	getSquareImageUrl(program.images) ?? getLandscapeImageUrl(program.images);

export type TrainingBrochureModel = {
	slug: string;
	title: string;
	tagline: string;
	nickname?: string;
	partnershipLabel?: string;
	sku?: string;
	route: string;
	printUrl: string;
	pdfUrl: string;
	heroImage?: string;
	heroImageAlt?: string;
	summary: string;
	secondarySummary?: string;
	stats: {
		duration?: string;
		format: string[];
		cost?: string;
		certificate?: string;
		environment?: string;
		partner?: string;
	};
	audience: string[];
	audienceExamples: string[];
	outcomes: string[];
	takeaways: string[];
	agenda: Array<{
		title: string;
		details: string[];
	}>;
	trainer?: {
		title: string;
		name: string;
		role: string;
		summary: string;
		photo?: string;
		photoAlt?: string;
		highlights: string[];
	};
};

export const buildTrainingBrochureModel = (program: TrainingProgram): TrainingBrochureModel => ({
	slug: program.slug,
	title: program.title,
	tagline: program.tagline,
	nickname: program.nickname,
	partnershipLabel: program.presentation?.partnershipLabel,
	sku: program.sku,
	route: program.route ?? `/training/${program.slug}`,
	printUrl: getTrainingPrintUrl(program),
	pdfUrl: getTrainingPdfUrl(program),
	heroImage: getTrainingBrochureImage(program),
	heroImageAlt: getImageAlt(program.images) ?? program.title,
	summary: program.description,
	secondarySummary: program.secondaryDescription,
	stats: {
		duration: cleanStatText(statValueToText(getStat(program.stats, 'duration')?.value)) || undefined,
		format: statValueToArray(getStat(program.stats, 'format')?.value).map(cleanStatText),
		cost: cleanStatText(statValueToText(getStat(program.stats, 'cost')?.value)) || undefined,
		certificate:
			cleanStatText(statValueToText(getStat(program.stats, 'certificate')?.value)) || undefined,
		environment:
			cleanStatText(statValueToText(getStat(program.stats, 'environment')?.value)) || undefined,
		partner: cleanStatText(statValueToText(getStat(program.stats, 'partner')?.value)) || undefined
	},
	audience: trimList(program.audience, 4),
	audienceExamples: trimList(program.audienceExamples, 4),
	outcomes: trimList(program.objectives, 5),
	takeaways: trimList(program.takeaways, 5),
	agenda: trimAgenda(program.agenda, 3),
	trainer: program.aboutTrainer
		? {
				title: program.aboutTrainer.title,
				name: program.aboutTrainer.name,
				role: program.aboutTrainer.role,
				summary: program.aboutTrainer.summary,
				photo: program.aboutTrainer.photo,
				photoAlt: program.aboutTrainer.photoAlt ?? program.aboutTrainer.name,
				highlights: trimList(program.aboutTrainer.highlights, 4)
			}
		: undefined
});
