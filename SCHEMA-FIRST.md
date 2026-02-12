# Schema-First Development Standard

This repository follows a strict **schema-first** rule for event/campaign data and API contracts.

## Core rule

If a field is added, removed, renamed, or has enum/pattern/required changes:

1. Update the relevant schema first.
2. Then update data files and code.
3. Then validate.
4. Then update SOP/docs examples.

No exceptions.

## Canonical sources of truth

### Registry schemas

- `web/src/lib/data/events/events.schema.json`
- `web/src/lib/data/campaigns.schema.json`

### API response schemas

- `web/src/lib/data/api/schemas/events-api.schema.json`
- `web/src/lib/data/api/schemas/campaigns-api.schema.json`
- `web/src/lib/data/api/schemas/enums-api.schema.json`
- `web/src/lib/data/api/schemas/catalog-api.schema.json`

### Registry data

- `web/src/lib/data/events/events.json`
- `web/src/lib/data/campaigns.json`

### API payload builders (must stay schema-aligned)

- `web/src/lib/data/api/events.ts`
- `web/src/lib/data/api/campaigns.ts`
- `web/src/lib/data/api/enums.ts`
- `web/src/lib/data/api/catalog.ts`

### UI adapter layer (default for UI reads)

- `web/src/lib/view-models/events.ts`
- `web/src/lib/view-models/campaigns.ts`

## Required validation gates

Run these before merge:

- `npm --prefix web run validate:events`
- `npm --prefix web run validate:campaigns`
- `npm --prefix web run validate:api`
- `npm --prefix web run validate:ui-adapters`

## Required propagation checklist

When changing schema/data contracts:

1. Update schema(s)
2. Update registry JSON (if needed)
3. Update API payload builders
4. Update affected route handlers
5. Update UI adapters
6. Update SOP page (`web/src/routes/admin/sop/+page.svelte`)
7. Run validation gates (including UI adapter validation)

## Examples of expected behavior

- Add new field `rainyDays`: add to schema first, then data/builders/adapters/UI.
- Rename `publicLabel` to `label`: update schema first, then refactor all code paths and UI adapters.
- Remove `cta`: remove from schema first, then remove or redesign all dependent UI/logic.
