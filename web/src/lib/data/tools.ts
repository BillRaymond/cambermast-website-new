import toolsData from './tools.json';

export interface Tool {
	id: string;
	title: string;
	description: string;
	route: string;
	icon: string;
	category: string;
	status: 'active' | 'beta' | 'coming-soon';
	features: string[];
	publishedDate: string;
}

/**
 * Get all published tools
 */
export function listTools(): Tool[] {
	return toolsData as Tool[];
}

/**
 * Get a single tool by ID
 */
export function getToolById(id: string): Tool | undefined {
	return toolsData.find((tool: any) => tool.id === id) as Tool | undefined;
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: string): Tool[] {
	return toolsData.filter((tool: any) => tool.category === category) as Tool[];
}

/**
 * Get all unique categories
 */
export function getToolCategories(): string[] {
	const categories = new Set(toolsData.map((tool: any) => tool.category));
	return Array.from(categories);
}
