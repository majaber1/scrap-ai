# Scrap AI V2 — Current State Audit

**Audit date:** 2026-09-05  
**Evidence sources:** repository runtime code, `db/migrations`, live `GET https://scrap-ai.vercel.app/api/health`, `npm run test:ai`, production browser UI on `#analyze` / `#account` / `#dashboard`. Architecture baseline (ADR-001 and sibling `docs/architecture/*` specs) is unchanged; this file records Phase 0 evidence only.  
**Docs are not treated as production truth.** `docs/ARCHITECTURE.md` (LOCKED marketplace) is superseded for *product boundary* by ADR-001 after this audit; it remains a historical V1 record.

---

## Executive snapshot

Scrap AI production is a **Vercel static HTML/CSS/JS site + Node serverless `api/*.js` + PostgreSQL + Vercel Blob + multi-provider vision AI**. Target product (ADR-001) is a circular materials OS; **Phase 0 live slice** is real signed-in image analysis with persistence, telemetry, and honest disconnected prices.

Live health at E2E SHA `b1370c7302c8530585afb47c07ffd8ffe935c802` / `dpl_D3SPFZe7i7ePsE8a1DTe8JekPUAe`:

```json
{"status":"ok","database":true,"session":true,"ai":true,"aiProvider":"gemini","storage":true,"storageProvider":"vercel-blob","gitSha":"b1370c7302c8530585afb47c07ffd8ffe935c802","env":"production"}
```

---

## Canonical branch and Git / production drift

| Item | Evidence |
| --- | --- |
| Working branch | `ai-first-working` |
| Production gitSha at E2E | `b1370c7302c8530585afb47c07ffd8ffe935c802` |
| `main` | Older marketplace line; production of this slice is `ai-first-working` via promote |
| Phase 0 product code | Intelligence engine, GET/POST `/api/ai-analyze`, schema lock — live on that SHA |

**GITHUB/PRODUCTION DRIFT:** **NO** for Phase 0 product runtime at the E2E SHA above (`health.gitSha` matched `EXPECTED_GIT_SHA`). Follow-up commits that only add the labeled scrap fixture + this scoreboard must be promoted before claiming drift NO on a newer SHA.

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

Shipped in working tree (pending production deploy + Git push):

- `lib/intelligence/*` provider registry, timeout, retry, circuit, Zod, fallback
- `GET /api/ai-analyze` for refresh
- `003_ai_intelligence.sql` + `pg_advisory_lock`
- Architecture tests: `scripts/architecture-check.mjs`
- Production E2E script: `npm run test:ai` (register → real photo → POST → GET)

Production of this slice is live (`dpl_D3SPFZe7i7ePsE8a1DTe8JekPUAe`). Fixture used for E2E/UI: `tests/fixtures/PHASE0_TEST_FIXTURE_scrap_photo.jpg` (Wikimedia scrap-metal pile, test-only; no hardcoded material/price assertions).

## Phase 0 scoreboard

| Gate | Status | Notes |
| --- | --- | --- |
| IMAGE ANALYSIS | **PASS** | Production `#analyze` file input → `publicImageData` → `POST /api/ai-analyze`; `npm run test:ai` HTTP 200 |
| REAL PROVIDER | **PASS** | UI + API telemetry `gemini` (not mock) |
| REAL MODEL | **PASS** | UI `gemini-3.5-flash-lite`; earlier same SHA `gemini-3.7-flash`. Health lists configured Gemini/Groq models. |
| PRODUCTION E2E | **PASS** | `EXPECTED_GIT_SHA=b1370c7… npm run test:ai` PASS. Schema only: `estimateKind`, `labCertifiedPurity`, `physicalConfirmationRequired`, labels, confidence, provider/model/fallback/latency |
| RESULT PERSISTED | **PASS** | Analysis ids returned; `GET /api/ai-analyze` count ≥ 1; UI analysis id in session |
| RESULT SURVIVES REFRESH | **PASS** | After navigation: `#result` still showed تقدير بصري + provider/model; account card `تقدير بصري — ليس فحص مختبر`; dashboard `#history` listed تقدير بصري · gemini; GET still returned the id |
| BROWSER VISIBILITY | **PASS** | Signed-in production UI, not API-only |
| GITHUB/PRODUCTION DRIFT | **NO** | Live `gitSha` matched E2E SHA for product code |
| DATABASE | **PASS** | Health `database: true`; analyses persist |
| AUTH | **PASS** | Analyze requires session; re-login GET in `test:ai` PASS |

Phase 0 product exit is **PASS** on the evidence above. Do not start Phase 1 until a later SHA is promoted if you need the labeled fixture file itself on the production gitSha.
