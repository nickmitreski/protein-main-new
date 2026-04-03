/*
  # Add Missing Foreign Key Indexes

  ## Summary
  Adds covering indexes for foreign key columns that were flagged as unindexed,
  which can lead to slow JOIN and cascade operations.

  ## Changes
  - `abandoned_carts.customer_id` — new index
  - `order_items.order_id` — new index
  - `order_items.product_id` — new index
  - `orders.customer_id` — new index
*/

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_customer_id ON public.abandoned_carts (customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
