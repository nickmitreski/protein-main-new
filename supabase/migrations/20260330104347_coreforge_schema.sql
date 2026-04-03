/*
  # CoreForge e-commerce schema

  Creates the full CoreForge database schema including:

  1. New Tables
    - `products` - full catalog with pricing, inventory, SEO, nutrition
    - `customers` - linked to auth.users, role-based access
    - `orders` - checkout orders with JSON addresses
    - `order_items` - line items per order

  2. Sequences & Functions
    - `order_number_seq` - generates CFG-XXXXX order numbers
    - `set_order_number` trigger function
    - `decrement_product_stock` trigger function
    - `bump_customer_stats_from_order` trigger function
    - `update_updated_at_column` trigger function
    - `handle_new_user` auth trigger function

  3. Security
    - RLS enabled on all tables
    - Products: public read active, admins full access
    - Customers: users read/update self, admins full access
    - Orders: users see own, admins see all, guest insert allowed
    - Order items: same scoping as orders
*/

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  long_description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2),
  sku TEXT,
  barcode TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  image TEXT NOT NULL DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC(3, 2) DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  badge TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  track_inventory BOOLEAN NOT NULL DEFAULT true,
  continue_selling_when_out_of_stock BOOLEAN NOT NULL DEFAULT false,
  requires_shipping BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  vendor TEXT DEFAULT 'CoreForge',
  product_type TEXT DEFAULT 'Supplement',
  weight_g INTEGER,
  servings INTEGER,
  flavor TEXT,
  size TEXT,
  nutrition_facts JSONB,
  ingredients TEXT[],
  usage_instructions TEXT,
  warnings TEXT,
  allergens TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products (is_featured);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  orders_count INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'enabled' CHECK (state IN ('enabled', 'disabled')),
  accepts_marketing BOOLEAN NOT NULL DEFAULT false,
  default_address JSONB,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_role ON public.customers (role);

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1001;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR BTRIM(NEW.order_number) = '' THEN
    NEW.order_number := 'CFG-' || LPAD(NEXTVAL('public.order_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers (id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
  subtotal NUMERIC(10, 2) NOT NULL,
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AUD',
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  notes TEXT,
  tags TEXT[],
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT orders_order_number_unique UNIQUE (order_number)
);

DROP TRIGGER IF EXISTS tr_orders_set_number ON public.orders;
CREATE TRIGGER tr_orders_set_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

CREATE OR REPLACE FUNCTION public.bump_customer_stats_from_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers
    SET
      orders_count = orders_count + 1,
      total_spent = total_spent + NEW.total,
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_orders_bump_customer ON public.orders;
CREATE TRIGGER tr_orders_bump_customer
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_customer_stats_from_order();

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products (id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL DEFAULT '',
  sku TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  product_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

CREATE OR REPLACE FUNCTION public.decrement_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products
    SET
      stock_quantity = GREATEST(0, stock_quantity - NEW.quantity),
      updated_at = NOW()
    WHERE id = NEW.product_id AND COALESCE(track_inventory, true);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_order_items_decrement_stock ON public.order_items;
CREATE TRIGGER tr_order_items_decrement_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_product_stock();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_customers_updated_at ON public.customers;
CREATE TRIGGER tr_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (id, email, role, first_name, last_name)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 'customer', '', '')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_active" ON public.products;
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "customers_select_self" ON public.customers;
CREATE POLICY "customers_select_self"
  ON public.customers FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "customers_update_self" ON public.customers;
CREATE POLICY "customers_update_self"
  ON public.customers FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "customers_admin_all" ON public.customers;
CREATE POLICY "customers_admin_all"
  ON public.customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (
    customer_id IS NOT NULL AND customer_id = auth.uid()
  );

DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "orders_insert_checkout" ON public.orders;
CREATE POLICY "orders_insert_checkout"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    customer_id IS NULL
    OR customer_id = auth.uid()
  );

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.customer_id IS NOT NULL AND o.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items_select_admin" ON public.order_items;
CREATE POLICY "order_items_select_admin"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "order_items_insert_checkout" ON public.order_items;
CREATE POLICY "order_items_insert_checkout"
  ON public.order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.customer_id IS NULL OR o.customer_id = auth.uid())
    )
  );
