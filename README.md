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

These two documents live in the repo root and are deployed alongside the site so both humans and AI clients understand how to interpret and use Cambermast content.

## URL Aliases & Redirects

- `/training-programs` redirects to `/training` to support legacy or marketing links to the catalog.

## Campaign Registry

- `/campaigns` is an internal-only registry that lists QR and other campaigns and provides dev/prod test URLs.
- Campaign data lives in `web/src/lib/data/qr-campaigns.json`, validated by `web/src/lib/data/qr-campaigns.schema.json`, and publishes at `/api/qr-campaigns.json`.
- QR images are generated client-side on the `/campaigns` page (PNG + SVG downloads).

## QR Landing Pages (Offline Campaigns)

For printed QR codes, prefer stable, human URLs on `cambermast.com` (e.g. `/techlab`, `/tcw`) so the link remains under our control even if the downstream destination changes later.

- Use standard UTMs on the QR code (recommended): `/techlab?utm_source=qr&utm_medium=offline&utm_campaign=techlab&utm_content=<placement>`
- Basic trigger support: `/techlab` treats `src=qr` (and `ad=<value>`) as optional parameters and emits a GA4 `qr_landing` event when present.
- Campaign records live in `web/src/lib/data/qr-campaigns.json` and the site publishes them at `/api/qr-campaigns.json` (the endpoint derives `qrUrl` so you only maintain `landingPath` + `params` once).

## Privacy, GDPR & Cookies

- `web/src/routes/gdpr/+page.svelte` is the canonical privacy notice for cambermast.com, covering lawful bases, vendor list, and contact options for data requests. Update it whenever we add a new form, vendor, or processing purpose.
- The same page contains the cookie disclosure: only Cloudflare Turnstile runs by default for security and Google Analytics 4 loads if a visitor accepts analytics cookies. The consent state is stored in `cambermast-consent-v1` and can be reset from the footer link.
- If privacy messaging or cookie behavior changes, edit the GDPR page first, then note the change in `README.md`, `llms.txt`, and any marketing copy so policy, AI guidance, and UI stay aligned.

## Training Terms & Conditions

- `web/src/routes/training/terms/+page.svelte` is the canonical set of Training Terms (refunds, credits, transfers, conduct, materials, disputes).
- Include a visible link to `/training/terms` on every registration form, landing page, or program overview so attendees know where to review policy details.
- When policy language changes, update that file first and then refresh any marketing copy or registration emails that describe the guarantees.

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

## Testimonial Photos

- Store approved headshots under `web/static/images/testimonials/`.
- Crop uploads to a square (1:1) at roughly **300×300px** so they render crisply inside the circular avatar treatment.
- Save as optimized `.jpg` or `.png` (WebP is fine too) and keep files under ~150 KB to avoid bloating static pages.
- Update `photoUrl` in `web/src/lib/data/testimonials.json` to point at `/images/testimonials/<filename>` whenever you add or replace a photo.
