import faqPresetsData from './faq-presets.json';
import type { FaqPreset, FaqPresetRegistry } from '$lib/data/faq/types';

const registry = faqPresetsData as FaqPresetRegistry;
const allPresets = registry.presets ?? [];

export const listFaqPresets = (): FaqPreset[] => [...allPresets];

export const getFaqPreset = (id: string): FaqPreset | undefined =>
	allPresets.find((preset) => preset.id === id);

export const getFaqPresetItemsSnapshot = (id: string) => {
	const preset = getFaqPreset(id);
	if (!preset) return undefined;
	return JSON.parse(JSON.stringify(preset.items));
};
