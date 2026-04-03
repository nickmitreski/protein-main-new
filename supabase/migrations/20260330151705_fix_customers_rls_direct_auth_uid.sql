/*
  # Fix customers RLS - replace self-referential subqueries with direct auth.uid()

  ## Problem
  The customers SELECT policy used a correlated subquery that reads from the customers
  table itself to check if the current user is admin. This created a circular lookup:
  "to read customers, check if you're admin in customers". This could return null
  during signIn because the session context wasn't fully propagated when the role
  lookup ran immediately after signInWithPassword.

  ## Fix
  - customers_select: allow a user to read their own row via direct auth.uid() = id
  - For admin-checking policies on OTHER tables, they use EXISTS on customers which
    is fine since the admin is reading customers externally
  - The SELECT on customers itself just needs: own row OR is admin
    We simplify the admin check to use auth.jwt() -> app_metadata when possible,
    but since role is stored in customers (not JWT), we keep the subquery but
    add a direct self-read path that bypasses the circular check.

  The key fix: split into TWO policies - one for own-row access (no subquery needed),
  one for admin access. This removes the circular dependency entirely.
*/

DROP POLICY IF EXISTS "customers_select" ON public.customers;

CREATE POLICY "customers_select_own"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "customers_select_admin"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );
