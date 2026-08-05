-- ===========================================================================
-- MindFlow CRM — Row Level Security
-- Single-tenant ownership model: each user sees only rows they created.
-- (For a team model, swap the ownership checks for a team_members membership
--  check — see the note at the bottom.)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- contacts — all four verbs gated on created_by_id = auth.uid()
-- ---------------------------------------------------------------------------
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own contacts" ON contacts;
CREATE POLICY "Users can read own contacts"
  ON contacts FOR SELECT
  USING (created_by_id = auth.uid());

DROP POLICY IF EXISTS "Users can create contacts" ON contacts;
CREATE POLICY "Users can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (created_by_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  USING (created_by_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;
CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  USING (created_by_id = auth.uid());

-- ---------------------------------------------------------------------------
-- activities
--   SELECT / INSERT: gated through the parent contact's ownership
--   UPDATE / DELETE: gated on the activity's own created_by_id
-- ---------------------------------------------------------------------------
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own activities" ON activities;
CREATE POLICY "Users can read own activities"
  ON activities FOR SELECT
  USING (
    contact_id IN (SELECT id FROM contacts WHERE created_by_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create own activities" ON activities;
CREATE POLICY "Users can create own activities"
  ON activities FOR INSERT
  WITH CHECK (
    contact_id IN (SELECT id FROM contacts WHERE created_by_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own activities" ON activities;
CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  USING (created_by_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own activities" ON activities;
CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  USING (created_by_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Team model variant (not enabled): to share contacts across a team, replace
--   created_by_id = auth.uid()
-- with
--   team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
-- (requires adding a team_id column and a team_members table).
-- ---------------------------------------------------------------------------
