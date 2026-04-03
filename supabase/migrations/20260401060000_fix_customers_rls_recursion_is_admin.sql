/*
  # Fix infinite RLS recursion on public.customers

  Admin policies used EXISTS (SELECT 1 FROM public.customers ...). Evaluating SELECT
  on customers re-runs RLS on customers → infinite recursion → 500 on REST and
  resolveAuthRole() never sees role = admin.

  Use public.is_admin() (SECURITY DEFINER, bypasses RLS) for all admin branches on
  this table, matching the pattern from 20260330130113_fix_rls_admin_policies.sql.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.customers
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "customers_select_admin" ON public.customers;
CREATE POLICY "customers_select_admin"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "customers_update_admin" ON public.customers;
CREATE POLICY "customers_update_admin"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "customers_insert_admin" ON public.customers;
CREATE POLICY "customers_insert_admin"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "customers_delete_admin" ON public.customers;
CREATE POLICY "customers_delete_admin"
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
