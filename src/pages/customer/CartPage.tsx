import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../utils/design-system';
import { CURRENCY_SYMBOL, SHIPPING_RATES } from '../../constants';
import { ShoppingBag, Truck, X, Minus, Plus } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = SHIPPING_RATES.free.min;

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTax = useCartStore((s) => s.getTax);
  const getShipping = useCartStore((s) => s.getShipping);
  const getTotal = useCartStore((s) => s.getTotal);

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = getShipping();
  const total = getTotal();

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className={spacing.container + ' py-16'}>
      <div className="flex items-baseline justify-between mb-10">
        <h1 className={typography.h2} style={{ color: colors.black }}>
          Cart
        </h1>
        {items.length > 0 && (
          <p className="text-sm" style={{ color: colors.gray500 }}>
            {items.reduce((sum, i) => sum + i.quantity, 0)} item{items.reduce((sum, i) => sum + i.quantity, 0) !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="border py-20 text-center" style={{ borderColor: colors.lightGrey }}>
          <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: colors.lightGrey }} />
          <p className="text-lg font-medium mb-2" style={{ color: colors.black }}>
            Your cart is empty
          </p>
          <p className="text-sm mb-8" style={{ color: colors.gray500 }}>
            Add some products to get started
          </p>
          <Button onClick={() => navigate('/shop')}>Shop Now</Button>
        </div>
      ) : (
        <>
          {amountToFreeShipping > 0 ? (
            <div
              className="mb-6 p-4 border"
              style={{ borderColor: colors.lightGrey, backgroundColor: colors.gray50 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Truck size={16} style={{ color: colors.gray500 }} />
                <p className="text-sm" style={{ color: colors.black }}>
                  Add{' '}
                  <strong>
                    {CURRENCY_SYMBOL}{amountToFreeShipping.toFixed(2)}
                  </strong>{' '}
                  more for free shipping
                </p>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%`, backgroundColor: colors.red }}
                />
              </div>
            </div>
          ) : (
            <div
              className="mb-6 p-4 border flex items-center gap-2"
              style={{ borderColor: colors.success, backgroundColor: '#F0FAF9' }}
            >
              <Truck size={16} style={{ color: colors.success }} />
              <p className="text-sm font-semibold" style={{ color: colors.success }}>
                You qualify for free shipping!
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-3">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 border p-4 group"
                  style={{ borderColor: colors.lightGrey }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="shrink-0 overflow-hidden w-24 h-24"
                    style={{ backgroundColor: colors.lightGrey }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="font-semibold text-left hover:underline leading-tight"
                        style={{ color: colors.black }}
                      >
                        {product.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="shrink-0 p-1 hover:opacity-70 transition-opacity"
                      >
                        <X size={14} style={{ color: colors.gray500 }} />
                      </button>
                    </div>
                    <p className="text-sm mt-1 mb-4" style={{ color: colors.gray500 }}>
                      {CURRENCY_SYMBOL}{product.price.toFixed(2)} each
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border" style={{ borderColor: colors.lightGrey }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (quantity <= 1) removeItem(product.id);
                            else updateQuantity(product.id, quantity - 1);
                          }}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} style={{ color: colors.black }} />
                        </button>
                        <span
                          className="px-4 py-2 text-sm font-semibold border-x min-w-[40px] text-center"
                          style={{ color: colors.black, borderColor: colors.lightGrey }}
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={12} style={{ color: colors.black }} />
                        </button>
                      </div>
                      <p className="font-bold text-right" style={{ color: colors.black }}>
                        {CURRENCY_SYMBOL}{(product.price * quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border p-6 h-fit" style={{ borderColor: colors.lightGrey }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6" style={{ color: colors.black }}>
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between" style={{ color: colors.gray500 }}>
                  <span>Subtotal</span>
                  <span>
                    {CURRENCY_SYMBOL}{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: colors.gray500 }}>
                  <span>GST (10%)</span>
                  <span>
                    {CURRENCY_SYMBOL}{tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: shipping === 0 ? colors.success : colors.gray500 }}>
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : `${CURRENCY_SYMBOL}${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div
                  className="flex justify-between pt-4 border-t text-base font-bold"
                  style={{ borderColor: colors.lightGrey, color: colors.black }}
                >
                  <span>Total</span>
                  <span>
                    {CURRENCY_SYMBOL}{total.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button fullWidth className="mt-8" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="w-full mt-3 py-3 text-sm font-medium uppercase tracking-wider hover:opacity-70 transition-opacity"
                style={{ color: colors.gray500 }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
