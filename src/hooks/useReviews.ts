import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Review } from '../types';
import toast from 'react-hot-toast';

export function useReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [] as Review[];
      const { data, error } = await supabase
        .from('reviews')
        .select(
          'id, product_id, customer_id, customer_name, rating, title, body, is_verified, is_approved, created_at'
        )
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!productId,
  });
}

export function useAllReviews() {
  return useQuery({
    queryKey: ['reviews-admin'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [] as Review[];
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      review: Pick<Review, 'product_id' | 'customer_name' | 'rating' | 'title' | 'body'> & {
        customer_id?: string | null;
        reviewer_email?: string | null;
      }
    ) => {
      if (!isSupabaseConfigured) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...review,
          customer_id: review.customer_id ?? null,
          reviewer_email: review.reviewer_email ?? null,
          is_approved: false,
          is_verified: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Review;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.product_id] });
      toast.success('Review submitted — it will appear after approval.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Review> }) => {
      if (!isSupabaseConfigured) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Review;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['reviews-admin'] });
      toast.success('Review updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
