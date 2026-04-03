-- =============================================================================
-- CoreForge / protein — run in Supabase → SQL → New query
-- Paste ONE section at a time (or all). Use results to see gaps + follow-up fixes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A) Connection sanity (should return 1 row, server version)
-- -----------------------------------------------------------------------------
SELECT current_database() AS db, current_user AS role, version() AS postgres_version;

-- -----------------------------------------------------------------------------
-- B) Core tables exist (expect 8 rows, all present = t)
-- -----------------------------------------------------------------------------
SELECT c.relname AS table_name, (c.relkind = 'r') AS is_table
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'products', 'orders', 'order_items', 'customers', 'coupons',
    'store_settings', 'reviews', 'subscribers'
  )
  AND c.relkind = 'r'
ORDER BY c.relname;

-- Missing any? → apply migrations (supabase db push) or run migration SQL in order.

-- -----------------------------------------------------------------------------
-- C) Row counts (products should be >0 after seed; orders can be 0)
-- -----------------------------------------------------------------------------
SELECT 'products' AS entity, COUNT(*)::bigint AS n FROM public.products
UNION ALL SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL SELECT 'order_items', COUNT(*) FROM public.order_items
UNION ALL SELECT 'customers', COUNT(*) FROM public.customers
UNION ALL SELECT 'coupons', COUNT(*) FROM public.coupons
UNION ALL SELECT 'store_settings', COUNT(*) FROM public.store_settings
UNION ALL SELECT 'reviews', COUNT(*) FROM public.reviews
UNION ALL SELECT 'subscribers', COUNT(*) FROM public.subscribers;

-- products = 0 → seed migration missing or failed (re-run 20260330135805 body / db push).
-- store_settings = 0 → run INSERT from 20260330140003 store_settings block.

-- -----------------------------------------------------------------------------
-- D) Key functions (each should return 1 row with exists = true)
-- -----------------------------------------------------------------------------
SELECT x.name AS function_name,
       EXISTS (
         SELECT 1 FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public' AND p.proname = x.name::name
       ) AS exists
FROM (VALUES
  ('is_admin'),
  ('lookup_guest_order'),
  ('handle_new_user')
) AS x(name);

-- false on is_admin → recursion risk on customers RLS; apply 20260401060000 migration.
-- false on lookup_guest_order → guest order track broken; apply 20260331180000 migration.

-- -----------------------------------------------------------------------------
-- E) Admin rows in public.customers (should include every staff login)
-- -----------------------------------------------------------------------------
SELECT id, email, role, created_at
FROM public.customers
WHERE role = 'admin'
ORDER BY email;

-- Empty → no admin in DB; INSERT your Auth user id + email with role admin (see ADMIN_SETUP.sql).
-- Your app also accepts JWT app_metadata.role = admin or VITE_ADMIN_EMAILS.

-- -----------------------------------------------------------------------------
-- F) Auth users without a customers row (optional cleanup — these users exist in Auth only)
-- -----------------------------------------------------------------------------
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.customers c ON c.id = u.id
WHERE c.id IS NULL
ORDER BY u.created_at DESC
LIMIT 50;

-- Rows here: normal for brand-new signups until trigger runs; if trigger broken, fix handle_new_user.

-- -----------------------------------------------------------------------------
-- G) Products: active vs inactive, low stock snapshot
-- -----------------------------------------------------------------------------
SELECT
  COUNT(*) FILTER (WHERE is_active) AS active_products,
  COUNT(*) FILTER (WHERE NOT is_active) AS inactive_products,
  COUNT(*) FILTER (WHERE stock_quantity < 10) AS under_10_stock
FROM public.products;

-- -----------------------------------------------------------------------------
-- H) Orders: status mix (guest checkout uses customer_id NULL)
-- -----------------------------------------------------------------------------
SELECT
  COUNT(*) FILTER (WHERE customer_id IS NULL) AS guest_orders,
  COUNT(*) FILTER (WHERE customer_id IS NOT NULL) AS logged_in_orders,
  COUNT(*) AS total
FROM public.orders;

-- -----------------------------------------------------------------------------
-- I) RLS enabled on critical tables (expect all true)
-- -----------------------------------------------------------------------------
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('products', 'orders', 'order_items', 'customers', 'store_settings', 'coupons', 'reviews', 'subscribers')
  AND c.relkind = 'r'
ORDER BY c.relname;

-- -----------------------------------------------------------------------------
-- J) Policies on public.customers (admin paths should use is_admin(), not raw EXISTS on customers)
-- -----------------------------------------------------------------------------
SELECT pol.polname AS policy_name,
       pg_get_expr(pol.polqual, pol.polrelid) AS using_expr
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'customers'
ORDER BY pol.polname;

-- If USING contains "EXISTS" and subquery on customers (not is_admin), you may hit infinite recursion;
-- ensure migration 20260401060000_fix_customers_rls_recursion_is_admin.sql is applied.

-- -----------------------------------------------------------------------------
-- K) store_settings keys (expect these keys present after migrations)
-- -----------------------------------------------------------------------------
SELECT key, value
FROM public.store_settings
ORDER BY key;

-- Missing keys → insert defaults (see 20260330140003 INSERT ... store_settings ON CONFLICT DO NOTHING).

-- -----------------------------------------------------------------------------
-- L) Sample coupon codes (public can validate active coupons)
-- -----------------------------------------------------------------------------
SELECT code, type, value, is_active, used_count
FROM public.coupons
ORDER BY code
LIMIT 20;

-- -----------------------------------------------------------------------------
-- M) Test lookup_guest_order as service role is NOT possible here; test from app or use:
--     Dashboard → Database → Functions → lookup_guest_order
-- Instead: list recent guest orders for manual check
-- -----------------------------------------------------------------------------
SELECT id, order_number, customer_email, payment_status, created_at
FROM public.orders
WHERE customer_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- -----------------------------------------------------------------------------
-- N) Foreign key health: order_items pointing at missing products (should be 0 rows)
-- -----------------------------------------------------------------------------
SELECT oi.id, oi.order_id, oi.product_id, oi.product_name
FROM public.order_items oi
LEFT JOIN public.products p ON p.id = oi.product_id
WHERE oi.product_id IS NOT NULL AND p.id IS NULL
LIMIT 50;

-- Any rows → bad product_id on line items; fix or delete orphan items.

-- =============================================================================
-- QUICK FIX SNIPPETS (run only if diagnostics show a gap)
-- =============================================================================

-- N1) Ensure store_settings defaults exist (idempotent)
/*
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
*/

-- N2) Promote one Auth user to admin (replace UUID + email)
/*
INSERT INTO public.customers (id, email, role, first_name, last_name)
VALUES (
  'YOUR-AUTH-USER-UUID'::uuid,
  'you@example.com',
  'admin',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', email = EXCLUDED.email;
*/

-- N3) Optional demo order — see file: supabase/optional_demo_order.sql
