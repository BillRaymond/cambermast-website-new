<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeo } from '$lib/seo';
	import { listTrainingPrograms } from '$lib/data/training';

	const pageMeta = getSeo('/training/tips');
	const trainingPrograms = listTrainingPrograms().sort((a, b) => a.title.localeCompare(b.title));

	const coreTips = [
		{ text: '⏰ Arrive on time so you do not miss the kickoff context.' },
		{ text: '🗓️ Block your calendar and minimize distractions during the session.' },
		{ text: '🎥 Keep your video and audio on whenever you can for better collaboration.' },
		{
			text: '⬇️ Download and install Zoom before the session starts',
			link: {
				href: 'https://zoom.us/download',
				label: 'Zoom download',
				suffix: ' (it is free to use).'
			}
		},
		{
			text: '🛒 Check the prerequisites for your training program and make sure you purchase or download any required apps, hardware, or services.',
			showPrograms: true
		},
		{
			text: '🖥️ Set up two monitors if possible. Some people use an iPad or similar device when they do not have multiple monitors.'
		},
		{ text: '📶 Join from a quiet space with reliable Wi-Fi or a wired connection.' },
		{ text: '🎙️ Test your mic and camera before we begin.' },
		{ text: '📝 Keep a notebook or doc open to capture ideas and action items.' }
	];

	const bonusTips = [
		'Close bandwidth-heavy apps and browser tabs you will not use.',
		'Have your login credentials ready for any tools we will use.',
		'Bring real examples or workflows you want to improve.'
	];
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/training/tips" />

<section class="mx-auto mb-8 max-w-3xl space-y-4">
	<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Training success</p>
	<h1 class="text-3xl font-bold text-gray-900">Get the most out of your live training</h1>
	<p class="text-lg text-gray-700">
		These quick prep steps help you get the most value from Cambermast live training sessions and keep
		the group moving together.
	</p>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Before we start</h2>
	<ul class="list-disc space-y-2 pl-6 text-sm text-gray-700">
		{#each coreTips as tip}
			<li>
				{tip.text}
				{#if tip.link}
					<a
						class="font-semibold text-blue-600 underline"
						href={tip.link.href}
						rel="noreferrer"
						target="_blank"
					>
						{tip.link.label}
					</a>
					{tip.link.suffix}
				{/if}
				{#if tip.showPrograms}
					<ul class="mt-3 space-y-2 pl-5 text-sm text-gray-600">
						{#each trainingPrograms as program}
							<li>
								<a class="font-semibold text-blue-600 underline" href={program.route}>
									{program.title}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<section class="mx-auto mb-16 max-w-3xl space-y-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-950 shadow">
	<h2 class="text-2xl font-semibold text-blue-950">Bonus tips for smooth sessions</h2>
	<ul class="list-disc space-y-2 pl-6">
		{#each bonusTips as tip}
			<li>{tip}</li>
		{/each}
	</ul>
	<p class="text-blue-900">
		If you have any setup questions, reach out in advance on the
		<a class="font-semibold text-blue-700 underline" href="/contact">contact page</a>.
	</p>
</section>
