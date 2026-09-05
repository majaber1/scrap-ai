# Roadmap — Scrap AI V2

**Rule:** Architecture + traceability before feature code. Incremental slices. No giant rewrite.

Each phase below uses: Objective, Business value, Actors, Scope, Out of scope, Dependencies, Architecture impact, Database, API, UI, Security, Tests, Exit, Metrics.

---

## Phase 0 — Recovery, truth, AI fix — COMPLETE

- **Status:** **COMPLETE.** Do not start Phase 1 until explicitly authorized.
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

## Phase 1 — V2 foundation (not started)

Tenancy, RBAC, material taxonomy, sites, org categories, audit, outbox, TS frontend shell, migrate V1 users/listings. Exit: foundations live without destroying production data or the Phase 0 regression baseline.

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

Phase 0 exit is frozen in `docs/architecture/SCRAP_AI_V2_CURRENT_STATE_AUDIT.md`. Future work must not treat a newer git SHA as the Phase 0 production baseline.
