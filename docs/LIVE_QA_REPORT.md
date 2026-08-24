# Scrap AI — Live Production Readiness QA Report

**Test timestamp:** 2026-08-24 23:35 Asia/Riyadh  
**Repository:** https://github.com/majaber1/scrap-ai  
**Live deployment tested:** https://scrap-ai.vercel.app/  
**Scope:** Read-only production-readiness review plus safe browser-local workflow tests. No real account was created, no external form was submitted, no buyer was contacted, and no product code was changed.

## Executive verdict

**Status: NO-GO for public production marketplace today.**

The deployed site is a polished, responsive static prototype and its browser-local demo journey works. It is not yet a real marketplace: there is no authentication, backend, durable shared database, real seller/buyer identity, listing detail, offer/contact workflow, payment, logistics, compliance, dispute handling, or administration. Public copy currently overstates capabilities that are simulated or hard-coded.

**Presentation/demo readiness:** 8/10  
**Real public marketplace readiness:** 2/10  
**Recommended launch shape within 10 days:** Saudi-local managed marketplace MVP (seller listing → admin approval → buyer offer → acceptance → pickup coordination → completion), with AI valuation explicitly labelled indicative.

## Evidence and environment

| Item | Observed |
|---|---|
| Production URL | https://scrap-ai.vercel.app/ |
| Page title | Scrap AI by EADA |
| Runtime | Static HTML/CSS/JavaScript |
| State | browser `localStorage` only |
| Automated repository check | `scripts/check.mjs` checks files, DOM markers and JavaScript syntax; it is not an end-to-end test |
| README disclosure | Correctly calls this a browser-local prototype and lists missing production services |
| Deployment date display | UI showed “آخر تحديث: ٢٤/٨/٢٠٢٦”, generated from the device date rather than a verified market-feed timestamp |

## Live journeys tested

### 1. Home and navigation — PASS for demo

- Arabic RTL home loaded successfully at the production URL.
- Home, Analyze, Marketplace and Dashboard navigation worked.
- Price ticker and material price cards rendered.
- Route persisted through hash navigation (for example `#dashboard`).
- English/theme controls exist; full localization/content QA remains required before launch.

### 2. Scrap valuation — PASS for deterministic demo, FAIL as AI/market valuation

Test data:

- Material: copper/cables
- Weight: 1,250 kg
- Sorting state: clean
- Goal: maximize value

Observed result:

- Confidence: 84%
- Purity: 88%
- Unit price: SAR 29.7/kg
- Current value: SAR 37,125
- Improvement cost: SAR 188
- Optimized value: SAR 38,051
- Expected net gain: SAR 926
- Route: direct sale to an industrial buyer

What works:

- Input validation, calculation, formatted result, value breakdown and history creation.
- The page honestly includes a non-binding/demo disclaimer near the form.

What does not work:

- No image was required to obtain an “AI” result.
- The selected material and fixed formulas drive the output; there is no computer-vision inference or laboratory evidence.
- Seven-day prediction includes random client-side noise and is not a forecast model.
- Prices and LME values are hard-coded; “latest update” is the current browser date, not a feed timestamp.
- Confidence and purity are synthetic constants, not measured results.

### 3. Create listing draft — PASS locally, FAIL as a marketplace listing

- “Create listing draft” created a local draft and displayed a success toast.
- The draft appeared in Marketplace and Dashboard.
- It survived a page reload in the same browser.

Blockers:

- No account or seller ownership.
- No location, photos, condition details, pickup terms, VAT/tax, quantity tolerance, expiration, attachments or verification.
- Draft is stored only in that browser; another buyer/device cannot see it.
- No moderation or publication state machine.

### 4. Buyer matching — PASS as sample modal, FAIL as real matching

- The copper test showed two sample buyers and match scores of 92% and 90%.

Blockers:

- Buyer records and scores are hard-coded sample data.
- No buyer profile/detail, verified capacity, service area, license, offer or invitation action.
- Dashboard still showed zero matches after opening the match modal.

### 5. Marketplace browse/search — PARTIAL PASS

- Marketplace rendered eight sample listings plus the newly created local draft.
- Search for “جدة” correctly narrowed results to one listing.
- Material filters and sorting controls are present.
- Summary displayed 9 listings, 5 buyers and SAR 176,051 volume after the local draft.

Critical failures:

- “View” only displays the listing ID in a toast; there is no detail page.
- “Contact” only displays a generic toast; it does not contact a buyer/seller.
- “Active”, verified badges, registered buyer count, trade volume and 24-hour average are demo claims, not backed by shared transactions.
- There is no offer, negotiation, acceptance, order, payment, pickup, weighbridge, proof-of-delivery, completion, review or dispute journey.

### 6. Dashboard and persistence — PASS locally, FAIL as account data

- Dashboard showed one analysis, SAR 38,051 estimated value and one draft.
- Data remained after reload in the same browser.

Blockers:

- No account, tenancy or cross-device durability.
- Clearing browser storage loses data.
- No server audit trail, backup, permissions or organization workspace.
- Price alerts are local records only; there is no scheduled monitoring or notification delivery.

### 7. Error/operational checks — INCOMPLETE for production

- No product-origin JavaScript exception was observed during the tested flow.
- Browser-extension metadata errors were observed and excluded as environment noise.
- There is no health endpoint, backend log, observability, error tracking, uptime evidence or transaction trace to verify.

## Production blockers (P0)

1. **Real identity:** seller and buyer registration, login, email/phone verification, password reset, roles and ownership.
2. **Durable backend:** production database, API, migrations, backups and per-user authorization.
3. **Real listing lifecycle:** draft → submitted → approved/rejected → active → under offer → sold/expired.
4. **Listing detail:** photos, material/category, condition, location, quantity/unit, price model, pickup/delivery, documents and timestamps.
5. **Real marketplace interaction:** buyer offer, counteroffer, accept/reject, messages and notifications.
6. **Transaction lifecycle:** order/deal record, pickup scheduling, weighbridge/final weight, delivery evidence, completion and cancellation.
7. **Truthful claims:** remove or label “AI”, live price, verified buyer, registered buyers, volume, average sale time, integrated logistics and commercial-register verification until implemented and evidenced.
8. **Admin operations:** moderation, user/listing review, suspension, disputes, content management and audit log.
9. **Legal/operational baseline:** terms, privacy, acceptable materials, hazardous/e-waste/battery rules, cancellation, disputes, VAT/invoice responsibility and marketplace role.
10. **Production controls:** server-side validation, rate limiting, abuse controls, secrets management, monitoring, analytics, alerting and restore test.

## Important P1 gaps

- Real Saudi price-feed/source policy with source, timestamp and delay disclosure.
- Buyer verification and service-area/capacity evidence.
- Arabic/English content parity and mobile accessibility QA.
- Media storage, compression, malware/type/size validation.
- Map/location privacy; show approximate location publicly.
- Notification provider (email first; SMS/WhatsApp later).
- Reviews after completed transactions only.
- Commission/invoicing rules.
- SEO, social cards, support channel and incident/contact process.
- Analytics events for registration, listing submission, offer, acceptance and completion.

## Recommended 10-day production plan

### Day 1 — Freeze scope and truth

- Define launch as a **managed local marketplace**, not autonomous AI trading.
- Replace unsupported claims with “indicative/demo/pilot” wording.
- Finalize roles, listing fields, statuses, prohibited materials and success criteria.
- Choose production stack and connect database/storage/email.

### Days 2–3 — Identity and durable core

- Implement registration/login/reset and seller/buyer profiles.
- Create production schema, migrations, authorization and ownership tests.
- Add listing create/edit/submit and media upload.
- Add admin approval/rejection with reasons.

### Days 4–5 — Real marketplace loop

- Public active listings and complete detail pages.
- Search/filter/sort on server data.
- Buyer offer, seller counteroffer/accept/reject.
- Deal room with messages and email notifications.

### Days 6–7 — Fulfilment and operations

- Pickup request/schedule and responsible party.
- Record estimated then final weight/price.
- Upload weighbridge/delivery evidence.
- Complete/cancel/dispute states.
- Admin user, listing and transaction console with audit trail.

### Day 8 — Legal, trust and hardening

- Publish terms, privacy, prohibited-material and dispute/cancellation policies.
- Implement verification flags with evidence and expiry.
- Add rate limits, validation, upload restrictions, security headers and error tracking.
- Add backups and perform a restore check.

### Day 9 — Real pilot and regression

Run two independent accounts on separate browser profiles/devices:

1. Seller registers and publishes a real approved listing.
2. Buyer registers, searches and submits an offer.
3. Seller counters/accepts.
4. Both exchange messages and receive email.
5. Pickup is scheduled.
6. Final weight/evidence are recorded.
7. Deal is completed and both histories match.
8. Admin can trace the full audit trail.

Repeat for rejection, cancellation, expired listing, invalid upload, unauthorized access and notification failure.

### Day 10 — Controlled launch

- Fix all P0/P1 test failures.
- Seed only consented real listings/buyers; remove sample claims from production.
- Run mobile/desktop Arabic and English smoke tests.
- Verify monitoring, backups, support routing and rollback.
- Launch to a limited Riyadh/Jeddah pilot cohort; expand only after completed transactions.

## Minimum release acceptance criteria

Release is GO only when all are evidenced:

- Two newly created, verified accounts can complete the full seller/buyer journey on separate devices.
- Data persists after logout, reload and deployment.
- Unauthorized users cannot view/change another user’s drafts, offers, messages or deals.
- A submitted listing cannot go public without the intended approval rule.
- Offer/counter/accept states are consistent for both parties.
- Pickup and completion evidence are durable and admin-visible.
- Notifications are delivered or visibly retried/failed.
- All public counters, verification badges, prices and timestamps come from traceable data.
- Legal pages and support/dispute route are live.
- Backup/restore, monitoring and rollback have been tested.
- Zero open P0 defects.

## Items requiring owner help after software readiness

- Legal entity name, CR/VAT details and official support contacts.
- Approval of terms, privacy, prohibited-material and dispute policies.
- Production domain/DNS.
- Email sender domain; SMS/WhatsApp provider only if required for launch.
- Payment decision: defer to managed/off-platform settlement for pilot, or provide an approved gateway account.
- First real sellers/buyers and consented listings for the controlled pilot.
- Operations owner for verification, moderation, pickup exceptions and disputes.
- Verified commercial price source/feed or approval to keep pricing clearly indicative.

## Final recommendation

Do not market the current deployment as a functioning public marketplace. Preserve the strong UI, but replace the browser-only demo core with a small, auditable managed transaction loop. Payments and advanced computer vision can be deferred; identity, durable listings, offers, fulfilment evidence, admin operations and truthful data cannot.
