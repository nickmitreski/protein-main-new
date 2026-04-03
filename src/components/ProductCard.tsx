import { Link } from 'react-router-dom';
import { ShoppingCart, TrendingUp, Award, Sparkles } from 'lucide-react';
import { Product } from '../data/products';
import { colors, components } from '../utils/design-system';
import StarRating from './StarRating';
import { useCartStore } from '../store/cartStore';
import { catalogProductToStoreProduct } from '../lib/catalogProductAdapter';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const badgeConfig = {
  'Best Seller': {
    bg: colors.primary,
    Icon: TrendingUp,
    color: '#fff'
  },
  'New': {
    bg: colors.accent,
    Icon: Sparkles,
    color: '#fff'
  },
  'Athlete Approved': {
    bg: colors.secondary,
    Icon: Award,
    color: '#fff'
  },
};

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const badge = product.badge ? badgeConfig[product.badge] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(catalogProductToStoreProduct(product));
    toast.success(`Added ${product.name} to cart!`, {
      duration: 2000,
      icon: '🛒',
    });
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className={`${components.cardProduct} flex flex-col relative h-full`}
    >
      {/* Badge */}
      {badge && product.badge && (
        <div
          className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 shadow-lg"
          style={{ backgroundColor: badge.bg, color: badge.color }}
        >
          <badge.Icon className="w-3.5 h-3.5" />
          <span>{product.badge}</span>
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

      {/* Stock Indicator */}
      {product.stock < 10 && product.stock > 0 && (
        <div className="absolute top-14 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 shadow-sm">
          <span style={{ color: colors.warning }}>Only {product.stock} left!</span>
        </div>
      )}

      {product.stock === 0 && (
        <div className="absolute inset-0 z-10 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white px-6 py-3 rounded-lg shadow-xl">
            <span className="font-bold text-lg" style={{ color: colors.error }}>
              OUT OF STOCK
            </span>
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className={`${components.image} ${components.imageHover}`}
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category */}
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: colors.gray500 }}
        >
          {product.category}
        </p>

        {/* Product Name */}
        <h3
          className="font-bold text-base sm:text-lg mb-2 leading-tight line-clamp-2 group-hover:text-opacity-80 transition-all"
          style={{ color: colors.black }}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <StarRating rating={product.rating} size={14} />
          </div>
          <span className="text-xs font-medium" style={{ color: colors.gray600 }}>
            {product.rating} <span style={{ color: colors.gray400 }}>({product.reviewCount})</span>
          </span>
        </div>

        {/* Description */}
        <p
          className="text-sm mb-4 line-clamp-2 flex-1"
          style={{ color: colors.gray600 }}
        >
          {product.description}
        </p>

        {/* Key Features */}
        {product.keyFeatures && product.keyFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.keyFeatures.slice(0, 2).map((feature) => (
              <span
                key={feature}
                className="text-xs px-2 py-1 rounded-md font-medium"
                style={{
                  backgroundColor: colors.gray100,
                  color: colors.gray700
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.gray200 }}>
          <div className="flex flex-col">
            {hasDiscount && (
              <span
                className="text-sm line-through mb-1"
                style={{ color: colors.gray400 }}
              >
                ${product.compareAtPrice?.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold" style={{ color: colors.black }}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`${components.buttonPrimary} px-4 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 hover:gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
