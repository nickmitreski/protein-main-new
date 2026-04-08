/**
 * Product Stock Status Utility
 * Randomly assigns "sold out" (75%) or "coming soon" (25%) status to products
 */

export type ProductStatus = 'available' | 'sold-out' | 'coming-soon';

export interface ProductWithStatus {
  status: ProductStatus;
  originalStock: number;
  displayStock: number;
}

// Seeded random number generator for consistent results
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

/**
 * Determines product status based on SKU
 * 75% sold out, 25% coming soon
 */
export function getProductStatus(sku: string): ProductStatus {
  const random = seededRandom(sku);

  // 25% available (0 - 0.25)
  if (random < 0.25) {
    return 'available';
  }
  // 56.25% sold out (0.25 - 0.8125)
  else if (random < 0.8125) {
    return 'sold-out';
  }
  // 18.75% coming soon (0.8125 - 1.0)
  else {
    return 'coming-soon';
  }
}

/**
 * Gets display stock based on product status
 */
export function getDisplayStock(status: ProductStatus, originalStock: number): number {
  switch (status) {
    case 'sold-out':
      return 0;
    case 'coming-soon':
      return 0;
    case 'available':
    default:
      return originalStock;
  }
}

/**
 * Gets status label for display
 */
export function getStatusLabel(status: ProductStatus): string {
  switch (status) {
    case 'sold-out':
      return 'Sold Out';
    case 'coming-soon':
      return 'Coming Soon';
    case 'available':
    default:
      return 'In Stock';
  }
}

/**
 * Checks if product is purchasable
 */
export function isProductPurchasable(status: ProductStatus): boolean {
  return status === 'available';
}
