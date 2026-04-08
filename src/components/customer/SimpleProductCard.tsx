import { colors, spacing } from '../../utils/design-system';

interface SimpleProductCardProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
  onView: () => void;
}

export function SimpleProductCard({ product, onView }: SimpleProductCardProps) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200" style={{ borderColor: colors.gray200 }}>
      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className={spacing.cardPadding}>
        {/* Product Name */}
        <h3 className="font-semibold text-base mb-3 line-clamp-2 min-h-[3rem]" style={{ color: colors.black }}>
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          ${product.price.toFixed(2)}
        </p>

        {/* View Button */}
        <button
          type="button"
          onClick={onView}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: colors.primary, color: colors.white }}
        >
          View
        </button>
      </div>
    </div>
  );
}
