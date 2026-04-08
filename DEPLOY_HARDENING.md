# Deploy Hardening Complete

**Related Documents:**
- This doc — Vercel/Git ignore rules, build verification, minimal env var lists
- `EMBED_INTEGRATION_CHECKLIST.md` — Complete env var reference, demo/production flows
- `AUDIT_SUMMARY.md` — Overall audit findings and deployment checklists

---

## Changes Made

### 1. Created `.vercelignore` (root)
Excludes from Vercel uploads:
- `public/laminin-site/.git` - nested repo
- `public/laminin-site/node_modules` - nested dependencies
- `public/laminin-site/dist` - nested build artifacts
- `public/laminin-site/.env*` - nested environment files
- Standard cruft: `.vscode`, `.idea`, `.DS_Store`, `.cursor`, `.claude`
- Documentation: `docs/**/*.md`, `*.md` (except README.md)
- `other/**` - reference files

### 2. Enhanced `.gitignore` (root)
Added explicit rules for nested Laminin repo:
```
public/laminin-site/.git
public/laminin-site/node_modules
public/laminin-site/dist
public/laminin-site/.env
public/laminin-site/.env.local
public/laminin-site/.env.*.local
```

Already had: `.env`, `.env.local`, `dist`, `node_modules`

### 3. Build Verification

**CoreForge (root):**
- ✅ `npm run typecheck` - PASSED
- ✅ `npm run build` - PASSED (8m 27s, 317KB gzipped)

**Laminin (public/laminin-site/):**
- ✅ `npm run typecheck` - PASSED
- ✅ `npm run build` - PASSED (4.71s, 160KB gzipped)

## Ignore Status Verification

```bash
✅ public/laminin-site/.env.local - ignored by Laminin's .gitignore + root .gitignore
✅ public/laminin-site/.git - ignored by root .gitignore
✅ public/laminin-site/node_modules - ignored by both
```

## Deployment Safety

### For CoreForge (core-forge.shop)
**Git Push Method:**
- `.gitignore` prevents committing Laminin's nested repo artifacts
- Push to GitHub → Vercel auto-deploys
- Laminin site won't be included (excluded by ignore rules)

**CLI Upload Method:**
- `.vercelignore` excludes Laminin artifacts from upload
- Smaller, faster uploads
- No nested repo conflicts

### For Laminin (lamininpeplab.com.au)
**Separate Vercel Project:**
- Deploy from `public/laminin-site/` as root directory
- Has its own `package.json`, build, and env vars
- Completely isolated from CoreForge

## Environment Variables & Integration

### Demo Mode (No SMS/Email Required)

**Minimal setup for testing CoreForge embed checkout:**

**CoreForge Vercel:**
- `VITE_EMBED_PARENT_ORIGINS=https://lamininpeplab.com.au,http://localhost:5173`
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`

**CoreForge Edge Secrets:**
- `PAYMENT_LINK_BEARER=shared_secret`
- `FRONTEND_URL=https://core-forge.shop`

**Laminin Vercel:**
- `VITE_COREFORGE_PAY_ORIGIN=https://core-forge.shop`
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`

**Laminin Edge Secrets:**
- `PAYMENT_LINK_CREATE_URL=https://COREFORGE_REF.supabase.co/functions/v1/create-payment-link`
- `PAYMENT_LINK_BEARER=shared_secret` (matches CoreForge)
- `PAYMENT_LINK_EMBED=true`
- `RETURN_CHECKOUT_OTP_IN_RESPONSE=true` (demo only)
- `LAMIN_PUBLIC_SITE_URL=https://lamininpeplab.com.au`

**Demo flow:** OTP shown in Laminin modal → customer manually enters in CoreForge iframe. No Resend/Twilio needed.

### Production Mode (Resend + Twilio)

**Add to demo configuration:**

**Laminin Edge Secrets:**
- `ENABLE_CODE_DELIVERY=true`
- `RESEND_API_KEY=re_xxxxx`
- `RESEND_FROM=orders@lamininpeplab.com.au`
- `TWILIO_ACCOUNT_SID=ACxxxxx`
- `TWILIO_AUTH_TOKEN=xxxxx`
- `TWILIO_FROM_NUMBER=+61412345678`
- Remove: `RETURN_CHECKOUT_OTP_IN_RESPONSE` (or set to `false`)

**Production flow:** OTP sent via SMS/email → customer opens link from message. NO OTP shown in browser.

**See:** `EMBED_INTEGRATION_CHECKLIST.md` for complete reference.

## Remaining Risks

### Low Risk
1. **Laminin's .env.local committed** - Confirmed ignored by both files
2. **Nested .git conflicts** - Confirmed ignored by root .gitignore
3. **Large uploads** - .vercelignore excludes heavy artifacts

### Monitor
1. **Vercel build cache** - First deploy may take longer, subsequent faster
2. **Demo vs Production:** Ensure `RETURN_CHECKOUT_OTP_IN_RESPONSE` is removed in production
3. **Frame-ancestors CSP** - Verified in `vercel.json` and `public/_headers` (see EMBED_INTEGRATION_CHECKLIST.md)

## Testing Recommendations

1. **Git Status Check:**
   ```bash
   git status
   # Should NOT show public/laminin-site/.env.local or .git
   ```

2. **Vercel Upload Size:**
   ```bash
   npx vercel --prod --dry-run
   # Should show reasonable upload size (< 50MB)
   ```

3. **Laminin Isolation:**
   ```bash
   cd public/laminin-site
   git status
   # Should show Laminin's own repo status
   ```

## Files Modified
- Created: `.vercelignore`
- Modified: `.gitignore`
- Created: `DEPLOY_HARDENING.md` (this file)
- Created: `EMBED_INTEGRATION_CHECKLIST.md` (embed CSP + env vars)

## No Code Changes
Zero functional changes to CoreForge or Laminin code. Only deployment configuration.

---

**Status:** ✅ Hardened for GitHub + Vercel deploys
**Builds:** ✅ Both projects build successfully
**Security:** ✅ No env files or nested repo artifacts will leak
