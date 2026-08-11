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

No environment variables are currently required. See [`.env.example`](.env.example), [`docs/PRODUCT_AUDIT.md`](docs/PRODUCT_AUDIT.md), and [`docs/RELEASE_REPORT.md`](docs/RELEASE_REPORT.md).
