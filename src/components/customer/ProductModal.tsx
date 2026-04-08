import { X, ArrowLeft } from 'lucide-react';
import { colors } from '../../utils/design-system';
import { getProductStatus, getStatusLabel } from '../../utils/productStatus';
import type { Product } from '../../types';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  if (!isOpen) return null;

  const productStatus = getProductStatus(product.sku || product.id);
  const statusLabel = getStatusLabel(productStatus);
  const isAvailable = productStatus === 'available';

  // Prevent body scroll when modal is open
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" style={{ color: colors.gray600 }} />
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: colors.black }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Content */}
        <div className="pt-16 pb-8 px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-50">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold mb-4" style={{ color: colors.black }}>
                {product.name}
              </h1>

              <p className="text-xl font-bold mb-4" style={{ color: colors.black }}>
                ${product.price.toFixed(2)}
              </p>

              <p className="text-base leading-relaxed mb-6" style={{ color: colors.gray600 }}>
                {product.description}
              </p>

              {product.key_features && product.key_features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: colors.gray500 }}>
                    Key Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.key_features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 text-xs font-medium border rounded-full"
                        style={{ borderColor: colors.gray300, color: colors.gray700 }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-6 border-t" style={{ borderColor: colors.gray200 }}>
                {/* Status Badge */}
                {!isAvailable && (
                  <div className="mb-4">
                    <span
                      className="inline-block px-4 py-2 text-sm font-bold uppercase tracking-wider rounded"
                      style={{
                        backgroundColor: productStatus === 'sold-out' ? colors.error : colors.warning,
                        color: productStatus === 'sold-out' ? colors.white : colors.black,
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                )}

                {/* Add to Cart Button (Greyed Out) */}
                <button
                  type="button"
                  disabled
                  className="w-full py-4 text-base font-bold rounded-lg cursor-not-allowed opacity-50"
                  style={{
                    backgroundColor: colors.gray400,
                    color: colors.white,
                  }}
                >
                  {isAvailable ? 'Add to Cart' : statusLabel}
                </button>

                <p className="text-xs mt-3 text-center" style={{ color: colors.gray500 }}>
                  {isAvailable
                    ? 'Currently unavailable for purchase'
                    : `This product is ${statusLabel.toLowerCase()}`}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(product.ingredients || product.benefits) && (
            <div className="mt-8 pt-8 border-t" style={{ borderColor: colors.gray200 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {product.benefits && product.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: colors.black }}>
                      Key Benefits
                    </h3>
                    <ul className="space-y-2">
                      {product.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2 text-sm" style={{ color: colors.gray600 }}>
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.ingredients && product.ingredients.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: colors.black }}>
                      Ingredients
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: colors.gray600 }}>
                      {product.ingredients.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
