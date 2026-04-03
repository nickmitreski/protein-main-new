/*
  # Fix Mutable Search Path on All Functions

  ## Summary
  All 4 database functions have a mutable search_path, which is a security risk
  because a malicious user could potentially redirect function calls to their own
  schema objects. The fix is to set `search_path = ''` and use fully-qualified
  names (schema.table) inside each function body.

  ## Affected Functions
  1. public.update_updated_at_column
  2. public.set_order_number
  3. public.bump_customer_stats_from_order
  4. public.decrement_product_stock

  ## Fix
  Recreate each function with `SET search_path = ''` and use fully-qualified
  references (public.tablename) inside each body.
*/

-- ============================================================
-- 1. update_updated_at_column
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. set_order_number
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  next_seq bigint;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS bigint)), 1000) + 1
    INTO next_seq
    FROM public.orders;
  NEW.order_number := 'ORD-' || next_seq::text;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. bump_customer_stats_from_order
-- ============================================================
CREATE OR REPLACE FUNCTION public.bump_customer_stats_from_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD IS NULL OR OLD.payment_status <> 'paid') THEN
    UPDATE public.customers
    SET
      total_orders   = total_orders + 1,
      total_spent    = total_spent + NEW.total,
      last_order_at  = NEW.created_at,
      updated_at     = now()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 4. decrement_product_stock
-- ============================================================
CREATE OR REPLACE FUNCTION public.decrement_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.products
  SET
    stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
    updated_at     = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;
