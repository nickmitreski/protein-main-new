import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { filterMockOrders, mockOrders } from '../data/mockCommerceData';
import type { Order, OrderFilters, OrderItem } from '../types';
import toast from 'react-hot-toast';

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return filterMockOrders(filters);
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
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        const found = mockOrders.find((o) => o.id === id);
        if (!found) throw new Error('Order not found');
        return found;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!id,
  });
}

export function useOrderItems(orderId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false && !!orderId;
  return useQuery({
    queryKey: ['order-items', orderId],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return [] as OrderItem[];
      }

      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data as OrderItem[];
    },
    enabled,
  });
}

export type GuestOrderLookupResult = { order: Order; items: OrderItem[] };

/** Match order_number + customer_email without auth (uses RPC). */
export async function lookupGuestOrder(orderNumber: string, email: string): Promise<GuestOrderLookupResult | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.rpc('lookup_guest_order', {
    p_order_number: orderNumber.trim(),
    p_email: email.trim(),
  });

  if (error) throw error;
  if (data == null || typeof data !== 'object') return null;

  const payload = data as { order?: Order; items?: OrderItem[] };
  if (!payload.order?.id || !payload.order?.order_number) return null;

  return {
    order: payload.order as Order,
    items: Array.isArray(payload.items) ? (payload.items as OrderItem[]) : [],
  };
}

export type CheckoutOrderPayload = Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_number'>;

export type CheckoutLinePayload = Pick<
  OrderItem,
  'product_id' | 'product_name' | 'product_image' | 'sku' | 'quantity' | 'price' | 'total'
>;

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      order,
      items,
    }: {
      order: CheckoutOrderPayload;
      items: CheckoutLinePayload[];
    }) => {
      if (!isSupabaseConfigured) {
        toast('Connect Supabase in .env to place orders.', { icon: 'ℹ️' });
        throw new Error('Supabase not configured');
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: order.customer_id,
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          status: order.status,
          payment_status: order.payment_status,
          fulfillment_status: order.fulfillment_status,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          discount: order.discount,
          total: order.total,
          currency: order.currency,
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          notes: order.notes ?? null,
          tags: order.tags ?? null,
          coupon_code: order.coupon_code ?? null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        sku: item.sku ?? null,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      return orderData as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      if (error.message !== 'Supabase not configured') {
        toast.error(error.message || 'Failed to create order');
      }
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;
    }) => {
      if (!isSupabaseConfigured) {
        toast('Connect Supabase in .env to update orders.', { icon: 'ℹ️' });
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
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      toast.success('Order updated successfully');
    },
    onError: (error: Error) => {
      if (error.message !== 'Supabase not configured') {
        toast.error(error.message || 'Failed to update order');
      }
    },
  });
}
