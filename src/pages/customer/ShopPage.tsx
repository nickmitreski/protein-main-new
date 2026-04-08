import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SimpleProductCard } from '../../components/customer/SimpleProductCard';
import { ProductModal } from '../../components/customer/ProductModal';
import { useProducts } from '../../hooks/useProducts';
import { colors, spacing, typography } from '../../utils/design-system';
import { PRODUCT_CATEGORIES, SORT_OPTIONS } from '../../constants';
import type { ProductFilters, Product } from '../../types';
import { Select } from '../../components/ui/Select';
import { SlidersHorizontal, X } from 'lucide-react';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<string>(() => searchParams.get('category') ?? '');
  const [sortBy, setSortBy] = useState<ProductFilters['sortBy']>('newest');
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setCategory(searchParams.get('category') ?? '');
    setSearch(searchParams.get('search') ?? '');
  }, [searchParams]);

  // Scroll to top when modal opens/closes
  useEffect(() => {
    if (selectedProduct) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedProduct]);

  const filters = useMemo<ProductFilters>(
    () => ({
      category: category || undefined,
      sortBy,
      search: search.trim() || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }),
    [category, sortBy, search, minPrice, maxPrice]
  );

  const { data: products = [], isLoading } = useProducts(filters);

  const handleCategoryChange = (v: string) => {
    setCategory(v);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (v) next.set('category', v);
        else next.delete('category');
        return next;
      },
      { replace: true }
    );
  };

  const activeFilterCount =
    (category ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (search ? 1 : 0);

  const clearFilters = () => {
    setCategory('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({}, { replace: true });
  };

  return (
    <>
      <div className={spacing.container + ' py-16'}>
        <header className="mb-10">
          <p className={typography.caption} style={{ color: colors.gray500 }}>
            Catalog
          </p>
          <h1 className={`${typography.h2} mt-2`} style={{ color: colors.black }}>
            Shop CoreForge
          </h1>
          <p className={`${typography.bodySmall} mt-3 max-w-2xl`} style={{ color: colors.gray500 }}>
            {products.length} product{products.length !== 1 ? 's' : ''} available
            {category ? ` in ${category}` : ''}
            {search ? ` matching "${search}"` : ''}
          </p>
        </header>

        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearch(v);
                  setSearchParams(
                    (prev) => {
                      const next = new URLSearchParams(prev);
                      if (v.trim()) next.set('search', v.trim());
                      else next.delete('search');
                      return next;
                    },
                    { replace: true }
                  );
                }}
                className="w-full border px-4 py-3 text-sm pr-10 rounded-lg"
                style={{ borderColor: colors.lightGrey, color: colors.black, backgroundColor: 'white' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete('search');
                      return next;
                    }, { replace: true });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={14} style={{ color: colors.gray500 }} />
                </button>
              )}
            </div>
            <div className="w-full sm:w-52">
              <Select
                label=""
                value={sortBy ?? 'newest'}
                onChange={(e) => setSortBy(e.target.value as ProductFilters['sortBy'])}
                options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-3 border text-sm font-medium rounded-lg"
              style={{
                borderColor: filtersOpen ? colors.black : colors.lightGrey,
                color: colors.black,
                backgroundColor: filtersOpen ? colors.lightGrey : 'white',
              }}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="ml-1 px-1.5 py-0.5 text-xs font-bold text-white rounded-full"
                  style={{ backgroundColor: colors.red }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-3 text-xs uppercase tracking-wider hover:opacity-70"
                style={{ color: colors.red }}
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>

          {filtersOpen && (
            <div
              className="border p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 rounded-lg"
              style={{ borderColor: colors.lightGrey, backgroundColor: colors.gray50 }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.gray500 }}>
                  Category
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!category}
                      onChange={() => handleCategoryChange('')}
                      className="accent-red-600"
                    />
                    <span className="text-sm" style={{ color: colors.black }}>All Products</span>
                  </label>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={category === c.id}
                        onChange={() => handleCategoryChange(c.id)}
                        className="accent-red-600"
                      />
                      <span className="text-sm" style={{ color: colors.black }}>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: colors.gray500 }}>
                  Price Range
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border px-3 py-2 text-sm rounded"
                    style={{ borderColor: colors.lightGrey }}
                    min="0"
                  />
                  <span style={{ color: colors.gray500 }}>–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border px-3 py-2 text-sm rounded"
                    style={{ borderColor: colors.lightGrey }}
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {[{ value: '', label: 'All' }, ...PRODUCT_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))].map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => handleCategoryChange(c.value)}
                className="px-4 py-2 text-xs font-medium uppercase tracking-wider border transition-all rounded-lg"
                style={{
                  borderColor: category === c.value ? colors.black : colors.lightGrey,
                  backgroundColor: category === c.value ? colors.black : 'white',
                  color: category === c.value ? 'white' : colors.black,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <SimpleProductCard
                key={p.id}
                product={p}
                onView={() => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="text-center py-20 border rounded-lg" style={{ borderColor: colors.lightGrey }}>
            <p className="text-lg font-medium mb-2" style={{ color: colors.black }}>
              No products found
            </p>
            <p className="text-sm mb-6" style={{ color: colors.gray500 }}>
              Try adjusting your search or filters
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-3 text-sm font-medium uppercase tracking-wider rounded-lg"
              style={{ backgroundColor: colors.black, color: 'white' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
