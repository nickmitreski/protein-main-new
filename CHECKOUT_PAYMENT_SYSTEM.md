# Checkout & Payment System Documentation

## Overview

CoreForge implements a complete, production-ready ecommerce checkout system integrated with Square for secure payment processing. The system follows PCI-DSS best practices by never exposing payment credentials on the frontend and routing all sensitive operations through secure Supabase Edge Functions.

## Architecture

### Flow Diagram

```
Cart → Checkout (Shipping Info) → Payment (Square) → Order Confirmation
  ↓           ↓                      ↓                    ↓
Items      Create Order          Process Payment    Update Order Status
```

### Components

1. **Frontend (React + TypeScript)**
   - `/src/pages/customer/CheckoutPage.tsx` - Main checkout flow
   - `/src/components/customer/SquarePaymentForm.tsx` - Square payment UI
   - `/src/lib/payment.ts` - Payment processing utilities
   - `/src/lib/api.ts` - Order creation and management

2. **Backend (Supabase Edge Functions)**
   - `supabase/functions/square-payment/` - Secure Square API integration

3. **Payment Provider**
   - Square Web Payments SDK
   - Square Payments API (server-side via Edge Function)

## Checkout Flow

### Step 1: Shipping Information

**Location**: `CheckoutPage.tsx` (step: 'shipping')

User provides:
- Email address
- Full name (first + last)
- Shipping address (address line 1, city, state, postal code, country)
- Optional: Coupon code for discounts

**Validation**:
- All fields required except coupon
- Email format validation
- Postal code format validation
- Coupon validation via `useValidateCoupon` hook

**Actions**:
- Apply coupon (if valid)
- Calculate totals (subtotal, discount, tax, shipping)
- "Continue to Payment" button → Step 2

### Step 2: Order Creation

**When**: User clicks "Continue to Payment"

**Process**:
1. Validate shipping information
2. Calculate final totals with applied discount
3. Create order in Supabase with status `pending`
   ```typescript
   const orderData = {
     customer_email: email,
     customer_name: `${firstName} ${lastName}`,
     shipping_address: { address1, city, state_province, postal_code, country },
     items: cartItems,
     subtotal,
     tax,
     shipping_cost,
     discount_amount,
     total,
     currency: CURRENCY,
     order_status: 'pending',
     payment_status: 'pending',
   };
   ```
4. Generate unique order number (format: `ORD-XXXXXX`)
5. Create order items in database
6. Store `pendingOrder` in state
7. Transition to payment step

**Why create order before payment?**
- Ensures order data is persisted even if payment fails
- Provides order ID for payment reference
- Enables payment retry without data loss
- Allows order tracking from the moment customer commits

### Step 3: Payment Processing

**Location**: `CheckoutPage.tsx` (step: 'payment')

**UI Components**:
1. Order summary (items, totals, shipping address)
2. Square Payment Form (`SquarePaymentForm.tsx`)
   - Secure card input fields (hosted by Square)
   - PCI-compliant tokenization
   - Security badges and notices
3. Payment error banner (if retry needed)

**Payment Flow**:

```typescript
// 1. User enters card details in Square form
// 2. Square SDK tokenizes card → sourceId
// 3. Frontend calls handleTokenize(sourceId)

async function handleTokenize(sourceId: string) {
  // 4. Prepare payment request
  const request = {
    sourceId,                                    // Card token from Square
    orderId: pendingOrder.id,                    // Order ID from Step 2
    amountCents: toCents(pendingOrder.total),    // Amount in cents
    currency: pendingOrder.currency,             // USD
    idempotencyKey: generateIdempotencyKey(),    // Unique key for this payment
    buyerEmailAddress: pendingOrder.customer_email,
  };

  // 5. Send to Supabase Edge Function
  const result = await processSquarePayment(request);

  // 6. Handle result
  if (result.success) {
    // Update order with payment details
    // Clear cart
    // Redirect to confirmation
  } else {
    // Show user-friendly error
    // Increment retry counter
    // Allow retry
  }
}
```

**Security Features**:
- Card data never touches your servers
- Square SDK handles PCI compliance
- Payment credentials only in environment variables
- All Square API calls via Edge Functions
- Idempotency keys prevent duplicate charges

## Payment Service (`/src/lib/payment.ts`)

### Core Functions

#### `processSquarePayment(request: SquarePaymentRequest)`

Processes payment via Supabase Edge Function.

```typescript
interface SquarePaymentRequest {
  sourceId: string;           // Card token from Square SDK
  orderId: string;            // Order ID from database
  amountCents: number;        // Amount in cents (e.g., 4999 = $49.99)
  currency: string;           // ISO currency code (e.g., 'USD')
  idempotencyKey: string;     // Unique key to prevent duplicate charges
  buyerEmailAddress?: string; // Optional email for receipt
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;         // Square payment ID (if successful)
  status?: string;            // 'COMPLETED' | 'PENDING' | 'FAILED'
  error?: string;             // User-friendly error message
}
```

**How it works**:
1. Validates Supabase configuration
2. Gets auth token (user session or anon key)
3. Calls `/functions/v1/square-payment` Edge Function
4. Returns standardized result

#### `generateIdempotencyKey(orderId: string)`

Generates unique idempotency key to prevent duplicate payments.

Format: `{orderId}-{timestamp}-{random}`

Example: `550e8400-1710432000000-a1b2c3`

**Why needed?**
- Prevents charging customer twice if they click "Pay" multiple times
- Prevents duplicate charges on network retry
- Square deduplicates payments within 24 hours using this key

#### `retryPayment(request, maxRetries = 3, initialDelay = 1000)`

Retries payment with exponential backoff.

**Retry logic**:
- Attempt 1: Immediate
- Attempt 2: Wait 1 second
- Attempt 3: Wait 2 seconds

**Does NOT retry for**:
- Card declined
- Insufficient funds
- Invalid card data

**Retries for**:
- Network errors
- Temporary Square API errors
- Gateway timeouts

#### `getUserFriendlyErrorMessage(error: string)`

Converts technical error messages to user-friendly text.

**Error classifications**:

| Error Type | User Message |
|------------|--------------|
| `CARD_DECLINED` | "Your card was declined. Please check your card details or try a different card." |
| `INSUFFICIENT_FUNDS` | "Insufficient funds. Please use a different payment method." |
| `INVALID_CARD` | "Invalid card information. Please check your card number, expiration date, and CVV." |
| `NETWORK_ERROR` | "Network error. Please check your connection and try again." |
| `PROCESSING_ERROR` | "Payment processing error. Please try again in a moment." |
| `CONFIGURATION_ERROR` | "Payment system not configured. Please contact support." |
| `UNKNOWN_ERROR` | "Payment failed. Please try again or contact support if the problem persists." |

### Helper Functions

```typescript
// Convert dollars to cents for Square API
toCents(49.99) // → 4999

// Validate payment request before processing
validatePaymentRequest({
  sourceId: 'tok_...',
  orderId: '550e8400-...',
  amountCents: 4999,
  idempotencyKey: '550e8400-...',
}) // → { valid: true }

// Check if Square is configured
isSquareConfigured() // → true if all credentials present

// Get Square environment
getSquareEnvironment() // → 'sandbox' | 'production'

// Classify error type
classifyPaymentError('card declined') // → PaymentErrorType.CARD_DECLINED
```

## Square Payment Form Component

**Location**: `/src/components/customer/SquarePaymentForm.tsx`

### Features

1. **Security Indicators**
   - Lock icon with "Secure payment powered by Square"
   - Security notice: "Your payment information is encrypted and secure"
   - PCI-compliant hosted card fields

2. **Loading States**
   - SDK initialization overlay
   - Payment processing spinner
   - Disabled state during processing

3. **Error Handling**
   - Configuration errors (missing credentials)
   - SDK loading failures
   - Tokenization errors
   - Clear error messages with AlertCircle icon

4. **UX Enhancements**
   - Card icon on payment button
   - Responsive design system integration
   - Smooth transitions
   - Clear call-to-action

### Props

```typescript
interface SquarePaymentFormProps {
  onTokenize: (sourceId: string) => void | Promise<void>;  // Callback with card token
  onError: (message: string) => void;                      // Error handler
  isLoading: boolean;                                      // External loading state
  disabled?: boolean;                                      // Disable form
}
```

### Initialization Flow

1. Load Square SDK from CDN (sandbox or production)
2. Check for required credentials (app ID, location ID)
3. Initialize Square Payments object
4. Create and attach card element to DOM
5. Show form when ready

### Tokenization Flow

1. User clicks "Complete Payment"
2. Call `card.tokenize()` on Square SDK
3. Square validates card and returns token
4. Call `onTokenize(token)` prop
5. Parent handles payment processing

## Environment Variables

### Required for Square Integration

```bash
# Square Configuration
VITE_SQUARE_APPLICATION_ID=sandbox-sq0idb-...      # Square app ID
VITE_SQUARE_LOCATION_ID=L...                       # Square location ID
VITE_SQUARE_ENVIRONMENT=sandbox                    # 'sandbox' or 'production'

# Supabase Configuration (for Edge Functions)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...               # Server-side only

# Square Server Credentials (Edge Function only - NEVER in frontend)
SQUARE_ACCESS_TOKEN=EAAAl...                        # Square API access token
```

### Security Notes

- Frontend only accesses `VITE_*` variables
- Server credentials (`SQUARE_ACCESS_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`) only in Edge Functions
- Never commit `.env` to version control
- Use different credentials for sandbox vs production

## Edge Function: `square-payment`

**Location**: `supabase/functions/square-payment/index.ts`

### Purpose

Securely processes Square payments without exposing credentials to frontend.

### Request

```typescript
POST /functions/v1/square-payment
Authorization: Bearer {supabase-auth-token}
Content-Type: application/json

{
  "sourceId": "cnon:...",
  "orderId": "550e8400-...",
  "amountCents": 4999,
  "currency": "USD",
  "idempotencyKey": "550e8400-1710432000000-a1b2c3",
  "buyerEmailAddress": "customer@example.com"
}
```

### Response

**Success (200)**:
```json
{
  "paymentId": "pi_...",
  "status": "COMPLETED"
}
```

**Error (400/500)**:
```json
{
  "error": "Card declined"
}
```

### Implementation

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Client, Environment } from 'square'

serve(async (req) => {
  // 1. Get Square credentials from environment
  const accessToken = Deno.env.get('SQUARE_ACCESS_TOKEN')

  // 2. Initialize Square client
  const client = new Client({
    accessToken,
    environment: Environment.Sandbox, // or Production
  })

  // 3. Parse request
  const { sourceId, amountCents, currency, idempotencyKey, ... } = await req.json()

  // 4. Create payment via Square API
  const response = await client.paymentsApi.createPayment({
    sourceId,
    amountMoney: { amount: BigInt(amountCents), currency },
    idempotencyKey,
    // ... other fields
  })

  // 5. Return result
  return new Response(JSON.stringify({
    paymentId: response.result.payment?.id,
    status: response.result.payment?.status,
  }))
})
```

## Error Handling & Recovery

### Payment Failure Recovery

When payment fails, CheckoutPage shows a recovery banner:

```typescript
{paymentError && retryCount > 0 && (
  <div style={{ /* error styling */ }}>
    <AlertCircle />
    <div>
      <p>Payment Failed</p>
      <p>{paymentError}</p>  {/* User-friendly message */}

      {/* After 2 failures, show support contact */}
      {retryCount >= 2 && (
        <p>
          Need help?
          <a href="mailto:support@coreforge.com">
            Contact our support team
          </a>
        </p>
      )}
    </div>
  </div>
)}
```

**Recovery options**:
1. Try different card
2. Check card details (expiry, CVV)
3. Contact support after 2+ failures
4. Go back to edit shipping info

### Order Status Tracking

Orders are created with status `pending` before payment:

```typescript
// Before payment
order.order_status = 'pending'
order.payment_status = 'pending'

// After successful payment
order.payment_status = 'paid'  // or 'completed'
order.payment_reference_id = 'pi_...'  // Square payment ID

// Payment can be retried without recreating order
```

## Order Confirmation

**Location**: `/src/pages/customer/OrderConfirmationPage.tsx`

After successful payment:

1. Clear cart: `clearCart()`
2. Show success toast
3. Navigate to confirmation with order data
4. Display:
   - Order number
   - Payment confirmation
   - Shipping details
   - Order items
   - Total paid

## Testing the Checkout Flow

### Test Data

**Square Sandbox Test Cards**:

| Card Number | Expiry | CVV | Expected Result |
|-------------|--------|-----|-----------------|
| 4111 1111 1111 1111 | 12/26 | 111 | Success |
| 4000 0000 0000 0002 | 12/26 | 111 | Card declined |
| 4000 0000 0000 9995 | 12/26 | 111 | Insufficient funds |

### Manual Test Steps

1. Add products to cart
2. Navigate to checkout
3. Fill shipping form:
   - Email: test@example.com
   - Name: Test Customer
   - Address: 123 Test St, San Francisco, CA, 94102, US
4. Apply valid coupon (optional)
5. Click "Continue to Payment"
6. Verify order created in Supabase `orders` table
7. Enter test card details
8. Click "Complete Payment"
9. Verify:
   - Payment processed
   - Order updated with payment ID
   - Cart cleared
   - Redirected to confirmation

### What to Check

- [ ] Order created before payment
- [ ] Payment form loads correctly
- [ ] Card validation works
- [ ] Successful payment updates order
- [ ] Failed payment shows user-friendly error
- [ ] Retry logic works correctly
- [ ] Cart clears after success
- [ ] Confirmation page shows correct details
- [ ] No sensitive data in frontend
- [ ] All API calls use auth tokens

## Troubleshooting

### "Payment Configuration Error"

**Cause**: Missing Square credentials

**Fix**: Check environment variables:
```bash
VITE_SQUARE_APPLICATION_ID
VITE_SQUARE_LOCATION_ID
VITE_SQUARE_ENVIRONMENT
```

### "Square SDK failed to load"

**Cause**: Network issue or CDN unavailable

**Fix**:
- Check internet connection
- Verify Square CDN is accessible
- Check browser console for errors

### "Payment failed - Network error"

**Cause**: Edge Function unreachable

**Fix**:
- Verify Supabase URL is correct
- Check Edge Function is deployed
- Verify auth token is valid

### "Card declined"

**Cause**: Card validation failed (sandbox or production)

**Fix**:
- Use different test card (sandbox)
- Check card details are correct
- Verify sufficient funds (production)

### Order created but payment failed

**This is expected behavior!**

Orders are intentionally created before payment to enable:
- Payment retry without losing data
- Order tracking
- Support assistance

**To handle**:
- User can retry payment on same order
- Admin can see pending orders
- Implement cleanup job for old pending orders (future enhancement)

## Future Enhancements

### Recommended Improvements

1. **Payment Method Alternatives**
   - Apple Pay via Square
   - Google Pay via Square
   - ACH / Bank transfers

2. **Order Management**
   - Customer order history page
   - Email confirmations
   - Order status tracking
   - Shipment tracking integration

3. **Error Recovery**
   - Automatic retry for network errors
   - Save partial form data
   - Resume checkout from any step

4. **Analytics**
   - Track checkout abandonment
   - Monitor payment failure rates
   - A/B test checkout flow

5. **Security Enhancements**
   - 3D Secure (SCA compliance)
   - Fraud detection
   - Rate limiting
   - CAPTCHA for high-risk orders

6. **Performance**
   - Prefetch Square SDK
   - Optimize order creation
   - Cache shipping rates
   - Lazy load components

## Best Practices

### Development

1. Always test with sandbox credentials first
2. Use different Supabase projects for dev/staging/prod
3. Never log sensitive data (card numbers, tokens)
4. Validate all user inputs
5. Handle edge cases (network errors, timeouts)

### Security

1. Never store raw card data
2. Use environment variables for all credentials
3. Implement rate limiting on Edge Functions
4. Validate all inputs server-side
5. Use HTTPS everywhere
6. Rotate API keys regularly

### UX

1. Show clear error messages
2. Provide retry options
3. Save progress between steps
4. Show security indicators
5. Minimize required fields
6. Support guest checkout
7. Enable coupon application

### Monitoring

1. Track payment success rate
2. Monitor Edge Function errors
3. Alert on high failure rates
4. Log all payment attempts
5. Track checkout abandonment

## API Reference

### Order Creation

```typescript
// From /src/lib/api.ts
async function createOrder(orderData: Partial<Order>): Promise<Order>
```

### Payment Processing

```typescript
// From /src/lib/payment.ts
async function processSquarePayment(
  request: SquarePaymentRequest
): Promise<PaymentResult>

function generateIdempotencyKey(orderId: string): string

function toCents(amount: number): number

async function retryPayment(
  request: SquarePaymentRequest,
  maxRetries?: number,
  initialDelay?: number
): Promise<PaymentResult>

function getUserFriendlyErrorMessage(error: string): string

function isSquareConfigured(): boolean

function getSquareEnvironment(): 'sandbox' | 'production'
```

### Cart State

```typescript
// From /src/store/cartStore.ts (Zustand)
const {
  items,           // CartItem[]
  getSubtotal,     // () => number
  getTax,          // () => number
  getShipping,     // () => number
  getTotal,        // () => number
  clearCart,       // () => void
} = useCartStore()
```

## Support

For issues or questions:
- Technical: Check browser console and network tab
- Payment: Verify Square dashboard for transaction details
- Database: Check Supabase orders table
- Support: support@coreforge.com

---

**Last Updated**: 2026-04-03
**Version**: 1.0.0
**Author**: CoreForge Development Team
