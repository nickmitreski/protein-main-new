// Database Types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  long_description?: string | null;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku?: string;
  barcode?: string;
  image: string;
  images?: string[];
  category: string;
  tags?: string[];
  rating: number;
  review_count: number;
  badge?: 'Best Seller' | 'New' | 'Athlete Approved' | 'Sale';
  stock_quantity: number;
  track_inventory: boolean;
  continue_selling_when_out_of_stock: boolean;
  weight?: number;
  weight_unit?: 'g' | 'kg' | 'lb' | 'oz';
  requires_shipping: boolean;
  is_active: boolean;
  vendor?: string;
  product_type?: string;
  collections?: string[];
  /** Nutrition panel JSON from Supabase (e.g. servingSize, protein). */
  nutrition_facts?: Record<string, unknown> | null;
  ingredients?: string[] | null;
  usage_instructions?: string | null;
  warnings?: string | null;
  allergens?: string[] | null;
  benefits?: string[] | null;
  key_features?: string[] | null;
  flavor?: string | null;
  size?: string | null;
  servings?: number | null;
  weight_g?: number | null;
  created_at: string;
  updated_at: string;
}

// Order Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  /** Set when the buyer is logged in; null for guest checkout */
  customer_id: string | null;
  customer_email: string;
  customer_name: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shipping_address: Address;
  billing_address: Address;
  notes?: string;
  tags?: string[];
  /** Square payment ID returned by CreatePayment; set after successful charge */
  payment_reference_id?: string | null;
  tracking_number?: string | null;
  carrier?: string | null;
  shipped_at?: string | null;
  coupon_code?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  max_uses?: number | null;
  used_count: number;
  is_active: boolean;
  expires_at?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id?: string | null;
  customer_name: string;
  /** For guest reviews; used internally, not shown publicly until approved. */
  reviewer_email?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  source: string;
  discount_code?: string | null;
  accepts_marketing: boolean;
  created_at: string;
}

export interface AbandonedCart {
  id: string;
  session_id: string;
  customer_id?: string | null;
  customer_email?: string | null;
  items: CartItem[];
  subtotal: number;
  recovered: boolean;
  recovery_email_sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export interface Address {
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone?: string;
}

// Customer Types
export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'customer' | 'admin';
  accepts_marketing: boolean;
  total_spent: number;
  orders_count: number;
  state: 'enabled' | 'disabled';
  tags?: string[];
  notes?: string;
  default_address?: Address;
  created_at: string;
  updated_at: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Analytics Types
export interface SalesAnalytics {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  total_customers: number;
  sales_by_day: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  top_products: Array<{
    product_id: string;
    product_name: string;
    units_sold: number;
    revenue: number;
  }>;
  sales_by_category: Array<{
    category: string;
    sales: number;
    percentage: number;
  }>;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Filter Types
export interface ProductFilters {
  /** When true (admin), include inactive / draft products */
  includeInactive?: boolean;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
  tags?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating' | 'newest';
}

export interface OrderFilters {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  fulfillment_status?: FulfillmentStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Form Types
export interface CheckoutFormData {
  email: string;
  shipping_address: Address;
  billing_address: Address;
  same_as_shipping: boolean;
  payment_method: 'card' | 'paypal';
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku?: string;
  barcode?: string;
  category: string;
  tags?: string[];
  stock_quantity: number;
  track_inventory: boolean;
  continue_selling_when_out_of_stock: boolean;
  weight?: number;
  weight_unit?: 'g' | 'kg' | 'lb' | 'oz';
  requires_shipping: boolean;
  is_active: boolean;
  vendor?: string;
  product_type?: string;
}
