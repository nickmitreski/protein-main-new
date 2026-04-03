import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CreditCard, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { colors, spacing, typography, borderRadius } from '../../design-system';

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<SquarePayments>;
    };
  }
}

interface SquarePayments {
  card: () => Promise<SquareCard>;
}

interface SquareCard {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{ status: string; token?: string; errors?: Array<{ message: string }> }>;
  destroy: () => Promise<void>;
}

interface SquarePaymentFormProps {
  onTokenize: (sourceId: string) => void | Promise<void>;
  onError: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APPLICATION_ID as string | undefined;
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID as string | undefined;
const SQUARE_ENV = import.meta.env.VITE_SQUARE_ENVIRONMENT as string | undefined;

const sdkUrl =
  SQUARE_ENV === 'sandbox'
    ? 'https://sandbox.web.squarecdn.com/v1/square.js'
    : 'https://web.squarecdn.com/v1/square.js';

function loadSquareSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${sdkUrl}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Square SDK failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = sdkUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Square SDK failed to load'));
    document.head.appendChild(script);
  });
}

export function SquarePaymentForm({ onTokenize, onError, isLoading, disabled = false }: SquarePaymentFormProps) {
  const cardRef = useRef<SquareCard | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [tokenizeError, setTokenizeError] = useState<string | null>(null);
  const containerId = 'sq-card-container';

  useEffect(() => {
    if (!SQUARE_APP_ID) {
      setSdkError('Square Application ID is not configured.');
      setIsInitializing(false);
      return;
    }

    if (!SQUARE_LOCATION_ID) {
      setSdkError('Square Location ID is not configured.');
      setIsInitializing(false);
      return;
    }

    let destroyed = false;

    async function init() {
      try {
        setIsInitializing(true);
        await loadSquareSdk();

        if (destroyed) return;

        const payments = await window.Square!.payments(SQUARE_APP_ID!, SQUARE_LOCATION_ID!);
        const card = await payments.card();
        await card.attach(`#${containerId}`);

        cardRef.current = card;
        setSdkReady(true);
        setIsInitializing(false);
      } catch (err: unknown) {
        if (!destroyed) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to initialize Square payment form';
          setSdkError(errorMsg);
          setIsInitializing(false);
        }
      }
    }

    init();

    return () => {
      destroyed = true;
      cardRef.current?.destroy().catch(() => {});
      cardRef.current = null;
    };
  }, []);

  async function handleTokenize() {
    if (!cardRef.current || disabled || isLoading) return;

    setTokenizeError(null);

    try {
      const result = await cardRef.current.tokenize();

      if (result.status === 'OK' && result.token) {
        await onTokenize(result.token);
      } else {
        const msg = result.errors?.[0]?.message ?? 'Card verification failed. Please check your details.';
        setTokenizeError(msg);
        onError(msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during payment processing';
      setTokenizeError(msg);
      onError(msg);
    }
  }

  // Configuration error
  if (sdkError) {
    return (
      <div
        style={{
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
        <div>
          <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.error.dark, marginBottom: spacing[1] }}>
            Payment Configuration Error
          </p>
          <p style={{ fontSize: typography.fontSize.sm, color: colors.error.dark }}>
            {sdkError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      {/* Security badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          padding: spacing[3],
          backgroundColor: colors.neutral[50],
          borderRadius: borderRadius.sm,
        }}
      >
        <Lock size={16} style={{ color: colors.success.main }} />
        <p style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
          <strong style={{ color: colors.text.primary }}>Secure payment</strong> powered by Square
        </p>
      </div>

      {/* Card container */}
      <div
        style={{
          position: 'relative',
          minHeight: '120px',
        }}
      >
        <div
          id={containerId}
          style={{
            minHeight: '80px',
            border: `1px solid ${colors.border.main}`,
            borderRadius: borderRadius.base,
            padding: spacing[1],
            backgroundColor: colors.background.primary,
            transition: 'border-color 200ms',
          }}
        />

        {/* Loading state */}
        {isInitializing && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: borderRadius.base,
            }}
          >
            <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
              Loading payment form...
            </p>
          </div>
        )}
      </div>

      {/* Tokenize error */}
      {tokenizeError && (
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.error.bg,
            border: `1px solid ${colors.error.light}`,
            borderRadius: borderRadius.base,
            display: 'flex',
            gap: spacing[2],
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle size={16} style={{ color: colors.error.main, flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: typography.fontSize.sm, color: colors.error.dark }}>
            {tokenizeError}
          </p>
        </div>
      )}

      {/* Pay button */}
      {sdkReady && (
        <Button
          type="button"
          onClick={handleTokenize}
          disabled={disabled || isLoading || !sdkReady}
          isLoading={isLoading}
          fullWidth
          size="lg"
          variant="primary"
        >
          {isLoading ? (
            'Processing payment...'
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: spacing[2], justifyContent: 'center' }}>
              <CreditCard size={20} />
              Complete Payment
            </span>
          )}
        </Button>
      )}

      {/* Security notice */}
      <p
        style={{
          fontSize: typography.fontSize.xs,
          color: colors.text.tertiary,
          textAlign: 'center',
          lineHeight: typography.lineHeight.relaxed,
        }}
      >
        Your payment information is encrypted and secure. CoreForge does not store your card details.
      </p>
    </div>
  );
}
