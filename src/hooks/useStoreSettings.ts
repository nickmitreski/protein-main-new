import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface StoreSettings {
  store_name: string;
  contact_email: string;
  currency: string;
  tax_rate: number;
  free_shipping_threshold: number;
  standard_shipping_cost: number;
  express_shipping_cost: number;
  low_stock_threshold: number;
  fulfillment_address: {
    line1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

const DEFAULTS: StoreSettings = {
  store_name: 'CoreForge Nutrition',
  contact_email: 'hello@coreforge.com.au',
  currency: 'AUD',
  tax_rate: 0.1,
  free_shipping_threshold: 100,
  standard_shipping_cost: 9.99,
  express_shipping_cost: 19.99,
  low_stock_threshold: 10,
  fulfillment_address: { line1: '', city: '', state: '', postcode: '', country: 'Australia' },
};

export function useStoreSettings() {
  return useQuery({
    queryKey: ['store-settings'],
    queryFn: async (): Promise<StoreSettings> => {
      if (!isSupabaseConfigured) return DEFAULTS;

      const { data, error } = await supabase.from('store_settings').select('key, value');
      if (error) throw error;

      const settings = { ...DEFAULTS };
      for (const row of data ?? []) {
        const key = row.key as keyof StoreSettings;
        if (key in settings) {
          (settings as Record<string, unknown>)[key] = row.value;
        }
      }
      return settings;
    },
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<StoreSettings>) => {
      if (!isSupabaseConfigured) {
        toast('Connect Supabase to save settings.', { icon: 'ℹ️' });
        return;
      }
      const rows = Object.entries(updates).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? value : value,
        updated_at: new Date().toISOString(),
      }));

      for (const row of rows) {
        const { error } = await supabase
          .from('store_settings')
          .upsert(row, { onConflict: 'key' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Settings saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
