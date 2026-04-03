# CoreForge E-Commerce Implementation Plan

## Project Overview
Transform the existing protein supplement site into a professional CoreForge e-commerce platform with 35+ products, integrated with Supabase for backend functionality and optimized for deployment on Bolt.new.

---

## Implementation Checklist

### ✅ Phase 1: Project Setup & Documentation
- [x] Create implementation plan document
- [ ] Create Supabase setup guide for Bolt.new integration
- [ ] Update README with CoreForge branding and setup instructions
- [ ] Document product catalog structure

### 🔧 Phase 2: Product Data & Images
- [ ] Update product data file with all 35 CoreForge products
- [ ] Integrate product images from `/other/supp-images/` directory
- [ ] Create product categories (Protein, Pre-Workout, Recovery, Stacks, etc.)
- [ ] Add comprehensive product descriptions and nutritional information
- [ ] Set up product variant system (flavors, sizes)

### 🎨 Phase 3: Frontend Enhancement - Customer Facing
- [ ] **HomePage Updates**
  - [ ] Update hero section with CoreForge branding
  - [ ] Add featured products carousel
  - [ ] Enhance value proposition sections
  - [ ] Add trust badges and certifications
  - [ ] Improve testimonials section
  - [ ] Add promotional banners

- [ ] **ShopPage Enhancement**
  - [ ] Create collapsible category sections for 35+ products
  - [ ] Add advanced filtering (category, price, rating)
  - [ ] Add sorting options (price, popularity, rating)
  - [ ] Implement search functionality
  - [ ] Add "Quick View" modal for products
  - [ ] Pagination or infinite scroll

- [ ] **ProductDetailPage Enhancement**
  - [ ] Add detailed product information tabs (Benefits, Ingredients, Usage, Reviews)
  - [ ] Add nutrition facts display
  - [ ] Add flavor/variant selector
  - [ ] Add quantity selector with bulk discounts
  - [ ] Add related products section
  - [ ] Add customer reviews and ratings
  - [ ] Add "Frequently Bought Together" section

- [ ] **CartPage Enhancement**
  - [ ] Add cart item quantity controls
  - [ ] Add discount code input
  - [ ] Add shipping calculator
  - [ ] Add cart persistence
  - [ ] Add "You May Also Like" section

- [ ] **CheckoutPage Enhancement**
  - [ ] Add multi-step checkout process
  - [ ] Add shipping address form
  - [ ] Add payment integration placeholder (Stripe)
  - [ ] Add order summary
  - [ ] Add order confirmation page

### 🛠️ Phase 4: Admin Dashboard Updates
- [ ] **ProductsPage (Admin)**
  - [ ] Update product management with CoreForge products
  - [ ] Add bulk product import/export
  - [ ] Add product image upload
  - [ ] Add inventory management
  - [ ] Add variant management

- [ ] **OrdersPage (Admin)**
  - [ ] Add order status management
  - [ ] Add order filtering and search
  - [ ] Add order export functionality
  - [ ] Add order fulfillment tracking

- [ ] **DashboardPage (Admin)**
  - [ ] Update analytics with CoreForge-specific metrics
  - [ ] Add revenue charts
  - [ ] Add top products widget
  - [ ] Add recent orders widget
  - [ ] Add inventory alerts

- [ ] **CustomersPage (Admin)**
  - [ ] Add customer segmentation
  - [ ] Add customer lifetime value tracking
  - [ ] Add customer export

### 🎯 Phase 5: UI/UX Professional Enhancements
- [ ] **Design System**
  - [ ] Define CoreForge brand colors and update design-system.ts
  - [ ] Add custom fonts (if needed)
  - [ ] Create consistent spacing and typography scale
  - [ ] Add animation library integration

- [ ] **Component Enhancements**
  - [ ] Add loading skeletons for all pages
  - [ ] Add smooth transitions between pages
  - [ ] Add hover effects on interactive elements
  - [ ] Add toast notifications for user actions
  - [ ] Add modal dialogs for confirmations
  - [ ] Add image zoom on product images

- [ ] **Header/Navigation**
  - [ ] Update with CoreForge logo
  - [ ] Add mega menu for categories
  - [ ] Add search bar in header
  - [ ] Add user account dropdown
  - [ ] Add cart preview dropdown

- [ ] **Footer**
  - [ ] Add company information
  - [ ] Add links to policies (Privacy, Terms, Shipping, Returns)
  - [ ] Add newsletter signup
  - [ ] Add social media links
  - [ ] Add payment method icons

- [ ] **Responsive Design**
  - [ ] Ensure mobile-first design
  - [ ] Test on tablet breakpoints
  - [ ] Test on desktop breakpoints
  - [ ] Add mobile menu

### 🗄️ Phase 6: Supabase Integration
- [ ] **Database Schema**
  - [ ] Create products table
  - [ ] Create orders table
  - [ ] Create order_items table
  - [ ] Create customers table (extends auth.users)
  - [ ] Create cart table
  - [ ] Create reviews table
  - [ ] Create inventory table

- [ ] **Authentication**
  - [ ] Set up Supabase Auth
  - [ ] Configure email/password authentication
  - [ ] Add social auth providers (optional)
  - [ ] Set up auth state management

- [ ] **File Storage**
  - [ ] Set up product images bucket
  - [ ] Configure image upload policies
  - [ ] Add image optimization

- [ ] **Row Level Security (RLS)**
  - [ ] Set up RLS policies for products (public read)
  - [ ] Set up RLS policies for orders (user-specific)
  - [ ] Set up RLS policies for cart (user-specific)
  - [ ] Set up RLS policies for admin tables

- [ ] **API Integration**
  - [ ] Create product CRUD operations
  - [ ] Create order CRUD operations
  - [ ] Create cart operations
  - [ ] Create review operations

### 📦 Phase 7: Additional Features
- [ ] Add wishlist functionality
- [ ] Add product comparison feature
- [ ] Add loyalty points system
- [ ] Add email notifications (order confirmation, shipping updates)
- [ ] Add abandoned cart recovery
- [ ] Add product recommendations engine
- [ ] Add blog/content section for SEO
- [ ] Add FAQ section
- [ ] Add live chat widget integration

### 🧪 Phase 8: Testing & Optimization
- [ ] Test all user flows (browse, search, add to cart, checkout)
- [ ] Test admin functionality
- [ ] Test authentication flows
- [ ] Test responsive design on multiple devices
- [ ] Optimize images for web
- [ ] Add SEO meta tags
- [ ] Add Open Graph tags for social sharing
- [ ] Performance audit with Lighthouse
- [ ] Accessibility audit

### 🚀 Phase 9: Deployment Preparation
- [ ] Ensure all environment variables are documented
- [ ] Create deployment guide for Bolt.new
- [ ] Test build process (`npm run build`)
- [ ] Verify all Supabase connections work in production
- [ ] Set up error tracking (optional)
- [ ] Set up analytics (Google Analytics, etc.)

---

## Product Categories

### 1. **Protein Powders** (10 products)
- Whey Protein (multiple sizes and flavors)
- Whey Isolate
- Casein Protein
- Plant Protein
- Vegan Protein Blend
- Meal Replacement
- Recovery Protein Blend

### 2. **Pre-Workout** (4 products)
- Pre-Workout 30 Serves
- Advanced Pre-Workout 60 Serves
- Pump Matrix Pre-Workout
- Hardcore Pre-Workout

### 3. **Creatine** (2 products)
- Creatine Monohydrate 500g
- Creatine 100g (trial size)

### 4. **Recovery & Performance** (5 products)
- BCAA Recovery
- Amino Energy Blend
- Thermogenic Fat Burner
- Thermogenic Complex
- Collagen Protein Blend

### 5. **Stacks & Bundles** (7 products)
- Starter Stack
- Performance Stack Bundle
- Strength Duo
- Ultimate Muscle Stack
- Lean Transformation Stack
- Elite Performance Stack
- Complete Transformation System

### 6. **Specialty Products** (3 products)
- Protein + Greens Blend
- Lean Protein
- Night Recovery Casein

### 7. **Samples** (1 product)
- Protein Sample Sachet

---

## Technical Stack (Must Remain Compatible with Bolt.new)

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router DOM** for navigation
- **TailwindCSS** for styling
- **Lucide React** for icons
- **React Hook Form + Zod** for form validation
- **React Query** for data fetching
- **Zustand** for state management
- **React Hot Toast** for notifications
- **Recharts** for analytics charts
- **date-fns** for date formatting

### Backend
- **Supabase** for:
  - PostgreSQL database
  - Authentication
  - File storage
  - Real-time subscriptions
  - Row Level Security

### Third-Party Integrations
- **Stripe** for payment processing (via Bolt.new integration)

---

## Design Principles

1. **Professional & Trustworthy**: Clean design that builds confidence
2. **Performance-Focused**: Fast loading, optimized images
3. **Mobile-First**: Excellent experience on all devices
4. **Conversion-Optimized**: Clear CTAs, easy checkout process
5. **Accessible**: WCAG 2.1 AA compliant
6. **SEO-Friendly**: Proper meta tags, semantic HTML
7. **Brand Consistency**: CoreForge identity throughout

---

## Key Features to Implement

### Customer Experience
- ✅ Browse 35+ products across 7 categories
- ✅ Advanced search and filtering
- ✅ Detailed product pages with full nutritional info
- ✅ Shopping cart with persistence
- ✅ Secure checkout process
- ✅ User account management
- ✅ Order history and tracking
- ✅ Product reviews and ratings
- ✅ Wishlist functionality

### Admin Experience
- ✅ Product management (CRUD)
- ✅ Order management and fulfillment
- ✅ Customer management
- ✅ Analytics dashboard
- ✅ Inventory tracking
- ✅ Sales reports

---

## Environment Variables Required

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (if using)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

---

## Next Steps

1. ✅ Review this plan
2. ⏳ Create Supabase setup guide
3. ⏳ Begin Phase 2: Product data updates
4. ⏳ Continue through phases sequentially

---

## Notes
- All product images are located in `/other/supp-images/`
- Product codes follow CFG-XXX format
- Prices range from $5 (sample) to $399 (complete system)
- 2 products (CFG-019, CFG-025) have no images yet - use placeholder
- Keep all changes compatible with Bolt.new deployment workflow
