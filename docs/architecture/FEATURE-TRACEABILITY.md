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

## Phase 1 — Foundation (in progress)

Regression baseline remains Phase 0 production SHA `ed59c644e2d532776ba0fc93b0214363b7778183`. Phase 1 is additive.

| Link | Value |
| --- | --- |
| Actor | Individual, company/factory, government (segment) |
| Capability | Tenancy, RBAC, sites, taxonomy, audit, outbox, V2 shell |
| Context | identity, organizations, materials, audit |
| Entity | Organization.customer_segment, Site, Role, Permission, AuditEvent, Outbox |
| DB | `004_phase1_foundation.sql` (additive) |
| API | V1 preserved; `/api/v2/me`, organization, sites, materials, members, session |
| UI | `/v2` TypeScript shell; V1 root unchanged |
| Audit | append-only `audit_events` |
| Test | `scripts/phase1-unit.mjs`, `scripts/phase1-api.mjs`, `scripts/phase1-browser.mjs`, Phase 0 `test:ai` |
