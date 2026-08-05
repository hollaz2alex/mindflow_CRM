-- ===========================================================================
-- MindFlow CRM — user profiles, roles, and approval workflow
--
-- Adds a public.profiles row per auth user with:
--   status: pending | approved | rejected   (new signups start 'pending')
--   role:   member | admin
--
-- A signup trigger auto-creates the profile. Two SECURITY DEFINER helpers
-- (is_admin / is_approved) are used by RLS here and in the approval-gate
-- migration for contacts/activities.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),

  email TEXT,
  full_name TEXT,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'admin'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Keep updated_date fresh (reuses update_updated_date() from the init migration)
DROP TRIGGER IF EXISTS profiles_updated_date ON profiles;
CREATE TRIGGER profiles_updated_date
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ---------------------------------------------------------------------------
-- Auto-create a profile whenever a new auth user signs up.
-- SECURITY DEFINER so it can insert regardless of RLS.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill: the trigger only fires for NEW signups, so give any pre-existing
-- auth users a profile too (they start 'pending' like everyone else).
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Helper predicates. SECURITY DEFINER so they read profiles WITHOUT triggering
-- the profiles RLS policies (which would otherwise recurse).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION is_approved()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'approved'
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS on profiles
--   SELECT: a user sees their own row; admins see everyone.
--   UPDATE: admins only (this is how approval / role changes happen).
--   INSERT/DELETE: no client policy — inserts come from the signup trigger
--                  (SECURITY DEFINER), and users cannot self-approve.
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());
