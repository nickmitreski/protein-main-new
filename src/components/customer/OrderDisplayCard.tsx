import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useOrderItems } from '../../hooks/useOrders';
import { colors } from '../../utils/design-system';
import { CURRENCY_SYMBOL } from '../../constants';
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

function OrderItemsList({ items }: { items: OrderItem[] }) {
  if (!items.length) return <p className="text-sm py-4 pl-4" style={{ color: colors.gray500 }}>No line items.</p>;

  return (
    <ul className="divide-y" style={{ borderColor: colors.lightGrey }}>
      {items.map((item: OrderItem, idx: number) => (
        <li key={item.id ?? `${item.product_id}-${idx}`} className="flex items-center gap-4 px-4 py-3">
          {item.product_image ? (
            <img
              src={item.product_image}
              alt=""
              className="w-12 h-12 object-cover border shrink-0"
              style={{ borderColor: colors.lightGrey }}
            />
          ) : (
            <div
              className="w-12 h-12 border shrink-0 flex items-center justify-center"
              style={{ borderColor: colors.lightGrey }}
            >
              <Package size={16} style={{ color: colors.gray400 }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: colors.black }}>
              {item.product_name}
            </p>
            {item.sku && (
              <p className="text-xs" style={{ color: colors.gray500 }}>
                SKU: {item.sku}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm" style={{ color: colors.gray500 }}>
              Qty {item.quantity}
            </p>
            <p className="text-sm font-semibold" style={{ color: colors.black }}>
              {CURRENCY_SYMBOL}
              {Number(item.total).toFixed(2)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrderItemsAccordion({ orderId, inlineItems }: { orderId: string; inlineItems?: OrderItem[] }) {
  const fetchItems = inlineItems === undefined;
  const { data: fetched = [], isLoading } = useOrderItems(orderId, { enabled: fetchItems });
  const items = inlineItems ?? fetched;

  if (fetchItems && isLoading) {
    return <p className="text-sm py-4 pl-4" style={{ color: colors.gray500 }}>Loading items…</p>;
  }
  return <OrderItemsList items={items} />;
}

export function OrderDisplayCard({ order, inlineItems }: { order: Order; inlineItems?: OrderItem[] }) {
  const [expanded, setExpanded] = useState(true);

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
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: statusColor(order.status) }}
                >
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="font-bold" style={{ color: colors.black }}>
                {order.order_number}
              </p>
              <p className="text-xs mt-0.5 font-mono" style={{ color: colors.gray500 }}>
                ID {order.id}
              </p>
              <p className="text-xs mt-0.5" style={{ color: colors.gray500 }}>
                {format(parseISO(order.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {order.tracking_number && (
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>
                  Tracking
                </p>
                <p className="text-sm font-mono" style={{ color: colors.black }}>
                  {order.tracking_number}
                </p>
                {order.carrier && <p className="text-xs" style={{ color: colors.gray500 }}>{order.carrier}</p>}
              </div>
            )}
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>
                Total
              </p>
              <p className="text-lg font-bold" style={{ color: colors.black }}>
                {CURRENCY_SYMBOL}
                {Number(order.total).toFixed(2)}
              </p>
            </div>
            <div className="text-gray-400">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t" style={{ borderColor: colors.lightGrey }}>
          <OrderItemsAccordion orderId={order.id} inlineItems={inlineItems} />
          <div className="px-6 py-4 border-t space-y-1 text-sm" style={{ borderColor: colors.lightGrey }}>
            <div className="flex justify-between" style={{ color: colors.gray500 }}>
              <span>Subtotal</span>
              <span>
                {CURRENCY_SYMBOL}
                {Number(order.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between" style={{ color: colors.gray500 }}>
              <span>GST (10%)</span>
              <span>
                {CURRENCY_SYMBOL}
                {Number(order.tax).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between" style={{ color: colors.gray500 }}>
              <span>Shipping</span>
              <span>
                {order.shipping === 0 ? 'Free' : `${CURRENCY_SYMBOL}${Number(order.shipping).toFixed(2)}`}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                <span>
                  −{CURRENCY_SYMBOL}
                  {Number(order.discount).toFixed(2)}
                </span>
              </div>
            )}
            <div
              className="flex justify-between font-bold pt-1 border-t"
              style={{ borderColor: colors.lightGrey, color: colors.black }}
            >
              <span>Total</span>
              <span>
                {CURRENCY_SYMBOL}
                {Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="px-6 pb-4 text-sm" style={{ color: colors.gray500 }}>
            <p>
              Shipped to: {order.shipping_address?.address1}, {order.shipping_address?.city}{' '}
              {order.shipping_address?.postal_code}
            </p>
            {order.shipped_at && (
              <p className="mt-1">Shipped: {format(parseISO(order.shipped_at), 'MMMM d, yyyy')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
