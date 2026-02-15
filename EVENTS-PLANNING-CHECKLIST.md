# Calendar of Events Planning Checklist

Purpose: Track architecture decisions and implementation progress for the unified public events experience in this branch.

## Handoff Snapshot (for next AI chat)

- Branch in use: `calendar-of-events`
- Public canonical route: `/events`
- Legacy route behavior: `/calendar` redirects to `/events`
- Internal ops routes:
  - `/internal/events` (events registry + status/campaign checks)
  - `/admin/events` (redirect alias to `/internal/events`)
- Event detail route: `/events/[slug]` (countdown + CTA + partner panel)
- Event detail route also supports related training back-link when `programRef.sku` is present.
- Campaign short links: `/c/[id]` mapped in `web/src/lib/data/campaigns.json`
- Events API route: `/api/events.json`
- Calendar filter behavior:
  - Keep top-level `All`, `Training`, `Events`.
  - Show dynamic event-type chips only when present in current data.
  - Hide duplicate/generic type chips (`training`, `training_session`, `event`, `other`).
  - Webinar chip label includes emoji (`🎙️ Webinar`).
- Known pre-existing `svelte-check` failures (not introduced by this work):
  - `web/src/lib/components/ServiceCard.svelte`
  - `web/src/lib/components/training/CatalogCard.svelte`
  - `web/src/lib/components/training/ProgramPage.svelte`
  - `web/src/lib/components/techlab/ProgramPage.svelte`

## What We Did In This Chat (Feb 2026)

- Added featured images for events:
  - Set `image` + `imageAlt` for seeded events in `web/src/lib/data/events/events.json`.
  - Added a new static featured image: `web/static/images/events/vibe-coding-webinar-feb-2026.svg`.
- Standardized the `/events` card layout:
  - Always reserve space so `Learn more →` aligns consistently on desktop.
  - Unified pill/meta ordering to match the “Happening now” card (pills first, then meta details).
- Updated card link behavior:
  - `Learn more →` always goes to the event landing page (`/events/[slug]`) for event items.
  - For course-style events (`type=training_session` + `programRef.sku`), the title links to the training program page (`/training/[slug]`).
  - For other events, title and `Learn more →` both link to the event landing page.
- Improved registration button states:
  - Closed events render a disabled, non-clickable button using the event’s `cta.label` (ex: “Enrollment closed”).
- Added compact chips for crowded cards:
  - Added `📜 Certificate` chip when `certificateText` is present (instead of a full row of text).
  - Moved trailer link into a compact `▶ Trailer ↗` chip and placed it first in the pill row.
- Updated the AI Workshop event record (to reduce reliance on the training catalog for listing details):
  - Updated `tagline`, `summary`, `date`, `time`, `timezone`, and `endAtUtc` in `web/src/lib/data/events/events.json`.
  - Updated `/events` date rendering to prefer `event.date` when present.
  - Updated event partner display on cards to use `partnerCode` → `web/src/lib/data/partners.ts` (instead of pulling freeform partner strings from training sessions).
- Build fix discovered while validating:
  - Fixed an unescaped quote in `web/src/routes/forms/pre-training-survey/+page.svelte` that prevented `npm --prefix web run build` from succeeding.

## Key Files Touched So Far

- Events data/model
  - `web/src/lib/data/events/events.json`
  - `web/src/lib/data/events/events.schema.json`
  - `web/src/lib/data/events/types.ts`
  - `web/src/lib/data/events/index.ts`
  - `web/src/routes/api/events.json/+server.ts`
- Events routes/UI
  - `web/src/routes/events/+page.svelte`
  - `web/src/routes/events/[slug]/+page.ts`
  - `web/src/routes/events/[slug]/+page.svelte`
  - `web/src/lib/components/CalendarPage.svelte`
  - `web/src/routes/calendar/+page.ts`
  - `web/src/routes/calendar/+page.svelte`
- Internal/admin
  - `web/src/routes/internal/events/+page.ts`
  - `web/src/routes/internal/events/+page.svelte`
  - `web/src/routes/admin/events/+page.ts`
- Campaigns/partners
  - `web/src/lib/data/campaigns.json`
  - `web/src/lib/data/partners.ts`
- Crawl/SEO metadata
  - `web/src/lib/seo.ts`
  - `web/src/routes/sitemap.xml/+server.ts`
  - `web/static/robots.txt`
- Assets
  - `web/static/images/events/vibe-coding-webinar-feb-2026.svg`

## 1) Locked Decisions (Done)

- [x] Use one public surface at `/events` for the Calendar of Events.
- [x] De-emphasize `/calendar` as a separate public destination.
- [x] Keep `/events/[slug]` landing pages for each event (full or minimal mode).
- [x] Use one JSON structure/schema for all event types.
- [x] Keep data file-driven and expose API output for automations.
- [x] Store canonical event times as `startAtUtc` and `endAtUtc` (ISO-8601 with `Z`).
- [x] Standardize official display timezone to `America/Los_Angeles` (DST-aware).
- [x] Registration is external for now (Luma); plan for Stripe later.
- [x] Keep events visible when scheduled but closed (`registrationStatus=closed`).
- [x] List events by month sections (not a visual month-grid calendar).
- [x] Each list item includes a one-line summary.
- [x] Use campaigns for CTA tracking/shortlinks into event landing pages.
- [x] Add partner support with 3-letter code conventions.
- [x] Make `web/src/lib/data/events/events.json` the canonical source for all scheduled items shown on `/events` (including training sessions).
- [x] Use `programRef.sku` (for example `CM-TR-005`) as the canonical training-to-event join key.
- [x] Use strict API split: `/api/events.json` is canonical schedule data; `/catalog.json` remains non-schedule catalog/program content.
- [x] Remove `program.sessions` as a schedule source immediately (migrate all consumers to events registry).
- [x] Add a hard validation gate for `web/src/lib/data/events/events.json` using JSON Schema (fail on invalid data).
- [x] During current dev phase, keep `/events` listing limited to two seeded entries: AI Workshop for Tech Writers and Vibe Coding Webinar.

## 2) Target Information Architecture

- [x] Public route: `/events` is the single "Calendar of Events" surface.
- [x] Public route: `/events/[slug]` for event details, countdown, and CTA.
- [x] Internal route: `/internal/events` for management workflows.
- [x] Add `/admin/events` alias/redirect to `/internal/events`.
- [x] Optional redirect strategy for `/calendar` (decide keep, alias, or canonicalize later).

## 3) Unified Event Schema (MVP)

- [x] Create `web/src/lib/data/events/events.schema.json`.
- [x] Document event `id` standard: 6-char base36 (`^[a-z0-9]{6}$`), immutable once created.
- [x] Rename canonical time fields to `startAtUtc` and `endAtUtc`.
- [x] Add visibility fields: `visibility` (`public|unlisted|draft`).
- [x] Add lifecycle fields: `lifecycleStatus` (`scheduled|postponed|canceled|completed`).
- [x] Add registration fields: `registrationStatus` (`open|closed|external|none`).
- [x] Add CTA fields (campaign-aware): `cta.label`, `cta.url`, `cta.campaignId`.
- [x] Add location object: `mode`, `publicLabel`, `detailsVisibility`.
- [x] Add partner link field(s): `partnerCode` (single partner in MVP).
- [x] Keep optional content blocks (`description`, `highlights`, `speakers`, `programRef`, `links`).

## 4) Partner + Campaign Model

- [x] Add partner catalog data file (for code/name/logo/homepage).
- [x] Define 3-letter partner code list and mapping to partner slug.
- [x] Migrate legacy event IDs from `evt_...` format to 6-char base36 standard.
- [x] Keep campaign IDs kebab-case to match existing `campaigns` schema constraints.
- [x] For each promoted event, create a campaign with `landingPath` to `/events/[slug]`.
- [x] Event landing pages support external CTA targets (Luma for now).

## 5) Route + UI Migration Plan

- [x] Remove dev-only registry/documentation blocks from public `/events` page.
- [x] Reuse `CalendarPage` layout as canonical `/events` UI (filters, visuals, countdowns).
- [x] Route event cards to `/events/[slug]` for canonical detail pages.
- [x] Ensure closed events render non-click registration state in calendar cards.
- [x] Build or update `/events/[slug]` landing template for countdown + CTA.
- [x] Add event detail back-link to related catalog training program.
- [x] Tighten calendar filter chips to avoid duplicate training labels.
- [x] Add webinar emoji on webinar filter chip.
- [x] Update SEO metadata entries for `/events` and `/calendar` redirect behavior.
- [x] Update sitemap entries for event pages once public behavior is finalized.

## 6) Time Handling and Countdown Rules

- [x] Parse countdown target from `startAtUtc` only.
- [x] Never parse timezone-less datetime strings in new events route logic.
- [x] Format official event date/time in `America/Los_Angeles`.
- [x] Optionally display viewer-local time as secondary helper text.
- [x] Use UTC timestamps for sorting and status transitions.

## 7) Data + API Work

- [x] Update `web/src/lib/data/events/types.ts` to new schema fields.
- [x] Update `web/src/lib/data/events/index.ts` list/filter/status helpers.
- [x] Update `web/src/lib/data/events/events.json` to new schema.
- [x] Add/adjust `/api` endpoint for events payload consumed by automations.
- [x] Ensure campaigns endpoint integration remains compatible.
- [x] Add a scriptable draft-event generator from training SKU + start date (`npm --prefix web run events:draft`).
- [x] Add `events.json` schema validation script (AJV) and wire it into npm scripts as a hard gate.
- [x] Remove legacy resolver compatibility fields in `web/src/lib/data/events/index.ts` after all consumers move to canonical fields.

## 8) Content + Governance Sync

- [x] Update `README.md` route notes (`/events` public model and `/calendar` role).
- [x] Update `llms.txt` if public event model messaging changes materially.
- [x] Update `ai.txt` only if policy/usage language changes (no additional policy wording changes required).
- [x] If crawl behavior changes, update `web/static/robots.txt`.
- [x] If route exposure changes, update `web/src/routes/sitemap.xml/+server.ts`.
- [x] Sync root `ai.txt` and `llms.txt` to `web/static/` if either changes.

## 9) Seed Content Tasks

- [x] Keep current AI workshop event with `registrationStatus=closed`.
- [x] Add placeholder webinar event: "Vibe Coding Webinar" (next-week date).
- [x] Add partner examples: TechLAB, Hufnagel Consulting, The Content Wrangler.
- [x] Create matching campaign entries for seeded public events.

## 10) Wishlist (Not in MVP)

- [ ] Multi-partner events (host/sponsor arrays) with multiple logos.
- [ ] Waitlist + capacity + sold-out states.
- [x] "Happening now" section on `/events`.
- [ ] Past-events archive and recap/recording policy.
- [x] Auto-hide/promote windows decision resolved as visibility/state filters: drafts auto-display only in `dev` and internal admin views, public events display when `visibility=public`, unlisted events are direct-link accessible (and visible in `dev`), and in-progress training events switch to "Happening now" with enrollment closed state.
- [ ] Stripe-native on-page checkout flow.

## 11) Next High-Value Tasks

- [x] Remove legacy event resolver compatibility layer in `web/src/lib/data/events/index.ts` once consumers are migrated.
- [x] Complete migration of `/events` and training surfaces to events-registry-only schedule reads (no `program.sessions` reads).
- [x] Remove legacy calendar listing sources so events visibility is filter-driven (`dev` can include drafts; production listings show only viewable events by visibility/status).
- [ ] Decide whether the `/events/[slug]` landing pages should display certificate/trailer chips (right now these are only on the `/events` listing cards).
- [ ] Decide whether event cards should deep-link CTA through `/c/{campaignId}` by default for attribution.
- [ ] Add editability workflow for ops (JSON editing guidance or lightweight tooling in `/internal/events`).
- [ ] Decide whether to expose partner homepage links for all partners (currently only when set in catalog).
- [x] Optional: add `/admin/events` entry point in internal docs/navigation.
- [x] Optional cleanup: normalize old event IDs (`evt_...`) to 6-char base36 after migration plan is approved.
- [x] Keep training program discovery registry-driven from `training.json` (auto-includes new entries); include in-progress courses in `dev` by default and hide drafts in production unless `includeDrafts` is explicitly enabled.
- [ ] Optional UI polish: add explicit "Archived" state treatment on `/events/[slug]` for non-promoted but reachable events.

## 12) Working Notes

- Build/deploy cadence is daily at 12:30am PT.
- For now, "stop promoting" means the event is archived from public listings (`/events`) on the next site build, not deleted; direct links (for example `/events/[slug]`) remain reachable.
- Keep published event pages reachable (no accidental 404s for shared links).
