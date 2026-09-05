# API Contracts (Phase 0 + V1 + Phase 1 additive)

Existing: `GET/POST /api/auth`, `GET /api/listings`, `GET/POST /api/workflow`, `GET/POST /api/platform`, `POST /api/upload`, `GET /api/media`, `GET /api/health`.

Phase 1 additive (session required unless noted):

- `GET /api/v2/me`
- `GET|PATCH /api/v2/organization` (PATCH body `{ name?, customerSegment }`)
- `GET|POST /api/v2/sites` ; `GET|PATCH /api/v2/sites/:id`
- `GET /api/v2/materials`
- `GET|POST /api/v2/members` ; `PATCH /api/v2/members/:id` `{ roles }`
- `POST /api/v2/session` `{ organizationId }` active org switch

`customerSegment`: `UNKNOWN` | `INDIVIDUAL` | `COMPANY_FACTORY` | `GOVERNMENT`.

V1 auth user JSON may include additive `customer_segment`.

## `/api/ai-analyze`

**POST** (session): `{ imageDataUrl, city?, estimatedWeightKg?, notes? }`  
200: `{ analysis, provider, model, fallbackUsed, latencyMs, notice }`  
`analysis.estimateKind` = `VISUAL_ESTIMATE`. `analysis.labCertifiedPurity` = false.  
Errors: 401, 400 invalid_image/image_too_large, 429 hourly, 502 ai_analysis_failed, 503 ai_not_configured.

**GET** (session): `{ analyses: [{ id, createdAt, provider, model, result }] }` last 20 for org.

Health extras: `aiProvider`, `aiModel`, `schemaLock: true` when advisory path used.
