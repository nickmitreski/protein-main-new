import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Subscriber } from '../types';
import toast from 'react-hot-toast';

export function useSubscribers() {
  return useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [] as Subscriber[];
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Subscriber[];
    },
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, source }: { email: string; source?: string }) => {
      if (!isSupabaseConfigured) {
        return { email, discount_code: 'WELCOME10' };
      }
      const { data, error } = await supabase
        .from('subscribers')
        .insert({ email, source: source ?? 'website', discount_code: 'WELCOME10' })
        .select()
        .maybeSingle();
      if (error) {
        if (error.code === '23505') {
          return { email, discount_code: 'WELCOME10' };
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
