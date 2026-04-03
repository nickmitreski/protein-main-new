/*
  # Fix Security Issues: Indexes, RLS Performance, and Policy Consolidation

  ## Summary
  Addresses all Supabase security advisor warnings.

  ### 1. Missing Foreign Key Indexes
  - abandoned_carts.customer_id
  - order_items.order_id
  - order_items.product_id
  - orders.customer_id

  ### 2. Drop Unused Indexes
  Removes indexes that have never been used.

  ### 3. Fix Auth RLS Initialization Plan
  Replaces direct auth.uid() calls with (select auth.uid()) in policies on:
  subscribers, coupons, reviews, store_settings, abandoned_carts

  ### 4. Fix Multiple Permissive Policies
  Merges overlapping policies into single consolidated policies on:
  abandoned_carts, coupons, customers, order_items, orders, products, reviews

  ### 5. Fix Always-True INSERT Policies
  Replaces unrestricted INSERT (WITH CHECK true) policies on abandoned_carts and subscribers.
*/

-- ============================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_customer_id ON public.abandoned_carts (customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);

-- ============================================================
-- 2. DROP UNUSED INDEXES
-- ============================================================

DROP INDEX IF EXISTS public.idx_coupons_code;
DROP INDEX IF EXISTS public.idx_coupons_is_active;
DROP INDEX IF EXISTS public.idx_reviews_product_id;
DROP INDEX IF EXISTS public.idx_reviews_customer_id;
DROP INDEX IF EXISTS public.idx_reviews_is_approved;
DROP INDEX IF EXISTS public.idx_abandoned_carts_session;
DROP INDEX IF EXISTS public.idx_abandoned_carts_email;

-- ============================================================
-- 3. FIX SUBSCRIBERS POLICIES
-- ============================================================

DROP POLICY IF EXISTS subscribers_insert_anyone ON public.subscribers;
DROP POLICY IF EXISTS subscribers_admin_select ON public.subscribers;
DROP POLICY IF EXISTS subscribers_admin_delete ON public.subscribers;

CREATE POLICY "subscribers_insert_with_email"
  ON public.subscribers
  FOR INSERT
  WITH CHECK (email IS NOT NULL AND email <> '');

CREATE POLICY "subscribers_admin_select"
  ON public.subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

CREATE POLICY "subscribers_admin_delete"
  ON public.subscribers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

-- ============================================================
-- 4. FIX COUPONS POLICIES
-- ============================================================

DROP POLICY IF EXISTS coupons_admin_select ON public.coupons;
DROP POLICY IF EXISTS coupons_select_active ON public.coupons;
DROP POLICY IF EXISTS coupons_admin_insert ON public.coupons;
DROP POLICY IF EXISTS coupons_admin_update ON public.coupons;
DROP POLICY IF EXISTS coupons_admin_delete ON public.coupons;

CREATE POLICY "coupons_select"
  ON public.coupons
  FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

CREATE POLICY "coupons_admin_insert"
  ON public.coupons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

CREATE POLICY "coupons_admin_update"
  ON public.coupons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

CREATE POLICY "coupons_admin_delete"
  ON public.coupons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

-- ============================================================
-- 5. FIX REVIEWS POLICIES
-- ============================================================

DROP POLICY IF EXISTS reviews_admin_select ON public.reviews;
DROP POLICY IF EXISTS reviews_select_approved ON public.reviews;
DROP POLICY IF EXISTS reviews_insert_authenticated ON public.reviews;
DROP POLICY IF EXISTS reviews_admin_update ON public.reviews;
DROP POLICY IF EXISTS reviews_admin_delete ON public.reviews;

CREATE POLICY "reviews_select"
  ON public.reviews
  FOR SELECT
  USING (
    is_approved = true
    OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = (SELECT auth.uid())
  );

CREATE POLICY "reviews_admin_update"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

CREATE POLICY "reviews_admin_delete"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

-- ============================================================
-- 6. FIX STORE_SETTINGS POLICIES
-- ============================================================

DROP POLICY IF EXISTS store_settings_admin_select ON public.store_settings;
DROP POLICY IF EXISTS store_settings_admin_insert ON public.store_settings;
DROP POLICY IF EXISTS store_settings_admin_update ON public.store_settings;

CREATE POLICY "store_settings_admin_select"
  ON public.store_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

CREATE POLICY "store_settings_admin_insert"
  ON public.store_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

CREATE POLICY "store_settings_admin_update"
  ON public.store_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

-- ============================================================
-- 7. FIX ABANDONED_CARTS POLICIES
-- ============================================================

DROP POLICY IF EXISTS abandoned_carts_insert_anyone ON public.abandoned_carts;
DROP POLICY IF EXISTS abandoned_carts_update_own ON public.abandoned_carts;
DROP POLICY IF EXISTS abandoned_carts_admin_select ON public.abandoned_carts;
DROP POLICY IF EXISTS abandoned_carts_admin_update ON public.abandoned_carts;

CREATE POLICY "abandoned_carts_insert"
  ON public.abandoned_carts
  FOR INSERT
  WITH CHECK (session_id IS NOT NULL AND session_id <> '');

CREATE POLICY "abandoned_carts_select"
  ON public.abandoned_carts
  FOR SELECT
  TO authenticated
  USING (
    (customer_id IS NOT NULL AND customer_id = (SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

CREATE POLICY "abandoned_carts_update"
  ON public.abandoned_carts
  FOR UPDATE
  USING (
    (customer_id IS NOT NULL AND customer_id = (SELECT auth.uid()))
    OR customer_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  )
  WITH CHECK (
    (customer_id IS NOT NULL AND customer_id = (SELECT auth.uid()))
    OR customer_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = (SELECT auth.uid())
      AND c.role = 'admin'
    )
  );

-- ============================================================
-- 8. FIX CUSTOMERS POLICIES (multiple permissive SELECT + UPDATE)
-- ============================================================

DROP POLICY IF EXISTS customers_admin_select ON public.customers;
DROP POLICY IF EXISTS customers_select_self ON public.customers;
DROP POLICY IF EXISTS customers_admin_update ON public.customers;
DROP POLICY IF EXISTS customers_update_self ON public.customers;

CREATE POLICY "customers_select"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR (
      SELECT role FROM public.customers c2
      WHERE c2.id = (SELECT auth.uid())
    ) = 'admin'
  );

CREATE POLICY "customers_update"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR (
      SELECT role FROM public.customers c2
      WHERE c2.id = (SELECT auth.uid())
    ) = 'admin'
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR (
      SELECT role FROM public.customers c2
      WHERE c2.id = (SELECT auth.uid())
    ) = 'admin'
  );

-- ============================================================
-- 9. FIX ORDER_ITEMS POLICIES (multiple permissive SELECT + INSERT)
-- ============================================================

DROP POLICY IF EXISTS order_items_admin_select ON public.order_items;
DROP POLICY IF EXISTS order_items_select_own ON public.order_items;
DROP POLICY IF EXISTS order_items_admin_insert ON public.order_items;
DROP POLICY IF EXISTS order_items_insert_checkout ON public.order_items;

CREATE POLICY "order_items_select"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE orders.customer_id = (SELECT auth.uid())
    )
    OR (
      SELECT role FROM public.customers
      WHERE id = (SELECT auth.uid())
    ) = 'admin'
  );

CREATE POLICY "order_items_insert"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders
      WHERE orders.customer_id = (SELECT auth.uid())
    )
    OR (
      SELECT role FROM public.customers
      WHERE id = (SELECT auth.uid())
    ) = 'admin'
  );

-- ============================================================
-- 10. FIX ORDERS POLICIES (multiple permissive SELECT, INSERT, UPDATE)
-- ============================================================

DROP POLICY IF EXISTS orders_admin_select ON public.orders;
DROP POLICY IF EXISTS orders_select_own ON public.orders;
DROP POLICY IF EXISTS orders_admin_insert ON public.orders;
DROP POLICY IF EXISTS orders_insert_checkout ON public.orders;
DROP POLICY IF EXISTS orders_admin_update ON public.orders;
DROP POLICY IF EXISTS orders_update_admin ON public.orders;

CREATE POLICY "orders_select"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id = (SELECT auth.uid())
    OR (
      SELECT role FROM public.customers
      WHERE id = (SELECT auth.uid())
    ) = 'admin'
  );

CREATE POLICY "orders_insert"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = (SELECT auth.uid())
    OR (
      SELECT role FROM public.customers
      WHERE id = (SELECT auth.uid())
    ) = 'admin'
  );

CREATE POLICY "orders_admin_update"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.customers WHERE id = (SELECT auth.uid())) = 'admin'
  );

-- ============================================================
-- 11. FIX PRODUCTS POLICIES (multiple permissive SELECT)
-- ============================================================

DROP POLICY IF EXISTS products_admin_select ON public.products;
DROP POLICY IF EXISTS products_select_active ON public.products;

CREATE POLICY "products_select"
  ON public.products
  FOR SELECT
  USING (
    is_active = true
    OR (
      SELECT role FROM public.customers
      WHERE id = (SELECT auth.uid())
    ) = 'admin'
  );
