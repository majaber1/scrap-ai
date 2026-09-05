# Feature Traceability

Format: ACTOR → CAPABILITY → CONTEXT → STATE MACHINE → ENTITY → DB → API → UI → AUDIT → TEST

## Phase 0 — Image intelligence (COMPLETE)

Phase 0 AI freeze: SHA `ed59c644e2d532776ba0fc93b0214363b7778183`, deployment `dpl_7wJQCbVUgcDJtjHqDVWdQaz4V9bZ`. Real AI E2E PASS. Current production is Phase 1 (below).

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

This row must stay green. Phase 2 is NOT STARTED.

## Phase 1 — Foundation (COMPLETE)

Current production: SHA `054840a9401931460e54563b0dd5ee9afc33a10d`, deployment `dpl_DeyCdrxrZz52YFJgrEcMz5ertn5T`, https://scrap-ai.vercel.app. Phase 0 AI E2E PASS. Marketplace PASS. Tenant isolation PASS. RBAC PASS. Health PASS. Drift NO. Phase 2 NOT STARTED.

Migrations: `004_phase1_foundation.sql`, `005_phase1_column_repair.sql`. V1 tables dropped: NONE. Existing records lost: NONE.

Tables added: `permissions`, `roles`, `role_permissions`, `membership_roles`, `platform_roles`, `sites`, `material_families`, `materials`, `material_grades`, `material_aliases`, `audit_events`, `domain_outbox`, `feature_flags`.

Tables altered: `organizations.customer_segment`, `users.active_organization_id`.

| Link | Value |
| --- | --- |
| Actor | Individual, company/factory, government (segment) |
| Capability | Tenancy, RBAC, sites, taxonomy, audit, outbox, V2 shell |
| Context | identity, organizations, materials, audit |
| Entity | Organization.customer_segment, Site, Role, Permission, AuditEvent, Outbox |
| DB | `004_phase1_foundation.sql`, `005_phase1_column_repair.sql` (additive) |
| API | V1 preserved; `/api/v2/*` catch-all |
| UI | `/v2` TypeScript shell; V1 root unchanged |
| Audit | append-only `audit_events` |
| Test | `scripts/phase1-unit.mjs`, `scripts/phase1-api.mjs`, `scripts/phase1-browser.mjs`, `test:prod`, Phase 0 `test:ai` |
