import { dev } from '$app/environment';
import { fail } from '@sveltejs/kit';
import { buildAdminEventLumaEntries } from '$lib/view-models/admin-event-luma';
import { listEventUi } from '$lib/view-models/events';
import {
	attachLiveLumaUrlToEvent,
	createPrivateLumaEvent,
	deriveLumaPublishStatus,
	getEventForLumaWorkflow,
	getLumaRuntimeConfig
} from '$lib/server/luma-publish-workflow';
import {
	getLumaPublishRecord,
	readLumaPublishRegistryFromDisk,
	upsertLumaPublishRecord,
	writeLumaPublishRegistryToDisk
} from '$lib/server/luma-publish-registry';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

const actionableStatuses = new Set([
	'ready_to_create_private',
	'late_review',
	'awaiting_luma_review',
	'ready_to_link_live_url'
]);

const statusOrder: Record<string, number> = {
	ready_to_create_private: 0,
	late_review: 1,
	awaiting_luma_review: 2,
	ready_to_link_live_url: 3,
	missing_required_fields: 4,
	too_early: 5,
	not_applicable: 6
};

const ensureDevWrite = () => {
	if (!dev) {
		return fail(404, { message: 'Luma workflow actions are only available in development.' });
	}
	return null;
};

const withDerivedLumaState = async () => {
	const registry = await readLumaPublishRegistryFromDisk();
	const events = buildAdminEventLumaEntries(
		listEventUi({ includeDrafts: true, includeUnlisted: true }).sort((a, b) => {
			const aTs = new Date(a.startAtUtc).valueOf();
			const bTs = new Date(b.startAtUtc).valueOf();
			return aTs - bTs;
		})
	).map((entry) => {
		const record = getLumaPublishRecord(registry, entry.id);
		const workflow = deriveLumaPublishStatus(entry, record);
		return {
			...entry,
			workflow,
			privateCreatedAt: record?.privateCreatedAt,
			privateManageUrl: record?.privateManageUrl,
			publicUrl: record?.publicUrl,
			reviewStatus: record?.reviewStatus,
			lastRunAt: record?.lastRunAt,
			lastRunOutcome: record?.lastRunOutcome,
			lastError: record?.lastError,
			lastArtifactDir: record?.lastArtifactDir
		};
	});

	return {
		events: [...events].sort((a, b) => {
			const actionableDiff =
				Number(actionableStatuses.has(a.workflow.status)) - Number(actionableStatuses.has(b.workflow.status));
			if (actionableDiff !== 0) return actionableDiff > 0 ? -1 : 1;
			const statusDiff = (statusOrder[a.workflow.status] ?? 99) - (statusOrder[b.workflow.status] ?? 99);
			if (statusDiff !== 0) return statusDiff;
			return new Date(a.firstSessionStartAtUtc ?? '').valueOf() - new Date(b.firstSessionStartAtUtc ?? '').valueOf();
		}),
		runtimeConfig: getLumaRuntimeConfig()
	};
};

export const load: PageServerLoad = async () => withDerivedLumaState();

const getEventIdFromForm = async (request: Request): Promise<FormData> => request.formData();

export const actions: Actions = {
	createPrivate: async ({ request }) => {
		const devFailure = ensureDevWrite();
		if (devFailure) return devFailure;

		const formData = await getEventIdFromForm(request);
		const eventId = String(formData.get('eventId') ?? '').trim();
		const force = formData.get('force') === 'true';
		const entry = getEventForLumaWorkflow(eventId);
		if (!entry) return fail(404, { message: `Unable to find event ${eventId}.`, targetId: eventId });

		const registry = await readLumaPublishRegistryFromDisk();

		try {
			const result = await createPrivateLumaEvent(entry, { force });
			const existing = getLumaPublishRecord(registry, eventId);
			const nextRegistry = upsertLumaPublishRecord(registry, {
				...(existing ?? { eventId }),
				eventId,
				privateCreatedAt: result.finishedAt,
				privateManageUrl: result.privateManageUrl,
				publicUrl: result.publicUrl ?? existing?.publicUrl,
				reviewStatus: 'private_created',
				lastRunAt: result.finishedAt,
				lastRunStartedAt: result.startedAt,
				lastRunFinishedAt: result.finishedAt,
				lastRunOutcome: 'success',
				lastError: undefined,
				lastArtifactDir: result.artifactDir
			});
			await writeLumaPublishRegistryToDisk(nextRegistry);
			return {
				message: 'Private Luma event created. Review it in Luma before linking the live URL.',
				targetId: eventId
			};
		} catch (error) {
			const timestamp = new Date().toISOString();
			const existing = getLumaPublishRecord(registry, eventId);
			const nextRegistry = upsertLumaPublishRecord(registry, {
				...(existing ?? { eventId }),
				eventId,
				lastRunAt: timestamp,
				lastRunStartedAt: timestamp,
				lastRunFinishedAt: timestamp,
				lastRunOutcome: 'failed',
				lastError: error instanceof Error ? error.message : 'Unable to create the private Luma event.'
			});
			await writeLumaPublishRegistryToDisk(nextRegistry);
			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to create the private Luma event.',
				targetId: eventId
			});
		}
	},
	markReviewed: async ({ request }) => {
		const devFailure = ensureDevWrite();
		if (devFailure) return devFailure;

		const formData = await getEventIdFromForm(request);
		const eventId = String(formData.get('eventId') ?? '').trim();
		const registry = await readLumaPublishRegistryFromDisk();
		const record = getLumaPublishRecord(registry, eventId);
		if (!record?.privateManageUrl) {
			return fail(400, {
				message: 'Create the private Luma event first so there is something to review.',
				targetId: eventId
			});
		}

		const nextRegistry = upsertLumaPublishRecord(registry, {
			...record,
			eventId,
			reviewStatus: 'reviewed',
			lastError: undefined
		});
		await writeLumaPublishRegistryToDisk(nextRegistry);
		return {
			message: 'Marked as reviewed. Publish it on Luma, then attach the live URL here.',
			targetId: eventId
		};
	},
	attachLiveUrl: async ({ request }) => {
		const devFailure = ensureDevWrite();
		if (devFailure) return devFailure;

		const formData = await getEventIdFromForm(request);
		const eventId = String(formData.get('eventId') ?? '').trim();
		const liveUrl = String(formData.get('liveUrl') ?? '').trim();
		const ctaLabel = String(formData.get('ctaLabel') ?? '').trim() || 'Register now';
		const registry = await readLumaPublishRegistryFromDisk();
		const record = getLumaPublishRecord(registry, eventId);

		try {
			await attachLiveLumaUrlToEvent({ eventId, liveUrl, ctaLabel });
			const nextRegistry = upsertLumaPublishRecord(registry, {
				...(record ?? { eventId }),
				eventId,
				publicUrl: liveUrl,
				reviewStatus: 'live_linked',
				lastError: undefined
			});
			await writeLumaPublishRegistryToDisk(nextRegistry);
			return {
				message: 'Live Luma URL attached to the event. The public site will stop showing Open soon.',
				targetId: eventId
			};
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Unable to attach the live Luma URL.',
				targetId: eventId
			});
		}
	}
};
