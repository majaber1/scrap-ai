# Phase 0 test fixtures

These files are **TEST FIXTURES ONLY**.

They are not live marketplace listings, not prices, and not production user content.

| File | What it is |
| --- | --- |
| `PHASE0_TEST_FIXTURE_scrap_photo.jpg` | Real photograph used only to exercise production image upload → `/api/ai-analyze`. |

Do **not** hardcode an expected AI material label for this photo. The E2E checks schema, provider/model telemetry, persistence, and UI survival only.
