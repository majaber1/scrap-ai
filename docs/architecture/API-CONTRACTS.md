# API Contracts (Phase 0 + V1)

Existing: `GET/POST /api/auth`, `GET /api/listings`, `GET/POST /api/workflow`, `GET/POST /api/platform`, `POST /api/upload`, `GET /api/media`, `GET /api/health`.

## `/api/ai-analyze`

**POST** (session): `{ imageDataUrl, city?, estimatedWeightKg?, notes? }`  
200: `{ analysis, provider, model, fallbackUsed, latencyMs, notice }`  
`analysis.estimateKind` = `VISUAL_ESTIMATE`. `analysis.labCertifiedPurity` = false.  
Errors: 401, 400 invalid_image/image_too_large, 429 hourly, 502 ai_analysis_failed, 503 ai_not_configured.

**GET** (session): `{ analyses: [{ id, createdAt, provider, model, result }] }` last 20 for org.

Health extras: `aiProvider`, `aiModel`, `schemaLock: true` when advisory path used.
