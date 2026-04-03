/*
  Fix payment_links rollout issues:
  1. Trigger must use public.update_updated_at_column (not trigger_set_updated_at).
  2. Remove broad SELECT policy that exposed code_hash to anon clients.
  3. Add public RPC get_payment_link_public — returns safe fields only.
  4. Add unlock_token for post-verify payment (process-payment-link requires it).
*/

-- Fix trigger function name
DROP TRIGGER IF EXISTS set_payment_links_updated_at ON public.payment_links;
CREATE TRIGGER set_payment_links_updated_at
  BEFORE UPDATE ON public.payment_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.payment_links
  ADD COLUMN IF NOT EXISTS unlock_token TEXT;

CREATE INDEX IF NOT EXISTS idx_payment_links_unlock_token ON public.payment_links (unlock_token)
  WHERE unlock_token IS NOT NULL;

-- Stop exposing entire row (including code_hash) to PostgREST
DROP POLICY IF EXISTS "payment_links_public_read" ON public.payment_links;

-- No SELECT / INSERT / UPDATE for anon/authenticated on table; Edge Functions use service role.

CREATE OR REPLACE FUNCTION public.get_payment_link_public(p_payment_id text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.payment_links%ROWTYPE;
BEGIN
  IF p_payment_id IS NULL OR trim(p_payment_id) = '' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO r
  FROM public.payment_links
  WHERE payment_id = trim(p_payment_id)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'payment_id', r.payment_id,
    'amount', r.amount,
    'currency', r.currency,
    'expires_at', r.expires_at,
    'metadata', COALESCE(r.metadata, '{}'::jsonb),
    'status', r.status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_payment_link_public(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payment_link_public(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_payment_link_public(text) TO authenticated;

COMMENT ON FUNCTION public.get_payment_link_public(text) IS
  'Returns non-sensitive payment link fields for the pay page; never exposes code_hash.';
