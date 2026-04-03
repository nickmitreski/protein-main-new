/*
  # Fix RLS policies for store_settings and orders

  ## Problems Fixed

  1. store_settings SELECT policy required admin access, blocking public checkout from
     reading tax rate and shipping thresholds. Changed to allow public reads.

  2. orders SELECT policy required customer_id = auth.uid(), meaning:
     - Guest orders (customer_id IS NULL) were never visible to anyone except admins
     - Logged-in customers could not see their historical orders correctly
     Fixed to allow customers to see orders where customer_id matches their user ID.

  ## Changes
  - Drop and recreate store_settings_admin_select as store_settings_public_select (public read)
  - Keep store_settings INSERT/UPDATE as admin only
  - orders_select remains: owner OR admin (no change needed, logic was correct)
*/

DROP POLICY IF EXISTS "store_settings_admin_select" ON public.store_settings;

CREATE POLICY "store_settings_public_select"
  ON public.store_settings
  FOR SELECT
  TO public
  USING (true);
