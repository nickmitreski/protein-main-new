# CoreForge — Bolt.new backend & e-commerce implementation manual

Give this document to **Bolt.new** (upload or paste) together with **`SUPABASE_SETUP.md`** and the file **`supabase/COREFORGE_BOLT_SCHEMA.sql`**. It describes the **full stack contract** for a proper Supabase-backed e-commerce site: catalog, guest + logged-in checkout, inventory, admin, auth, Stripe, and optional imagery APIs.

---

## 1. Executive summary

| Layer | Responsibility |
|--------|----------------|
| **Vite + React app** | Storefront, cart (Zustand + `localStorage`), checkout UI, order confirmation, admin dashboard UI |
| **Supabase Postgres** | `products`, `customers`, `orders`, `order_items`; triggers for order numbers, stock, customer stats |
| **Supabase Auth** | Email/password; `customers` row created by DB trigger on signup |
| **Supabase Storage** | Public `product-images` bucket for catalog photos |
| **Stripe (production)** | Server-side payment + webhooks updating `orders.payment_status` |
| **Edge Functions (recommended)** | Stripe webhooks; optional Pexels/OpenAI proxies (never expose secrets in `VITE_*`) |

---

## 2. Environment variables

### Required (frontend)

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Configured in `src/lib/supabase.ts`. The app treats Supabase as “configured” when these are set and do not contain placeholder substrings (`your_supabase`).

### Optional (frontend)

```bash
# Pexels — dynamic homepage category tiles (see src/hooks/useCategoryStripImages.ts)
# VITE_PEXELS_API_KEY=
```

### Server-only (Bolt secrets / Edge Functions — NOT `VITE_*`)

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (only inside trusted server or Edge Function)
- OpenAI / Stability / etc. for **generated** category or marketing images

---

## 3. Database — single migration file

**Authoritative SQL:** `supabase/COREFORGE_BOLT_SCHEMA.sql`

Run it once in Supabase SQL Editor. It replaces older ad-hoc snippets that used different column names (`email` vs `customer_email`, `tax_amount` vs `tax`, missing `products.image`, etc.).

### 3.1 Tables (high level)

- **`products`** — Aligns with `Product` in `src/types/index.ts`: `id`, `name`, `description`, `price`, `category`, `image`, `stock_quantity`, `track_inventory`, `is_active`, `rating`, `review_count`, etc.
- **`customers`** — `id` = `auth.users.id`, `role` ∈ `{ customer, admin }`, `orders_count`, `total_spent`, profile fields.
- **`orders`** — Aligns with `Order`: `customer_id` (null for guests), `customer_email`, `customer_name`, `subtotal`, `tax`, `shipping`, `discount`, `total`, `currency`, `shipping_address` / `billing_address` JSONB, `payment_status`, `fulfillment_status`, `status`, `stripe_payment_intent_id`, timestamps.
- **`order_items`** — Aligns with `OrderItem`: `product_id`, `product_name`, `product_image`, `sku`, `quantity`, `price`, `total`.

### 3.2 Triggers (business logic in the database)

1. **`set_order_number`** — Before insert on `orders`, assigns `order_number` like `CFG-01001` if not provided.
2. **`decrement_product_stock`** — After insert on `order_items`, reduces `products.stock_quantity` when `track_inventory` is true (floors at 0).
3. **`bump_customer_stats_from_order`** — After insert on `orders`, increments `customers.orders_count` and `customers.total_spent` when `customer_id` is set.
4. **`update_updated_at_column`** — Maintains `updated_at` on `products`, `customers`, `orders`.
5. **`handle_new_user`** — After insert on `auth.users`, inserts `customers` with `role = 'customer'` (`ON CONFLICT DO NOTHING`).

### 3.3 Row Level Security (RLS)

- **Products:** anyone can `SELECT` rows with `is_active = true`; admins can do **all** operations (including inactive SKUs for the admin UI).
- **Customers:** users `SELECT`/`UPDATE` their own row (`id = auth.uid()`); admins have broader access via admin policy.
- **Orders:** users `SELECT` rows where `customer_id = auth.uid()`; admins `SELECT` all; **guest checkout** allows `INSERT` for `anon` and `authenticated` when `customer_id IS NULL OR customer_id = auth.uid()`.
- **Order items:** `INSERT` allowed when the parent order exists and is either guest (`customer_id` null) or owned by the current user; `SELECT` mirrors order access; admins see all.

**Guest order visibility:** RLS does **not** allow anonymous `SELECT` on arbitrary orders. The app shows confirmation from the **insert response** and **`sessionStorage`** (`OrderConfirmationPage`). Logged-in customers can later load their orders via the API if you add an “Order history” page using `useOrders` with the same RLS.

---

## 4. Frontend ↔ backend mapping

### 4.1 Catalog

- **Files:** `src/hooks/useProducts.ts`, `src/pages/customer/ShopPage.tsx`, `src/pages/customer/ProductDetailPage.tsx`
- **Table:** `products`
- **Filters:** `category` (exact string), `search` (`ilike` on `name`, `description`), `sortBy`, `is_active = true` for storefront.

### 4.2 Cart

- **Files:** `src/store/cartStore.ts`, `src/pages/customer/CartPage.tsx`
- **Storage:** Browser `localStorage` key `cart-storage` (no server cart table in the lean schema).

### 4.3 Checkout

- **Files:** `src/pages/customer/CheckoutPage.tsx`, `src/hooks/useOrders.ts` (`useCreateOrder`), `src/pages/customer/OrderConfirmationPage.tsx`
- **Flow:**
  1. Validate form and line-level stock against `product.stock_quantity`.
  2. If Supabase configured: `useCreateOrder` inserts one `orders` row (no `order_number` in payload — DB assigns), then `order_items` rows.
  3. Clear cart; navigate to `/order-confirmation` with `state: { order }`.
  4. If Supabase **not** configured: local demo `Order` object and same confirmation UX.

### 4.4 Auth & admin

- **Files:** `src/store/authStore.ts`, `src/components/layout/ProtectedRoute.tsx`, `src/App.tsx`
- **Admin:** `customers.role === 'admin'` (set in SQL after first signup).
- **Sign-up:** Do **not** duplicate `customers` insert in the client; the DB trigger handles it.

### 4.5 Admin dashboard

- **Files:** `src/pages/admin/*.tsx`, `src/hooks/useOrders.ts`, `useCustomers`, `useProducts` mutations
- **Tables:** `orders`, `order_items`, `customers`, `products`

---

## 5. Category & marketing images

| Mode | Implementation |
|------|----------------|
| **Default** | Curated Unsplash URLs in `src/data/categoryStrip.ts` |
| **Pexels** | Optional `VITE_PEXELS_API_KEY`; `useCategoryStripImages` fetches square photos |
| **Production** | Proxy Pexels via Edge Function; for AI assets, generate server-side, upload to Storage, store URLs in DB or config |

---

## 6. Stripe — production path

1. **Create order** in Supabase first (as now) or create a “pending” order from an Edge Function after validating the cart server-side.
2. **Stripe Checkout Session** (or Payment Element) with `client_reference_id` or `metadata.order_id`.
3. **Webhook** verifies signature, then:
   - `UPDATE orders SET payment_status = 'paid', stripe_payment_intent_id = … WHERE id = …`
   - Optionally send email receipt (Resend, etc.).

Do **not** collect raw card numbers in custom form fields; use Stripe.js / Checkout.

---

## 7. Data seeding

- **Source of truth for demo SKU list:** `src/data/products.ts`
- **Import:** SQL `INSERT` into `products` (see `SUPABASE_SETUP.md`) or CSV import in Supabase.
- Ensure **`category`** strings match `src/constants/index.ts` → `PRODUCT_CATEGORIES`.

---

## 8. Operational checklist (Bolt / CI)

1. Run `supabase/COREFORGE_BOLT_SCHEMA.sql`
2. Configure env vars on Bolt
3. Storage bucket + policies
4. Promote admin user
5. Seed products
6. Smoke test: shop → cart → checkout → DB rows + stock delta
7. Admin: orders list, customers, products
8. Add Stripe + webhook
9. Harden RLS / move checkout to Edge Function if you disable public inserts

---

## 9. Repository file map

| Path | Role |
|------|------|
| `supabase/COREFORGE_BOLT_SCHEMA.sql` | Full DDL + triggers + RLS + auth trigger |
| `SUPABASE_SETUP.md` | Human steps for Supabase + Bolt |
| `src/lib/supabase.ts` | Supabase client, `isSupabaseConfigured` |
| `src/types/index.ts` | `Product`, `Order`, `OrderItem`, `Customer`, `Address`, filters |
| `src/hooks/useProducts.ts` | Catalog CRUD hooks |
| `src/hooks/useOrders.ts` | Orders list, `useCreateOrder`, `useOrder`, `useOrderItems` |
| `src/hooks/useCustomers.ts` | Customer list + row mapping |
| `src/store/authStore.ts` | Auth session + `role` from `customers.role` |
| `src/store/cartStore.ts` | Cart + tax/shipping helpers |
| `src/pages/customer/CheckoutPage.tsx` | Checkout + `useCreateOrder` |
| `src/pages/customer/OrderConfirmationPage.tsx` | Post-checkout UX |
| `src/data/categoryStrip.ts` | Category URLs + image fallbacks / Pexels queries |
| `src/hooks/useCategoryStripImages.ts` | Optional Pexels |
| `src/constants/index.ts` | Categories, tax/shipping, order statuses |

---

## 10. Known limitations & next upgrades

- **Payment:** UI is “authorize later” until Stripe is wired; `payment_status` stays `pending` until webhook.
- **Guest order lookup:** No magic link email yet; add tokenized `order_lookup_token` + RPC if you need email “view order” without login.
- **Server cart / abandoned cart:** Not in lean schema; add `cart` table + sync if needed.
- **Reviews / wishlist / coupons:** Optional tables can be added; hooks are not all wired in the current UI.
- **Product variants:** Schema can extend with `product_variants`; storefront currently uses flat SKUs.

This document, **`SUPABASE_SETUP.md`**, and **`COREFORGE_BOLT_SCHEMA.sql`** together are sufficient for Bolt.new to implement and operate **CoreForge** as a proper Supabase-backed e-commerce application.
