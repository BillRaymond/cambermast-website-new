<script lang="ts">
	let name = '';
	let email = '';
	let message = '';
	let status: 'idle' | 'sending' | 'sent' | 'error' = 'idle';
	let errorMsg = '';

	// Optional: set PUBLIC_N8N_WEBHOOK in your repo secrets or .env
	const webhook = import.meta.env.PUBLIC_N8N_WEBHOOK;

	async function submitForm(e: Event) {
		e.preventDefault();
		status = 'sending';
		errorMsg = '';

		try {
			if (!webhook) {
				// No webhook set yet—simulate success for local testing
				await new Promise((r) => setTimeout(r, 600));
				status = 'sent';
				return;
			}

			const res = await fetch(webhook, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, source: 'cambermast.com' })
			});

			if (!res.ok) throw new Error(`Webhook error: ${res.status}`);
			status = 'sent';
		} catch (err: any) {
			status = 'error';
			errorMsg = err?.message ?? 'Something went wrong.';
		}
	}
</script>

<h1 class="mb-5 text-3xl font-bold">Contact</h1>

<form class="max-w-xl space-y-3.5" on:submit|preventDefault={submitForm}>
	<div>
		<label class="block text-sm font-medium text-gray-700">Name</label>
		<input
			class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
			bind:value={name}
			name="name"
			type="text"
			required
		/>
	</div>

	<div>
		<label class="block text-sm font-medium text-gray-700">Email</label>
		<input
			class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
			bind:value={email}
			name="email"
			type="email"
			required
		/>
	</div>

	<div>
		<label class="block text-sm font-medium text-gray-700">Message</label>
		<textarea
			class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
			bind:value={message}
			name="message"
			rows="5"
			required
		/>
	</div>

	<button
		class="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
		disabled={status === 'sending'}
		type="submit"
	>
		{status === 'sending' ? 'Sending…' : 'Send message'}
	</button>

	{#if status === 'sent'}
		<p class="mt-2 text-green-600">Thanks! We’ll get back to you soon.</p>
	{:else if status === 'error'}
		<p class="mt-2 text-red-600">Unable to send. {errorMsg}</p>
	{/if}
</form>

<p class="mt-6 text-sm text-gray-600">
	Or email us directly at
	<a class="text-blue-600 underline" href="mailto:hello@cambermast.com">hello@cambermast.com</a>.
</p>
