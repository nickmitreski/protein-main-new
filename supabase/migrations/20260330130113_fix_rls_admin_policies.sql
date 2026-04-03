/*
  # Fix Admin RLS Policies — Prevent Infinite Recursion

  ## Problem
  The existing admin policies use a subquery `EXISTS (SELECT 1 FROM customers WHERE id = auth.uid() AND role = 'admin')`
  to check admin status. When applied to the `customers` table itself, this causes infinite recursion
  because Postgres evaluates the policy by querying the same table it is protecting.

  ## Solution
  Replace all subquery-based admin checks with a SECURITY DEFINER function `is_admin()` that bypasses
  RLS when checking the caller's role. This breaks the recursive cycle.

  ## Changes
  - New helper function `public.is_admin()` — SECURITY DEFINER, reads customers directly
  - Drop and recreate all admin policies on products, customers, orders, order_items
    to use the new function instead of inline subqueries
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

-- Products admin policy
DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Customers admin policy
DROP POLICY IF EXISTS "customers_admin_all" ON public.customers;
CREATE POLICY "customers_admin_all"
  ON public.customers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Orders admin select policy
DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  USING (public.is_admin());

-- Orders admin update policy
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order items admin select policy
DROP POLICY IF EXISTS "order_items_select_admin" ON public.order_items;
CREATE POLICY "order_items_select_admin"
  ON public.order_items FOR SELECT
  USING (public.is_admin());
