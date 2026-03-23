<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import EventRegisterButton from '$lib/components/events/EventRegisterButton.svelte';

	export let title: string;
	export let tagline: string | undefined = undefined;
	export let date: string | undefined = undefined;
	export let time: string | string[] | undefined = undefined;
	export let location: string | undefined = undefined;
	export let hostText: string | undefined = undefined;
	export let image: string | undefined = undefined;
	export let imageAlt: string | undefined = undefined;
	export let certificateText: string | undefined = undefined;
	export let videoUrl: string | undefined = undefined;
	export let typeLabel: string | undefined = undefined;
	export let brochureUrl: string | undefined = undefined;
	export let registerUrl: string | undefined = undefined;
	export let registerLabel = 'Register now';
	export let statusLabel: string | undefined = undefined;
	export let startTimestamp: number | null = null;
	export let learnMoreUrl: string | undefined = undefined;
	export let partnerText: string | undefined = undefined;
	export let speakerText: string | undefined = undefined;
	export let tone: 'upcoming' | 'happening' = 'upcoming';
	export let variant: 'calendar' | 'carousel' | 'catalog' = 'calendar';
	export let enableLiveCountdown = false;

	const formatCountdown = (diffMs: number): string => {
		const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
		const seconds = totalSeconds % 60;
		const totalMinutes = Math.floor(totalSeconds / 60);
		const minutes = totalMinutes % 60;
		const totalHours = Math.floor(totalMinutes / 60);
		const hours = totalHours % 24;
		const days = Math.floor(totalHours / 24);
		const pad = (value: number) => value.toString().padStart(2, '0');
		if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
		if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
		if (minutes > 0) return `${pad(minutes)}:${pad(seconds)}`;
		return `${seconds}s`;
	};

	let nowTimestamp = Date.now();
	let liveStatusLabel: string | undefined;

	$: timeText = Array.isArray(time) ? time.join(' · ') : time;
	$: cadenceMatch = date?.match(/^(.*)\s·\s((?:Every|Occurs on)\s.+)$/i);
	$: displayDate = cadenceMatch ? cadenceMatch[1] : date;
	$: cadenceLabel = cadenceMatch ? cadenceMatch[2] : undefined;
	$: isCarousel = variant === 'carousel';
	$: isExternalLearnMoreUrl = Boolean(learnMoreUrl?.startsWith('http'));
	$: hasCardNavigation = Boolean(learnMoreUrl);
	$: showLearnMoreLink = Boolean(learnMoreUrl) && tone !== 'happening';
	$: showTrailerChip = Boolean(videoUrl);
	$: hasCountdownLabel = Boolean(statusLabel?.startsWith('Starts in'));
	$: canLiveCountdown =
		enableLiveCountdown &&
		hasCountdownLabel &&
		tone !== 'happening' &&
		typeof startTimestamp === 'number' &&
		Number.isFinite(startTimestamp);
	$: countdownMs =
		canLiveCountdown && typeof startTimestamp === 'number' ? startTimestamp - nowTimestamp : null;
	$: liveStatusLabel =
		countdownMs !== null && countdownMs > 0
			? `Starts in ${formatCountdown(countdownMs)}`
			: undefined;
	$: shouldRunLiveCountdown = countdownMs !== null && countdownMs > 0;
	$: displayedStatusLabel = liveStatusLabel ?? statusLabel;
	$: isCountdownStatus = Boolean(displayedStatusLabel?.startsWith('Starts in'));
	$: panelClasses =
		tone === 'happening' ? 'border-amber-200 bg-amber-50/70' : 'border-blue-100 bg-white';
	$: hoverClasses = hasCardNavigation
		? tone === 'happening'
			? 'cursor-pointer transition-colors hover:bg-amber-100/80 focus-within:bg-amber-100/80'
			: 'cursor-pointer transition-colors hover:bg-blue-50 focus-within:bg-blue-50'
		: 'transition-colors';
	$: paddingClass = isCarousel ? 'p-2.5 sm:p-3 md:p-4' : 'p-4';
	$: imageWrapClass = variant === 'carousel' ? 'w-full sm:w-44' : 'w-full sm:w-48';
	$: imageClass = 'aspect-[3/2] w-full rounded-xl border border-slate-200 object-cover';
	$: contentWrapClass = isCarousel
		? 'relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5'
		: 'relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5';
	$: titleClass = isCarousel
		? 'line-clamp-2 text-base leading-tight font-semibold text-gray-900'
		: 'text-sm font-semibold text-gray-900';
	$: taglineClass = isCarousel
		? 'line-clamp-1 text-sm font-semibold text-gray-600'
		: 'text-xs font-semibold text-gray-600';
	$: metaDateRowClass = 'mt-1 flex flex-wrap items-center gap-2';
	$: metaDateTextClass = isCarousel ? 'text-base text-gray-700' : 'text-sm text-gray-700';
	$: metaTimeClass = isCarousel ? 'text-sm text-gray-700' : 'text-xs text-gray-600';
	$: metaLocationClass = isCarousel ? 'text-sm text-gray-700' : 'text-xs text-gray-500';
	$: chipsWrapClass = isCarousel
		? 'mt-1.5 flex flex-wrap items-center gap-2'
		: 'mt-2 flex flex-wrap items-center gap-2';
	$: ctaWrapClass = isCarousel
		? 'mt-2.5 flex w-full flex-col items-stretch gap-2 sm:mt-3 sm:flex-row sm:items-center sm:gap-3'
		: 'mt-3 flex w-full items-center gap-3';
	$: registerButtonClass = isCarousel
		? 'pointer-events-auto relative z-30 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700'
		: 'pointer-events-auto relative z-30 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700';
	$: learnMoreClass = isCarousel
		? 'pointer-events-auto relative z-30 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900 sm:ml-auto sm:min-h-0'
		: 'pointer-events-auto relative z-30 ml-auto text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900';
	$: hostLabel = hostText?.includes(' + ') ? 'Hosts' : 'Host';
	$: speakerLabel = speakerText?.includes(' + ') ? 'Speakers' : 'Speaker';
	$: locationMetaParts = [
		location,
		cadenceLabel,
		!isCarousel && hostText ? `${hostLabel}: ${hostText}` : undefined,
		!isCarousel && speakerText ? `${speakerLabel}: ${speakerText}` : undefined
	].filter((part): part is string => Boolean(part?.trim()));
	$: locationMetaText = locationMetaParts.join(' • ');

	onMount(() => {
		if (!browser || !enableLiveCountdown) return;
		const timer = setInterval(() => {
			nowTimestamp = Date.now();
		}, 1000);
		return () => clearInterval(timer);
	});
</script>

<article
	class={`relative rounded-2xl border shadow-sm ${panelClasses} ${hoverClasses} ${paddingClass}`}
>
	{#if hasCardNavigation}
		<a
			href={learnMoreUrl!}
			target={isExternalLearnMoreUrl ? '_blank' : undefined}
			rel={isExternalLearnMoreUrl ? 'noopener noreferrer' : undefined}
			aria-label={`Learn more about ${title}`}
			class="absolute inset-0 z-20 rounded-2xl"
		></a>
	{/if}
	<div class={contentWrapClass}>
		{#if image}
			<div class={imageWrapClass}>
				<img src={image} alt={imageAlt ?? title} class={imageClass} loading="lazy" />
				{#if typeLabel}
					<span
						class="mt-2 inline-flex w-full items-center justify-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap text-blue-700 uppercase"
					>
						{typeLabel}
					</span>
				{/if}
				{#if brochureUrl}
					<a
						href={brochureUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="pointer-events-auto relative z-30 mt-2 inline-flex w-full items-center justify-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap text-blue-700 uppercase transition hover:bg-blue-100"
					>
						BROCHURE
					</a>
				{/if}
			</div>
		{/if}
		<div class="min-w-0 flex-1">
			<p class={titleClass}>{title}</p>
			{#if tagline}
				<p class={taglineClass}>{tagline}</p>
			{/if}
			{#if partnerText}
				<p class="mt-1 text-[0.65rem] tracking-wide text-gray-500 uppercase">
					In partnership with {partnerText}
				</p>
			{/if}
			{#if displayDate || (!image && typeLabel)}
				<div class={metaDateRowClass}>
					{#if displayDate}
						<p class={metaDateTextClass}>{displayDate}</p>
					{/if}
					{#if !image && typeLabel}
						<span
							class="inline-flex shrink-0 items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap text-blue-700 uppercase"
						>
							{typeLabel}
						</span>
					{/if}
				</div>
			{/if}
			{#if timeText}
				<p class={metaTimeClass}>{timeText}</p>
			{/if}
			{#if locationMetaText}
				<p class={metaLocationClass}>{locationMetaText}</p>
			{/if}

			<div class={chipsWrapClass}>
				{#if displayedStatusLabel}
					<span
						class={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap ${
							tone === 'happening'
								? 'border-amber-200 bg-white text-amber-700'
								: 'border-blue-100 bg-blue-50 text-blue-700'
						} ${isCountdownStatus ? 'min-w-[18ch] tabular-nums' : ''}`}
					>
						{displayedStatusLabel}
					</span>
				{/if}
				{#if certificateText}
					<span
						class="inline-flex shrink-0 items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap text-blue-700"
					>
						{certificateText}
					</span>
				{/if}
				{#if showTrailerChip}
					<a
						href={videoUrl!}
						target="_blank"
						rel="noopener noreferrer"
						class="pointer-events-auto relative z-30 inline-flex shrink-0 items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap text-blue-700 transition hover:bg-blue-100"
					>
						▶ Trailer ↗
					</a>
				{/if}
			</div>

			<div class={ctaWrapClass}>
				{#if registerUrl}
					<EventRegisterButton
						href={registerUrl}
						label={registerLabel}
						shape="rounded"
						className={registerButtonClass}
					/>
				{/if}
				{#if showLearnMoreLink}
					<a
						href={learnMoreUrl!}
						target={isExternalLearnMoreUrl ? '_blank' : undefined}
						rel={isExternalLearnMoreUrl ? 'noopener noreferrer' : undefined}
						class={learnMoreClass}
					>
						Learn more →
					</a>
				{/if}
			</div>
		</div>
	</div>
</article>
