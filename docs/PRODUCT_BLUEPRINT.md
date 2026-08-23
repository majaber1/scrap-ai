# Scrap AI product blueprint

## Positioning

Saudi-first bilingual scrap valuation and marketplace for individuals, warehouses, factories, buyers, recyclers and collection teams.

## Phase 1 architecture

A dependency-free SPA uses a versioned seeded presentation datastore in browser local storage. This prioritizes a deterministic live demo and avoids false claims about accounts, AI, price feeds, payments or durable cloud data.

## Workflow

1. Seller adds photos, material, weight, purity, condition and city.
2. Demo engine returns confidence, indicative range and calculation.
3. Seller publishes; buyer submits an offer.
4. Seller compares rate, net value, pickup time, rating and conditions.
5. Acceptance creates a pickup.
6. Operations assigns collector/vehicle and advances the timeline.
7. Collection adjusts weight and completes the transaction.
8. Dashboards show recovered value and indicative environmental impact.

## Revenue model

Transaction success fee; industrial subscription; buyer alerts/lead subscription; optional managed-logistics margin.

## Phase 2

Next.js TypeScript, PostgreSQL, object storage, identity/roles and auditable APIs. External CV and price providers follow credentials and evaluation.
