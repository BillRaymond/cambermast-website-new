<script lang="ts">
	import { onMount } from 'svelte';
	import { listTrainingPrograms } from '$lib/data/training';
	import { getSeo } from '$lib/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';

	type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

	type CalApi = {
		(...args: unknown[]): void;
		ns?: Record<string, (...args: unknown[]) => void>;
	};

	const trainingPrograms = listTrainingPrograms()
		.slice()
		.sort((a, b) => a.title.localeCompare(b.title))
		.map((program) => ({ slug: program.slug, title: program.title }));

	const serviceTopics = [
		{ slug: 'ai-agents', title: 'AI Agents' },
		{ slug: 'ai-advisory-services', title: 'AI Advisory Services' },
		{ slug: 'project-management', title: 'Project Management' }
	];

	const contactOptions = [
		...trainingPrograms,
		...serviceTopics,
		{ slug: 'other', title: 'Something else' }
	];

	let name = '';
	let email = '';
	let message = '';
	let selectedProgram = '';
	let status: FormStatus = 'idle';
	let errorMsg = '';

	const webhook = 'https://n8n.cambermast.com/webhook/0095b76c-c32c-49ce-a59d-de6435af2b3e';

	const getProgramTitle = (slug: string): string =>
		contactOptions.find((option) => option.slug === slug)?.title ??
		'General question / other topic';

	const pageMeta = getSeo('/contact');

	const getCalApi = (): CalApi | undefined => {
		if (typeof window === 'undefined') return undefined;
		const cal = (window as typeof window & { Cal?: CalApi }).Cal;
		return typeof cal === 'function' ? cal : undefined;
	};

	const initCal = () => {
		const cal = getCalApi();
		if (!cal) return;
		cal('init', '15min', { origin: 'https://app.cal.com' });
		const namespace = cal.ns?.['15min'];
		if (!namespace) return;
		namespace('ui', {
			cssVarsPerTheme: {
				light: { 'cal-brand': '#2f70ff' },
				dark: { 'cal-brand': '#fafafa' }
			},
			hideEventTypeDetails: false,
			layout: 'month_view'
		});
	};

	const loadCalEmbed = () => {
		if (typeof window === 'undefined') return;
		if (getCalApi()) {
			initCal();
			return;
		}

		const existing = document.querySelector('script[data-cal-embed="true"]');
		if (existing) {
			existing.addEventListener('load', initCal, { once: true });
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://app.cal.com/embed/embed.js';
		script.async = true;
		script.dataset.calEmbed = 'true';
		script.addEventListener('load', initCal, { once: true });
		document.head.appendChild(script);
	};

	onMount(() => {
		loadCalEmbed();
	});

	async function submitForm(e: Event) {
		e.preventDefault();
		status = 'sending';
		errorMsg = '';

		try {
			const res = await fetch(webhook, {
				method: 'POST',
				mode: 'cors',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					email,
					message,
					programSlug: selectedProgram,
					programTitle: getProgramTitle(selectedProgram),
					source: 'cambermast.com'
				})
			});

			if (!res.ok) {
				let description = '';
				try {
					const data = await res.json();
					description =
						(data as { message?: string; error?: string })?.message ??
						(data as { message?: string; error?: string })?.error ??
						'';
				} catch (err) {
					// ignore JSON parse errors from error responses
				}
				throw new Error(description || `Webhook error: ${res.status}`);
			}
			status = 'sent';
		} catch (err: any) {
			status = 'error';
			errorMsg = err?.message ?? 'Something went wrong.';
		}
	}

</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/contact" />

<section class="mb-8 max-w-3xl space-y-3">
	<h1 class="text-3xl font-bold">Plan your team's training or get in touch</h1>
	<p class="text-gray-700">
		You can contact Bill and his team about any topic that interests you, including booking AI
		training, designing a private workshop, building AI agents, planning advisory services, managing
		projects, or starting a new collaboration.
	</p>
</section>

<section class="mb-8 max-w-3xl rounded-2xl border bg-blue-50 p-6 text-blue-900 shadow">
	<h2 class="text-xl font-semibold">Need time with Bill?</h2>
	<p class="mt-1 text-sm">
		Check the scheduling calendar first to grab an available slot before you fill out the form.
	</p>
	<a
		class="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
		href="https://cal.com/billraymond/15min"
		target="_blank"
		rel="noopener noreferrer"
	>
		View the calendar
	</a>
</section>

<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
	<form
		class="space-y-4 rounded-2xl border bg-white p-6 shadow"
		on:submit|preventDefault={submitForm}
	>
		<div>
			<label class="block text-sm font-medium text-gray-700" for="contact-name"
				>Your full name
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span></label
			>
			<input
				class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={name}
				id="contact-name"
				name="name"
				type="text"
				required
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700" for="contact-email"
				>Your email address
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span></label
			>
			<input
				class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={email}
				id="contact-email"
				name="email"
				type="email"
				required
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700" for="contact-program"
				>What would you like to talk about?
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span></label
			>
			<select
				class="mt-1 w-full rounded-md border bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={selectedProgram}
				id="contact-program"
				name="training"
				required
			>
				<option value="" disabled selected={!selectedProgram}>-- Pick a topic --</option>
				{#each contactOptions as option}
					<option value={option.slug}>{option.title}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700" for="contact-message"
				>Your message
				<span class="text-red-500" aria-hidden="true">*</span>
				<span class="sr-only"> required</span></label
			>
			<textarea
				class="mt-1 w-full rounded-md border px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={message}
				id="contact-message"
				name="message"
				rows="5"
				required
			></textarea>
		</div>

		<button
			class="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
			disabled={status === 'sending'}
			type="submit"
		>
			{status === 'sending' ? 'Sending…' : 'Send message'}
		</button>

		<p class="text-xs font-medium uppercase tracking-wide text-gray-500">
			Fields marked <span class="text-red-500" aria-hidden="true">*</span> are required.
		</p>

		{#if status === 'sent'}
			<p class="text-sm text-green-600">Thanks! We’ll get back to you soon.</p>
		{:else if status === 'error'}
			<p class="text-sm text-red-600">
				I am sorry. There was a problem with the form. Try contacting Bill directly at <a
					href="mailto:Bill.Raymond@Cambermast.com">Bill.Raymond@Cambermast.com</a
				>. Error message: {errorMsg}.
			</p>
		{/if}
	</form>

	<div class="space-y-5">
		<section class="rounded-2xl border bg-blue-50 p-6 text-blue-900 shadow">
			<h2 class="text-xl font-semibold">Or, book a 15-minute training consult</h2>
			<p class="mt-2 text-sm text-blue-900">
				Pick a time that works for you. Bring your questions about AI training, private team
				workshops, or custom AI enablement plans.
			</p>
			<button
				type="button"
				class="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
				data-cal-link="billraymond/15min"
				data-cal-namespace="15min"
				data-cal-config={JSON.stringify({ layout: 'month_view' })}
			>
				Book a 15-minute call
			</button>
		</section>

		<section class="rounded-2xl border bg-white p-5 text-sm text-gray-700 shadow">
			<p>
				Prefer email? Reach out at
				<a class="font-medium text-blue-600 underline" href="mailto:bill.raymond@cambermast.com"
					>bill.raymond@cambermast.com</a
				>.
			</p>
		</section>
	</div>
</div>
