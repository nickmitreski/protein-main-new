import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { SimpleProductCard } from './customer/SimpleProductCard';
import { ProductModal } from './customer/ProductModal';
import { colors, spacing, typography, components } from '../utils/design-system';
import type { Product } from '../types';

export default function BestSellers() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const bestSellers = products.filter((p) => p.badge === 'Best Seller').slice(0, 4);

  return (
    <>
      <section className={spacing.section} style={{ backgroundColor: colors.white }} id="bestsellers">
        <div className={spacing.container}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: colors.red, letterSpacing: '0.15em' }}
              >
                Top Picks
              </p>
              <h2 className={typography.h2} style={{ color: colors.black, lineHeight: '1.1' }}>
                Popular picks for active lifestyles
              </h2>
            </div>
            <Link
              to="/shop"
              className={`${components.button} ${components.buttonPrimary} inline-flex items-center justify-center no-underline`}
            >
              View all products
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <SimpleProductCard
                key={product.id}
                product={product}
                onView={() => setSelectedProduct(product as unknown as Product)}
              />
            ))}
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
