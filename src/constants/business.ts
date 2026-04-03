/**
 * Replace all values with your real business details before processing live payments.
 * Details here should match your Stripe / Square account and public filings (ABN).
 */
export const BUSINESS = {
  legalName: 'CoreForge Nutrition Pty Ltd',
  tradingName: 'CoreForge',
  /** Australian Business Number (11 digits, spaced). */
  abn: '00 000 000 000',
  addressLines: ['123 Fitness Street', 'Sydney NSW 2000', 'Australia'] as const,
  email: 'support@coreforge.com',
  phoneDisplay: '+61 2 9000 0000',
  phoneTel: '+61290000000',
} as const;
