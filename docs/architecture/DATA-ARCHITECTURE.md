# Data Architecture

PostgreSQL system of record. UUID, FKs, numeric money, timestamptz, indexes, migrations, tenant `organization_id` on org-owned rows.

JSONB for metadata only. Immutable audit/weighing/payment facts where required.

Phase 0: advisory lock + `003_ai_intelligence.sql` + `schema_migrations` ledger.
