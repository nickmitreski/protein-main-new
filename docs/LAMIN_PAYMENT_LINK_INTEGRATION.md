# LAMIN ↔ Partner (this project): payment link + verification code

LAMIN’s Edge Function **`secure-checkout-init`** calls your HTTPS endpoint **before** sending Resend/Twilio. It expects a JSON response with a **`payment_url`** the customer can open. The same **6-digit `code`** and **`reference`** (LAMIN order id) must be enforced on your pay page so only someone with the SMS/email can complete payment.

**This repository** implements that flow with:

- **Edge Function** `create-payment-link` — creates a row in `public.payment_links`, hashes the code (bcrypt), returns `payment_url` pointing at **`https://<your-app>/pay/<payment_id>`** (hosted pay page + Square Web SDK, not `square.link`).
- **Edge Functions** `verify-payment-code` and `process-payment-link` — code check, then Square charge.
- **Optional metadata:** set `"source": "lamin"` (case-insensitive) to enforce **exactly 6-digit** `code` and **required** `reference`, and to align with LAMIN’s contract below.

### This repo vs LAMIN (two different Supabase projects)

The long handoff / terminal notes you may have seen describe **two codebases**:

| | **LAMIN** (referral / LAMININ storefront) | **This repository** (GoForge / CoreForge store) |
|--|--------------------------------|-----------------------------------------------------------|
| **Role** | Generates the **6-digit code**, calls the partner API **first**, then **Resend + Twilio** with link + code + reference + amount | **Partner**: exposes **`create-payment-link`**, stores **`payment_links`**, hosts **`/pay/:id`** + Square |
| **Edge Function** | `secure-checkout-init` (not in this repo) | `create-payment-link`, `verify-payment-code`, `process-payment-link` |
| **Main table** | `checkout_secure_sessions` (migrations live in the **LAMIN** repo) | `payment_links` (migrations in **`supabase/migrations/`** here) |
| **Docs** | e.g. `PARTNER-SQUARE-PAYMENT-LINK.md`, `REFERRAL-WHITE-LABEL-PAYMENT.md` **on LAMIN** | This file + `PAYMENT_LINKS_SYSTEM.md` |

**Your `.env` with `kwgvsyefnefkvzyijpco`** is for **this** (partner) project. LAMIN’s Supabase has **its own** project ref and secrets (`PAYMENT_LINK_CREATE_URL` pointing **here**, `ENABLE_CODE_DELIVERY`, Resend, Twilio, etc.).

**SQL vs Dashboard**

- **Partner (this repo):** Schema for payment links = run migrations (`supabase db push`) or paste migration SQL in order. Secrets (Square, `PAYMENT_LINK_BEARER`, `FRONTEND_URL`) = **Dashboard → Edge Functions → Secrets** or `supabase secrets set`, not SQL.
- **LAMIN:** Same idea — its tables (`checkout_secure_sessions`, …) = **LAMIN’s** migrations only; do **not** run partner `payment_links` SQL on LAMIN or LAMIN session SQL on the partner DB unless you intentionally share one database (unusual).

**End-to-end flow (link in email/SMS, no auto-open)**

1. Customer submits checkout on **LAMIN / LAMININ**.  
2. LAMIN’s **`secure-checkout-init`** creates a session, generates the **6-digit code**, then **`POST`s** to **`PAYMENT_LINK_CREATE_URL`** on **this** project with `amount`, `code`, `reference`, `currency`, `metadata.source: "lamin"`, …  
3. **This** project returns `{ "payment_url", "payment_id" }` (the link customers open to pay).  
4. **LAMIN** sends **email/SMS** (Resend/Twilio on the LAMIN project) with the branded line, **reference**, **code**, and **that same link**. This partner project does **not** send email/SMS to the customer; it only creates the link and enforces the code on `/pay/:id`.  
5. Customer opens the link from the message → **`/pay/:id`** here → enters **code** → Square payment.

`PARTNER-SQUARE-PAYMENT-LINK.md` in the **LAMIN** repo is the same contract, aimed at whoever implements the **partner** side — **this** repo is that implementation (plus `docs/LAMIN_PAYMENT_LINK_INTEGRATION.md`).

---

## Contract (incoming POST from LAMIN)

### URL

Set on LAMIN: **`PAYMENT_LINK_CREATE_URL`** = full URL to this function, e.g.  
`https://<PROJECT_REF>.supabase.co/functions/v1/create-payment-link`

### Headers

| Header | Meaning |
|--------|---------|
| `Authorization: Bearer <PAYMENT_LINK_BEARER>` | Must match partner Edge secret (see below). |
| `Content-Type: application/json` | Required. |
| `x-payment-link-secret: <same or alternate shared secret>` | Optional; either header may carry the shared secret (same value as bearer on partner). |

On **this** project, the secret is read from env **`PAYMENT_LINK_BEARER`** or **`PAYMENT_LINK_CREATE_SECRET`** (same string — use one name). If **neither** is set, the function allows unauthenticated creates (dev only).

### Body (JSON)

| Field | Type | Meaning |
|--------|------|--------|
| `amount` | number | Total to charge (e.g. `123.45`) |
| `code` | string | Plain 6-digit OTP for LAMIN (stored hashed server-side only) |
| `reference` | string | LAMIN **order id** (e.g. LAMININ order reference) — shown on pay UI; stored in `external_reference`; passed to Square `reference_id` (truncated to 40 chars) |
| `currency` | string | ISO code, e.g. `USD`, `AUD` |
| `expirationMinutes` | number | Link expiry (5–60; default 15) |
| `metadata` | object | Should include **`"source": "lamin"`** for strict LAMIN validation. Optional: `customer_email`, `customer_phone`, `enriched_lines`, etc. |

### Response (JSON) — required shape for LAMIN

**Minimum (required):**

```json
{
  "payment_url": "https://your-store.example.com/pay/XXXXXXXX",
  "payment_id": "XXXXXXXX"
}
```

**This function also returns** (extra fields are safe for LAMIN to ignore): `amount`, `currency`, `reference`, `expires_at`, `expires_in_minutes`.

On **idempotent retry** (same `reference`, same `amount`, existing pending non-expired row): returns **200** with the same `payment_url` and `payment_id`.

If creation fails, returns **4xx/5xx** with JSON `{ "error": "..." }`. LAMIN will **not** send email/SMS when `ENABLE_CODE_DELIVERY=true` and payment link creation fails (unless `ALLOW_CODE_DELIVERY_WITHOUT_PAYMENT_LINK=true` on LAMIN for staging).

---

## Mapping: LAMIN spec ↔ this repo

| LAMIN / doc concept | This project |
|---------------------|--------------|
| `payment_url` | `{FRONTEND_URL or Origin}/pay/{payment_id}` |
| `payment_id` | Short public id (`payment_id` column), not UUID |
| `reference` | `payment_links.external_reference` + `metadata.reference` |
| Code storage | `code_hash` (bcrypt), never plaintext in DB |
| Bearer secret | Env `PAYMENT_LINK_BEARER` **or** `PAYMENT_LINK_CREATE_SECRET` |
| Square reconciliation | `process-payment-link` sets Square **`reference_id`** from `external_reference` when present (else `payment_id`) |
| 6-digit code | Enforced when `metadata.source` is `"lamin"` (any case) or env `PAYMENT_LINK_REQUIRE_SIX_DIGIT_CODE=true` |

---

## Example POST (from LAMIN or curl)

```bash
curl -sS -X POST 'https://YOUR_REF.supabase.co/functions/v1/create-payment-link' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_SHARED_SECRET' \
  -d '{
    "amount": 123.45,
    "code": "482916",
    "reference": "lamin-order-id-or-uuid",
    "currency": "USD",
    "expirationMinutes": 15,
    "metadata": {
      "source": "lamin",
      "customer_email": "buyer@example.com",
      "customer_phone": "+1..."
    }
  }'
```

---

## Prompt you can paste into another repo (generic partner spec)

> Implement a Supabase Edge Function `create-payment-link` deployed with `verify_jwt = false`, protected by `Authorization: Bearer <secret>` from env (e.g. `PAYMENT_LINK_BEARER`).
>
> **POST body:** `amount` (number), `code` (string, 6 digits for LAMIN), `reference` (string), `currency` (string), `expirationMinutes` (number), `metadata` (object).
>
> 1. Validate bearer and body; reject if `amount` ≤ 0 or `code` invalid for your policy.
> 2. Store a row with hashed code, reference, amount, expiry; return `{ "payment_url", "payment_id" }`.
> 3. Hosted pay page: show reference, amount, verification code field; verify server-side before card capture.
> 4. Do not expose the correct code in static HTML/JS.
> 5. Log errors without logging full `code` in production.

*(This repo already follows that pattern; adjust table/column names if you fork.)*

---

## Square notes

- This project uses **Square Payments API** from **`process-payment-link`** after **Web Payments SDK** tokenization on `/pay/:id`.
- **`reference`** (LAMIN order id) is sent as Square **`reference_id`** (max 40 characters).
- **Idempotency:** Retries with the same **`reference`** return the existing **`payment_url`** if a matching **pending** row is still valid; **409** if the same reference exists with a **different amount**.

---

## Partner SQL (this project)

Do **not** run the generic starter SQL below if you use this repo — migrations already define `payment_links` (including `external_reference`, `unlock_token`, RLS, RPCs). Use **`supabase db push`**.

<details>
<summary>Generic starter (other greenfield projects only)</summary>

```sql
create table if not exists public.payment_links (
  id uuid primary key default gen_random_uuid(),
  reference text not null,
  code_hash text not null,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  square_payment_link_id text,
  payment_url text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
-- … indexes, RLS …
```

</details>

---

## LAMIN secrets (reminder)

| Secret | Role |
|--------|------|
| `PAYMENT_LINK_CREATE_URL` | Full URL to `create-payment-link` |
| `PAYMENT_LINK_BEARER` | Must match partner **`PAYMENT_LINK_BEARER`** or **`PAYMENT_LINK_CREATE_SECRET`** |
| `PAYMENT_LINK_SECRET_HEADER` | Optional; if used, send same shared value as `x-payment-link-secret` |
| `CHECKOUT_DELIVERY_BRAND` | Text in email/SMS, default `LAMININ` |
| `ENABLE_CODE_DELIVERY` | `true` to send Resend/Twilio |
| `ALLOW_CODE_DELIVERY_WITHOUT_PAYMENT_LINK` | `true` only for staging without payment link |

Frontend (LAMIN): `VITE_CHECKOUT_DELIVERY_BRAND`, `VITE_CHECKOUT_DISPLAY_CURRENCY`, etc.

---

## Deploy checklist (partner / this repo)

1. `npx supabase db push` — schema + RPCs.
2. Set Edge secrets: `PAYMENT_LINK_BEARER` (or `PAYMENT_LINK_CREATE_SECRET`), `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT`, `FRONTEND_URL` (production pay page origin).
3. `npx supabase functions deploy create-payment-link verify-payment-code process-payment-link` (and `square-webhook` if used).
4. Point LAMIN **`PAYMENT_LINK_CREATE_URL`** at the deployed `create-payment-link` URL.

Optional env on this function:

- `PAYMENT_LINK_REQUIRE_SIX_DIGIT_CODE=true` — force 6-digit codes even when `source` is not `lamin`.
