import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { SimpleProductCard } from './customer/SimpleProductCard';
import { ProductModal } from './customer/ProductModal';
import { ProductSkeleton } from './product/ProductSkeleton';
import { CategoryFilter } from './product/CategoryFilter';
import { Button } from './ui/Button';
import { colors, spacing, typography } from '../utils/design-system';
import { PRODUCT_CATEGORIES } from '../constants';
import type { Product } from '../types';

const INITIAL_DISPLAY_COUNT = 8;

export default function ShopSection() {
  const [activeCategory, setActiveCategory] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useProducts({
    category: activeCategory || undefined,
  });

  const displayedProducts = useMemo(() => {
    if (activeCategory || showAll) {
      return products;
    }
    return products.slice(0, INITIAL_DISPLAY_COUNT);
  }, [products, activeCategory, showAll]);

  const hasMore = !activeCategory && !showAll && products.length > INITIAL_DISPLAY_COUNT;

  return (
    <>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: INITIAL_DISPLAY_COUNT }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-medium" style={{ color: colors.gray600 }}>
                No products found in this category
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <SimpleProductCard
                    key={product.id}
                    product={product}
                    onView={() => setSelectedProduct(product)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button variant="outline" size="lg" onClick={() => setShowAll(true)}>
                    View More ({products.length - INITIAL_DISPLAY_COUNT} more)
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-block px-8 py-4 text-base font-bold uppercase tracking-wider rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.primary, color: colors.white }}
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

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
