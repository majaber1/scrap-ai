# Roadmap — Scrap AI V2

**Rule:** Architecture + traceability before feature code. Incremental slices. No giant rewrite.

Each phase below uses: Objective, Business value, Actors, Scope, Out of scope, Dependencies, Architecture impact, Database, API, UI, Security, Tests, Exit, Metrics.

---

## Phase 0 — Recovery, truth, AI fix — COMPLETE

- **Status:** **COMPLETE.** Immutable AI regression baseline. Phase 1 is complete. Do not start Phase 2 until explicitly authorized.
- **Objective:** Production image analysis is real, persisted, refresh-safe; Git/prod drift closed; schema apply safe.  
- **Value:** Trust in the core differentiator.  
- **Actors:** Individual (logged-in), platform (ops via health).  
- **Scope:** Provider registry, config models, timeout/retry/circuit/fallback, Zod, telemetry, GET analyses, honesty of disconnected prices, advisory lock, architecture tests, production E2E.  
- **Out of scope:** Next.js rewrite, RBAC, PSP, logistics, auctions, government UI.  
- **Dependencies:** Existing Gemini/Groq/OpenAI keys, Postgres, Blob.  
- **Exit (immutable production baseline):** all mandatory audit scoreboard rows PASS. Frozen runtime:
  - Production SHA: `ed59c644e2d532776ba0fc93b0214363b7778183`
  - Production deployment: `dpl_7wJQCbVUgcDJtjHqDVWdQaz4V9bZ`
  - Production URL: https://scrap-ai.vercel.app
  - Real AI E2E: **PASS**
  - GitHub / production drift: **NO**
- **Regression rule:** Every later phase must preserve this production behavior. Do not modify Phase 0 architecture, AI contracts, persistence, or production E2E unless a regression or an explicit architecture decision requires it. Later git commits do not replace this SHA as the Phase 0 exit.
- **Metrics:** analysis success, fallback rate, latency, persist rate.
- **Evidence:** `docs/architecture/SCRAP_AI_V2_CURRENT_STATE_AUDIT.md`

---

## Phase 1 — V2 foundation — COMPLETE

- **Status:** **COMPLETE.** Do not start Phase 2 until explicitly authorized.
- **Objective:** Tenancy, RBAC, sites, taxonomy, audit, outbox, TypeScript `/v2` shell, V1 compatibility, Phase 0 AI preserved.
- **Out of scope:** Price intelligence, auto-filled sell listing, matching, auctions, RFQ, logistics, weighbridge, PSP, government procurement.
- **Exit (immutable production baseline):** Phase 1 production validation PASS. Frozen runtime:
  - Production SHA: `054840a9401931460e54563b0dd5ee9afc33a10d`
  - Production deployment: `dpl_DeyCdrxrZz52YFJgrEcMz5ertn5T`
  - Production URL: https://scrap-ai.vercel.app
  - Phase 0 AI E2E: **PASS**
  - Marketplace regression: **PASS**
  - Tenant isolation: **PASS**
  - RBAC: **PASS**
  - Production health: **PASS**
  - GitHub / production drift: **NO**
- **Migrations:** `004_phase1_foundation.sql`, `005_phase1_column_repair.sql` (additive). V1 tables dropped: NONE. Existing records lost: NONE.
- **Regression:** Phase 0 SHA `ed59c644e2d532776ba0fc93b0214363b7778183` remains the AI contract freeze. Current production is the Phase 1 SHA. `npm run test:ai` must remain PASS.
- **UI:** `/v2` is additive. V1 root remains.
- **Evidence:** `docs/architecture/SCRAP_AI_V2_CURRENT_STATE_AUDIT.md`

---

## Phase 2 — Intelligent selling

Photo intake, auto-filled listing, taxonomy map, price intelligence **foundation** (provenance or “not connected”), matching start, offers compare. Exit: photo → AI → range-or-honest-empty → real listing → real offer.

---

## Phase 3 — Factory / company OS

Streams, teams, approvals, RFQ/contract foundation, company dashboard.

---

## Phase 4 — Weighbridge

Sessions, tickets, OCR+confirm, gross/tare/net, discrepancy, evidence.

---

## Phase 5 — Logistics

Carriers, requests, quotes, vehicle/driver, states, POD, license metadata (no fabricated permits).

---

## Phase 6 — Containers

Catalog, rental, delivery/swap/pickup, billing (no fake availability).

---

## Phase 7 — Payments & subscriptions

Only after PSP selected. Adapter, sandbox, webhooks, entitlements, ZATCA-ready invoice **architecture**.

---

## Phase 8 — Government

Departments, SoD workflows, qualified list, auctions/sealed bids, award, audit pack.

---

## Phase 9 — Advanced AI

Forecasting, anomalies, fraud, generation forecast, optimization — still no LLM settlement.

---

## Phase 10 — Scale

Extract workers/services **when usage requires**. Not by fashion.

---

## Document updates

Every phase updates FEATURE-TRACEABILITY.md and the relevant architecture file before coding.

Phase 0 and Phase 1 exits are frozen in `docs/architecture/SCRAP_AI_V2_CURRENT_STATE_AUDIT.md`. Future work must not treat a newer git SHA as the Phase 0 or Phase 1 production baseline. Phase 2 is NOT STARTED.
