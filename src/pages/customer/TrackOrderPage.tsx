import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { colors, spacing, typography } from '../../utils/design-system';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { OrderDisplayCard } from '../../components/customer/OrderDisplayCard';
import { isSupabaseConfigured } from '../../lib/supabase';
import { lookupGuestOrder, type GuestOrderLookupResult } from '../../hooks/useOrders';
import type { Order } from '../../types';

const LAST_ORDER_KEY = 'coreforge_last_order';

function normalizeOrderNumber(raw: string): string {
  return raw.trim().replace(/^#/, '');
}

function trySessionStorageMatch(orderNumber: string, email: string): Order | null {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Order;
    if (!o?.order_number || !o?.customer_email) return null;
    if (normalizeOrderNumber(o.order_number) !== normalizeOrderNumber(orderNumber)) return null;
    if (o.customer_email.trim().toLowerCase() !== email.trim().toLowerCase()) return null;
    return o;
  } catch {
    return null;
  }
}

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(() => searchParams.get('order') ?? '');
  const [email, setEmail] = useState(() => searchParams.get('email') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GuestOrderLookupResult | null>(null);
  const [localOnlyOrder, setLocalOnlyOrder] = useState<Order | null>(null);

  useEffect(() => {
    const o = searchParams.get('order');
    const em = searchParams.get('email');
    if (o != null) setOrderNumber(o);
    if (em != null) setEmail(em);
  }, [searchParams]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLocalOnlyOrder(null);

    const on = normalizeOrderNumber(orderNumber);
    const em = email.trim();
    if (!on || !em) {
      setError('Enter the order number from your confirmation email and the email you used at checkout.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const data = await lookupGuestOrder(on, em);
        if (data) {
          setResult(data);
          return;
        }
      }

      const local = trySessionStorageMatch(on, em);
      if (local) {
        setLocalOnlyOrder(local);
        if (!isSupabaseConfigured) {
          setError(null);
          return;
        }
        setError(
          'Order not found in the database yet, but we found this purchase in your browser from your last checkout on this device. Connect Supabase and run migrations for full lookup from any device.'
        );
        return;
      }

      setError(
        'No order matches that number and email. Check for typos, or use the exact order number (e.g. CFG-01001) from your confirmation.'
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${spacing.container} py-16 max-w-3xl`}>
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: colors.gray500 }}>
          Orders
        </p>
        <h1 className={`${typography.h2} mb-2`} style={{ color: colors.black }}>
          Track your order
        </h1>
        <p className="text-sm max-w-xl" style={{ color: colors.gray500 }}>
          No account needed. Enter the <strong style={{ color: colors.black }}>order number</strong> and{' '}
          <strong style={{ color: colors.black }}>email</strong> from checkout — the same details you used when you
          paid. Your order has a unique ID stored with your order number.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 mb-10 max-w-md">
        <Input
          label="Order number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. CFG-01042"
          required
          autoComplete="off"
        />
        <Input
          type="email"
          label="Email (checkout email)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Button type="submit" isLoading={loading}>
          Look up order
        </Button>
        {error && (
          <p className="text-sm border p-3" style={{ borderColor: colors.lightGrey, color: colors.gray600 }}>
            {error}
          </p>
        )}
      </form>

      {result && (
        <div className="space-y-4">
          <OrderDisplayCard order={result.order} inlineItems={result.items} />
        </div>
      )}

      {localOnlyOrder && !result && (
        <div className="space-y-4">
          <p className="text-xs" style={{ color: colors.gray500 }}>
            Summary from this browser only (line items not loaded).
          </p>
          <OrderDisplayCard order={localOnlyOrder} inlineItems={[]} />
        </div>
      )}

      {!result && !localOnlyOrder && !error && (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed" style={{ borderColor: colors.lightGrey }}>
          <Package size={40} style={{ color: colors.gray400 }} className="mb-4" />
          <p className="text-sm text-center max-w-sm" style={{ color: colors.gray500 }}>
            After you place an order, you’ll get a confirmation with your order number. Use that and your email here
            anytime — no password.
          </p>
        </div>
      )}
    </div>
  );
}
