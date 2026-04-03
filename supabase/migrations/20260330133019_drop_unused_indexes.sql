/*
  # Drop Unused Indexes

  ## Summary
  Remove indexes that have never been used and are only adding write overhead.
  These were flagged by Supabase's index advisor as having zero usage.

  ## Dropped Indexes
  ### public.products
  - idx_products_category
  - idx_products_slug
  - idx_products_is_featured

  ### public.customers
  - idx_customers_email
  - idx_customers_role

  ### public.orders
  - idx_orders_customer_id
  - idx_orders_status
  - idx_orders_created_at
  - idx_orders_payment_reference_id

  ### public.order_items
  - idx_order_items_order_id
  - idx_order_items_product_id

  ## Notes
  These can be recreated once query patterns are established in production.
  The primary key indexes remain untouched.
*/

DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_slug;
DROP INDEX IF EXISTS public.idx_products_is_featured;
DROP INDEX IF EXISTS public.idx_customers_email;
DROP INDEX IF EXISTS public.idx_customers_role;
DROP INDEX IF EXISTS public.idx_orders_customer_id;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_created_at;
DROP INDEX IF EXISTS public.idx_orders_payment_reference_id;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_order_items_product_id;
