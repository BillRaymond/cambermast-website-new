<script lang="ts">
	export let title: string;
	export let subtitle: string | undefined;
	export let date: string | undefined;
	export let time: string | string[] | undefined;
	export let location: string | undefined;
	export let image: string | undefined;
	export let imageAlt: string | undefined;
	export let certificateText: string | undefined;
	export let videoUrl: string | undefined;
	export let typeLabel = 'Training';
	export let registerUrl: string | undefined;
	export let registerLabel = 'Register now';
	export let statusLabel: string | undefined;
	export let learnMoreUrl: string | undefined;
	export let tone: 'upcoming' | 'happening' = 'upcoming';

	$: timeText = Array.isArray(time) ? time.join(' · ') : time;
	$: isExternalRegisterUrl = Boolean(registerUrl?.startsWith('http'));
	$: isExternalLearnMoreUrl = Boolean(learnMoreUrl?.startsWith('http'));
	$: panelClasses =
		tone === 'happening'
			? 'border-amber-200 bg-amber-50/70'
			: 'border-blue-100 bg-white';
</script>

<article class={`rounded-2xl border p-4 shadow-sm ${panelClasses}`}>
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
		{#if image}
			<div class="w-full sm:w-48">
				<img
					src={image}
					alt={imageAlt ?? title}
					class="h-36 w-full rounded-xl border border-slate-200 object-cover"
					loading="lazy"
				/>
			</div>
		{/if}
		<div class="min-w-0 flex-1">
			<p class="text-sm font-semibold text-gray-900">{title}</p>
			{#if subtitle}
				<p class="text-xs font-semibold text-gray-600">{subtitle}</p>
			{/if}
			{#if date}
				<p class="mt-1 text-sm text-gray-700">{date}</p>
			{/if}
			{#if timeText}
				<p class="text-xs text-gray-600">{timeText}</p>
			{/if}
			{#if location}
				<p class="text-xs text-gray-500">{location}</p>
			{/if}

			<div class="mt-2 flex flex-wrap items-center gap-2">
				{#if statusLabel}
					<span
						class={`inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${
							tone === 'happening'
								? 'border-amber-200 bg-white text-amber-700'
								: 'border-blue-100 bg-blue-50 text-blue-700'
						}`}
					>
						{statusLabel}
					</span>
				{/if}
				{#if certificateText}
					<span
						class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold text-blue-700"
					>
						{certificateText}
					</span>
				{/if}
				{#if videoUrl}
					<a
						href={videoUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold text-blue-700 transition hover:bg-blue-100"
					>
						▶ Trailer ↗
					</a>
				{/if}
				<span
					class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold text-blue-700 uppercase"
				>
					{typeLabel}
				</span>
			</div>

			<div class="mt-3 flex w-full items-center gap-3">
				{#if registerUrl}
					<a
						href={registerUrl}
						target={isExternalRegisterUrl ? '_blank' : undefined}
						rel={isExternalRegisterUrl ? 'noopener noreferrer' : undefined}
						class="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
					>
						{registerLabel}
					</a>
				{/if}
				{#if learnMoreUrl}
					<a
						href={learnMoreUrl}
						target={isExternalLearnMoreUrl ? '_blank' : undefined}
						rel={isExternalLearnMoreUrl ? 'noopener noreferrer' : undefined}
						class="ml-auto text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
					>
						Learn more →
					</a>
				{/if}
			</div>
		</div>
	</div>
</article>
