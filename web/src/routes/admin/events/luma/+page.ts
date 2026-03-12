import { listEventUi } from '$lib/view-models/events';
import { buildAdminEventLumaEntries } from '$lib/view-models/admin-event-luma';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const events = listEventUi({ includeDrafts: true, includeUnlisted: true }).sort((a, b) => {
		const aTs = new Date(a.startAtUtc).valueOf();
		const bTs = new Date(b.startAtUtc).valueOf();
		return aTs - bTs;
	});

	return {
		events: buildAdminEventLumaEntries(events)
	};
};
