import { supabase, isSupabaseConfigured } from './supabase';
import type { Product, Order, Customer, Coupon, Review, OrderItem, ProductFilters, OrderFilters } from '../types';
import { getMockProducts, filterMockProducts } from '../data/mockCommerceData';

/**
 * Centralized API service layer
 * All data fetching goes through this module
 */

// ==================== PRODUCTS ====================

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return filterMockProducts(filters);
  }

  let query = supabase.from('products').select('*');

  if (!filters?.includeInactive) {
    query = query.eq('is_active', true);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters?.inStock) {
    query = query.gt('stock_quantity', 0);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('name', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('name', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Product[];
}

export async function getProduct(id: string): Promise<Product> {
  if (!isSupabaseConfigured) {
    const found = getMockProducts().find((p) => p.id === id);
    if (!found) throw new Error('Product not found');
    return found;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Product;
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
): Promise<Product> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ==================== ORDERS ====================

export async function getOrders(filters?: OrderFilters): Promise<Order[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  let query = supabase.from('orders').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.payment_status) {
    query = query.eq('payment_status', filters.payment_status);
  }

  if (filters?.fulfillment_status) {
    query = query.eq('fulfillment_status', filters.fulfillment_status);
  }

  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters?.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`
    );
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data as Order[];
}

export async function getOrder(id: string): Promise<Order> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Order;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error) throw error;
  return data as Order;
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function updateOrder(
  id: string,
  updates: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
): Promise<Order> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

// ==================== ORDER ITEMS ====================

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw error;
  return data as OrderItem[];
}

export async function createOrderItems(items: Omit<OrderItem, 'id' | 'created_at'>[]): Promise<OrderItem[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('order_items')
    .insert(items)
    .select();

  if (error) throw error;
  return data as OrderItem[];
}

// ==================== CUSTOMERS ====================

export async function getCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Customer[];
}

export async function getCustomer(id: string): Promise<Customer> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(
  id: string,
  updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
): Promise<Customer> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('customers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

// ==================== COUPONS ====================

export async function getCoupon(code: string): Promise<Coupon | null> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as Coupon;
}

// ==================== REVIEWS ====================

export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Review[];
}

export async function createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}
