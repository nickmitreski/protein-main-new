# CoreForge — Supabase setup for Bolt.new (production e-commerce)

This guide is the **canonical backend setup** for the CoreForge storefront. The database schema matches the React app (`src/types`, `useProducts`, `useOrders`, `useCreateOrder`, checkout flow, and admin).

---

## Table of contents

1. [What you run first](#1-what-you-run-first)
2. [Environment variables](#2-environment-variables)
3. [Schema file (copy into SQL Editor)](#3-schema-file-copy-into-sql-editor)
4. [After the migration](#4-after-the-migration)
5. [Storage (product images)](#5-storage-product-images)
6. [Authentication](#6-authentication)
7. [Admin user](#7-admin-user)
8. [Seed products](#8-seed-products)
9. [Stripe (payments)](#9-stripe-payments)
10. [Bolt.new checklist](#10-boltnew-checklist)
11. [How the app uses the database](#11-how-the-app-uses-the-database)
12. [Testing & troubleshooting](#12-testing--troubleshooting)
13. [Further reading](#13-further-reading)

---

## 1. What you run first

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → **New query**.
3. Paste the full contents of:

   **`supabase/COREFORGE_BOLT_SCHEMA.sql`**

4. Click **Run** once.

That script creates:

- **`products`** — catalog (aligned with `Product` in `src/types/index.ts`)
- **`customers`** — one row per `auth.users` row (`id` = user id, `role` = `customer` | `admin`)
- **`orders`** — checkout orders (`subtotal`, `tax`, `shipping`, `discount`, `total`, JSON addresses, etc.)
- **`order_items`** — line items (`product_name`, `product_image`, quantities, prices)
- **Triggers**: `order_number` generation, **stock decrement** on line insert, **customer stats** (`orders_count`, `total_spent`) on order insert, `updated_at` maintenance
- **RLS**: public read active products; guest + user **checkout** inserts; customers read/update self; admins full access where noted
- **Auth trigger**: `handle_new_user` — inserts into `customers` on signup (the app **does not** insert customers client-side)

---

## 2. Environment variables

**Local:** `.env.local`

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Bolt.new:** same keys in project environment settings.

Optional (homepage category photos — see `BOLT_BACKEND_IMPLEMENTATION.md`):

```bash
# VITE_PEXELS_API_KEY=
```

Do **not** put Stripe secrets or service-role keys in `VITE_*` variables.

---

## 3. Schema file (copy into SQL Editor)

The runnable script lives at:

**`supabase/COREFORGE_BOLT_SCHEMA.sql`**

Do not mix it with older snippets from previous versions of this repo; this file is the single source of truth.

If you need to **reset** a dev project, drop dependent objects in reverse order (`order_items`, `orders`, `products`, `customers`, triggers on `auth.users`) or create a fresh Supabase project.

---

## 4. After the migration

1. **Authentication → Providers:** ensure **Email** is enabled.
2. Confirm **Trigger** on `auth.users`: `on_auth_user_created` → `handle_new_user` (created by the schema file).
3. Promote your user to **admin** (see [Admin user](#7-admin-user)).
4. **Seed products** (see [Seed products](#8-seed-products)) or import from the admin UI once CRUD is wired.

---

## 5. Storage (product images)

1. **Storage → New bucket:** `product-images`, **public**.
2. Policies (SQL Editor):

```sql
CREATE POLICY "Product images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );

CREATE POLICY "Admins delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );
```

Store **public URLs** in `products.image` (and optionally `products.images` jsonb).

---

## 6. Authentication

- Sign-up creates **`auth.users`**; **`handle_new_user`** creates **`customers`** with `role = 'customer'`.
- The app resolves **admin** by `customers.role = 'admin'` (see `src/store/authStore.ts`).
- Email confirmation: enable in Supabase if you want verified emails before checkout.

---

## 7. Admin user

After you sign up once:

```sql
UPDATE public.customers
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Then sign out and sign in again so the app picks up the role.

---

## 8. Seed products

Columns must match **`products`** in `COREFORGE_BOLT_SCHEMA.sql`. Minimal example (adjust `image` URLs to your CDN or Storage):

```sql
INSERT INTO public.products (
  id, name, slug, description, price, category, sku,
  stock_quantity, image, is_active, is_featured, rating, review_count, badge
) VALUES
(
  'CFG-001',
  'CoreForge Whey Protein 2kg (Chocolate)',
  'whey-protein-2kg-chocolate',
  'Premium whey protein concentrate for muscle growth and recovery.',
  119.00,
  'Protein Powders',
  'CFG-001',
  150,
  '/other/supp-images/CFG-001_119 — CoreForge Whey Protein 2kg (Chocolate).png',
  true,
  true,
  4.8,
  342,
  'Best Seller'
),
(
  'CFG-002',
  'CoreForge Creatine Monohydrate 500g',
  'creatine-monohydrate-500g',
  'Pure creatine monohydrate for strength and power.',
  69.00,
  'Creatine',
  'CFG-002',
  200,
  '/other/supp-images/CFG-002_69 — CoreForge Creatine Monohydrate 500g.png',
  true,
  false,
  4.9,
  120,
  NULL
)
ON CONFLICT (id) DO NOTHING;
```

**Full catalog:** replicate rows from `src/data/products.ts` (IDs, categories, prices, images) or export CSV and use Supabase import.

**Category strings** must match the app exactly, e.g. `Protein Powders`, `Pre-Workout`, `Creatine`, `Recovery & Performance`, `Stacks & Bundles`, `Samples`.

---

## 9. Stripe (payments)

The app currently creates orders with **`payment_status = 'pending'`** and does not capture card data in the SPA. For production:

1. **Bolt / Edge Function:** create Stripe Checkout Session or PaymentIntent with the **order id** in metadata.
2. **Webhook:** on `payment_intent.succeeded` / `checkout.session.completed`, update `orders.payment_status` to `paid` and optionally `stripe_payment_intent_id`.
3. Keep **Stripe secret key** and **webhook secret** only on the server.

Starter webhook pattern (Deno Edge Function) is still valid conceptually; pin current Stripe API versions in your template.

---

## 10. Bolt.new checklist

- [ ] Run `supabase/COREFORGE_BOLT_SCHEMA.sql` in SQL Editor  
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Bolt  
- [ ] Create bucket `product-images` + storage policies  
- [ ] Promote admin with `UPDATE customers SET role = 'admin' …`  
- [ ] Seed `products` (or sync from `src/data/products.ts`)  
- [ ] Test: browse shop → add to cart → checkout → confirm row in `orders` / `order_items` and stock reduced  
- [ ] Test: admin login → `/admin` → orders list  
- [ ] Add Stripe + webhook (production)  
- [ ] Tighten RLS if you replace guest checkout with Edge Functions only  

Also read **`BOLT_BACKEND_IMPLEMENTATION.md`** for the full frontend ↔ backend contract.

---

## 11. How the app uses the database

| Feature | Tables / behavior |
|--------|-------------------|
| Shop & PDP | `products` — `useProducts`, `useProduct` |
| Checkout | `orders` + `order_items` — `useCreateOrder`; stock ↓ via trigger |
| Order confirmation | Guest: no `SELECT` on `order` by id without auth; UI uses navigation state + `sessionStorage` |
| Logged-in orders | `orders.customer_id = auth.uid()` — RLS allows `SELECT` own rows |
| Admin | `customers.role = 'admin'` — policies on `products`, `orders`, `order_items`, `customers` |
| Sign up | Auth trigger inserts `customers`; app does not insert duplicate |

---

## 12. Testing & troubleshooting

**Connection**

```ts
const { data, error } = await supabase.from('products').select('id, name').limit(5);
```

**Guest checkout**

- Inserts are allowed for `orders` (`customer_id` null) and matching `order_items` (see policies in schema file).
- You will **not** be able to `select` those orders anonymously; the confirmation page uses the object returned from `insert` + `sessionStorage`.

**RLS**

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('products', 'orders', 'order_items', 'customers');
```

**Trigger errors**

If your Postgres build rejects `EXECUTE PROCEDURE`, replace with `EXECUTE FUNCTION` on trigger definitions (Postgres 14+ style).

**Images**

- Verify `products.image` is a full URL or a path your Vite app serves.
- For Storage URLs, ensure the bucket is public or use signed URLs.

---

## 13. Further reading

- [Supabase docs](https://supabase.com/docs)  
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)  
- **`BOLT_BACKEND_IMPLEMENTATION.md`** — architecture, env vars, Stripe, category images, file map  
- **`IMPLEMENTATION_PLAN.md`** — product roadmap (if present)  

Support: Supabase Discord, Bolt.new support, and this repo’s README.
