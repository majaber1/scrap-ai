# Phase 0 test fixtures

These files are **TEST FIXTURES ONLY**.

They are not live marketplace listings, not prices, and not production user content.

| File | What it is |
| --- | --- |
| `PHASE0_TEST_FIXTURE_scrap_photo.jpg` | Real photograph of piled scrap metal (Wikimedia Commons, 1280px). Used only to exercise production UI/API upload → `POST /api/ai-analyze`. |

**Source (attribution required by license):** Joe Mabel, *Metal piled up for recycling at Terminal 105*, Seattle, 25 April 2020. [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Seattle_-_metal_piled_up_for_recycling_at_Terminal_105.jpg). License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Do **not** hardcode an expected AI material label or price for this photo. The E2E checks schema, provider/model telemetry, persistence, browser visibility, refresh survival, and production health only.
