# Data Architecture

PostgreSQL system of record. UUID, FKs, numeric money, timestamptz, indexes, migrations, tenant `organization_id` on org-owned rows.

JSONB for metadata only. Immutable audit/weighing/payment facts where required.

Phase 0: advisory lock + `003_ai_intelligence.sql` + `schema_migrations` ledger.

Phase 1 (additive): `004_phase1_foundation.sql` — `organizations.customer_segment`, `users.active_organization_id`, `permissions`, `roles`, `role_permissions`, `membership_roles`, `platform_roles`, `sites`, `material_families`, `materials`, `material_grades`, `material_aliases`, append-only `audit_events`, `domain_outbox`, `feature_flags`. No V1 tables dropped.
