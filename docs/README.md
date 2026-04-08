# CoreForge - Premium Sports Nutrition E-Commerce Platform

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-ssbhju1p)

## Overview

CoreForge is a professional e-commerce platform specializing in premium sports nutrition supplements. Built with modern web technologies and designed for seamless deployment on Bolt.new with Supabase backend integration.

## Features

### Customer Experience
- **Comprehensive Product Catalog**: 33+ premium supplements across 7 categories
- **Advanced Filtering & Search**: Find products by category, price, rating, and more
- **Detailed Product Pages**: Complete nutritional information, ingredients, usage instructions
- **Smart Shopping Cart**: Persistent cart with quantity controls and discount codes
- **Secure Checkout**: Guest checkout; orders stored in Supabase; optional Square card capture
- **Track orders**: Order number + email (no shopper account required)
- **Product Reviews**: Verified customer reviews and ratings
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### Admin Dashboard
- **Product Management**: Full CRUD operations with inventory tracking
- **Order Management**: Process and fulfill orders with status tracking
- **Customer Management**: View customer profiles and purchase history
- **Analytics Dashboard**: Sales metrics, top products, and revenue charts
- **Inventory Alerts**: Low stock notifications
- **Bulk Operations**: Import/export products and orders

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **React Router DOM** - Client-side routing
- **React Hook Form + Zod** - Form validation
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **React Hot Toast** - Toast notifications
- **Recharts** - Analytics charts
- **Lucide React** - Icon library
- **date-fns** - Date formatting

### Backend
- **Supabase** - PostgreSQL database, authentication, storage, real-time
- **Square (optional)** - Card payments via Supabase Edge Function when configured

## Project Structure

```
protein-main/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   ├── layout/         # Layout components
│   │   ├── admin/          # Admin-specific components
│   │   └── customer/       # Customer-facing components
│   ├── pages/              # Page components
│   │   ├── customer/       # Customer pages
│   │   ├── admin/          # Admin pages
│   │   └── auth/           # Authentication pages
│   ├── data/               # Data and constants
│   │   └── products.ts     # Product catalog
│   ├── lib/                # Utility libraries
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── store/              # State management
│   ├── types/              # TypeScript types
│   └── constants/          # App constants
├── other/
│   └── supp-images/        # Product images (33 PNGs)
├── IMPLEMENTATION_PLAN.md  # Detailed implementation roadmap
├── SUPABASE_SETUP.md       # Complete Supabase setup guide
└── README.md               # This file
```

## Quick Start

**Deploying to GitHub or Bolt.new with an existing Supabase project:** see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Stripe account (for payments)
- Bolt.new account

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd protein-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Type Checking
```bash
npm run typecheck
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment to Bolt.new

### Step 1: Set up Supabase
Follow the comprehensive guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md):
- Create Supabase project
- Run database schema
- Configure authentication
- Set up storage buckets
- Enable Row Level Security (RLS)

### Step 2: Deploy to Bolt.new

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CoreForge e-commerce platform"
   git branch -M main
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Connect to Bolt.new**
   - Go to [Bolt.new](https://bolt.new)
   - Click "New Project" → "Import from GitHub"
   - Select your repository
   - Bolt.new will auto-detect Vite configuration

3. **Configure Environment Variables**
   In Bolt.new project settings:
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - Add `VITE_STRIPE_PUBLISHABLE_KEY` (if using Stripe)

4. **Configure Integrations**
   - **Supabase**: Connect your Supabase project in Bolt.new integrations
   - **Stripe**: Connect your Stripe account in Bolt.new integrations

5. **Deploy**
   - Bolt.new automatically builds and deploys
   - Your site will be live at `<your-project>.bolt.new`

## Product Catalog

CoreForge offers 33 premium products across 7 categories:

### Protein Powders (12 products)
- Whey Protein (multiple sizes/flavors)
- Whey Isolate
- Casein Protein
- Plant Protein
- Vegan Protein
- Meal Replacement
- Recovery Blends

### Pre-Workout (4 products)
- Standard Pre-Workout
- Advanced Pre-Workout
- Stimulant-Free Pump Matrix
- Hardcore Pre-Workout

### Creatine (2 products)
- Creatine Monohydrate 500g
- Creatine Trial Size 100g

### Recovery & Performance (5 products)
- BCAA Recovery
- Amino Energy Blend
- Thermogenic Fat Burner
- Collagen Protein
- Protein + Greens

### Stacks & Bundles (7 products)
- Starter Stack
- Performance Stack
- Strength Duo
- Ultimate Muscle Stack
- Lean Transformation Stack
- Elite Performance Stack
- Complete Transformation System

### Specialty Products
- Night Recovery Casein
- Lean Protein

### Samples (1 product)
- Protein Sample Sachet

## Configuration

### Supabase Setup
See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for complete database schema, RLS policies, storage setup, and authentication configuration.

### Stripe Integration
1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get API keys from Stripe dashboard
3. Add to Bolt.new environment variables
4. Webhook handling is configured in Supabase Edge Functions

### Admin Access
To create an admin user:
1. Sign up through the app
2. Run this SQL in Supabase:
   ```sql
   UPDATE customers
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

### Component Structure
```tsx
// Example component structure
export function ComponentName() {
  // 1. Hooks
  const [state, setState] = useState()
  const query = useQuery()

  // 2. Handlers
  const handleAction = () => {}

  // 3. Effects
  useEffect(() => {}, [])

  // 4. Render
  return (
    <div>...</div>
  )
}
```

### State Management
- **Global State**: Use Zustand for auth, cart, and user preferences
- **Server State**: Use React Query for API data
- **Local State**: Use useState for component-specific state
- **Form State**: Use React Hook Form with Zod validation

## Testing

### Manual Testing Checklist
- [ ] User can browse products
- [ ] User can search and filter products
- [ ] User can add products to cart
- [ ] User can proceed through checkout
- [ ] User can create account and login
- [ ] Admin can manage products
- [ ] Admin can view orders
- [ ] Admin can view analytics

## Performance Optimization

- Images are optimized and lazy-loaded
- Code splitting with React Router
- Proper caching with React Query
- Debounced search input
- Virtualized long lists
- Minified production builds

## Security

- Row Level Security (RLS) enforced in Supabase
- Environment variables for sensitive data
- HTTPS only in production
- Secure authentication with Supabase Auth
- Input validation with Zod
- XSS protection
- CSRF protection

## SEO

- Semantic HTML
- Meta tags on all pages
- Open Graph tags for social sharing
- Structured data for products
- Sitemap generation
- Robots.txt configuration

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Build Errors
- Ensure Node.js version is 18+
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project status
- Verify RLS policies are configured
- Check browser console for CORS errors

### Deployment Issues
- Verify all environment variables are set in Bolt.new
- Check build logs in Bolt.new dashboard
- Ensure Supabase URL is accessible publicly

## Support & Documentation

- **Implementation Plan**: See [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)
- **Supabase Setup**: See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
- **Bolt.new Docs**: [support.bolt.new](https://support.bolt.new)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **React Docs**: [react.dev](https://react.dev)

## Roadmap

### Phase 1 (Current)
- ✅ Product catalog with 33+ products
- ✅ Shopping cart and checkout
- ✅ Staff authentication (`/login` → `/admin`)
- ✅ Admin dashboard
- ✅ Supabase integration (products, orders, customers, settings)
- ✅ Guest checkout + optional Square
- ✅ Product reviews (registered + guest)
- ⏳ Wishlist

### Phase 2 (Planned)
- Email notifications
- Abandoned cart recovery
- Loyalty points system
- Product recommendations
- Blog/content section
- Advanced analytics
- Inventory forecasting

### Phase 3 (Future)
- Mobile app (React Native)
- Subscription management
- Affiliate program
- Multi-language support
- Multi-currency support

## Contributing

This is a proprietary project for CoreForge. Internal contributions welcome.

## License

Copyright © 2024 CoreForge. All rights reserved.

---

## Environment Variables Reference

See **`.env.example`** and **`DEPLOYMENT.md`** (GitHub / Bolt.new / Supabase).

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...   # or VITE_SUPABASE_PUBLISHABLE_KEY
# Optional: VITE_ADMIN_EMAILS, VITE_SQUARE_*, VITE_PEXELS_API_KEY
```

## Scripts Reference

```json
{
  "dev": "vite",                    // Start development server
  "build": "vite build",            // Build for production
  "preview": "vite preview",        // Preview production build
  "typecheck": "tsc --noEmit -p tsconfig.app.json",
  "lint": "eslint ."                // Lint code
}
```

## Contact

For support or inquiries, contact: support@coreforge.com

---

**Built with ❤️ by the CoreForge team**
