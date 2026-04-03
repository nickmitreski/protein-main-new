import { useEffect, useMemo } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../utils/design-system';
import { CURRENCY_SYMBOL } from '../../constants';
import type { Order } from '../../types';

const STORAGE_KEY = 'coreforge_last_order';

function isOrder(x: unknown): x is Order {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.order_number === 'string' && typeof o.total === 'number';
}

export function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromNav = location.state?.order;

  useEffect(() => {
    if (isOrder(fromNav)) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromNav));
      } catch {
        /* ignore */
      }
    }
  }, [fromNav]);

  const order = useMemo(() => {
    if (isOrder(fromNav)) return fromNav;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      return isOrder(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [fromNav]);

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className={spacing.container + ' py-16 max-w-2xl'}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: colors.success }}>
        Order confirmed
      </p>
      <h1 className={`${typography.h2} mb-4`} style={{ color: colors.black }}>
        Thank you{order.customer_name ? `, ${order.customer_name.split(' ')[0]}` : ''}
      </h1>
      <p className="mb-8" style={{ color: colors.gray500 }}>
        Your order <strong style={{ color: colors.black }}>{order.order_number}</strong> has been received and is being processed.
      </p>

      <div className="border p-6 mb-8 space-y-2 text-sm" style={{ borderColor: colors.lightGrey }}>
        <div className="flex justify-between" style={{ color: colors.gray500 }}>
          <span>Subtotal</span>
          <span>
            {CURRENCY_SYMBOL}
            {order.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between" style={{ color: colors.gray500 }}>
          <span>GST (10%)</span>
          <span>
            {CURRENCY_SYMBOL}
            {order.tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between" style={{ color: colors.gray500 }}>
          <span>Shipping</span>
          <span>
            {order.shipping === 0 ? 'Free' : `${CURRENCY_SYMBOL}${order.shipping.toFixed(2)}`}
          </span>
        </div>
        <div
          className="flex justify-between pt-3 mt-3 border-t font-bold"
          style={{ borderColor: colors.lightGrey, color: colors.black }}
        >
          <span>Total (AUD)</span>
          <span>
            {CURRENCY_SYMBOL}
            {order.total.toFixed(2)}
          </span>
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: colors.gray500 }}>
        A confirmation will be sent to <span style={{ color: colors.black }}>{order.customer_email}</span>.
      </p>
      <p className="text-sm mb-8" style={{ color: colors.gray500 }}>
        Save your order number.{' '}
        <Link
          to={`/orders?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(order.customer_email)}`}
          className="font-semibold underline"
          style={{ color: colors.black }}
        >
          Track this order anytime
        </Link>{' '}
        — no password, just this email and order number.
      </p>

      <div className="flex flex-wrap gap-4">
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to home
        </Button>
        <Button variant="outline" onClick={() => navigate('/shop')}>
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
