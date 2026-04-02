<script lang="ts">
	import ResourceHeader from '$lib/components/resources/ResourceHeader.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/resources/ask-me-anything-pricing');
	const heroImage = '/images/resources/ama/hero-landscape.jpg';
	const heroImageAlt = 'Ask Me Anything Pricing hero image.';
</script>

<ResourceHeader
	title="Ask Me Anything (AMA) AI Sessions for Your Team"
	description="Select from AMAs we can deliver right now or schedule a tailor-made Ask Me Anything (AMA) event."
	path="/resources/ask-me-anything-pricing"
	imageSrc={heroImage}
	imageAlt={heroImageAlt}
	label="Pricing guide"
/>

<section class="mx-auto mb-8 max-w-3xl space-y-3">
	<h2 class="text-2xl font-semibold text-gray-900">Ask Me Anything (AMA) event details</h2>
	<p class="text-gray-700">
		AMA (ask me anything) events are interactive and live events hosted by Bill Raymond. They run
		for 1 to 1.5 hours and cost $350. You can invite up to 50 people.
	</p>
	<p class="text-gray-700">
		Custom AMA events range from $500 to $850 and run 2 to 2.5 hours. We also offer a survey
		option so you can poll employees on which AMA sessions they want to attend.
	</p>
	<p class="text-gray-700">
		Typical scheduling hours are between 7:00 AM and 7:00 PM US Pacific Time (California).
		Payments are typically made by credit card.
	</p>
</section>

<section class="mx-auto mb-10 max-w-3xl space-y-3">
	<h2 class="text-2xl font-semibold text-gray-900">Schedule your AMA</h2>
	<p class="text-gray-700">
		To schedule your AMA with Bill now, use the
		<a href="/contact" class="font-semibold text-blue-700 underline underline-offset-4">
			contact page
		</a>.
	</p>
</section>

<section class="mx-auto mb-10 max-w-3xl space-y-3">
	<h2 class="text-2xl font-semibold text-gray-900">AI-focused AMA topics</h2>
	<ul class="list-disc space-y-2 pl-5 text-gray-700">
		<li>Prompting basics</li>
		<li>Introducing ChatGPT Atlas</li>
		<li>Introducing n8n AI Agents</li>
		<li>Introducing vibe coding for beginners</li>
		<li>Making AI follow your writing style</li>
		<li>Prompting to create great images</li>
		<li>Using prompts to evaluate your work</li>
		<li>Explore advanced ChatGPT features</li>
		<li>Explore advanced Claude features</li>
		<li>Explore advanced Gemini features</li>
		<li>Explore Notebook LM to track large amount of research</li>
		<li>Using AI for competitor analysis</li>
	</ul>
</section>

<section class="mx-auto mb-10 max-w-3xl space-y-3">
	<h2 class="text-2xl font-semibold text-gray-900">Tech-focused AMA topics</h2>
	<ul class="list-disc space-y-2 pl-5 text-gray-700">
		<li>GitHub for non-developers</li>
		<li>Using Visual Studio Code</li>
		<li>Using Claude Code</li>
		<li>Using GitHub Copilot</li>
	</ul>
</section>
