# Cambermast Website

[Cambermast](https://cambermast.com) helps organizations adopt AI with confidence. We combine hands-on experimentation with practical governance so teams can learn quickly, prove value, and scale their AI initiatives responsibly.

## What We Do

- **AI Training:** Interactive workshops that teach modern prompting techniques, collaboration patterns, and governance frameworks your teams can apply immediately.
- **AI Agents:** Design and delivery of custom AI assistants that automate knowledge work, streamline operations, and integrate with the tools you already use.
- **AI Advisory:** Executive coaching and strategic roadmaps that connect AI opportunities to measurable business outcomes.

Cambermast is led by CEO Bill Raymond, a certified FutureLab AI Mastermind Trainer, founding member of The GenAI Collective, and host of the _Agile in Action_ podcast. Bill partners with clients to turn AI curiosity into lasting capability.

## About This Repository

This repository powers the public marketing site for Cambermast. It contains the content, components, and configuration used to deploy [cambermast.com](https://cambermast.com).

## Tech Stack

- **SvelteKit + Svelte 5:** Static adapter keeps the marketing site fast and CDN-friendly while letting us ship the same component-driven experience everywhere.
- **Vite 7 toolchain:** Dev/preview/build scripts live in `web/package.json`, providing instant feedback via `vite dev` and optimized output via `vite build`.
- **TypeScript-first:** The Svelte project runs `svelte-check` with a shared `tsconfig.json`, giving type safety across components, data sources, and endpoints.
- **Tailwind CSS 4:** Base styles, typography, and form controls are composed with Tailwind plus the official `@tailwindcss/forms` and `@tailwindcss/typography` plugins.
- **Linting & formatting:** ESLint 9 + `eslint-plugin-svelte` ensure component quality, and Prettier (with Tailwind + Svelte plugins) keeps the codebase consistent.

## Accessibility & ARIA Patterns

- **Global navigation controls** (`web/src/routes/+layout.svelte` and `web/src/lib/components/Nav.svelte`) expose `aria-label`, `aria-controls`, and `aria-expanded` so toggles and links announce their state to assistive tech.
- **Disclosure menus on the homepage** (e.g., the “Connect” fly-out in `web/src/routes/+page.svelte`) connect buttons to panels with generated IDs and keep `aria-expanded` + `aria-labelledby` in sync for screen readers.
- **Contact flows** (`web/src/routes/contact/+page.svelte`) mark required fields with `aria-hidden` indicators, track submission state with `aria-busy`, and surface responses inside an `aria-live="polite"` region.
- **Interactive carousels** (`web/src/lib/components/home/UpcomingSessionsCarousel.svelte`) define `aria-roledescription="carousel"`, label previous/next controls, and announce slide changes with a screen-reader-only live region.
- **Call-to-action components** (e.g., `ServiceCard.svelte`, `ReviewCard.svelte`) use descriptive `aria-label` text and `aria-current` attributes so multi-state cards and rating elements convey intent beyond color or layout.

## AI Guidance Files

- `llms.txt` is our machine-readable README for language models. It highlights Cambermast's offerings, authoritative sources, and citation expectations so retrieval systems can answer accurately. Update it whenever services, messaging, or proof points change.
- `ai.txt` is our AI usage policy. It states how Cambermast content may be used for AI training, inference, or summarization, and lists the contact path for additional permissions. Keep it aligned with legal, marketing, and partnership requirements.

These two documents live in the repo root as the source of truth. The SvelteKit app copies them into `web/static/` during `npm run dev`, `npm run build`, and `npm run preview` so they are published as `/llms.txt` and `/ai.txt` on cambermast.com.

## URL Aliases & Redirects

- `/training-programs` redirects to `/training` to support legacy or marketing links to the catalog.
- `/events` is the canonical public calendar of events route.
- `/events/archive` is the public past-events archive route.
- `/calendar` redirects to `/events` as a legacy alias.
- `/campaigns` redirects to `/admin/campaigns` (internal registry).

## Event Card Canonical Contract

- `web/src/lib/view-models/event-card.ts` is the canonical source for event card display data (`EventCardModel` + `toEventCardModel(...)`).
- The `/events` calendar card contract is the baseline for all event card surfaces, including home carousel and training/agents card embeds.
- Event data is authoritative. Training program data is fallback-only for card image, certificate label, and trailer URL when event values are missing.
- `web/src/lib/components/events/EventCard.svelte` supports constrained visual variants (`calendar`, `carousel`, `catalog`). Variants may change density/layout only and must not change the canonical field set.

## Creating Events from Training Programs

When creating a new training event, use this strict flow:

1. Pick the training program (by `sku`).
2. Pull duration + daily time commitment from the program `scheduleTemplate`.
3. Generate a draft event schedule, then copy the resulting `draftEvent` into `web/src/lib/data/events/events.json`.

Run:

`npm --prefix web run events:draft -- --program-sku CM-TR-005 --start-date 2026-03-17 --id 7iu8p4 --slug ai-workshop-for-tech-writers-and-content-creators-spring-2026 --subtitle "🌷 Spring 2026 Cohort"`

By default, the generated event page slug is suffixed with the campaign id (example: `ai-workshop-for-tech-writers-and-content-creators-spring-2026-7iu8p4`) to prevent accidental overwrites.

Optional overrides:

- `--id` (6-char base36; auto-generated if omitted)
- `--campaign-id` (6-char base36; defaults to `--id` when omitted)
- `--start-time` (example `13:00`)
- `--duration-days` (overrides training default)
- `--hours-per-day` (overrides training default)
- `--overwrite` (allow collisions with existing event/campaign ids or slugs)
- `--no-slug-suffix` (skip the `-<campaignId>` slug suffix; not recommended)

Output includes:

- `program.scheduleTemplate` (source values)
- `scheduleDraft` (generated date/time window)
- `draftEvent` (ready-to-paste event object with locked `template.kind = training_event_v1`, explicit `schedule`, and copied program content for description/highlights/audience/build/outcomes/agenda/FAQ/images/videoUrl)
- `draftCampaign` (ready-to-paste campaign entry for `web/src/lib/data/campaigns.json`)

## Privacy, GDPR & Cookies

- `web/src/routes/gdpr/+page.svelte` is the canonical privacy notice for cambermast.com, covering lawful bases, vendor list, and contact options for data requests. Update it whenever we add a new form, vendor, or processing purpose.
- The same page contains the cookie disclosure: only Cloudflare Turnstile runs by default for security and Google Analytics 4 loads if a visitor accepts analytics cookies. The consent state is stored in `cambermast-consent-v1` and can be reset from the footer link.
- If privacy messaging or cookie behavior changes, edit the GDPR page first, then note the change in `README.md`, `llms.txt`, and any marketing copy so policy, AI guidance, and UI stay aligned.

## Training Terms & Conditions

- `web/src/routes/training/terms/+page.svelte` is the canonical set of Training Terms (refunds, credits, transfers, conduct, materials, disputes).
- Include a visible link to `/training/terms` on every registration form, landing page, or program overview so attendees know where to review policy details.
- When policy language changes, update that file first and then refresh any marketing copy or registration emails that describe the guarantees.

## Form Submission Standard

- Use `web/src/lib/components/forms/TurnstileField.svelte` for Cloudflare Turnstile in new forms.
- For webhook-backed submissions, use `web/src/lib/utils/form-submission.ts`:
  - `postJsonWithTimeout(...)` for consistent timeout handling.
  - `getWebhookSubmissionErrorMessage(...)` for consistent timeout/network/CORS messaging.
- Keep webhook error payloads compatible with existing parsing patterns used by forms: `message`, `error`, `error-codes`, or `messages`.

## Microsoft Project Server Migration Support

- `web/src/routes/services/microsoft-project-server/+page.svelte` is the dedicated page explaining how Cambermast and Project Hosts keep Microsoft Project Server online after Microsoft ends direct support.
- Facts on that page cite Microsoft Lifecycle articles for Project Server 2013/2016/2019 and the official migration guidance. Update those references if Microsoft publishes new dates or tooling.
- The homepage CTA under “Are you a Microsoft Project Server customer?” now links to this route. Keep the Project Hosts green button styling consistent whenever you adjust copy.

## Content Update Checklist

When publishing significant messaging or offer changes:

1. Review `llms.txt` to ensure the mission summary, offerings, and authoritative sources reflect the new messaging.
2. Review `ai.txt` for any policy implications (new assets, licensing, or restrictions).
3. Review this `readme.md` to ensure it reflects relevant updates.
4. Keep structural metadata current: update `web/static/robots.txt` and `web/src/routes/sitemap.xml/+server.ts` whenever routes, slugs, or canonical URLs change so crawlers pick up the new paths.
5. Ensure the training [worksheet](https://docs.google.com/spreadsheets/d/1KmPBGD2_6RVGvnvK9d26zuvbxCfkbBCx9Fs816z7YhA/edit?gid=0#gid=0) updates.

## Standard Page Layout

- Use `web/src/routes/about/+page.svelte` as the default page scaffold for new standard pages.
- Keep top-level content aligned to the shared layout container; avoid extra nested `mx-auto max-w-*` wrappers around the page heading block unless intentionally designing a custom layout.
- Use this heading baseline by default:
  - `h1`: `mb-6 text-3xl font-bold`
  - Intro copy: `max-w-3xl text-gray-700`

## Testimonial Photos

- Store approved headshots under `web/static/images/testimonials/`.
- Crop uploads to a square (1:1) at roughly **300×300px** so they render crisply inside the circular avatar treatment.
- Save as optimized `.jpg` or `.png` (WebP is fine too) and keep files under ~150 KB to avoid bloating static pages.
- Update `photoUrl` in `web/src/lib/data/testimonials.json` to point at `/images/testimonials/<filename>` whenever you add or replace a photo.

## Schema-First Rule

- See `SCHEMA-FIRST.md` for the required schema-first workflow, validation gates, and propagation checklist for any data contract changes.
- Any new registry schema must include a public read-only API contract (API route + API response schema + API payload builder) and admin SOP coverage in a relevant `/admin/sop*` page.
- FAQ preset registry lives at `web/src/lib/data/faq-presets/faq-presets.json` and publishes at `/api/faq-presets.json` for reusable training and event FAQ starters.
- Run `npm --prefix web run validate:schema-governance` to enforce schema-to-API-to-SOP coverage.
