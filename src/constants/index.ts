// Catalog categories — `id` must match `product.category` in `src/data/products.ts` and Supabase `products.category`.
export const PRODUCT_CATEGORIES = [
  { id: 'Protein Powders', name: 'Protein Powders', icon: '💪' },
  { id: 'Pre-Workout', name: 'Pre-Workout', icon: '⚡' },
  { id: 'Creatine', name: 'Creatine', icon: '🔥' },
  { id: 'Recovery & Performance', name: 'Recovery & Performance', icon: '🔄' },
  { id: 'Stacks & Bundles', name: 'Stacks & Bundles', icon: '📦' },
  { id: 'Samples', name: 'Samples', icon: '🧪' },
] as const;

// Order Statuses
export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#FFA500' },
  { value: 'confirmed', label: 'Confirmed', color: '#4169E1' },
  { value: 'processing', label: 'Processing', color: '#9370DB' },
  { value: 'shipped', label: 'Shipped', color: '#1E90FF' },
  { value: 'delivered', label: 'Delivered', color: '#32CD32' },
  { value: 'cancelled', label: 'Cancelled', color: '#DC143C' },
  { value: 'refunded', label: 'Refunded', color: '#FF6347' },
] as const;

// Payment Statuses
export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#FFA500' },
  { value: 'paid', label: 'Paid', color: '#32CD32' },
  { value: 'failed', label: 'Failed', color: '#DC143C' },
  { value: 'refunded', label: 'Refunded', color: '#FF6347' },
  { value: 'partially_refunded', label: 'Partially Refunded', color: '#FFD700' },
] as const;

// Fulfillment Statuses
export const FULFILLMENT_STATUSES = [
  { value: 'unfulfilled', label: 'Unfulfilled', color: '#FFA500' },
  { value: 'partially_fulfilled', label: 'Partially Fulfilled', color: '#FFD700' },
  { value: 'fulfilled', label: 'Fulfilled', color: '#32CD32' },
  { value: 'cancelled', label: 'Cancelled', color: '#DC143C' },
] as const;

// Sort Options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'rating', label: 'Highest Rated' },
] as const;

// Tax Rate (10%)
export const TAX_RATE = 0.1;

// Shipping Rates
export const SHIPPING_RATES = {
  free: { min: 100, cost: 0, label: 'Free Shipping' },
  standard: { cost: 9.99, label: 'Standard Shipping (5-7 days)' },
  express: { cost: 19.99, label: 'Express Shipping (2-3 days)' },
  overnight: { cost: 29.99, label: 'Overnight Shipping (1 day)' },
} as const;

// Currency
export const CURRENCY = 'AUD';
export const CURRENCY_SYMBOL = '$';

// Pagination
export const ITEMS_PER_PAGE = 12;
export const ADMIN_ITEMS_PER_PAGE = 20;

// Image Upload
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Admin Navigation
export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin' },
  { id: 'orders', label: 'Orders', icon: 'ShoppingCart', path: '/admin/orders' },
  { id: 'products', label: 'Products', icon: 'Package', path: '/admin/products' },
  { id: 'customers', label: 'Customers', icon: 'Users', path: '/admin/customers' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/admin/analytics' },
  { id: 'payment-links', label: 'Payment links', icon: 'Link2', path: '/admin/payment-links' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/admin/settings' },
] as const;
