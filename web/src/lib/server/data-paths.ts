import path from 'node:path';
import { existsSync } from 'node:fs';

const resolveWebRoot = (): string => {
	const cwd = process.cwd();
	const direct = path.join(cwd, 'src', 'lib', 'data');
	const nested = path.join(cwd, 'web', 'src', 'lib', 'data');
	if (existsSync(direct)) return cwd;
	if (existsSync(nested)) return path.join(cwd, 'web');
	return cwd;
};

export const webRoot = resolveWebRoot();

export const eventsPath = path.join(webRoot, 'src', 'lib', 'data', 'events', 'events.json');
export const eventsSchemaPath = path.join(
	webRoot,
	'src',
	'lib',
	'data',
	'events',
	'events.schema.json'
);
export const campaignsPath = path.join(webRoot, 'src', 'lib', 'data', 'campaigns.json');
export const campaignsSchemaPath = path.join(
	webRoot,
	'src',
	'lib',
	'data',
	'campaigns.schema.json'
);
