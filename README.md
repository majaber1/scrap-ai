# Scrap AI by EADA

Saudi-first bilingual scrap intake, indicative valuation and transaction-workflow product. The repository started as a browser-local prototype, but the current `main` now includes serverless APIs for authentication, PostgreSQL-backed platform data, AI analysis, Cloudflare R2 uploads and workflow transitions.

## Operational source of truth

Last verified: **2026-08-26**.

| Layer | Canonical source | Current verified state |
| --- | --- | --- |
| Code | `main` in this repository | Static bilingual frontend + serverless `/api/*` backend |
| Production | `https://scrap-ai.vercel.app` | Deployed |
| Health | `GET /api/health` | DB/session healthy; reports AI and storage readiness explicitly |
| Database | `DATABASE_URL` | PostgreSQL implementation present and production health reports database ready |
| Sessions | `SESSION_SECRET` | Signed HttpOnly session implementation present and production health reports session ready |
| AI | `OPENAI_API_KEY` + optional `OPENAI_MODEL` | API implementation present; production health currently reports AI not configured |
| Object storage | Cloudflare R2 via `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Upload implementation present; production health currently reports storage not configured |
| Architecture | `docs/ARCHITECTURE.md` | Canonical architecture document |

**Runtime health overrides prose.** Historical QA reports describe the state at the time they were written. For current operational readiness, use current `main` plus `https://scrap-ai.vercel.app/api/health`.

Machine-readable portfolio metadata is in `.jaber-dashboard.json` for Jaber Dashboard synchronization.

## Current capabilities

- Arabic/English responsive web experience
- Scrap intake and material scenarios
- Indicative valuation and route recommendation
- Account/session API
- PostgreSQL-backed platform API
- AI-assisted image/material analysis endpoint
- Cloudflare R2-compatible upload endpoint
- Workflow endpoint for transaction progression
- Browser-side experience plus durable server-side services when production dependencies are configured
- Safe health endpoint that reports dependency readiness without returning secrets

## Important product limits

Scrap AI does **not** provide certified grading, laboratory inspection, binding quotations, guaranteed live prices, legal ownership verification or guaranteed buyer availability. AI and calculated values are indicative and must be confirmed by physical inspection, weighing, purity testing and a current counterparty quote before a real transaction is finalized.

## Local run

```powershell
npm install
npm run serve
npm test
```

For local production-service testing, copy `.env.example` and provide only the services you intend to test.

## Production environment

Core durable operation:

```text
DATABASE_URL
SESSION_SECRET
```

AI analysis:

```text
OPENAI_API_KEY
OPENAI_MODEL
```

Cloudflare R2 uploads:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
```

Never commit secret values. The health endpoint reports only boolean/readiness state.

## Health

`GET /api/health`

A healthy HTTP response does not imply every optional provider is enabled. Read the returned `database`, `session`, `ai`, `storage` and `storageProvider` fields individually.

## Architecture and QA

See:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — current runtime architecture and dependency boundaries
- [`docs/PRODUCT_AUDIT.md`](docs/PRODUCT_AUDIT.md) — product audit snapshot
- [`docs/FINAL_QA_QC_REPORT.md`](docs/FINAL_QA_QC_REPORT.md) — historical QA/QC evidence
- [`docs/LIVE_QA_REPORT.md`](docs/LIVE_QA_REPORT.md) — live QA evidence at its recorded test date

Older reports are evidence, not the current operational source of truth.
