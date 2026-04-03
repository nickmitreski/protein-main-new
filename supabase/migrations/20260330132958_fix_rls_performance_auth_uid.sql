/*
  # Fix RLS Policy Performance: Use (select auth.uid()) Pattern

  ## Summary
  Replace bare `auth.uid()` calls with `(select auth.uid())` in all RLS policies.
  This ensures the function is evaluated once per query rather than once per row,
  significantly improving performance at scale.

  ## Affected Tables & Policies
  - `public.customers` — customers_select_self, customers_update_self
  - `public.orders` — orders_select_own, orders_insert_checkout
  - `public.order_items` — order_items_select_own, order_items_insert_checkout

  ## Changes
  Drop and recreate each affected policy with the optimized pattern.
*/

-- ============================================================
-- customers: customers_select_self
-- ============================================================
DROP POLICY IF EXISTS "customers_select_self" ON public.customers;
CREATE POLICY "customers_select_self"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- ============================================================
-- customers: customers_update_self
-- ============================================================
DROP POLICY IF EXISTS "customers_update_self" ON public.customers;
CREATE POLICY "customers_update_self"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================
-- orders: orders_select_own
-- ============================================================
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (customer_id = (SELECT auth.uid()));

-- ============================================================
-- orders: orders_insert_checkout
-- ============================================================
DROP POLICY IF EXISTS "orders_insert_checkout" ON public.orders;
CREATE POLICY "orders_insert_checkout"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = (SELECT auth.uid()));

-- ============================================================
-- order_items: order_items_select_own
-- ============================================================
DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
CREATE POLICY "order_items_select_own"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- order_items: order_items_insert_checkout
-- ============================================================
DROP POLICY IF EXISTS "order_items_insert_checkout" ON public.order_items;
CREATE POLICY "order_items_insert_checkout"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = (SELECT auth.uid())
    )
  );
