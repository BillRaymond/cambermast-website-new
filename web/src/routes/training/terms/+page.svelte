<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/training/terms');

	const creditTerms = [
		'Credits must be used within 6 months from the original purchase date.',
		'Credits may be applied to a single training only.',
		'Credits cannot be split across multiple trainings.',
		'Credits have no cash value.',
		'Any unused value is forfeited when applied to a lower-priced training.'
	];
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/training/terms" />

<section class="mx-auto mb-8 max-w-3xl space-y-4">
	<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Training policies</p>
	<h1 class="text-3xl font-bold text-gray-900">Training Terms and Conditions</h1>
	<p class="text-lg text-gray-700">
		These Training Terms and Conditions apply to all instructor-led trainings, workshops, courses, and
		learning experiences offered by Cambermast LLC (“Cambermast,” “we,” “us”) and form part of the
		agreement between Cambermast and you or your organization (the “client” or “participant”) when you
		register.
	</p>
	<p class="text-gray-700">
		Cambermast uses third-party checkout and payment providers. We govern many of our policies based on
		those providers, and these terms cover the training experience itself, including participation,
		materials, cancellations, transfers, and refunds.
	</p>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Refund policy</h2>
	<div class="space-y-4 text-sm text-gray-700">
		<div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
			<p class="font-semibold text-gray-900">Full refund within 24 hours</p>
			<p class="mt-1">
				You may request a full refund within 24 hours of your original purchase time. A full refund
				means the full ticket price paid, and Cambermast does not charge a refund handling fee.
			</p>
		</div>
		<div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
			<p class="font-semibold text-gray-900">Partial refund within 48 hours</p>
			<p class="mt-1">
				You may request a refund within 48 hours of purchase. Approved refunds in this window may be
				reduced by non-refundable platform or payment processing fees charged by the checkout
				provider.
			</p>
		</div>
		<div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
			<p class="font-semibold text-gray-900">After 48 hours</p>
			<p class="mt-1">After 48 hours from purchase, tickets are no longer refundable.</p>
		</div>
	</div>
</section>

<section class="mx-auto mb-8 max-w-3xl rounded-2xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-950 shadow">
	<h2 class="text-2xl font-semibold text-blue-950">Training credit in place of refunds</h2>
	<p class="mt-2">
		After the refund windows above, your ticket remains in good standing and may be applied one time
		toward another Cambermast training of equal or lesser value, subject to availability.
	</p>
	<ul class="mt-3 list-disc pl-6">
		{#each creditTerms as term}
			<li class="mt-1">{term}</li>
		{/each}
	</ul>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Event changes initiated by Cambermast</h2>
	<p class="text-gray-700">
		If Cambermast cancels a training or makes a material schedule change, we will offer either a
		rescheduled date or a refund/training credit as described on the relevant registration page. When a
		refund is offered, we will note whether it is a full refund or whether platform fees apply.
	</p>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Transfers and substitutions</h2>
	<p class="text-gray-700">
		Unless otherwise stated on the registration page, you may request to transfer your registration to
		another individual or to a future session. Transfers are granted at Cambermast's sole discretion and
		can depend on factors such as availability, verification, and any deadlines published for the specific
		training.
	</p>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Attendance and conduct</h2>
	<p class="text-gray-700">
		Cambermast trainings are professional learning environments. We reserve the right to remove
		participants who engage in disruptive, abusive, or inappropriate behavior. Removal for conduct
		violations does not entitle the participant to a refund or credit.
	</p>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Training materials and recordings</h2>
	<p class="text-gray-700">
		Training materials are provided for the personal use of registered participants only and may not be
		shared, redistributed, or resold.
	</p>
	<p class="text-gray-700">
		Recordings may be offered for some trainings but are not guaranteed unless explicitly stated on the
		registration page. When recordings are provided, access duration and usage terms will be specified
		for that training.
	</p>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Chargebacks and payment disputes</h2>
	<p class="text-gray-700">
		If you initiate a chargeback or payment dispute without first contacting Cambermast, your access to
		the training may be paused while the dispute is resolved. Cambermast may provide registration and
		attendance records to respond to disputes. Disputes resolved in your favor may result in removal
		from the training and loss of access to materials.
	</p>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Changes to these Training Terms</h2>
	<p class="text-gray-700">
		These Training Terms may be updated from time to time. Changes apply prospectively and do not
		retroactively alter the terms that applied at the time of your purchase unless the change benefits
		you.
	</p>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Invoiced and private training engagements</h2>
	<p class="text-gray-700">
		For trainings purchased by a client through an invoice, purchase order, or written agreement rather
		than an online checkout, the applicable commercial terms (pricing, payment schedule, cancellations,
		refunds, credits, and scope) are defined in writing between Cambermast and the client. If a conflict
		arises, the written agreement governs the invoiced engagement, and these Training Terms apply only
		where they are not superseded.
	</p>
</section>

<section class="mx-auto mb-8 max-w-3xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Data protection and jurisdiction</h2>
	<p class="text-gray-700">
		Cambermast LLC is a United States company based in San Francisco, California. Personal data collected
		in connection with training registration, participation, communications, recordings, refunds, and
		credits is processed in accordance with our
		<a class="font-semibold text-blue-600 underline" href="/gdpr">Privacy & GDPR notice</a>, which covers
		lawful bases, retention, international transfers, and individual rights. Third-party registration and
		payment platforms used for checkout act as independent controllers for payment and billing data.
	</p>
	<p class="text-gray-700">
		Cambermast processes training-related personal data primarily to fulfill contractual obligations,
		communicate operational updates, and deliver training services.
	</p>
</section>

<section class="mx-auto mb-16 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-2xl font-semibold text-gray-900">Contact</h2>
	<p class="text-gray-700">
		For questions about training policies, refunds, or transfers, contact us through the
		<a class="font-semibold text-blue-600 underline" href="/contact">contact page</a> or reply directly to
		the confirmation email tied to your registration.
	</p>
	<a
		class="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
		href="/contact"
	>
		Contact Cambermast
	</a>
</section>
