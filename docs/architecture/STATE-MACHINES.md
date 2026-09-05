# State Machines

## V1 listing
`open` → `pickup` (on accept). Terminal/cancel later.

## V1 offer
`submitted` → `accepted` | `declined`

## V1 transaction
`inspection_scheduled` → `inspected` → `final_weight_confirmed` → `pickup_scheduled` → `collected` → `settlement_pending` → `settled` → `closed`  
`settled`/`closed` require PSP (blocked).

## AI job (Phase 0 request-scoped)
`queued` → `processing` → `completed` | `failed` | `retrying`  
Persisted on `ai_provider_events.status`.

## Future
Auction, RFQ, container rental, shipment, weigh session, payment intent — specified when those phases start; names reserved.
