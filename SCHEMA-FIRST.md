# Schema-First Development Standard

This entire site follows a strict **schema-first** rule.
All structured data contracts across the website must be defined by schema first, then implemented in data, APIs, UI adapters, and docs.

## Scope

Schema-first applies to all structured website data, including:

- Content registries
- API response payloads
- Enums, patterns, and status values
- Any UI behavior that depends on structured fields

## Core rule

If a field is added, removed, renamed, or has enum/pattern/required changes:

1. Update the relevant schema first.
2. Then update data files and code.
3. Then validate.
4. Then update SOP/docs examples.

No exceptions.

## Schema -> API -> SOP rule

For every registry schema in `web/src/lib/data/**`:

1. Maintain a public read-only API endpoint (`/api/<domain>.json` or documented equivalent).
2. Maintain a matching API response schema in `web/src/lib/data/api/schemas/`.
3. Maintain a matching API payload builder in `web/src/lib/data/api/`.
4. Maintain admin SOP documentation in a relevant `/admin/sop*` route.

If no existing SOP page fits the domain, add a new route under `/admin/sop-<domain>`.

## Canonical sources of truth

### Registry schemas

- `web/src/lib/data/events/events.schema.json`
- `web/src/lib/data/campaigns.schema.json`
- `web/src/lib/data/catalog.schema.json`
- `web/src/lib/data/tools.schema.json`
- `web/src/lib/data/testimonials.schema.json`

### API response schemas

- `web/src/lib/data/api/schemas/events-api.schema.json`
- `web/src/lib/data/api/schemas/campaigns-api.schema.json`
- `web/src/lib/data/api/schemas/enums-api.schema.json`
- `web/src/lib/data/api/schemas/catalog-api.schema.json`
- `web/src/lib/data/api/schemas/tools-api.schema.json`
- `web/src/lib/data/api/schemas/testimonials-api.schema.json`

### Registry data

- `web/src/lib/data/events/events.json`
- `web/src/lib/data/campaigns.json`
- `web/src/lib/data/catalog.json`
- `web/src/lib/data/tools.json`
- `web/src/lib/data/testimonials.json`

### API payload builders (must stay schema-aligned)

- `web/src/lib/data/api/events.ts`
- `web/src/lib/data/api/campaigns.ts`
- `web/src/lib/data/api/enums.ts`
- `web/src/lib/data/api/catalog.ts`
- `web/src/lib/data/api/tools.ts`
- `web/src/lib/data/api/testimonials.ts`

### UI adapter layer (default for UI reads)

- `web/src/lib/view-models/events.ts`
- `web/src/lib/view-models/campaigns.ts`

## Required validation gates

Run these before merge:

- `npm --prefix web run validate:events`
- `npm --prefix web run validate:campaigns`
- `npm --prefix web run validate:registries`
- `npm --prefix web run validate:api`
- `npm --prefix web run validate:schema-governance`
- `npm --prefix web run validate:ui-adapters`

## Required propagation checklist

When changing schema/data contracts:

1. Update registry schema(s)
2. Update registry JSON (if needed)
3. Update API schema(s)
4. Update API payload builder(s)
5. Update affected API route handler(s)
6. Update UI adapters
7. Update relevant SOP page(s) under `/admin/sop*`
8. Run validation gates (including registry, API, governance, and UI adapter validation)

## Examples of expected behavior

- Add new field `rainyDays`: add to schema first, then data/builders/adapters/UI.
- Rename `publicLabel` to `label`: update schema first, then refactor all code paths and UI adapters.
- Remove `cta`: remove from schema first, then remove or redesign all dependent UI/logic.
