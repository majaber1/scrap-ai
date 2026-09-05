-- Repair Phase 1 columns when CREATE TABLE IF NOT EXISTS left an older shape in place.
-- Additive. Does not drop tables or rewrite existing IDs.

ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS entity_type text;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS entity_id uuid;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS request_id text;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS before_state jsonb;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS after_state jsonb;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS created_at timestamptz;

ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS aggregate_type text;
ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS aggregate_id uuid;
ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS payload jsonb;
ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS attempts integer;
ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS available_at timestamptz;
ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS created_at timestamptz;
ALTER TABLE domain_outbox ADD COLUMN IF NOT EXISTS processed_at timestamptz;
