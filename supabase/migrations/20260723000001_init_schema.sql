-- ===========================================================================
-- MindFlow CRM — initial schema
-- Tables: contacts, activities (1:many, ON DELETE CASCADE)
-- Triggers: auto-update updated_date; maintain contacts.last_contacted
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),

  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  location TEXT,

  category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('potential_client','event_attendee','app_user','shop_buyer','partner','sponsor','contractor','other')),

  client_type TEXT
    CHECK (client_type IS NULL OR client_type IN ('enterprise_b2b','consumer_d2c')),

  stage TEXT NOT NULL DEFAULT 'new_lead'
    CHECK (stage IN ('new_lead','contacted','engaged','qualified','converted','inactive')),

  source TEXT NOT NULL DEFAULT 'other'
    CHECK (source IN ('website','referral','event','social_media','app','shop','cold_outreach','other')),

  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  assigned_to TEXT,
  last_contacted TIMESTAMPTZ,
  last_event_date DATE
);

CREATE INDEX IF NOT EXISTS idx_contacts_stage ON contacts(stage);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON contacts(category);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by_id);

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),

  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  type TEXT NOT NULL DEFAULT 'note'
    CHECK (type IN ('email','call','meeting','note','event','purchase','app_signup','follow_up','other')),

  title TEXT NOT NULL,
  description TEXT,
  logged_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_date ON activities(created_date DESC);

-- ---------------------------------------------------------------------------
-- Trigger: keep updated_date current on every UPDATE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contacts_updated_date ON contacts;
CREATE TRIGGER contacts_updated_date
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_date();

DROP TRIGGER IF EXISTS activities_updated_date ON activities;
CREATE TRIGGER activities_updated_date
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ---------------------------------------------------------------------------
-- Trigger: bump contacts.last_contacted whenever an activity is logged.
-- The client relies on this — it must NOT also write last_contacted.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_last_contacted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts SET last_contacted = now()
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS activities_update_last_contacted ON activities;
CREATE TRIGGER activities_update_last_contacted
  AFTER INSERT ON activities
  FOR EACH ROW EXECUTE FUNCTION update_last_contacted();
