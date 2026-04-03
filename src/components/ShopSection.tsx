import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { CatalogProductCard } from './customer/CatalogProductCard';
import { ProductGrid } from './product/ProductGrid';
import { ProductSkeleton } from './product/ProductSkeleton';
import { CategoryFilter } from './product/CategoryFilter';
import { Button } from './ui/Button';
import { colors, spacing, typography } from '../utils/design-system';
import { PRODUCT_CATEGORIES } from '../constants';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const INITIAL_DISPLAY_COUNT = 8;

export default function ShopSection() {
  const [activeCategory, setActiveCategory] = useState('');
  const [showAll, setShowAll] = useState(false);

  const { data: products = [], isLoading } = useProducts({
    category: activeCategory || undefined,
  });

  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (product: Parameters<typeof addItem>[0]) => {
    addItem(product, 1);
    toast.success('Added to cart');
  };

  const displayedProducts = useMemo(() => {
    if (activeCategory || showAll) {
      return products;
    }
    return products.slice(0, INITIAL_DISPLAY_COUNT);
  }, [products, activeCategory, showAll]);

  const hasMore = !activeCategory && !showAll && products.length > INITIAL_DISPLAY_COUNT;

  return (
    <section className={spacing.section} id="shop" style={{ backgroundColor: colors.lightGrey }}>
      <div className={spacing.container}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: colors.red, letterSpacing: '0.15em' }}
            >
              Shop
            </p>
            <h2
              className={typography.h2}
              style={{ color: colors.black, lineHeight: '1.1' }}
            >
              The full range
            </h2>
          </div>

          <CategoryFilter
            categories={PRODUCT_CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={(cat) => {
              setActiveCategory(cat);
              setShowAll(false);
            }}
          />
        </div>

        {isLoading ? (
          <ProductGrid>
            {Array.from({ length: INITIAL_DISPLAY_COUNT }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </ProductGrid>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium" style={{ color: colors.gray600 }}>
              No products found in this category
            </p>
          </div>
        ) : (
          <>
            <ProductGrid>
              {displayedProducts.map((product) => (
                <CatalogProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </ProductGrid>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button variant="outline" size="lg" onClick={() => setShowAll(true)}>
                  View More ({products.length - INITIAL_DISPLAY_COUNT} more)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
