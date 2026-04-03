import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { colors } from '../../utils/design-system';
import { useStoreSettings, useUpdateStoreSettings } from '../../hooks/useStoreSettings';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../../hooks/useCoupons';
import { useSubscribers } from '../../hooks/useSubscribers';
import { useProducts } from '../../hooks/useProducts';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import type { Coupon, Subscriber } from '../../types';
import { format, parseISO } from 'date-fns';
import { CURRENCY_SYMBOL } from '../../constants';
import toast from 'react-hot-toast';

type CouponFormState = {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  min_order_value: string;
  max_uses: string;
  description: string;
  expires_at: string;
  is_active: boolean;
};

const EMPTY_COUPON: CouponFormState = {
  code: '',
  type: 'percentage',
  value: '',
  min_order_value: '',
  max_uses: '',
  description: '',
  expires_at: '',
  is_active: true,
};

export function SettingsPage() {
  const { data: settings, isLoading: settingsLoading } = useStoreSettings();
  const updateSettings = useUpdateStoreSettings();
  const { data: coupons = [] } = useCoupons();
  const { data: subscribers = [] } = useSubscribers();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const { data: products = [] } = useProducts({ includeInactive: true });

  const [form, setForm] = useState({
    store_name: '',
    contact_email: '',
    tax_rate: '',
    free_shipping_threshold: '',
    standard_shipping_cost: '',
    low_stock_threshold: '',
    fulfillment_address_line1: '',
    fulfillment_address_city: '',
    fulfillment_address_state: '',
    fulfillment_address_postcode: '',
    fulfillment_address_country: '',
  });

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState(EMPTY_COUPON);

  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name,
        contact_email: settings.contact_email,
        tax_rate: String(settings.tax_rate * 100),
        free_shipping_threshold: String(settings.free_shipping_threshold),
        standard_shipping_cost: String(settings.standard_shipping_cost),
        low_stock_threshold: String(settings.low_stock_threshold),
        fulfillment_address_line1: settings.fulfillment_address.line1,
        fulfillment_address_city: settings.fulfillment_address.city,
        fulfillment_address_state: settings.fulfillment_address.state,
        fulfillment_address_postcode: settings.fulfillment_address.postcode,
        fulfillment_address_country: settings.fulfillment_address.country,
      });
    }
  }, [settings]);

  const handleSaveGeneral = async () => {
    await updateSettings.mutateAsync({
      store_name: form.store_name,
      contact_email: form.contact_email,
      tax_rate: Number(form.tax_rate) / 100,
      free_shipping_threshold: Number(form.free_shipping_threshold),
      standard_shipping_cost: Number(form.standard_shipping_cost),
      low_stock_threshold: Number(form.low_stock_threshold),
      fulfillment_address: {
        line1: form.fulfillment_address_line1,
        city: form.fulfillment_address_city,
        state: form.fulfillment_address_state,
        postcode: form.fulfillment_address_postcode,
        country: form.fulfillment_address_country,
      },
    });
  };

  const handleCreateCoupon = async () => {
    if (!couponForm.code.trim() || !couponForm.value) {
      toast.error('Code and value are required.');
      return;
    }
    await createCoupon.mutateAsync({
      code: couponForm.code.trim().toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value),
      min_order_value: Number(couponForm.min_order_value) || 0,
      max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
      description: couponForm.description || null,
      expires_at: couponForm.expires_at || null,
      is_active: couponForm.is_active,
    });
    setCouponModalOpen(false);
    setCouponForm(EMPTY_COUPON);
  };

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= (settings?.low_stock_threshold ?? 10) && p.stock_quantity > 0
  );
  const outOfStockProducts = products.filter((p) => p.stock_quantity === 0);

  if (settingsLoading) {
    return (
      <div className="p-8">
        <p className="text-sm" style={{ color: colors.gray500 }}>Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2" style={{ color: colors.black }}>Settings</h1>
        <p className="text-sm" style={{ color: colors.gray500 }}>Store configuration, shipping, coupons, and inventory alerts.</p>
      </div>

      <Card title="General">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Store name" value={form.store_name} onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))} />
            <Input label="Contact email" type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} />
          </div>
        </div>
      </Card>

      <Card title="Tax & Shipping">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              label="Tax rate (%)"
              type="number" min="0" max="100" step="0.1"
              value={form.tax_rate}
              onChange={(e) => setForm((f) => ({ ...f, tax_rate: e.target.value }))}
            />
          </div>
          <div>
            <Input
              label={`Free shipping from (${CURRENCY_SYMBOL})`}
              type="number" min="0"
              value={form.free_shipping_threshold}
              onChange={(e) => setForm((f) => ({ ...f, free_shipping_threshold: e.target.value }))}
            />
          </div>
          <div>
            <Input
              label={`Standard shipping (${CURRENCY_SYMBOL})`}
              type="number" min="0" step="0.01"
              value={form.standard_shipping_cost}
              onChange={(e) => setForm((f) => ({ ...f, standard_shipping_cost: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      <Card title="Fulfillment Address">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Address line 1" value={form.fulfillment_address_line1} onChange={(e) => setForm((f) => ({ ...f, fulfillment_address_line1: e.target.value }))} />
          </div>
          <Input label="City" value={form.fulfillment_address_city} onChange={(e) => setForm((f) => ({ ...f, fulfillment_address_city: e.target.value }))} />
          <Input label="State" value={form.fulfillment_address_state} onChange={(e) => setForm((f) => ({ ...f, fulfillment_address_state: e.target.value }))} />
          <Input label="Postcode" value={form.fulfillment_address_postcode} onChange={(e) => setForm((f) => ({ ...f, fulfillment_address_postcode: e.target.value }))} />
          <Input label="Country" value={form.fulfillment_address_country} onChange={(e) => setForm((f) => ({ ...f, fulfillment_address_country: e.target.value }))} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveGeneral} isLoading={updateSettings.isPending}>Save Settings</Button>
      </div>

      <Card title="Inventory Alerts">
        <div className="mb-4">
          <Input
            label="Low stock threshold (units)"
            type="number" min="1"
            value={form.low_stock_threshold}
            onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))}
          />
        </div>
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) ? (
          <div className="space-y-4">
            {outOfStockProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Out of Stock ({outOfStockProducts.length})</span>
                </div>
                <div className="space-y-2">
                  {outOfStockProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm p-3 border" style={{ borderColor: '#fecaca', backgroundColor: '#fff5f5' }}>
                      <span style={{ color: colors.black }}>{p.name}</span>
                      <Badge variant="danger">0 units</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#854d0e' }}>Low Stock ({lowStockProducts.length})</span>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm p-3 border" style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
                      <span style={{ color: colors.black }}>{p.name}</span>
                      <Badge variant="warning">{p.stock_quantity} units</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: colors.gray500 }}>All products are well-stocked.</p>
        )}
      </Card>

      <Card title="Discount Codes">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm" style={{ color: colors.gray500 }}>{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
          <Button onClick={() => { setCouponForm(EMPTY_COUPON); setCouponModalOpen(true); }}>
            <Plus size={14} className="mr-2" />
            New Coupon
          </Button>
        </div>
        <Table<Coupon>
          data={coupons}
          emptyMessage="No coupons yet."
          columns={[
            {
              key: 'code',
              header: 'Code',
              render: (c) => <span className="font-mono font-semibold" style={{ color: colors.black }}>{c.code}</span>,
            },
            {
              key: 'discount',
              header: 'Discount',
              render: (c) => (
                <span style={{ color: colors.black }}>
                  {c.type === 'percentage' ? `${c.value}%` : `${CURRENCY_SYMBOL}${c.value.toFixed(2)}`}
                  {c.min_order_value > 0 && <span style={{ color: colors.gray500 }}> (min {CURRENCY_SYMBOL}{c.min_order_value})</span>}
                </span>
              ),
            },
            {
              key: 'usage',
              header: 'Uses',
              render: (c) => (
                <span style={{ color: colors.gray500 }}>
                  {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}
                </span>
              ),
            },
            {
              key: 'expires',
              header: 'Expires',
              render: (c) => (
                <span style={{ color: colors.gray500 }}>
                  {c.expires_at ? format(parseISO(c.expires_at), 'MMM d, yyyy') : 'Never'}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (c) => (
                <button
                  type="button"
                  onClick={() => updateCoupon.mutate({ id: c.id, updates: { is_active: !c.is_active } })}
                  className="hover:opacity-70 transition-opacity"
                >
                  <Badge variant={c.is_active ? 'success' : 'default'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                </button>
              ),
            },
            {
              key: 'actions',
              header: '',
              width: '60px',
              render: (c) => (
                <button
                  type="button"
                  onClick={() => deleteCoupon.mutate(c.id)}
                  className="p-1 hover:text-red-500 transition-colors"
                  style={{ color: colors.gray400 }}
                >
                  <Trash2 size={14} />
                </button>
              ),
            },
          ]}
        />
      </Card>

      <Card title="Email Subscribers">
        <p className="text-sm mb-4" style={{ color: colors.gray500 }}>{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
        <Table<Subscriber>
          data={subscribers.slice(0, 20)}
          emptyMessage="No subscribers yet."
          columns={[
            {
              key: 'email',
              header: 'Email',
              render: (s) => <span style={{ color: colors.black }}>{s.email}</span>,
            },
            {
              key: 'source',
              header: 'Source',
              render: (s) => <span style={{ color: colors.gray500 }}>{s.source}</span>,
            },
            {
              key: 'code',
              header: 'Discount Code',
              render: (s) => (
                <span className="font-mono text-xs" style={{ color: colors.gray500 }}>
                  {s.discount_code ?? '—'}
                </span>
              ),
            },
            {
              key: 'date',
              header: 'Date',
              render: (s) => (
                <span style={{ color: colors.gray500 }}>
                  {format(parseISO(s.created_at), 'MMM d, yyyy')}
                </span>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        isOpen={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        title="New Discount Coupon"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Code *"
                placeholder="e.g. SUMMER20"
                value={couponForm.code}
                onChange={(e) => setCouponForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.gray500 }}>Type</label>
              <select
                value={couponForm.type}
                onChange={(e) => setCouponForm((f) => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full border px-3 py-2 text-sm"
                style={{ borderColor: colors.lightGrey }}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount ({CURRENCY_SYMBOL})</option>
              </select>
            </div>
            <div>
              <Input
                label={`Value ${couponForm.type === 'percentage' ? '(%)' : `(${CURRENCY_SYMBOL})`} *`}
                type="number" min="0" step="0.01"
                value={couponForm.value}
                onChange={(e) => setCouponForm((f) => ({ ...f, value: e.target.value }))}
              />
            </div>
            <div>
              <Input
                label={`Min order (${CURRENCY_SYMBOL})`}
                type="number" min="0"
                value={couponForm.min_order_value}
                onChange={(e) => setCouponForm((f) => ({ ...f, min_order_value: e.target.value }))}
              />
            </div>
            <div>
              <Input
                label="Max uses (blank = unlimited)"
                type="number" min="1"
                value={couponForm.max_uses}
                onChange={(e) => setCouponForm((f) => ({ ...f, max_uses: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Expires (optional)"
                type="date"
                value={couponForm.expires_at}
                onChange={(e) => setCouponForm((f) => ({ ...f, expires_at: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Description (internal)"
                value={couponForm.description}
                onChange={(e) => setCouponForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCouponForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${couponForm.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${couponForm.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm" style={{ color: colors.black }}>{couponForm.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-end border-t pt-4" style={{ borderColor: colors.lightGrey }}>
            <Button variant="outline" onClick={() => setCouponModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCoupon} isLoading={createCoupon.isPending}>Create Coupon</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
