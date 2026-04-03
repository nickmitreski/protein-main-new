/*
  # New Feature Tables: subscribers, coupons, reviews, store_settings, abandoned_carts, orders fulfillment

  1. subscribers - email marketing list
  2. coupons - discount codes
  3. reviews - product reviews
  4. store_settings - key/value admin config
  5. abandoned_carts - cart recovery
  6. Orders: adds tracking_number, shipped_at, carrier, coupon_code, payment_reference_id columns
*/

CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'website',
  discount_code TEXT,
  accepts_marketing BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscribers_insert_anyone"
  ON public.subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "subscribers_admin_select"
  ON public.subscribers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

CREATE POLICY "subscribers_admin_delete"
  ON public.subscribers FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin')
  );

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10, 2) NOT NULL,
  min_order_value NUMERIC(10, 2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons (is_active);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_select_active"
  ON public.coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "coupons_admin_select"
  ON public.coupons FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

CREATE POLICY "coupons_admin_insert"
  ON public.coupons FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

CREATE POLICY "coupons_admin_update"
  ON public.coupons FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

CREATE POLICY "coupons_admin_delete"
  ON public.coupons FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

DROP TRIGGER IF EXISTS tr_coupons_updated_at ON public.coupons;
CREATE TRIGGER tr_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.coupons (code, type, value, min_order_value, description, is_active)
VALUES ('WELCOME10', 'percentage', 10, 0, '10% off your first order', true)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers (id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT 'Anonymous',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews (customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews (is_approved);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_approved"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "reviews_admin_select"
  ON public.reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "reviews_admin_update"
  ON public.reviews FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

CREATE POLICY "reviews_admin_delete"
  ON public.reviews FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'null'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_settings_admin_select"
  ON public.store_settings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

CREATE POLICY "store_settings_admin_insert"
  ON public.store_settings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

CREATE POLICY "store_settings_admin_update"
  ON public.store_settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

DROP TRIGGER IF EXISTS tr_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER tr_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.store_settings (key, value) VALUES
  ('store_name', '"CoreForge Nutrition"'),
  ('contact_email', '"hello@coreforge.com.au"'),
  ('currency', '"AUD"'),
  ('tax_rate', '0.1'),
  ('free_shipping_threshold', '100'),
  ('standard_shipping_cost', '9.99'),
  ('express_shipping_cost', '19.99'),
  ('low_stock_threshold', '10'),
  ('fulfillment_address', '{"line1":"","city":"","state":"","postcode":"","country":"Australia"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
    ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipped_at') THEN
    ALTER TABLE public.orders ADD COLUMN shipped_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'carrier') THEN
    ALTER TABLE public.orders ADD COLUMN carrier TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'coupon_code') THEN
    ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_reference_id') THEN
    ALTER TABLE public.orders ADD COLUMN payment_reference_id TEXT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers (id) ON DELETE SET NULL,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  recovered BOOLEAN NOT NULL DEFAULT false,
  recovery_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session ON public.abandoned_carts (session_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON public.abandoned_carts (customer_email);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "abandoned_carts_insert_anyone"
  ON public.abandoned_carts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "abandoned_carts_update_own"
  ON public.abandoned_carts FOR UPDATE
  USING (customer_id = auth.uid() OR customer_id IS NULL)
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

CREATE POLICY "abandoned_carts_admin_select"
  ON public.abandoned_carts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

CREATE POLICY "abandoned_carts_admin_update"
  ON public.abandoned_carts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = auth.uid() AND c.role = 'admin'));

DROP TRIGGER IF EXISTS tr_abandoned_carts_updated_at ON public.abandoned_carts;
CREATE TRIGGER tr_abandoned_carts_updated_at
  BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
