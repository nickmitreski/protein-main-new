/*
  # Add Missing Foreign Key Indexes on reviews Table

  ## Summary
  Adds covering indexes for the two foreign keys on the reviews table
  that were flagged as unindexed.

  ### New Indexes
  - `idx_reviews_customer_id` on `reviews.customer_id` (FK to customers)
  - `idx_reviews_product_id` on `reviews.product_id` (FK to products)
*/

CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews (customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
