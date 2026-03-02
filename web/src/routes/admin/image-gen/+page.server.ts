import { dev } from '$app/environment';
import {
	DEFAULT_LANDSCAPE_PROMPT,
	DEFAULT_PORTRAIT_PROMPT,
	DEFAULT_SQUARE_PROMPT,
	DEFAULT_TEMPLATE_URL,
	IMAGE_GEN_DEFAULT_COUNT,
	IMAGE_GEN_MAX_COUNT,
	IMAGE_GEN_MIN_COUNT
} from '$lib/server/image-gen/types';

import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async () => {
	return {
		isDev: dev,
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
