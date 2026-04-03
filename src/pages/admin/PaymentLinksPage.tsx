import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { colors } from '../../utils/design-system';
import { useProducts } from '../../hooks/useProducts';
import { supabase, getBrowserSupabaseAnonKey } from '../../lib/supabase';
import { CURRENCY } from '../../constants';
import { format, parseISO } from 'date-fns';
import { Link2, Copy, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

type PaymentLinkRow = {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  expires_at: string;
  created_at: string;
  paid_at: string | null;
  metadata: Record<string, unknown> | null;
  external_reference: string | null;
};

async function fetchPaymentLinks(): Promise<PaymentLinkRow[]> {
  const { data, error } = await supabase
    .from('payment_links')
    .select('payment_id, amount, currency, status, expires_at, created_at, paid_at, metadata, external_reference')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Omit<PaymentLinkRow, 'id'>[];
  return rows.map((r) => ({ ...r, id: r.payment_id }));
}

export function PaymentLinksPage() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useProducts({ includeInactive: true });
  const { data: links = [], isLoading } = useQuery({
    queryKey: ['payment_links', 'admin'],
    queryFn: fetchPaymentLinks,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState('');
  const [expirationMinutes, setExpirationMinutes] = useState('15');
  const [externalReference, setExternalReference] = useState('');
  const [creating, setCreating] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [createdUrl, setCreatedUrl] = useState('');
  const [createdCode, setCreatedCode] = useState('');

  const selectedProduct = products.find((p) => p.id === productId);

  const openCreate = () => {
    setProductId('');
    setAmount('');
    setCode('');
    setExpirationMinutes('15');
    setExternalReference('');
    setCreateOpen(true);
  };

  const handleProductChange = (id: string) => {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) setAmount(String(p.price));
  };

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Could not copy');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!productId || !selectedProduct) {
      toast.error('Select a product');
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!code.trim() || code.trim().length < 4) {
      toast.error('Code must be at least 4 characters');
      return;
    }

    const exp = Math.min(60, Math.max(5, Number(expirationMinutes) || 15));

    setCreating(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || getBrowserSupabaseAnonKey();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const createSecret = import.meta.env.VITE_PAYMENT_LINK_CREATE_SECRET as string | undefined;
      if (createSecret?.trim()) {
        headers['x-payment-link-secret'] = createSecret.trim();
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/create-payment-link`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: amt,
          code: code.trim(),
          currency: CURRENCY,
          expirationMinutes: exp,
          ...(externalReference.trim() ? { reference: externalReference.trim().slice(0, 500) } : {}),
          metadata: {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            product_sku: selectedProduct.sku ?? selectedProduct.id,
          },
        }),
      });

      const json = (await res.json()) as { payment_url?: string; payment_id?: string; error?: string };
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create link');
      }

      const url = json.payment_url || `${window.location.origin}/pay/${json.payment_id}`;
      setCreatedUrl(url);
      setCreatedCode(code.trim());
      setCreateOpen(false);
      setSuccessOpen(true);
      queryClient.invalidateQueries({ queryKey: ['payment_links', 'admin'] });
      toast.success('Payment link created');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider" style={{ color: colors.black }}>
            Payment links
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.gray500 }}>
            Code-protected pay pages. The access code is hashed in the database — save it when you create a link.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} className="flex items-center gap-2">
          <Plus size={18} />
          Create link
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-sm text-center" style={{ color: colors.gray500 }}>
            Loading…
          </p>
        ) : (
          <Table
            data={links}
            emptyMessage="No payment links yet. Create one and open the URL locally to test /pay/<id>."
            columns={[
              {
                key: 'product',
                header: 'Product',
                render: (row) => {
                  const meta = row.metadata ?? {};
                  const productName =
                    typeof meta.product_name === 'string' ? meta.product_name : '—';
                  const productIdMeta = typeof meta.product_id === 'string' ? meta.product_id : '';
                  return (
                    <div>
                      <div className="font-medium">{productName}</div>
                      {productIdMeta ? (
                        <div className="text-xs" style={{ color: colors.gray500 }}>
                          {productIdMeta}
                        </div>
                      ) : null}
                    </div>
                  );
                },
              },
              {
                key: 'payment_id',
                header: 'Pay ID',
                render: (row) => (
                  <span className="text-xs font-mono">{row.payment_id}</span>
                ),
              },
              {
                key: 'reference',
                header: 'Reference',
                render: (row) => (
                  <span className="text-xs font-mono break-all">
                    {row.external_reference || '—'}
                  </span>
                ),
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (row) => (
                  <span>
                    {row.currency} {Number(row.amount).toFixed(2)}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <Badge
                    variant={
                      row.status === 'paid'
                        ? 'success'
                        : row.status === 'expired' || row.status === 'failed'
                          ? 'error'
                          : 'warning'
                    }
                  >
                    {row.status}
                  </Badge>
                ),
              },
              {
                key: 'expires',
                header: 'Expires',
                render: (row) => (
                  <span className="text-xs whitespace-nowrap">
                    {format(parseISO(row.expires_at), 'MMM d, HH:mm')}
                  </span>
                ),
              },
              {
                key: 'created',
                header: 'Created',
                render: (row) => (
                  <span className="text-xs whitespace-nowrap">
                    {format(parseISO(row.created_at), 'MMM d, yyyy')}
                  </span>
                ),
              },
              {
                key: 'link',
                header: 'Link',
                render: (row) => {
                  const payUrl = `${window.location.origin}/pay/${row.payment_id}`;
                  return (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold"
                      style={{ color: colors.red }}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyText('Link', payUrl);
                      }}
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                  );
                },
              },
            ]}
          />
        )}
      </Card>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create payment link">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.darkGrey }}>
              Product
            </label>
            <select
              className="w-full border px-3 py-2 text-sm"
              style={{ borderColor: colors.lightGrey }}
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              required
            >
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({CURRENCY} {p.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <Input
            label={`Amount (${CURRENCY})`}
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            label="Access code (min 4 characters)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Share this with the payer"
            required
          />
          <Input
            label="Your reference (optional)"
            value={externalReference}
            onChange={(e) => setExternalReference(e.target.value)}
            placeholder="Invoice #, CRM id, internal note…"
          />
          <Input
            label="Expires in (minutes, 5–60)"
            type="number"
            min={5}
            max={60}
            value={expirationMinutes}
            onChange={(e) => setExpirationMinutes(e.target.value)}
          />
          <p className="text-xs" style={{ color: colors.gray500 }}>
            After you create this link, copy the URL and code from the next screen. The code cannot be retrieved later from the database.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={creating}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={successOpen} onClose={() => setSuccessOpen(false)} title="Link ready">
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Link2 size={20} className="shrink-0 mt-0.5" style={{ color: colors.red }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>
                Payment URL
              </p>
              <p className="text-sm break-all font-mono" style={{ color: colors.black }}>
                {createdUrl}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => copyText('URL', createdUrl)}
              >
                Copy URL
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.gray500 }}>
              Access code (give this to the payer)
            </p>
            <p className="text-lg font-mono font-bold tracking-widest" style={{ color: colors.black }}>
              {createdCode}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => copyText('Code', createdCode)}
            >
              Copy code
            </Button>
          </div>
          <Button variant="primary" fullWidth onClick={() => setSuccessOpen(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
}
