-- Scrap AI core schema. Idempotent. Source of truth for users, orgs, listings, offers, pickups.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'company',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, organization_id)
);

CREATE TABLE IF NOT EXISTS scrap_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  material text,
  quantity numeric,
  unit text NOT NULL DEFAULT 'kg',
  city text,
  indicative_value numeric,
  image_url text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES scrap_listings(id) ON DELETE CASCADE,
  buyer_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pickups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES scrap_listings(id) ON DELETE CASCADE,
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  scheduled_at timestamptz,
  address_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scrap_listings_status_created_idx ON scrap_listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS scrap_listings_seller_idx ON scrap_listings (seller_org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS offers_listing_idx ON offers (listing_id, status);
CREATE INDEX IF NOT EXISTS offers_buyer_idx ON offers (buyer_org_id, created_at DESC);
