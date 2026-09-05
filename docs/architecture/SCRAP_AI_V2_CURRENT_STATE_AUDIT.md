# Scrap AI V2 — Current State Audit

**Audit date:** 2026-09-05  
**Phase 0 status:** **COMPLETE** (immutable AI regression baseline)  
**Phase 1 status:** **COMPLETE** (current production runtime)  
**Phase 2 status:** **NOT STARTED**  
**Evidence sources:** live `GET https://scrap-ai.vercel.app/api/health`, `npm run test:ai`, `npm run test:prod`, `npm run test:phase1-api`, `scripts/phase1-browser.mjs`. Architecture baseline remains ADR-001.  
**Docs are not treated as production truth.** `docs/ARCHITECTURE.md` (LOCKED marketplace) is superseded for *product boundary* by ADR-001; it remains a historical V1 record.

---

## Immutable Phase 1 production exit (current runtime baseline)

Do not treat any later git SHA as a new Phase 1 exit. Later phases must preserve this production behavior and the frozen Phase 0 AI path. Documentation-only commits do **not** redefine this runtime baseline. Production must remain this SHA until a later phase is authorized, proven, and promoted. **Do not start Phase 2** until explicitly authorized.

| Field | Frozen value |
| --- | --- |
| Status | COMPLETE |
| Production SHA | `054840a9401931460e54563b0dd5ee9afc33a10d` |
| Production deployment | `dpl_DeyCdrxrZz52YFJgrEcMz5ertn5T` |
| Production URL | https://scrap-ai.vercel.app |
| Phase 0 regression | **PASS** (`npm run test:ai`) |
| Phase 1 production validation | **PASS** |
| Marketplace regression | **PASS** (`npm run test:prod`) |
| Tenant isolation | **PASS** |
| RBAC | **PASS** |
| Production health | **PASS** |
| GitHub / production drift | **NO** (`health.gitSha` matched that SHA at exit) |

Migrations applied: `004_phase1_foundation.sql`, `005_phase1_column_repair.sql`.

Tables added: `permissions`, `roles`, `role_permissions`, `membership_roles`, `platform_roles`, `sites`, `material_families`, `materials`, `material_grades`, `material_aliases`, `audit_events`, `domain_outbox`, `feature_flags`.

Tables altered: `organizations.customer_segment`, `users.active_organization_id`.

V1 tables dropped: **NONE**. Existing records lost: **NONE**.

---

## Immutable Phase 0 production exit (AI regression baseline)

Do not treat any later git SHA as a new Phase 0 exit. Later phases must preserve this production AI behavior. Do not change Phase 0 architecture, AI contracts, persistence, or `npm run test:ai` unless a regression or an explicit architecture decision requires it. Phase 1 is complete; this SHA remains the Phase 0 runtime freeze, not the current production SHA.

| Field | Frozen value |
| --- | --- |
| Status | COMPLETE |
| Production SHA | `ed59c644e2d532776ba0fc93b0214363b7778183` |
| Production deployment | `dpl_7wJQCbVUgcDJtjHqDVWdQaz4V9bZ` |
| Production URL | https://scrap-ai.vercel.app |
| Real AI E2E | **PASS** (`npm run test:ai` with `EXPECTED_GIT_SHA` = production SHA) |
| GitHub / production drift | **NO** (`health.gitSha` matched that SHA at exit) |

Later documentation-only commits on the branch do **not** replace this Phase 0 runtime freeze. Current production is the Phase 1 SHA above.

---

## Executive snapshot

Scrap AI production is a **Vercel static HTML/CSS/JS site + `/v2` TypeScript shell + Node serverless `api/*.js` (including `/api/v2/*`) + PostgreSQL + Vercel Blob + multi-provider vision AI**. Target product (ADR-001) is a circular materials OS. **Phase 1 live slice** adds tenancy, RBAC, sites, taxonomy, audit, outbox, and `/v2` while preserving the Phase 0 AI path and V1 marketplace APIs.

Live health at the frozen Phase 1 exit:

```json
{"status":"ok","database":true,"session":true,"ai":true,"aiProvider":"gemini","storage":true,"storageProvider":"vercel-blob","v2Shell":true,"gitSha":"054840a9401931460e54563b0dd5ee9afc33a10d","deploymentId":"dpl_DeyCdrxrZz52YFJgrEcMz5ertn5T","env":"production"}
```

Phase 0 exit health (historical freeze, not current SHA):

```json
{"status":"ok","database":true,"session":true,"ai":true,"aiProvider":"gemini","storage":true,"storageProvider":"vercel-blob","gitSha":"ed59c644e2d532776ba0fc93b0214363b7778183","deploymentId":"dpl_7wJQCbVUgcDJtjHqDVWdQaz4V9bZ","env":"production"}
```

---

## Canonical branch and Git / production drift

| Item | Evidence |
| --- | --- |
| Working branch | `ai-first-working` |
| Current production SHA (Phase 1 freeze) | `054840a9401931460e54563b0dd5ee9afc33a10d` |
| Current production deployment | `dpl_DeyCdrxrZz52YFJgrEcMz5ertn5T` |
| Immutable Phase 0 AI SHA | `ed59c644e2d532776ba0fc93b0214363b7778183` |
| Immutable Phase 0 AI deployment | `dpl_7wJQCbVUgcDJtjHqDVWdQaz4V9bZ` |
| `main` | Older marketplace line; current production is Phase 1 SHA via promote |

**GITHUB/PRODUCTION DRIFT:** **NO** at Phase 1 exit (`health.gitSha` = `054840a9401931460e54563b0dd5ee9afc33a10d`). Phase 0 drift was **NO** at the Phase 0 exit SHA.

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

**Phase 0 is COMPLETE.** This scoreboard plus the frozen Phase 0 SHA/deployment/URL is the AI regression baseline every future phase must preserve.

---

## Phase 1 implementation freeze (2026-09-05)

Shipped and frozen in production at SHA `054840a9401931460e54563b0dd5ee9afc33a10d`, deployment `dpl_DeyCdrxrZz52YFJgrEcMz5ertn5T`:

- Additive tenancy: `customer_segment` (`UNKNOWN` / `INDIVIDUAL` / `COMPANY_FACTORY` / `GOVERNMENT`), `active_organization_id`
- Normalized RBAC (`roles`, `permissions`, `membership_roles`) with server-side authorization
- Sites, material taxonomy (AR/EN, no fake prices), append-only audit, transactional outbox
- TypeScript `/v2` shell (Arabic-first RTL); V1 root retained
- V1 APIs preserved; `/api/v2/*` Hobby-safe catch-all
- Phase 0 AI path unchanged and re-proven on this SHA

## Phase 1 scoreboard

| Gate | Status |
| --- | --- |
| Architecture compliance | **PASS** |
| Additive production-safe migrations | **PASS** (`004`, `005`) |
| Existing V1 data preserved | **PASS** (no V1 drops; no records lost) |
| Customer segmentation | **PASS** |
| Tenant isolation | **PASS** |
| Multi-role RBAC | **PASS** |
| Sites | **PASS** |
| Material taxonomy (AR/EN) | **PASS** |
| Audit / outbox | **PASS** |
| TypeScript `/v2` + Arabic RTL | **PASS** |
| Individual / company onboarding | **PASS** |
| V1 API compatibility | **PASS** |
| Public marketplace regression | **PASS** |
| Phase 0 AI E2E regression | **PASS** |
| Health | **PASS** |
| Git SHA = production | **PASS** `054840a9401931460e54563b0dd5ee9afc33a10d` |
| GitHub / production drift | **NO** |
| Phase 2 | **NOT STARTED** |

**Phase 1 is COMPLETE.** This scoreboard plus the frozen Phase 1 SHA/deployment/URL above is the current production baseline. Do not start Phase 2 until explicitly authorized.
