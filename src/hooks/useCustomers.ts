import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { mockCustomers } from '../data/mockCommerceData';
import type { Customer } from '../types';

function mapCustomerRow(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    email: String(row.email ?? ''),
    first_name: String(row.first_name ?? ''),
    last_name: String(row.last_name ?? ''),
    phone: row.phone ? String(row.phone) : undefined,
    role: row.role === 'admin' || row.role === 'customer' ? row.role : undefined,
    accepts_marketing: Boolean(row.accepts_marketing),
    total_spent: Number(row.total_spent ?? 0),
    orders_count: Number(row.orders_count ?? 0),
    state: row.state === 'disabled' ? 'disabled' : 'enabled',
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    default_address: row.default_address as Customer['default_address'],
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        let list = [...mockCustomers];
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(
            (c) =>
              c.email.toLowerCase().includes(q) ||
              c.first_name.toLowerCase().includes(q) ||
              c.last_name.toLowerCase().includes(q)
          );
        }
        return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
      }

      let query = supabase.from('customers').select('*').order('created_at', { ascending: false });

      if (search) {
        query = query.or(
          `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data ?? []).map((row) => mapCustomerRow(row as Record<string, unknown>));
    },
  });
}
