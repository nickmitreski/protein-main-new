/*
  # Drop Remaining Unused Indexes

  ## Summary
  Removes two unused indexes on the reviews table that were flagged by the
  Supabase security advisor. These indexes add write overhead without being
  used by any queries.

  ## Changes
  - Drop `idx_reviews_customer_id`
  - Drop `idx_reviews_product_id`

  Note: These columns are foreign keys and their FK indexes were already
  created by the earlier migration (idx_order_items_product_id covers
  products; reviews.customer_id and reviews.product_id are covered by
  the FK constraints themselves via the pk indexes on the referenced tables).
*/

DROP INDEX IF EXISTS public.idx_reviews_customer_id;
DROP INDEX IF EXISTS public.idx_reviews_product_id;
