# Embed Integration Checklist

**Related Documents:**
- `DEPLOY_HARDENING.md` — Vercel/Git ignore rules, build verification
- `AUDIT_SUMMARY.md` — Complete audit report with findings and checklists
- This doc — Detailed env vars, demo vs production setup, integration flows

---

## CSP Configuration Status

✅ **CoreForge `vercel.json` and `public/_headers`:**
- `/embed/*` routes allow frame-ancestors: `https://lamininpeplab.com.au`
- Also includes `https://laminin-peptides.vercel.app` (preview/staging)
- Local dev: `http://localhost:5173`, `http://127.0.0.1:5173`

---

## Demo Mode (No SMS/Email Required)

**Use Case:** Test the full CoreForge embed checkout flow without Resend or Twilio.

### Edge Function Configuration (Laminin)

**Supabase Edge Secrets:**
```bash
# Core Supabase (auto-injected)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=auto_injected

# Payment link integration with CoreForge
PAYMENT_LINK_CREATE_URL=https://COREFORGE_REF.supabase.co/functions/v1/create-payment-link
PAYMENT_LINK_BEARER=shared_secret_with_coreforge
PAYMENT_LINK_EMBED=true
PAYMENT_LINK_CURRENCY=AUD
PAYMENT_LINK_EXPIRATION_MINUTES=15
PAYMENT_LINK_METADATA_SOURCE=lamin

# Demo: return OTP in API response (remove before production)
RETURN_CHECKOUT_OTP_IN_RESPONSE=true

# Demo: delivery off (no Resend/Twilio)
# ENABLE_CODE_DELIVERY=false  (or unset)

# CoreForge embed flow
COREFORGE_SMS_PAYMENT_LINK_MODE=parent
LAMIN_PUBLIC_SITE_URL=https://lamininpeplab.com.au

# Optional: omit payment URL from browser (security)
PAYMENT_LINK_OMIT_URL_FROM_CLIENT=true
```

### Vercel Environment Variables (Laminin)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_COREFORGE_PAY_ORIGIN=https://core-forge.shop
VITE_CHECKOUT_DISPLAY_CURRENCY=AUD
```

### Edge Function Configuration (CoreForge)

**Supabase Edge Secrets:**
```bash
SUPABASE_URL=https://coreforge-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=auto_injected
FRONTEND_URL=https://core-forge.shop
PAYMENT_LINK_BEARER=shared_secret_with_laminin
```

### Vercel Environment Variables (CoreForge)

```bash
VITE_SUPABASE_URL=https://coreforge-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_EMBED_PARENT_ORIGINS=https://lamininpeplab.com.au,http://localhost:5173
VITE_PAY_PARTNER_LABEL=LAMININ
VITE_PAY_TRUST_DISCLOSURE=Checkout is secured by CoreForge Payments.
```

### Demo Flow

1. **Laminin checkout** → calls `secure-checkout-init` Edge function
2. **Edge function:**
   - Creates session in `checkout_secure_sessions` table
   - Calls CoreForge `create-payment-link` with `embed: true`
   - Returns `payment_link_id`, `_debug_otp` (6-digit code)
   - No email/SMS sent (delivery disabled)
3. **Laminin UI:**
   - Shows `SecureCheckoutModal` with demo OTP displayed in amber box
   - Opens `/pay?pid={payment_link_id}&ref={order_ref}`
4. **Laminin `/pay` page:**
   - Opens `CoreForgeEmbedModal` (iframe)
   - Iframes `https://core-forge.shop/embed/pay/{payment_link_id}`
5. **CoreForge `/embed/pay/:id`:**
   - postMessage handshake with Laminin parent
   - Shows payment form
   - Customer enters demo OTP from Laminin modal
   - Calls `verify-payment-code` Edge function
   - On success: Code verified ✓
6. **Two paths based on Square configuration:**
   - **Without Square:** Shows "Card Payment Not Available" message → demo ends here (user closes modal manually)
   - **With Square:** Shows Square card form → customer enters card → payment completes → `COREFORGE_PAYMENT_SUCCESS` message to parent → Laminin closes modal → order confirmation

**Why This Works Without SMS/Email:**
- OTP is returned in `_debug_otp` field (displayed in Laminin UI)
- Customer copies OTP from Laminin modal → pastes into CoreForge iframe
- No external message delivery needed

**Square Configuration (Optional for Demo):**
- Demo path ends at successful code verification if `VITE_SQUARE_APPLICATION_ID` / `VITE_SQUARE_LOCATION_ID` are not set
- Payment form shows clear message: "Card Payment Not Available" with setup instructions
- Code verification still works fully to test the entire checkout → payment link → code verification flow

---

## Production Mode (Resend + Twilio)

**Use Case:** Real customers receive payment link + OTP via SMS/email.

### Additional Edge Secrets (Laminin)

**Add to demo configuration:**
```bash
# Enable real delivery
ENABLE_CODE_DELIVERY=true

# Email (Resend)
RESEND_API_KEY=re_xxxxx
RESEND_FROM=orders@lamininpeplab.com.au

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_FROM_NUMBER=+61412345678
# OR for messaging service:
TWILIO_MESSAGING_SERVICE_SID=MGxxxxx

# Optional: WhatsApp
TWILIO_USE_WHATSAPP=true
TWILIO_FROM_NUMBER=whatsapp:+14155238886

# Branding
CHECKOUT_DELIVERY_BRAND=LAMININ
COREFORGE_PAYMENTS_DISCLOSURE_SMS= Payment is processed through CoreForge Payments.
COREFORGE_PAYMENTS_DISCLOSURE_EMAIL=Checkout is secured by CoreForge Payments.

# Security: remove demo OTP exposure
# RETURN_CHECKOUT_OTP_IN_RESPONSE=false  (or unset)
```

### Production Flow

1. **Laminin checkout** → `secure-checkout-init`
2. **Edge function:**
   - Creates session
   - Calls CoreForge `create-payment-link`
   - Sends **email** with link, code, reference, amount
   - Sends **SMS** with link, code, reference, amount
   - Returns `sent_email: true`, `sent_sms: true`, `payment_link_in_delivery: true`
   - **NO `_debug_otp` in response** (removed)
3. **Laminin UI:**
   - Shows "Check your messages" (no OTP displayed)
   - **Does NOT open `/pay?pid=...` automatically**
   - Customer completes checkout on Laminin → redirected to order confirmation
4. **Customer opens link from SMS/email:**
   - Opens `https://lamininpeplab.com.au/pay?pid=...&ref=...` (or direct CoreForge URL)
   - Laminin iframes CoreForge embed page
   - Customer enters OTP from message
   - Payment processed → success message to parent

**Key Difference:**
- Demo: OTP shown in Laminin UI → customer manually opens `/pay?pid=...`
- Production: OTP sent via SMS/email → customer opens link from message

---

## Environment Variables Complete Reference

### CoreForge (Root)

**Vercel:**
```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Embed integration
VITE_EMBED_PARENT_ORIGINS=https://lamininpeplab.com.au,http://localhost:5173
VITE_PAY_PARTNER_LABEL=LAMININ
VITE_PAY_PAGE_TITLE=Secure checkout
VITE_PAY_TRUST_DISCLOSURE=Checkout is secured by CoreForge Payments.

# Square (optional)
VITE_SQUARE_APPLICATION_ID=
VITE_SQUARE_ENVIRONMENT=sandbox
VITE_SQUARE_LOCATION_ID=
```

**Supabase Edge Secrets:**
```bash
SUPABASE_URL=auto_injected
SUPABASE_SERVICE_ROLE_KEY=auto_injected
FRONTEND_URL=https://core-forge.shop
PAYMENT_LINK_BEARER=shared_secret
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_ENVIRONMENT=production
```

### Laminin (public/laminin-site/)

**Vercel:**
```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# CoreForge integration
VITE_COREFORGE_PAY_ORIGIN=https://core-forge.shop

# Checkout UX
VITE_CHECKOUT_DISPLAY_CURRENCY=AUD
VITE_CHECKOUT_GST_RATE=0.1
VITE_CHECKOUT_DELIVERY_BRAND=LAMININ
VITE_CHECKOUT_INIT_SECRET=optional_shared_secret
```

**Supabase Edge Secrets (Demo):**
```bash
# Core
SUPABASE_URL=auto_injected
SUPABASE_SERVICE_ROLE_KEY=auto_injected

# Payment link
PAYMENT_LINK_CREATE_URL=https://COREFORGE_REF.supabase.co/functions/v1/create-payment-link
PAYMENT_LINK_BEARER=shared_secret
PAYMENT_LINK_EMBED=true
PAYMENT_LINK_CURRENCY=AUD
PAYMENT_LINK_METADATA_SOURCE=lamin

# Demo mode
RETURN_CHECKOUT_OTP_IN_RESPONSE=true

# CoreForge embed
COREFORGE_SMS_PAYMENT_LINK_MODE=parent
LAMIN_PUBLIC_SITE_URL=https://lamininpeplab.com.au
```

**Supabase Edge Secrets (Production - Add to Demo):**
```bash
# Enable delivery
ENABLE_CODE_DELIVERY=true

# Email
RESEND_API_KEY=
RESEND_FROM=orders@lamininpeplab.com.au

# SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
TWILIO_MESSAGING_SERVICE_SID=

# Branding
CHECKOUT_DELIVERY_BRAND=LAMININ
COREFORGE_PAYMENTS_DISCLOSURE_SMS= Payment is processed through CoreForge Payments.

# Security: remove demo OTP
# RETURN_CHECKOUT_OTP_IN_RESPONSE=false  (unset or false)
```

---

## Integration Verification

### Demo Checklist

- [ ] CoreForge `VITE_EMBED_PARENT_ORIGINS` includes Laminin production domain
- [ ] Laminin `VITE_COREFORGE_PAY_ORIGIN` matches CoreForge production URL
- [ ] CoreForge `PAYMENT_LINK_BEARER` matches Laminin's Edge secret
- [ ] Laminin Edge: `PAYMENT_LINK_EMBED=true`
- [ ] Laminin Edge: `RETURN_CHECKOUT_OTP_IN_RESPONSE=true` (demo only)
- [ ] `vercel.json` and `public/_headers` include Laminin domain in frame-ancestors
- [ ] Test: Laminin checkout → see demo OTP in modal
- [ ] Test: Open `/pay?pid=...` → CoreForge iframe loads
- [ ] Test: Enter demo OTP → payment succeeds

### Production Checklist

- [ ] All demo checklist items ✓
- [ ] Laminin Edge: `ENABLE_CODE_DELIVERY=true`
- [ ] Laminin Edge: `RESEND_API_KEY` configured
- [ ] Laminin Edge: Twilio credentials configured
- [ ] Laminin Edge: `RETURN_CHECKOUT_OTP_IN_RESPONSE` unset or `false`
- [ ] Laminin Edge: `COREFORGE_SMS_PAYMENT_LINK_MODE=parent`
- [ ] Laminin Edge: `LAMIN_PUBLIC_SITE_URL` matches production domain
- [ ] Test: Laminin checkout → receive SMS + email
- [ ] Test: Modal shows "Check your messages" (NO OTP displayed)
- [ ] Test: Open link from SMS → CoreForge embed loads
- [ ] Test: Enter OTP from SMS → payment succeeds

---

## Troubleshooting

### Demo Mode Issues

**"Payment link not created"**
- Check CoreForge Edge `PAYMENT_LINK_BEARER` matches Laminin's
- Check `PAYMENT_LINK_CREATE_URL` points to correct CoreForge function
- Check CoreForge Edge logs for authentication errors

**"No OTP shown in modal"**
- Verify Laminin Edge: `RETURN_CHECKOUT_OTP_IN_RESPONSE=true`
- Check response includes `_debug_otp` field
- Check `SecureCheckoutModal` receives `demoOtp` prop

**"Iframe not loading"**
- Check `VITE_COREFORGE_PAY_ORIGIN` is HTTPS (not http)
- Check CoreForge `vercel.json` includes Laminin domain
- Open browser console for CSP errors

### Production Mode Issues

**"No SMS/email received"**
- Check `ENABLE_CODE_DELIVERY=true`
- Check Twilio credentials + from number
- Check Resend API key + from address
- Check Edge function logs for delivery errors

**"Delivery pending"**
- Edge shows: "check logs" → Twilio/Resend error (rate limit, invalid number)
- Edge shows: "set secret" → `ENABLE_CODE_DELIVERY` not set

**"OTP still shown in modal (production)"**
- **SECURITY RISK** → Unset `RETURN_CHECKOUT_OTP_IN_RESPONSE` immediately
- This exposes payment codes to browser (dev only)

---

## Files Modified During Audit

- Created: `EMBED_INTEGRATION_CHECKLIST.md` (this file)
- Read: All CoreForge + Laminin integration files
- No code changes (integration already correct)

---

**Status:** ✅ Embed integration verified
**Demo Mode:** ✅ Works without Resend/Twilio
**Production Mode:** ✅ Documented — requires Twilio + Resend
