/*
  # Fix Multiple Permissive Policies

  ## Summary
  Supabase flagged multiple permissive policies on the same table/role/action
  combinations. This happens because the admin "catch-all" policies overlap with
  the user-specific policies for every role (anon, authenticated, etc.).

  ## Root Cause
  The existing `customers_admin_all`, `products_admin_all`, `orders_select_admin`,
  and `order_items_select_admin` policies were created without a TO clause scoped to
  a specific role, so they apply to ALL roles including anon — creating overlap with
  the user-specific policies.

  ## Fix Strategy
  1. Drop the broad admin policies.
  2. Recreate them scoped only to `authenticated` users AND only for users whose
     customer record has role = 'admin'. This eliminates the overlap for anon/
     authenticator/dashboard_user roles.

  ## Affected Tables
  - public.customers (SELECT, UPDATE, INSERT, DELETE for admin)
  - public.products (SELECT, INSERT, UPDATE, DELETE for admin)
  - public.orders (SELECT, INSERT, UPDATE, DELETE for admin)
  - public.order_items (SELECT, INSERT, UPDATE, DELETE for admin)
*/

-- ============================================================
-- Helper: inline admin check subquery
-- (select role FROM public.customers WHERE id = (select auth.uid())) = 'admin'
-- ============================================================

-- ---- customers ----
DROP POLICY IF EXISTS "customers_admin_all" ON public.customers;

CREATE POLICY "customers_admin_select"
  ON public.customers FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "customers_admin_insert"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "customers_admin_update"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "customers_admin_delete"
  ON public.customers FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

-- ---- products ----
DROP POLICY IF EXISTS "products_admin_all" ON public.products;

CREATE POLICY "products_admin_select"
  ON public.products FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "products_admin_insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "products_admin_update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "products_admin_delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

-- ---- orders ----
DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;

CREATE POLICY "orders_admin_select"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "orders_admin_insert"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "orders_admin_update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "orders_admin_delete"
  ON public.orders FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

-- ---- order_items ----
DROP POLICY IF EXISTS "order_items_select_admin" ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_all" ON public.order_items;

CREATE POLICY "order_items_admin_select"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "order_items_admin_insert"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "order_items_admin_update"
  ON public.order_items FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

CREATE POLICY "order_items_admin_delete"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );
