/*
  # Add Square payment fields to orders

  1. Changes to `orders` table
    - Add `payment_reference_id` (text, nullable) — stores Square's payment ID returned by CreatePayment
    - Rename existing `stripe_payment_intent_id` is kept for historical rows; new Square payments use `payment_reference_id`

  2. Notes
    - No data loss — both columns are nullable
    - `payment_reference_id` is indexed for webhook lookups
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_reference_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN payment_reference_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_payment_reference_id ON public.orders (payment_reference_id);
