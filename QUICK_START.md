# 🚀 Quick Start Guide
## CoreForge E-Commerce Platform

**Updated**: April 9, 2026 with latest improvements

---

## ⚡ Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to: `http://localhost:5173`

---

## 🎯 What's New

### Recent Improvements (April 9, 2026)
- ✅ **Product Status System**: 75% sold out, 25% coming soon
- ✅ **Contact Form**: Secure contact at `/contact`
- ✅ **Ingredients Modal**: Click "View Ingredients" on product pages
- ✅ **Web3 Design**: Modern purple-pink gradients
- ✅ **Smooth Animations**: Professional polish throughout

See `IMPROVEMENTS_CHANGELOG.md` for full details.

---

## 📁 Project Structure

```
protein-main-new/
├── src/
│   ├── components/        # UI components
│   │   ├── customer/     # Customer-facing (NEW: IngredientsModal, StatusBadge)
│   │   ├── ui/           # Reusable UI
│   │   └── layout/       # Headers, footers
│   ├── pages/
│   │   ├── customer/     # Shop, Product, Cart (NEW: ContactPage)
│   │   └── admin/        # Dashboard, orders
│   ├── utils/            # Utilities (NEW: productStatus.ts)
│   └── data/             # Product data
├── public/
│   └── images/
│       └── products/     # All product images (NEW location)
├── docs/                 # All documentation (NEW folder)
└── supabase/            # Backend config
```

---

## 🔥 Key Features

### For Customers
1. **Browse Products**: `/shop`
2. **View Details**: Click any product
3. **Check Ingredients**: Click "View Full Ingredients" button
4. **Add to Cart**: Available products only
5. **Contact Support**: `/contact` form

### For Admins
1. **Login**: `/admin` (requires admin role)
2. **Manage Products**: Add/edit/delete
3. **View Orders**: Track all orders
4. **Analytics**: Sales dashboard

---

## 🎨 UI Features

### Web3-Style Design
- Purple-pink gradient overlays
- Smooth hover animations
- Modern card effects
- Professional polish

### Product Status
- "SOLD OUT" badge (red)
- "COMING SOON" badge (yellow)
- Disabled add-to-cart for unavailable items

### Ingredients Access
- Modal popup on product pages
- Full ingredient lists
- Allergen warnings
- Safety information

---

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run typecheck    # Check TypeScript
npm run lint         # Lint code
```

---

## 📚 Documentation

### Essential Reading
- `README.md` - Main project overview
- `IMPROVEMENTS_CHANGELOG.md` - Latest changes
- `docs/IMPROVEMENTS_SUMMARY_2026-04-09.md` - Detailed improvements
- `docs/INDEX.md` - Complete documentation index

### Setup Guides
- `docs/DEPLOYMENT.md` - Deploy to production
- `docs/SUPABASE_SETUP.md` - Backend setup

---

## 🔐 Environment Variables

Create `.env.local`:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## ✅ Verification

After starting the dev server, verify:

1. **Homepage loads**: `http://localhost:5173`
2. **Shop page works**: Click "Shop" in nav
3. **Product details**: Click any product
4. **Ingredients modal**: Click "View Full Ingredients"
5. **Contact form**: Navigate to `/contact`
6. **Status badges**: See "SOLD OUT" on some products

---

## 🐛 Troubleshooting

### Build Errors
```bash
rm -rf node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
npm run typecheck
```

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## 📞 Get Help

1. **Documentation**: Check `docs/INDEX.md`
2. **Improvements**: See `IMPROVEMENTS_CHANGELOG.md`
3. **Contact**: Use `/contact` form (when live)

---

## 🎯 Next Actions

### For Development
1. ✅ Run `npm run dev`
2. ✅ Open `http://localhost:5173`
3. ✅ Explore new features
4. ✅ Read `IMPROVEMENTS_CHANGELOG.md`

### For Deployment
1. Set up Supabase (see `docs/SUPABASE_SETUP.md`)
2. Configure environment variables
3. Run `npm run build`
4. Deploy to Vercel/Netlify (see `docs/DEPLOYMENT.md`)

---

**Status**: 🟢 Production Ready
**Build**: ✅ Passing (19.51s)
**TypeScript**: ✅ Zero Errors
**Version**: 2.0

Happy coding! 🚀
