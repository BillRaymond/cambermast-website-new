# Purpose: QR Campaign Registry

This folder contains `qr-campaigns.json`, the source of truth for QR campaigns used on the Cambermast site. The data powers:
- The `/campaigns` management page.
- The `/api/qr-campaigns.json` endpoint.
- The QR generator and tracking URLs (UTM parameters).

## How to add or update a campaign

Each entry represents one campaign and must stay stable over time. The `id` and `params.utm_content` should be short, human-readable, and consistently kebab-cased (lowercase words separated by single dashes). Keep them concise so QR codes remain small and readable.

**Examples of good values**
- `techlab-go`
- `standing-signage-sc`
- `partner-demo-01`

**Avoid**
- Spaces or underscores (`techlab go`, `techlab_go`)
- Long or verbose phrases
- Changing `id` or `utm_content` after printing codes

## Schema reference

Use `qr-campaigns.schema.json` as the JSON Schema reference for field names, types, and validation rules.
