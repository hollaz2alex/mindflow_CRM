-- ===========================================================================
-- Bootstrap the FIRST admin.
--
-- New signups start as status='pending', role='member', so someone has to be
-- promoted manually to break the chicken-and-egg problem (an admin is needed
-- to approve everyone else).
--
-- HOW TO USE:
--   1. Apply the migrations.
--   2. Sign up in the app with the email that should be the first admin.
--   3. Replace the email below and run this ONCE in the Supabase SQL Editor.
--
-- After this, that user can approve/reject and promote others from the /admin
-- panel — you won't need to touch SQL again.
-- ===========================================================================

UPDATE public.profiles
SET role = 'admin',
    status = 'approved'
WHERE email = 'REPLACE_WITH_YOUR_ADMIN_EMAIL';

-- Verify:
-- SELECT id, email, role, status FROM public.profiles ORDER BY created_date;
