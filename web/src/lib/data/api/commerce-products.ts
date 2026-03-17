import type { Event } from '$lib/data/events/types';
import { isEventUpcoming, listEvents } from '$lib/data/events';
import type { FaqBlock, FaqItem } from '$lib/data/faq/types';
import { listTestimonialsForSku } from '$lib/data/testimonials';
import { listTrainingPrograms } from '$lib/data/training';
import type { TrainingProgram, TrainingStat } from '$lib/data/training/types';

type BuildCommerceProductsApiPayloadInput = {
	origin: string;
	generatedAt?: string;
	now?: Date;
};

type CommerceSourceType = 'program' | 'cohort';
type CommerceBoolean = 'true' | 'false';
type CommerceAvailability = 'in_stock' | 'out_of_stock' | 'pre_order' | 'backorder' | 'unknown';

export type CommerceProductItem = {
	sourceType: CommerceSourceType;
	sourceId: string;
	is_eligible_search: CommerceBoolean;
	is_eligible_checkout: CommerceBoolean;
	item_id: string;
	title: string;
	description: string;
	url: string;
	brand: string;
	image_url: string;
	price: string;
	availability: CommerceAvailability;
	group_id: string;
	listing_has_variations: CommerceBoolean;
	seller_name: string;
	seller_url: string;
	return_policy: string;
	target_countries: string[];
	store_country: string;
	condition?: string;
	product_category?: string;
	material?: string;
	age_group?: 'adult';
	additional_image_urls?: string;
	video_url?: string;
	variant_dict?: Record<string, string>;
	offer_id?: string;
	is_digital?: CommerceBoolean;
	seller_privacy_policy?: string;
	seller_tos?: string;
	accepts_returns?: CommerceBoolean;
	accepts_exchanges?: CommerceBoolean;
	review_count?: number;
	star_rating?: number;
	store_review_count?: number;
	store_star_rating?: number;
	q_and_a?: Array<{ q: string; a: string }>;
	reviews?: Array<{
		title: string;
		content: string;
		minRating: 1;
		maxRating: 5;
		rating: number;
	}>;
	related_product_id?: string;
	relationship_type?: string;
};

export type CommerceProductsApiPayload = {
	generatedAt: string;
	format: 'openai-commerce-v1';
	itemCount: number;
	items: CommerceProductItem[];
};

const BRAND = 'Cambermast';
const SELLER_NAME = 'Cambermast LLC';
const PRODUCT_CATEGORY = 'Education & Training > AI Training';
const DEFAULT_TARGET_COUNTRIES = ['US'];
const DEFAULT_STORE_COUNTRY = 'US';

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const toAbsoluteUrl = (value: string | undefined, origin: string): string | undefined => {
	if (!value) return undefined;
	if (isAbsoluteUrl(value)) return value;
	if (value.startsWith('/')) return `${origin}${value}`;
	return undefined;
};

const stripHtml = (value: string): string =>
	value
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const clampText = (value: string, maxLength: number): string => {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
};

const flattenFaqBlock = (block: FaqBlock): string | null => {
	if (block.type === 'paragraph') return block.text;
	if (block.type === 'link') return `${block.label}: ${block.href}`;
	if (block.type === 'email_template') return `${block.subject}\n${block.body}`;
	return null;
};

const toQa = (faqs: FaqItem[] | undefined): Array<{ q: string; a: string }> | undefined => {
	const items = (faqs ?? [])
		.map((faq) => {
			const answer = faq.blocks
				.map(flattenFaqBlock)
				.filter((value): value is string => Boolean(value))
				.join('\n\n')
				.trim();
			if (!answer) return null;
			return {
				q: clampText(stripHtml(faq.question), 300),
				a: clampText(stripHtml(answer), 1500)
			};
		})
		.filter((entry): entry is { q: string; a: string } => Boolean(entry));
	return items.length > 0 ? items.slice(0, 12) : undefined;
};

const toReviews = (sku?: string) => {
	const testimonials = listTestimonialsForSku(sku).filter((testimonial) => testimonial.allowPublicUse);
	if (testimonials.length === 0) return {};

	const reviews = testimonials.slice(0, 10).map((testimonial) => ({
		title: testimonial.jobTitle
			? `${testimonial.displayName} - ${testimonial.jobTitle}`
			: testimonial.displayName,
		content: clampText(stripHtml(testimonial.quote), 1200),
		minRating: 1 as const,
		maxRating: 5 as const,
		rating: testimonial.rating
	}));

	const total = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
	const average = Number((total / testimonials.length).toFixed(1));

	return {
		reviews,
		review_count: testimonials.length,
		star_rating: average,
		store_review_count: testimonials.length,
		store_star_rating: average
	};
};

const parseUsdFromText = (value: string): number | null => {
	const match = value.match(/\$([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)/);
	if (!match) return null;
	const numeric = Number(match[1].replace(/,/g, ''));
	return Number.isFinite(numeric) ? numeric : null;
};

const formatUsd = (amount: number): string => `${amount.toFixed(2)} USD`;

const getCostValue = (stats: TrainingStat[] | undefined): number | null => {
	const stat = (stats ?? []).find((entry) => entry.label.trim().toLowerCase() === 'cost');
	if (!stat) return null;
	const rawValue = Array.isArray(stat.value) ? stat.value.join(' ') : stat.value;
	return parseUsdFromText(rawValue);
};

const programHasCheckoutReadyCohort = (sku?: string, now: Date = new Date()): boolean => {
	if (!sku) return false;
	return listEvents({ includeDrafts: false, includeUnlisted: false }).some(
		(event) =>
			event.type === 'training_session' &&
			event.programRef?.sku === sku &&
			isCheckoutEligibleCohort(event, now)
	);
};

const getProgramImageUrl = (program: TrainingProgram, origin: string): string | undefined =>
	toAbsoluteUrl(program.heroImage ?? program.catalog?.image ?? program.ogImage, origin);

const buildProgramDescription = (program: TrainingProgram): string => {
	const parts = [
		program.description,
		program.secondaryDescription,
		program.tagline,
		(program.objectives ?? []).slice(0, 3).join(' '),
		(program.takeaways ?? []).slice(0, 3).join(' ')
	].filter(Boolean);
	return clampText(stripHtml(parts.join(' ')), 5000);
};

const isCheckoutEligibleCohort = (event: Event, now: Date = new Date()): boolean => {
	if (event.type !== 'training_session') return false;
	if (!isEventUpcoming(event, now, { includeDrafts: false, includeUnlisted: false }, now.getTime())) {
		return false;
	}
	if (!event.programRef?.sku) return false;
	if (!(event.registrationStatus === 'open' || event.registrationStatus === 'external')) return false;
	if (!event.ticketing?.amountUsd) return false;
	const ctaUrl = event.cta?.url?.trim();
	return Boolean(ctaUrl && /^https?:\/\//i.test(ctaUrl));
};

const buildProgramItem = (
	program: TrainingProgram,
	origin: string,
	now: Date = new Date()
): CommerceProductItem | null => {
	if (!program.sku) return null;
	const imageUrl = getProgramImageUrl(program, origin);
	const priceAmount = getCostValue(program.stats);
	if (!imageUrl || priceAmount === null) return null;

	const reviewsMeta = toReviews(program.sku);
	const hasVariations = programHasCheckoutReadyCohort(program.sku, now);

	return {
		sourceType: 'program',
		sourceId: program.slug,
		is_eligible_search: 'true',
		is_eligible_checkout: 'false',
		item_id: program.sku,
		title: clampText(program.title, 150),
		description: buildProgramDescription(program),
		url: `${origin}${program.route}`,
		brand: BRAND,
		condition: 'new',
		product_category: PRODUCT_CATEGORY,
		material: 'Live instructor-led digital training',
		age_group: 'adult',
		image_url: imageUrl,
		price: formatUsd(priceAmount),
		availability: 'unknown',
		group_id: program.sku,
		listing_has_variations: hasVariations ? 'true' : 'false',
		variant_dict: hasVariations ? { delivery: 'program' } : undefined,
		offer_id: `${program.sku}-${priceAmount.toFixed(2)}`,
		is_digital: 'true',
		seller_name: SELLER_NAME,
		seller_url: origin,
		seller_privacy_policy: `${origin}/gdpr`,
		seller_tos: `${origin}/training/terms`,
		accepts_returns: 'true',
		accepts_exchanges: 'true',
		return_policy: `${origin}/training/terms`,
		q_and_a: toQa(program.faqs),
		video_url: toAbsoluteUrl(program.videoUrl, origin),
		target_countries: DEFAULT_TARGET_COUNTRIES,
		store_country: DEFAULT_STORE_COUNTRY,
		...reviewsMeta
	};
};

const buildCohortDescription = (event: Event, program: TrainingProgram | undefined): string => {
	const parts = [
		event.summary,
		typeof event.description === 'string' ? event.description : event.description?.summary,
		event.tagline,
		program?.description,
		(event.highlights ?? []).slice(0, 4).join(' '),
		(event.outcomes ?? []).slice(0, 4).join(' ')
	].filter(Boolean);
	return clampText(stripHtml(parts.join(' ')), 5000);
};

const buildCohortItem = (
	event: Event,
	program: TrainingProgram | undefined,
	origin: string,
	now: Date = new Date()
): CommerceProductItem | null => {
	if (!program?.sku || !isCheckoutEligibleCohort(event, now) || !event.ticketing?.amountUsd) {
		return null;
	}

	const imageUrl = toAbsoluteUrl(event.heroImage ?? event.image ?? program.heroImage, origin);
	const productUrl = toAbsoluteUrl(event.cta?.url ?? `${origin}/events/${event.slug}`, origin);
	if (!imageUrl || !productUrl) return null;

	const reviewsMeta = toReviews(program.sku);

	return {
		sourceType: 'cohort',
		sourceId: event.id,
		is_eligible_search: 'true',
		is_eligible_checkout: 'true',
		item_id: `${program.sku}--${event.id}`,
		title: clampText(event.title, 150),
		description: buildCohortDescription(event, program),
		url: productUrl,
		brand: BRAND,
		condition: 'new',
		product_category: PRODUCT_CATEGORY,
		material: 'Live instructor-led digital training cohort',
		age_group: 'adult',
		image_url: imageUrl,
		price: formatUsd(event.ticketing.amountUsd),
		availability: 'in_stock',
		group_id: program.sku,
		listing_has_variations: 'true',
		variant_dict: {
			delivery: 'cohort',
			start_date: event.sessions[0]?.startAtUtc?.slice(0, 10) ?? event.startAtUtc.slice(0, 10)
		},
		offer_id: `${program.sku}-${event.id}-${event.ticketing.amountUsd.toFixed(2)}`,
		is_digital: 'true',
		seller_name: SELLER_NAME,
		seller_url: origin,
		seller_privacy_policy: `${origin}/gdpr`,
		seller_tos: `${origin}/training/terms`,
		accepts_returns: 'true',
		accepts_exchanges: 'true',
		return_policy: `${origin}/training/terms`,
		q_and_a: toQa(event.faq ?? program.faqs),
		related_product_id: program.sku,
		relationship_type: 'variant',
		video_url: toAbsoluteUrl(event.videoUrl ?? program.videoUrl, origin),
		target_countries: DEFAULT_TARGET_COUNTRIES,
		store_country: DEFAULT_STORE_COUNTRY,
		...reviewsMeta
	};
};

const sortItems = (items: CommerceProductItem[]): CommerceProductItem[] =>
	[...items].sort((a, b) => {
		if (a.sourceType !== b.sourceType) return a.sourceType === 'program' ? -1 : 1;
		return a.item_id.localeCompare(b.item_id);
	});

export const buildCommerceProductsApiPayload = ({
	origin,
	generatedAt,
	now = new Date()
}: BuildCommerceProductsApiPayloadInput): CommerceProductsApiPayload => {
	const programs = listTrainingPrograms({ includeDrafts: false });
	const programBySku = new Map(programs.map((program) => [program.sku, program] as const));
	const programItems = programs
		.map((program) => buildProgramItem(program, origin, now))
		.filter((item): item is CommerceProductItem => Boolean(item));

	const cohortItems = listEvents({ includeDrafts: false, includeUnlisted: false })
		.filter((event) => event.type === 'training_session')
		.map((event) => buildCohortItem(event, programBySku.get(event.programRef?.sku), origin, now))
		.filter((item): item is CommerceProductItem => Boolean(item));

	const items = sortItems([...programItems, ...cohortItems]);

	return {
		generatedAt: generatedAt ?? new Date().toISOString(),
		format: 'openai-commerce-v1',
		itemCount: items.length,
		items
	};
};

export const buildCommerceProductsApiExamples = (origin: string) => {
	const payload = buildCommerceProductsApiPayload({
		origin,
		generatedAt: '2026-03-17T12:00:00.000Z',
		now: new Date('2026-03-17T12:00:00.000Z')
	});
	const exampleItems = payload.items.slice(0, Math.min(2, payload.items.length));
	return {
		response: payload,
		example: {
			generatedAt: payload.generatedAt,
			format: payload.format,
			itemCount: exampleItems.length,
			items: exampleItems
		}
	};
};

export const serializeCommerceProductsJsonl = (items: CommerceProductItem[]): string =>
	items.map((item) => JSON.stringify(item)).join('\n');
