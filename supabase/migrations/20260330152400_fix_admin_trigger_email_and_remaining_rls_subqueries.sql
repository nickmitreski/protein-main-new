/*
  # Fix admin trigger email + remaining self-referential RLS subqueries

  ## Changes

  1. handle_new_user trigger
     - Remove hardcoded email-based auto-promotion entirely (not safe; anyone can
       register with an admin email unless invite-only is enabled)
     - All new signups get role = 'customer'; admin must be promoted via SQL UPDATE
     - This is the correct, secure pattern for a production app

  2. Ensure admin@admin.com stays admin (idempotent guard)

  3. customers UPDATE policy
     - Replace self-referential subquery with a simpler, safer version using two
       separate policies: own-row update and admin update. The old single policy
       with a subquery could still circular-block.

  4. customers DELETE and INSERT policies
     - Replace self-referential subqueries with EXISTS-based checks that read
       the caller's own row (same pattern as the fixed SELECT admin policy)
*/

-- 1. Fix handle_new_user: all new signups are customers; admin is set via SQL UPDATE
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
    'customer',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Guard: ensure admin@admin.com is always admin
UPDATE public.customers
SET role = 'admin'
WHERE email = 'admin@admin.com' AND role != 'admin';

-- 3. Fix customers UPDATE — drop old combined policy, add two clean ones
DROP POLICY IF EXISTS "customers_update" ON public.customers;

CREATE POLICY "customers_update_own"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "customers_update_admin"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );

-- 4. Fix customers INSERT — drop old policy, replace with clean EXISTS check
DROP POLICY IF EXISTS "customers_admin_insert" ON public.customers;

CREATE POLICY "customers_insert_admin"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );

-- 5. Fix customers DELETE — drop old policy, replace with clean EXISTS check
DROP POLICY IF EXISTS "customers_admin_delete" ON public.customers;

CREATE POLICY "customers_delete_admin"
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );
