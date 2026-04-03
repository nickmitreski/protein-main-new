import { useMemo, useState } from 'react';
import { useOrders, useUpdateOrder, useOrderItems } from '../../hooks/useOrders';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { colors } from '../../utils/design-system';
import { CURRENCY_SYMBOL, ORDER_STATUSES, PAYMENT_STATUSES, FULFILLMENT_STATUSES } from '../../constants';
import { Truck, Package } from 'lucide-react';
import type { Order } from '../../types';
import { format, parseISO } from 'date-fns';

function getPaymentBadgeVariant(status: Order['payment_status']) {
  if (status === 'paid') return 'success' as const;
  if (status === 'failed') return 'danger' as const;
  if (status === 'refunded' || status === 'partially_refunded') return 'warning' as const;
  return 'default' as const;
}

function getStatusBadgeVariant(status: Order['status']) {
  if (status === 'delivered') return 'success' as const;
  if (status === 'cancelled' || status === 'refunded') return 'danger' as const;
  if (status === 'shipped' || status === 'processing') return 'info' as const;
  if (status === 'pending') return 'warning' as const;
  return 'default' as const;
}

function getFulfillmentVariant(status: Order['fulfillment_status']) {
  if (status === 'fulfilled') return 'success' as const;
  if (status === 'cancelled') return 'danger' as const;
  if (status === 'partially_fulfilled') return 'warning' as const;
  return 'default' as const;
}

function OrderItemsList({ orderId }: { orderId: string }) {
  const { data: items = [] } = useOrderItems(orderId);
  if (!items.length) return <p className="text-sm" style={{ color: colors.gray500 }}>No line items found.</p>;

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 text-sm">
          {item.product_image ? (
            <img src={item.product_image} alt="" className="w-10 h-10 object-cover border shrink-0" style={{ borderColor: colors.lightGrey }} />
          ) : (
            <div className="w-10 h-10 border shrink-0 flex items-center justify-center" style={{ borderColor: colors.lightGrey }}>
              <Package size={14} style={{ color: colors.gray400 }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" style={{ color: colors.black }}>{item.product_name}</p>
            <p className="text-xs" style={{ color: colors.gray500 }}>
              {item.sku ? `SKU: ${item.sku} · ` : ''}Qty: {item.quantity} × {CURRENCY_SYMBOL}{item.price.toFixed(2)}
            </p>
          </div>
          <span className="font-semibold shrink-0" style={{ color: colors.black }}>
            {CURRENCY_SYMBOL}{item.total.toFixed(2)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function OrdersPage() {
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  const filters = useMemo(
    () => ({
      status: (status || undefined) as Order['status'] | undefined,
      search: search.trim() || undefined,
    }),
    [status, search]
  );

  const { data: orders = [], isLoading } = useOrders(filters);
  const updateOrder = useUpdateOrder();

  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label })),
  ];

  const openOrder = (o: Order) => {
    setSelectedOrder(o);
    setTrackingNumber(o.tracking_number ?? '');
    setCarrier(o.carrier ?? '');
  };

  const handleStatusUpdate = async (
    field: 'status' | 'payment_status' | 'fulfillment_status',
    value: string
  ) => {
    if (!selectedOrder) return;
    await updateOrder.mutateAsync({ id: selectedOrder.id, updates: { [field]: value as never } });
    setSelectedOrder((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setIsSavingTracking(true);
    try {
      const updates: Partial<Order> = {
        tracking_number: trackingNumber.trim() || null,
        carrier: carrier.trim() || null,
      };
      if (trackingNumber.trim() && selectedOrder.fulfillment_status === 'unfulfilled') {
        updates.fulfillment_status = 'fulfilled';
        updates.status = 'shipped';
        updates.shipped_at = new Date().toISOString();
      }
      await updateOrder.mutateAsync({ id: selectedOrder.id, updates });
      setSelectedOrder((prev) => prev ? { ...prev, ...updates } : null);
    } finally {
      setIsSavingTracking(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2" style={{ color: colors.black }}>
          Orders
        </h1>
        <p className="text-sm" style={{ color: colors.gray500 }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} — click a row to manage
        </p>
      </div>

      <Card className="mb-6 !p-0">
        <div className="p-6 flex flex-col md:flex-row gap-4 border-b" style={{ borderColor: colors.lightGrey }}>
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Order #, email, customer name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>
        <div className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm" style={{ color: colors.gray500 }}>Loading orders…</p>
          ) : (
            <Table<Order>
              data={orders}
              emptyMessage="No orders match your filters."
              onRowClick={openOrder}
              columns={[
                {
                  key: 'order',
                  header: 'Order',
                  render: (o) => (
                    <div>
                      <span className="font-semibold" style={{ color: colors.black }}>{o.order_number}</span>
                      <p className="text-xs mt-0.5" style={{ color: colors.gray500 }}>
                        {format(parseISO(o.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'customer',
                  header: 'Customer',
                  render: (o) => (
                    <div>
                      <p style={{ color: colors.black }}>{o.customer_name}</p>
                      <p className="text-xs" style={{ color: colors.gray500 }}>{o.customer_email}</p>
                    </div>
                  ),
                },
                {
                  key: 'payment',
                  header: 'Payment',
                  render: (o) => <Badge variant={getPaymentBadgeVariant(o.payment_status)}>{o.payment_status}</Badge>,
                },
                {
                  key: 'fulfillment',
                  header: 'Fulfillment',
                  render: (o) => (
                    <div className="flex flex-col gap-1">
                      <Badge variant={getFulfillmentVariant(o.fulfillment_status)}>{o.fulfillment_status}</Badge>
                      {o.tracking_number && (
                        <span className="text-xs flex items-center gap-1" style={{ color: colors.gray500 }}>
                          <Truck size={10} /> {o.tracking_number}
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (o) => <Badge variant={getStatusBadgeVariant(o.status)}>{o.status}</Badge>,
                },
                {
                  key: 'total',
                  header: 'Total',
                  width: '120px',
                  render: (o) => <span className="font-semibold">{CURRENCY_SYMBOL}{o.total.toFixed(2)}</span>,
                },
              ]}
            />
          )}
        </div>
      </Card>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.order_number}` : ''}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>Customer</p>
                <p style={{ color: colors.black }}>{selectedOrder.customer_name}</p>
                <p style={{ color: colors.gray500 }}>{selectedOrder.customer_email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>Date</p>
                <p style={{ color: colors.black }}>{format(parseISO(selectedOrder.created_at), 'MMMM d, yyyy h:mm a')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>Shipping Address</p>
                <p style={{ color: colors.black }}>{selectedOrder.shipping_address?.address1}</p>
                <p style={{ color: colors.gray500 }}>
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.province}{' '}
                  {selectedOrder.shipping_address?.postal_code}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>Order Total</p>
                <p className="text-xl font-bold" style={{ color: colors.black }}>{CURRENCY_SYMBOL}{selectedOrder.total.toFixed(2)}</p>
                <p className="text-xs mt-1" style={{ color: colors.gray500 }}>
                  Subtotal {CURRENCY_SYMBOL}{selectedOrder.subtotal.toFixed(2)} + Tax {CURRENCY_SYMBOL}{selectedOrder.tax.toFixed(2)} + Shipping {CURRENCY_SYMBOL}{selectedOrder.shipping.toFixed(2)}
                  {selectedOrder.discount > 0 && ` − Discount ${CURRENCY_SYMBOL}${selectedOrder.discount.toFixed(2)}`}
                </p>
                {selectedOrder.coupon_code && (
                  <p className="text-xs mt-1" style={{ color: colors.gray500 }}>Coupon: {selectedOrder.coupon_code}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-6" style={{ borderColor: colors.lightGrey }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.gray500 }}>Order Items</p>
              <OrderItemsList orderId={selectedOrder.id} />
            </div>

            <div className="border-t pt-6" style={{ borderColor: colors.lightGrey }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.gray500 }}>Fulfillment & Tracking</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Input
                  label="Tracking number"
                  placeholder="e.g. 1Z999AA10123456784"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <Input
                  label="Carrier"
                  placeholder="e.g. Australia Post"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                />
                <Button
                  onClick={handleSaveTracking}
                  isLoading={isSavingTracking}
                  className="flex items-center gap-2"
                >
                  <Truck size={14} />
                  {trackingNumber && selectedOrder.fulfillment_status === 'unfulfilled'
                    ? 'Mark as Shipped'
                    : 'Save Tracking'}
                </Button>
              </div>
              {selectedOrder.shipped_at && (
                <p className="text-xs mt-3" style={{ color: colors.gray500 }}>
                  Shipped: {format(parseISO(selectedOrder.shipped_at), 'MMMM d, yyyy h:mm a')}
                </p>
              )}
            </div>

            <div className="border-t pt-6" style={{ borderColor: colors.lightGrey }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: colors.gray500 }}>Update Status</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Order Status"
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate('status', e.target.value)}
                  options={ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                />
                <Select
                  label="Payment Status"
                  value={selectedOrder.payment_status}
                  onChange={(e) => handleStatusUpdate('payment_status', e.target.value)}
                  options={PAYMENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                />
                <Select
                  label="Fulfillment Status"
                  value={selectedOrder.fulfillment_status}
                  onChange={(e) => handleStatusUpdate('fulfillment_status', e.target.value)}
                  options={FULFILLMENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
