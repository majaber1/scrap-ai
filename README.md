# Scrap AI

Saudi circular-materials platform (V2): **AI identification, market intelligence with provenance, marketplace, then logistics / containers / weighbridge / settlement** as bounded contexts. The V1 seller→offer→accept loop remains live during migration.

Canonical architecture: `docs/architecture/ADR-001-SCRAP-AI-V2.md`. V1 marketplace lock file is historical: `docs/ARCHITECTURE.md`.

## Operational source of truth

Last reviewed: **2026-09-05**.

| Layer | Canonical source | Current state |
| --- | --- | --- |
| Code | this repository | Static bilingual frontend + serverless `/api/*` + SQL migrations (TS shell in Phase 1) |
| Production | `https://scrap-ai.vercel.app` | Vercel production |
| Health | `GET /api/health` | Reports DB/session plus AI/storage readiness |
| Database | `DATABASE_URL` + `db/migrations/` | PostgreSQL accounts, listings, offers, pickups, transactions, AI analyses |
| Sessions | `SESSION_SECRET` | Signed HttpOnly production sessions |
| AI | Provider registry (`GEMINI_API_KEY`, `GROQ_API_KEY`, optional `OPENAI_API_KEY`) | Visual estimate only — not a lab certificate or live SAR price |
| Object storage | Vercel Blob (preferred) or Cloudflare R2 | Listing photos / evidence |
| Architecture | `docs/architecture/` | ADR-001 V2 baseline |

**Runtime health and live journey tests override prose.** Historical QA reports remain evidence only for the date they were recorded.

## Product model

### Seller

- Create a seller account.
- Publish scrap with title, material, quantity, unit, city and indicative/asking value.
- Review incoming buyer offers.
- Accept an offer and optionally set pickup date/address.
- Start the inspection/pickup transaction.
- Record inspection, actual weight, purity and weighbridge evidence.

### Buyer

- Create a buyer/factory account.
- Browse open scrap opportunities.
- Submit a purchase offer.
- Track accepted offers and transaction progress.

### AI and verification

- Analyze scrap images using the configured AI provider.
- Estimate likely material/grade/purity and required inspection.
- Submit organization verification data.
- Upload private inspection photos/reports when R2 is configured.
- Keep AI output indicative; final value is based on physical inspection and actual weight.

## Current production APIs

- `api/auth.js` — account/session operations
- `api/listings.js` — public open listings for the market page
- `api/workflow.js` — listings, offers, acceptance and pickup creation
- `api/platform.js` — verification, transaction stages, inspection, payment records and disputes
- `api/ai-analyze.js` — AI image/material analysis
- `api/upload.js` — private Cloudflare R2 evidence upload
- `api/health.js` — safe dependency readiness

## Live production test

`npm run test:prod` performs a real read/write journey against production using clearly marked QA accounts/data:

1. Verify the redesigned production shell and health endpoint.
2. Register a seller.
3. Create a real scrap listing.
4. Register a buyer.
5. Confirm the buyer can see the listing.
6. Submit a buyer offer.
7. Accept the offer as seller and create pickup.
8. Open the transaction.
9. Record inspection and actual weight.
10. Advance to `final_weight_confirmed`.

The workflow intentionally stops before financial settlement because settlement requires a configured licensed payment provider and verified payment callback.

## Important product limits

Scrap AI does **not** provide certified grading, laboratory inspection, binding quotations, guaranteed live prices, legal ownership verification, guaranteed buyer availability, or payment escrow by itself. AI output and indicative values must be confirmed through physical inspection, weighing, purity testing and a real counterparty agreement.

## Local run

```powershell
npm install
npm run serve
npm test
```

## Production environment

Core durable operation:

```text
DATABASE_URL
SESSION_SECRET
```

AI analysis:

```text
GEMINI_API_KEY
GEMINI_MODEL
GROQ_API_KEY
GROQ_MODEL
OPENAI_API_KEY
OPENAI_MODEL
```

Cloudflare R2 uploads:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET
```

Never commit secret values. The health endpoint reports only safe readiness state.

## Architecture and QA

See:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — locked product and system architecture
- [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) — phases and delivery
- [`docs/PRODUCT_AUDIT.md`](docs/PRODUCT_AUDIT.md)
- [`docs/FINAL_QA_QC_REPORT.md`](docs/FINAL_QA_QC_REPORT.md)
- [`docs/LIVE_QA_REPORT.md`](docs/LIVE_QA_REPORT.md)
