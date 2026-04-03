-- Allow admins to read (and delete) payment links in the dashboard.
-- Inserts remain via Edge Function + service role only.

CREATE POLICY "payment_links_admin_select"
  ON public.payment_links
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "payment_links_admin_delete"
  ON public.payment_links
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
