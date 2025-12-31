<script lang="ts">
    import { onMount } from 'svelte';
    import SeoHead from '$lib/components/SeoHead.svelte';
    import { listTestimonials } from '$lib/data/testimonials';
    import { getTrainingProgram, listTrainingPrograms } from '$lib/data/training';

    type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

    type TurnstileRenderOptions = {
        sitekey: string;
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        'timeout-callback'?: () => void;
        'refresh-expired'?: 'auto' | 'never';
        theme?: 'auto' | 'light' | 'dark';
        size?: 'auto' | 'compact' | 'normal';
    };

    type TurnstileApi = {
        render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string | undefined;
        reset: (widget?: string | HTMLElement) => void;
        remove?: (widget?: string | HTMLElement) => void;
    };

    type TurnstileWindow = Window & {
        onTurnstileLoad?: () => void;
        turnstile?: TurnstileApi;
    };

    const trainingPrograms = listTrainingPrograms()
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((program) => ({
            slug: program.slug,
            title: program.title
        }));

    const programOptions = [
        ...trainingPrograms,
        { slug: 'other', title: 'Other or not listed' }
    ];

    const ratingOptions = [
        { value: '1', label: 'Not satisfied' },
        { value: '2', label: 'Needs improvement' },
        { value: '3', label: 'Solid session' },
        { value: '4', label: 'Great session' },
        { value: '5', label: 'Exceptional session' }
    ];
    const ratingPulseDurationSeconds = 2.6;
    const ratingPulseDelayIncrement = 0.18;

    const productionTurnstileSiteKey = '0x4AAAAAACJwz83T0R7vFAHk';
    const developmentTurnstileSiteKey = '1x00000000000000000000AA';
    const productionBaseDomains = ['cambermast.com'];
    const productionWebhookUrl = 'https://n8n.cambermast.com/webhook/2e4d3bc6-d83c-492f-8912-6e95dbc10d33';
    const developmentWebhookUrl = 'https://n8n.cambermast.com/webhook-test/2e4d3bc6-d83c-492f-8912-6e95dbc10d33';

    const defaultProgramSlug = trainingPrograms[0]?.slug ?? '';
    let selectedProgram = defaultProgramSlug;
    let rating = '';
    let quote = '';
    let displayName = '';
    let email = '';
    let jobTitle = '';
    let company = '';
    let customProgramTitle = '';
    let allowPublicUse = true;
    let status: FormStatus = 'idle';
    let errorMsg = '';
    let turnstileToken = '';
    let turnstileContainer: HTMLDivElement | null = null;
    let turnstileWidgetId: string | undefined;
    let turnstileSiteKeyInUse = productionTurnstileSiteKey;
    let turnstileIsDevelopmentSiteKey = false;
    const quoteLimit = 300;
    $: remainingChars = Math.max(0, quoteLimit - quote.length);
    $: countdownTone =
        remainingChars <= 20 ? 'text-red-600' : remainingChars <= 60 ? 'text-amber-600' : 'text-gray-500';
    const sampleTestimonials = [
        '“I appreciated how approachable everything felt. It helped build confidence and gave me ideas I could use with my team right away.”',
        '“I walked away with a much clearer way to think about AI and how it fits into real work. It felt useful, realistic, and encouraging.”',
        '“I finally felt like AI made sense for my work. The ideas were practical, easy to follow, and something I could actually use right away.”'
    ];
    let sampleIndex = 0;

    const getTurnstileTarget = (): string | HTMLElement | undefined =>
        turnstileWidgetId ?? (turnstileContainer ?? undefined);

    const pageMeta = {
        title: 'Share Your Cambermast Training Story',
        description:
            'Celebrate your Cambermast training win with a quick rating and a short quote we can feature anywhere.',
        image: '/images/training-recognition.jpg',
        imageAlt: 'Cambermast training graduates smiling and holding red hearts.'
    };

    const getTurnstileWindow = (): TurnstileWindow | undefined => {
        if (typeof window === 'undefined') return undefined;
        return window as TurnstileWindow;
    };

    const isProductionHost = (host: string): boolean =>
        productionBaseDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));

    const getTurnstileEnvironment = () => {
        const turnstileWindow = getTurnstileWindow();
        const host = turnstileWindow?.location.hostname;
        const isProdHost = host ? isProductionHost(host) : true;
        return isProdHost
            ? { siteKey: productionTurnstileSiteKey, isDevelopment: false }
            : { siteKey: developmentTurnstileSiteKey, isDevelopment: true };
    };

    const testimonialsBySku = listTestimonials().reduce((acc, testimonial) => {
        const idMatch = testimonial.id.match(/(\d+)$/);
        const sequence = idMatch ? Number(idMatch[1]) : 0;
        acc[testimonial.programSku] = Math.max(acc[testimonial.programSku] ?? 0, sequence);
        return acc;
    }, {} as Record<string, number>);

    const getNextTestimonialId = (sku: string): string => {
        const nextSequence = (testimonialsBySku[sku] ?? 0) + 1;
        testimonialsBySku[sku] = nextSequence;
        const normalizedSku = sku.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `tm-${normalizedSku}-${String(nextSequence).padStart(3, '0')}`;
    };

    const getProgramTitle = (slug: string): string => {
        if (slug === 'other') return customProgramTitle.trim() || 'Other or not listed';
        return trainingPrograms.find((program) => program.slug === slug)?.title ?? 'Training program';
    };

    const getWebhookUrl = () => {
        const turnstileWindow = getTurnstileWindow();
        const host = turnstileWindow?.location.hostname;
        if (!host) return productionWebhookUrl;
        return isProductionHost(host) ? productionWebhookUrl : developmentWebhookUrl;
    };

    type TurnstileErrorEntry = {
        'error-codes'?: unknown;
        messages?: unknown;
        message?: unknown;
        error?: unknown;
    };

    const formatTurnstileError = (codes: string[], isDevEnvironment: boolean): string => {
        if (codes.includes('invalid-input-response')) {
            return isDevEnvironment
                ? 'Cloudflare Turnstile is in development mode, so tokens from this host are not accepted. Use cambermast.com to submit real testimonials.'
                : 'Cloudflare could not verify your response. Please refresh the verification widget and try again.';
        }
        return `Cloudflare could not verify the challenge (${codes.join(', ')}). Please try again.`;
    };

    const extractWebhookErrorMessage = (payload: unknown, isDevEnvironment: boolean): string => {
        if (!payload) return '';
        if (typeof payload === 'string') return payload;
        if (Array.isArray(payload)) {
            for (const entry of payload) {
                if (!entry || typeof entry !== 'object') continue;
                const record = entry as TurnstileErrorEntry;
                const codes = Array.isArray(record['error-codes'])
                    ? record['error-codes'].filter((code): code is string => typeof code === 'string')
                    : [];
                if (codes.length) return formatTurnstileError(codes, isDevEnvironment);
                const messages = Array.isArray(record.messages)
                    ? record.messages.filter((msg): msg is string => typeof msg === 'string')
                    : [];
                if (messages.length) return messages.join(' ');
            }
            return '';
        }
        if (typeof payload === 'object') {
            const record = payload as TurnstileErrorEntry;
            if (typeof record.message === 'string') return record.message;
            if (typeof record.error === 'string') return record.error;
            const codes = Array.isArray(record['error-codes'])
                ? record['error-codes'].filter((code): code is string => typeof code === 'string')
                : [];
            if (codes.length) return formatTurnstileError(codes, isDevEnvironment);
        }
        return '';
    };

    const resetTurnstile = () => {
        const turnstileWindow = getTurnstileWindow();
        turnstileWindow?.turnstile?.reset(getTurnstileTarget());
    };

    const initTurnstile = () => {
        const turnstileWindow = getTurnstileWindow();
        if (!turnstileWindow || !turnstileContainer) return;
        const { turnstile } = turnstileWindow;
        if (!turnstile) return;

        if (turnstileWidgetId) {
            turnstile.remove?.(turnstileWidgetId);
            turnstileWidgetId = undefined;
        }

        turnstileContainer.innerHTML = '';
        turnstileToken = '';
        const { siteKey, isDevelopment } = getTurnstileEnvironment();
        turnstileSiteKeyInUse = siteKey;
        turnstileIsDevelopmentSiteKey = isDevelopment;

        turnstileWidgetId = turnstile.render(turnstileContainer, {
            sitekey: turnstileSiteKeyInUse,
            theme: 'light',
            'refresh-expired': 'auto',
            callback: (token: string) => {
                turnstileToken = token;
                if (status === 'error' && errorMsg.includes('verification')) {
                    status = 'idle';
                    errorMsg = '';
                }
            },
            'expired-callback': () => {
                turnstileToken = '';
            }
        });
    };

    const loadTurnstile = () => {
        const turnstileWindow = getTurnstileWindow();
        if (!turnstileWindow) return;
        if (turnstileWindow.turnstile) {
            initTurnstile();
            return;
        }

        const existing = document.getElementById('turnstile-script');
        if (existing) {
            existing.addEventListener('load', initTurnstile, { once: true });
            return;
        }

        turnstileWindow.onTurnstileLoad = () => initTurnstile();

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
        script.async = true;
        script.defer = true;
        script.id = 'turnstile-script';
        document.head.appendChild(script);
    };

    onMount(() => {
        loadTurnstile();
        const interval = setInterval(() => {
            sampleIndex = (sampleIndex + 1) % sampleTestimonials.length;
        }, 7000);

        return () => {
            const turnstileWindow = getTurnstileWindow();
            if (turnstileWidgetId) {
                turnstileWindow?.turnstile?.remove?.(turnstileWidgetId);
                turnstileWidgetId = undefined;
            }
            if (turnstileWindow) {
                turnstileWindow.onTurnstileLoad = undefined;
            }
            clearInterval(interval);
        };
    });

    async function submitForm(event: Event) {
        event.preventDefault();
        if (status === 'sending') return;
        status = 'sending';
        errorMsg = '';

        if (!turnstileToken) {
            status = 'error';
            errorMsg = 'Please complete the verification challenge.';
            return;
        }

        const numericRating = Number(rating);
        if (!numericRating || Number.isNaN(numericRating)) {
            status = 'error';
            errorMsg = 'Select a rating between 1 and 5.';
            return;
        }

        try {
            const trimmedCustomProgram = customProgramTitle.trim();
            const programData = selectedProgram === 'other' ? undefined : getTrainingProgram(selectedProgram);
            const programSku = programData?.sku;
            const programRoute = programData?.route;
            const generatedId = programSku ? getNextTestimonialId(programSku) : undefined;
            const res = await fetch(getWebhookUrl(), {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: generatedId,
                    displayName,
                    email,
                    company: company || undefined,
                    jobTitle: jobTitle || undefined,
                    programSlug: selectedProgram === 'other' ? undefined : selectedProgram,
                    programTitle: getProgramTitle(selectedProgram),
                    customProgramTitle: selectedProgram === 'other' ? trimmedCustomProgram || undefined : undefined,
                    programSku,
                    programRoute,
                    rating: numericRating,
                    quote,
                    allowPublicUse,
                    source: 'training-testimonial',
                    createdAt: new Date().toISOString(),
                    turnstileToken,
                    turnstileSiteKey: turnstileSiteKeyInUse,
                    turnstileIsDevelopmentSiteKey
                })
            });

            if (!res.ok) {
                let description = '';
                try {
                    const data = await res.json();
                    description = extractWebhookErrorMessage(data, turnstileIsDevelopmentSiteKey);
                } catch (err) {
                    // ignore json parse failures here
                }
                throw new Error(description || `Webhook error: ${res.status}`);
            }

            status = 'sent';
            displayName = '';
            email = '';
            jobTitle = '';
            company = '';
            selectedProgram = '';
            rating = '';
            quote = '';
            customProgramTitle = '';
            allowPublicUse = true;
            turnstileToken = '';
            resetTurnstile();
        } catch (err: any) {
            status = 'error';
            errorMsg = err?.message ?? 'Something went wrong.';
            resetTurnstile();
            turnstileToken = '';
        }
    }
</script>

<SeoHead
    title={pageMeta.title}
    description={pageMeta.description}
    path="/forms/testimonials"
    image={pageMeta.image}
    imageAlt={pageMeta.imageAlt}
/>

<section class="mx-auto max-w-3xl space-y-6 py-10">
    <figure class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-amber-100 bg-white/80 p-2 shadow-lg shadow-amber-100/50">
        <img
            class="h-auto w-full rounded-2xl object-cover"
            src="/images/training-recognition.jpg"
            alt="Cambermast training graduates smiling and holding red hearts."
            loading="lazy"
        />
    </figure>

    <p class="text-center text-sm font-semibold uppercase tracking-wide text-amber-700">
        Thank you for sharing your Cambermast training experience with the community.
    </p>

    <div class="space-y-3 text-center">
        <h1 class="text-4xl font-bold tracking-tight text-gray-900">Spotlight your win</h1>
        <p class="text-lg text-gray-700">
            Drop a quick star rating and testimonial blurb we can share. Your words help the next learner choose with
            confidence.
        </p>
    </div>

    <form
        class="space-y-6 rounded-3xl border border-blue-100 bg-white p-8 shadow-lg shadow-blue-100/80"
        on:submit|preventDefault={submitForm}
        aria-busy={status === 'sending'}
    >
        <div>
            <label class="block text-sm font-semibold uppercase tracking-wide text-gray-600" for="testimonial-program"
                >Which training did you complete?
                <span class="text-red-500" aria-hidden="true">*</span>
                <span class="sr-only"> required</span></label
            >
            <select
                class="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                bind:value={selectedProgram}
                id="testimonial-program"
                name="program"
                required
            >
                <option value="" disabled selected={!selectedProgram}>Pick a program</option>
                {#each programOptions as option}
                    <option value={option.slug}>{option.title}</option>
                {/each}
            </select>
            {#if selectedProgram === 'other'}
                <input
                    class="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    bind:value={customProgramTitle}
                    type="text"
                    id="testimonial-program-other"
                    name="customProgramTitle"
                    placeholder="What should we call the session?"
                    required={selectedProgram === 'other'}
                />
            {/if}
        </div>

        <div>
            <span class="block text-sm font-semibold uppercase tracking-wide text-gray-600"
                >How many stars would you give it?
                <span class="text-red-500" aria-hidden="true">*</span>
                <span class="sr-only"> required</span></span
            >
            <p class="mt-1 text-xs text-gray-500">5 stars means the session was exceptional.</p>
            <div class="mt-3 flex items-center gap-1">
                {#each ratingOptions as option, index}
                    {@const numericValue = Number(option.value)}
                    {@const isActive = Number(rating) >= numericValue}
                    <label class="cursor-pointer" aria-label={`${option.value} star${option.value === '1' ? '' : 's'} - ${option.label}`}>
                        <input
                            class="sr-only"
                            type="radio"
                            name="rating"
                            value={option.value}
                            bind:group={rating}
                            required={option.value === '1'}
                        />
                        <svg
                            class={`h-8 w-8 transition-colors duration-200 ${isActive ? 'text-yellow-400' : 'text-gray-300'} ${rating ? '' : 'rating-star--pulse'}`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                            style={!rating ? `animation-delay: ${index * ratingPulseDelayIncrement}s; animation-duration: ${ratingPulseDurationSeconds}s;` : undefined}
                        >
                            <path
                                d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                            />
                        </svg>
                    </label>
                {/each}
            </div>
            {#if rating}
                <p class="mt-2 text-sm text-gray-600">
                    You chose {rating} star{rating === '1' ? '' : 's'} - {ratingOptions.find((opt) => opt.value === rating)?.label}
                </p>
            {/if}
        </div>

        <div>
            <label class="block text-sm font-semibold uppercase tracking-wide text-gray-600" for="testimonial-quote"
                >What made this training valuable for you?
                <span class="text-red-500" aria-hidden="true">*</span>
                <span class="sr-only"> required</span></label
            >
            <textarea
                class="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                bind:value={quote}
                id="testimonial-quote"
                name="quote"
                rows="4"
                maxlength={quoteLimit}
                placeholder="Finally, a training course that made working with AI feel practical and enjoyable! I learned a lot, gained confidence, and am ready for the next step in my career."
                required
            ></textarea>
            <div class={`mt-1 text-right text-xs font-medium ${countdownTone}`}>
                {remainingChars} character{remainingChars === 1 ? '' : 's'} left
            </div>
            <div class="mt-3 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-inner">
                <p class="flex items-center gap-2 font-semibold text-gray-800">
                    <span aria-hidden="true">✨</span>
                    <span>Need inspiration?</span>
                </p>
                <p class="mt-1 italic text-gray-600 transition" aria-live="polite">
                    {sampleTestimonials[sampleIndex]}
                </p>
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700" for="testimonial-name"
                >Name to display
                <span class="text-red-500" aria-hidden="true">*</span>
                <span class="sr-only"> required</span></label
            >
            <input
                class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                bind:value={displayName}
                id="testimonial-name"
                name="displayName"
                type="text"
                placeholder="Scott A., Scott Abel, etc."
                required
            />
            <p class="mt-1 text-xs text-gray-500">
                This is the name that can appear on the website or slides alongside the quote.
            </p>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700" for="testimonial-title"
                >Your current role, title, or focus area (optional)</label
            >
            <input
                class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                bind:value={jobTitle}
                id="testimonial-title"
                name="jobTitle"
                type="text"
                placeholder="Product Manager, Consultant, Founder, etc."
            />
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700" for="testimonial-company"
                >Company or industry (optional)</label
            >
            <input
                class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                bind:value={company}
                id="testimonial-company"
                name="company"
                type="text"
                placeholder="Acme Labs, Fintech startup, Healthcare consulting, etc."
            />
            <p class="mt-1 text-xs text-gray-500">
                Tip: share a company name if you’re comfortable, or list the industry if you prefer something more general.
            </p>
        </div>

        <div class="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-gray-800">
            <p class="text-xs font-semibold uppercase tracking-wide text-blue-700">Live preview</p>
            <figure class="mt-2 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                <p class="text-xs font-semibold text-blue-600">
                    {selectedProgram
                        ? `Training: ${getProgramTitle(selectedProgram)}`
                        : 'Pick a training at the top to preview'}
                </p>
                <div class="flex items-center gap-1 text-yellow-500" aria-hidden="true">
                    {#each Array(Number(rating) || 0) as _, index}
                        <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <polygon points="10 1.5 12.9 7.26 19.2 7.97 14.3 12.28 15.6 18.48 10 15.4 4.4 18.48 5.7 12.28 0.8 7.97 7.1 7.26" />
                        </svg>
                    {/each}
                    {#if !rating}
                        <span class="text-xs text-gray-400">Choose a star rating to preview</span>
                    {/if}
                </div>
                <blockquote class="mt-3 text-sm text-gray-700">
                    “{quote || 'Your testimonial will appear here as soon as you start typing.'}”
                </blockquote>
                <figcaption class="mt-3 text-sm font-semibold text-gray-900">
                    {displayName || 'Display name'}
                    <span class="block text-xs font-normal text-gray-500">
                        {#if jobTitle || company}
                            {(jobTitle ? jobTitle : '') + (jobTitle && company ? ', ' : '') + (company ? company : '')}
                        {:else}
                            Title or organization (optional)
                        {/if}
                    </span>
                </figcaption>
            </figure>
        </div>

        <div class="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-900">
            <label class="flex items-start gap-3" for="testimonial-consent">
                <input
                    class="mt-1 h-4 w-4 rounded border-amber-300 text-amber-700 focus:ring-amber-600"
                    type="checkbox"
                    id="testimonial-consent"
                    name="allowPublicUse"
                    bind:checked={allowPublicUse}
                />
                <span>
                    I'm comfortable with Cambermast sharing my star rating and testimonial quote publicly (ex website, decks, newsletters, and other publications).
                </span>
            </label>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700" for="testimonial-email"
                >Email (never shared)
                <span class="text-red-500" aria-hidden="true">*</span>
                <span class="sr-only"> required</span></label
            >
            <input
                class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                bind:value={email}
                id="testimonial-email"
                name="email"
                type="email"
                required
            />
            <p class="mt-1 text-xs text-gray-500">We’ll only use this if we need to follow up. It will never be published.</p>
        </div>

        <div>
            <span class="block text-sm font-medium text-gray-700"
                >Verification
                <span class="text-red-500" aria-hidden="true">*</span>
                <span class="sr-only"> required</span></span
            >
            <div
                class="mt-1 rounded-md border bg-white px-3 py-2"
                bind:this={turnstileContainer}
                aria-live="polite"
            >
                <noscript>Enable JavaScript to complete the verification step.</noscript>
            </div>
        </div>

        <div aria-live="polite">
            {#if status === 'sent'}
                <p class="text-sm text-green-600" role="status">
                    Incredible - thank you for sharing! Keep an eye out for your quote on upcoming pages.
                </p>
            {:else if status === 'error'}
                <p class="text-sm text-red-600" role="alert">
                    Something went wrong while submitting the form. Please try again or email
                    <a class="font-semibold underline" href="mailto:bill.raymond@cambermast.com"
                        >bill.raymond@cambermast.com</a
                    >.
                    Error message: {errorMsg}
                </p>
            {:else if status === 'sending'}
                <p class="text-sm text-gray-600" role="status">Sending...</p>
            {/if}
        </div>

        <button
            class="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-blue-600 disabled:opacity-60"
            disabled={status === 'sending'}
            type="submit"
        >
            {status === 'sending' ? 'Sending...' : 'Share my story'}
        </button>

        <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
            Fields marked <span class="text-red-500" aria-hidden="true">*</span> are required.
        </p>
    </form>
</section>

<style>
	:global(.rating-star--pulse) {
		animation-name: ratingStarPulse;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	@keyframes ratingStarPulse {
		0% {
			color: #d1d5db;
		}
		35% {
			color: #fbbf24;
		}
		65% {
			color: #fbbf24;
		}
		100% {
			color: #d1d5db;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.rating-star--pulse) {
			animation: none;
		}
	}
</style>
