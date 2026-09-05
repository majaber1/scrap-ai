-- Phase 1 foundation: tenancy, RBAC, sites, taxonomy, audit, outbox.
-- Additive and idempotent. Does not drop V1 tables or regenerate IDs.

CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS customer_segment text NOT NULL DEFAULT 'UNKNOWN';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_organization_id uuid REFERENCES organizations(id);

UPDATE users u
SET active_organization_id = m.organization_id
FROM memberships m
WHERE m.user_id = u.id AND u.active_organization_id IS NULL;

CREATE TABLE IF NOT EXISTS permissions (
  code text PRIMARY KEY,
  description text NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  code text PRIMARY KEY,
  scope text NOT NULL,
  description text NOT NULL,
  CHECK (scope IN ('organization','platform','government'))
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_code text NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
  permission_code text NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
  PRIMARY KEY (role_code, permission_code)
);

CREATE TABLE IF NOT EXISTS membership_roles (
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  role_code text NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, organization_id, role_code),
  FOREIGN KEY (user_id, organization_id) REFERENCES memberships(user_id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS platform_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_code text NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_code)
);

INSERT INTO permissions(code, description) VALUES
  ('org.read', 'Read organization profile'),
  ('org.manage', 'Update organization profile and segment'),
  ('members.read', 'Read organization members'),
  ('members.manage', 'Invite members and assign roles'),
  ('site.read', 'Read sites'),
  ('site.create', 'Create sites'),
  ('site.update', 'Update sites'),
  ('site.archive', 'Archive sites'),
  ('material.read', 'Read material taxonomy'),
  ('listing.read', 'Read listings'),
  ('listing.create', 'Create listings'),
  ('listing.manage_own', 'Manage own listings'),
  ('offer.read', 'Read offers'),
  ('offer.create', 'Create offers'),
  ('offer.manage_own', 'Manage own offers'),
  ('analysis.create', 'Create AI visual estimates'),
  ('analysis.read', 'Read AI analyses'),
  ('audit.read_org', 'Read organization audit events')
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles(code, scope, description) VALUES
  ('ORG_OWNER', 'organization', 'Organization owner'),
  ('ORG_ADMIN', 'organization', 'Organization administrator'),
  ('SELLER', 'organization', 'Seller'),
  ('BUYER', 'organization', 'Buyer'),
  ('SITE_MANAGER', 'organization', 'Site manager'),
  ('PROCUREMENT', 'organization', 'Procurement'),
  ('FINANCE', 'organization', 'Finance'),
  ('APPROVER', 'organization', 'Approver'),
  ('LOGISTICS', 'organization', 'Logistics'),
  ('WEIGHBRIDGE', 'organization', 'Weighbridge operator'),
  ('VIEWER', 'organization', 'Read-only member'),
  ('REQUESTER', 'government', 'Government requester taxonomy'),
  ('REVIEWER', 'government', 'Government reviewer taxonomy'),
  ('AUDITOR', 'government', 'Government auditor taxonomy'),
  ('PLATFORM_ADMIN', 'platform', 'Scrap AI platform administrator'),
  ('PLATFORM_SUPPORT', 'platform', 'Scrap AI platform support')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions(role_code, permission_code)
SELECT r, p FROM (
  VALUES
    ('ORG_OWNER','org.read'),('ORG_OWNER','org.manage'),('ORG_OWNER','members.read'),('ORG_OWNER','members.manage'),
    ('ORG_OWNER','site.read'),('ORG_OWNER','site.create'),('ORG_OWNER','site.update'),('ORG_OWNER','site.archive'),
    ('ORG_OWNER','material.read'),('ORG_OWNER','listing.read'),('ORG_OWNER','listing.create'),('ORG_OWNER','listing.manage_own'),
    ('ORG_OWNER','offer.read'),('ORG_OWNER','offer.create'),('ORG_OWNER','offer.manage_own'),
    ('ORG_OWNER','analysis.create'),('ORG_OWNER','analysis.read'),('ORG_OWNER','audit.read_org'),
    ('ORG_ADMIN','org.read'),('ORG_ADMIN','org.manage'),('ORG_ADMIN','members.read'),('ORG_ADMIN','members.manage'),
    ('ORG_ADMIN','site.read'),('ORG_ADMIN','site.create'),('ORG_ADMIN','site.update'),('ORG_ADMIN','site.archive'),
    ('ORG_ADMIN','material.read'),('ORG_ADMIN','listing.read'),('ORG_ADMIN','listing.create'),('ORG_ADMIN','listing.manage_own'),
    ('ORG_ADMIN','offer.read'),('ORG_ADMIN','offer.create'),('ORG_ADMIN','offer.manage_own'),
    ('ORG_ADMIN','analysis.create'),('ORG_ADMIN','analysis.read'),('ORG_ADMIN','audit.read_org'),
    ('SELLER','org.read'),('SELLER','site.read'),('SELLER','material.read'),
    ('SELLER','listing.read'),('SELLER','listing.create'),('SELLER','listing.manage_own'),
    ('SELLER','offer.read'),('SELLER','analysis.create'),('SELLER','analysis.read'),
    ('BUYER','org.read'),('BUYER','material.read'),('BUYER','listing.read'),
    ('BUYER','offer.read'),('BUYER','offer.create'),('BUYER','offer.manage_own'),
    ('BUYER','analysis.read'),
    ('SITE_MANAGER','org.read'),('SITE_MANAGER','site.read'),('SITE_MANAGER','site.create'),
    ('SITE_MANAGER','site.update'),('SITE_MANAGER','site.archive'),('SITE_MANAGER','material.read'),
    ('PROCUREMENT','org.read'),('PROCUREMENT','material.read'),('PROCUREMENT','listing.read'),('PROCUREMENT','offer.read'),
    ('FINANCE','org.read'),('FINANCE','offer.read'),('FINANCE','audit.read_org'),
    ('APPROVER','org.read'),('APPROVER','listing.read'),('APPROVER','offer.read'),('APPROVER','audit.read_org'),
    ('LOGISTICS','org.read'),('LOGISTICS','site.read'),
    ('WEIGHBRIDGE','org.read'),('WEIGHBRIDGE','site.read'),
    ('VIEWER','org.read'),('VIEWER','site.read'),('VIEWER','material.read'),
    ('VIEWER','listing.read'),('VIEWER','offer.read'),('VIEWER','analysis.read'),
    ('REQUESTER','org.read'),('REQUESTER','site.read'),('REQUESTER','material.read'),
    ('REVIEWER','org.read'),('REVIEWER','site.read'),('REVIEWER','audit.read_org'),
    ('AUDITOR','org.read'),('AUDITOR','audit.read_org'),('AUDITOR','site.read')
) AS x(r, p)
ON CONFLICT DO NOTHING;

INSERT INTO membership_roles(user_id, organization_id, role_code)
SELECT m.user_id, m.organization_id,
  CASE
    WHEN m.role IN ('owner','admin') THEN 'ORG_OWNER'
    ELSE 'VIEWER'
  END
FROM memberships m
ON CONFLICT DO NOTHING;

INSERT INTO membership_roles(user_id, organization_id, role_code)
SELECT m.user_id, m.organization_id, 'SELLER'
FROM memberships m
WHERE m.role IN ('owner','admin','seller','both')
ON CONFLICT DO NOTHING;

INSERT INTO membership_roles(user_id, organization_id, role_code)
SELECT m.user_id, m.organization_id, 'BUYER'
FROM memberships m
WHERE m.role IN ('owner','admin','buyer','factory','both')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  site_type text NOT NULL DEFAULT 'OTHER',
  city text,
  region text,
  address_text text,
  latitude numeric,
  longitude numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (site_type IN ('FACTORY','WAREHOUSE','OFFICE','PROJECT_SITE','YARD','FACILITY','OTHER')),
  CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180))
);

CREATE INDEX IF NOT EXISTS sites_org_idx ON sites (organization_id, active, created_at DESC);

CREATE TABLE IF NOT EXISTS material_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES material_families(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  description_ar text,
  description_en text,
  inspection_guidance_ar text,
  inspection_guidance_en text,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS material_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  code text NOT NULL,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  UNIQUE (material_id, code)
);

CREATE TABLE IF NOT EXISTS material_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  grade_id uuid REFERENCES material_grades(id) ON DELETE CASCADE,
  alias text NOT NULL,
  locale text NOT NULL DEFAULT 'und',
  UNIQUE (material_id, alias)
);

CREATE INDEX IF NOT EXISTS material_aliases_alias_idx ON material_aliases (lower(alias));

INSERT INTO material_families(code, label_ar, label_en, sort_order) VALUES
  ('FERROUS', 'حديدي', 'Ferrous', 10),
  ('COPPER', 'نحاس', 'Copper', 20),
  ('ALUMINUM', 'ألمنيوم', 'Aluminum', 30),
  ('STAINLESS', 'ستانلس', 'Stainless', 40),
  ('BRASS', 'نحاس أصفر', 'Brass', 50),
  ('LEAD', 'رصاص', 'Lead', 60),
  ('ZINC', 'زنك', 'Zinc', 70),
  ('CABLE', 'كيابل', 'Cable', 80),
  ('BATTERY', 'بطاريات', 'Battery', 90),
  ('E_WASTE', 'نفايات إلكترونية', 'E-waste', 100),
  ('MOTOR', 'محركات', 'Motor', 110),
  ('MACHINERY', 'معدات', 'Machinery', 120),
  ('MIXED', 'مختلط', 'Mixed', 130),
  ('PLASTIC', 'بلاستيك', 'Plastic', 140),
  ('PAPER', 'ورق', 'Paper', 150),
  ('OTHER', 'أخرى', 'Other', 160)
ON CONFLICT (code) DO NOTHING;

INSERT INTO materials(family_id, code, label_ar, label_en, inspection_guidance_ar, inspection_guidance_en)
SELECT f.id, v.code, v.label_ar, v.label_en, v.g_ar, v.g_en
FROM (VALUES
  ('FERROUS','STEEL_SCRAP','خردة حديد','Steel scrap','افحص الصدأ والملوثات والخلط.','Inspect rust, contaminants, and mixing.'),
  ('COPPER','COPPER_CABLE','كيبل نحاس','Copper cable','افصل العازل والألمنيوم إن وجد.','Separate insulation and any aluminum.'),
  ('COPPER','COPPER_WIRE','أسلاك نحاس','Copper wire','تحقق من الطلاء والخلط.','Check plating and mixing.'),
  ('ALUMINUM','ALUMINUM_SCRAP','خردة ألمنيوم','Aluminum scrap','افصل الحديد والبلاستيك.','Separate ferrous and plastic.'),
  ('BATTERY','LEAD_ACID_BATTERY','بطاريات حمض رصاص','Lead-acid battery','تعامل كمخلفات خطرة حتى الفحص.','Treat as hazardous until inspected.'),
  ('E_WASTE','E_WASTE_MIXED','إلكترونيات مختلطة','Mixed e-waste','لا تفكك البطاريات في الموقع.','Do not strip batteries on site.'),
  ('CABLE','MIXED_CABLE','كيابل مختلطة','Mixed cable','حدد نسبة النحاس بصريا فقط.','Copper ratio is visual only.'),
  ('MIXED','MIXED_SCRAP','سكراب مختلط','Mixed scrap','الفرز مطلوب قبل التسعير.','Sorting required before pricing.')
) AS v(family, code, label_ar, label_en, g_ar, g_en)
JOIN material_families f ON f.code = v.family
ON CONFLICT (code) DO NOTHING;

INSERT INTO material_grades(material_id, code, label_ar, label_en)
SELECT m.id, v.gcode, v.label_ar, v.label_en
FROM (VALUES
  ('COPPER_CABLE','INSULATED','كيبل نحاس معزول','Insulated copper cable'),
  ('COPPER_CABLE','BARE','كيبل نحاس عاري','Bare copper cable'),
  ('STEEL_SCRAP','HMS','حديد ثقيل','Heavy melting steel'),
  ('MIXED_SCRAP','UNSORTED','غير مفروز','Unsorted')
) AS v(mcode, gcode, label_ar, label_en)
JOIN materials m ON m.code = v.mcode
ON CONFLICT (material_id, code) DO NOTHING;

INSERT INTO material_aliases(material_id, grade_id, alias, locale)
SELECT m.id, NULL, v.alias, v.locale
FROM (VALUES
  ('COPPER_CABLE','كيبل نحاس','ar'),
  ('COPPER_CABLE','أسلاك نحاس','ar'),
  ('COPPER_CABLE','copper wire','en'),
  ('COPPER_CABLE','copper cable','en'),
  ('STEEL_SCRAP','حديد','ar'),
  ('STEEL_SCRAP','steel','en'),
  ('ALUMINUM_SCRAP','المنيوم','ar'),
  ('ALUMINUM_SCRAP','aluminum','en'),
  ('E_WASTE_MIXED','إلكترونيات','ar'),
  ('LEAD_ACID_BATTERY','بطاريات','ar'),
  ('MIXED_SCRAP','مختلط','ar')
) AS v(mcode, alias, locale)
JOIN materials m ON m.code = v.mcode
ON CONFLICT (material_id, alias) DO NOTHING;

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  request_id text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_org_created_idx ON audit_events (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_actor_idx ON audit_events (actor_user_id, created_at DESC);

CREATE OR REPLACE FUNCTION audit_events_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_events_immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_events_no_update ON audit_events;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'audit_events_no_update'
  ) THEN
    CREATE TRIGGER audit_events_no_update
      BEFORE UPDATE OR DELETE ON audit_events
      FOR EACH ROW EXECUTE PROCEDURE audit_events_immutable();
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS domain_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  CHECK (status IN ('pending','processing','processed','failed'))
);

CREATE INDEX IF NOT EXISTS domain_outbox_pending_idx ON domain_outbox (status, available_at);

CREATE TABLE IF NOT EXISTS feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  purpose text NOT NULL,
  owner_context text NOT NULL DEFAULT 'phase1',
  removal_criteria text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO feature_flags(key, enabled, purpose, removal_criteria) VALUES
  ('V2_SHELL_ENABLED', true, 'TypeScript workspace at /v2 without replacing V1 root', 'Remove after V2 is the default navigation surface'),
  ('V2_ONBOARDING_ENABLED', true, 'Ask customer segment when UNKNOWN', 'Remove after existing organizations have confirmed segment')
ON CONFLICT (key) DO NOTHING;
