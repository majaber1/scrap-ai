-- Phase 2 AI scrap intelligence. Additive. Does not drop V1/Phase 1 tables.

CREATE TABLE IF NOT EXISTS ai_listing_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  analysis_id uuid REFERENCES ai_analyses(id) ON DELETE SET NULL,
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  grade_id uuid REFERENCES material_grades(id) ON DELETE SET NULL,
  listing_id uuid REFERENCES scrap_listings(id) ON DELETE SET NULL,
  title_ar text,
  title_en text,
  description_ar text,
  description_en text,
  suggested_tags jsonb NOT NULL DEFAULT '[]',
  condition_text text,
  city text,
  weight_status text NOT NULL DEFAULT 'NOT_PROVIDED',
  weight_kg numeric,
  confidence numeric,
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status IN ('DRAFT','REVIEW_REQUIRED','CONFIRMED','PUBLISHED','REJECTED')),
  CHECK (weight_status IN ('NOT_PROVIDED','SELLER_PROVIDED','RANGE_UNCONFIRMED')),
  CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

CREATE INDEX IF NOT EXISTS ai_listing_drafts_org_idx ON ai_listing_drafts (organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS material_mapping_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  analysis_id uuid REFERENCES ai_analyses(id) ON DELETE SET NULL,
  draft_id uuid REFERENCES ai_listing_drafts(id) ON DELETE SET NULL,
  ai_label text,
  mapped_material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  mapped_grade_id uuid REFERENCES material_grades(id) ON DELETE SET NULL,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS material_mapping_events_org_idx ON material_mapping_events (organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS market_price_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  region text,
  price_min numeric,
  price_max numeric,
  currency text NOT NULL DEFAULT 'SAR',
  source_type text NOT NULL,
  confidence numeric,
  observed_at timestamptz NOT NULL DEFAULT now(),
  CHECK (source_type IN ('INTERNAL_TRANSACTION','SUPPLIER','EXTERNAL_MARKET','LME')),
  CHECK (price_min IS NULL OR price_max IS NULL OR price_min <= price_max)
);

CREATE INDEX IF NOT EXISTS market_price_signals_material_idx ON market_price_signals (material_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS buyer_matching_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES scrap_listings(id) ON DELETE CASCADE,
  buyer_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  matching_factors jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (score >= 0 AND score <= 1)
);

CREATE INDEX IF NOT EXISTS buyer_matching_scores_listing_idx ON buyer_matching_scores (listing_id, score DESC);

CREATE TABLE IF NOT EXISTS ai_feedback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  analysis_id uuid REFERENCES ai_analyses(id) ON DELETE SET NULL,
  draft_id uuid REFERENCES ai_listing_drafts(id) ON DELETE SET NULL,
  field_name text NOT NULL,
  ai_value text,
  human_value text,
  source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (source IN ('SELLER','BUYER','SYSTEM'))
);

CREATE INDEX IF NOT EXISTS ai_feedback_events_org_idx ON ai_feedback_events (organization_id, created_at DESC);
