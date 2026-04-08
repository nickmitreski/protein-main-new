import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { colors } from '../../utils/design-system';

interface IngredientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  ingredients?: string[];
  allergens?: string[];
  warnings?: string;
}

export function IngredientsModal({
  isOpen,
  onClose,
  productName,
  ingredients = [],
  allergens = [],
  warnings,
}: IngredientsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div
          className="px-8 py-6 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">Ingredients & Safety</h2>
                <p className="text-sm opacity-90">{productName}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[calc(90vh-180px)] overflow-y-auto scrollbar-thin">
          {/* Ingredients List */}
          {ingredients.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5" style={{ color: colors.success }} />
                <h3 className="text-lg font-bold" style={{ color: colors.black }}>
                  Full Ingredients List
                </h3>
              </div>
              <div className="pl-7">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.gray700 }}
                >
                  {ingredients.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Allergen Information */}
          {allergens.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" style={{ color: colors.warning }} />
                <h3 className="text-lg font-bold" style={{ color: colors.black }}>
                  Allergen Information
                </h3>
              </div>
              <div
                className="pl-7 p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: '#FFF3CD',
                  borderColor: colors.warning,
                }}
              >
                <p className="text-sm font-semibold mb-2" style={{ color: colors.black }}>
                  Contains:
                </p>
                <ul className="text-sm space-y-1" style={{ color: colors.gray700 }}>
                  {allergens.map((allergen) => (
                    <li key={allergen}>• {allergen}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" style={{ color: colors.error }} />
                <h3 className="text-lg font-bold" style={{ color: colors.black }}>
                  Important Safety Information
                </h3>
              </div>
              <div
                className="pl-7 p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: '#FFF5F5',
                  borderColor: colors.error,
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: colors.gray700 }}>
                  {warnings}
                </p>
              </div>
            </div>
          )}

          {/* General Disclaimer */}
          <div className="pt-6 border-t" style={{ borderColor: colors.gray200 }}>
            <p className="text-xs leading-relaxed" style={{ color: colors.gray500 }}>
              <strong style={{ color: colors.black }}>Disclaimer:</strong> This product is a food
              supplement and should not be used as a substitute for a varied diet. Keep out of reach
              of children. If you are pregnant, breastfeeding, taking medication, or have a medical
              condition, consult your healthcare professional before use. Store in a cool, dry place
              away from direct sunlight.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-8 py-4 border-t flex justify-end"
          style={{ borderColor: colors.gray200 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
