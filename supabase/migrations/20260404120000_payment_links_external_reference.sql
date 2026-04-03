-- Optional stable reference from your other system (invoice id, CRM id, etc.)
ALTER TABLE public.payment_links
  ADD COLUMN IF NOT EXISTS external_reference TEXT;

CREATE INDEX IF NOT EXISTS idx_payment_links_external_reference
  ON public.payment_links (external_reference)
  WHERE external_reference IS NOT NULL;

COMMENT ON COLUMN public.payment_links.external_reference IS
  'Caller-supplied reference (e.g. order/invoice id); not secret.';

-- Include reference on the public pay-page payload
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
    'status', r.status,
    'reference', r.external_reference
  );
END;
$$;
