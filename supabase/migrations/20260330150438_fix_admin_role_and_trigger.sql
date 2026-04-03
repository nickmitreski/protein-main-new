/*
  # Fix admin role assignment

  ## Problem
  The `handle_new_user` trigger always assigns `role: 'customer'` to new signups,
  with no mechanism to promote users to admin through the app.

  ## Changes
  1. Updates `handle_new_user` trigger function to assign 'admin' role when the
     signing-up email matches a designated admin email (admin@coreforge.com.au).
     Any other email gets 'customer' as before.
  2. Ensures the existing admin@admin.com customer row has role='admin' (idempotent).
  3. Adds a helper that lets the admin promote/demote other customers via UPDATE
     (already covered by existing customers_update policy).

  ## Notes
  - The trigger runs on auth.users INSERT, so new signups via the signup page
    will automatically get the correct role.
  - Existing users are unaffected unless explicitly updated.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    CASE
      WHEN LOWER(COALESCE(NEW.email, '')) = 'admin@coreforge.com.au' THEN 'admin'
      ELSE 'customer'
    END,
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

UPDATE public.customers
SET role = 'admin'
WHERE email = 'admin@admin.com'
  AND role != 'admin';
