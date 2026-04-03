import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SquarePaymentForm } from '../../components/customer/SquarePaymentForm';
import { colors, spacing, typography } from '../../design-system';
import { CURRENCY, CURRENCY_SYMBOL } from '../../constants';
import { useCartStore } from '../../store/cartStore';
import { useCreateOrder } from '../../hooks/useOrders';
import { useValidateCoupon, computeDiscount } from '../../hooks/useCoupons';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  processSquarePayment,
  generateIdempotencyKey,
  toCents,
  isSquareConfigured,
  getUserFriendlyErrorMessage,
} from '../../lib/payment';
import type { Address, Order, Coupon } from '../../types';
import { Tag, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type CheckoutStep = 'shipping' | 'payment';

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTax = useCartStore((s) => s.getTax);
  const getShipping = useCartStore((s) => s.getShipping);
  const getTotal = useCartStore((s) => s.getTotal);
  const createOrder = useCreateOrder();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const validateCoupon = useValidateCoupon();

  const squareConfigured = isSquareConfigured();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Australia');
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  const subtotal = getSubtotal();
  const discount = appliedCoupon ? computeDiscount(appliedCoupon, subtotal) : 0;
  const tax = getTax();
  const shipping = getShipping();
  const total = Math.max(0, getTotal() - discount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const coupon = await validateCoupon.mutateAsync({ code: couponInput.trim(), subtotal });
      setAppliedCoupon(coupon);
      toast.success(`Coupon applied — ${coupon.type === 'percentage' ? `${coupon.value}% off` : `${CURRENCY_SYMBOL}${coupon.value} off`}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const shippingAddress: Address = {
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    address1: address1.trim(),
    city: city.trim(),
    province: province.trim(),
    postal_code: postalCode.trim(),
    country: country.trim() || 'Australia',
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedPolicies) {
      toast.error('Please confirm you agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !address1.trim() || !city.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    for (const { product, quantity } of items) {
      if (product.stock_quantity < quantity) {
        toast.error(`${product.name} is not available in that quantity.`);
        return;
      }
    }

    if (!isSupabaseConfigured) {
      const now = new Date().toISOString();
      const localOrder: Order = {
        id: `demo-${Date.now()}`,
        order_number: `CFG-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        customer_id: null,
        customer_email: email.trim(),
        customer_name: `${firstName} ${lastName}`.trim(),
        status: 'pending',
        payment_status: 'pending',
        fulfillment_status: 'unfulfilled',
        subtotal,
        tax,
        shipping,
        discount,
        total,
        currency: CURRENCY,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        coupon_code: appliedCoupon?.code,
        created_at: now,
        updated_at: now,
      };
      if (squareConfigured) {
        setPendingOrder(localOrder);
        setStep('payment');
      } else {
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/order-confirmation', { state: { order: localOrder } });
      }
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        order: {
          customer_id: null,
          customer_email: email.trim(),
          customer_name: `${firstName} ${lastName}`.trim(),
          status: 'pending',
          payment_status: 'pending',
          fulfillment_status: 'unfulfilled',
          subtotal,
          tax,
          shipping,
          discount,
          total,
          currency: CURRENCY,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          coupon_code: appliedCoupon?.code,
        },
        items: items.map(({ product, quantity }) => ({
          product_id: product.id,
          product_name: product.name,
          product_image: product.image,
          sku: product.sku,
          quantity,
          price: product.price,
          total: product.price * quantity,
        })),
      });

      if (squareConfigured) {
        setPendingOrder(order);
        setStep('payment');
        setPaymentError(null);
        setRetryCount(0);
      } else {
        clearCart();
        toast.success(`Order ${order.order_number} placed successfully!`);
        navigate('/order-confirmation', { state: { order } });
      }
    } catch {
      /* useCreateOrder already toasts on error */
    }
  };

  const handleTokenize = async (sourceId: string) => {
    if (!pendingOrder) return;

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const amountCents = toCents(pendingOrder.total);
      const idempotencyKey = generateIdempotencyKey(pendingOrder.id);

      const result = await processSquarePayment({
        sourceId,
        orderId: pendingOrder.id,
        amountCents,
        currency: pendingOrder.currency,
        idempotencyKey,
        buyerEmailAddress: pendingOrder.customer_email,
      });

      if (!result.success) {
        const friendlyError = getUserFriendlyErrorMessage(result.error || 'Payment failed');
        setPaymentError(friendlyError);
        toast.error(friendlyError);
        setIsProcessingPayment(false);
        setRetryCount((prev) => prev + 1);
        return;
      }

      // Payment successful
      const paidOrder: Order = {
        ...pendingOrder,
        payment_status: result.status === 'COMPLETED' ? 'paid' : 'pending',
        payment_reference_id: result.paymentId,
      };

      clearCart();
      toast.success(`Payment successful — order ${paidOrder.order_number} confirmed.`);
      navigate('/order-confirmation', { state: { order: paidOrder } });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Payment failed';
      const friendlyError = getUserFriendlyErrorMessage(errorMsg);
      setPaymentError(friendlyError);
      toast.error(friendlyError);
      setIsProcessingPayment(false);
      setRetryCount((prev) => prev + 1);
    }
  };

  const handlePaymentError = (message: string) => {
    toast.error(message);
  };

  if (items.length === 0 && !pendingOrder) {
    return (
      <div className={spacing.container + ' py-24 max-w-2xl'}>
        <h1 className={`${typography.h2} mb-4`} style={{ color: colors.neutral.black }}>
          Checkout
        </h1>
        <p className="mb-8" style={{ color: colors.neutral[500] }}>
          Your cart is empty. Add products before checking out.
        </p>
        <Button variant="outline" onClick={() => navigate('/shop')}>
          Continue shopping
        </Button>
      </div>
    );
  }

  const orderSummary = (
    <div className="border p-6 h-fit" style={{ borderColor: colors.neutral[200] }}>
      <h2 className="text-sm font-bold uppercase tracking-wider mb-6" style={{ color: colors.neutral.black }}>
        Order summary
      </h2>
      <ul className="space-y-3 text-sm mb-6" style={{ color: colors.neutral[500] }}>
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex justify-between gap-2">
            <span className="min-w-0 truncate">
              {product.name} × {quantity}
            </span>
            <span className="shrink-0">
              {CURRENCY_SYMBOL}{(product.price * quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      {appliedCoupon ? (
        <div className="flex items-center justify-between text-sm mb-4 px-3 py-2 border" style={{ borderColor: '#16a34a', backgroundColor: '#f0fdf4' }}>
          <span className="flex items-center gap-2 font-semibold" style={{ color: '#16a34a' }}>
            <Tag size={12} />
            {appliedCoupon.code}
          </span>
          <button type="button" onClick={removeCoupon} className="hover:opacity-70">
            <X size={14} style={{ color: '#16a34a' }} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Coupon code"
            className="flex-1 border px-3 py-2 text-xs uppercase tracking-wider"
            style={{ borderColor: colors.neutral[200], color: colors.neutral.black }}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={validateCoupon.isPending}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border hover:bg-gray-50 disabled:opacity-50"
            style={{ borderColor: colors.neutral[200], color: colors.neutral.black }}
          >
            Apply
          </button>
        </div>
      )}
      <div className="space-y-2 text-sm border-t pt-4" style={{ borderColor: colors.neutral[200] }}>
        <div className="flex justify-between" style={{ color: colors.neutral[500] }}>
          <span>Subtotal</span>
          <span>{CURRENCY_SYMBOL}{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between" style={{ color: colors.neutral[500] }}>
          <span>GST (10%)</span>
          <span>{CURRENCY_SYMBOL}{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between" style={{ color: colors.neutral[500] }}>
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `${CURRENCY_SYMBOL}${shipping.toFixed(2)}`}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between" style={{ color: '#16a34a' }}>
            <span>Discount ({appliedCoupon?.code})</span>
            <span>−{CURRENCY_SYMBOL}{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold pt-2" style={{ color: colors.neutral.black }}>
          <span>Total (AUD)</span>
          <span>{CURRENCY_SYMBOL}{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  if (step === 'payment' && pendingOrder) {
    return (
      <div className={spacing.container + ' py-16'}>
        <h1 className={`${typography.h2} mb-2`} style={{ color: colors.neutral.black }}>
          Payment
        </h1>
        <p className="mb-10 text-sm" style={{ color: colors.neutral[500] }}>
          Order {pendingOrder.order_number} — enter your card details below.
        </p>

        {/* Payment error banner */}
        {paymentError && retryCount > 0 && (
          <div
            style={{
              marginBottom: spacing.lg,
              padding: spacing.md,
              backgroundColor: colors.error.bg,
              border: `1px solid ${colors.error.light}`,
              borderRadius: '8px',
              display: 'flex',
              gap: spacing.sm,
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={20} style={{ color: colors.error.main, flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.error.dark, marginBottom: spacing[1] }}>
                Payment Failed
              </p>
              <p style={{ fontSize: typography.fontSize.sm, color: colors.error.dark }}>
                {paymentError}
              </p>
              {retryCount >= 2 && (
                <p style={{ fontSize: typography.fontSize.sm, color: colors.error.dark, marginTop: spacing[2] }}>
                  Need help? <a href="mailto:support@coreforge.com" style={{ textDecoration: 'underline', fontWeight: typography.fontWeight.semibold }}>Contact our support team</a>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: colors.neutral.black }}>
              Card details
            </h2>
            <SquarePaymentForm
              onTokenize={handleTokenize}
              onError={handlePaymentError}
              isLoading={isProcessingPayment}
            />
            <button
              type="button"
              className="text-sm underline"
              style={{ color: colors.neutral[500] }}
              onClick={() => {
                setStep('shipping');
                setPaymentError(null);
                setRetryCount(0);
              }}
              disabled={isProcessingPayment}
            >
              Back to shipping
            </button>
          </div>
          {orderSummary}
        </div>
      </div>
    );
  }

  return (
    <div className={spacing.container + ' py-16'}>
      <h1 className={`${typography.h2} mb-10`} style={{ color: colors.neutral.black }}>
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl">
        <form onSubmit={handleShippingSubmit} className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: colors.neutral.black }}>
            Contact & shipping
          </h2>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Input label="Address" value={address1} onChange={(e) => setAddress1(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="State / Territory" value={province} onChange={(e) => setProvince(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Postcode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <label className="flex gap-3 items-start text-sm cursor-pointer max-w-xl" style={{ color: colors.neutral[500] }}>
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300"
              checked={acceptedPolicies}
              onChange={(e) => setAcceptedPolicies(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <Link to="/terms-of-service" className="underline font-medium" style={{ color: colors.neutral.black }}>
                Terms of Service
              </Link>
              ,{' '}
              <Link to="/privacy-policy" className="underline font-medium" style={{ color: colors.neutral.black }}>
                Privacy Policy
              </Link>
              , and{' '}
              <Link to="/supplement-disclaimer" className="underline font-medium" style={{ color: colors.neutral.black }}>
                supplement disclaimer
              </Link>
              . I understand products are not intended to diagnose, treat, cure, or prevent disease.
            </span>
          </label>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/cart')}>
              Back to cart
            </Button>
            <Button type="submit" isLoading={createOrder.isPending} disabled={createOrder.isPending}>
              {squareConfigured ? 'Continue to payment' : 'Place order'}
            </Button>
          </div>
        </form>

        {orderSummary}
      </div>
    </div>
  );
}
