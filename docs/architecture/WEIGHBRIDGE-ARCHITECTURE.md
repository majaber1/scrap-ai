# Weighbridge Architecture

Not a string on the transaction. Entities: Weighbridge, WeighingSession, WeighbridgeTicket, WeightReading, WeightEvidence, WeightDiscrepancy.

`NET = GROSS - TARE`. Origin vs destination weights. Configurable tolerance → discrepancy.

OCR extracts; human confirms. Hash/signatures/photos as evidence.

V1 `weighbridge_ticket` text is a **legacy field** until Phase 4.
