# Scrap AI — Live Operations QA (2026-08-25)

Production: https://scrap-ai.vercel.app  
Deployment commit: `298b24acd8a9f063d584d291f2cf7eb842245450`  
Internal production-readiness score: **87%**

## Production journey executed

All names are QA simulations and do not imply affiliation.

- Seller: `مصنع الرياض للمعادن — محاكاة QA`
- Buyer/recycler: `شركة تدوير الخليج — محاكاة QA`
- Listing: `98333dc0-9a1e-4be2-b42e-3a338e0171b5`
- Accepted offer: `7b3a1d7f-7d57-4476-b687-bed10e94d341`
- Transaction: `aff413c5-c042-44e8-a8ac-bf347bab5e52`

The live journey passed: listing, bidding, acceptance, pickup creation, pending verification, inspection, actual weight `1218.5 kg`, purity `96.4%`, weighbridge reference, final value `SAR 26,807`, pickup scheduled, collected, settlement pending, payment-proof record and dispute record.

## Safety and remaining external connections

- Attempting `settled` without a licensed PSP correctly returns `409 licensed_payment_provider_not_configured`.
- R2 upload correctly returns `503 object_storage_not_configured` until credentials are supplied.
- Organization verification remains pending for manual/authority review; a typed license is not auto-verified.
- Runtime error/fatal logs after the test: none.

The market workflow and evidence requirements are versioned in `workflow_policies`, with Doum, aScraps and OxCira stored as product-pattern references rather than affiliations.
