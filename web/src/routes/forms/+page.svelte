<script lang="ts">
    import SeoHead from '$lib/components/SeoHead.svelte';

    const pageMeta = {
        title: 'Cambermast Forms | Share Your Story',
        description:
            'Friendly, lightweight forms where students and partners can send testimonials, training requests, and follow-ups.'
    };
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
        <div class="mt-5">
            <a
                class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
                href="/forms/testimonials"
            >
                Share your training story
                <span aria-hidden="true">→</span>
            </a>
        </div>
        <p class="mt-4 text-xs text-gray-500">
            Psst—if you received this link directly, you’re in the right place. Thanks for sharing your experience!
        </p>
    </div>
</section>
