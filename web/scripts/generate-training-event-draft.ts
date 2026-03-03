import {
	buildTrainingDraftScheduleFromProgramSku
} from '../src/lib/data/events/training-event-builder';
import { getPartnerByCode } from '../src/lib/data/partners';
import { getTrainingProgramBySku } from '../src/lib/data/training';
import {
	BASE36_ID_PATTERN,
	SLUG_PATTERN,
	buildTrainingDraftArtifacts
} from '../src/lib/server/admin-event-drafts';
import crypto from 'node:crypto';

type CliOptions = {
	programSku?: string;
	startDate?: string;
	startTimeLocal?: string;
	durationDays?: number;
	hoursPerDayCommitment?: number;
	id?: string;
	campaignId?: string;
	slug?: string;
	subtitle?: string;
	overwrite?: boolean;
	noSlugSuffix?: boolean;
};

const printUsage = (): void => {
	console.error(
		[
			'Usage:',
			'  npm --prefix web run events:draft -- \\',
			'    --program-sku CM-TR-005 \\',
			'    --start-date 2026-03-17 \\',
			'    [--id 7iu8p4] \\',
			'    [--campaign-id 7iu8p4] \\',
			'    --slug ai-workshop-for-tech-writers-and-content-creators-spring-2026 \\',
			"    [--subtitle '🌷 Spring 2026 Cohort'] \\",
			'    [--start-time 10:00] \\',
			'    [--duration-days 49] \\',
			'    [--hours-per-day 2] \\',
			'    [--overwrite] \\',
			'    [--no-slug-suffix]',
			'',
			'Notes:',
			'  - By default, the generated event slug is suffixed with "-<campaignId>" to prevent accidental overwrites.',
			'  - The script refuses to generate an event/campaign that collides with existing IDs or slugs unless --overwrite is passed.',
			'  - Use --no-slug-suffix only when you intentionally want a non-suffixed slug (not recommended).'
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
			case '--campaign-id':
				options.campaignId = next;
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
			case '--overwrite':
				options.overwrite = true;
				break;
			case '--no-slug-suffix':
				options.noSlugSuffix = true;
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

const BASE36_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

const createBase36Id = (): string => {
	const bytes = crypto.randomBytes(6);
	let value = '';
	for (const byte of bytes) {
		value += BASE36_ALPHABET[byte % 36];
	}
	return value;
};

const toFallbackSlug = (programTitle: string, startDate: string): string => {
	const normalizedTitle = programTitle
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `${normalizedTitle}-${startDate}`;
};

const ensureSlugSuffix = (slug: string, suffixId: string): string => {
	const suffix = `-${suffixId}`;
	return slug.endsWith(suffix) ? slug : `${slug}${suffix}`;
};

const createDefaultSubtitle = (input: {
	startAtUtc: string;
	timeZone: string;
	timeZoneLabel: string;
}): string => {
	const start = new Date(input.startAtUtc);
	const dateText = new Intl.DateTimeFormat('en-US', {
		timeZone: input.timeZone,
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(start);
	const timeText = new Intl.DateTimeFormat('en-US', {
		timeZone: input.timeZone,
		hour: 'numeric',
		minute: '2-digit'
	}).format(start);
	return `${dateText} • ${timeText} ${input.timeZoneLabel}`;
};

const run = async (): Promise<void> => {
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

	const eventId = (options.id ?? createBase36Id()).trim();
	if (!BASE36_ID_PATTERN.test(eventId)) {
		throw new Error(`--id must be a 6-char base36 string (^[a-z0-9]{6}$). Got "${eventId}".`);
	}

	const campaignId = (options.campaignId ?? eventId).trim();
	if (!BASE36_ID_PATTERN.test(campaignId)) {
		throw new Error(
			`--campaign-id must be a 6-char base36 string (^[a-z0-9]{6}$). Got "${campaignId}".`
		);
	}

	const baseSlug = (options.slug ?? toFallbackSlug(program.title, startDate)).trim();
	if (!SLUG_PATTERN.test(baseSlug)) {
		throw new Error(
			`--slug must be lowercase and URL-safe (^[a-z0-9]+(?:-[a-z0-9]+)*$). Got "${baseSlug}".`
		);
	}

	const finalSlug = options.noSlugSuffix ? baseSlug : ensureSlugSuffix(baseSlug, campaignId);
	if (!SLUG_PATTERN.test(finalSlug)) {
		throw new Error(
			`Generated slug is not URL-safe (^[a-z0-9]+(?:-[a-z0-9]+)*$). Got "${finalSlug}".`
		);
	}

	const scheduleDraft = buildTrainingDraftScheduleFromProgramSku({
		programSku,
		startDate,
		startTimeLocal: options.startTimeLocal,
		durationDays: options.durationDays,
		estimatedHoursCommitment: options.hoursPerDayCommitment
	});
	const { eventDraft: draftEvent, campaignDraft } = await buildTrainingDraftArtifacts({
		programSku,
		startDate,
		id: eventId,
		campaignId,
		slug: finalSlug,
		subtitle:
			options.subtitle ??
			createDefaultSubtitle({
				startAtUtc: scheduleDraft.startAtUtc,
				timeZone: program.scheduleTemplate?.defaultTimeZone ?? 'America/Los_Angeles',
				timeZoneLabel: program.scheduleTemplate?.defaultTimeZoneLabel ?? 'PT'
			}),
		startTimeLocal: options.startTimeLocal,
		durationDays: options.durationDays,
		estimatedHoursCommitment: options.hoursPerDayCommitment,
		overwrite: options.overwrite
	});

	const primaryPartnerCode = draftEvent.partners?.[0]?.code;
	const partner = getPartnerByCode(primaryPartnerCode);
	const campaignPartnerSlug =
		partner && partner.slug !== 'none'
			? partner.slug
			: (getPartnerByCode('CMB')?.slug ?? 'cambermast');
	const campaignPartnerLabel =
		partner && partner.slug !== 'none'
			? partner.name
			: (getPartnerByCode('CMB')?.name ?? 'Cambermast');

	const draftCampaign = campaignDraft ?? {
		id: campaignId,
		partner: campaignPartnerSlug,
		partnerLabel: campaignPartnerLabel,
		landingPath: `/events/${draftEvent.slug}`,
		description: `Campaign short link for the ${draftEvent.title} event page.`,
		createdAt: new Date().toISOString(),
		params: {
			utm_source: 'qr',
			utm_medium: 'offline',
			utm_campaign: 'events',
			utm_content: campaignId,
			src: 'qr',
			ad: campaignPartnerSlug
		}
	};

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
				draftEvent,
				draftCampaign
			},
			null,
			2
		)}\n`
	);
};

run().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
