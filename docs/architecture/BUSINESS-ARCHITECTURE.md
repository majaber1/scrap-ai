# Business Architecture — Scrap AI V2

**Baseline:** ADR-001.  
**Personality:** Industrial intelligence + Saudi simplicity. Arabic-first, true RTL, English second.

---

## Mission

Help individuals, companies, factories, and government entities **understand, value, sell, buy, collect, transport, weigh, trace, and manage** recyclable materials in Saudi Arabia.

The marketplace is a capability, not the product.

---

## Customer types (segment) ≠ actor roles

| Customer type | Primary job |
| --- | --- |
| Individual | Photo-first: understand scrap, safe transaction |
| Company / factory | Streams, sites, contracts, logistics, containers, weighbridge, analytics |
| Government entity | Governed disposal, approvals, qualified parties, audit — **never the individual seller UI** |

Operational roles (many per org): seller, buyer, recycler, trader, waste generator, transporter, container provider, inspector, weighbridge operator, finance, approver, procurement, sustainability, site manager, org admin, platform admin.

Do not implement `if company then seller`.

---

## Capabilities (independent)

1. Scrap intelligence (vision + structured material identity)  
2. Saudi price intelligence (provenance; no LLM prices)  
3. Marketplace modes (listing, offer, RFQ, auction, sealed bid, contract, sourcing) — **domain support first, implement per roadmap**  
4. Matching  
5. Decision support  
6. Logistics  
7. Container rental  
8. Weighbridge  
9. Payments / settlement / invoice  
10. Subscriptions / entitlements  
11. Organization workflows  
12. Government workflows  
13. Compliance / licenses / documents  
14. BI / learning loop from verified transactions  

---

## Revenue engines (configurable, not hardcoded %)

1. Transaction commission / platform fee (admin)  
2. Logistics coordination / carrier commission / SLA  
3. Container rental, delivery, swap, overage  
4. Organization subscriptions (plans + entitlements)  
5. Government / enterprise contracts  
6. Intelligence API (future)  

If a PSP or legal structure does not support escrow, **do not claim escrow**.

---

## Product loops (canonical)

- **Individual:** Photo → visual AI → indicative range when sources exist else “source not connected” → sell or save → location/qty → match → offers → accept → transport or self-delivery → weigh/inspect → deterministic value → payment → receipt.  
- **Company:** Site → stream → ID → frequency → listing/contract/auction/RFQ → match → award → container? → transport → weighbridge → inspect → settle → invoice → recovery evidence → dashboard.  
- **Government:** Department/site → disposal lot → AI class → review → approval → auction/RFQ/framework → qualified participants → award → pickup auth → transport → weigh → verify → settle → **audit pack**.

---

## Honesty rules

- AI output is **VISUAL ESTIMATE**, never laboratory-certified purity or binding price.  
- No fake listings, users, transactions, prices, AI confidence, payments, containers, or carriers as production facts.  
- Demo data marked **DEMO**. Missing feed → “Data source not connected”.

---

## Definition of done (business)

Real user → real UI → real API → real authz → real DB write → refresh still shows it → counterparty can act → state advances → audit event (when the context exists).
