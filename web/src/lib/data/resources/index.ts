import resourcesRegistryData from './resources.json';
import { runtimeDev } from '$lib/utils/runtime-env';
import type { ResourceEntry, ResourcesRegistry } from './types';

const resourcesRegistry = resourcesRegistryData as ResourcesRegistry;
const allResources = resourcesRegistry.resources ?? [];
const publishedResources = allResources.filter((resource) => !resource.draft);

type ListResourcesOptions = {
	includeDrafts?: boolean;
};

export const listResources = (options: ListResourcesOptions = {}): ResourceEntry[] => {
	const { includeDrafts = runtimeDev } = options;
	return (includeDrafts ? allResources : publishedResources).slice().sort((a, b) => {
		return new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf();
	});
};

export const getResource = (slug: string, options: ListResourcesOptions = {}): ResourceEntry | undefined =>
	listResources(options).find((resource) => resource.slug === slug);
