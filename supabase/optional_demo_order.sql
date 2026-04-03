-- Optional: insert one guest order + line item so admin dashboard/analytics have sample data.
-- Run in Supabase → SQL after migrations (products seed must exist; uses CFG-001).
-- Safe to run once; skips if the demo order id already exists.

INSERT INTO public.orders (
  id,
  customer_id,
  customer_email,
  customer_name,
  order_number,
  status,
  payment_status,
  fulfillment_status,
  subtotal,
  tax,
  shipping,
  discount,
  total,
  currency,
  shipping_address,
  billing_address
)
VALUES (
  'b1111111-1111-4111-8111-111111111111'::uuid,
  NULL,
  'demo@coreforge.test',
  'Demo Customer',
  'CFG-DEMO-SEED',
  'confirmed',
  'paid',
  'unfulfilled',
  119.00,
  11.90,
  9.99,
  0,
  140.89,
  'AUD',
  '{"first_name":"Demo","last_name":"Customer","address1":"1 Demo St","city":"Sydney","province":"NSW","postal_code":"2000","country":"Australia"}'::jsonb,
  '{"first_name":"Demo","last_name":"Customer","address1":"1 Demo St","city":"Sydney","province":"NSW","postal_code":"2000","country":"Australia"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (
  order_id,
  product_id,
  product_name,
  product_image,
  sku,
  quantity,
  price,
  total
)
SELECT
  'b1111111-1111-4111-8111-111111111111'::uuid,
  p.id,
  p.name,
  COALESCE(p.image, ''),
  p.sku,
  1,
  p.price,
  p.price
FROM public.products p
WHERE p.id = 'CFG-001'
  AND EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = 'b1111111-1111-4111-8111-111111111111'::uuid
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.order_items oi
    WHERE oi.order_id = 'b1111111-1111-4111-8111-111111111111'::uuid
  );
