import { Link } from 'react-router-dom';
import { ShoppingCart, Zap } from 'lucide-react';
import type { Product } from '../../types';
import { colors, components, spacing, typography } from '../../utils/design-system';
import { ProductBadge } from '../product/ProductBadge';
import { ProductStatusBadge } from './ProductStatusBadge';
import { getProductStatus, isProductPurchasable } from '../../utils/productStatus';
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

  const productStatus = getProductStatus(product.sku || product.id);
  const canPurchase = isProductPurchasable(productStatus);
  const isLowStock = canPurchase && product.stock_quantity > 0 && product.stock_quantity < 10;

  return (
    <div className={`group ${components.card} flex flex-col relative h-full overflow-hidden transition-all duration-300 hover:shadow-2xl`}>
      {/* Web3-style gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}
      />

      {/* Badges */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <ProductBadge type={product.badge} />
        </div>
      )}

      {/* Discount Badge */}
      {hasDiscount && canPurchase && (
        <div
          className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse"
          style={{ backgroundColor: colors.error, color: colors.white }}
        >
          -{discountPercent}%
        </div>
      )}

      {/* Stock Warning */}
      {isLowStock && (
        <div className="absolute top-14 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-1">
            <Zap size={12} style={{ color: colors.warning }} />
            <span style={{ color: colors.warning }}>Only {product.stock_quantity} left!</span>
          </div>
        </div>
      )}

      {/* Status Overlay (Sold Out / Coming Soon) */}
      {!canPurchase && (
        <div className="absolute inset-0 z-10 bg-black bg-opacity-70 flex items-center justify-center rounded-t-lg backdrop-blur-sm">
          <ProductStatusBadge status={productStatus} className="shadow-2xl transform scale-125" />
        </div>
      )}

      {/* Product Image with gradient background */}
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden rounded-t-lg relative"
          style={{
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 50%, #f093fb15 100%)',
          }}
        >
          {/* Animated gradient border effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, #667eea30 0%, #764ba230 100%)',
              filter: 'blur(20px)',
            }}
          />
          <img
            src={product.image}
            alt={product.name}
            className={`${components.image} ${components.imageHover} relative z-10`}
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
            disabled={!canPurchase}
            className={`${components.buttonPrimary} px-4 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 hover:gap-3 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:gap-2`}
            aria-label={`Add ${product.name} to cart`}
            title={!canPurchase ? `This product is ${productStatus === 'sold-out' ? 'sold out' : 'coming soon'}` : undefined}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{canPurchase ? 'Add' : productStatus === 'sold-out' ? 'Sold Out' : 'Soon'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
