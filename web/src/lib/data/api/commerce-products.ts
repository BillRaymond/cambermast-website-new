import type { Event } from '$lib/data/events/types';
import { isEventUpcoming, listEvents } from '$lib/data/events';
import type { FaqBlock, FaqItem } from '$lib/data/faq/types';
import { getLandscapeImageUrl } from '$lib/data/image-contract';
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
type CommerceRating = string;
type CommerceRelationshipType =
	| 'part_of_set'
	| 'required_part'
	| 'often_bought_with'
	| 'substitute'
	| 'different_brand'
	| 'accessory';

export type CommerceProductItem = {
	sourceType: CommerceSourceType;
	sourceId: string;
	is_eligible_search: CommerceBoolean;
	is_eligible_checkout: CommerceBoolean;
	item_id: string;
	gtin?: string;
	mpn?: string;
	title: string;
	description: string;
	url: string;
	brand: string;
	dimensions?: string;
	length?: string;
	width?: string;
	height?: string;
	dimensions_unit?: string;
	weight?: string;
	item_weight_unit?: string;
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
	star_rating?: CommerceRating;
	store_review_count?: number;
	store_star_rating?: CommerceRating;
	item_group_title?: string;
	model_3d_url?: string;
	sale_price?: string;
	sale_price_start_date?: string;
	sale_price_end_date?: string;
	unit_pricing_measure?: string;
	base_measure?: string;
	pricing_trend?: string;
	availability_date?: string;
	expiration_date?: string;
	pickup_method?: 'in_store' | 'reserve' | 'not_supported';
	pickup_sla?: string;
	color?: string;
	size?: string;
	size_system?: string;
	gender?: string;
	custom_variant1_category?: string;
	custom_variant1_option?: string;
	custom_variant2_category?: string;
	custom_variant2_option?: string;
	custom_variant3_category?: string;
	custom_variant3_option?: string;
	shipping?: string;
	marketplace_seller?: string;
	return_deadline_in_days?: number;
	popularity_score?: number;
	return_rate?: number;
	warning?: string;
	warning_url?: string;
	age_restriction?: number;
	q_and_a?: Array<{ q: string; a: string }>;
	reviews?: Array<{
		title: string;
		content: string;
		minRating: 1;
		maxRating: 5;
		rating: number;
	}>;
	related_product_id?: string;
	relationship_type?: CommerceRelationshipType;
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
	const testimonials = listTestimonialsForSku(sku).filter(
		(testimonial) => testimonial.allowPublicUse
	);
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
	const averageString = average.toFixed(2);

	return {
		reviews,
		review_count: testimonials.length,
		star_rating: averageString,
		store_review_count: testimonials.length,
		store_star_rating: averageString
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
	toAbsoluteUrl(getLandscapeImageUrl(program.images), origin);

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
	if (
		!isEventUpcoming(event, now, { includeDrafts: false, includeUnlisted: false }, now.getTime())
	) {
		return false;
	}
	if (!event.programRef?.sku) return false;
	if (!(event.registrationStatus === 'open' || event.registrationStatus === 'external'))
		return false;
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
		item_group_title: hasVariations ? clampText(program.title, 150) : undefined,
		offer_id: `${program.sku}-${priceAmount.toFixed(2)}`,
		is_digital: 'true',
		seller_name: SELLER_NAME,
		seller_url: origin,
		seller_privacy_policy: `${origin}/gdpr`,
		seller_tos: `${origin}/training/terms`,
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

	const imageUrl = toAbsoluteUrl(
		getLandscapeImageUrl(event.images) ?? getLandscapeImageUrl(program.images),
		origin
	);
	const productUrl = `${origin}/events/${event.slug}`;
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
		item_group_title: clampText(program.title, 150),
		variant_dict: {
			start_date: event.sessions[0]?.startAtUtc?.slice(0, 10) ?? event.startAtUtc.slice(0, 10)
		},
		offer_id: `${program.sku}-${event.id}-${event.ticketing.amountUsd.toFixed(2)}`,
		is_digital: 'true',
		seller_name: SELLER_NAME,
		seller_url: origin,
		seller_privacy_policy: `${origin}/gdpr`,
		seller_tos: `${origin}/training/terms`,
		return_policy: `${origin}/training/terms`,
		q_and_a: toQa(event.faq ?? program.faqs),
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

export const OPENAI_COMMERCE_FEED_FIELDS = new Set<keyof CommerceProductItem>([
	'is_eligible_search',
	'is_eligible_checkout',
	'item_id',
	'gtin',
	'mpn',
	'title',
	'description',
	'url',
	'brand',
	'condition',
	'product_category',
	'material',
	'age_group',
	'image_url',
	'additional_image_urls',
	'video_url',
	'model_3d_url',
	'price',
	'sale_price',
	'sale_price_start_date',
	'sale_price_end_date',
	'unit_pricing_measure',
	'base_measure',
	'pricing_trend',
	'availability',
	'availability_date',
	'expiration_date',
	'pickup_method',
	'pickup_sla',
	'group_id',
	'listing_has_variations',
	'variant_dict',
	'item_group_title',
	'color',
	'size',
	'size_system',
	'gender',
	'offer_id',
	'custom_variant1_category',
	'custom_variant1_option',
	'custom_variant2_category',
	'custom_variant2_option',
	'custom_variant3_category',
	'custom_variant3_option',
	'shipping',
	'is_digital',
	'seller_name',
	'marketplace_seller',
	'seller_url',
	'seller_privacy_policy',
	'seller_tos',
	'accepts_returns',
	'return_deadline_in_days',
	'accepts_exchanges',
	'return_policy',
	'popularity_score',
	'return_rate',
	'warning',
	'warning_url',
	'age_restriction',
	'review_count',
	'star_rating',
	'store_review_count',
	'store_star_rating',
	'q_and_a',
	'reviews',
	'related_product_id',
	'relationship_type',
	'target_countries',
	'store_country'
]);

export const toOpenAiCommerceFeedItem = (item: CommerceProductItem): Record<string, unknown> =>
	Object.fromEntries(
		Object.entries(item).filter(
			([key, value]) =>
				OPENAI_COMMERCE_FEED_FIELDS.has(key as keyof CommerceProductItem) && value !== undefined
		)
	);

export const serializeCommerceProductsJsonl = (items: CommerceProductItem[]): string =>
	items.map((item) => JSON.stringify(toOpenAiCommerceFeedItem(item))).join('\n');
