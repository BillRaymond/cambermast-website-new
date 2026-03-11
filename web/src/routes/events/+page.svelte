<script lang="ts">
	import CalendarPage from '$lib/components/CalendarPage.svelte';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';

	const pageMeta = getSeo('/events');
</script>

<SeoHead
	title={pageMeta.title}
	description={pageMeta.description}
	path="/events"
	feedLinks={[
		{ href: '/feed/events.xml', title: 'Cambermast Training Events' },
		{ href: '/feed/calendar.xml', title: 'Cambermast Calendar' }
	]}
/>

<h1 class="mb-6 text-3xl font-bold">Calendar of Events</h1>
<CalendarPage />
