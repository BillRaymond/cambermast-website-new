import fs from 'node:fs/promises';
import path from 'node:path';
import { lumaPublishRegistryPath } from '$lib/server/data-paths';

export type LumaReviewStatus = 'private_created' | 'reviewed' | 'live_linked';
export type LumaRunOutcome = 'success' | 'failed';

export type LumaPublishRecord = {
	eventId: string;
	privateCreatedAt?: string;
	privateManageUrl?: string;
	publicUrl?: string;
	reviewStatus?: LumaReviewStatus;
	lastRunAt?: string;
	lastRunStartedAt?: string;
	lastRunFinishedAt?: string;
	lastRunOutcome?: LumaRunOutcome;
	lastError?: string;
	lastArtifactDir?: string;
};

export type LumaPublishRegistry = {
	records: LumaPublishRecord[];
};

const toJsonString = (value: unknown): string => `${JSON.stringify(value, null, '\t')}\n`;

const normalizeRecord = (value: unknown): LumaPublishRecord | null => {
	if (!value || typeof value !== 'object') return null;

	const candidate = value as Record<string, unknown>;
	const eventId = typeof candidate.eventId === 'string' ? candidate.eventId.trim() : '';
	if (!eventId) return null;

	const optionalString = (key: keyof LumaPublishRecord): string | undefined => {
		const raw = candidate[key];
		return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
	};

	const reviewStatus = optionalString('reviewStatus');
	const lastRunOutcome = optionalString('lastRunOutcome');

	return {
		eventId,
		privateCreatedAt: optionalString('privateCreatedAt'),
		privateManageUrl: optionalString('privateManageUrl'),
		publicUrl: optionalString('publicUrl'),
		reviewStatus:
			reviewStatus === 'private_created' ||
			reviewStatus === 'reviewed' ||
			reviewStatus === 'live_linked'
				? reviewStatus
				: undefined,
		lastRunAt: optionalString('lastRunAt'),
		lastRunStartedAt: optionalString('lastRunStartedAt'),
		lastRunFinishedAt: optionalString('lastRunFinishedAt'),
		lastRunOutcome:
			lastRunOutcome === 'success' || lastRunOutcome === 'failed' ? lastRunOutcome : undefined,
		lastError: optionalString('lastError'),
		lastArtifactDir: optionalString('lastArtifactDir')
	};
};

const isLumaPublishRecord = (value: LumaPublishRecord | null): value is LumaPublishRecord =>
	Boolean(value);

export const readLumaPublishRegistryFromDisk = async (): Promise<LumaPublishRegistry> => {
	try {
		const raw = await fs.readFile(lumaPublishRegistryPath, 'utf-8');
		const parsed = JSON.parse(raw) as { records?: unknown[] };
		return {
			records: Array.isArray(parsed.records)
				? parsed.records.map(normalizeRecord).filter(isLumaPublishRecord)
				: []
		};
	} catch (error) {
		const nodeError = error as NodeJS.ErrnoException;
		if (nodeError?.code === 'ENOENT') return { records: [] };
		throw error;
	}
};

export const writeLumaPublishRegistryToDisk = async (
	registry: LumaPublishRegistry
): Promise<void> => {
	const nextRegistry: LumaPublishRegistry = {
		records: [...registry.records].sort((a, b) => a.eventId.localeCompare(b.eventId))
	};
	await fs.mkdir(path.dirname(lumaPublishRegistryPath), { recursive: true });
	await fs.writeFile(lumaPublishRegistryPath, toJsonString(nextRegistry), 'utf-8');
};

export const getLumaPublishRecord = (
	registry: LumaPublishRegistry,
	eventId: string
): LumaPublishRecord | undefined => registry.records.find((record) => record.eventId === eventId);

export const upsertLumaPublishRecord = (
	registry: LumaPublishRegistry,
	record: LumaPublishRecord
): LumaPublishRegistry => {
	const records = registry.records.filter((entry) => entry.eventId !== record.eventId);
	records.push(record);
	return { records };
};
