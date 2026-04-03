import { products } from '../data/products';
import ProductCard from './ProductCard';
import SectionHeader from './SectionHeader';
import { spacing, layout } from '../utils/design-system';

export default function FeaturedProducts() {
  return (
    <section className={spacing.section} id="featured">
      <div className={spacing.container}>
        <SectionHeader
          title="Featured Products"
          subtitle="Science-backed formulations trusted by athletes"
        />

        <div className={`${layout.grid4} ${spacing.gap}`}>
          {products
            .filter((product) => product.isFeatured)
            .slice(0, 8)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </div>
    </section>
  );
}
