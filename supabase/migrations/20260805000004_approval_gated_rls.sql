-- ===========================================================================
-- MindFlow CRM — gate contacts & activities behind approval
--
-- Rewrites the ownership policies from 20260723000002 so that, in addition to
-- owning the row, the user must be approved (is_approved()). Pending or
-- rejected users can't read or write CRM data even via the raw API.
--
-- Ownership model is unchanged (each user still sees only their own rows);
-- being an admin does NOT grant access to other users' contacts — the admin
-- role only governs the user-management panel.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own contacts" ON contacts;
CREATE POLICY "Users can read own contacts"
  ON contacts FOR SELECT
  USING (created_by_id = auth.uid() AND is_approved());

DROP POLICY IF EXISTS "Users can create contacts" ON contacts;
CREATE POLICY "Users can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (created_by_id = auth.uid() AND is_approved());

DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  USING (created_by_id = auth.uid() AND is_approved());

DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;
CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  USING (created_by_id = auth.uid() AND is_approved());

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own activities" ON activities;
CREATE POLICY "Users can read own activities"
  ON activities FOR SELECT
  USING (
    is_approved()
    AND contact_id IN (SELECT id FROM contacts WHERE created_by_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create own activities" ON activities;
CREATE POLICY "Users can create own activities"
  ON activities FOR INSERT
  WITH CHECK (
    is_approved()
    AND contact_id IN (SELECT id FROM contacts WHERE created_by_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own activities" ON activities;
CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  USING (created_by_id = auth.uid() AND is_approved());

DROP POLICY IF EXISTS "Users can delete own activities" ON activities;
CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  USING (created_by_id = auth.uid() AND is_approved());
