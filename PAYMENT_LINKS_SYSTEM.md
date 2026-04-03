# Payment Links System Documentation

## Overview

The Payment Links System is a minimal, secure payment solution that allows you to generate code-protected payment links instantly. Each link is locked behind a unique access code, expires after a set time (10-15 minutes), and processes payments securely through Square.

### Security model (important)

- **`payment_links` rows are not readable via the anon key.** PostgREST cannot return `code_hash` to browsers. The pay page uses the RPC **`get_payment_link_public(payment_id)`**, which returns only safe fields.
- **Create link** is protected when you set the Edge secret **`PAYMENT_LINK_CREATE_SECRET`**: callers must send the same value as `Authorization: Bearer <secret>` or header **`x-payment-link-secret`**. If the secret is unset, anyone who can hit the function URL could create links — fine for local dev only.
- **Charge protection:** after a correct code, **`verify-payment-code`** stores a random **`unlock_token`** on the row and returns it once to the client. **`process-payment-link`** requires that token plus the Square `sourceId`, so card charges cannot run without prior code verification.

## Key Features

- **Code-Protected Links** - Each payment link requires a unique code to unlock
- **Time-Limited** - Links automatically expire after 10-15 minutes (configurable)
- **Secure** - Codes are hashed using bcrypt, never stored in plain text
- **Square Integration** - Seamless payment processing via Square Web Payments SDK
- **Real-time Countdown** - Users see exactly how much time remains
- **One-Time Use** - Links cannot be reused after successful payment
- **Metadata Support** - Attach custom data for tracking/reference

## Architecture

```
┌─────────────┐
│   API Call  │  POST /create-payment-link
│  (Backend)  │  { amount, code, metadata }
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Edge Function: create-payment-link │
│  - Generate unique payment_id       │
│  - Hash code with bcrypt            │
│  - Store in payment_links table     │
│  - Return payment URL               │
└──────┬──────────────────────────────┘
       │
       │  Returns: /pay/{payment_id}
       ▼
┌─────────────────────────────────────┐
│     User visits /pay/{payment_id}   │
│     (PaymentLinkPage component)     │
└──────┬──────────────────────────────┘
       │
       │  1. Fetch payment details (amount, expiry)
       │  2. Show code entry form
       ▼
┌─────────────────────────────────────┐
│  Edge Function: verify-payment-code │
│  - Fetch payment_link record        │
│  - Verify code with bcrypt.compare  │
│  - Check expiration                 │
│  - Set unlock_token, return it      │
└──────┬──────────────────────────────┘
       │
       │  If valid: unlock Square payment form
       ▼
┌─────────────────────────────────────┐
│    Square Payment Form (React)      │
│    - User enters card details       │
│    - Square SDK tokenizes card      │
│    - Returns sourceId token         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Edge Function: process-payment-link│
│  - Require matching unlock_token    │
│  - Call Square Payments API         │
│  - Update payment_link status       │
│  - Return result                    │
└──────┬──────────────────────────────┘
       │
       │  Success: status = "paid"
       ▼
┌─────────────────────────────────────┐
│      Payment Success Screen         │
│      Show confirmation              │
└─────────────────────────────────────┘
```

## Database Schema

### `payment_links` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `payment_id` | TEXT | Unique public identifier (8 chars, alphanumeric) |
| `amount` | DECIMAL(10,2) | Payment amount |
| `currency` | TEXT | ISO currency code (default: USD) |
| `code_hash` | TEXT | Bcrypt hash of access code |
| `metadata` | JSONB | Optional custom data |
| `status` | TEXT | `pending`, `paid`, `expired`, `failed` |
| `expires_at` | TIMESTAMPTZ | Expiration timestamp |
| `paid_at` | TIMESTAMPTZ | Payment completion timestamp |
| `square_payment_id` | TEXT | Square payment ID (if paid) |
| `unlock_token` | TEXT | Set after successful code verify; required to charge |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes**:
- `payment_id` (unique, fast lookups)
- `status` (filtering)
- `expires_at` (cleanup queries)
- `unlock_token` (partial, when set)

**RLS**: enabled on `payment_links` with **no** `SELECT`/`INSERT`/`UPDATE` policies for `anon` / `authenticated`. The storefront uses **`get_payment_link_public`**. Edge Functions use the **service role** (bypasses RLS).

**Migrations**: `20260403100000_payment_links.sql` (table), `20260403110000_payment_links_security_fix.sql` (trigger fix, RLS hardening, RPC, `unlock_token`).

## API Reference

### 1. Create Payment Link

**Endpoint**: `POST /functions/v1/create-payment-link`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {PAYMENT_LINK_CREATE_SECRET}   # required when PAYMENT_LINK_CREATE_SECRET is set on the function
# alternative: x-payment-link-secret: {PAYMENT_LINK_CREATE_SECRET}
```

**Request Body**:
```json
{
  "amount": 49.99,
  "code": "SECRET123",
  "currency": "USD",
  "expirationMinutes": 15,
  "metadata": {
    "order_id": "ORD-123456",
    "customer_name": "John Doe"
  }
}
```

**Parameters**:
- `amount` (required, number): Payment amount, must be > 0
- `code` (required, string): Access code, minimum 4 characters
- `currency` (optional, string): ISO currency code, default "USD"
- `expirationMinutes` (optional, number): Expiration time in minutes (5-60), default 15
- `metadata` (optional, object): Custom data for tracking

**Response** (201 Created):
```json
{
  "payment_url": "https://yoursite.com/pay/A3B7F2K9",
  "payment_id": "A3B7F2K9",
  "amount": 49.99,
  "currency": "USD",
  "expires_at": "2026-04-03T11:15:00.000Z",
  "expires_in_minutes": 15
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input (amount <= 0, code < 4 chars, etc.)
- `401 Unauthorized`: Missing or wrong `PAYMENT_LINK_CREATE_SECRET` (when that env var is set)
- `500 Internal Server Error`: Database or system error

### 2. Verify Payment Code

**Endpoint**: `POST /functions/v1/verify-payment-code`

**Headers**:
```
Authorization: Bearer {supabase-anon-or-user-jwt}
Content-Type: application/json
```

**Request Body**:
```json
{
  "payment_id": "A3B7F2K9",
  "code": "SECRET123"
}
```

**Response** (200 OK):
```json
{
  "valid": true,
  "unlock_token": "550e8400-e29b-41d4-a716-446655440000",
  "payment_id": "A3B7F2K9",
  "amount": 49.99,
  "currency": "USD",
  "metadata": { "order_id": "ORD-123456" },
  "expires_at": "2026-04-03T11:15:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Missing payment_id or code
- `401 Unauthorized`: Invalid code
- `404 Not Found`: Payment link not found
- `410 Gone`: Payment link expired
- `500 Internal Server Error`: System error

### 3. Process Payment Link

**Endpoint**: `POST /functions/v1/process-payment-link`

**Headers**:
```
Authorization: Bearer {supabase-anon-or-user-jwt}
Content-Type: application/json
```

**Request Body**:
```json
{
  "payment_id": "A3B7F2K9",
  "sourceId": "cnon:card-nonce-ok",
  "idempotencyKey": "A3B7F2K9-1712145000000-abc123",
  "unlockToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Parameters**:
- `payment_id` (required): The payment link ID
- `sourceId` (required): Square card token from SDK
- `idempotencyKey` (required): Unique key to prevent duplicate charges
- `unlockToken` (required): Value returned by **verify-payment-code** for this payment session

**Response** (200 OK):
```json
{
  "success": true,
  "payment_id": "A3B7F2K9",
  "square_payment_id": "pi_abc123xyz",
  "status": "COMPLETED",
  "amount": 49.99,
  "currency": "USD"
}
```

**Error Responses**:
- `400 Bad Request`: Missing fields or payment already completed
- `402 Payment Required`: Square payment failed
- `403 Forbidden`: Missing or invalid `unlockToken` (code not verified)
- `404 Not Found`: Payment link not found
- `410 Gone`: Payment link expired
- `500 Internal Server Error`: System error

## Frontend Integration

### React Component: PaymentLinkPage

**Location**: `/src/pages/customer/PaymentLinkPage.tsx`

**Route**: `/pay/:paymentId`

**Features**:
1. Loads safe payment fields via RPC `get_payment_link_public` (not direct table `select`)
2. Displays amount and time remaining countdown
3. Code entry form with validation
4. Square payment form (unlocked after code verification)
5. Payment success/error states
6. Auto-expiration handling

**States**:
- Loading: Shows spinner while fetching payment details
- Error: Invalid/expired/not found payment links
- Code Entry: User enters access code to unlock payment
- Payment Form: Square payment UI (after code verification)
- Success: Payment completed confirmation

### Usage Example

```tsx
import { PaymentLinkPage } from './pages/customer/PaymentLinkPage';

// In App.tsx
<Route path="pay/:paymentId" element={<PaymentLinkPage />} />

// User visits: https://yoursite.com/pay/A3B7F2K9
// 1. Sees amount: $49.99
// 2. Enters code: "SECRET123"
// 3. Code verified → payment form unlocked
// 4. Enters card details
// 5. Payment processed → success screen
```

## Security Features

### 1. Code Hashing

Codes are hashed using **bcrypt** before storage:

```typescript
// On creation
const codeHash = await bcrypt.hash("SECRET123");
// Stored: "$2a$10$N9qo8uLOickgx2ZMRZoMye..."

// On verification
const isValid = await bcrypt.compare("SECRET123", codeHash);
// Returns: true or false
```

**Why bcrypt?**
- Industry-standard one-way hashing
- Computationally expensive (prevents brute force)
- Salted automatically (unique hash per code)
- Cannot be reversed

### 2. Time-Based Expiration

Every payment link has an `expires_at` timestamp:

```typescript
const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
```

**Enforcement**:
- Checked on code verification
- Checked on payment processing
- Auto-updates status to "expired" when detected
- Real-time countdown on UI

### 3. One-Time Use

Once a payment is completed:
- Status changes to "paid"
- `paid_at` timestamp recorded
- Further payment attempts rejected

### 4. No Sensitive Data on Frontend

- `code_hash` never sent to client
- Only service role can read `code_hash`
- All code verification happens server-side
- Square card data tokenized by Square SDK

### 5. CORS Protection

All Edge Functions include CORS headers:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
```

## Environment Variables

### Required

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Server-side only

# Square
VITE_SQUARE_APPLICATION_ID=sandbox-sq0idb-...
VITE_SQUARE_LOCATION_ID=L...
VITE_SQUARE_ENVIRONMENT=sandbox  # or "production"
SQUARE_ACCESS_TOKEN=EAAAl...  # Server-side only

# Frontend (optional)
FRONTEND_URL=https://yoursite.com  # For generating payment URLs
```

**Security Notes**:
- Never commit `.env` to version control
- Frontend only has access to `VITE_*` variables
- `SQUARE_ACCESS_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` only in Edge Functions
- Use different credentials for sandbox vs production

## Usage Examples

### Example 1: Basic Payment Link

```bash
curl -X POST https://xxx.supabase.co/functions/v1/create-payment-link \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "code": "MYSECRET"
  }'

# Response:
# {
#   "payment_url": "https://yoursite.com/pay/K7N3M9P2",
#   "payment_id": "K7N3M9P2",
#   "amount": 99.99,
#   "currency": "USD",
#   "expires_at": "2026-04-03T11:15:00.000Z",
#   "expires_in_minutes": 15
# }
```

### Example 2: Payment Link with Metadata

```bash
curl -X POST https://xxx.supabase.co/functions/v1/create-payment-link \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 149.50,
    "code": "INVOICE2024",
    "expirationMinutes": 30,
    "metadata": {
      "invoice_number": "INV-001234",
      "customer_email": "john@example.com",
      "items": ["Product A", "Product B"]
    }
  }'
```

### Example 3: Backend Integration (Node.js)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createPaymentLink(amount: number, code: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, code }),
  });

  const data = await response.json();
  return data.payment_url;
}

// Usage
const paymentUrl = await createPaymentLink(49.99, "SECRET123");
console.log("Send this link to customer:", paymentUrl);
```

## Testing

### Test Flow

1. **Create Test Payment Link**:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/create-payment-link \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"amount": 10.00, "code": "TEST123"}'
   ```

2. **Visit Payment Link**:
   - Open `http://localhost:5173/pay/YOUR_PAYMENT_ID`
   - Verify amount displays correctly
   - Check countdown timer

3. **Test Code Verification**:
   - Enter wrong code → should show error
   - Enter correct code ("TEST123") → should unlock payment form

4. **Test Payment**:
   - Use Square sandbox test card: `4111 1111 1111 1111`
   - Expiry: `12/26`, CVV: `111`
   - Complete payment → should show success screen

5. **Verify Database**:
   ```sql
   SELECT * FROM payment_links WHERE payment_id = 'YOUR_PAYMENT_ID';
   -- Should show status = 'paid', square_payment_id populated
   ```

### Square Sandbox Test Cards

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |

## Error Handling

### Common Errors and Solutions

**Error: "Payment link not found"**
- Cause: Invalid payment_id
- Solution: Verify the payment_id exists in database

**Error: "Payment link has expired"**
- Cause: Current time > expires_at
- Solution: Create a new payment link

**Error: "Invalid code"**
- Cause: Code doesn't match hash
- Solution: User must enter correct code

**Error: "Payment already completed"**
- Cause: status = "paid"
- Solution: Payment links are one-time use only

**Error: "Square credentials not configured"**
- Cause: Missing SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID
- Solution: Set environment variables in Supabase

**Error: "Card declined"**
- Cause: Square rejected the payment
- Solution: User should try different card or check card details

## Monitoring & Maintenance

### Cleanup Expired Links

Run periodic cleanup to remove old expired links:

```sql
-- Delete expired links older than 24 hours
DELETE FROM payment_links
WHERE status = 'expired'
  AND expires_at < NOW() - INTERVAL '24 hours';

-- Or update status of expired but still pending links
UPDATE payment_links
SET status = 'expired', updated_at = NOW()
WHERE status = 'pending'
  AND expires_at < NOW();
```

**Recommendation**: Set up a Supabase cron job or scheduled function to run this daily.

### Analytics Queries

**Payment success rate**:
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'paid') * 100.0 / COUNT(*) AS success_rate
FROM payment_links
WHERE created_at > NOW() - INTERVAL '7 days';
```

**Average time to payment**:
```sql
SELECT AVG(EXTRACT(EPOCH FROM (paid_at - created_at)) / 60) AS avg_minutes
FROM payment_links
WHERE status = 'paid';
```

**Failed payments by reason**:
```sql
SELECT status, COUNT(*) AS count
FROM payment_links
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status;
```

## Best Practices

### 1. Code Generation

Generate strong, random codes:

```typescript
function generateSecureCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous chars
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const code = generateSecureCode(); // "K7N3M9P2"
```

### 2. Expiration Times

Choose appropriate expiration based on use case:

- **Quick payments**: 5-10 minutes
- **Invoice payments**: 15-30 minutes
- **Scheduled payments**: 30-60 minutes

### 3. Metadata Usage

Store useful context in metadata:

```json
{
  "metadata": {
    "order_id": "ORD-123456",
    "customer_email": "john@example.com",
    "source": "invoice_system",
    "items": [
      { "name": "Product A", "quantity": 2 },
      { "name": "Product B", "quantity": 1 }
    ]
  }
}
```

### 4. Error Notifications

Send notifications on payment events:

```typescript
// After successful payment
if (paymentStatus === "COMPLETED") {
  await sendEmail({
    to: metadata.customer_email,
    subject: "Payment Received",
    body: `Your payment of $${amount} has been processed.`,
  });
}
```

### 5. Rate Limiting

Implement rate limiting on Edge Functions to prevent abuse:

```typescript
// In Edge Function
const rateLimitKey = `payment-link:${req.headers.get("x-forwarded-for")}`;
const count = await incrementRateLimit(rateLimitKey, 10); // 10 per minute

if (count > 10) {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded" }),
    { status: 429 }
  );
}
```

## Troubleshooting

### Payment Link Not Loading

1. Check database: `SELECT * FROM payment_links WHERE payment_id = 'XXX'`
2. Verify RLS policies allow public read
3. Check browser console for errors
4. Verify Supabase URL and anon key are correct

### Code Verification Failing

1. Verify code is correct (case-sensitive)
2. Check Edge Function logs in Supabase dashboard
3. Ensure bcrypt is properly imported in Edge Function
4. Test code hash manually:
   ```typescript
   const isValid = await bcrypt.compare("TEST123", codeHash);
   console.log("Code valid:", isValid);
   ```

### Payment Not Processing

1. Check Square credentials are set
2. Verify Square environment (sandbox vs production)
3. Check Edge Function logs for Square API errors
4. Ensure payment link hasn't expired
5. Verify idempotency key is unique

## Future Enhancements

### Recommended Features

1. **Webhook Notifications**
   - Send webhook on payment completion
   - Integrate with external systems

2. **Multiple Payment Methods**
   - Add Apple Pay support
   - Add Google Pay support
   - Add ACH/bank transfers

3. **Recurring Payments**
   - Support for subscription-based payments
   - Auto-renewal with stored payment methods

4. **Partial Payments**
   - Allow payments in installments
   - Track remaining balance

5. **QR Code Generation**
   - Generate QR codes for payment links
   - Easier sharing via mobile

6. **Email Integration**
   - Auto-send payment links via email
   - Email confirmations on payment

7. **Multi-Currency Support**
   - Automatic currency conversion
   - Display amounts in customer's currency

8. **Custom Branding**
   - White-label payment pages
   - Custom logos and colors

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Review Square dashboard for payment details
- Check browser console for frontend errors
- Verify database records in `payment_links` table

---

**Last Updated**: 2026-04-03
**Version**: 1.0.0
**Author**: CoreForge Development Team
