import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured } from '../lib/supabase';
import * as api from '../lib/api';
import type { Product, ProductFilters } from '../types';
import toast from 'react-hot-toast';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.getProducts(filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isSupabaseConfigured) {
        toast('Connect Supabase in .env to save products.', { icon: 'ℹ️' });
        throw new Error('Supabase not configured');
      }
      return api.createProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      if (error.message !== 'Supabase not configured') {
        toast.error(error.message || 'Failed to create product');
      }
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
    }) => {
      if (!isSupabaseConfigured) {
        toast('Connect Supabase in .env to save changes.', { icon: 'ℹ️' });
        throw new Error('Supabase not configured');
      }
      return api.updateProduct(id, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      if (error.message !== 'Supabase not configured') {
        toast.error(error.message || 'Failed to update product');
      }
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!isSupabaseConfigured) {
        toast('Connect Supabase in .env to delete products.', { icon: 'ℹ️' });
        throw new Error('Supabase not configured');
      }
      return api.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      if (error.message !== 'Supabase not configured') {
        toast.error(error.message || 'Failed to delete product');
      }
    },
  });
}
