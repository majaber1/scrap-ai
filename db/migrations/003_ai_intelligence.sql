-- AI intelligence telemetry and analysis provenance. Idempotent.
CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_provider_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  analysis_id uuid REFERENCES ai_analyses(id) ON DELETE SET NULL,
  provider text NOT NULL,
  model text,
  status text NOT NULL,
  ok boolean NOT NULL DEFAULT false,
  fallback_used boolean NOT NULL DEFAULT false,
  latency_ms integer,
  error_class text,
  error_message text,
  prompt_tokens integer,
  completion_tokens integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_provider_events_created_idx ON ai_provider_events (created_at DESC);
CREATE INDEX IF NOT EXISTS ai_provider_events_provider_idx ON ai_provider_events (provider, created_at DESC);

ALTER TABLE ai_analyses ADD COLUMN IF NOT EXISTS provider text;
ALTER TABLE ai_analyses ADD COLUMN IF NOT EXISTS latency_ms integer;
ALTER TABLE ai_analyses ADD COLUMN IF NOT EXISTS fallback_used boolean NOT NULL DEFAULT false;
ALTER TABLE ai_analyses ADD COLUMN IF NOT EXISTS estimate_kind text NOT NULL DEFAULT 'VISUAL_ESTIMATE';
