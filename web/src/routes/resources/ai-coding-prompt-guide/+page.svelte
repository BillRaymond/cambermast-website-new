<script lang="ts">
	import AiCodingPromptGuideContent from '$lib/components/resources/AiCodingPromptGuideContent.svelte';
	import ResourceHeader from '$lib/components/resources/ResourceHeader.svelte';
	import { getResource } from '$lib/data/resources';
	import {
		aiCodingPromptGuide,
		aiCodingPromptGuidePdfUrl,
		aiCodingPromptGuidePrintUrl
	} from '$lib/data/resources/printable/ai-coding-prompt-guide';
	import { hasPrintableResourcePdf } from '$lib/data/resources/printable';
	import { getImageAlt, getLandscapeImageUrl } from '$lib/data/image-contract';

	const resource = getResource('ai-coding-prompt-guide');
	const heroImage = getLandscapeImageUrl(resource?.images) ?? aiCodingPromptGuide.heroImage;
	const heroImageAlt = getImageAlt(resource?.images) ?? aiCodingPromptGuide.heroImageAlt;
	const hasPdf = hasPrintableResourcePdf('ai-coding-prompt-guide');
</script>

<ResourceHeader
	title={aiCodingPromptGuide.title}
	description={aiCodingPromptGuide.description}
	path="/resources/ai-coding-prompt-guide"
	imageSrc={heroImage}
	imageAlt={heroImageAlt}
	label={resource?.label ?? aiCodingPromptGuide.label}
>
	<div slot="actions" class="flex flex-wrap gap-3 pt-1">
		{#if hasPdf}
			<a
				href={resource?.pdf?.url ?? aiCodingPromptGuidePdfUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center justify-center rounded-full border border-blue-700 bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:border-blue-800 hover:bg-blue-700"
			>
				Download the PDF
			</a>
			<a
				href={resource?.pdf?.printRoute ?? aiCodingPromptGuidePrintUrl}
				class="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"
			>
				Open print view
			</a>
		{/if}
	</div>
</ResourceHeader>

<AiCodingPromptGuideContent resource={aiCodingPromptGuide} />
