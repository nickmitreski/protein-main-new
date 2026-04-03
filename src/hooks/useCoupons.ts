import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Coupon } from '../types';
import toast from 'react-hot-toast';

export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [] as Coupon[];
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, subtotal }: { code: string; subtotal: number }) => {
      if (!isSupabaseConfigured) {
        if (code.toUpperCase() === 'WELCOME10') {
          return { id: 'demo', code: 'WELCOME10', type: 'percentage' as const, value: 10, min_order_value: 0, used_count: 0, max_uses: null, is_active: true, expires_at: null, description: '10% off', created_at: '', updated_at: '' } as Coupon;
        }
        throw new Error('Invalid or expired coupon code.');
      }

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Invalid or expired coupon code.');

      const coupon = data as Coupon;

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error('This coupon has expired.');
      }

      if (
        typeof coupon.max_uses === 'number' &&
        coupon.used_count >= coupon.max_uses
      ) {
        throw new Error('This coupon has reached its usage limit.');
      }

      if (subtotal < coupon.min_order_value) {
        throw new Error(`Minimum order of $${coupon.min_order_value.toFixed(2)} required.`);
      }

      return coupon;
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>) => {
      if (!isSupabaseConfigured) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('coupons')
        .insert({ ...coupon, used_count: 0 })
        .select()
        .single();
      if (error) throw error;
      return data as Coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Coupon> }) => {
      if (!isSupabaseConfigured) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) throw new Error('Supabase not configured');
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function computeDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.type === 'percentage') {
    return Math.round((subtotal * coupon.value) / 100 * 100) / 100;
  }
  return Math.min(coupon.value, subtotal);
}
