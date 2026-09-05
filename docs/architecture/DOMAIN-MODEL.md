# Domain Model — Scrap AI V2

IDs: UUID. Money: numeric. Time: timestamptz. JSONB: metadata only.

Customer type and role are **separate**.

---

## Identity & organization

- `User`  
- `Organization` (customer_type: individual | company | government; flags for recycler/carrier/container_provider as capabilities, not XOR)  
- `Site`, `Department`, `Team` (Phase 1+)  
- `Membership`, `Role`, `Permission` (configurable RBAC)  
- Platform roles ≠ org roles  

V1 mapping: `organizations.kind` is a **legacy UI hint**, not the domain customer_type.

---

## Materials

- `MaterialFamily` → `Material` → `MaterialGrade`  
- `MaterialAlias` (AR/EN)  
- `MaterialSpecification`  
Free-text names are input hints, not the system of record (Phase 1 taxonomy).

---

## Intelligence

- `AiAnalysis` (visual estimate; `estimate_kind=VISUAL_ESTIMATE`; `lab_certified=false`)  
- `AiProviderEvent` (telemetry)  
- Price: `RawPriceSource` → normalized quote with **provenance** (Phase 2). LLM must not emit SAR as market fact.

---

## Marketplace (mode-ready)

V1: `ScrapListing`, `Offer`, `Pickup`.  

V2 entities (tables may come later, names reserved): `SellRequest`, `SourcingRequest`, `Rfq`, `Auction`, `Bid`, `Contract`, `Award`.  
Modes: direct listing, buyer offer, RFQ, open auction, sealed bid, recurring contract, sourcing request.

---

## Operations

- Containers: Provider, Type, Container, RentalOrder, Delivery, Swap, Pickup, Event, Charge, Site  
- Logistics: Carrier, Driver, Vehicle, TransportRequest, Quote, Shipment, Stop, Event, POP/POD, Document  
- Weighbridge: Weighbridge, Session, Ticket, Reading, Evidence, Discrepancy  
  `NET = GROSS - TARE` in domain code, not LLM  

---

## Commercial & pay

Deterministic:

```
MaterialValue = VerifiedNetWeight × AgreedPricePerUnit
TransactionTotal = MaterialValue + Logistics + Container + Tax + PlatformFee − Credits − Adjustments
```

Each component stored separately.

`PaymentProvider` adapter; `PaymentIntent`, `Payment`, `Refund`, `Payout`, `Settlement`, `Invoice`.  
State from **webhook**, not the browser.

`Plan`, `Feature`, `Entitlement`, `UsageLimit`, `Subscription`.

---

## Compliance & audit

`License`, `Verification`, `Document`, `ComplianceRequirement`, `ComplianceStatus`.  
`AuditEvent` immutable: actor, org, action, entity, before/after, request_id, time.

---

## V1 physical tables (today)

`organizations`, `users`, `memberships`, `scrap_listings`, `offers`, `pickups`, `workflow_policies`, `organization_verifications`, `organization_documents`, `scrap_transactions`, `payment_records`, `disputes`, `ai_analyses`, plus Phase 0 `ai_provider_events`, plus Phase 1 `sites`, `permissions`, `roles`, `role_permissions`, `membership_roles`, `platform_roles`, `material_*`, `audit_events`, `domain_outbox`, `feature_flags`.
