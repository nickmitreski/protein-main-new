import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../types';
import { colors, components, spacing, typography } from '../../utils/design-system';
import { ProductBadge } from '../product/ProductBadge';
import StarRating from '../StarRating';

interface CatalogProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function CatalogProductCard({ product, onAddToCart }: CatalogProductCardProps) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 10;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className={`group ${components.card} flex flex-col relative h-full`}>
      {/* Badges */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <ProductBadge type={product.badge} />
        </div>
      )}

      {/* Discount Badge */}
      {hasDiscount && (
        <div
          className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
          style={{ backgroundColor: colors.error, color: colors.white }}
        >
          -{discountPercent}%
        </div>
      )}

      {/* Stock Warning */}
      {isLowStock && (
        <div className="absolute top-14 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 shadow-sm">
          <span style={{ color: colors.warning }}>Only {product.stock_quantity} left!</span>
        </div>
      )}

      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 z-10 bg-black bg-opacity-60 flex items-center justify-center rounded-t-lg">
          <div className="bg-white px-6 py-3 rounded-lg shadow-xl">
            <span className="font-bold text-lg" style={{ color: colors.error }}>
              OUT OF STOCK
            </span>
          </div>
        </div>
      )}

      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden rounded-t-lg" style={{ backgroundColor: colors.gray100 }}>
          <img
            src={product.image}
            alt={product.name}
            className={`${components.image} ${components.imageHover}`}
            loading="lazy"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className={`${spacing.cardPadding} flex flex-col flex-1`}>
        <div className="flex-1">
          {/* Category */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: colors.gray500, letterSpacing: '0.1em' }}
          >
            {product.category}
          </p>

          {/* Product Name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-base mb-2 leading-tight hover:opacity-70 transition-opacity line-clamp-2" style={{ color: colors.black }}>
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={product.rating} size={12} />
            <span className="text-xs font-medium" style={{ color: colors.gray600 }}>
              {product.rating} <span style={{ color: colors.gray400 }}>({product.review_count})</span>
            </span>
          </div>

          {/* Description */}
          <p className={`${typography.bodySmall} mb-4 line-clamp-2`} style={{ color: colors.gray600 }}>
            {product.description}
          </p>

          {/* Key Features */}
          {product.key_features && product.key_features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.key_features.slice(0, 2).map((feature) => (
                <span
                  key={feature}
                  className="text-xs px-2 py-1 rounded-md font-medium"
                  style={{
                    backgroundColor: colors.gray100,
                    color: colors.gray700,
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price and Action */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: colors.gray200 }}
        >
          <div className="flex flex-col">
            {hasDiscount && (
              <span
                className="text-sm line-through mb-1"
                style={{ color: colors.gray400 }}
              >
                ${product.compare_at_price?.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold" style={{ color: colors.black }}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`${components.buttonPrimary} px-4 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 hover:gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
