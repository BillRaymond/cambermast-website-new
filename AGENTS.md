# AGENTS.md — Cambermast Website Rules for AI Assistants

Use this file to keep automated changes aligned with the site’s governance and content rules.

## Core obligations (every change)
- Follow the repository README requirements.
- Keep policy, governance, and AI guidance consistent across the site.
- Do not invent services, partners, credentials, pricing, or dates.

## Schema governance rule (required)
- Use schema-first for every structured registry contract under `web/src/lib/data/**`.
- Every registry schema must have:
  - a public read-only API endpoint (`/api/<domain>.json` or documented equivalent),
  - an API response schema in `web/src/lib/data/api/schemas/`,
  - an API payload builder in `web/src/lib/data/api/`,
  - admin SOP documentation in an existing relevant `/admin/sop*` route (or a new `/admin/sop-<domain>` page if none fits).
- Run `npm --prefix web run validate:schema-governance` when schemas/contracts change.

## Page layout baseline (new/updated pages)
- Use `web/src/routes/about/+page.svelte` as the default layout model unless a route has an intentional custom design.
- Do not add nested `mx-auto max-w-*` wrappers around the top heading/content block on standard pages; use the shared layout container alignment.
- Start pages with a left-aligned heading block:
  - `h1` class: `mb-6 text-3xl font-bold`
  - Intro paragraph class: `max-w-3xl text-gray-700`

## When adding or changing routes/content
- Update `web/src/routes/sitemap.xml/+server.ts` for new public routes.
- Update `web/static/robots.txt` if crawl rules change.
- Add or update page metadata in `web/src/lib/seo.ts` for new public pages.
- If messaging/offers change, update `README.md`, `llms.txt`, and (if policy-related) `ai.txt`.
- Sync root `ai.txt` and `llms.txt` into `web/static/` (or run the sync script).

## Policy and trust pages
- Privacy/GDPR changes: update `web/src/routes/gdpr/+page.svelte` first, then mirror in `README.md` and `llms.txt`.
- Training terms changes: update `web/src/routes/training/terms/+page.svelte` first, then update any related marketing copy.

## AI guidance files
- `llms.txt` is the canonical source list for LLMs; add new public resource URLs when created.
- `ai.txt` governs AI usage and must remain consistent with published policy.
- Root `ai.txt` and `llms.txt` are the source of truth; `web/static/` is the published copy.

## Assets and media
- Testimonial photos must live in `web/static/images/testimonials/` and be square (~300x300).

## Forms
- Use `web/src/lib/components/forms/TurnstileField.svelte` for Cloudflare Turnstile on new forms to keep mobile layout consistent.
- Use `web/src/lib/utils/form-submission.ts` for webhook form submissions (`postJsonWithTimeout` + `getWebhookSubmissionErrorMessage`) so timeout and error UX stays consistent.
- Keep webhook error responses compatible with existing parsing in form pages (`message`, `error`, `error-codes`, or `messages`) to preserve user-friendly feedback.

## Preferred workflow checks
- Use `web/scripts/sync-site-metadata.mjs` (or `npm --prefix web run dev/build/preview`) to keep `web/static/ai.txt` and `web/static/llms.txt` in sync.

## Training brochure PDF debugging
- The training brochure print route is `web/src/routes/(plain)/training/[slug]/print/+page.svelte`.
- Generate local brochure PDFs with `npm --prefix web run generate:training-pdfs:dev`.
- In development, `npm --prefix web run dev` now starts a brochure PDF watcher. It regenerates PDFs only when brochure-impacting sources change, rather than on every refresh.
- The current brochure watcher contract includes these sources:
  - `web/src/routes/(plain)/training/[slug]/print/+page.svelte`
  - `web/src/routes/(plain)/training/[slug]/print/+page.ts`
  - `web/src/lib/data/training/**`
  - `web/src/lib/data/training/brochure.ts`
  - `web/src/lib/data/testimonials.json`
  - `web/src/lib/data/testimonials.ts`
  - `web/src/lib/data/partners.ts`
  - `web/src/routes/about/+page.svelte`
  - brochure-linked `/images/**` assets referenced by training brochure data, testimonials, the print route, and the About page
- If brochure PDFs seem stale in development, verify the changed file is inside that contract before assuming the watcher is broken.
- The Docker image includes `poppler-utils`; use `pdfinfo`, `pdftoppm`, and `pdftotext` to inspect the built PDFs before making further pagination changes.
- For print-layout debugging, prioritize content fidelity, clean rendering, and working links over hitting a target page count. Brochures do not have a required number of pages.
- Do not remove existing hard page breaks in the brochure print layout unless the user explicitly asks for that tradeoff.
- Treat existing hard page breaks as intentional editorial layout controls, not as defects to clean up.
