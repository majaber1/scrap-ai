# Scrap AI by EADA

A standalone bilingual prototype for scrap image intake, material classification scenarios, purity estimates, indicative value calculation, route recommendation, analysis history, and listing drafts.

## Scope

This browser-local MVP does not provide laboratory inspection, certified grading, live prices, verified buyers, or binding quotations. Production requires computer vision, market feeds, secure storage, verified counterparties, compliance integrations, and transaction infrastructure.

## Run

```powershell
npm run serve
npm test
```

The core platform remains in [`majaber1/eada-platform`](https://github.com/majaber1/eada-platform).

## Architecture and localization

The product is dependency-free static HTML, CSS, and JavaScript. Arabic and English switch `lang` and `dir` at document level, and the layout uses logical start/end positioning. Image previews remain in memory; history, theme, and language preferences remain in browser storage.

The public prototype needs no environment variables. Production accounts require `DATABASE_URL` and a 32+ character `SESSION_SECRET`. Image-assisted Scrap AI also requires server-only `OPENAI_API_KEY`; optional `OPENAI_MODEL` defaults to `gpt-5.4-mini`. AI output is indicative and cannot replace physical inspection, weighing, purity testing, ownership checks, or a current buyer quote. See [`docs/PRODUCT_AUDIT.md`](docs/PRODUCT_AUDIT.md) and [`docs/RELEASE_REPORT.md`](docs/RELEASE_REPORT.md).
