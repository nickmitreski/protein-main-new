import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders, useOrderItems } from '../../hooks/useOrders';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../utils/design-system';
import { CURRENCY_SYMBOL } from '../../constants';
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Order, OrderItem } from '../../types';

function statusIcon(status: Order['status']) {
  if (status === 'delivered') return <CheckCircle size={14} className="text-green-500" />;
  if (status === 'shipped') return <Truck size={14} className="text-blue-500" />;
  if (status === 'cancelled' || status === 'refunded') return <XCircle size={14} className="text-red-500" />;
  return <Clock size={14} className="text-yellow-500" />;
}

function statusColor(status: Order['status']): string {
  if (status === 'delivered') return '#16a34a';
  if (status === 'shipped') return '#2563eb';
  if (status === 'cancelled' || status === 'refunded') return '#dc2626';
  return '#d97706';
}

function OrderItemsAccordion({ orderId }: { orderId: string }) {
  const { data: items = [], isLoading } = useOrderItems(orderId);

  if (isLoading) return <p className="text-sm py-4 pl-4" style={{ color: colors.gray500 }}>Loading items…</p>;
  if (!items.length) return null;

  return (
    <ul className="divide-y" style={{ borderColor: colors.lightGrey }}>
      {items.map((item: OrderItem) => (
        <li key={item.id} className="flex items-center gap-4 px-4 py-3">
          {item.product_image ? (
            <img src={item.product_image} alt="" className="w-12 h-12 object-cover border shrink-0" style={{ borderColor: colors.lightGrey }} />
          ) : (
            <div className="w-12 h-12 border shrink-0 flex items-center justify-center" style={{ borderColor: colors.lightGrey }}>
              <Package size={16} style={{ color: colors.gray400 }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: colors.black }}>{item.product_name}</p>
            {item.sku && <p className="text-xs" style={{ color: colors.gray500 }}>SKU: {item.sku}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm" style={{ color: colors.gray500 }}>Qty {item.quantity}</p>
            <p className="text-sm font-semibold" style={{ color: colors.black }}>{CURRENCY_SYMBOL}{item.total.toFixed(2)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border" style={{ borderColor: colors.lightGrey }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-6 py-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {statusIcon(order.status)}
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: statusColor(order.status) }}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="font-bold" style={{ color: colors.black }}>{order.order_number}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.gray500 }}>
                {format(parseISO(order.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {order.tracking_number && (
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>Tracking</p>
                <p className="text-sm font-mono" style={{ color: colors.black }}>{order.tracking_number}</p>
                {order.carrier && <p className="text-xs" style={{ color: colors.gray500 }}>{order.carrier}</p>}
              </div>
            )}
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>Total</p>
              <p className="text-lg font-bold" style={{ color: colors.black }}>
                {CURRENCY_SYMBOL}{order.total.toFixed(2)}
              </p>
            </div>
            <div className="text-gray-400">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t" style={{ borderColor: colors.lightGrey }}>
          <OrderItemsAccordion orderId={order.id} />
          <div className="px-6 py-4 border-t space-y-1 text-sm" style={{ borderColor: colors.lightGrey }}>
            <div className="flex justify-between" style={{ color: colors.gray500 }}>
              <span>Subtotal</span>
              <span>{CURRENCY_SYMBOL}{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: colors.gray500 }}>
              <span>GST (10%)</span>
              <span>{CURRENCY_SYMBOL}{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: colors.gray500 }}>
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : `${CURRENCY_SYMBOL}${order.shipping.toFixed(2)}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                <span>−{CURRENCY_SYMBOL}{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-1 border-t" style={{ borderColor: colors.lightGrey, color: colors.black }}>
              <span>Total</span>
              <span>{CURRENCY_SYMBOL}{order.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="px-6 pb-4 text-sm" style={{ color: colors.gray500 }}>
            <p>Shipped to: {order.shipping_address?.address1}, {order.shipping_address?.city} {order.shipping_address?.postal_code}</p>
            {order.shipped_at && (
              <p className="mt-1">Shipped: {format(parseISO(order.shipped_at), 'MMMM d, yyyy')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderHistoryPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useOrders({});

  if (!user) {
    return (
      <div className={`${spacing.container} py-24 max-w-2xl text-center`}>
        <Package size={48} className="mx-auto mb-6" style={{ color: colors.gray400 }} />
        <h1 className={`${typography.h2} mb-4`} style={{ color: colors.black }}>Sign in to view orders</h1>
        <p className="mb-8" style={{ color: colors.gray500 }}>Log in to see your order history and track shipments.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white"
          style={{ backgroundColor: colors.black }}
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${spacing.container} py-24 max-w-3xl`}>
        <p className="text-sm" style={{ color: colors.gray500 }}>Loading orders…</p>
      </div>
    );
  }

  return (
    <div className={`${spacing.container} py-16 max-w-3xl`}>
      <div className="mb-10">
        <h1 className={`${typography.h2} mb-2`} style={{ color: colors.black }}>Order History</h1>
        <p style={{ color: colors.gray500 }}>
          {orders.length > 0
            ? `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`
            : 'No orders yet.'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border" style={{ borderColor: colors.lightGrey }}>
          <Package size={48} className="mx-auto mb-6" style={{ color: colors.gray400 }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.black }}>No orders yet</h2>
          <p className="mb-8" style={{ color: colors.gray500 }}>Start shopping to see your orders here.</p>
          <Link
            to="/shop"
            className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white"
            style={{ backgroundColor: colors.black }}
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
