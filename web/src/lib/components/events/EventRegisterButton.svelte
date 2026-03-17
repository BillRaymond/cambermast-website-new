<script lang="ts">
	type Theme = 'blue' | 'slate';
	type Size = 'sm' | 'md' | 'lg';
	type Shape = 'pill' | 'rounded';

	export let href: string | undefined = undefined;
	export let label = 'Register now';
	export let theme: Theme = 'blue';
	export let size: Size = 'md';
	export let shape: Shape = 'pill';
	export let fullWidth = false;
	export let disabled = false;
	export let className = '';
	export let onClick: ((event: MouseEvent) => void) | undefined = undefined;

	$: isExternal = /^https?:\/\//i.test(href ?? '');
	$: themeClasses =
		theme === 'slate'
			? 'bg-slate-900 text-white hover:bg-slate-700'
			: 'bg-blue-600 text-white hover:bg-blue-700';
	$: sizeClasses =
		size === 'sm'
			? 'px-4 py-2 text-sm'
			: size === 'lg'
				? 'px-6 py-3 text-sm'
				: 'px-5 py-2 text-sm';
	$: shapeClasses = shape === 'rounded' ? 'rounded-lg' : 'rounded-full';
	$: widthClasses = fullWidth ? 'w-full' : '';
	$: classes =
		`inline-flex items-center justify-center font-semibold transition ${themeClasses} ${sizeClasses} ${shapeClasses} ${widthClasses} ${className}`.trim();
	$: disabledClasses = `${classes} cursor-not-allowed opacity-60 hover:bg-inherit`.trim();
</script>

{#if disabled}
	<span class={disabledClasses} aria-disabled="true">
		{label}
	</span>
{:else}
	<a
		href={href}
		class={classes}
		target={isExternal ? '_blank' : undefined}
		rel={isExternal ? 'noopener noreferrer' : undefined}
		on:click={onClick}
	>
		{label}
	</a>
{/if}
