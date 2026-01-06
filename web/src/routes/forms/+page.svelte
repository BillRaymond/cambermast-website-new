<script lang="ts">
    import { dev } from '$app/environment';
    import { onMount } from 'svelte';
    import SeoHead from '$lib/components/SeoHead.svelte';
    import { listTrainingPrograms } from '$lib/data/training';

    const pageMeta = {
        title: 'Cambermast Forms | Share Your Story',
        description:
            'Friendly, lightweight forms where students and partners can send testimonials, training requests, and follow-ups.'
    };

    const testimonialPrograms = listTrainingPrograms()
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((program) => ({ title: program.title, slug: program.slug }));

    const defaultOrigin = dev ? 'http://localhost:5173' : 'https://cambermast.com';
    let shareOrigin = defaultOrigin;
    $: testimonialsBaseUrl = `${shareOrigin}/forms/testimonials`;
    const getProgramShareUrl = (slug: string): string => `${testimonialsBaseUrl}?program=${slug}`;

    let copiedSlug: string | null = null;
    let copyError = '';

    const copyShareUrl = async (slug: string) => {
        copyError = '';
        if (typeof navigator === 'undefined' || !navigator?.clipboard) {
            copyError = 'Clipboard access is unavailable in this browser.';
            return;
        }

        try {
            await navigator.clipboard.writeText(getProgramShareUrl(slug));
            copiedSlug = slug;
            setTimeout(() => {
                if (copiedSlug === slug) copiedSlug = null;
            }, 2500);
        } catch (err: unknown) {
            copiedSlug = null;
            copyError = err instanceof Error ? err.message : 'Unable to copy link.';
        }
    };

    onMount(() => {
        if (typeof window !== 'undefined' && window.location?.origin) {
            shareOrigin = window.location.origin;
        }
    });
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/forms" />

<section class="mx-auto max-w-3xl space-y-6 py-10">
    <div class="space-y-4 text-center">
        <p class="text-xs font-semibold uppercase tracking-wide text-amber-600">Cambermast forms</p>
        <h1 class="text-3xl font-bold text-gray-900">Share feedback in a couple of minutes</h1>
        <p class="text-gray-700">
            These links make it easy to send testimonials, request training follow-ups, or share ideas with Bill.
            They aren’t linked in the main navigation, so feel free to pass them directly to teammates or partners.
        </p>
    </div>

    <div class="rounded-2xl border border-amber-100 bg-white p-6 shadow">
        <h2 class="text-xl font-semibold text-gray-900">Available forms</h2>
        <p class="mt-1 text-sm text-gray-600">
            We’re gradually adding more workflows here. For now, you can publish an AI training testimonial in just a few steps.
        </p>
        <div class="mt-5 space-y-6">
            <div class="flex flex-wrap items-center gap-3">
                <a
                    class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
                    href="/forms/testimonials"
                >
                    Visit the testimonials form
                    <span aria-hidden="true">→</span>
                </a>
                <span class="text-sm text-gray-600">Shareable links for each program are below.</span>
            </div>

            <div class="space-y-4">
                <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-600">Testimonials</h3>
                <p class="text-xs text-gray-500">
                    Links use the current host: <span class="font-medium text-gray-700">{testimonialsBaseUrl}</span>
                </p>
                <ul class="space-y-3">
                    {#each testimonialPrograms as program}
                        <li class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                            <div class="space-y-1">
                                <p class="text-sm font-semibold text-gray-900">{program.title}</p>
                                <a
                                    class="text-xs text-blue-600 underline"
                                    href={getProgramShareUrl(program.slug)}
                                    rel="noreferrer"
                                >
                                    {getProgramShareUrl(program.slug)}
                                </a>
                            </div>
                            <button
                                class="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                                type="button"
                                on:click={() => copyShareUrl(program.slug)}
                            >
                                <svg class="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                {copiedSlug === program.slug ? 'Copied!' : 'Copy URL'}
                            </button>
                        </li>
                    {/each}
                </ul>
            </div>

            {#if copyError}
                <p class="text-sm text-red-600" role="alert">{copyError}</p>
            {/if}
        </div>
        <p class="mt-4 text-xs text-gray-500">
            Psst—if you received this link directly, you’re in the right place. Thanks for sharing your experience!
        </p>
    </div>
</section>
