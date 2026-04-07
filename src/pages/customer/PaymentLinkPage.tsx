import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SquarePaymentForm } from '../../components/customer/SquarePaymentForm';
import { colors, spacing, typography, borderRadius } from '../../design-system';
import { supabase, getBrowserSupabaseAnonKey } from '../../lib/supabase';
import { EMBED_MSG, useEmbedMessaging } from '../../lib/embedMessaging';
import { Lock, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentLinkData {
  payment_id: string;
  amount: number;
  currency: string;
  expires_at: string;
  metadata?: Record<string, unknown>;
  status: string;
  reference?: string | null;
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.length === 3 ? currency.toUpperCase() : 'AUD',
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Checkout callers may send `customer_first_name` / `customer_last_name` in metadata. */
function customerDisplayName(metadata?: Record<string, unknown>): string | null {
  if (!metadata) return null;
  const first =
    typeof metadata.customer_first_name === 'string' ? metadata.customer_first_name.trim() : '';
  const last =
    typeof metadata.customer_last_name === 'string' ? metadata.customer_last_name.trim() : '';
  const full = [first, last].filter(Boolean).join(' ');
  return full || null;
}

type PaymentLinkPageProps = {
  /** No site chrome; postMessage to parent; use with partner iframe + `VITE_EMBED_PARENT_ORIGINS`. */
  embed?: boolean;
};

export function PaymentLinkPage({ embed = false }: PaymentLinkPageProps) {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { postToParent } = useEmbedMessaging(embed);

  const [loading, setLoading] = useState(true);
  const [paymentLink, setPaymentLink] = useState<PaymentLinkData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Code verification state
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Time remaining
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Neutral tab title for white-label pay pages (avoid storefront name from index.html).
  useEffect(() => {
    const title =
      (import.meta.env.VITE_PAY_PAGE_TITLE as string | undefined)?.trim() || 'Secure payment';
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, []);

  const trustDisclosure = (import.meta.env.VITE_PAY_TRUST_DISCLOSURE as string | undefined)?.trim();

  function handleDismissToPartner() {
    if (embed) {
      postToParent(EMBED_MSG.ERROR, {
        reason: 'dismiss',
        payment_id: paymentId ?? null,
      });
      return;
    }
    navigate('/');
  }

  function handleSuccessDone() {
    if (embed && paymentLink) {
      postToParent(EMBED_MSG.SUCCESS, {
        payment_id: paymentLink.payment_id,
        reference: paymentLink.reference ?? null,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
      });
      return;
    }
    navigate('/');
  }

  // Fetch payment link details
  useEffect(() => {
    async function fetchPaymentLink() {
      if (!paymentId) {
        setError('Invalid payment link');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase.rpc('get_payment_link_public', {
          p_payment_id: paymentId,
        });

        if (fetchError || data == null) {
          setError('Payment link not found');
          setLoading(false);
          return;
        }

        const row = data as PaymentLinkData;

        // Check if expired
        const now = new Date();
        const expiresAt = new Date(row.expires_at);
        if (now > expiresAt && row.status === 'pending') {
          setError('This payment link has expired');
          setLoading(false);
          return;
        }

        // Check if already paid
        if (row.status === 'paid') {
          setPaymentSuccess(true);
        }

        setPaymentLink(row);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment link:', err);
        setError('Failed to load payment link');
        setLoading(false);
      }
    }

    fetchPaymentLink();
  }, [paymentId]);

  // Update time remaining countdown
  useEffect(() => {
    if (!paymentLink || paymentLink.status !== 'pending') return;

    const updateTimer = () => {
      const now = new Date();
      const expiresAt = new Date(paymentLink.expires_at);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setError('This payment link has expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [paymentLink]);

  // Verify code
  async function handleVerifyCode() {
    if (!code.trim()) {
      setCodeError('Please enter the access code');
      return;
    }

    setIsVerifying(true);
    setCodeError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const anonKey = getBrowserSupabaseAnonKey();

      const response = await fetch(`${supabaseUrl}/functions/v1/verify-payment-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken || anonKey}`,
        },
        body: JSON.stringify({
          payment_id: paymentId,
          code: code.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.valid) {
        setCodeError(result.error || 'Invalid code');
        setIsVerifying(false);
        return;
      }

      if (typeof result.unlock_token !== 'string' || !result.unlock_token) {
        setCodeError('Verification incomplete. Please try again.');
        setIsVerifying(false);
        return;
      }

      setUnlockToken(result.unlock_token);
      setIsCodeValid(true);
      toast.success('Code verified! You can now complete payment.');
    } catch (err) {
      console.error('Error verifying code:', err);
      setCodeError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }

  // Process payment
  async function handleTokenize(sourceId: string) {
    if (!paymentLink || !unlockToken) {
      setPaymentError('Please verify your access code first.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const anonKey = getBrowserSupabaseAnonKey();

      // Generate idempotency key
      const idempotencyKey = `${paymentId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const response = await fetch(`${supabaseUrl}/functions/v1/process-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken || anonKey}`,
        },
        body: JSON.stringify({
          payment_id: paymentId,
          sourceId,
          idempotencyKey,
          unlockToken,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setPaymentError(result.error || 'Payment failed. Please try again.');
        toast.error(result.error || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Payment successful
      setPaymentSuccess(true);
      toast.success('Payment completed successfully!');
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentError('An error occurred during payment processing');
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  }

  const outerMinHeight = embed ? '100%' : '100vh';

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: outerMinHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <p style={{ fontSize: typography.fontSize.lg, color: colors.text.secondary }}>Loading payment...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          minHeight: outerMinHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.md,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <AlertCircle size={64} style={{ color: colors.error.main, margin: '0 auto', marginBottom: spacing.lg }} />
          <h1 style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, marginBottom: spacing.md }}>
            {error}
          </h1>
          <Button variant="primary" onClick={handleDismissToPartner}>
            {embed ? 'Close' : 'Return to Home'}
          </Button>
        </div>
      </div>
    );
  }

  // Payment success state
  if (paymentSuccess && paymentLink) {
    return (
      <div
        style={{
          minHeight: outerMinHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.md,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <CheckCircle size={64} style={{ color: colors.success.main, margin: '0 auto', marginBottom: spacing.lg }} />
          <h1 style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, marginBottom: spacing.md }}>
            Payment Completed!
          </h1>
          <p style={{ fontSize: typography.fontSize.lg, color: colors.text.secondary, marginBottom: spacing.lg }}>
            Your payment of {formatMoney(paymentLink.amount, paymentLink.currency)} has been processed successfully.
          </p>
          <div
            style={{
              padding: spacing.lg,
              backgroundColor: colors.neutral[50],
              borderRadius: borderRadius.base,
              marginBottom: spacing.lg,
            }}
          >
            <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
              Payment ID: <strong style={{ color: colors.text.primary }}>{paymentLink.payment_id}</strong>
            </p>
          </div>
          {embed && trustDisclosure ? (
            <p
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                marginBottom: spacing.md,
              }}
            >
              {trustDisclosure}
            </p>
          ) : null}
          <Button variant="primary" onClick={handleSuccessDone}>
            {embed ? 'Done' : 'Return to Home'}
          </Button>
        </div>
      </div>
    );
  }

  if (!paymentLink) return null;

  const payerName = customerDisplayName(paymentLink.metadata);

  // Payment form
  return (
    <div
      style={{
        minHeight: outerMinHeight,
        backgroundColor: colors.background.secondary,
        padding: spacing.lg,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
          <h1 style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm }}>
            Secure Payment
          </h1>
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
            Complete your payment securely using the code provided
            {embed ? ' in this window.' : ''}
          </p>
        </div>

        {/* Amount Card */}
        <div
          style={{
            padding: spacing.lg,
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius.lg,
            marginBottom: spacing.lg,
            border: `2px solid ${colors.primary.main}`,
          }}
        >
          <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[2] }}>
            Amount Due
          </p>
          <p style={{ fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold, color: colors.primary.main }}>
            {formatMoney(paymentLink.amount, paymentLink.currency)}
          </p>
          {payerName ? (
            <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: spacing.sm }}>
              Paying as{' '}
              <span style={{ fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                {payerName}
              </span>
            </p>
          ) : null}
          {paymentLink.reference ? (
            <p style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary, marginTop: spacing.sm }}>
              Reference: <span style={{ fontWeight: typography.fontWeight.semibold }}>{paymentLink.reference}</span>
            </p>
          ) : null}
        </div>

        {/* Time Remaining */}
        {timeRemaining && (
          <div
            style={{
              padding: spacing.md,
              backgroundColor: colors.warning.bg,
              border: `1px solid ${colors.warning.light}`,
              borderRadius: borderRadius.base,
              marginBottom: spacing.lg,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Clock size={20} style={{ color: colors.warning.main }} />
            <p style={{ fontSize: typography.fontSize.sm, color: colors.warning.dark }}>
              Time remaining: <strong>{timeRemaining}</strong>
            </p>
          </div>
        )}

        {/* Code Verification or Payment Form */}
        <div
          style={{
            padding: spacing.lg,
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius.lg,
          }}
        >
          {!isCodeValid ? (
            <>
              {/* Code Entry */}
              <div style={{ marginBottom: spacing.lg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                  <Lock size={20} style={{ color: colors.primary.main }} />
                  <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold }}>
                    Enter Access Code
                  </h2>
                </div>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing.lg }}>
                  Please enter the code that was provided to you to unlock this payment.
                </p>

                <Input
                  label="Access Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                  error={codeError || undefined}
                  placeholder="Enter your code"
                  fullWidth
                  disabled={isVerifying}
                />
              </div>

              <Button
                variant="primary"
                onClick={handleVerifyCode}
                isLoading={isVerifying}
                disabled={!code.trim()}
                fullWidth
                size="lg"
              >
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </Button>
            </>
          ) : (
            <>
              {/* Payment Form */}
              <div style={{ marginBottom: spacing.lg }}>
                <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.md }}>
                  Complete Payment
                </h2>
              </div>

              {paymentError && (
                <div
                  style={{
                    marginBottom: spacing.lg,
                    padding: spacing.md,
                    backgroundColor: colors.error.bg,
                    border: `1px solid ${colors.error.light}`,
                    borderRadius: borderRadius.base,
                    display: 'flex',
                    gap: spacing.sm,
                    alignItems: 'flex-start',
                  }}
                >
                  <AlertCircle size={20} style={{ color: colors.error.main, flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.error.dark }}>
                    {paymentError}
                  </p>
                </div>
              )}

              <SquarePaymentForm
                onTokenize={handleTokenize}
                onError={(msg) => setPaymentError(msg)}
                isLoading={isProcessing}
                disabled={isProcessing}
              />
            </>
          )}
        </div>

        {/* Trust / security */}
        {embed && trustDisclosure ? (
          <p
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.secondary,
              textAlign: 'center',
              marginTop: spacing.md,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            {trustDisclosure}
          </p>
        ) : null}
        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            textAlign: 'center',
            marginTop: spacing.lg,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          This is a secure payment link. Your payment information is encrypted and protected.
          {timeRemaining ? ` This link expires in ${timeRemaining}.` : ''}
        </p>
      </div>
    </div>
  );
}
