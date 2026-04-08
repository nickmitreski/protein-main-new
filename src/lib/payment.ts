/**
 * Payment Processing Service
 * Handles Square payment integration via Supabase Edge Functions
 */

import { supabase, isSupabaseConfigured, getBrowserSupabaseAnonKey } from './supabase';
import type { Order } from '../types';

export interface SquarePaymentRequest {
  sourceId: string;
  orderId: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  buyerEmailAddress?: string;
}

export interface SquarePaymentResponse {
  paymentId: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  status?: string;
  error?: string;
}

/**
 * Process Square payment via Supabase Edge Function
 * This ensures secure processing without exposing Square credentials
 */
export async function processSquarePayment(request: SquarePaymentRequest): Promise<PaymentResult> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

    // Get auth token (prioritize user session, fallback to anon key)
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    const anonKey = getBrowserSupabaseAnonKey();

    const response = await fetch(`${supabaseUrl}/functions/v1/square-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken || anonKey}`,
      },
      body: JSON.stringify(request),
    });

    const result = await response.json() as SquarePaymentResponse & { error?: string };

    if (!response.ok || result.error) {
      return {
        success: false,
        error: result.error ?? 'Payment failed. Please try again.',
      };
    }

    return {
      success: true,
      paymentId: result.paymentId,
      status: result.status,
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Generate idempotency key for Square payment
 * Ensures payment is not processed multiple times
 * Uses crypto.randomUUID() for cryptographically secure uniqueness
 */
export function generateIdempotencyKey(orderId: string): string {
  return `${orderId}-${crypto.randomUUID()}`;
}

/**
 * Convert order total to cents for Square API
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Update order payment status in Supabase
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentId: string,
  status: 'paid' | 'pending' | 'failed'
): Promise<Order> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: status,
      payment_reference_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

/**
 * Retry payment with exponential backoff
 */
export async function retryPayment(
  request: SquarePaymentRequest,
  maxRetries = 3,
  initialDelay = 1000
): Promise<PaymentResult> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Add delay for retries (exponential backoff)
    if (attempt > 0) {
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const result = await processSquarePayment(request);

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // Don't retry for certain errors
    if (lastError?.includes('card declined') || lastError?.includes('insufficient funds')) {
      break;
    }
  }

  return {
    success: false,
    error: lastError ?? 'Payment failed after multiple attempts',
  };
}

/**
 * Validate payment before processing
 */
export function validatePaymentRequest(request: Partial<SquarePaymentRequest>): {
  valid: boolean;
  error?: string;
} {
  if (!request.sourceId || request.sourceId.trim().length === 0) {
    return { valid: false, error: 'Invalid payment token' };
  }

  if (!request.orderId || request.orderId.trim().length === 0) {
    return { valid: false, error: 'Invalid order ID' };
  }

  if (!request.amountCents || request.amountCents <= 0) {
    return { valid: false, error: 'Invalid payment amount' };
  }

  if (!request.idempotencyKey || request.idempotencyKey.trim().length === 0) {
    return { valid: false, error: 'Invalid idempotency key' };
  }

  return { valid: true };
}

/**
 * Check if Square is configured
 */
export function isSquareConfigured(): boolean {
  const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID as string | undefined;
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID as string | undefined;
  return Boolean(appId && locationId && appId.length > 0 && locationId.length > 0);
}

/**
 * Get Square environment
 */
export function getSquareEnvironment(): 'sandbox' | 'production' {
  return (import.meta.env.VITE_SQUARE_ENVIRONMENT as string) === 'sandbox' ? 'sandbox' : 'production';
}

/**
 * Complete payment error types for better error handling
 */
export enum PaymentErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  CARD_DECLINED = 'CARD_DECLINED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_CARD = 'INVALID_CARD',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Classify payment error for better user messaging
 */
export function classifyPaymentError(errorMessage: string): PaymentErrorType {
  const lower = errorMessage.toLowerCase();

  if (lower.includes('network') || lower.includes('connection')) {
    return PaymentErrorType.NETWORK_ERROR;
  }

  if (lower.includes('declined') || lower.includes('not authorized')) {
    return PaymentErrorType.CARD_DECLINED;
  }

  if (lower.includes('insufficient') || lower.includes('not enough')) {
    return PaymentErrorType.INSUFFICIENT_FUNDS;
  }

  if (
    lower.includes('invalid card') ||
    lower.includes('card number') ||
    lower.includes('expir') ||
    lower.includes('cvv')
  ) {
    return PaymentErrorType.INVALID_CARD;
  }

  if (lower.includes('not configured') || lower.includes('credentials')) {
    return PaymentErrorType.CONFIGURATION_ERROR;
  }

  if (lower.includes('processing') || lower.includes('try again')) {
    return PaymentErrorType.PROCESSING_ERROR;
  }

  return PaymentErrorType.UNKNOWN_ERROR;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: string): string {
  const errorType = classifyPaymentError(error);

  switch (errorType) {
    case PaymentErrorType.CARD_DECLINED:
      return 'Your card was declined. Please check your card details or try a different card.';

    case PaymentErrorType.INSUFFICIENT_FUNDS:
      return 'Insufficient funds. Please use a different payment method.';

    case PaymentErrorType.INVALID_CARD:
      return 'Invalid card information. Please check your card number, expiration date, and CVV.';

    case PaymentErrorType.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';

    case PaymentErrorType.PROCESSING_ERROR:
      return 'Payment processing error. Please try again in a moment.';

    case PaymentErrorType.CONFIGURATION_ERROR:
      return 'Payment system not configured. Please contact support.';

    default:
      return 'Payment failed. Please try again or contact support if the problem persists.';
  }
}
