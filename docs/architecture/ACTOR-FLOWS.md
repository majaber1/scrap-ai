# Actor Flows — Scrap AI V2

Flows are **target** product. Phase 0 implements the Individual photo→AI→persist→refresh slice only.

---

## Individual (canonical)

```
Individual → Photo → AI Material Analysis (VISUAL_ESTIMATE)
  → Indicative market range (or “source not connected”)
  → Goal: Sell | Understand only
  → Sell: location + approx qty → matching (Phase 2) → offers → compare → accept
  → Pickup needed? Book transport : self-delivery
  → Weigh / inspect → final value (deterministic) → payment → receipt + rating
```

AI fills fields; user confirms. Minimal typing.

---

## Company / factory

```
Org → Site → Material stream → AI/manual ID → qty + frequency
  → Mode: listing | offtake | auction | RFQ
  → Matching → award
  → Container? order/delivery/fill/swap
  → Transport → weighbridge → inspection → settlement → invoice → recovery evidence → analytics
```

---

## Government

```
Entity → department/site → disposal lot → AI class → internal review → approval (maker/checker)
  → auction | qualified RFQ | framework
  → qualified participants → evaluation → award
  → pickup authorization → transport → weighbridge → receipt → settlement → audit pack
```

Do not claim legal procurement compliance until verified. Architecture must allow integrations.

---

## Phase 0 implemented flow

```
Authenticated user → upload JPEG/PNG/WebP
  → validate → primary AI → fallback → Zod schema
  → INSERT ai_analyses + ai_provider_events
  → UI shows visual estimate
  → GET /api/ai-analyze after refresh still returns the row
```

## Phase 1 implemented flow

```
Authenticated user → optional /v2 onboarding (INDIVIDUAL | COMPANY_FACTORY | GOVERNMENT)
  → sites (company/government) persist in PostgreSQL
  → RBAC permissions on mutations
  → Analyze remains Phase 0 /#analyze → POST /api/ai-analyze
  → taxonomy mapper foundation (no auto-publish)
```
