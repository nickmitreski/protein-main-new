# Prioritized Engineering Backlog
**Generated:** 2026-04-04
**Project:** CoreForge E-Commerce Platform

---

## CRITICAL PATH (Do First)

### 1. 🔴 P0: Rotate Compromised Supabase Secrets
**Priority:** IMMEDIATE (before any deployment)
**Effort:** S (30 minutes)
**Owner:** DevOps / Tech Lead
**Tracking:** S-01

**Why:** Live production secrets are in git history. Full database access is compromised.

**Steps:**
1. Go to https://supabase.com/dashboard/project/kwgvsyefnefkvzyijpco/settings/api
2. Click "Reset service_role key" → copy new key
3. Click "Reset JWT secret" (WARNING: logs out all users)
4. Go to https://supabase.com/dashboard/account/tokens → revoke access token, generate new
5. Update local `.env` with new keys (DO NOT COMMIT)
6. Set in deployment platform (Bolt.new/Vercel/Netlify):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Remove `.env` from git history:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
8. Add pre-commit hook to prevent future commits of `.env`
9. **Consider creating new Supabase project** if repo was ever public

**Definition of Done:**
- [ ] All secrets rotated in Supabase Dashboard
- [ ] `.env` removed from git history (`git log -- .env` shows nothing)
- [ ] Pre-commit hook installed and tested
- [ ] New secrets set in deployment platform
- [ ] Deployment succeeds with new keys

---

### 2. 🔴 P0: Add Atomic Stock Deduction (Fix Race Condition)
**Priority:** CRITICAL (affects money)
**Effort:** M (4 hours)
**Owner:** Backend Engineer
**Tracking:** C-02

**Why:** Two users can buy the last item simultaneously → overselling → refunds/disputes.

**Current State:**
- Client checks stock in checkout flow (src/pages/customer/CheckoutPage.tsx:98)
- No atomic DB transaction ensures stock is available

**Solution:**
Create Supabase Edge Function or RLS policy for atomic stock deduction:

```sql
-- Add to supabase/migrations/
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  product_id UUID,
  quantity_to_decrement INTEGER
) RETURNS TABLE(success BOOLEAN, remaining_stock INTEGER) AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Lock the row
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = product_id
  FOR UPDATE;

  IF current_stock < quantity_to_decrement THEN
    RETURN QUERY SELECT false, current_stock;
  ELSE
    UPDATE products
    SET stock_quantity = stock_quantity - quantity_to_decrement,
        updated_at = NOW()
    WHERE id = product_id;

    RETURN QUERY SELECT true, (current_stock - quantity_to_decrement);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Call from `createOrder` in `src/lib/api.ts`:

```typescript
// Before inserting order, decrement stock atomically
for (const item of orderItems) {
  const { data, error } = await supabase.rpc('decrement_product_stock', {
    product_id: item.product_id,
    quantity_to_decrement: item.quantity,
  });

  if (error || !data[0].success) {
    throw new Error(`Product ${item.product_id} out of stock`);
  }
}

// Then create order (stock is already reserved)
```

**Definition of Done:**
- [ ] Supabase migration created and applied
- [ ] `decrement_product_stock` function tested manually
- [ ] `createOrder` updated to use atomic decrement
- [ ] Test: two simultaneous orders for last item → one succeeds, one fails with "Out of Stock"
- [ ] Rollback mechanism if order creation fails after stock decrement

---

### 3. 🔴 P0: Add Test Coverage (Start with Critical Paths)
**Priority:** HIGH (blocks safe refactoring)
**Effort:** L (2-3 days)
**Owner:** Full Stack Engineer
**Tracking:** T-01

**Why:** Zero tests = cannot refactor safely, regressions go unnoticed.

**Phase 1 (Target: 40% coverage on critical paths):**

1. **Install Vitest + Testing Library:**
   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
   ```

2. **Add test script to `package.json`:**
   ```json
   "scripts": {
     "test": "vitest",
     "test:ui": "vitest --ui",
     "test:coverage": "vitest --coverage"
   }
   ```

3. **Create `vitest.config.ts`:**
   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'happy-dom',
       setupFiles: ['./src/test/setup.ts'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html'],
         exclude: ['node_modules/', 'src/test/', 'dist/'],
       },
     },
   });
   ```

4. **Priority test files (create in this order):**

   **a) `src/store/cartStore.test.ts`** (highest ROI):
   ```typescript
   import { describe, it, expect, beforeEach } from 'vitest';
   import { useCartStore } from './cartStore';

   describe('Cart Store', () => {
     beforeEach(() => {
       useCartStore.getState().clearCart();
     });

     it('should add item to cart', () => {
       const product = { id: '1', name: 'Whey', price: 50, stock_quantity: 10 };
       useCartStore.getState().addItem(product, 2);

       expect(useCartStore.getState().items).toHaveLength(1);
       expect(useCartStore.getState().items[0].quantity).toBe(2);
     });

     it('should enforce stock limits', () => {
       const product = { id: '1', name: 'Whey', price: 50, stock_quantity: 5 };
       useCartStore.getState().addItem(product, 10); // Try to add 10 (only 5 exist)

       expect(useCartStore.getState().items[0].quantity).toBe(5); // Capped at 5
     });

     it('should calculate total correctly', () => {
       const p1 = { id: '1', name: 'Whey', price: 50, stock_quantity: 10 };
       const p2 = { id: '2', name: 'Creatine', price: 30, stock_quantity: 10 };
       useCartStore.getState().addItem(p1, 2);
       useCartStore.getState().addItem(p2, 1);

       expect(useCartStore.getState().getSubtotal()).toBe(130); // 50*2 + 30
     });
   });
   ```

   **b) `src/lib/payment.test.ts`:**
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { generateIdempotencyKey, validatePaymentRequest } from './payment';

   describe('Payment Utils', () => {
     it('should generate unique idempotency keys', () => {
       const key1 = generateIdempotencyKey('order-123');
       const key2 = generateIdempotencyKey('order-123');
       expect(key1).not.toBe(key2); // Should be different (UUID is random)
     });

     it('should validate payment requests', () => {
       const valid = validatePaymentRequest({
         sourceId: 'tok_123',
         orderId: 'ord_456',
         amountCents: 5000,
         idempotencyKey: 'idem-789',
       });
       expect(valid.valid).toBe(true);
     });

     it('should reject invalid amounts', () => {
       const invalid = validatePaymentRequest({
         sourceId: 'tok_123',
         orderId: 'ord_456',
         amountCents: -100, // Negative amount
         idempotencyKey: 'idem-789',
       });
       expect(invalid.valid).toBe(false);
       expect(invalid.error).toContain('Invalid payment amount');
     });
   });
   ```

   **c) `src/pages/customer/CheckoutPage.test.tsx`** (integration test):
   ```typescript
   import { describe, it, expect, vi } from 'vitest';
   import { render, screen, fireEvent } from '@testing-library/react';
   import { CheckoutPage } from './CheckoutPage';
   import { BrowserRouter } from 'react-router-dom';

   describe('Checkout Page', () => {
     it('should show validation error if email is missing', async () => {
       render(
         <BrowserRouter>
           <CheckoutPage />
         </BrowserRouter>
       );

       const submitButton = screen.getByText(/Continue to Payment/i);
       fireEvent.click(submitButton);

       expect(await screen.findByText(/Please fill in all required fields/i)).toBeInTheDocument();
     });
   });
   ```

**Definition of Done:**
- [ ] Vitest installed and `npm test` works
- [ ] 3 test files created (cart, payment, checkout)
- [ ] Coverage report shows 40%+ on `src/store/` and `src/lib/`
- [ ] CI runs tests on every push (see item #6 below)

---

## HIGH PRIORITY (Week 1)

### 4. 🟠 P1: Apply CORS Restriction to All Edge Functions
**Priority:** HIGH (security)
**Effort:** S (1 hour)
**Owner:** Backend Engineer
**Tracking:** S-04

**Why:** Currently only `square-payment` has CORS fix. Other 4 functions still allow `*`.

**Files to update:**
1. `supabase/functions/square-webhook/index.ts`
2. `supabase/functions/create-payment-link/index.ts`
3. `supabase/functions/process-payment-link/index.ts`
4. `supabase/functions/verify-payment-code/index.ts`

**Template:**
```typescript
const allowedOrigin = Deno.env.get("FRONTEND_URL") || "*";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  // ...
};
```

**Set secret:**
```bash
supabase secrets set FRONTEND_URL=https://your-domain.com
```

**Definition of Done:**
- [ ] All 5 Edge Functions use `FRONTEND_URL` env var
- [ ] `FRONTEND_URL` set in Supabase Dashboard → Edge Functions → Secrets
- [ ] Test: request from unauthorized domain returns CORS error
- [ ] Test: request from production domain succeeds

---

### 5. 🟠 P1: Implement Rate Limiting on Auth + Checkout
**Priority:** HIGH (prevent abuse)
**Effort:** M (4 hours)
**Owner:** Backend Engineer
**Tracking:** S-05

**Why:** No protection against brute force login or checkout spam.

**Solution (Option A - Upstash Redis):**

1. **Install Upstash Redis** (free tier: 10k requests/day):
   ```bash
   # Sign up at https://upstash.com
   # Create Redis database, copy URL + token
   supabase secrets set UPSTASH_REDIS_URL=https://...
   supabase secrets set UPSTASH_REDIS_TOKEN=...
   ```

2. **Create rate-limit helper** (`supabase/functions/_shared/ratelimit.ts`):
   ```typescript
   import { Redis } from 'https://esm.sh/@upstash/redis@1';

   const redis = Redis.fromEnv(); // Reads UPSTASH_REDIS_* env vars

   export async function checkRateLimit(
     key: string,
     limit: number,
     windowSeconds: number
   ): Promise<{ allowed: boolean; remaining: number }> {
     const count = await redis.incr(key);
     if (count === 1) {
       await redis.expire(key, windowSeconds);
     }

     return {
       allowed: count <= limit,
       remaining: Math.max(0, limit - count),
     };
   }
   ```

3. **Apply to login Edge Function** (if you create one, or add to RLS):
   ```typescript
   const ip = req.headers.get('x-forwarded-for') || 'unknown';
   const rateLimit = await checkRateLimit(`login:${ip}`, 5, 900); // 5 attempts per 15 min

   if (!rateLimit.allowed) {
     return new Response(
       JSON.stringify({ error: 'Too many login attempts. Try again in 15 minutes.' }),
       { status: 429 }
     );
   }
   ```

4. **Apply to checkout** (client-side debouncing):
   ```typescript
   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async () => {
     if (isSubmitting) return; // Prevent double-click
     setIsSubmitting(true);
     try {
       await createOrder(...);
     } finally {
       setIsSubmitting(false);
     }
   };
   ```

**Definition of Done:**
- [ ] Upstash Redis configured
- [ ] Rate limit helper created
- [ ] Login attempts limited to 5 per 15 min per IP
- [ ] Checkout button disabled while submitting
- [ ] Test: 6th login attempt within 15 min returns 429 error

---

### 6. 🟠 P1: Set Up CI Pipeline (GitHub Actions)
**Priority:** HIGH (prevent broken merges)
**Effort:** S (1 hour)
**Owner:** DevOps / Tech Lead
**Tracking:** T-02

**Why:** No automated checks → broken code can be merged.

**Create `.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: |
          BUNDLE_SIZE=$(du -sb dist/assets/*.js | awk '{s+=$1} END {print s}')
          if [ $BUNDLE_SIZE -gt 600000 ]; then
            echo "Error: Bundle size $BUNDLE_SIZE exceeds 600KB limit"
            exit 1
          fi

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: success()
        with:
          files: ./coverage/coverage-final.json
```

**Definition of Done:**
- [ ] CI workflow file created
- [ ] PR to main triggers CI
- [ ] Badge added to README: `![CI](https://github.com/user/repo/actions/workflows/ci.yml/badge.svg)`
- [ ] Failed build blocks merge (configure branch protection)

---

### 7. 🟠 P1: Remove `other/` Directory
**Priority:** MEDIUM (repo hygiene)
**Effort:** S (15 minutes)
**Owner:** Tech Lead
**Tracking:** D-01

**Why:** 100MB+ of unused example code bloats repo, confuses contributors.

**Steps:**
```bash
# Create archive (in case needed for reference)
tar -czf other-backup-$(date +%Y%m%d).tar.gz other/

# Move to separate archive repo (optional)
# OR just delete:
git rm -r other/
git commit -m "chore: remove unused example projects from other/"
git push
```

**Definition of Done:**
- [ ] `other/` directory deleted
- [ ] Backup created (if desired)
- [ ] `git clone` size reduced by 100MB+
- [ ] README updated (remove references to `other/` if any)

---

## MEDIUM PRIORITY (Week 2)

### 8. 🟡 P1: Fix Coupon Expiry Validation
**Priority:** MEDIUM (affects revenue)
**Effort:** S (30 minutes)
**Owner:** Backend Engineer
**Tracking:** C-07

**Why:** Expired coupons can still be applied → lost revenue.

**File:** `src/lib/api.ts:328-346`

**Current:**
```typescript
.eq('is_active', true)
```

**Fix:**
```typescript
.eq('is_active', true)
.gte('valid_until', new Date().toISOString())
```

**Also add to RLS policy** (if not already):
```sql
CREATE POLICY "Public can view active non-expired coupons"
  ON coupons FOR SELECT
  USING (
    is_active = true
    AND (valid_until IS NULL OR valid_until >= NOW())
  );
```

**Definition of Done:**
- [ ] Query updated in `getCoupon`
- [ ] RLS policy updated
- [ ] Test: expired coupon returns "Invalid coupon code"
- [ ] Test: active coupon within validity period works

---

### 9. 🟡 P1: Add React Error Boundaries
**Priority:** MEDIUM (reliability)
**Effort:** M (2 hours)
**Owner:** Frontend Engineer
**Tracking:** R-01

**Why:** Single component crash kills entire app (white screen).

**Create `src/components/ErrorBoundary.tsx`:**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: Send to Sentry/LogRocket
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap routes in `src/App.tsx`:**
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthInitializer />
      <Routes>
        ...
      </Routes>
    </ErrorBoundary>
  );
}
```

**Definition of Done:**
- [ ] ErrorBoundary component created
- [ ] Wrapped around `<Routes>` in App.tsx
- [ ] Test: throw error in component → shows fallback UI
- [ ] Logged to console (ready for Sentry integration)

---

### 10. 🟡 P2: Optimize Images (Convert to WebP)
**Priority:** MEDIUM (performance)
**Effort:** M (3 hours)
**Owner:** Frontend Engineer
**Tracking:** P-02

**Why:** Product images are likely 500KB+ PNGs → slow page load.

**Steps:**

1. **Convert existing images:**
   ```bash
   # Install cwebp
   brew install webp  # macOS
   # OR: apt-get install webp  # Linux

   # Convert all PNGs to WebP
   cd other/supp-images/
   for f in *.png; do
     cwebp -q 80 "$f" -o "${f%.png}.webp"
   done
   ```

2. **Upload to Supabase Storage:**
   ```bash
   # Create bucket (if not exists)
   supabase storage create-bucket products

   # Upload images
   supabase storage upload products other/supp-images/*.webp
   ```

3. **Update `products` table to use Supabase Storage URLs:**
   ```sql
   UPDATE products
   SET image_url = 'https://kwgvsyefnefkvzyijpco.supabase.co/storage/v1/object/public/products/' || slug || '.webp'
   WHERE image_url LIKE 'http%';
   ```

4. **Use `<picture>` for browser compatibility:**
   ```tsx
   <picture>
     <source srcSet={product.image_url} type="image/webp" />
     <img src={product.image_url.replace('.webp', '.png')} alt={product.name} loading="lazy" />
   </picture>
   ```

**Definition of Done:**
- [ ] All 33 product images converted to WebP
- [ ] Uploaded to Supabase Storage
- [ ] `image_url` updated in database
- [ ] Product cards use `<picture>` with WebP + PNG fallback
- [ ] Images lazy-load (`loading="lazy"`)
- [ ] Lighthouse score improves by 10+ points

---

## LOWER PRIORITY (Backlog)

### 11-15. Additional Items (M-L effort)

11. **P1: Add Database Indexes** (M, 2 hours) - Tracking: P-05
    - `CREATE INDEX idx_products_category ON products(category);`
    - `CREATE INDEX idx_orders_status ON orders(status);`
    - Test: query 1000+ products filtered by category → < 50ms

12. **P2: Implement Order Idempotency** (M, 3 hours) - Tracking: R-05
    - Add `idempotency_key` column to `orders`
    - Generate client-side UUID before submission
    - `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING`

13. **P1: Add Pre-commit Hooks** (S, 30 min) - Tracking: T-03
    - Install husky: `npx husky-init`
    - Add `npm run typecheck && npm run lint` to `.husky/pre-commit`

14. **P2: Add Loading Skeletons** (M, 2 hours) - Tracking: U-01
    - Ensure `ProductSkeleton` shows while loading
    - Add `CartSkeleton`, `CheckoutSkeleton`
    - Test on slow 3G connection

15. **P1: Set Up Sentry Error Tracking** (M, 2 hours) - Tracking: R-03
    - Install `@sentry/react`
    - Configure in `main.tsx`
    - Integrate with ErrorBoundary

---

## EFFORT LEGEND
- **S (Small):** < 2 hours
- **M (Medium):** 2-8 hours
- **L (Large):** 1-3 days
- **XL (Extra Large):** > 3 days

## PRIORITY LEGEND
- **P0 (Critical):** Do immediately, blocks production
- **P1 (High):** Do within 1 week
- **P2 (Medium):** Do within 1 month
- **P3 (Low):** Nice to have, backlog

---

## Sprint Planning Suggestion

**Sprint 1 (Week 1):**
- Items #1-3 (Secrets, Stock Fix, Tests foundation)
- Items #4-5 (CORS, Rate Limiting)

**Sprint 2 (Week 2):**
- Items #6-7 (CI, Cleanup)
- Items #8-10 (Coupon expiry, Error boundaries, Image optimization)

**Sprint 3+ (Future):**
- Items #11-15
- Remaining 43 findings from full audit

---

## Tracking

Use this checklist to track progress. Mark items complete by replacing `[ ]` with `[x]`.

**Quick Wins (Completed):**
- [x] S-03: Crypto-secure idempotency keys
- [x] S-04: CORS restriction (square-payment only)
- [x] C-01: Cart stock limits (client-side)
- [x] S-09: Content Security Policy
- [x] P-01: Code-splitting (1MB → 408KB)
- [x] S-02: Security warnings in .env.example

**Backlog (Pending):**
- [ ] #1: Rotate Supabase secrets
- [ ] #2: Atomic stock deduction
- [ ] #3: Test coverage (40%)
- [ ] #4: CORS for all Edge Functions
- [ ] #5: Rate limiting
- [ ] #6: CI pipeline
- [ ] #7: Remove other/ directory
- [ ] #8: Coupon expiry validation
- [ ] #9: Error boundaries
- [ ] #10: WebP image optimization
- [ ] #11: Database indexes
- [ ] #12: Order idempotency
- [ ] #13: Pre-commit hooks
- [ ] #14: Loading skeletons
- [ ] #15: Sentry error tracking

---

For questions or to request changes to prioritization, contact the tech lead.

**Generated by:** Claude Code Security Audit
**Date:** 2026-04-04
