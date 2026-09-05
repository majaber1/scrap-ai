# Payment Architecture

`PaymentGateway`: createPayment, capture, refund, verifyWebhook.

Domain is not bound to one PSP. Payment state from verified webhook.

Support architecture for card, mada, Apple Pay, bank transfer, PO — subject to contracted provider.

No escrow claim without licensed structure.

Phase 7 after PSP selection. V1 `payment_records` are manual notes (`pending_review`).
