# Feature Traceability

Format: ACTOR → CAPABILITY → CONTEXT → STATE MACHINE → ENTITY → DB → API → UI → AUDIT → TEST

## Phase 0 — Image intelligence (COMPLETE)

Regression baseline: production SHA `ed59c644e2d532776ba0fc93b0214363b7778183`, deployment `dpl_7wJQCbVUgcDJtjHqDVWdQaz4V9bZ`, https://scrap-ai.vercel.app. Real AI E2E PASS; GitHub/production drift NO. Do not start Phase 1 until authorized.

| Link | Value |
| --- | --- |
| Actor | Authenticated individual / org member |
| Capability | Image intelligence (visual estimate) |
| Context | ai-intelligence |
| State | ai_provider_events queued/processing/completed/failed |
| Entity | AiAnalysis |
| DB | ai_analyses, ai_provider_events |
| API | POST+GET /api/ai-analyze |
| UI | Analyze page + account AI panel; dashboard history from GET |
| Audit | persistence row is the Phase 0 audit; dedicated audit table Phase 1 |
| Test | scripts/architecture-check.mjs, scripts/phase0-ai-e2e.mjs, npm test |

No other V2 feature is in implementation until this row stays green.
