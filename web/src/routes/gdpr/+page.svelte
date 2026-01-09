<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/gdpr');

	const controllerInfo = {
		name: 'Cambermast LLC',
		address: 'San Francisco, California, USA'
	};

	const dataPractices = [
		{
			title: 'Information you share with us',
			body: `We collect only the business details you provide when you submit a request - typically your name, work email, organization, topic, and the context you want us to address. We use that information solely to answer questions, scope work, and coordinate next steps.`
		},
		{
			title: 'Events, surveys, testimonials, and future forms',
			body: `Whenever we host an event, ask for survey input, or invite testimonials, we limit each form to the fields required to run that experience. Optional fields are clearly marked, and any new form will describe its purpose before you hit submit. We never repurpose those responses for unrelated marketing without asking first.`
		}
	];

	const legalBases = [
		{
			title: 'Responding to inquiries and planning work',
			basis: 'Legitimate interest & pre-contractual steps (GDPR Art. 6(1)(f) and 6(1)(b))',
			description:
				'When you contact us about training or advisory services, we process your details so we can reply, schedule meetings, and prepare proposals.'
		},
		{
			title: 'Delivering paid engagements',
			basis: 'Contractual necessity (GDPR Art. 6(1)(b))',
			description:
				'If you hire Cambermast, we process participant rosters, billing contacts, and project files to deliver the work outlined in our agreement.'
		},
		{
			title: 'Testimonials, surveys, and marketing opt-ins',
			basis: 'Consent (GDPR Art. 6(1)(a))',
			description:
				'We only publish testimonials, send optional marketing updates, or reuse quotes when you have clearly opted in. You can withdraw consent whenever you like.'
		}
	];

	const rights = [
		{
			title: 'Know & access',
			description:
				'Request a copy of the data we store about you, including raw form submissions, email history, and live testimonials.'
		},
		{
			title: 'Correct or delete',
			description:
				'Ask us to fix inaccurate information or delete your contact history, testimonial, or any other personal data.'
		},
		{
			title: 'Withdraw consent',
			description:
				'Change your mind about having a testimonial published or opt out of future marketing follow-ups at any time.'
		},
		{
			title: 'Complain to an authority',
			description:
				'If you live in the EU, EEA, or UK you may lodge a complaint with your local supervisory authority in addition to contacting Cambermast.'
		}
	];

	const transferStatement = `Cambermast is based in the United States, so information you provide may be processed on U.S.-hosted systems. When EU, EEA, or UK personal data moves to the United States we implement appropriate safeguards such as vendor standard contractual clauses or Data Privacy Framework commitments where available.`;
</script>

<SeoHead title={pageMeta.title} description={pageMeta.description} path="/gdpr" />

<section class="mb-8 max-w-3xl space-y-4">
	<p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Privacy & GDPR</p>
	<h1 class="text-3xl font-bold text-gray-900">How Cambermast handles personal data</h1>
	<p class="text-lg text-gray-700">
		We only gather the business data needed to respond, deliver training, run experiences, and
		celebrate client success. This page summarizes how Cambermast stores, secures, and deletes the
		information you share with us across email, meetings, and online tools. If we ever need new data
		points, we will explain the purpose and retention before collecting anything.
	</p>
</section>

<section class="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">Who controls your data</h2>
	<p class="text-sm text-gray-700">
		Cambermast LLC is the data controller for submissions on cambermast.com. We are based in
		{controllerInfo.address}. Reach us any time through the
		<a class="font-semibold text-blue-600 underline" href="/contact">contact page</a>.
	</p>
	<p class="mt-2 text-sm text-gray-700">
		Cambermast LLC also does business as Bill Talks AI (BillTalksAI.com) and The Occasional Developer
		(mainly a YouTube property). All data collected under those names is governed by this notice unless a
		Project-specific agreement states otherwise.
	</p>
	<p class="mt-3 text-sm text-gray-700">
		We review this page whenever we add a new form, vendor, or program so you always know which data
		flows we rely on.
	</p>
</section>

<section class="mb-10 grid gap-6 md:grid-cols-2">
	{#each dataPractices as practice}
		<article class="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
			<h2 class="text-xl font-semibold text-gray-900">{practice.title}</h2>
			<p class="mt-2 text-sm text-gray-700">{practice.body}</p>
			<p class="mt-3 text-sm text-gray-600">
				All submissions are handled in Cambermast-controlled systems secured with encryption and
				access limited to the small team that needs the information.
			</p>
		</article>
	{/each}
	<p class="md:col-span-2 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950">
		We keep each record only as long as it helps us progress your request, deliver contracted work, or
		meet legal obligations such as accounting rules. When something is no longer needed - or if you ask
		us to remove it - we delete or anonymize the data.
	</p>
</section>

<section class="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">Legal bases for processing</h2>
	<ul class="mt-4 space-y-4">
		{#each legalBases as entry}
			<li class="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
				<p class="font-semibold text-gray-900">{entry.title}</p>
				<p class="text-xs uppercase tracking-wide text-gray-500">{entry.basis}</p>
				<p class="mt-2 text-gray-700">{entry.description}</p>
			</li>
		{/each}
	</ul>
</section>

<section class="mb-10 rounded-2xl border bg-blue-50 p-6 text-blue-950 shadow">
	<h2 class="text-xl font-semibold">Tools and partners we use</h2>
	<p class="mt-2 text-sm">
		Cambermast relies on a small number of trusted tools and service providers to run our website,
		communicate with clients, deliver training, and accept payments. These providers only receive the
		information needed to do their job and are required to protect it under contractual privacy
		safeguards.
	</p>
	<p class="mt-3 text-sm">
		The list below covers the main services we use day to day. From time to time, we may use additional
		tools for a specific project, pilot, or event. When that happens, we apply the same privacy
		standards described on this page.
	</p>
	<div class="mt-4 space-y-3 text-sm text-gray-800">
		<p>
			<span class="font-semibold text-gray-900">Google Workspace.</span>
			Used for business email, calendars, shared documents, and internal collaboration related to
			training and advisory work.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Google Forms.</span>
			Used occasionally for surveys, intake forms, or event-related questions. Each form is limited to
			the information needed for its stated purpose, and responses are stored in Cambermast-managed
			systems.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Cal.com.</span>
			Optional scheduling tool you can use to book time with us. Personal data is shared only if you
			choose to schedule a meeting and is used solely for coordination.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Zoom and Google Meet.</span>
			Used for workshops, office hours, and project sessions. Names, email addresses, and audio or
			video streams are used only during the call.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Mailchimp.</span>
			Used for occasional mailing lists or event follow-ups when you opt in. Email addresses and
			preferences are stored in Mailchimp solely to send the communications you requested.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Substack.</span>
			Hosts our newsletter. If you subscribe, Substack stores your email address and analytics about
			opens/clicks so we can tailor content and honor unsubscribe requests.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Lu.ma.</span>
			Used for some training or community events so attendees can register, receive reminders, and add
			calendar invites.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Stripe.</span>
			Processes payments and course registrations securely. Cambermast does not store or process full
			payment card details.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Google Analytics.</span>
			Loaded only if you allow analytics cookies. We use anonymized and aggregated usage data to
			understand which pages are helpful and to improve site navigation.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Cloudflare Turnstile.</span>
			Helps protect our forms from spam and automated abuse by issuing a short-lived verification token
			during submission.
		</p>
		<p>
			<span class="font-semibold text-gray-900">Large language models (LLMs).</span>
			Used in limited cases to validate, clean, or enrich customer-provided data before or after a
			project. Inputs are minimized, processed under confidentiality, and retained only as long as
			required for the task.
		</p>
	</div>
	<p class="mt-4 text-sm">
		If we introduce a new tool that materially changes how personal data is processed, we will update
		this page before using it.
	</p>
</section>

<section id="cookies" class="mb-10 rounded-2xl border border-gray-200 bg-white p-6 text-sm shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">Cookies, consent, and analytics</h2>
	<p class="mt-2 text-gray-700">
		Cambermast only sets two types of browser storage: essential security tokens that protect our
		forms, and optional analytics cookies that measure site performance. Nothing loads until you see
		the consent banner the first time you visit.
	</p>
	<ul class="mt-4 space-y-3 text-gray-700">
		<li class="rounded-xl border border-gray-100 bg-gray-50 p-4">
			<p class="font-semibold text-gray-900">Functional protection</p>
			<p class="mt-1">
				Cloudflare Turnstile may set a short-lived verification cookie only while you submit a form
				so we can block spam and automated attacks. It expires quickly and is required to deliver
				your message.
			</p>
		</li>
		<li class="rounded-xl border border-gray-100 bg-gray-50 p-4">
			<p class="font-semibold text-gray-900">Optional analytics (requires consent)</p>
			<p class="mt-1">
				If you select “Allow analytics,” we load Google Analytics 4 and it may create the
				<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">_ga</code> and
				<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">_ga_&lt;container&gt;</code> cookies for up to 13
				months. We anonymize IP addresses, disable Google signals and ad personalization, and rely on
				the data only to understand which pages help visitors most.
			</p>
		</li>
	</ul>
	<p class="mt-4 text-gray-700">
		Your consent choice is saved locally as
		<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">cambermast-consent-v1</code> so we remember it until
		you change it. You can reopen the banner through the “Cookie preferences” link in the site footer, from
		this page, or by contacting us via the <a class="font-semibold text-blue-600 underline" href="/contact"
			>contact page</a
		>.
	</p>
</section>

<section class="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">International transfers</h2>
	<p class="text-sm text-gray-700">{transferStatement}</p>
	<p class="mt-3 text-sm text-gray-700">
		If we add a new vendor that processes EU, EEA, or UK data outside those regions, we will update this
		page and the underlying contracts before enabling the integration.
		We rely on Standard Contractual Clauses and each vendor's participation in the EU-U.S. Data Privacy
		Framework (where available) to keep cross-border transfers lawful.
	</p>
</section>

<section class="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">Your rights under GDPR</h2>
	<div class="mt-4 grid gap-4 md:grid-cols-3">
		{#each rights as right}
			<div class="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
				<p class="font-semibold text-gray-900">{right.title}</p>
				<p class="mt-1 text-gray-700">{right.description}</p>
			</div>
		{/each}
	</div>
	<p class="mt-4 text-sm text-gray-700">
		Send any request through the <a class="font-semibold text-blue-600 underline" href="/contact"
			>contact page</a
		>
		and we will acknowledge it within two business days.
	</p>
</section>

<section class="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">Make a data request</h2>
	<p class="mt-2 text-gray-700">
		Whether you reached out for help, registered for something, or shared feedback, you're always in
		control. Tell us what to change or remove and we'll confirm in writing once it's done.
		Send your request through the
		<a class="font-semibold text-blue-600 underline" href="/contact">contact page</a> and we will acknowledge it
		within two business days and complete the response within 30 days unless law requires a faster
		turnaround.
	</p>
	<a
		class="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
		href="/contact"
	>
		Contact Cambermast
	</a>
</section>
