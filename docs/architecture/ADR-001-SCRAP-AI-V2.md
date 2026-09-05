# ADR-001 — Scrap AI V2: Circular Materials Operating System

**Status:** Accepted (owner-authorized architecture change)  
**Date:** 2026-09-05  
**Supersedes:** Product boundary in `docs/ARCHITECTURE.md` (LOCKED 2026-09-05 marketplace-only). That file is **not silently edited**; it remains the V1 historical contract.

**Canonical baseline:** This ADR + `SYSTEM-ARCHITECTURE.md`. No future feature may violate this baseline without a new ADR.

---

## Previous architecture

V1 is a **simple seller/buyer marketplace**:

- Static frontend + Vercel serverless + PostgreSQL.
- One organization per session; kind is a UI preference.
- Listing → offer → accept (single winner) → pickup → optional transaction → inspection text weight → `final_weight_confirmed`.
- Indicative image AI is a button, not an intelligence platform.
- Explicit V1 non-goals: auctions/RFQ, fleet, wallet/PSP, live LME as quote, government OS, multi-RBAC, containers, weighbridge as a product.

This was a correct **MVP** to prove list/offer/accept. It is insufficient as the product north star.

---

## Why V1 is insufficient

1. The differentiator is **intelligence + operations + provenance**, not classified ads.
2. Customer types (individual / company / government) are not the same as operational roles.
3. Weight, logistics, containers, settlement, and compliance cannot live as string fields on a listing.
4. LLM-invented prices and fake tickers destroy trust in a Saudi materials market.
5. Serverless-only synchronous AI will not scale to OCR, ingestion, and matching.
6. Government disposal cannot reuse the individual seller form.

---

## New target architecture

**Product:** AI-powered circular materials operating system for Saudi Arabia.

**Shape:** **Modular monolith** (not microservices in Phase 0–9). Bounded contexts with event/outbox seams.

**Frontend:** Controlled migration to a production TypeScript app (Phase 1). Phase 0 keeps the existing static client while making AI and honesty real.

**Core loop:** Material exists → AI identification (visual estimate) → material intelligence → **price intelligence with provenance** (never LLM-invented SAR) → sell / buy / recover → match → deal → container/transport if needed → inspection → weighbridge → deterministic commercial value → payment via real PSP → evidence → analytics that feed intelligence.

**Bounded contexts:** identity, organizations, materials, ai-intelligence, pricing, marketplace, contracts, containers, logistics, weighbridge, payments, subscriptions, compliance, documents, notifications, admin, analytics, audit.

---

## Compatibility strategy

- Keep V1 tables; add columns and new tables. No destructive wipe of production users/listings/offers/transactions/`ai_analyses`.
- Keep V1 APIs working during migration (`/api/auth`, `/api/listings`, `/api/workflow`, `/api/platform`, `/api/ai-analyze`, `/api/upload`, `/api/health`).
- V2 fields are additive. Listing `status='open'|'pickup'|…` remains until marketplace state machines replace it.
- AI response **extends** the existing JSON (keeps `materialType`, labels, `confidence`) and adds visual-estimate metadata.
- Fake UI prices must be labeled disconnected, not shown as live SAR.

---

## Migration strategy

| Phase | Intent |
| --- | --- |
| 0 | Truth, Git, AI provider engine, persist+refresh E2E, schema lock, health, architecture tests |
| 1 | Tenancy, RBAC, taxonomy, audit, outbox, TS shell |
| 2 | Photo → AI → range (when sources exist) → listing → offer |
| 3–8 | Factory OS, weighbridge, logistics, containers, payments, government |
| 9–10 | Advanced AI; extract workers only when load requires |

Data: additive SQL migrations with a ledger + advisory lock. Backfill org kinds later; default existing orgs to `company` with unknown segment until onboarding.

---

## Scalability model

- Single Postgres system of record; object storage for binaries.
- Sync AI only for interactive photo analyze (timeout + fallback). Heavy OCR/ingestion on workers (Phase 1+).
- Horizontal: Vercel functions + connection pooling; `Pool max` stays small.
- Extract AI/pricing/notifications **only** when usage proves it (Phase 10).

---

## Deployment strategy

- Vercel project `scrap-ai` (existing production).
- Canonical Git branch for V2 work: `ai-first-working` until a `main` fast-forward is explicit.
- Production deploys must be attributable to Git commits (end CLI-only drift).
- Secrets only in Vercel env / secret manager. Never in the browser.

---

## Data migration strategy

1. Lock schema apply with `pg_advisory_lock` on one connection.
2. `003+` migrations: AI telemetry, analysis columns, later tenancy.
3. Preserve `ai_analyses.result` JSON; new rows include `provider`, latency, fallback, `estimate_kind`.
4. Do not invent market prices in SQL seeds. Seed **taxonomy** and **feature flags**, not fake listings.

---

## Risks

- Scope explosion if phases are built in parallel.
- Model IDs retire (already happened with Gemini 2.0 Flash) — config + fallback required.
- Premature PSP/escrow claims.
- Government “compliance” language without legal review.
- Modular monolith becoming a ball of mud without architecture tests.

---

## Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Keep marketplace-only forever | Contradicts owner mandate |
| Immediate microservices | Cost, ops, premature; no traffic justification |
| Bind domain to one LLM or one PSP | Vendor lock and outages |
| LLM calculates settlement | Non-deterministic finance |
| Show invented live SAR/kg | Trust destruction |
| Clone Alibaba / crypto dashboard UX | Wrong personality |
| `if company then seller` | False role model |

---

## Decision

Implement Scrap AI V2 as a modular monolith OS with AI, price provenance, and operations as first-class contexts. Marketplace is one context. Phase 0 is mandatory before new product surfaces.
