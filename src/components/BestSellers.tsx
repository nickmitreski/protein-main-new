import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from './ProductCard';
import { colors, spacing, layout, typography, components } from '../utils/design-system';

export default function BestSellers() {
  const bestSellers = products.filter((p) => p.badge === 'Best Seller').slice(0, 4);

  return (
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

        <div className={`${layout.grid4} ${spacing.gap}`}>
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
