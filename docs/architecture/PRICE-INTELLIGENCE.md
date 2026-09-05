# Price Intelligence

LLM **must not invent** Saudi scrap prices.

Pipeline: RawPriceSource → normalize → unit/currency → material/grade map → location/freight/quality adj → confidence → **range + provenance**.

Every displayed price: source, source type, timestamp, freshness, unit, currency, location, grade, confidence, provenance.

If no connected source: **Data source not connected**. Never “live 28 SAR/kg”.

V1 `catalog.price` in `app.js` is **not** a market feed. Phase 0 UI must not present it as live.
