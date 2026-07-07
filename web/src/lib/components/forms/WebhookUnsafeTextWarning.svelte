<script lang="ts">
	import {
		formatUnsafeWebhookCharacterList,
		getUnsafeWebhookCharacters
	} from '$lib/utils/form-submission';

	export let fieldLabel = 'this field';
	export let id: string;
	export let value: unknown = '';

	$: unsafeCharacters = getUnsafeWebhookCharacters(value);
	$: warning = unsafeCharacters.length
		? `Please remove ${formatUnsafeWebhookCharacterList(unsafeCharacters)} from ${fieldLabel} before submitting. This temporary form cannot safely send those characters yet.`
		: '';
</script>

{#if warning}
	<p
		{id}
		class="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900"
		aria-live="polite"
	>
		{warning}
	</p>
{/if}
