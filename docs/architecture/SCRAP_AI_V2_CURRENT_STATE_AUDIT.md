# Scrap AI V2 — Current State Audit

**Audit date:** 2026-09-05  
**Phase 0 status:** **COMPLETE**  
**Evidence sources:** repository runtime code, `db/migrations`, live `GET https://scrap-ai.vercel.app/api/health`, `npm run test:ai`, production browser UI on `#analyze` / `#account` / `#dashboard`. Architecture baseline (ADR-001 and sibling `docs/architecture/*` specs) is unchanged; this file records Phase 0 evidence only.  
**Docs are not treated as production truth.** `docs/ARCHITECTURE.md` (LOCKED marketplace) is superseded for *product boundary* by ADR-001 after this audit; it remains a historical V1 record.

---

## Immutable Phase 0 production exit (regression baseline)

Do not treat any later git SHA as a new Phase 0 exit. Later phases must preserve this production behavior. Do not change Phase 0 architecture, AI contracts, persistence, or `npm run test:ai` unless a regression or an explicit architecture decision requires it. **Do not start Phase 1** until explicitly authorized.

| Field | Frozen value |
| --- | --- |
| Status | COMPLETE |
| Production SHA | `ed59c644e2d532776ba0fc93b0214363b7778183` |
| Production deployment | `dpl_7wJQCbVUgcDJtjHqDVWdQaz4V9bZ` |
| Production URL | https://scrap-ai.vercel.app |
| Real AI E2E | **PASS** (`npm run test:ai` with `EXPECTED_GIT_SHA` = production SHA) |
| GitHub / production drift | **NO** (`health.gitSha` matched that SHA at exit) |

Later documentation-only commits on the branch do **not** replace this runtime baseline. Production must remain this SHA until a later phase is authorized, proven, and promoted.

---

## Executive snapshot

Scrap AI production is a **Vercel static HTML/CSS/JS site + Node serverless `api/*.js` + PostgreSQL + Vercel Blob + multi-provider vision AI**. Target product (ADR-001) is a circular materials OS; **Phase 0 live slice** is real signed-in image analysis with persistence, telemetry, and honest disconnected prices.

Live health at the frozen Phase 0 exit:

```json
{"status":"ok","database":true,"session":true,"ai":true,"aiProvider":"gemini","storage":true,"storageProvider":"vercel-blob","gitSha":"ed59c644e2d532776ba0fc93b0214363b7778183","deploymentId":"dpl_7wJQCbVUgcDJtjHqDVWdQaz4V9bZ","env":"production"}
```

---

## Canonical branch and Git / production drift

| Item | Evidence |
| --- | --- |
| Working branch | `ai-first-working` |
| Immutable production SHA | `ed59c644e2d532776ba0fc93b0214363b7778183` |
| Immutable production deployment | `dpl_7wJQCbVUgcDJtjHqDVWdQaz4V9bZ` |
| `main` | Older marketplace line; Phase 0 production is this SHA via promote |
| Phase 0 product code | Intelligence engine, GET/POST `/api/ai-analyze`, schema lock — frozen on that SHA |

**GITHUB/PRODUCTION DRIFT:** **NO** at Phase 0 exit (`health.gitSha` = `ed59c644e2d532776ba0fc93b0214363b7778183`).

---

## Architecture (as running)

```
Browser (index.html, app.js, production-client.js)
  → Vercel CDN static
  → /api/* serverless (include db/migrations/**)
       → PostgreSQL (pg Pool max 3)
       → Gemini / Groq / OpenAI (lib/ai.cjs)
       → Vercel Blob (listing photos) or R2 (presign/media)
```

No Next.js, no TypeScript app, no workers, no outbox, no platform `/admin`.

---

## Database

Migrations: `db/migrations/001_core.sql`, `002_operations.sql`.  
Bootstrap: `lib/schema.cjs` `ensureSchema` on cold start — **no migration ledger**, **no advisory lock** (concurrent serverless DDL race).

Core entities: `organizations` (kind free text), `users`, `memberships` (role default owner), `scrap_listings`, `offers`, `pickups`.  
Ops: verifications, documents, `scrap_transactions` (weighbridge as **text field**), `payment_records` (never auto-verified), disputes, `ai_analyses`.

**DATABASE (connectivity):** PASS on production health.  
**DATABASE (schema governance):** FAIL vs V2 (no ledger, race, JSON-heavy ops, no taxonomy/tenancy/RBAC tables).

---

## Authentication / authorization

- Signed HttpOnly `session` cookie (`lib/server.cjs`), 7 days, HMAC, scrypt passwords.
- Register creates org + user + owner membership.
- Session `{ userId, organizationId, role }` — **APIs do not enforce RBAC**. Kind is UI preference (`buyer`/`seller`/`factory`/`both`), not capability.
- Multi-membership: `LIMIT 1` — first org wins.

**AUTH (session + DB login):** PASS (health + production smoke register/login).  
**AUTH (RBAC / tenant isolation tests):** FAIL vs V2.

---

## Listings / offers / transactions

- Public `GET /api/listings` open listings.
- Authenticated workflow: create listing, one submitted offer per buyer, accept declines others, listing → `pickup`, pickup row.
- Transactions: separate `createTransaction`; inspection writes weight/purity/ticket; `final_amount = weight * price_per_unit` (deterministic). Settlement blocked without PSP + verified payment (verified status **unreachable** in code).

---

## AI analysis (pre–Phase 0 code)

- `POST /api/ai-analyze` requires session, 20/org/hour, JPEG/PNG/WebP data URL, persists `ai_analyses`.
- Providers: Gemini → Groq → OpenAI; models env-overridable with flash fallbacks after **gemini-2.0-flash 404**.
- Groq strict `json_object` previously failed; later patched to free-form JSON extract.
- **No GET** to reload analyses after refresh (UI last result is in-memory / localStorage drafts).
- Schema is a short marketplace JSON; does not distinguish VISUAL ESTIMATE vs VERIFIED VALUE as first-class fields.
- No Zod, no circuit breaker, no telemetry table, no cost metrics.

**IMAGE ANALYSIS (this audit, before Phase 0 implementation):** historically FAIL in production (502, Gemini 404). Health after model bump: provider configured. **Logged-in browser E2E persist+refresh not proven at audit start.**

---

## Uploads

Blob `store` for listing photos; R2 `presign`/`complete` unused by current listing UI. Platform GET `storageConfigured` checks **R2 only** (disagrees with health Blob).

---

## Payments

Records only. No PSP adapter, no webhook. Do not claim escrow.

---

## Tests

- `npm test` → static markers + `node --check`. **Not** live AI.
- `npm run test:prod` → register → listing → offer → accept → inspect → `final_weight_confirmed`. Warns if AI off; **does not POST /api/ai-analyze**.

---

## UI honesty issues (no-fake-data)

- Public marketplace uses `/api/listings` (real).
- Phase 0 removed fake SAR ticker numbers and sample buyers/listings from `app.js`. Price UI says source not connected.
- Guest analyze requires login (honest).

---

## V1 locked docs vs code

`docs/ARCHITECTURE.md` remains the V1 historical lock with a supersession banner. Canonical baseline is ADR-001.

---

## Phase 0 implementation in this repo (2026-09-05)

Shipped and frozen in production at the exit SHA above:

- `lib/intelligence/*` provider registry, timeout, retry, circuit, Zod, fallback
- `GET /api/ai-analyze` for refresh
- `003_ai_intelligence.sql` + `pg_advisory_lock`
- Architecture tests: `scripts/architecture-check.mjs`
- Production E2E script: `npm run test:ai` (register → labeled scrap fixture → POST → GET; schema/telemetry/persist only)

Fixture: `tests/fixtures/PHASE0_TEST_FIXTURE_scrap_photo.jpg` (Wikimedia scrap-metal pile, test-only; no hardcoded material/price assertions).

## Phase 0 scoreboard

| Gate | Status | Notes |
| --- | --- | --- |
| IMAGE ANALYSIS | **PASS** | Production `#analyze` file input → `publicImageData` → `POST /api/ai-analyze`; `npm run test:ai` HTTP 200 |
| REAL PROVIDER | **PASS** | UI + API telemetry `gemini` (not mock) |
| REAL MODEL | **PASS** | UI `gemini-3.5-flash-lite`; earlier same SHA `gemini-3.7-flash`. Health lists configured Gemini/Groq models. |
| PRODUCTION E2E | **PASS** | `EXPECTED_GIT_SHA=ed59c644e2d532776ba0fc93b0214363b7778183 npm run test:ai` PASS. Schema only: `estimateKind`, `labCertifiedPurity`, `physicalConfirmationRequired`, labels, confidence, provider/model/fallback/latency |
| RESULT PERSISTED | **PASS** | Analysis ids returned; `GET /api/ai-analyze` count ≥ 1; UI analysis id in session |
| RESULT SURVIVES REFRESH | **PASS** | After navigation: `#result` still showed تقدير بصري + provider/model; account card `تقدير بصري — ليس فحص مختبر`; dashboard `#history` listed تقدير بصري · gemini; GET still returned the id |
| BROWSER VISIBILITY | **PASS** | Signed-in production UI, not API-only |
| GITHUB/PRODUCTION DRIFT | **NO** | Live `gitSha` = `ed59c644e2d532776ba0fc93b0214363b7778183` at exit |
| DATABASE | **PASS** | Health `database: true`; analyses persist |
| AUTH | **PASS** | Analyze requires session; re-login GET in `test:ai` PASS |

**Phase 0 is COMPLETE.** This scoreboard plus the frozen SHA/deployment/URL above is the regression baseline every future phase must preserve. Do not start Phase 1 until explicitly authorized.
