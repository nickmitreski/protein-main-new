-- =============================================================================
-- Make a user an admin (run in Supabase → SQL → New query)
-- =============================================================================
-- Prerequisite: create the user first in Dashboard → Authentication → Users
-- (Add user → email + password, or they sign up via /signup on your site).
--
-- After this script, sign in at your app: /login  →  you should land on /admin
--
-- Also set Authentication → URL configuration:
--   Site URL: e.g. http://localhost:5173 (dev) or your production URL
--   Redirect URLs: add the same URLs (one per line or wildcard if you accept that)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1 — Find the Auth user id (copy the `id` UUID for your admin email)
-- -----------------------------------------------------------------------------
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 30;

-- -----------------------------------------------------------------------------
-- STEP 2 — Promote that user to admin in public.customers
--
-- Replace the two placeholders below:
--   YOUR-USER-UUID-FROM-STEP-1
--   same-email-as-in-auth@example.com
--
-- If the user already signed up on the site, a customers row exists; this
-- upsert only sets role + email. If they were created only in Dashboard and
-- never logged into the app, this INSERT creates the profile row.
-- -----------------------------------------------------------------------------

INSERT INTO public.customers (id, email, role, first_name, last_name)
VALUES (
  'YOUR-USER-UUID-FROM-STEP-1'::uuid,
  'same-email-as-in-auth@example.com',
  'admin',
  'Admin',
  'User'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  email = EXCLUDED.email,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- STEP 3 — Verify (should show one row, role = admin)
-- -----------------------------------------------------------------------------
SELECT id, email, role, created_at
FROM public.customers
WHERE role = 'admin';

-- =============================================================================
-- Alternative — JWT only (no SQL): Dashboard → Authentication → Users → user
-- → User Management → scroll to "App Metadata" / raw JSON → set:
--   { "role": "admin" }
-- The app checks JWT app_metadata.role before customers.role. Using STEP 2
-- is still recommended so RLS and admin queries on public.customers stay
-- consistent.
-- =============================================================================
--
-- Frontend bootstrap (optional): if customers.role is missing on first login,
-- add to .env:  VITE_ADMIN_EMAILS=you@yourdomain.com
-- Prefer STEP 2 for production.
-- =============================================================================
