import {
	buildTrainingDraftScheduleFromProgramSku,
	buildTrainingSessionEventFromProgramSku
} from '../src/lib/data/events/training-event-builder';
import { getTrainingProgramBySku } from '../src/lib/data/training';

type CliOptions = {
	programSku?: string;
	startDate?: string;
	startTimeLocal?: string;
	durationDays?: number;
	hoursPerDayCommitment?: number;
	id?: string;
	slug?: string;
	subtitle?: string;
};

const printUsage = (): void => {
	console.error(
		[
			'Usage:',
			'  npm --prefix web run events:draft -- \\',
			'    --program-sku CM-TR-005 \\',
			'    --start-date 2026-03-17 \\',
			'    --id evt_20260317_1000_training_session_NONE \\',
			'    --slug ai-workshop-for-tech-writers-and-content-creators-spring-2026 \\',
			"    [--subtitle '🌷 Spring 2026 Cohort'] \\",
			'    [--start-time 10:00] \\',
			'    [--duration-days 49] \\',
			'    [--hours-per-day 2]'
		].join('\n')
	);
};

const parseArgs = (argv: string[]): CliOptions => {
	const options: CliOptions = {};

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		const next = argv[i + 1];
		if (!token.startsWith('--')) continue;

		switch (token) {
			case '--program-sku':
				options.programSku = next;
				i += 1;
				break;
			case '--start-date':
				options.startDate = next;
				i += 1;
				break;
			case '--start-time':
				options.startTimeLocal = next;
				i += 1;
				break;
			case '--duration-days':
				options.durationDays = Number.parseInt(next ?? '', 10);
				i += 1;
				break;
			case '--hours-per-day':
				options.hoursPerDayCommitment = Number.parseFloat(next ?? '');
				i += 1;
				break;
			case '--id':
				options.id = next;
				i += 1;
				break;
			case '--slug':
				options.slug = next;
				i += 1;
				break;
			case '--subtitle':
				options.subtitle = next;
				i += 1;
				break;
			case '--help':
				printUsage();
				process.exit(0);
			default:
				throw new Error(`Unknown argument: ${token}`);
		}
	}

	return options;
};

const toFallbackEventId = (programSku: string, startDate: string): string => {
	const compactDate = startDate.replace(/-/g, '');
	return `evt_${compactDate}_1000_training_session_NONE_${programSku.replace(/[^A-Z0-9]/g, '')}`;
};

const toFallbackSlug = (programTitle: string, startDate: string): string => {
	const normalizedTitle = programTitle
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `${normalizedTitle}-${startDate}`;
};

const run = (): void => {
	const options = parseArgs(process.argv.slice(2));
	const programSku = options.programSku?.trim();
	const startDate = options.startDate?.trim();

	if (!programSku || !startDate) {
		printUsage();
		throw new Error('--program-sku and --start-date are required.');
	}

	const program = getTrainingProgramBySku(programSku);
	if (!program) {
		throw new Error(`No training program found for SKU "${programSku}".`);
	}

	const scheduleDraft = buildTrainingDraftScheduleFromProgramSku({
		programSku,
		startDate,
		startTimeLocal: options.startTimeLocal,
		durationDays: options.durationDays,
		estimatedHoursCommitment: options.hoursPerDayCommitment
	});

	const draftEvent = buildTrainingSessionEventFromProgramSku({
		programSku,
		id: options.id ?? toFallbackEventId(programSku, startDate),
		slug: options.slug ?? toFallbackSlug(program.title, startDate),
		startDate,
		startTimeLocal: options.startTimeLocal,
		durationDays: options.durationDays,
		estimatedHoursCommitment: options.hoursPerDayCommitment,
		subtitle: options.subtitle
	});

	process.stdout.write(
		`${JSON.stringify(
			{
				program: {
					sku: program.sku,
					title: program.title,
					route: program.route,
					scheduleTemplate: program.scheduleTemplate
				},
				scheduleDraft,
				draftEvent
			},
			null,
			2
		)}\n`
	);
};

run();
