-- ===========================================================================
-- MindFlow CRM — admin-managed dropdown options
--
-- Lets admins add custom options to the Category / Stage / Source /
-- Client Type / Activity Type dropdowns. To allow values beyond the original
-- fixed enums, the CHECK constraints on those columns are dropped; the
-- field_options table becomes the source of truth the UI reads from.
--
-- Depends on 20260805000003 (is_admin / is_approved helpers).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Relax the enum CHECK constraints so custom option values are accepted.
--    (Postgres auto-named these *_check when the columns were created.)
-- ---------------------------------------------------------------------------
ALTER TABLE contacts   DROP CONSTRAINT IF EXISTS contacts_category_check;
ALTER TABLE contacts   DROP CONSTRAINT IF EXISTS contacts_stage_check;
ALTER TABLE contacts   DROP CONSTRAINT IF EXISTS contacts_source_check;
ALTER TABLE contacts   DROP CONSTRAINT IF EXISTS contacts_client_type_check;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;

-- ---------------------------------------------------------------------------
-- 2. field_options — one row per selectable option per dropdown field.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS field_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),

  field TEXT NOT NULL
    CHECK (field IN ('category', 'stage', 'source', 'client_type', 'activity_type')),
  value TEXT NOT NULL,        -- slug stored on contacts/activities
  label TEXT NOT NULL,        -- human-readable display text
  sort_order INT NOT NULL DEFAULT 100,
  is_default BOOLEAN NOT NULL DEFAULT false,  -- seeded built-ins (not deletable)

  UNIQUE (field, value)
);

CREATE INDEX IF NOT EXISTS idx_field_options_field ON field_options(field);

-- ---------------------------------------------------------------------------
-- 3. RLS: approved users can read (to populate dropdowns); admins manage.
-- ---------------------------------------------------------------------------
ALTER TABLE field_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved users read field options" ON field_options;
CREATE POLICY "Approved users read field options"
  ON field_options FOR SELECT
  USING (is_approved());

DROP POLICY IF EXISTS "Admins insert field options" ON field_options;
CREATE POLICY "Admins insert field options"
  ON field_options FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins update field options" ON field_options;
CREATE POLICY "Admins update field options"
  ON field_options FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins delete field options" ON field_options;
CREATE POLICY "Admins delete field options"
  ON field_options FOR DELETE
  USING (is_admin());

-- ---------------------------------------------------------------------------
-- 4. Seed the built-in options (is_default = true). ON CONFLICT keeps this
--    idempotent and preserves any labels an admin later customizes.
-- ---------------------------------------------------------------------------
INSERT INTO field_options (field, value, label, sort_order, is_default) VALUES
  -- category
  ('category', 'potential_client', 'Potential Client', 10, true),
  ('category', 'event_attendee',   'Event Attendee',   20, true),
  ('category', 'app_user',         'App User',         30, true),
  ('category', 'shop_buyer',       'Shop Buyer',       40, true),
  ('category', 'partner',          'Partner',          50, true),
  ('category', 'sponsor',          'Sponsor',          60, true),
  ('category', 'contractor',       'Contractor',       70, true),
  ('category', 'other',            'Other',            80, true),
  -- stage
  ('stage', 'new_lead',  'New Lead',  10, true),
  ('stage', 'contacted', 'Contacted', 20, true),
  ('stage', 'engaged',   'Engaged',   30, true),
  ('stage', 'qualified', 'Qualified', 40, true),
  ('stage', 'converted', 'Converted', 50, true),
  ('stage', 'inactive',  'Inactive',  60, true),
  -- source
  ('source', 'website',       'Website',       10, true),
  ('source', 'referral',      'Referral',      20, true),
  ('source', 'event',         'Event',         30, true),
  ('source', 'social_media',  'Social Media',  40, true),
  ('source', 'app',           'App',           50, true),
  ('source', 'shop',          'Shop',          60, true),
  ('source', 'cold_outreach', 'Cold Outreach', 70, true),
  ('source', 'other',         'Other',         80, true),
  -- client_type
  ('client_type', 'enterprise_b2b', 'Enterprise (B2B)', 10, true),
  ('client_type', 'consumer_d2c',   'Consumer (D2C)',   20, true),
  -- activity_type
  ('activity_type', 'email',      'Email',      10, true),
  ('activity_type', 'call',       'Call',       20, true),
  ('activity_type', 'meeting',    'Meeting',    30, true),
  ('activity_type', 'note',       'Note',       40, true),
  ('activity_type', 'event',      'Event',      50, true),
  ('activity_type', 'purchase',   'Purchase',   60, true),
  ('activity_type', 'app_signup', 'App Signup', 70, true),
  ('activity_type', 'follow_up',  'Follow Up',  80, true),
  ('activity_type', 'other',      'Other',      90, true)
ON CONFLICT (field, value) DO NOTHING;
