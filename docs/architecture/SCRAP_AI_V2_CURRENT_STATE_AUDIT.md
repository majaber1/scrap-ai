# Scrap AI V2 — Current State Audit

**Audit date:** 2026-09-05  
**Evidence sources:** repository runtime code, `db/migrations`, live `GET https://scrap-ai.vercel.app/api/health`, Git refs, Vercel production logs from prior Gemini 404 / Groq JSON failures.  
**Docs are not treated as production truth.** `docs/ARCHITECTURE.md` (LOCKED marketplace) is superseded for *product boundary* by ADR-001 after this audit; it remains a historical V1 record.

---

## Executive snapshot

Scrap AI production is a **Vercel static HTML/CSS/JS site + Node serverless `api/*.js` + PostgreSQL + Vercel Blob + multi-provider vision AI**. It is a **seller/buyer marketplace with optional indicative image analysis**, not a circular-materials operating system.

Live health (this audit):

```json
{"status":"ok","database":true,"session":true,"ai":true,"aiProvider":"gemini","aiModel":"gemini-3.6-flash","storage":true,"storageProvider":"vercel-blob"}
```

---

## Canonical branch and Git / production drift

| Item | Evidence |
| --- | --- |
| Working branch | `ai-first-working` @ `0afed36` — *Enable Vercel Blob listing photos and lock the marketplace foundation.* |
| Tracks | `origin/ai-first-working` |
| `main` | `273b1e4` — older “bright seller-buyer marketplace”; **diverged** |
| Uncommitted local work | AI (`lib/ai.cjs`), materials, health, listings/workflow, UI, docs, `.env.example` — **present at audit time** |
| Production updates | Direct `vercel --prod` from local tree occurred; GitHub `main` is **not** guaranteed to match production |

**GITHUB/PRODUCTION DRIFT:** YES (until Phase 0 commit + deploy from that commit).

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

**Production deploy of this slice was not executed in the agent session** (live deploy blocked). Until `vercel --prod` (or Git production deploy) and `npm run test:ai` pass, Phase 0 is **not complete**.

## Phase 0 scoreboard

| Gate | Status | Notes |
| --- | --- | --- |
| IMAGE ANALYSIS | **FAIL** (production unproven for this commit) | Engine implemented; live alias still previous deploy until promoted |
| REAL PROVIDER | gemini (health of current prod) | Confirm on new deploy analyze body |
| REAL MODEL | gemini-3.6-flash (health) | Confirm on new deploy analyze body |
| PRODUCTION E2E | **FAIL** | `npm run test:ai` not yet run against a deploy of this code |
| RESULT PERSISTED | **FAIL** as production proof | Code path exists; not E2E-proven on this SHA |
| RESULT SURVIVES REFRESH | **FAIL** as production proof | GET implemented; not on live until deploy |
| GITHUB/PRODUCTION DRIFT | **YES** | Uncommitted/unpushed V2 + prior CLI deploys |
| DATABASE | **PASS** connectivity; lock **in code, not live until migrate** | Advisory lock + 003 |
| AUTH | **PASS** sessions | Analyze still requires session |

Do not mark Phase 0 complete until every mandatory row is a genuine PASS (drift NO after push).
