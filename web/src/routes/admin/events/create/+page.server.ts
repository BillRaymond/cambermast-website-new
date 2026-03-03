import { dev } from '$app/environment';
import { SITE_ORIGIN } from '$lib/config/site';
import { getFaqPreset } from '$lib/data/faq-presets';
import { listPartners } from '$lib/data/partners';
import { listTrainingPrograms } from '$lib/data/training';
import { toTrainingEventAgenda } from '$lib/data/events/agenda';
import { listCampaignUi } from '$lib/view-models/campaigns';
import { listEventUi } from '$lib/view-models/events';
import {
	DEFAULT_LANDSCAPE_PROMPT,
	DEFAULT_PORTRAIT_PROMPT,
	DEFAULT_SQUARE_PROMPT,
	DEFAULT_TEMPLATE_URL,
	IMAGE_GEN_DEFAULT_COUNT,
	IMAGE_GEN_MAX_COUNT,
	IMAGE_GEN_MIN_COUNT
} from '$lib/server/image-gen/types';
import { getDraftPageDefaults } from '$lib/server/admin-event-drafts';
import type { PageServerLoad } from './$types';

export const prerender = false;
const origin = SITE_ORIGIN.replace(/\/$/, '');

export const load: PageServerLoad = async () => {
	const defaults = getDraftPageDefaults();
	const trainingPrograms = listTrainingPrograms({ includeDrafts: true })
		.filter((program) => Boolean(program.sku))
		.map((program) => ({
			sku: program.sku,
			title: program.title,
			slug: program.slug,
			route: program.route,
			draft: Boolean(program.draft),
			tagline: program.tagline,
			description: program.description,
			scheduleTemplate: program.scheduleTemplate,
			objectives: program.objectives ?? [],
			takeaways: program.takeaways ?? [],
			audience: program.audience ?? [],
			agenda: toTrainingEventAgenda(program.agenda) ?? [],
			faqs: program.faqs ?? [],
			heroImage: program.heroImage,
			heroImageAlt: program.heroImageAlt,
			ogImage: program.ogImage,
			ogImageAlt: program.ogImageAlt,
			eventDefaults: program.eventDefaults
		}))
		.sort((a, b) => (a.sku ?? '').localeCompare(b.sku ?? ''));
	const eventFaqDefaults = (getFaqPreset('event-signup-core-v1')?.items ?? []).map((item) => ({
		key: item.key,
		question: item.question
	}));

	const existingEvents = listEventUi({ includeDrafts: true, includeUnlisted: true })
		.map((event) => ({
			id: event.id,
			slug: event.slug,
			title: event.title,
			type: event.type,
			typeLabel: event.typeLabel,
			subtitle: event.subtitle,
			tagline: event.tagline,
			summary: event.summary,
			description: event.description,
			highlights: event.highlights ?? [],
			audienceBullets: event.audienceBullets ?? [],
			outcomes: event.outcomes ?? [],
			agenda: event.agenda ?? [],
			faq: event.faq ?? [],
			visibility: event.visibility,
			lifecycleStatus: event.lifecycleStatus,
			registrationStatus: event.registrationStatus,
			cta: event.cta,
			locationMeta: event.locationMeta,
			sessions: event.sessions,
			partners: event.partners ?? [],
			programRef: event.programRef,
			schedule: event.schedule,
			campaignId: event.campaignId,
			heroImage: event.heroImage,
			heroImageAlt: event.heroImageAlt,
			image: event.image,
			imageAlt: event.imageAlt
		}))
		.sort((a, b) => a.title.localeCompare(b.title));

	const partners = listPartners()
		.filter((partner) => partner.code !== 'NONE')
		.map((partner) => ({ code: partner.code, name: partner.name }));
	const existingCampaignOptions = listCampaignUi(origin)
		.map((campaign) => ({
			id: campaign.id,
			label: campaign.description?.trim() || campaign.landingPath
		}))
		.sort((a, b) => a.id.localeCompare(b.id));

	return {
		isDev: dev,
		defaults,
		trainingPrograms,
		partners,
		eventFaqDefaults,
		existingEvents,
		existingCampaignIds: existingCampaignOptions.map((campaign) => campaign.id),
		existingCampaignOptions,
		defaultTemplateUrl: DEFAULT_TEMPLATE_URL,
		defaultPrompts: {
			square: DEFAULT_SQUARE_PROMPT,
			landscape: DEFAULT_LANDSCAPE_PROMPT,
			portrait: DEFAULT_PORTRAIT_PROMPT
		},
		defaultN: IMAGE_GEN_DEFAULT_COUNT,
		minN: IMAGE_GEN_MIN_COUNT,
		maxN: IMAGE_GEN_MAX_COUNT
	};
};
