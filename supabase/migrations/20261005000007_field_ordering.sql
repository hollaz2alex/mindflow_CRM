-- ===========================================================================
-- MindFlow CRM — ordering for dropdown fields
--
-- Options already order by field_options.sort_order. This adds field_meta to
-- persist the order of the FIELDS themselves on the admin Dropdown Options
-- page. Depends on 20261005000005 (is_admin / is_approved).
-- ===========================================================================

CREATE TABLE IF NOT EXISTS field_meta (
  field TEXT PRIMARY KEY
    CHECK (field IN ('category','stage','source','client_type','activity_type','brand')),
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 100
);

ALTER TABLE field_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved users read field meta" ON field_meta;
CREATE POLICY "Approved users read field meta"
  ON field_meta FOR SELECT
  USING (is_approved());

DROP POLICY IF EXISTS "Admins update field meta" ON field_meta;
CREATE POLICY "Admins update field meta"
  ON field_meta FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

INSERT INTO field_meta (field, label, sort_order) VALUES
  ('category',      'Category',      10),
  ('stage',         'Stage',         20),
  ('source',        'Source',        30),
  ('client_type',   'Client Type',   40),
  ('activity_type', 'Activity Type', 50),
  ('brand',         'Brand',         60)
ON CONFLICT (field) DO NOTHING;
