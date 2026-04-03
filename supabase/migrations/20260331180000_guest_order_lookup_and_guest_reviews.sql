/*
  Guest order lookup (no auth): match order_number + customer_email.
  Guest reviews: optional reviewer_email column + anon INSERT when customer_id IS NULL.
*/

-- ---------------------------------------------------------------------------
-- 1) Secure lookup — SECURITY DEFINER, no broad SELECT on orders for anon
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lookup_guest_order(p_order_number text, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_result jsonb;
BEGIN
  IF p_order_number IS NULL OR trim(p_order_number) = '' OR p_email IS NULL OR trim(p_email) = '' THEN
    RETURN NULL;
  END IF;

  SELECT o.id
  INTO v_order_id
  FROM public.orders o
  WHERE lower(trim(o.order_number)) = lower(trim(p_order_number))
    AND lower(trim(o.customer_email)) = lower(trim(p_email))
  LIMIT 1;

  IF v_order_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'order', (SELECT to_jsonb(t) FROM public.orders t WHERE t.id = v_order_id),
    'items', COALESCE(
      (SELECT jsonb_agg(to_jsonb(i)) FROM public.order_items i WHERE i.order_id = v_order_id),
      '[]'::jsonb
    )
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_guest_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_guest_order(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.lookup_guest_order(text, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2) Reviews: optional email for moderation / contact (guest submissions)
-- ---------------------------------------------------------------------------
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reviewer_email text;

COMMENT ON COLUMN public.reviews.reviewer_email IS 'Optional email for guest reviews; not shown publicly until approved.';

DROP POLICY IF EXISTS "reviews_insert_guest" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;

-- Guest: customer_id NULL + reviewer_email. Registered (row in customers): customer_id = auth.uid().
CREATE POLICY "reviews_insert_registered_or_guest"
  ON public.reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (
      customer_id IS NULL
      AND reviewer_email IS NOT NULL
      AND char_length(trim(reviewer_email)) <= 320
      AND position('@' IN trim(reviewer_email)) > 1
      AND char_length(trim(customer_name)) >= 2
      AND char_length(trim(customer_name)) <= 120
    )
    OR (
      customer_id IS NOT NULL
      AND customer_id = (SELECT auth.uid())
    )
  );
