import { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing, typography } from '../utils/design-system';
import { useSubscribe } from '../hooks/useSubscribers';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const subscribe = useSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const code = await subscribe.mutateAsync({ email: email.trim(), source: 'homepage' });
    setDiscountCode(code ?? 'WELCOME10');
    setSubmitted(true);
  };

  return (
    <section
      className={spacing.section}
      style={{ backgroundColor: colors.lightGrey }}
    >
      <div className={`${spacing.container} max-w-2xl mx-auto text-center`}>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: colors.red, letterSpacing: '0.15em' }}
        >
          Exclusive Offer
        </p>
        <h2 className={`${typography.h2} mb-4`} style={{ color: colors.black }}>
          Get 10% Off Your First Order
        </h2>
        <p className="text-base mb-10" style={{ color: colors.gray500 }}>
          Join our community for exclusive deals, fitness tips, and product drops.
        </p>

        {submitted ? (
          <div
            className="py-5 px-8 border text-sm font-medium space-y-1"
            style={{ borderColor: colors.red, color: colors.red }}
          >
            <p>You're in. Use code <strong>{discountCode}</strong> for 10% off your first order.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <label htmlFor="email-capture" className="sr-only">Email address</label>
            <input
              id="email-capture"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 px-5 py-4 text-sm border outline-none transition-colors"
              style={{
                borderColor: colors.lightGrey,
                backgroundColor: colors.white,
                color: colors.black,
              }}
            />
            <button
              type="submit"
              disabled={subscribe.isPending}
              className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: colors.red, letterSpacing: '0.1em' }}
            >
              {subscribe.isPending ? 'Subscribing…' : 'Get 10% Off'}
            </button>
          </form>
        )}

        <p className="text-xs mt-5" style={{ color: colors.gray400 }}>
          No spam. Unsubscribe anytime. By joining you agree to our{' '}
          <Link to="/privacy-policy" className="underline" style={{ color: colors.gray500 }}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
