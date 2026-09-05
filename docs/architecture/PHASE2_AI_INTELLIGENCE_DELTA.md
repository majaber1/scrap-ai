# Phase 2 architecture delta — AI scrap intelligence

**Status:** Phase 2A discovery complete. This document is the missing architecture slice. It does **not** authorize Phase 3.

**Date:** 2026-09-05  
**Branch:** `ai-first-working`  
**Git HEAD at discovery:** `76d233bcba479f0dd77040aabf451baf47f8b01c`

---

## 1. Production baseline verification

| Baseline | Expected (Phase 1 freeze) | Observed at discovery |
| --- | --- | --- |
| Phase 1 SHA | `054840a9401931460e54563b0dd5ee9afc33a10d` | Still the **immutable Phase 1 tenancy freeze** |
| Phase 1 deployment | `dpl_DeyCdrxrZz52YFJgrEcMz5ertn5T` | Historical Phase 1 promote |
| Live `GET /api/health` | Phase 1 SHA | `gitSha` `76d233bcba479f0dd77040aabf451baf47f8b01c` |
| Live deployment | Phase 1 dpl | `dpl_F8BtWYzosGbUxEKH6czEqhCFtp61` |
| Health flags | `v2Shell: true` | also `phase2Intelligence: true` |

**Finding:** Phase 1 remains the frozen **tenancy / RBAC / sites / taxonomy / audit / outbox** contract. Live production already runs later commits that added intelligence tables and V2 draft routes. Phase 2A still documents the **intended delta from Phase 1**, so later slices can be judged against architecture instead of git archaeology.

Phase 0 AI regression SHA remains `ed59c644e2d532776ba0fc93b0214363b7778183`. Do not change `POST /api/ai-analyze` response shape, persistence, or `npm run test:ai`.

---

## 2. What Phase 1 already guarantees (do not redesign)

- Tenant-scoped `ai_analyses` with `organization_id`
- RBAC permissions `analysis.create`, `analysis.read`, `listing.create`, `listing.manage_own`, `listing.read`, `material.read`
- Taxonomy: `material_families`, `materials`, `material_grades`, `material_aliases` (AR/EN labels)
- Candidate map only: `lib/foundation/taxonomy-map.cjs` → `candidateMaterialCode`, `confirmed: false`, `autoPublish: false`
- Listings: `scrap_listings` via `POST /api/workflow` `createListing` (title, city required, seller-supplied quantity/value)
- V2 shell `/v2` + Hobby catch-all `api/v2/[...path].js` → `lib/foundation/v2-http.cjs`
- Audit + outbox primitives

---

## 3. Inspected current flows

### 3.1 AI analysis (frozen)

```
Image (data URL)
  → POST /api/ai-analyze  (analysis.create)
  → lib/ai.cjs → intelligence engine (Gemini/Groq/OpenAI)
  → Zod VISUAL_ESTIMATE
  → INSERT ai_analyses + ai_provider_events
  → JSON { analysis, provider, model, fallbackUsed, latencyMs, notice }
```

`analysis` is a visual estimate. `labCertifiedPurity` is false. The API does **not** create a listing. `estimatedWeightKg` on the request is seller context, not an image-derived fact.

GET `/api/ai-analyze` returns the last 20 org analyses. V2 `GET /api/v2/me` may attach `taxonomyCandidate` from the latest result without publishing.

### 3.2 AI tables (Phase 0)

- `ai_analyses` — org-scoped result JSON, context JSON, provider, latency, fallback, `estimate_kind`
- `ai_provider_events` — telemetry only; no secrets

### 3.3 Taxonomy (Phase 1) — reuse, do not duplicate

AI labels (`materialLabelEn` / `materialLabelAr` / `materialType` / `probableGrade`) must resolve to `materials.id` (and optional `material_grades.id`) via aliases then code. No second materials catalog.

### 3.4 Listings model (V1)

`scrap_listings`: `seller_org_id`, `title`, `material` (canonical string via `normalizeMaterial`), `quantity`, `unit`, `city`, `indicative_value`, `image_url`, `status`.

Phase 2 publish path must INSERT this table **only after seller confirm**. `indicative_value` must stay null unless the seller provided it. Image analysis must not invent SAR.

### 3.5 V2 shell

Phase 1: onboarding, sites, analyze handoff to `/#analyze`.  
Intended Phase 2 UX: individual **Analyze → Sell my scrap**; company **AI waste intelligence** (analyses, drafts, materials only — no contracts/logistics).

### 3.6 API contracts not to change

| Surface | Rule |
| --- | --- |
| `POST/GET /api/ai-analyze` | Frozen Phase 0 |
| `GET/POST /api/auth` | Unchanged |
| `GET /api/listings` | Unchanged |
| `GET/POST /api/workflow` | Unchanged (`createListing` remains the manual path) |
| `GET/POST /api/platform` | Unchanged (no PSP) |
| `GET /api/health` | Additive flags only |
| `GET/PATCH /api/v2/organization`, sites, members, session, materials | Phase 1 contracts |

Do **not** add `/api/doEverything`. Stay inside the V2 catch-all (Hobby ≤ 12 serverless functions). Nested `/api/v2/ai/*` paths need explicit routing; extra path segments can 404 at the platform if they are not mapped.

---

## 4. Product rule (assistant, not source of truth)

Never auto-publish. Never claim certified purity from a photo. Never invent weight as fact. Never invent market price. Every AI business value needs confidence, source, explainability, and human confirmation where it becomes a listing.

Weight: `NOT_PROVIDED` | `SELLER_PROVIDED` | `RANGE_UNCONFIRMED` (range is not a weighbridge ticket).

---

## 5. AI listing draft lifecycle

```
AI analysis (existing)
      ↓  explicit V2 POST (not a side effect of analyze)
Listing draft          status REVIEW_REQUIRED
      ↓  seller PATCH (edit fields)
REVIEW_REQUIRED
      ↓  confirm  → INSERT scrap_listings, status PUBLISHED, listing_id set
      or reject   → status REJECTED, no listing
```

Statuses: `DRAFT` | `REVIEW_REQUIRED` | `CONFIRMED` | `PUBLISHED` | `REJECTED`.  
Confirm may move `REVIEW_REQUIRED` → `PUBLISHED` in one transaction (listing is the source of truth). `CONFIRMED` is reserved if a later two-step approve is needed.

Drafts are tenant-scoped (`organization_id`). VIEWER must not create or confirm (`listing.create` / `listing.manage_own`). Cross-org GET must 404.

---

## 6. Material mapping flow

```
AI label (AR/EN/alias/type)
      ↓
Material mapper (Phase 1 tables only)
      ↓
materials.id + optional material_grade candidate
      ↓
material_mapping_events  (learning / audit, not a second catalog)
```

`autoPublish` always false. Mapping confidence is stored on the event and copied onto the draft. Seller edits are feedback, not silent overwrite of taxonomy rows.

---

## 7. Seller confirmation flow

Seller sees editable AI suggestions: material candidate, condition, titles AR/EN, city, weight (empty unless seller-provided).

Actions: **Confirm** | **Edit** | **Reject**.

Confirm requires city (same rule as V1 `city_required`). Quantity is `weight_kg` only if `SELLER_PROVIDED`; otherwise listing quantity is null. Title from `title_ar` or `title_en`. Material column uses existing `normalizeMaterial` on taxonomy code / title — do not invent a new listings.material enum.

---

## 8. Feedback loop

On PATCH (and reject):

```
AI value  →  human_value  →  ai_feedback_events
field_name, source SELLER|BUYER|SYSTEM
```

This is training/provenance data. It must not retrain models in Phase 2.

---

## 9. Future pricing / matching boundaries (out of Phase 2A implementation)

**Do not implement in the next coding slice.** Architecture only:

| Concern | Boundary |
| --- | --- |
| Price | Table `market_price_signals` later. UI must show a **range + confidence + factors**, or honest `price_source_not_connected`. Never “Price = 25 SAR”. No seed fake production prices. Sources later: internal transactions, suppliers, external markets, LME. |
| Matching | Table `buyer_matching_scores` later. Input: material, location, quantity, grade. Output: real buyer orgs, score, reasons. No fake buyers. Not a marketplace replacement. |
| Payment / logistics / weighbridge / contracts | Phase 3+ |

If those tables already exist in `006`, treat extra write paths (scoring on confirm, price APIs) as **Phase 2B+**. Phase 2A must not depend on them to create a draft.

---

## 10. Modules impacted

Remain a **modular monolith**. Prefer `lib/modules/` so Vercel Node can `require` without a new bundler (same deploy model as Phase 1). Spec `src/modules/` is equivalent conceptually.

| Module | Phase 2A | Later |
| --- | --- | --- |
| `ai/` assistant + HTTP | yes | |
| `materials/` mapper | yes | |
| `listings/` drafts | yes | |
| `feedback/` events | yes | |
| `pricing/` | **boundary only** | 2B |
| `matching/` | **boundary only** | 2B |
| `lib/intelligence/*` | **do not change engine contracts** | |
| `api/ai-analyze.js` | **do not change** | |
| `lib/foundation/v2-http.cjs` | route new paths through catch-all | |
| `apps/v2` | sell / intelligence UX after APIs | |

---

## 11. Database additions required

Additive, reversible where possible, production-safe. Next numbered file after Phase 1 `005`: **`006_phase2_intelligence.sql`**.

**Phase 2A (required):**

- `ai_listing_drafts` — org, analysis, material/grade FKs, bilingual title/description, tags, condition, city, weight_status/weight_kg, confidence, status, listing_id
- `material_mapping_events`
- `ai_feedback_events`

**Deferred (document now, do not require for first slice):**

- `market_price_signals`
- `buyer_matching_scores`

Never drop Phase 1 tables. Never recreate production data. Never UPDATE `audit_events`.

---

## 12. APIs to add (V2 catch-all only)

Phase 2A:

- `POST /api/v2/ai/drafts` `{ analysisId? }` — latest org analysis if omitted; **201 draft, autoPublish false, no listing**
- `GET /api/v2/ai/drafts` / `GET /api/v2/ai/drafts/:id`
- `PATCH /api/v2/ai/drafts/:id` — seller edits + feedback events
- Confirm / reject: prefer `POST /api/v2/ai/drafts/:id` `{ action: "confirm"|"reject" }` because Hobby nested segments after `/ai/drafts/:id/` can 404. Spec aliases `/confirm` and `/reject` if routing allows.
- `GET /api/v2/ai/assistant?analysisId=` — deterministic scrap assistant (no extra LLM)
- `GET /api/v2/ai/analyses` — org list for intelligence UX (read-only; does not replace GET `/api/ai-analyze`)

Phase 2B (not this slice): `GET /api/v2/price-signals`, `GET /api/v2/buyer-matches`, listing-id matching.

Observability (no secrets): provider, model, latency, confidence, draft generate/confirm, mapping failures.

---

## 13. Tests required for the first slice

Preserve: `npm test`, `test:ai`, Phase 1 tenant/RBAC.

Add: image → analysis (existing) → map → draft → seller edit → confirm → `scrap_listings` row; feedback event on correction; VIEWER 403 on create; other org 404 on draft. Do not assert a hardcoded material or SAR price.

---

## 14. First implementation slice (Phase 2A coding — not started in this task)

1. Additive `006` with **drafts + mapping_events + feedback only** (or ignore unused pricing/matching tables if `006` already includes them).
2. Mapper on Phase 1 taxonomy.
3. Draft HTTP + assistant, tenant + RBAC, audit/outbox on create/confirm.
4. Confirm → `scrap_listings` without `indicative_value`.
5. V2 sell/intelligence UX calling existing analyze URL.
6. Unit + API tests for the draft path.

**Stop before:** payment, logistics, weighbridge OCR, contracts, auctions, fabricated prices, full matching marketplace, Phase 3.
