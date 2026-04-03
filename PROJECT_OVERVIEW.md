# CoreForge / protein-main-new — Project overview

This document is a single reference for the **entire repository**: frontend, “backend” (Supabase + Edge Functions), environment, deployment, and the **Supabase** database (schema, RLS, migrations, functions, and helper SQL).

**Brand / product:** “CoreForge” — Australian supplement e-commerce (AUD, shipping/tax patterns). The UI and sample data position it as **CoreForge Nutrition**; replace placeholders in `src/constants/business.ts` for production.

---

## 1. What this project is

- **Single-page application (SPA)** built with **Vite + React 18 + TypeScript**.
- **No custom Node/Express API** in the repo. The app talks to **Supabase** (Postgres + Auth + REST/Realtime APIs) and, optionally, **Supabase Edge Functions** for **Square** card payments and webhooks.
- **Admin area** at `/admin` for orders, products, customers, analytics, and store settings (protected; admin role required).
- **Storefront** under a shared customer chrome: home, shop, product detail, cart, checkout, order confirmation, track orders, and legal/policy pages.

---

## 2. Tech stack

| Layer | Choice |
|--------|--------|
| Build / dev | Vite 5, `@vitejs/plugin-react` |
| UI | React 18, Tailwind CSS 3, Lucide icons |
| Routing | React Router 7 |
| Server state / caching | TanStack React Query 5 |
| Client state | Zustand (auth persisted, cart) |
| Forms / validation | React Hook Form, Zod |
| Charts (admin) | Recharts |
| Notifications | react-hot-toast |
| Backend | Supabase (`@supabase/supabase-js`) |
| Payments (optional) | Square Web Payments SDK (browser) + Edge Functions |

Scripts in `package.json`: `dev`, `build`, `preview`, `lint`, `typecheck`.

---

## 3. Repository layout (high level)

```
src/
  App.tsx                 # Route table
  main.tsx                # React root, QueryClient, Router, Toaster
  components/             # Marketing sections, UI primitives, layouts
  pages/
    customer/             # Storefront + policies
    admin/                # Dashboard, orders, products, customers, analytics, settings
    auth/                 # Login, signup
  hooks/                  # useProducts, useOrders, useCoupons, useReviews, etc.
  store/                  # authStore, cartStore
  lib/                    # supabase client, queryClient, catalog adapter
  data/                   # Static product/category data (fallback / alignment)
  types/                  # TypeScript models mirroring DB concepts
  constants/              # Categories, statuses, shipping, currency
supabase/
  migrations/             # Ordered SQL migrations (source of truth for schema)
  functions/
    square-payment/       # CreatePayment via Square API, update order
    square-webhook/         # HMAC verify + payment status sync
  config.toml             # Local Supabase CLI project (Postgres 17, ports, auth)
  ADMIN_SETUP.sql         # How to promote a user to admin
  DIAGNOSTIC_RUN_IN_SQL_EDITOR.sql  # Health / sanity checks for hosted DB
  optional_demo_order.sql # Optional demo data
  COREFORGE_BOLT_SCHEMA.sql # Historical / bolt reference (migrations are canonical)
.env.example              # Documented env vars
DEPLOYMENT.md             # Deploy checklist (hosting + Supabase)
```

---

## 4. Frontend architecture

### 4.1 Entry and providers

- `src/main.tsx` wraps the app with `QueryClientProvider`, `BrowserRouter`, and `Toaster`.
- `AuthInitializer` (mounted in `App.tsx`) restores Supabase session and resolves user role.

### 4.2 Routing (`src/App.tsx`)

**Customer shell** (`CustomerChrome`): `/`, `/shop`, `/product/:id`, `/cart`, `/checkout`, `/order-confirmation`, `/orders`, plus policy routes (`/privacy-policy`, `/terms-of-service`, `/shipping-returns`, `/cookie-policy`, `/supplement-disclaimer`).

**Auth (no chrome):** `/login`, `/signup`.

**Admin** (`AdminLayout`, inside `ProtectedRoute requireAdmin`): `/admin`, `/admin/orders`, `/admin/products`, `/admin/customers`, `/admin/analytics`, `/admin/settings`.

**Fallback:** unknown paths → `/`.

### 4.3 Auth and roles

- **Supabase Auth** (`signInWithPassword`, `signUp`, session persistence) when `VITE_SUPABASE_URL` and anon/publishable key are set (`src/lib/supabase.ts`).
- **Role resolution** (`src/store/authStore.ts` — `resolveAuthRole`):
  1. JWT `app_metadata.role` or `user_metadata.role` (`admin` / `customer`)
  2. `public.customers.role` for the signed-in user
  3. `VITE_ADMIN_EMAILS` (comma-separated) as bootstrap if no row/role yet
- **Demo mode:** If Supabase is **not** configured, sign-in fakes a user; `admin@coreforge.test` maps to admin (`DEMO_ADMIN_EMAIL`).
- **Protected routes:** `ProtectedRoute` redirects unauthenticated users to `/login` and non-admins away from `/admin`.

### 4.4 Data loading pattern

- React Query hooks in `src/hooks/` call `supabase.from(...)` (and RPCs such as guest order lookup).
- Types in `src/types/index.ts` align with tables and forms (products, orders, coupons, reviews, etc.).
- **Catalog:** Products are expected in Supabase; `useProducts` and `catalogProductAdapter` bridge DB rows to UI. Static data in `src/data/products.ts` supports category alignment and development.

### 4.5 Cart and checkout

- **Cart:** `cartStore` (Zustand) holds line items; totals can use store settings–driven tax/shipping where implemented.
- **Checkout** (`CheckoutPage.tsx`): shipping step → creates order via `useCreateOrder` → optional **Square** payment step via `SquarePaymentForm` when `VITE_SQUARE_APPLICATION_ID` is set; otherwise orders can be created with **pending** payment (see `DEPLOYMENT.md`).
- **Coupons:** validated against `public.coupons` (active codes, min order, etc.).

### 4.6 Notable UI areas

- Marketing homepage sections: Hero, category strip (optional Pexels via `VITE_PEXELS_API_KEY`), testimonials, FAQ, trust, process, etc.
- **Admin:** tables and forms for CRUD on products/orders/customers, analytics charts, settings backed by `store_settings`.

### 4.7 Styling and design tokens

- Tailwind + `src/utils/design-system.ts` for shared colors/spacing/typography.
- `src/index.css` for global styles.

---

## 5. “Backend” — what actually runs server-side

There is **no first-party HTTP API** in this repo besides:

1. **Supabase hosted services** (Postgres, Auth, PostgREST, Realtime, Storage if used).
2. **Supabase Edge Functions** (Deno) in `supabase/functions/`:
   - **`square-payment`:** Accepts `sourceId`, `orderId`, `amountCents`, `currency`, `idempotencyKey`, optional `buyerEmailAddress`; calls Square `CreatePayment`; optionally updates `orders` with `payment_reference_id` and `payment_status` using **service role**.
   - **`square-webhook`:** Verifies `x-square-hmacsha256-signature` when `SQUARE_WEBHOOK_SIGNATURE_KEY` is set; handles `payment.completed` / `payment.updated` and updates orders by `reference_id` or `payment_reference_id`.

**Secrets for Edge Functions** (set in Supabase dashboard or CLI): e.g. `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## 6. Environment variables

Documented in **`.env.example`** and **`DEPLOYMENT.md`**.

**Browser (Vite `VITE_*` — exposed to client):**

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` **or** `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anon/publishable key |
| `VITE_ADMIN_EMAILS` | Optional comma-separated emails treated as admin until `customers.role` is set |
| `VITE_SQUARE_APPLICATION_ID` | Square Web Payments (omit for order-only checkout) |
| `VITE_SQUARE_ENVIRONMENT` | `sandbox` or `production` |
| `VITE_SQUARE_LOCATION_ID` | Square location |
| `VITE_PEXELS_API_KEY` | Optional homepage category images |

**Never** prefix service role keys or Square server tokens with `VITE_`.

---

## 7. Supabase — complete picture

### 7.1 Local CLI project (`supabase/config.toml`)

- **project_id:** `protein-main-new`
- **Postgres major_version:** 17
- **API** default local port: `54321`; **Studio:** `54323`; **DB:** `54322`
- **Auth:** local `site_url` `http://127.0.0.1:3000`; email confirmations off in default template (adjust for production)
- **db.seed:** `sql_paths = ["./seed.sql"]` — the referenced **`supabase/seed.sql` is not present in this repo**; product seeding is handled inside **migrations** (see below). If `db reset` fails for missing seed, add a seed file or adjust `config.toml`.

### 7.2 Authentication

- **Provider:** Supabase Auth (email/password in app).
- **User profile row:** Trigger `on_auth_user_created` on `auth.users` → `public.handle_new_user()` inserts into `public.customers` with role `customer`.
- **Admin:** Set `public.customers.role = 'admin'` for a user (see `supabase/ADMIN_SETUP.sql`) and/or JWT app metadata `role: admin`.

### 7.3 Database tables (public schema)

| Table | Purpose |
|-------|---------|
| **products** | Catalog: pricing, inventory, categories, images, nutrition JSON, SEO-ish fields, `is_active` / `is_featured`, text `id` (SKUs like `CFG-001`), optional `slug`, `sku` unique |
| **customers** | 1:1 with `auth.users` (`id` FK); email, name, phone, **role** (`customer` \| `admin`), stats (`orders_count`, `total_spent`), marketing, `default_address`, tags, notes |
| **orders** | Checkout orders: `order_number` (trigger-generated `CFG-#####`), optional `customer_id` (null = guest), addresses JSON, money fields, statuses, `coupon_code`, **Square** `payment_reference_id`, legacy `stripe_payment_intent_id`, tracking fields |
| **order_items** | Line items per order; optional `product_snapshot`; FK to `products` |
| **subscribers** | Email list from site forms |
| **coupons** | Discount codes (`percentage` / `fixed`); seeded e.g. `WELCOME10` |
| **reviews** | Product reviews; `is_approved` gates public visibility; **guest** reviews use `reviewer_email` + `customer_id` null |
| **store_settings** | Key/value JSON config (store name, tax rate, shipping costs, etc.) |
| **abandoned_carts** | Recovery carts keyed by `session_id`, items JSON |

### 7.4 Triggers and functions (database)

- **`set_order_number`:** Before insert on `orders`, assigns `CFG-` + zero-padded sequence if empty.
- **`bump_customer_stats_from_order`:** After insert on `orders`, increments customer order count and spend when `customer_id` set.
- **`decrement_product_stock`:** After insert on `order_items`, reduces `products.stock_quantity` when `track_inventory` is true.
- **`update_updated_at_column`:** Maintains `updated_at` on products, customers, orders, coupons, store_settings, abandoned_carts.
- **`handle_new_user`:** SECURITY DEFINER — syncs new auth user → `customers`.
- **`lookup_guest_order(p_order_number, p_email)`:** SECURITY DEFINER — returns JSON with order + items for **guest** lookup without exposing broad anon SELECT on `orders`. Granted to `anon` and `authenticated`.
- **`is_admin()`:** SECURITY DEFINER — returns whether `auth.uid()` has `customers.role = 'admin'`; used to avoid **RLS recursion** on `customers`.

### 7.5 Row Level Security (RLS) — behavior summary

- **products:** Anyone can read **active** products; **admins** full access (policies use admin checks; combined with later migrations using `is_admin()` where needed).
- **customers:** Users read/update **self**; admin policies use **`is_admin()`** (fixes infinite recursion — see migration `20260401060000`).
- **orders:** Users see **own** orders (`customer_id = auth.uid()`); admins see all; **insert** allowed for anon/authenticated with `customer_id` null or matching `auth.uid()` (guest checkout supported).
- **order_items:** Select tied to owning order or admin; insert allowed when linked order is guest or owned.
- **subscribers:** Public insert; admin read/delete.
- **coupons:** Public read **active** rows; admin full management.
- **reviews:** Public read **approved**; admin full; insert: **registered** (`customer_id = auth.uid()`) **or guest** (`customer_id` null with valid `reviewer_email` and name constraints) per `20260331180000`.
- **store_settings:** **Public SELECT** (so storefront can read tax/shipping config); admin write — migration `20260330151057`.
- **abandoned_carts:** Insert broadly; update rules for owner/null `customer_id`; admin select/update for management.

*(Exact policy names and edge cases live in the migration files — this section is the intended security model.)*

### 7.6 Migrations (chronological, under `supabase/migrations/`)

| File | What it does |
|------|----------------|
| `20260330104347_coreforge_schema.sql` | Base schema: `products`, `customers`, `orders`, `order_items`; sequences; triggers; initial RLS |
| `20260330105957_orders_square_payment_fields.sql` | `payment_reference_id` + index for Square |
| `20260330130113_fix_rls_admin_policies.sql` | Admin RLS improvements (`is_admin` pattern introduced/used) |
| `20260330132958_fix_rls_performance_auth_uid.sql` | RLS performance: `(select auth.uid())` style |
| `20260330133019_drop_unused_indexes.sql` | Drops unused indexes |
| `20260330133049_fix_multiple_permissive_policies.sql` | Consolidates overlapping permissive policies |
| `20260330133111_fix_function_search_paths.sql` | Sets `search_path` on functions (security) |
| `20260330135805_add_product_extended_fields_and_seed.sql` | `benefits`, `key_features`, `long_description`, unique `sku`; **seeds ~34 products** |
| `20260330140003_subscribers_coupons_reviews_settings_tracking.sql` | New tables + order fulfillment columns + default `store_settings` + `WELCOME10` |
| `20260330143213_fix_indexes_rls_performance_and_policies.sql` | Indexes + RLS/policy fixes |
| `20260330143234_fix_fk_indexes.sql` | FK index fixes |
| `20260330143319_fix_reviews_fk_indexes.sql` | Review FK indexes |
| `20260330143411_drop_remaining_unused_indexes.sql` | More index cleanup |
| `20260330150438_fix_admin_role_and_trigger.sql` | Admin role / trigger alignment |
| `20260330151057_fix_store_settings_public_read_and_orders_guest.sql` | **Public read** `store_settings` |
| `20260330151705_fix_customers_rls_direct_auth_uid.sql` | Customer RLS tweaks |
| `20260330152400_fix_admin_trigger_email_and_remaining_rls_subqueries.sql` | Trigger email + RLS subquery fixes |
| `20260331180000_guest_order_lookup_and_guest_reviews.sql` | **`lookup_guest_order`**, guest review column + policy |
| `20260401060000_fix_customers_rls_recursion_is_admin.sql` | **`is_admin()`** + customer admin policies |

Apply to a hosted project with:

```bash
npx supabase@latest link --project-ref <YOUR_PROJECT_REF>
npx supabase@latest db push
```

### 7.7 Helper SQL files (not auto-applied as migrations)

- **`supabase/ADMIN_SETUP.sql`:** Comments/instructions to set `customers.role = 'admin'` or JWT app metadata.
- **`supabase/DIAGNOSTIC_RUN_IN_SQL_EDITOR.sql`:** Run sections in Dashboard SQL Editor to verify tables, row counts, RLS-related sanity (documented inside the file).
- **`supabase/optional_demo_order.sql`:** Optional demo order data.
- **`supabase/COREFORGE_BOLT_SCHEMA.sql`:** Bolt-era reference; **migrations are the source of truth** for drift-free deploys.

### 7.8 Storage, Realtime, and Edge

- **Storage:** Enabled in config; **no app-specific bucket setup** is committed in `config.toml` (only commented examples). The storefront uses **image URLs** (e.g. `/other/supp-images/...`) — ensure your host serves those static assets or replace with Supabase Storage URLs.
- **Realtime:** Enabled locally; the React app may or may not subscribe to channels (check hooks for `channel` usage).
- **Edge Functions:** `square-payment`, `square-webhook` (section 5).

---

## 8. Deployment and operations

See **`DEPLOYMENT.md`** for the full checklist. Summary:

1. Build the SPA (`npm run build`); host static files (Bolt, Vercel, Netlify, etc.).
2. Set all required **`VITE_*`** variables on the host; rebuild after changes.
3. Run **`supabase db push`** against your project so migrations match production.
4. Configure **Auth URL** allow list for production and preview URLs.
5. Deploy Edge Functions and secrets **if** using Square server-side charging/webhooks.

---

## 9. What has been “done” (feature checklist)

- Full **storefront** with catalog, product detail, cart, checkout, coupon support, order confirmation flow.
- **Guest checkout** (`customer_id` null) and **logged-in** checkout; **track order** / guest lookup via **`lookup_guest_order`** RPC.
- **Supabase-backed** products, orders, customers, coupons, reviews, subscribers, store settings, abandoned carts.
- **Admin dashboard** with orders, products, customers, analytics, settings.
- **Square** integration path: Web SDK + Edge payment creation + optional webhook sync.
- **RLS hardening** iterations: performance (`auth.uid()` wrapping), duplicate policy cleanup, **`is_admin()`** to fix customer-table recursion, public read for `store_settings`.
- **Diagnostics** SQL for verifying production DB state.
- **TypeScript** types and React Query hooks aligned to the schema.

---

## 10. Related docs in-repo

- **`DEPLOYMENT.md`** — Hosting + Supabase + Square deployment steps.
- **`.env.example`** — Environment variable template.
- **`supabase/DIAGNOSTIC_RUN_IN_SQL_EDITOR.sql`** — Operational SQL checks.

---

*Generated as a consolidated overview of the repository. For line-level behavior, open the cited paths; for exact SQL, read the migration files in `supabase/migrations/` in timestamp order.*
