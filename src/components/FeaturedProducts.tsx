import { useState } from 'react';
import { products } from '../data/products';
import { SimpleProductCard } from './customer/SimpleProductCard';
import { ProductModal } from './customer/ProductModal';
import SectionHeader from './SectionHeader';
import { spacing } from '../utils/design-system';
import type { Product } from '../types';

export default function FeaturedProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <section className={spacing.section} id="featured">
        <div className={spacing.container}>
          <SectionHeader
            title="Featured Products"
            subtitle="Science-backed formulations trusted by athletes"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter((product) => product.isFeatured)
              .slice(0, 8)
              .map((product) => (
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
