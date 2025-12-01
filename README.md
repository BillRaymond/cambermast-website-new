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
