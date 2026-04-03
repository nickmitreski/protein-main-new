# Deploying CoreForge (GitHub + Bolt.new + your Supabase project)

The app is a **Vite + React** SPA. Data lives in **your** Supabase project; Bolt (or any host) only serves static files and injects **public** env vars at build time.

## 1. Never commit secrets

- **`.env` is gitignored.** Copy `.env.example` → `.env` locally.
- Only **anon / publishable** keys belong in `VITE_*` variables (they ship to the browser).
- **Service role**, **access tokens**, and **JWT secrets** must **not** use the `VITE_` prefix and should not be required for the storefront build.

## 2. Environment variables (Bolt / CI / hosting UI)

Set these in the host’s **Environment** panel (same names as in `.env.example`):

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_SUPABASE_URL` | Yes | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` **or** `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | One of them; matches Dashboard → API |
| `VITE_ADMIN_EMAILS` | Optional | Bootstrap admin if `customers.role` missing |
| `VITE_SQUARE_APPLICATION_ID` | Optional | Empty = checkout creates orders without card capture |
| `VITE_SQUARE_ENVIRONMENT` | If Square | `sandbox` or `production` |
| `VITE_SQUARE_LOCATION_ID` | If Square | From Square Developer Dashboard |
| `VITE_PEXELS_API_KEY` | Optional | Homepage category images |

After changing env vars, **trigger a new build** (Bolt rebuilds on change).

## 3. Database schema (one-time per Supabase project)

Bolt does **not** run SQL migrations. From your machine (with repo + Supabase CLI):

```bash
npx supabase@latest login
npx supabase@latest link --project-ref <YOUR_PROJECT_REF>
npx supabase@latest db push
```

That applies everything under `supabase/migrations/`. Use `supabase/DIAGNOSTIC_RUN_IN_SQL_EDITOR.sql` in the SQL Editor if you need to verify state.

## 4. Supabase Auth URLs

In **Authentication → URL configuration**:

- **Site URL**: your production site URL (and/or Bolt preview URL while testing).
- **Redirect URLs**: add the same URLs (wildcard subdomains only if you accept the security tradeoff).

## 5. Edge Functions (Square checkout + optional payment links)

Deploy from `supabase/functions/` with the CLI:

- **`square-payment`** / **`square-webhook`** — main storefront checkout. If Square env vars are unset, checkout still works as **order-only** (pending payment).
- **`create-payment-link`** / **`verify-payment-code`** / **`process-payment-link`** — code-locked pay links (`/pay/:id`). Apply migration `20260403110000_payment_links_security_fix.sql` (and `20260403100000_payment_links.sql`) via `db push`. Set **`PAYMENT_LINK_CREATE_SECRET`** on `create-payment-link` in production so random callers cannot mint links.

## 6. GitHub

Push this repo; in Bolt, **import from GitHub** and paste the same `VITE_*` values. Updating the “Open in Bolt” badge in `README.md` is optional and only needed if you publish a new Bolt template.
