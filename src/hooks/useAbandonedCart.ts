import { useEffect, useRef } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

function getSessionId(): string {
  let id = sessionStorage.getItem('cfg_session_id');
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('cfg_session_id', id);
  }
  return id;
}

export function useAbandonedCartTracker() {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const user = useAuthStore((s) => s.user);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (items.length === 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const sessionId = getSessionId();
      const cartItems = items.map(({ product, quantity }) => ({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        price: product.price,
        quantity,
      }));

      if (savedIdRef.current) {
        await supabase
          .from('abandoned_carts')
          .update({
            items: cartItems,
            subtotal: getSubtotal(),
            customer_id: user?.id ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', savedIdRef.current);
      } else {
        const { data } = await supabase
          .from('abandoned_carts')
          .insert({
            session_id: sessionId,
            customer_id: user?.id ?? null,
            customer_email: user?.email ?? null,
            items: cartItems,
            subtotal: getSubtotal(),
          })
          .select('id')
          .maybeSingle();
        if (data?.id) savedIdRef.current = data.id;
      }
    }, 30_000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, user, getSubtotal]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (items.length === 0 && savedIdRef.current) {
      supabase
        .from('abandoned_carts')
        .update({ recovered: true })
        .eq('id', savedIdRef.current);
      savedIdRef.current = null;
    }
  }, [items]);
}
