-- ===========================================================================
-- MindFlow CRM — "brand" field on contacts
--
-- Adds brand (the selected option) + brand_other (free text used when the
-- selection is "Other") to contacts, and registers 'brand' as an admin-managed
-- dropdown field in field_options (seeded with the initial brands).
--
-- Depends on 20261005000005 (field_options).
-- ===========================================================================

-- 1. New columns on contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS brand_other TEXT;

-- 2. Allow 'brand' as a managed field in field_options
ALTER TABLE field_options DROP CONSTRAINT IF EXISTS field_options_field_check;
ALTER TABLE field_options ADD CONSTRAINT field_options_field_check
  CHECK (field IN ('category','stage','source','client_type','activity_type','brand'));

-- 3. Seed the initial brand options
INSERT INTO field_options (field, value, label, sort_order, is_default) VALUES
  ('brand', 'life_stages', 'Life Stages',      10, true),
  ('brand', 'fitness_z',   'Fitness by Z/CPT', 20, true),
  ('brand', 'other',       'Other',            30, true)
ON CONFLICT (field, value) DO NOTHING;
