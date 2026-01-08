<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeo } from '$lib/seo';

	const pageMeta = getSeo('/gdpr');

	const controllerInfo = {
		name: 'Cambermast LLC',
		address: 'San Francisco, California, USA',
		email: 'bill.raymond@cambermast.com'
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

	const processors = [
		{
			name: 'Google Workspace email & calendar',
			description:
				'Used for email, calendars, shared documents, and occasional forms so we can collaborate on training or advisory work.'
		},
		{
			name: 'Cal.com scheduling',
			description:
				'Optional booking widget you can open on the contact page to pick a meeting time. Data flows only when you choose to use the scheduler.'
		},
		{
			name: 'Lu.ma events',
			description:
				'Used for some training or community events so attendees can receive calendar invites and reminders.'
		},
		{
			name: 'Stripe',
			description:
				'Securely processes course registrations and other payments on our behalf. Card numbers are handled by Stripe, not Cambermast.'
		},
		{
			name: 'Google Analytics',
			description:
				'Optional analytics that load only if you allow cookies in the on-site banner. IP addresses are anonymized, Google signals and ads personalization are disabled, and we retain aggregated reports to improve navigation.'
		},
		{
			name: 'Cloudflare Turnstile',
			description:
				'Protects our forms from spam by issuing a short-lived verification token. It sets a functional cookie only while verifying your submission.'
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
		We only collect the details relevant to your request so we can respond, deliver training, run
		experiences, and celebrate client success. This page summarizes how we handle data submitted
		through any Cambermast form today or in the future. If a new form requires additional fields, we
		will describe why we need them before you hit submit.
	</p>
</section>

<section class="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">Who controls your data</h2>
	<p class="text-sm text-gray-700">
		Cambermast LLC is the data controller for submissions on cambermast.com. We are based in
		{controllerInfo.address}. Reach us at
		<a class="font-semibold text-blue-600 underline" href={`mailto:${controllerInfo.email}`}
			>{controllerInfo.email}</a
		>.
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
	<h2 class="text-xl font-semibold">Vendors that help us operate</h2>
	<p class="mt-2 text-sm">
		We only work with processors that provide contractual privacy safeguards and limit access to the
		data needed for their service. We may engage additional trusted vendors over time, and when we do,
		we will add them to this list before transferring your data.
	</p>
	<ul class="mt-4 space-y-3">
		{#each processors as vendor}
			<li class="rounded-xl border border-blue-100 bg-white/80 p-4 text-sm">
				<p class="font-semibold text-gray-900">{vendor.name}</p>
				<p class="text-gray-700">{vendor.description}</p>
			</li>
		{/each}
	</ul>
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
		you change it. You can reopen the banner through the “Cookie preferences” link in the site footer,
		from this page, or by emailing
		<a class="font-semibold text-blue-600 underline" href="mailto:bill.raymond@cambermast.com"
			>bill.raymond@cambermast.com</a
		>.
	</p>
</section>

<section class="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">International transfers</h2>
	<p class="text-sm text-gray-700">{transferStatement}</p>
	<p class="mt-3 text-sm text-gray-700">
		If we add a new vendor that processes EU, EEA, or UK data outside those regions, we will update this
		page and the underlying contracts before enabling the integration.
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
		Send any request to
		<a class="font-semibold text-blue-600 underline" href="mailto:bill.raymond@cambermast.com"
			>bill.raymond@cambermast.com</a
		>
		and we will acknowledge it within two business days.
	</p>
</section>

<section class="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-gray-900">Need something removed?</h2>
	<p class="mt-2 text-gray-700">
		Whether you reached out for help, registered for something, or shared feedback, you're always in
		control. Tell us what to change or remove and we'll confirm in writing once it's done.
	</p>
	<a
		class="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-blue-700"
		href="/contact"
	>
		Contact Cambermast
	</a>
</section>
