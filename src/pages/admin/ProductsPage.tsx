import { useMemo, useState, useRef } from 'react';
import { useProducts, useUpdateProduct, useCreateProduct } from '../../hooks/useProducts';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { colors } from '../../utils/design-system';
import { CURRENCY_SYMBOL, PRODUCT_CATEGORIES } from '../../constants';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { Plus, Upload, X } from 'lucide-react';
import type { Product } from '../../types';
import toast from 'react-hot-toast';

type ModalMode = 'edit' | 'create';

const EMPTY_FORM = {
  name: '',
  description: '',
  sku: '',
  category: 'Protein Powders',
  price: '',
  compare_at_price: '',
  stock_quantity: '',
  is_active: true,
  image: '',
};

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>('edit');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const filters = useMemo(
    () => ({
      includeInactive: true as const,
      search: search.trim() || undefined,
      category: category || undefined,
    }),
    [search, category]
  );

  const { data: products = [], isLoading } = useProducts(filters);
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      sku: p.sku ?? '',
      category: p.category,
      price: String(p.price),
      compare_at_price: p.compare_at_price != null ? String(p.compare_at_price) : '',
      stock_quantity: String(p.stock_quantity),
      is_active: p.is_active,
      image: p.image,
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProduct(null);
  };

  const handleImageUpload = async (file: File) => {
    if (!isSupabaseConfigured) {
      toast('Connect Supabase Storage to upload images.', { icon: 'ℹ️' });
      return;
    }
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `products/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setForm((f) => ({ ...f, image: data.publicUrl }));
      toast.success('Image uploaded');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error('Name, price and category are required.');
      return;
    }

    const updates = {
      name: form.name.trim(),
      description: form.description.trim(),
      sku: form.sku.trim() || undefined,
      category: form.category,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : undefined,
      stock_quantity: Number(form.stock_quantity) || 0,
      is_active: form.is_active,
      image: form.image || '',
    };

    if (modalMode === 'edit' && editProduct) {
      await updateProduct.mutateAsync({ id: editProduct.id, updates });
    } else {
      await createProduct.mutateAsync({
        ...updates,
        images: form.image ? [form.image] : [],
        rating: 0,
        review_count: 0,
        track_inventory: true,
        continue_selling_when_out_of_stock: false,
        requires_shipping: true,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
    }
    closeModal();
  };

  const handleToggleActive = async (p: Product) => {
    await updateProduct.mutateAsync({ id: p.id, updates: { is_active: !p.is_active } });
  };

  const isPending = updateProduct.isPending || createProduct.isPending;

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-2" style={{ color: colors.black }}>
            Products
          </h1>
          <p className="text-sm" style={{ color: colors.gray500 }}>
            {products.length} product{products.length !== 1 ? 's' : ''} — click a row to edit
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={14} className="mr-2" />
          Add product
        </Button>
      </div>

      <Card className="mb-6 !p-0">
        <div className="p-6 flex flex-col md:flex-row gap-4 border-b" style={{ borderColor: colors.lightGrey }}>
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Name or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            <span className="text-xs uppercase tracking-wider w-full mb-1" style={{ color: colors.gray500 }}>
              Category
            </span>
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`px-3 py-2 text-xs uppercase tracking-wider border ${!category ? 'bg-black text-white' : 'bg-white'}`}
              style={{ borderColor: colors.lightGrey }}
            >
              All
            </button>
            {PRODUCT_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-3 py-2 text-xs uppercase tracking-wider border ${category === c.id ? 'bg-black text-white' : 'bg-white'}`}
                style={{ borderColor: colors.lightGrey }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm" style={{ color: colors.gray500 }}>Loading products…</p>
          ) : (
            <Table<Product>
              data={products}
              emptyMessage="No products found."
              onRowClick={openEdit}
              columns={[
                {
                  key: 'product',
                  header: 'Product',
                  render: (p) => (
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt="" className="w-10 h-10 object-cover border" style={{ borderColor: colors.lightGrey }} />
                      ) : (
                        <div className="w-10 h-10 border flex items-center justify-center text-xs" style={{ borderColor: colors.lightGrey, color: colors.gray400 }}>
                          IMG
                        </div>
                      )}
                      <div>
                        <p className="font-semibold" style={{ color: colors.black }}>{p.name}</p>
                        <p className="text-xs" style={{ color: colors.gray500 }}>{p.sku ?? '—'} · {p.category}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (p) => (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(p); }}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <Badge variant={p.is_active ? 'success' : 'default'}>
                        {p.is_active ? 'Active' : 'Draft'}
                      </Badge>
                    </button>
                  ),
                },
                {
                  key: 'inventory',
                  header: 'Stock',
                  render: (p) => (
                    <span className={p.stock_quantity < 10 ? 'text-red-600 font-semibold' : ''}>
                      {p.stock_quantity} units
                    </span>
                  ),
                },
                {
                  key: 'price',
                  header: 'Price',
                  render: (p) => (
                    <span className="font-semibold">
                      {CURRENCY_SYMBOL}{p.price.toFixed(2)}
                    </span>
                  ),
                },
                {
                  key: 'rating',
                  header: 'Rating',
                  render: (p) => (
                    <span style={{ color: colors.gray500 }}>{p.rating} ({p.review_count})</span>
                  ),
                },
              ]}
            />
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Add New Product' : (editProduct?.name ?? '')}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.gray500 }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border px-3 py-2 text-sm resize-none"
                style={{ borderColor: colors.lightGrey, color: colors.black }}
              />
            </div>
            <div>
              <Input label="SKU" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.gray500 }}>
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border px-3 py-2 text-sm"
                style={{ borderColor: colors.lightGrey, color: colors.black }}
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Input
                label={`Price (${CURRENCY_SYMBOL}) *`}
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div>
              <Input
                label={`Compare-at price (${CURRENCY_SYMBOL})`}
                type="number" min="0" step="0.01"
                value={form.compare_at_price}
                onChange={(e) => setForm((f) => ({ ...f, compare_at_price: e.target.value }))}
              />
            </div>
            <div>
              <Input
                label="Stock quantity"
                type="number" min="0"
                value={form.stock_quantity}
                onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm" style={{ color: colors.black }}>
                {form.is_active ? 'Active (visible in store)' : 'Draft (hidden)'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: colors.gray500 }}>
              Product Image
            </label>
            <div className="flex items-start gap-4">
              {form.image ? (
                <div className="relative">
                  <img src={form.image} alt="" className="w-24 h-24 object-cover border" style={{ borderColor: colors.lightGrey }} />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: '' }))}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed flex items-center justify-center text-xs text-center" style={{ borderColor: colors.lightGrey, color: colors.gray400 }}>
                  No image
                </div>
              )}
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 border text-xs uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50"
                  style={{ borderColor: colors.lightGrey }}
                >
                  <Upload size={12} />
                  {isUploading ? 'Uploading…' : 'Upload image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = '';
                  }}
                />
                <Input
                  label="Or paste image URL"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end border-t pt-4" style={{ borderColor: colors.lightGrey }}>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} isLoading={isPending}>
              {modalMode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
