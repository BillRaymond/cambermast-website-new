# Purpose: Campaign and Partner Registry

This area documents how Cambermast manages campaigns and partner-facing pages.

## What we're doing here

- Maintain a single source of truth for campaigns, including partner ownership and tracking parameters.
- Render an internal campaigns registry for operational tracking.
- Render partner-friendly QR pages that only show production links and downloadable QR assets.
- Serve campaign data through canonical JSON and API contracts.

## How to add or update a campaign

Each entry represents one campaign and must stay stable over time. The `id` and `params.utm_content` should be short, human-readable, and consistently kebab-cased (lowercase words separated by single dashes). Keep them concise so QR codes remain small and readable.
The `partner` field is used to group campaigns for partner-specific views; it should also be kebab-cased to match the partner URL slug.
If you need a “proper name” (casing, spacing) for display in the UI, set `partnerLabel` on the campaign entry.

**Examples of good values**

- `techlab-go`
- `standing-signage-sc`
- `partner-demo-01`

**Avoid**

- Spaces or underscores (`techlab go`, `techlab_go`)
- Long or verbose phrases
- Changing `id` or `utm_content` after printing codes

## Schema reference

Use `campaigns.schema.json` as the JSON Schema reference for field names, types, and validation rules.

## Where the data lives

- Campaign data JSON: `web/src/lib/data/campaigns.json`
- Schema: `web/src/lib/data/campaigns.schema.json`
